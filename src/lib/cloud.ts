import type { SupabaseClient } from '@supabase/supabase-js'
import { isGenre } from '../data/genres'
import type {
  DiaryEntry,
  EntryContent,
  EntryInput,
  EntrySource,
  GenreId,
  Profile,
  Project,
  PublicStory,
  SharePlatform,
  StoryCharacter,
  StoryComment,
  StoryPanelData,
  Visibility,
} from '../types'
import type { Lang } from './i18n'
import {
  addLocalComment,
  createLocalDiaryEntry,
  deleteLocalComment,
  deleteLocalDiaryEntry,
  findAccountById,
  findAccountByUsername,
  getActiveAccount,
  getLocalCommentCounts,
  getLocalDiaryEntry,
  getLocalLikeCounts,
  getLocalLikedSet,
  getLocalPublicStoryById,
  getLocalShareCounts,
  listLocalComments,
  listLocalDiaryEntries,
  listLocalPublicStories,
  recordLocalShare,
  setLocalEntryVisibility,
  toggleLocalLike,
  toProfileFromAccount,
  updateLocalDiaryEntry,
  updateLocalProfile,
} from './localAuth'
import { upsertProject } from './storage'
import { supabase } from './supabase'

export type CloudErrorCode =
  | 'not_configured'
  | 'forbidden'
  | 'invalid'
  | 'diary_full'
  | 'username_taken'
  | 'not_found'
  | 'unknown'

export class CloudError extends Error {
  code: CloudErrorCode
  constructor(code: CloudErrorCode) {
    super(code)
    this.code = code
  }
}

export interface Page<T> {
  items: T[]
  hasMore: boolean
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (s: string): boolean => UUID.test(s)

let sessionSyncPromise: Promise<boolean> | null = null

async function hasActiveSupabaseSession(): Promise<boolean> {
  if (!supabase) return false
  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) return true

    // If the user logged in locally before Supabase URL was configured, automatically authenticate their account with Supabase
    const localAcc = getActiveAccount()
    if (localAcc && localAcc.email && localAcc.password) {
      if (!sessionSyncPromise) {
        sessionSyncPromise = (async () => {
          try {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: localAcc.email,
              password: localAcc.password,
            })
            if (!signInErr && signInData.session?.user) return true

            const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
              email: localAcc.email,
              password: localAcc.password,
            })
            if (!signUpErr && signUpData.session?.user) return true

            const { data: retryData } = await supabase.auth.signInWithPassword({
              email: localAcc.email,
              password: localAcc.password,
            })
            return Boolean(retryData.session?.user)
          } catch {
            return false
          } finally {
            sessionSyncPromise = null
          }
        })()
      }
      return await sessionSyncPromise
    }
    return false
  } catch {
    return false
  }
}

function client(): SupabaseClient {
  if (!supabase) throw new CloudError('not_configured')
  return supabase
}

function requireOwnerId(): string {
  const acc = getActiveAccount()
  if (!acc) throw new CloudError('forbidden')
  return acc.id
}

// ---- defensive parsing: never trust the shape of rows coming back ----

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '')
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

function parseCharacters(v: unknown): StoryCharacter[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 6).map((c: unknown) => {
    const r = isRecord(c) ? c : {}
    return { name: str(r.name, 60), role: str(r.role, 80) }
  })
}

