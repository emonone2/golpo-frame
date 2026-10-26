import type { StoryData, StoryOptions } from '../../types'
import { BN, EN } from './templatePacks'
import type { BeatId, Ctx, TopicId } from './templatePacks'

/** Shown to users; this engine is rule-based and is NOT an AI model. */
export const TEMPLATE_ENGINE = 'Rule-based templates v1 (no AI)'

const ARC: Record<number, BeatId[]> = {
  4: ['setup', 'trouble', 'twist', 'punchline'],
  5: ['setup', 'trouble', 'escalate', 'twist', 'punchline'],
  6: ['setup', 'plan', 'trouble', 'escalate', 'twist', 'punchline'],
  7: ['setup', 'plan', 'trouble', 'friend', 'escalate', 'twist', 'punchline'],
  8: ['setup', 'plan', 'trouble', 'friend', 'escalate', 'desperate', 'twist', 'punchline'],
}

type KeywordTopic = Exclude<TopicId, 'general'>

// English keywords match whole words (plus a plural "s"); Bangla keywords match word prefixes.
const KEYWORDS: Record<KeywordTopic, string[]> = {
  exam: ['exam', 'quiz', 'viva', 'test', 'পরীক্ষা', 'কুইজ', 'ভাইভা'],
  late: ['late', 'bus', 'alarm', 'traffic', 'দেরি', 'দেরী', 'জ্যাম', 'অ্যালার্ম'],
  deadline: ['assignment', 'deadline', 'submit', 'project', 'homework', 'presentation', 'অ্যাসাইনমেন্ট', 'ডেডলাইন', 'জমা', 'প্রজেক্ট', 'হোমওয়ার্ক', 'প্রেজেন্টেশন'],
  food: ['canteen', 'lunch', 'biryani', 'food', 'tea', 'snack', 'ক্যান্টিন', 'বিরিয়ানি', 'খাবার', 'নাস্তা', 'টিফিন'],
}

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z]+|[\u0980-\u09ff]+/g) ?? []
}

function hasKeyword(words: string[], keyword: string): boolean {
  const latin = /^[a-z]+$/.test(keyword)
  return words.some((w) => (latin ? w === keyword || w === `${keyword}s` : w.startsWith(keyword)))
}

export function detectTopic(incident: string): TopicId {
  const words = tokens(incident)
  let best: TopicId = 'general'
  let bestScore = 0
  for (const id of Object.keys(KEYWORDS) as KeywordTopic[]) {
    const score = KEYWORDS[id].filter((k) => hasKeyword(words, k)).length
    if (score > bestScore) {
      best = id
      bestScore = score
    }
  }
  return best
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function excerpt(s: string): string {
  const flat = s.replace(/\s+/g, ' ').replace(/"/g, "'").trim()
  return flat.length > 140 ? `${flat.slice(0, 139).trimEnd()}…` : flat
}

/** Builds a story from fixed templates. Deterministic for the same options + seed. */
export function generateFromTemplate(o: StoryOptions): StoryData {
  const pack = o.language === 'bn' ? BN : EN
  const topic = detectTopic(o.incident)
  const t = pack.topics[topic]
  const seed = typeof o.seed === 'number' ? o.seed : 0
  const h = hash(o.incident ?? '') + seed * 7919

  const custom = (o.heroName ?? '').trim().slice(0, 40)
  const hero = custom && custom.toLowerCase() !== t.authority.name.toLowerCase() ? custom : pack.defaults.hero
  const friend = pack.defaults.friends.find((f) => f.toLowerCase() !== hero.toLowerCase()) ?? pack.defaults.friends[0]
  const humorKey = o.humor && pack.humor[o.humor] ? o.humor : 'witty'
  const humor = pack.humor[humorKey]

  const ctx: Ctx = {
    hero,
    friend,
    auth: t.authority.name,
    t,
    excerpt: excerpt(o.incident),
    reaction: humor.reactions[h % humor.reactions.length],
    quip: pack.quips[Math.floor(h / 3) % pack.quips.length],
    tail: humor.tail,
    flavor: humor.flavor,
  }

  const styleTag = pack.styleSuffix(pack.genre[o.genre])
  const arc = ARC[o.panelCount] ?? ARC[6]
  const panels = arc.map((id) => {
    const beat = pack.beats[id](ctx)
    return { ...beat, scene: `${beat.scene} ${styleTag}` }
  })

  return {
    title: pack.title(hero, t),
    summary: pack.summary(hero, t),
    punchline: `${t.punch}${humor.tail}`,
    characters: [
      { name: hero, role: pack.roles.hero },
      { name: friend, role: pack.roles.friend },
      { name: t.authority.name, role: t.authority.role },
    ],
    panels,
  }
}
