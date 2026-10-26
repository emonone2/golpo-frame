import type { GenreId, Project, StoryCharacter, StoryPanelData } from '../../types'
import { detectPose, detectSetting } from '../image/imageAdapter'
import {
  createLocalDiaryEntry,
  deleteLocalDiaryEntry,
  getActiveAccount,
} from '../localAuth'
import {
  deleteProject as localDeleteProject,
  loadAllStoredProjects,
  loadProjects,
  upsertProject as localUpsertProject,
} from '../storage'
import { isSupabaseConfigured, supabase } from './client'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isUuid(str: string): boolean {
  return UUID_REGEX.test(str)
}

export function toValidUuid(id?: string): string {
  if (id && isUuid(id)) return id
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface DbUnifiedStoryRow {
  id: string
  owner_id?: string
  user_id?: string
  title: string
  summary?: string | null
  punchline?: string | null
  genre: string
  visibility?: string
  is_public?: boolean
  language?: string
  source?: string
  engine?: string
  characters?: StoryCharacter[] | null
  panels?: StoryPanelData[] | null
  updated_at: string
}

function mapUnifiedRowToProject(row: DbUnifiedStoryRow): Project {
  const rawPanels = Array.isArray(row.panels) ? row.panels : []
  const rawChars = Array.isArray(row.characters) ? row.characters : []
  const isPub = row.visibility ? row.visibility === 'public' : Boolean(row.is_public)

  return {
    id: row.id,
    userId: row.owner_id || row.user_id,
    isPublic: isPub,
    title: row.title || 'Untitled comic',
    summary: row.summary ?? undefined,
    punchline: row.punchline ?? undefined,
    genre: (row.genre as GenreId) || 'action',
    updatedAt: new Date(row.updated_at).getTime() || Date.now(),
    story: {
      source: row.source === 'ai' ? 'ai' : 'template',
      engine: row.engine || 'GolpoFrame Cloud',
      language: row.language === 'bn' ? 'bn' : 'en',
      summary: row.summary ?? '',
      punchline: row.punchline ?? '',
      characters: rawChars,
    },
    panels: rawPanels.map((p, idx) => ({
      id: `${row.id}-p-${idx}`,
      scene: p.scene ?? '',
      caption: p.caption ?? '',
      dialogue: p.dialogue ?? '',
      speaker: p.speaker ?? undefined,
      setting: p.setting ?? detectSetting(p.scene ?? '', p.dialogue ?? ''),
      pose: p.pose ?? detectPose(p.scene ?? '', p.dialogue ?? ''),
      characterPreset: p.characterPreset,
      colors: p.colors,
      sfx: p.sfx ?? undefined,
      imageUrl: p.imageUrl,
      bubbleStyle: p.bubbleStyle ?? 'speech',
      bubblePosition: p.bubblePosition ?? 'top-left',
      tailDirection: p.tailDirection ?? 'bottom-right',
      fontSize: p.fontSize ?? 'base',
      captionPosition: p.captionPosition ?? 'bottom',
    })),
  }
}

/**
 * Fetch all stories belonging to the authenticated user.
 * Always scopes to the currently signed-in account.
 */
export async function fetchUserStories(): Promise<Project[]> {
  const localUserProjects = loadProjects()

  if (!isSupabaseConfigured() || !supabase) {
    return localUserProjects
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData?.session?.user
    if (!user) {
      return localUserProjects
    }

    const { data: storiesData, error: storiesErr } = await supabase
      .from('stories')
      .select('*')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false })

    if (storiesErr || !storiesData || storiesData.length === 0) {
      return localUserProjects
    }

    const remoteProjects = (storiesData as DbUnifiedStoryRow[]).map(mapUnifiedRowToProject)
    const seen = new Set(remoteProjects.map((p) => p.id))
    return [...remoteProjects, ...localUserProjects.filter((p) => !seen.has(p.id))]
  } catch {
    return localUserProjects
  }
}

/**
 * Fetch public stories readable by any user
 */
export async function fetchPublicStories(): Promise<Project[]> {
  const localPublic = loadAllStoredProjects().filter((p) => p.isPublic)

  if (!isSupabaseConfigured() || !supabase) {
    return localPublic
  }

  try {
    const { data: storiesData, error } = await supabase
      .from('public_stories')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(12)

    if (error || !storiesData || storiesData.length === 0) {
      return localPublic
    }

    const remotePublic = (storiesData as DbUnifiedStoryRow[]).map((r) =>
      mapUnifiedRowToProject({ ...r, visibility: 'public', updated_at: (r as any).published_at || new Date().toISOString() })
    )
    const seen = new Set(remotePublic.map((p) => p.id))
    return [...remotePublic, ...localPublic.filter((p) => !seen.has(p.id))]
  } catch {
    return localPublic
  }
}

/**
 * Save project to the current user's account and sync with Supabase when active.
 */
