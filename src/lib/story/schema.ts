import type { StoryCharacter, StoryData, StoryPanelData } from '../../types'

export const MIN_PANELS = 4
export const MAX_PANELS = 8
export const MAX_INCIDENT = 1000

export const LIMITS = {
  title: 120,
  summary: 400,
  punchline: 300,
  name: 60,
  role: 80,
  scene: 600,
  caption: 240,
  dialogue: 240,
} as const

export type IssueCode = 'type' | 'empty' | 'too_long' | 'count' | 'speaker' | 'duplicate'
export interface Issue {
  path: string
  code: IssueCode
}
export type Validation = { ok: true; data: StoryData } | { ok: false; issues: Issue[] }

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function text(v: unknown, max: number, path: string, issues: Issue[], required = true): string {
  if (typeof v !== 'string') {
    issues.push({ path, code: 'type' })
    return ''
  }
  const s = v.trim()
  if (required && s === '') issues.push({ path, code: 'empty' })
  else if (s.length > max) issues.push({ path, code: 'too_long' })
  return s
}

/**
 * Validates unknown data (AI output, template output or user edits) and returns
 * a trimmed, correctly typed StoryData. Pass expectedPanels to require an exact count.
 */
export function validateStory(input: unknown, expectedPanels?: number): Validation {
  const issues: Issue[] = []
  if (!isRecord(input)) return { ok: false, issues: [{ path: '', code: 'type' }] }

  const title = text(input.title, LIMITS.title, 'title', issues)
  const summary = text(input.summary, LIMITS.summary, 'summary', issues)
  const punchline = text(input.punchline, LIMITS.punchline, 'punchline', issues)

  const characters: StoryCharacter[] = []
  if (!Array.isArray(input.characters)) {
    issues.push({ path: 'characters', code: 'type' })
  } else {
    if (input.characters.length < 1 || input.characters.length > 6) {
      issues.push({ path: 'characters', code: 'count' })
    }
    input.characters.forEach((c: unknown, i: number) => {
      const rec = isRecord(c) ? c : {}
      characters.push({
        name: text(rec.name, LIMITS.name, `characters.${i}.name`, issues),
        role: text(rec.role, LIMITS.role, `characters.${i}.role`, issues),
      })
    })
    const seen = new Set<string>()
    characters.forEach((c, i) => {
      const key = c.name.toLowerCase()
      if (key && seen.has(key)) issues.push({ path: `characters.${i}.name`, code: 'duplicate' })
      seen.add(key)
    })
  }

  const panels: StoryPanelData[] = []
  const names = new Set(characters.map((c) => c.name))
  if (!Array.isArray(input.panels)) {
    issues.push({ path: 'panels', code: 'type' })
  } else {
    const min = expectedPanels ?? MIN_PANELS
    const max = expectedPanels ?? MAX_PANELS
    if (input.panels.length < min || input.panels.length > max) {
      issues.push({ path: 'panels', code: 'count' })
    }
    input.panels.forEach((p: unknown, i: number) => {
      const rec = isRecord(p) ? p : {}
      const speaker = text(rec.speaker, LIMITS.name, `panels.${i}.speaker`, issues)
      if (speaker && !names.has(speaker)) issues.push({ path: `panels.${i}.speaker`, code: 'speaker' })
      panels.push({
        scene: text(rec.scene, LIMITS.scene, `panels.${i}.scene`, issues),
        caption: text(rec.caption, LIMITS.caption, `panels.${i}.caption`, issues, false),
        speaker,
        dialogue: text(rec.dialogue, LIMITS.dialogue, `panels.${i}.dialogue`, issues),
      })
    })
  }

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, data: { title, summary, punchline, characters, panels } }
}