function parsePanels(v: unknown): StoryPanelData[] {
  if (!Array.isArray(v)) return []
  return v.slice(0, 8).map((p: unknown) => {
    const r = isRecord(p) ? p : {}
    return {
      scene: str(r.scene, 600),
      caption: str(r.caption, 240),
      speaker: str(r.speaker, 60),
      dialogue: str(r.dialogue, 240),
      imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : undefined,
      setting: typeof r.setting === 'string' ? (r.setting as StoryPanelData['setting']) : undefined,
      pose: typeof r.pose === 'string' ? (r.pose as StoryPanelData['pose']) : undefined,
      characterPreset:
        typeof r.characterPreset === 'string'
          ? (r.characterPreset as StoryPanelData['characterPreset'])
          : undefined,
      colors: isRecord(r.colors) ? (r.colors as StoryPanelData['colors']) : undefined,
      sfx: typeof r.sfx === 'string' ? str(r.sfx, 60) : undefined,
      bubbleStyle:
        typeof r.bubbleStyle === 'string'
          ? (r.bubbleStyle as StoryPanelData['bubbleStyle'])
          : undefined,
      bubblePosition:
        typeof r.bubblePosition === 'string'
          ? (r.bubblePosition as StoryPanelData['bubblePosition'])
          : undefined,
      tailDirection:
        typeof r.tailDirection === 'string'
          ? (r.tailDirection as StoryPanelData['tailDirection'])
          : undefined,
      fontSize:
        typeof r.fontSize === 'string' ? (r.fontSize as StoryPanelData['fontSize']) : undefined,
      captionPosition:
        typeof r.captionPosition === 'string'
          ? (r.captionPosition as StoryPanelData['captionPosition'])
          : undefined,
    }
  })
}

const parseGenre = (v: unknown): GenreId => (typeof v === 'string' && isGenre(v) ? v : 'comedy')
const parseLang = (v: unknown): Lang => (v === 'bn' ? 'bn' : 'en')
const parseSource = (v: unknown): EntrySource => (v === 'ai' || v === 'template' ? v : 'manual')
const rows = (data: unknown): unknown[] => (Array.isArray(data) ? data : [])

function toEntry(row: unknown): DiaryEntry {
  const r = isRecord(row) ? row : {}
  return {
    id: str(r.id, 64),
    title: str(r.title, 120),
    incident: str(r.incident, 1000),
    summary: str(r.summary, 400),
    punchline: str(r.punchline, 300),
    genre: parseGenre(r.genre),
    language: parseLang(r.language),
    source: parseSource(r.source),
    engine: str(r.engine, 120),
    characters: parseCharacters(r.characters),
    panels: parsePanels(r.panels),
    visibility: r.visibility === 'public' ? 'public' : 'private',
    publishedAt: typeof r.published_at === 'string' ? r.published_at : null,
    createdAt: str(r.created_at, 40),
    updatedAt: str(r.updated_at, 40),
  }
}

function toPublic(row: unknown): PublicStory {
  const r = isRecord(row) ? row : {}
  const id = str(r.id, 64)
  const localComments = getLocalCommentCounts([id])[id] ?? 0
  const localShares = getLocalShareCounts([id])[id] ?? 0
  return {
    id,
    ownerId: str(r.owner_id, 64),
    username: str(r.username, 24),
    displayName: str(r.display_name, 60),
    title: str(r.title, 120),
    summary: str(r.summary, 400),
    punchline: str(r.punchline, 300),
    genre: parseGenre(r.genre),
    language: parseLang(r.language),
    source: parseSource(r.source),
    engine: str(r.engine, 120),
    characters: parseCharacters(r.characters),
    panels: parsePanels(r.panels),
    likeCount: num(r.like_count),
    commentCount: Math.max(num(r.comment_count), localComments),
    shareCount: Math.max(num(r.share_count), localShares),
    publishedAt: str(r.published_at, 40),
  }
}

function toProfile(row: unknown): Profile {
  const r = isRecord(row) ? row : {}
  return {
    id: str(r.id, 64),
    username: str(r.username, 24),
    displayName: str(r.display_name, 60),
    bio: str(r.bio, 280),
  }
}

const ENTRY_COLS =
  'id,title,incident,summary,punchline,genre,language,source,engine,characters,panels,visibility,published_at,created_at,updated_at'
const PUBLIC_COLS =
  'id,owner_id,username,display_name,title,summary,punchline,genre,language,source,engine,characters,panels,like_count,published_at'
const PROFILE_COLS = 'id,username,display_name,bio'

function contentRow(c: EntryContent) {
  return {
    title: c.title,
    incident: c.incident,
    summary: c.summary,
    punchline: c.punchline,
    genre: c.genre,
    language: c.language,
    source: c.source,
    engine: c.engine,
    characters: c.characters,
    panels: c.panels,
  }
}

