import type { Bilingual, Lang } from './lib/i18n'

export type GenreId = 'action' | 'romance' | 'fantasy' | 'scifi' | 'horror' | 'comedy'

export type HumorStyle = 'witty' | 'slapstick' | 'wholesome' | 'absurd'
export type StorySource = 'template' | 'ai'

export type ComicSetting =
  | 'campus'
  | 'classroom'
  | 'bedroom'
  | 'hostel'
  | 'canteen'
  | 'gate'
  | 'rooftop'
  | 'general'
  | 'rain'
  | 'rickshaw'
  | 'library'
  | 'tsc'
  | 'field'
  | 'bus'
  | 'fuchka'
  | 'river'

export type CharacterPose =
  | 'idle'
  | 'confident'
  | 'talking'
  | 'shocked'
  | 'running'
  | 'collapsed'
  | 'celebrating'
  | 'thinking'
  | 'angry'
  | 'crying'
  | 'whispering'
  | 'dancing'

export type CharacterPresetId =
  | 'rafi'
  | 'nusrat'
  | 'tamim'
  | 'teacher'
  | 'khala'
  | 'guard'
  | 'custom'
  | 'rickshaw_mama'
  | 'cha_mama'
  | 'ananya'
  | 'guitarist'
  | 'policeman'
  | 'dadi'

export type BubbleStyle = 'speech' | 'thought' | 'shout'

export type BubblePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type TailDirection =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'left'
  | 'right'
  | 'none'

export type CaptionPosition = 'bottom' | 'top'

export type BubbleFontSize = 'sm' | 'base' | 'lg'

export interface CharacterVisualPreset {
  id: string
  name: string
  skinColor: string
  hairColor: string
  primaryColor: string
  secondaryColor: string
  hasGlasses?: boolean
  hasBackpack?: boolean
  hasBeard?: boolean
  presetType: CharacterPresetId
}

export type ImageRenderMode = 'procedural' | 'ai'

export interface StoryCharacter {
  name: string
  role: string
  preset?: CharacterPresetId
  colors?: Partial<CharacterVisualPreset>
}

export interface StoryPanelData {
  scene: string
  caption: string
  speaker: string
  dialogue: string
  imageUrl?: string
  setting?: ComicSetting
  pose?: CharacterPose
  characterPreset?: CharacterPresetId
  colors?: Partial<CharacterVisualPreset>
  sfx?: string
  bubbleStyle?: BubbleStyle
  bubblePosition?: BubblePosition
  tailDirection?: TailDirection
  bubbleX?: number
  bubbleY?: number
  bubbleWidth?: number
  fontSize?: BubbleFontSize
  captionPosition?: CaptionPosition
}

/** Validated structured story: the output contract for both template and AI generators. */
export interface StoryData {
  title: string
  summary: string
  punchline: string
  characters: StoryCharacter[]
  panels: StoryPanelData[]
}

export interface StoryOptions {
  incident: string
  heroName: string
  genre: GenreId
  humor: HumorStyle
  language: Lang
  panelCount: number
  seed: number
}

export interface GeneratedStory {
  source: StorySource
  engine: string
  options: StoryOptions
  data: StoryData
}

/** Saved on a local project so the app always knows how a story was produced. */
export interface StoryMeta {
  source: StorySource
  engine: string
  language: Lang
  summary: string
  punchline: string
  characters: StoryCharacter[]
}

export interface Panel {
  id: string
  scene: string
  caption: string
  dialogue: string
  speaker?: string
  setting?: ComicSetting
  pose?: CharacterPose
  characterPreset?: CharacterPresetId
  colors?: Partial<CharacterVisualPreset>
  sfx?: string
  imageUrl?: string
  renderMode?: ImageRenderMode
  bubbleStyle?: BubbleStyle
  bubblePosition?: BubblePosition
  tailDirection?: TailDirection
  bubbleX?: number
  bubbleY?: number
  bubbleWidth?: number
  fontSize?: BubbleFontSize
  captionPosition?: CaptionPosition
}

export interface Project {
  id: string
  title: string
  summary?: string
  punchline?: string
  genre: GenreId
  panels: Panel[]
  updatedAt: number
  story?: StoryMeta
  characterPresets?: Record<string, CharacterVisualPreset>
  userId?: string
  isPublic?: boolean
}

export interface DemoStory {
  id: string
  genre: GenreId
  title: Bilingual
  synopsis: Bilingual
  panels: {
    caption: Bilingual
    dialogue: Bilingual
    speaker?: Bilingual
    setting?: ComicSetting
    pose?: CharacterPose
    sfx?: Bilingual
    bubbleStyle?: BubbleStyle
    bubblePosition?: BubblePosition
    tailDirection?: TailDirection
    captionPosition?: CaptionPosition
  }[]
}

export interface GenreMeta {
  id: GenreId
  emoji: string
  gradient: string
  name: Bilingual
  desc: Bilingual
}

// ---- Diary + community (Supabase) ----

export type Visibility = 'private' | 'public'
/** 'manual' = written by the user (no generator). */
export type EntrySource = StorySource | 'manual'

export interface EntryContent {
  title: string
  /** The original incident. Always private, never part of the public view. */
  incident: string
  summary: string
  punchline: string
  genre: GenreId
  language: Lang
  source: EntrySource
  engine: string
  characters: StoryCharacter[]
  /** Empty for an incident-only note; otherwise 4 to 8 panels. */
  panels: StoryPanelData[]
}

export interface EntryInput extends EntryContent {
  visibility: Visibility
}

export interface DiaryEntry extends EntryInput {
  id: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type SharePlatform =
  | 'copy_link'
  | 'facebook'
  | 'whatsapp'
  | 'twitter'
  | 'diary_repost'
  | 'native'

export interface StoryComment {
  id: string
  storyId: string
  userId: string
  username: string
  displayName: string
  content: string
  createdAt: string
}

export interface StoryShare {
  id: string
  storyId: string
  userId?: string
  username?: string
  platform: SharePlatform
  createdAt: string
}

export interface PublicStory {
  id: string
  ownerId: string
  username: string
  displayName: string
  title: string
  summary: string
  punchline: string
  genre: GenreId
  language: Lang
  source: EntrySource
  engine: string
  characters: StoryCharacter[]
  panels: StoryPanelData[]
  likeCount: number
  commentCount?: number
  shareCount?: number
  publishedAt: string
}

export interface Profile {
  id: string
  username: string
  displayName: string
  bio: string
}
