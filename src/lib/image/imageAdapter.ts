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
    let currentPercent = 8
    const emit = (p: number, s?: GenerationStage) => {
      currentPercent = Math.max(currentPercent, Math.min(100, Math.round(p)))
      req.onProgress?.({
        percent: currentPercent,
        stage: s || stageForPercent(currentPercent),
      })
    }

    emit(8, 'scene')

    const startTime = Date.now()
    const targetDurationMs = 2400 // ~2.4 seconds fast, smooth 4-stage animation

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const ratio = Math.min(0.95, elapsed / targetDurationMs)
      const nextPercent = Math.max(currentPercent + 1, Math.round(8 + ratio * 88))
      if (nextPercent <= 96) {
        emit(nextPercent)
      }
    }, 120)

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
        const timeoutController = new AbortController()
        const timeoutId = setTimeout(() => timeoutController.abort(), 3500)
        if (signal) {
          signal.addEventListener('abort', () => timeoutController.abort(), { once: true })
        }

        try {
          const response = await fetch('/api/gemini/cartoon-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: timeoutController.signal,
          })

          if (response.ok) {
            const data = (await response.json()) as { imageUrl?: string }
            if (data && typeof data.imageUrl === 'string' && data.imageUrl.length > 0) {
              generatedImageUrl = data.imageUrl
            }
          }
        } finally {
          clearTimeout(timeoutId)
        }
      } catch {
        // Timeout, offline, or static host — immediately fall back to client-side multi-layered composer below
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

      // Ensure smooth completion through remaining stages without ever stalling
      const remainingMs = Math.max(0, Math.min(1200, targetDurationMs - (Date.now() - startTime)))
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
  if (
    /নদী|নৌকা|ঘাট|কাশফুল|মাঝি|পদ্মা|পানি|সাগর|পুকুর|হাওর|বিল|\bnodi\b|\bnouka\b|\bghat\b|\bmajhi\b|\bpadma\b|\bpani\b|\bsagor\b|\bpukur\b|\bhaor\b|\bbil\b|\briver\b|\bboat\b|\bkashful\b|\bshurjo\b/.test(
      text
    )
  ) {
    return 'river'
  }
  if (
    /বৃষ্টি|বাদল|মেঘ|বন্যা|ঝড়|ছাতা|\bbristi\b|\bbrishti\b|\bmegh\b|\bjhor\b|\bchhata\b|\bchata\b|\brain\b|\bmonsoon\b|\bumbrella\b|\bpuddle\b|\bstorm\b/.test(
      text
    )
  ) {
    return 'rain'
  }
  if (/রিকশা|রিকশাওয়ালা|প্যাডেল|হুড|ভাড়া|\brickshaw\b|\briksha\b|\bhood\b|\bfare\b|\bpedal\b/.test(text)) {
    return 'rickshaw'
  }
  if (/লাইব্রেরি|বই|পড়াশোনা|লাইব্রেরিয়ান|\blibrary\b|\bbookshelf\b|\bsilence\b|\bstudying\b|\bboi\b/.test(text)) {
    return 'library'
  }
  if (/টিএসসি|বটতলা|আড্ডা|বাজার|হাট|\btsc\b|\bbottola\b|\bcircle\b|\badda\b|\bbazar\b|\bhaat\b/.test(text)) {
    return 'tsc'
  }
  if (/মাঠ|খেলা|ক্রিকেট|ফুটবল|ফিল্ড|\bmath\b|\bkhela\b|\bfield\b|\bcricket\b|\bfootball\b|\bground\b|\bsports\b/.test(text)) {
    return 'field'
  }
  if (/বাস|সিট|কন্ডাকটর|জ্যাম|রাস্তা|\bbus\b|\bpassenger\b|\bconductor\b|\btraffic\b|\bjam\b|\brasta\b/.test(text)) {
    return 'bus'
  }
  if (/ফুচকা|চটপটি|টক|তেঁতুল|ঝাল|\bfuchka\b|\bphuchka\b|\bchotpoti\b|\bsour\b|\btamarind\b|\bpuchka\b/.test(text)) {
    return 'fuchka'
  }
  if (/পরীক্ষা|কুইজ|হল|ক্লাস|বোর্ড|নম্বর|স্কুল|\bporikkha\b|\bexam\b|\bquiz\b|\btest\b|\bpaper\b|\bhall\b|\bclass\b|\bblackboard\b|\bschool\b/.test(text)) {
    return 'classroom'
  }
  if (/ঘুমানো|বিছানা|রুম|সোফা|মুভি|ঘর|বাসা|\bghor\b|\bbasha\b|\bghum\b|\bmovie\b|\bbed\b|\bsleep\b|\bblanket\b|\bcouch\b|\broom\b|\bsofa\b/.test(text)) {
    return 'bedroom'
  }
  if (/হোস্টেল|ল্যাপটপ|ব্যাটারি|রাত|টেবিল|\bhostel\b|\blaptop\b|\bbattery\b|\bmidnight\b|\braat\b/.test(text)) {
    return 'hostel'
  }
  if (/ক্যান্টিন|চা|সিঙ্গারা|টং|খাবার|বিরিয়ানি|নাস্তা|\bcha\b|\btong\b|\bcanteen\b|\bbiryani\b|\btea\b|\bstall\b|\bsnack\b|\bfood\b/.test(text)) {
    return 'canteen'
  }
  if (/গেট|দৌড়|দেরি|গার্ড|তাড়াহুড়ো|\bgate\b|\bdash\b|\bguard\b|\balarm\b|\blate\b|\bsprint\b|\bdour\b/.test(text)) {
    return 'gate'
  }
  if (/ছাদ|রুপকথা|ঘুড়ি|\bchhad\b|\bchad\b|\bghuri\b|\brooftop\b|\broof\b|\bkite\b/.test(text)) {
    return 'rooftop'
  }
  if (/ক্যাম্পাস|কার্জন|বিশ্ববিদ্যালয়|গাছ|রাস্তা|\bcampus\b|\bcurzon\b|\buniversity\b|\bcollege\b|\bpathway\b|\btree\b/.test(text)) {
    return 'campus'
  }
  return 'campus'
}

