import type { CharacterPose, ComicSetting, GenreId } from '../../types'
import {
  buildSmartDefaultBlueprint,
  composeBanglaCartoonSvg,
  encodeSvgToDataUri,
} from './banglaCartoonComposer'

export type GenerationStage = 'scene' | 'background' | 'character' | 'finishing'

export interface GenerationProgress {
  percent: number
  stage: GenerationStage
}

export interface GenerateImageRequest {
  prompt: string
  setting: ComicSetting
  pose: CharacterPose
  genre: GenreId
  characterName?: string
  characterPreset?: string
  dialogue?: string
  caption?: string
  colors?: Record<string, unknown>
  width?: number
  height?: number
  onProgress?: (progress: GenerationProgress) => void
}

export interface ImageGeneratorAdapter {
  id: string
  name: string
  isAvailable(): boolean
  generatePanelIllustration(req: GenerateImageRequest, signal?: AbortSignal): Promise<string>
}

/**
 * Procedural Cartoon Adapter (Default Zero-Budget Mode).
 * Renders authentic vector cartoon illustrations locally without requiring an API or GPU.
 */
export class ProceduralCartoonAdapter implements ImageGeneratorAdapter {
  id = 'procedural-svg'
  name = 'Bangladeshi Cartoon Procedural Renderer (Zero-Budget, Offline)'

  isAvailable(): boolean {
    return true
  }

  async generatePanelIllustration(req: GenerateImageRequest): Promise<string> {
    return `procedural://${req.setting}/${req.pose}/${req.genre}`
  }
}

function stageForPercent(percent: number): GenerationStage {
  if (percent < 25) return 'scene'
  if (percent < 55) return 'background'
  if (percent < 85) return 'character'
  return 'finishing'
}

/**
 * Free Google Gemini AI High-Detail Bangla Cartoon Image Adapter (~5-7 seconds with smooth 0-100% progress).
 * Works on both full-stack servers (/api/gemini/cartoon-image) AND static deployments (Vercel, Netlify, GitHub Pages)
 * by falling back to the client-side Multi-Layered Bangla Cartoon Composer if the server route is unreachable.
 */
export class GeminiFreeCartoonAdapter implements ImageGeneratorAdapter {
  id = 'gemini-free-cartoon'
  name = 'Google Gemini AI High-Detail Bangla Cartoon Generator (Free)'

  isAvailable(): boolean {
    return true
  }

  async generatePanelIllustration(req: GenerateImageRequest, signal?: AbortSignal): Promise<string> {
    let currentPercent = 5
    const emit = (p: number, s?: GenerationStage) => {
      currentPercent = Math.max(currentPercent, Math.min(100, Math.round(p)))
      req.onProgress?.({
        percent: currentPercent,
        stage: s || stageForPercent(currentPercent),
      })
    }

    emit(5, 'scene')

    const startTime = Date.now()
    const targetDurationMs = 5200 // ~5.2 seconds smooth 4-stage animation

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const ratio = Math.min(0.96, elapsed / targetDurationMs)
      const nextPercent = Math.max(currentPercent + 1, Math.round(5 + ratio * 92))
      if (nextPercent <= 97) {
        emit(nextPercent)
      }
    }, 180)

    const variationSeed = Date.now()
    const payload = {
      prompt: req.prompt.trim() || 'Bangladeshi student life cartoon scene',
      setting: req.setting,
      pose: req.pose,
      genre: req.genre,
      characterName: req.characterName || 'Rafi',
      characterPreset: req.characterPreset,
      dialogue: req.dialogue || '',
      caption: req.caption || '',
      colors: req.colors,
      width: req.width || 400,
      height: req.height || 500,
      variationSeed,
    }

    try {
      let generatedImageUrl: string | null = null

      try {
        const response = await fetch('/api/gemini/cartoon-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal,
        })

        if (response.ok) {
          const data = (await response.json()) as { imageUrl?: string }
          if (data && typeof data.imageUrl === 'string' && data.imageUrl.length > 0) {
            generatedImageUrl = data.imageUrl
          }
        }
      } catch {
        // Deployed on a static host (Vercel / Netlify / GitHub Pages) or offline — use client-side multi-layered composer below
      }

      if (!generatedImageUrl) {
        const blueprint = buildSmartDefaultBlueprint({
          prompt: payload.prompt,
          dialogue: payload.dialogue,
          caption: payload.caption,
          setting: payload.setting,
          pose: payload.pose,
          genre: payload.genre,
          characterName: payload.characterName,
          characterPreset: payload.characterPreset,
          colors: payload.colors,
          variationSeed,
        })
        const richSvg = composeBanglaCartoonSvg(blueprint)
        generatedImageUrl = encodeSvgToDataUri(richSvg)
      }

      // Ensure smooth completion through remaining stages so the user sees the 0% -> 100% animation
      const remainingMs = Math.max(0, targetDurationMs - (Date.now() - startTime))
      if (remainingMs > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, remainingMs))
      }
      emit(100, 'finishing')
      return generatedImageUrl
    } finally {
      clearInterval(timer)
    }
  }
}

/**
 * AI Image Model Adapter powered by Google Gemini AI.
 */
export class LocalModelImageAdapter implements ImageGeneratorAdapter {
  id = 'gemini-ai-image-adapter'
  name = 'Google Gemini AI Cartoon'

  isAvailable(): boolean {
    return true
  }

