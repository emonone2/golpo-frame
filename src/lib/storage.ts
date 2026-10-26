import type { DemoStory, GeneratedStory, Project } from '../types'
import type { Lang } from './i18n'
import { detectPose, detectSetting } from './image/imageAdapter'
import { diaryEntryToProject, getActiveAccount, loadAllLocalEntries } from './localAuth'

const KEY = 'golpoframe.projects.v1'

export const uid = () => Math.random().toString(36).slice(2, 10)

function readRawProjects(): Project[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('Invalid saved data')
  return data as Project[]
}

export function loadProjects(): Project[] {
  const rawProjects = readRawProjects()
  const activeAcc = getActiveAccount()

  // Also include any diary/generator stories belonging to local entries so Studio & Dashboard can open them
  const localEntries = loadAllLocalEntries()
  const existingIds = new Set(rawProjects.map((p) => p.id))
  const fromEntries: Project[] = localEntries
    .filter((e) => e.panels.length > 0 && !existingIds.has(e.id))
    .map(diaryEntryToProject)

  const combined = [...rawProjects, ...fromEntries]

  if (activeAcc) {
    return combined.filter((p) => p.userId === activeAcc.id)
  }
  return combined.filter((p) => !p.userId)
}

export function loadAllStoredProjects(): Project[] {
  const rawProjects = readRawProjects()
  const localEntries = loadAllLocalEntries()
  const existingIds = new Set(rawProjects.map((p) => p.id))
  const fromEntries: Project[] = localEntries
    .filter((e) => e.panels.length > 0 && !existingIds.has(e.id))
    .map(diaryEntryToProject)
  return [...rawProjects, ...fromEntries]
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(projects))
}

export function upsertProject(project: Project) {
  const activeAcc = getActiveAccount()
  const stamped: Project = {
    ...project,
    userId: project.userId ?? activeAcc?.id,
  }
  const rest = readRawProjects().filter((p) => p.id !== stamped.id)
  saveProjects([stamped, ...rest])
}

export function deleteProject(id: string) {
  saveProjects(readRawProjects().filter((p) => p.id !== id))
}

export function clearProjects() {
  const activeAcc = getActiveAccount()
  if (activeAcc) {
    const remaining = readRawProjects().filter((p) => p.userId !== activeAcc.id)
    saveProjects(remaining)
  } else {
    const remaining = readRawProjects().filter((p) => Boolean(p.userId))
    saveProjects(remaining)
  }
}

export function projectFromStory(story: DemoStory, lang: Lang): Project {
  const activeAcc = getActiveAccount()
  return {
    id: uid(),
    userId: activeAcc?.id,
    title: story.title[lang],
    genre: story.genre,
    updatedAt: Date.now(),
    panels: story.panels.map((p) => ({
      id: uid(),
      scene: '',
      caption: p.caption[lang],
      dialogue: p.dialogue[lang],
      speaker: p.speaker ? p.speaker[lang] : undefined,
      setting: p.setting || detectSetting('', p.dialogue[lang]),
      pose: p.pose || detectPose('', p.dialogue[lang]),
      sfx: p.sfx ? p.sfx[lang] : undefined,
      bubbleStyle: p.bubbleStyle,
      bubblePosition: p.bubblePosition,
      tailDirection: p.tailDirection,
      captionPosition: p.captionPosition,
    })),
  }
}

/** Converts a reviewed, validated generated story into a studio project. */
export function projectFromGenerated(story: GeneratedStory): Project {
  const { data, options } = story
  const activeAcc = getActiveAccount()
  return {
    id: uid(),
    userId: activeAcc?.id,
    title: data.title,
    genre: options.genre,
    updatedAt: Date.now(),
    panels: data.panels.map((p) => ({
      id: uid(),
      scene: p.scene,
      caption: p.caption,
      speaker: p.speaker,
      dialogue: p.speaker ? `${p.speaker}: ${p.dialogue}` : p.dialogue,
      setting: p.setting || detectSetting(p.scene, p.dialogue),
      pose: p.pose || detectPose(p.scene, p.dialogue),
      sfx: p.sfx,
    })),
    story: {
      source: story.source,
      engine: story.engine,
      language: options.language,
      summary: data.summary,
      punchline: data.punchline,
      characters: data.characters,
    },
  }
}