// ---- profiles ----

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('profiles')
        .select(PROFILE_COLS)
        .eq('id', userId)
        .maybeSingle()
      if (!error && data) return toProfile(data)
    } catch {
      // fallback to local account profile
    }
  }
  const acc = findAccountById(userId)
  return acc ? toProfileFromAccount(acc) : null
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const localAcc = findAccountByUsername(username)
  if (supabase) {
    try {
      const { data, error } = await client()
        .from('profiles')
        .select(PROFILE_COLS)
        .eq('username', username.toLowerCase())
        .maybeSingle()
      if (!error && data) return toProfile(data)
    } catch {
      // fallback to local
    }
  }
  return localAcc ? toProfileFromAccount(localAcc) : null
}

export async function updateMyProfile(
  userId: string,
  patch: { username: string; displayName: string; bio: string }
): Promise<Profile> {
  try {
    const localUpdated = updateLocalProfile(userId, patch)
    if (await hasActiveSupabaseSession()) {
      const { data, error } = await client()
        .from('profiles')
        .update({ username: patch.username, display_name: patch.displayName, bio: patch.bio })
        .eq('id', userId)
        .select(PROFILE_COLS)
        .maybeSingle()
      if (!error && data) return toProfile(data)
    }
    if (localUpdated) return localUpdated
    throw new CloudError('not_found')
  } catch (err) {
    if (err instanceof Error && err.message === 'username_taken') {
      throw new CloudError('username_taken')
    }
    throw err
  }
}

// ---- diary (owner only) ----

export async function listDiary(offset: number, limit: number): Promise<Page<DiaryEntry>> {
  const ownerId = requireOwnerId()
  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('stories')
        .select(ENTRY_COLS)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(offset, offset + limit)
      if (!error && data) {
        const list = rows(data).map(toEntry)
        const localPage = listLocalDiaryEntries(ownerId, 0, 200)
        const seen = new Set(list.map((i) => i.id))
        const merged = [...list, ...localPage.items.filter((i) => !seen.has(i.id))]
        return {
          items: merged.slice(0, limit),
          hasMore: merged.length > limit,
        }
      }
    } catch {
      // fallback to local
    }
  }
  return listLocalDiaryEntries(ownerId, offset, limit)
}

export async function getEntry(id: string): Promise<DiaryEntry | null> {
  const ownerId = requireOwnerId()
  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('stories')
        .select(ENTRY_COLS)
        .eq('id', id)
        .maybeSingle()
      if (!error && data) return toEntry(data)
    } catch {
      // fallback to local
    }
  }
  return getLocalDiaryEntry(ownerId, id)
}

export async function createEntry(input: EntryInput): Promise<DiaryEntry> {
  const ownerId = requireOwnerId()
  const localCreated = createLocalDiaryEntry(ownerId, input)
  invalidateStoryCache()

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('stories')
        .insert({ ...contentRow(input), visibility: input.visibility })
        .select(ENTRY_COLS)
        .single()
      if (!error && data) {
        const remoteEntry = toEntry(data)
        deleteLocalDiaryEntry(ownerId, localCreated.id)
        createLocalDiaryEntry(ownerId, input, remoteEntry.id)
        invalidateStoryCache()
        return remoteEntry
      }
    } catch {
      // keep local entry
    }
  }
  return localCreated
}

export async function updateEntry(id: string, content: EntryContent): Promise<DiaryEntry> {
  const ownerId = requireOwnerId()
  const localUpdated = updateLocalDiaryEntry(ownerId, id, content)
  invalidateStoryCache()

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('stories')
        .update(contentRow(content))
        .eq('id', id)
        .select(ENTRY_COLS)
        .maybeSingle()
      if (!error && data) {
        invalidateStoryCache()
        return toEntry(data)
      }
    } catch {
      // fallback to local
    }
  }
  if (!localUpdated) throw new CloudError('not_found')
  return localUpdated
}