  async generatePanelIllustration(req: GenerateImageRequest, signal?: AbortSignal): Promise<string> {
    const geminiAdapter = new GeminiFreeCartoonAdapter()
    return geminiAdapter.generatePanelIllustration(req, signal)
  }
}

export function detectSetting(scene: string = '', dialogue: string = ''): ComicSetting {
  const text = `${scene} ${dialogue}`.toLowerCase()
  if (/বৃষ্টি|বাদল|মেঘ|বন্যা|ঝড়|rain|monsoon|umbrella|puddle|storm|dark clouds/.test(text)) {
    return 'rain'
  }
  if (/রিকশা|রিকশাওয়ালা|প্যাডেল|হুড|ভাড়া|rickshaw|hood|fare|pedal/.test(text)) {
    return 'rickshaw'
  }
  if (/লাইব্রেরি|বই|পড়াশোনা|লাইব্রেরিয়ান|library|bookshelf|silence|studying/.test(text)) {
    return 'library'
  }
  if (/টিএসসি|বটতলা|আড্ডা|tsc|bottola|circle|adda/.test(text)) {
    return 'tsc'
  }
  if (/মাঠ|খেলা|ক্রিকেট|ফুটবল|ফিল্ড|field|cricket|football|ground|sports/.test(text)) {
    return 'field'
  }
  if (/বাস|সিট|কন্ডাকটর|জ্যাম|bus|passenger|conductor|traffic jam|local bus/.test(text)) {
    return 'bus'
  }
  if (/ফুচকা|চটপটি|টক|তেঁতুল|ঝাল|fuchka|chotpoti|sour|tamarind|puchka/.test(text)) {
    return 'fuchka'
  }
  if (/নদী|নৌকা|ঘাট|কাশফুল|মাঝি|river|boat|ghat|kashful|shurjo/.test(text)) {
    return 'river'
  }
  if (/পরীক্ষা|কুইজ|হল|ক্লাস|বোর্ড|নম্বর|exam|quiz|test|paper|hall|class|blackboard|marks/.test(text)) {
    return 'classroom'
  }
  if (/ক্যাম্পাস|কার্জন|বিশ্ববিদ্যালয়|গাছ|রাস্তা|campus|curzon|university|college|pathway|tree/.test(text)) {
    return 'campus'
  }
  if (/ঘুমানো|বিছানা|রুম|সোফা|মুভি|movie|bed|sleep|blanket|couch|couch potato|room|sofa/.test(text)) {
    return 'bedroom'
  }
  if (/হোস্টেল|ল্যাপটপ|ব্যাটারি|রাত|টেবিল|hostel|laptop|battery|midnight|desk lamp/.test(text)) {
    return 'hostel'
  }
  if (/ক্যান্টিন|চা|সিঙ্গারা|টং|খাবার|বিরিয়ানি|নাস্তা|canteen|biryani|tea|stall|sugar|snack|food|plate/.test(text)) {
    return 'canteen'
  }
  if (/গেট|দৌড়|দেরি|গার্ড|তাড়াহুড়ো|gate|dash|guard|alarm|corridor|late|sprint/.test(text)) {
    return 'gate'
  }
  if (/ছাদ|রুপকথা|rooftop|roof|lightning|kingdom/.test(text)) {
    return 'rooftop'
  }
  return 'campus'
}

export function detectPose(scene: string = '', dialogue: string = ''): CharacterPose {
  const text = `${scene} ${dialogue}`.toLowerCase()
  if (/ভাবনা|চিন্তা|ভাবছি|কেন|হিসাব|think|ponder|wonder|idea|hmm|question/.test(text)) {
    return 'thinking'
  }
  if (/রাগ|রেগে|চিৎকার|ধমক|ঘুষি|angry|rage|furious|shout|yell|mad/.test(text)) {
    return 'angry'
  }
  if (/কান্না|চোখের পানি|কাঁদছে|হায় হায়|cry|tears|sob|weep|sad|heartbreak/.test(text)) {
    return 'crying'
  }
  if (/ফিসফিস|গোপন|কাউকে বলিস না|কানে কানে|whisper|secret|hush|quietly/.test(text)) {
    return 'whispering'
  }
  if (/নাচ|গান|বিজয়|উল্লাস|dance|groove|music|sing|celebrate|rock/.test(text)) {
    return 'dancing'
  }
  if (/আতঙ্ক|কি|শক|চোখ|ভয়|shock|freeze|panic|what|upside down|eyes|terror|wide/.test(text)) {
    return 'shocked'
  }
  if (/দৌড়|ছুট|তাড়া|স্পিড|dash|run|sprint|race|rush|speed|gap/.test(text)) {
    return 'running'
  }
  if (/ইয়েস|আনন্দ|পার্টি|হাসি|খুশি|yahoo|delivered|chill|celebrate|cheer|party|yes/.test(text)) {
    return 'celebrating'
  }
  if (/পড়ে|ক্লান্ত|ধপাস|বেহাল|collapse|exhausted|tired|flat|slump|bed/.test(text)) {
    return 'collapsed'
  }
  if (/আত্মবিশ্বাসী|রেডি|হাসি|প্ল্যান|ready|plan|sure|now or never|confident|smile|smirk/.test(text)) {
    return 'confident'
  }
  if (/বলা|কথা|শোন|অনুরোধ|plead|ask|say|talk|speak|signature|listen/.test(text)) {
    return 'talking'
  }
  return 'idle'
}