export async function saveStoryToSupabase(
  project: Project,
  options: { isPublic?: boolean } = {}
): Promise<Project> {
  const storyId = toValidUuid(project.id)
  const isPublic = options.isPublic ?? project.isPublic ?? false
  const activeAcc = getActiveAccount()

  const updatedProject: Project = {
    ...project,
    id: storyId,
    userId: project.userId ?? activeAcc?.id,
    isPublic,
    updatedAt: Date.now(),
  }

  // Always keep account-scoped local storage in sync (including full imageUrl data URLs)
  localUpsertProject(updatedProject)

  // If the user is logged in and has >= 1 panel, also sync with their local diary entries
  if (activeAcc && updatedProject.panels.length >= 1) {
    const characters: StoryCharacter[] =
      updatedProject.story?.characters && updatedProject.story.characters.length > 0
        ? updatedProject.story.characters
        : [{ name: updatedProject.panels[0]?.characterPreset || 'Rafi', role: 'Protagonist' }]

    const panels: StoryPanelData[] = updatedProject.panels.slice(0, 8).map((p, idx) => ({
      scene: (p.scene?.trim() || p.caption?.trim() || `Scene ${idx + 1}`).slice(0, 600),
      caption: (p.caption?.trim() || '').slice(0, 240),
      speaker: (p.speaker?.trim() || 'Rafi').slice(0, 60),
      dialogue: (p.dialogue?.trim() || '...').slice(0, 240),
      setting: p.setting,
      pose: p.pose,
      characterPreset: p.characterPreset,
      colors: p.colors,
      sfx: p.sfx,
      imageUrl: p.imageUrl,
      bubbleStyle: p.bubbleStyle,
      bubblePosition: p.bubblePosition,
      tailDirection: p.tailDirection,
      fontSize: p.fontSize,
      captionPosition: p.captionPosition,
    }))

    createLocalDiaryEntry(
      activeAcc.id,
      {
        title: (updatedProject.title.trim() || 'Untitled comic').slice(0, 120),
        incident: (updatedProject.summary || updatedProject.title || 'Studio comic').slice(0, 1000),
        summary: (updatedProject.summary || updatedProject.story?.summary || updatedProject.title || 'Studio comic').slice(0, 400),
        punchline: (updatedProject.punchline || updatedProject.story?.punchline || 'The End').slice(0, 300),
        genre: updatedProject.genre,
        language: updatedProject.story?.language || 'bn',
        source: updatedProject.story?.source || 'manual',
        engine: updatedProject.story?.engine || 'GolpoFrame Studio',
        characters: characters.slice(0, 6),
        panels,
        visibility: isPublic ? 'public' : 'private',
      },
      storyId
    )
  }

  if (!isSupabaseConfigured() || !supabase) {
    return updatedProject
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData?.session?.user
    if (!user) {
      return updatedProject
    }

    const characters: StoryCharacter[] = (
      project.story?.characters && project.story.characters.length > 0
        ? project.story.characters
        : [{ name: project.panels[0]?.speaker || project.panels[0]?.characterPreset || 'রাফি', role: 'প্রধান চরিত্র' }]
    )
      .slice(0, 6)
      .map((c) => ({
        name: (c.name?.trim() || 'রাফি').slice(0, 60),
        role: (c.role?.trim() || 'চরিত্র').slice(0, 80),
      }))

    const basePanels: StoryPanelData[] = project.panels.slice(0, 8).map((p, idx) => ({
      scene: (p.scene?.trim() || p.caption?.trim() || p.dialogue?.trim() || `Scene ${idx + 1}`).slice(0, 600),
      caption: (p.caption?.trim() || '').slice(0, 240),
      speaker: (p.speaker?.trim() || 'রাফি').slice(0, 60),
      dialogue: (p.dialogue?.trim() || '...').slice(0, 240),
      setting: p.setting,
      pose: p.pose,
      characterPreset: p.characterPreset,
      colors: p.colors,
      sfx: p.sfx,
      imageUrl: p.imageUrl,
      bubbleStyle: p.bubbleStyle,
      bubblePosition: p.bubblePosition,
      tailDirection: p.tailDirection,
      fontSize: p.fontSize,
      captionPosition: p.captionPosition,
    }))

    const dbPanels = [...basePanels]
    while (dbPanels.length > 0 && dbPanels.length < 4) {
      dbPanels.push({ ...dbPanels[dbPanels.length - 1] })
    }

    if (dbPanels.length >= 4) {
      const summary = (
        project.summary?.trim() ||
        project.story?.summary ||
        project.title ||
        'স্টুডিও কমিক গল্প'
      ).slice(0, 400)
      const punchline = (
        project.punchline?.trim() ||
        project.story?.punchline ||
        'সমাপ্ত!'
      ).slice(0, 300)

      const dbPayload = {
        title: (project.title.trim() || 'Untitled comic').slice(0, 120),
        incident: (project.summary || project.title || 'Studio comic').slice(0, 1000),
        summary: summary.length > 0 ? summary : 'স্টুডিও কমিক গল্প',
        punchline: punchline.length > 0 ? punchline : 'সমাপ্ত!',
        genre: project.genre || 'action',
        language: project.story?.language || 'bn',
        source: project.story?.source || 'manual',
        engine: (project.story?.engine || 'GolpoFrame Studio').slice(0, 120),
        characters,
        panels: dbPanels,
        visibility: isPublic ? 'public' : 'private',
      }

      const { data: updatedRow } = await supabase
        .from('stories')
        .update(dbPayload)
        .eq('id', storyId)
        .select('id')
        .maybeSingle()

      if (!updatedRow) {
        const { data: insertedRow } = await supabase
          .from('stories')
          .insert(dbPayload)
          .select('id')
          .single()
        if (insertedRow && typeof (insertedRow as { id?: string }).id === 'string') {
          const newId = (insertedRow as { id: string }).id
          return { ...updatedProject, id: newId, userId: user.id }
        }
      }
    }

    return { ...updatedProject, userId: user.id }
  } catch {
    return updatedProject
  }
}

/**
 * Delete a story from local storage, local diary entries, and Supabase
 */
export async function deleteStoryFromSupabase(id: string): Promise<void> {
  localDeleteProject(id)
  const activeAcc = getActiveAccount()
  if (activeAcc) {
    deleteLocalDiaryEntry(activeAcc.id, id)
  }

  if (!isSupabaseConfigured() || !supabase) {
    return
  }

  try {
    await supabase.from('stories').delete().eq('id', id)
  } catch {
    // ignore remote delete error if offline
  }
}