export async function setEntryVisibility(id: string, visibility: Visibility): Promise<DiaryEntry> {
  const ownerId = requireOwnerId()
  const localUpdated = setLocalEntryVisibility(ownerId, id, visibility)
  invalidateStoryCache()

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client()
        .from('stories')
        .update({ visibility })
        .eq('id', id)
        .select(ENTRY_COLS)
        .maybeSingle()
      if (!error && data) {
        invalidateStoryCache()
        return toEntry(data)
      }
    } catch {
      // fallback to local
    }
  }
  if (!localUpdated) throw new CloudError('not_found')
  return localUpdated
}

export async function deleteEntry(id: string): Promise<void> {
  const ownerId = requireOwnerId()
  const deletedLocal = deleteLocalDiaryEntry(ownerId, id)
  invalidateStoryCache()

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client().from('stories').delete().eq('id', id).select('id')
      if (!error && rows(data).length > 0) return
    } catch {
      // fallback to local
    }
  }
  if (!deletedLocal) throw new CloudError('not_found')
}

/** Copies an entry as a new PRIVATE entry. */
export function duplicateEntry(e: DiaryEntry, suffix: string): Promise<DiaryEntry> {
  const title = `${e.title} ${suffix}`.slice(0, 120)
  return createEntry({
    title,
    incident: e.incident,
    summary: e.summary,
    punchline: e.punchline,
    genre: e.genre,
    language: e.language,
    source: e.source,
    engine: e.engine,
    characters: e.characters,
    panels: e.panels,
    visibility: 'private',
  })
}

/** Saves someone else's public story into my diary as a private copy. */
export function copyPublicToDiary(s: PublicStory, note: string): Promise<DiaryEntry> {
  return createEntry({
    title: s.title,
    incident: note.slice(0, 1000),
    summary: s.summary,
    punchline: s.punchline,
    genre: s.genre,
    language: s.language,
    source: s.source,
    engine: s.engine,
    characters: s.characters,
    panels: s.panels,
    visibility: 'private',
  })
}

function buildValidDbPanels(panels: StoryPanelData[]): StoryPanelData[] {
  const base = panels.slice(0, 8).map((p, idx) => ({
    scene: (p.scene?.trim() || p.caption?.trim() || p.dialogue?.trim() || `দৃশ্য ${idx + 1}`).slice(0, 600),
    caption: (p.caption?.trim() || '').slice(0, 240),
    speaker: (p.speaker?.trim() || 'রাফি').slice(0, 60),
    dialogue: (p.dialogue?.trim() || '...').slice(0, 240),
    imageUrl: p.imageUrl,
    setting: p.setting,
    pose: p.pose,
    characterPreset: p.characterPreset,
    colors: p.colors,
    sfx: p.sfx,
    bubbleStyle: p.bubbleStyle,
    bubblePosition: p.bubblePosition,
    tailDirection: p.tailDirection,
    fontSize: p.fontSize,
    captionPosition: p.captionPosition,
  }))
  const padded = [...base]
  while (padded.length > 0 && padded.length < 4) {
    padded.push({ ...padded[padded.length - 1] })
  }
  return padded
}

function buildValidDbCharacters(characters: StoryCharacter[], firstPanel?: StoryPanelData): StoryCharacter[] {
  const raw =
    characters && characters.length > 0
      ? characters
      : [{ name: firstPanel?.speaker?.trim() || firstPanel?.characterPreset || 'রাফি', role: 'প্রধান চরিত্র' }]
  return raw.slice(0, 6).map((c) => ({
    name: (c.name?.trim() || 'রাফি').slice(0, 60),
    role: (c.role?.trim() || 'চরিত্র').slice(0, 80),
  }))
}

/**
 * Publishes a studio comic Project directly to the user's account and public gallery.
 */