export function detectPose(scene: string = '', dialogue: string = ''): CharacterPose {
  const text = `${scene} ${dialogue}`.toLowerCase()
  if (/ভাবনা|চিন্তা|ভাবছি|কেন|হিসাব|\bchinta\b|\bbhabchi\b|\bthink\b|\bponder\b|\bwonder\b|\bidea\b|\bhmm\b|\bquestion\b/.test(text)) {
    return 'thinking'
  }
  if (/রাগ|রেগে|চিৎকার|ধমক|ঘুষি|\brag\b|\brege\b|\bangry\b|\brage\b|\bfurious\b|\bshout\b|\byell\b|\bmad\b/.test(text)) {
    return 'angry'
  }
  if (/কান্না|চোখের পানি|কাঁদছে|হায় হায়|\bkanna\b|\bkandche\b|\bcry\b|\btears\b|\bsob\b|\bweep\b|\bsad\b/.test(text)) {
    return 'crying'
  }
  if (/ফিসফিস|গোপন|কাউকে বলিস না|কানে কানে|\bgopon\b|\bwhisper\b|\bsecret\b|\bhush\b|\bquietly\b/.test(text)) {
    return 'whispering'
  }
  if (/নাচ|গান|বিজয়|উল্লাস|\bnach\b|\bgan\b|\bdance\b|\bgroove\b|\bmusic\b|\bsing\b/.test(text)) {
    return 'dancing'
  }
  if (/আতঙ্ক|কি|শক|চোখ|ভয়|অবাক|\bobak\b|\bbhoy\b|\bshock\b|\bfreeze\b|\bpanic\b|\bwhat\b|\bterror\b/.test(text)) {
    return 'shocked'
  }
  if (/দৌড়|ছুট|তাড়া|স্পিড|\bdour\b|\bpala\b|\bdash\b|\brun\b|\bsprint\b|\brace\b|\brush\b|\bspeed\b/.test(text)) {
    return 'running'
  }
  if (/ইয়েস|আনন্দ|পার্টি|হাসি|খুশি|\banondo\b|\bkhushi\b|\byahoo\b|\bcelebrate\b|\bcheer\b|\bparty\b|\byes\b/.test(text)) {
    return 'celebrating'
  }
  if (/পড়ে|ক্লান্ত|ধপাস|বেহাল|\bklanto\b|\bcollapse\b|\bexhausted\b|\btired\b|\bflat\b|\bslump\b/.test(text)) {
    return 'collapsed'
  }
  if (/আত্মবিশ্বাসী|রেডি|হাসি|প্ল্যান|\bready\b|\bplan\b|\bsure\b|\bconfident\b|\bsmile\b/.test(text)) {
    return 'confident'
  }
  if (/বলা|কথা|শোন|অনুরোধ|\bplead\b|\bask\b|\bsay\b|\btalk\b|\bspeak\b|\blisten\b/.test(text)) {
    return 'talking'
  }
  return 'idle'
}