export async function publishProject(project: Project): Promise<DiaryEntry> {
  const ownerId = requireOwnerId()
  const panels: StoryPanelData[] = project.panels.map((p, idx) => ({
    scene: (p.scene?.trim() || p.caption?.trim() || p.dialogue?.trim() || `Scene ${idx + 1}`).slice(0, 600),
    caption: (p.caption?.trim() || '').slice(0, 240),
    speaker: (p.speaker?.trim() || (p.dialogue?.trim() ? 'রাফি' : 'কথক')).slice(0, 60),
    dialogue: (p.dialogue?.trim() || '...').slice(0, 240),
    imageUrl: p.imageUrl,
    setting: p.setting,
    pose: p.pose,
    characterPreset: p.characterPreset,
    colors: p.colors,
    sfx: p.sfx,
    bubbleStyle: p.bubbleStyle,
    bubblePosition: p.bubblePosition,
    tailDirection: p.tailDirection,
    fontSize: p.fontSize,
    captionPosition: p.captionPosition,
  }))

  const characters = buildValidDbCharacters(project.story?.characters || [], panels[0])

  const summary = (
    project.summary?.trim() ||
    project.story?.summary ||
    project.panels.map((p) => p.caption || p.dialogue || p.scene).filter(Boolean).join(' — ') ||
    project.title ||
    'কমিক গল্প'
  ).slice(0, 400)
  const punchline = (
    project.punchline?.trim() ||
    project.story?.punchline ||
    project.panels[project.panels.length - 1]?.dialogue ||
    project.panels[project.panels.length - 1]?.caption ||
    'সমাপ্ত!'
  ).slice(0, 300)

  const content: EntryContent = {
    title: (project.title?.trim() || 'শিরোনামহীন কমিক').slice(0, 120),
    incident: (
      project.summary?.trim() ||
      project.story?.summary ||
      project.title ||
      'স্টুডিও কমিক গল্প'
    ).slice(0, 1000),
    summary: summary.length > 0 ? summary : 'গল্পফ্রেম স্টুডিওতে তৈরি কমিক গল্প',
    punchline: punchline.length > 0 ? punchline : 'সমাপ্ত!',
    genre: project.genre || 'action',
    language: project.story?.language || 'bn',
    source: project.story?.source || 'manual',
    engine: (project.story?.engine || 'GolpoFrame Studio').slice(0, 120),
    characters,
    panels: panels.slice(0, 8),
  }

  const customUuid = project.id && isUuid(project.id) ? project.id : undefined
  let localPublished = createLocalDiaryEntry(
    ownerId,
    {
      ...content,
      visibility: 'public',
    },
    customUuid
  )
  invalidateStoryCache()

  if (await hasActiveSupabaseSession()) {
    try {
      const paddedDbPanels = buildValidDbPanels(panels)

      if (paddedDbPanels.length >= 4) {
        const dbPayload = {
          ...contentRow({ ...content, characters, panels: paddedDbPanels }),
          visibility: 'public' as const,
        }
        let savedRow: unknown = null
        if (customUuid) {
          const { data: updatedData } = await client()
            .from('stories')
            .update(dbPayload)
            .eq('id', customUuid)
            .select(ENTRY_COLS)
            .maybeSingle()
          if (updatedData) savedRow = updatedData
        }
        if (!savedRow) {
          const { data: insertedData } = await client()
            .from('stories')
            .insert(dbPayload)
            .select(ENTRY_COLS)
            .single()
          if (insertedData) savedRow = insertedData
        }
        if (savedRow && isRecord(savedRow) && typeof savedRow.id === 'string') {
          const remoteId = savedRow.id
          if (remoteId !== localPublished.id) {
            deleteLocalDiaryEntry(ownerId, localPublished.id)
            localPublished = createLocalDiaryEntry(
              ownerId,
              {
                ...content,
                visibility: 'public',
              },
              remoteId
            )
          }
          invalidateStoryCache()
        }
      }
    } catch {
      // localPublished is already saved
    }
  }

  // Keep studio project in sync with the published UUID and isPublic = true
  upsertProject({
    ...project,
    id: localPublished.id,
    userId: ownerId,
    isPublic: true,
    updatedAt: Date.now(),
  })

  return localPublished
}

// ---- In-memory Stale-While-Revalidate Cache for Instant Page Loads ----
const publicCache = new Map<string, Page<PublicStory>>()
const storyDetailCache = new Map<string, PublicStory>()

function publicCacheKey(opts: {
  offset: number
  limit: number
  genre?: GenreId
  username?: string
}): string {
  return `${opts.offset}:${opts.limit}:${opts.genre ?? 'all'}:${opts.username ?? 'all'}`
}

export function invalidateStoryCache(): void {
  publicCache.clear()
  storyDetailCache.clear()
}

export function getInitialPublicStories(opts: {
  offset: number
  limit: number
  genre?: GenreId
  username?: string
}): Page<PublicStory> {
  const cached = publicCache.get(publicCacheKey(opts))
  if (cached && cached.items.length > 0) return cached
  return listLocalPublicStories(opts)
}

export function getInitialPublicStoryById(id?: string): PublicStory | null {
  if (!id) return null
  const cached = storyDetailCache.get(id)
  if (cached) return cached
  return getLocalPublicStoryById(id)
}

// ---- Automatic background sync of any local public stories not yet in Supabase ----
let syncingPublicStories = false

async function syncUnsavedLocalPublicStoriesToSupabase(
  remoteItems: PublicStory[],
  localItems: PublicStory[]
): Promise<PublicStory[]> {
  if (syncingPublicStories || !supabase || localItems.length === 0) return []
  const remoteIds = new Set(remoteItems.map((r) => r.id))
  const remoteTitles = new Set(remoteItems.map((r) => r.title.trim().toLowerCase()))

  const unsynced = localItems.filter(
    (loc) => !remoteIds.has(loc.id) && !remoteTitles.has(loc.title.trim().toLowerCase())
  )
  if (unsynced.length === 0) return []

  syncingPublicStories = true
  const newlySynced: PublicStory[] = []
  try {
    if (!(await hasActiveSupabaseSession())) return []
    const ownerAcc = getActiveAccount()

    for (const loc of unsynced) {
      const paddedPanels = buildValidDbPanels(loc.panels)
      if (paddedPanels.length < 4) continue
      const validChars = buildValidDbCharacters(loc.characters, loc.panels[0])
      const summary = (loc.summary?.trim() || loc.title || 'কমিক গল্প').slice(0, 400)
      const punchline = (loc.punchline?.trim() || 'সমাপ্ত!').slice(0, 300)

      const dbPayload = {
        title: (loc.title?.trim() || 'শিরোনামহীন কমিক').slice(0, 120),
        incident: summary,
        summary,
        punchline,
        genre: loc.genre || 'action',
        language: loc.language || 'bn',
        source: loc.source || 'manual',
        engine: (loc.engine || 'GolpoFrame Studio').slice(0, 120),
        characters: validChars,
        panels: paddedPanels,
        visibility: 'public' as const,
      }

      const { data: inserted, error } = await client()
        .from('stories')
        .insert(dbPayload)
        .select(ENTRY_COLS)
        .single()

      if (!error && inserted && isRecord(inserted) && typeof inserted.id === 'string') {
        const remoteId = inserted.id
        if (ownerAcc) {
          deleteLocalDiaryEntry(ownerAcc.id, loc.id)
          createLocalDiaryEntry(
            ownerAcc.id,
            {
              ...dbPayload,
              panels: loc.panels,
              visibility: 'public',
            },
            remoteId
          )
        }
        newlySynced.push({
          ...loc,
          id: remoteId,
        })
      }
    }
    if (newlySynced.length > 0) {
      invalidateStoryCache()
    }
  } catch {
    // ignore background sync errors
  } finally {
    syncingPublicStories = false
  }
  return newlySynced
}

// ---- public gallery ----

export async function listPublic(opts: {
  offset: number
  limit: number
  genre?: GenreId
  username?: string
}): Promise<Page<PublicStory>> {
  const localPage = listLocalPublicStories(opts)
  const localMap = new Map(localPage.items.map((i) => [i.id, i]))
  const cacheKey = publicCacheKey(opts)

  if (supabase) {
    try {
      let q = client().from('public_stories').select(PUBLIC_COLS)
      if (opts.genre) q = q.eq('genre', opts.genre)
      if (opts.username) q = q.eq('username', opts.username)
      const { data, error } = await q
        .order('published_at', { ascending: false })
        .order('id', { ascending: false })
        .range(opts.offset, opts.offset + opts.limit)
      if (!error && data) {
        const remoteItems = rows(data).map((row) => {
          const pub = toPublic(row)
          const localMatch = localMap.get(pub.id)
          if (localMatch) {
            return {
              ...pub,
              panels: localMatch.panels,
              commentCount: Math.max(pub.commentCount ?? 0, localMatch.commentCount ?? 0),
              shareCount: Math.max(pub.shareCount ?? 0, localMatch.shareCount ?? 0),
            }
          }
          return pub
        })

        // Trigger background sync non-blocking so page load is never delayed
        if (opts.offset === 0 && !opts.genre && !opts.username) {
          void syncUnsavedLocalPublicStoriesToSupabase(remoteItems, localPage.items)
        }

        const seen = new Set(remoteItems.map((i) => i.id))
        const seenTitles = new Set(remoteItems.map((i) => i.title.trim().toLowerCase()))
        const merged = [
          ...remoteItems,
          ...localPage.items.filter(
            (i) => !seen.has(i.id) && !seenTitles.has(i.title.trim().toLowerCase())
          ),
        ]
        const resultPage: Page<PublicStory> = {
          items: merged.slice(0, opts.limit),
          hasMore: merged.length > opts.limit || localPage.hasMore,
        }
        publicCache.set(cacheKey, resultPage)
        for (const item of resultPage.items) {
          storyDetailCache.set(item.id, item)
        }
        return resultPage
      }
    } catch {
      // fallback to local public stories
    }
  }

  publicCache.set(cacheKey, localPage)
  for (const item of localPage.items) {
    storyDetailCache.set(item.id, item)
  }
  return localPage
}

export async function getPublicStory(id: string): Promise<PublicStory | null> {
  const localMatch = getLocalPublicStoryById(id)
  if (supabase) {
    try {
      const { data, error } = await client()
        .from('public_stories')
        .select(PUBLIC_COLS)
        .eq('id', id)
        .maybeSingle()
      if (!error && data) {
        const pub = toPublic(data)
        const finalStory = localMatch
          ? {
              ...pub,
              panels: localMatch.panels,
            }
          : pub
        storyDetailCache.set(id, finalStory)
        return finalStory
      }
    } catch {
      // fallback to local
    }
  }
  if (localMatch) storyDetailCache.set(id, localMatch)
  return localMatch
}

// ---- likes ----

export async function fetchLikedSet(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set()
  const acc = getActiveAccount()
  const localSet = acc ? getLocalLikedSet(acc.id, ids) : new Set<string>()

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client().from('likes').select('story_id').in('story_id', ids)
      if (!error && data) {
        for (const r of rows(data)) {
          if (isRecord(r) && typeof r.story_id === 'string') localSet.add(r.story_id)
        }
      }
    } catch {
      // use localSet
    }
  }
  return localSet
}

export async function setLike(storyId: string, liked: boolean): Promise<number> {
  const ownerId = requireOwnerId()
  const localCount = toggleLocalLike(ownerId, storyId, liked)

  if (await hasActiveSupabaseSession()) {
    try {
      const { data, error } = await client().rpc('set_like', {
        p_story_id: storyId,
        p_liked: liked,
      })
      if (!error && typeof data === 'number') return data
    } catch {
      // return localCount
    }
  }
  return localCount
}

export async function fetchPublicLikeCounts(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {}
  const out = getLocalLikeCounts(ids)

  if (supabase) {
    try {
      const { data, error } = await client()
        .from('public_stories')
        .select('id,like_count')
        .in('id', ids)
      if (!error && data) {
        for (const r of rows(data)) {
          if (isRecord(r) && typeof r.id === 'string') out[r.id] = num(r.like_count)
        }
      }
    } catch {
      // use local counts
    }
  }
  return out
}

// ---- comments (comment / comments table) ----

export async function listComments(storyId: string): Promise<StoryComment[]> {
  const localList = listLocalComments(storyId)

  if (supabase && isUuid(storyId)) {
    try {
      const { data, error } = await client()
        .from('comments')
        .select('id,story_id,user_id,content,created_at')
        .eq('story_id', storyId)
        .order('created_at', { ascending: true })

      if (!error && Array.isArray(data)) {
        const userIds = Array.from(
          new Set(
            data
              .map((r: Record<string, unknown>) => (typeof r.user_id === 'string' ? r.user_id : ''))
              .filter(Boolean)
          )
        )
        const profileMap = new Map<string, { username: string; displayName: string }>()
        if (userIds.length > 0) {
          const { data: profData } = await client()
            .from('profiles')
            .select('id,username,display_name')
            .in('id', userIds)
          if (Array.isArray(profData)) {
            for (const p of profData) {
              if (isRecord(p) && typeof p.id === 'string') {
                profileMap.set(p.id, {
                  username: str(p.username, 24),
                  displayName: str(p.display_name, 60),
                })
              }
            }
          }
        }

        const remoteComments: StoryComment[] = data.map((row: Record<string, unknown>) => {
          const userId = str(row.user_id, 64)
          const prof = profileMap.get(userId)
          const localAcc = findAccountById(userId)
          return {
            id: str(row.id, 64),
            storyId: str(row.story_id, 64),
            userId,
            username: prof?.username || localAcc?.username || 'user',
            displayName: prof?.displayName || localAcc?.displayName || 'User',
            content: str(row.content, 500),
            createdAt: str(row.created_at, 40) || new Date().toISOString(),
          }
        })
        const seen = new Set(remoteComments.map((c) => c.id))
        return [...remoteComments, ...localList.filter((c) => !seen.has(c.id))].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt)
        )
      }
    } catch {
      // fallback to localList
    }
  }

  return localList
}

export async function addComment(storyId: string, content: string): Promise<StoryComment> {
  const ownerId = requireOwnerId()
  const clean = content.trim().slice(0, 500)
  if (!clean) throw new CloudError('invalid')

  const localCreated = addLocalComment(ownerId, storyId, clean)

  if (supabase && isUuid(storyId)) {
    try {
      // 1. Try inserting via RPC add_comment if present, or standard table insert (without id column so grant insert(story_id, content) succeeds!)
      const { data, error } = await client()
        .from('comments')
        .insert({
          story_id: storyId,
          content: clean,
        })
        .select('id,story_id,user_id,content,created_at')
        .maybeSingle()

      if (!error && data && isRecord(data)) {
        const remoteId = str(data.id, 64) || localCreated.id
        if (remoteId !== localCreated.id) {
          deleteLocalComment(ownerId, localCreated.id)
        }
        return {
          ...localCreated,
          id: remoteId,
          createdAt: str(data.created_at, 40) || localCreated.createdAt,
        }
      }
    } catch {
      // localCreated is already persisted
    }
  }

  return localCreated
}

export async function deleteComment(commentId: string): Promise<void> {
  const ownerId = requireOwnerId()
  deleteLocalComment(ownerId, commentId)

  if (await hasActiveSupabaseSession()) {
    try {
      await client().from('comments').delete().eq('id', commentId)
    } catch {
      // local delete already succeeded
    }
  }
}

// ---- shares (share / shares table) ----

export async function recordShare(
  storyId: string,
  platform: SharePlatform = 'copy_link'
): Promise<number> {
  const acc = getActiveAccount()
  const { count: localCount } = recordLocalShare(storyId, platform, acc?.id)

  if (supabase && isUuid(storyId)) {
    try {
      const { data, error } = await client().rpc('record_share', {
        p_story_id: storyId,
        p_platform: platform,
      })
      if (!error && typeof data === 'number') {
        return Math.max(data, localCount)
      }
      await client().from('shares').insert({
        story_id: storyId,
        platform,
      })
    } catch {
      // fallback to localCount
    }
  }

  return localCount
}

