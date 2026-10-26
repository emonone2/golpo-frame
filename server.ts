import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai'
import {
  composeBanglaCartoonSvg,
  type BanglaCartoonBlueprint,
  type BanglaEnvironment,
  type CartoonPoseId,
  type CharacterStyleId,
  type EmotionEffect,
  type ForegroundPropId,
  type HeldProp,
  type SkyTheme,
  type WeatherEffect,
} from './src/lib/image/banglaCartoonComposer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
}

function detectEnvironmentFromAllText(setting: string, text: string): BanglaEnvironment {
  const combined = `${text}`.toLowerCase()
  // Text content takes priority when user writes a specific scene/dialogue/caption
  if (/গ্রাম|উঠান|কুঁড়েঘর|পিঠা|ধান|কলাগাছ|village|courtyard|hut|pitha/.test(combined))
    return 'village_courtyard'
  if (/ছাদ|সূর্যাস্ত|ঘুড়ি|রেলিং|rooftop|roof|kite/.test(combined)) return 'dhaka_rooftop'
  if (/চা|টং|ক্যান্টিন|সিঙ্গারা|বিরিয়ানি|কাচ্চি|tea|tong|canteen|stall|biryani/.test(combined))
    return 'tong_tea_stall'
  if (/বৃষ্টি|বাদল|মেঘ|ঝড়|ছাতা|rain|monsoon|umbrella|puddle|storm/.test(combined)) return 'rainy_street'
  if (/রিকশা|প্যাডেল|হুড|ভাড়া|rickshaw/.test(combined)) return 'rickshaw_ride'
  if (/নদী|নৌকা|ঘাট|কাশফুল|মাঝি|পদ্মা|river|boat|nouka|kashful/.test(combined)) return 'river_nouka'
  if (/ফুচকা|চটপটি|তেঁতুল|টক|fuchka|chotpoti/.test(combined)) return 'fuchka_cart'
  if (/পরীক্ষা|ক্লাস|বোর্ড|কুইজ|খাতা|classroom|exam|class|blackboard|quiz/.test(combined))
    return 'classroom_exam'
  if (/হোস্টেল|রাত|ল্যাপটপ|অ্যাসাইনমেন্ট|hostel|assignment/.test(combined)) return 'hostel_night'
  if (/ঘর|বিছানা|রুম|ঘুম|কম্বল|bedroom|room|bed|sleep/.test(combined)) return 'bedroom_lazy'
  if (/লাইব্রেরি|বইঘর|library|bookshelf/.test(combined)) return 'library_study'
  if (/মাঠ|ক্রিকেট|ফুটবল|খেলা|ব্যাট|field|cricket|football/.test(combined)) return 'cricket_field'
  if (/বাস|জ্যাম|কন্ডাকটর|সিট|bus|traffic/.test(combined)) return 'dhaka_bus'
  if (/টিএসসি|বটতলা|আড্ডা|tsc|bottola/.test(combined)) return 'tsc_bottola'
  if (/গেট|দারোয়ান|gate|guard/.test(combined)) return 'college_gate'

  // Fallback to explicit setting dropdown
  switch (setting) {
    case 'rooftop':
      return 'dhaka_rooftop'
    case 'canteen':
      return 'tong_tea_stall'
    case 'rain':
      return 'rainy_street'
    case 'rickshaw':
      return 'rickshaw_ride'
    case 'river':
      return 'river_nouka'
    case 'fuchka':
      return 'fuchka_cart'
    case 'classroom':
      return 'classroom_exam'
    case 'hostel':
      return 'hostel_night'
    case 'bedroom':
      return 'bedroom_lazy'
    case 'library':
      return 'library_study'
    case 'field':
      return 'cricket_field'
    case 'bus':
      return 'dhaka_bus'
    case 'tsc':
      return 'tsc_bottola'
    case 'gate':
      return 'college_gate'
    default:
      return 'curzon_campus'
  }
}

function detectPoseFromAllText(pose: string, text: string): CartoonPoseId {
  const t = text.toLowerCase()
  if (/আতঙ্ক|শক|হায় হায়|সর্বনাশ|কী|অবাক|ভয়|shock|panic|omg|what|terror/.test(t)) return 'shocked'
  if (/রাগ|রেগে|চিৎকার|ধমক|বিরক্ত|angry|rage|mad|furious|shout/.test(t)) return 'angry'
  if (/কান্না|চোখের পানি|কাঁদছে|দুঃখ|মন খারাপ|cry|tears|sad|sob/.test(t)) return 'crying'
  if (/ভাবনা|চিন্তা|ভাবছি|কেন|কীভাবে|হুমম|think|wonder|hmm|question/.test(t)) return 'thinking'
  if (/ইয়াাহু|আনন্দ|জিতেছি|পার্টি|খুশি|উৎসব|celebrate|yahoo|yay|win|happy/.test(t)) return 'celebrating'
  if (/নাচ|গান|উৎসব|dance|music|sing/.test(t)) return 'dancing'
  if (/দৌড়|ছুট|তাড়াহুড়ো|দেরি|run|sprint|rush|late/.test(t)) return 'running'
  if (/ফিসফিস|গোপন|চুপিচুপি|whisper|secret/.test(t)) return 'whispering'
  if (/আত্মবিশ্বাসী|রেডি|প্ল্যান|confident|ready|sure/.test(t)) return 'confident'
  if (pose && pose !== 'idle') return pose as CartoonPoseId
  return 'talking'
}

function buildSmartDefaultBlueprint(opts: {
  prompt: string
  dialogue: string
  caption: string
  setting: string
  pose: string
  genre: string
  characterName: string
  characterPreset?: string
  colors?: Record<string, unknown>
}): BanglaCartoonBlueprint {
  const fullText = `${opts.prompt} ${opts.dialogue} ${opts.caption} ${opts.characterName}`.toLowerCase()
  const environment = detectEnvironmentFromAllText(opts.setting, fullText)
  const detectedPose = detectPoseFromAllText(opts.pose, fullText)

  let skyTheme: SkyTheme = 'sunny_dhaka'
  if (environment === 'rainy_street') skyTheme = 'monsoon_storm'
  else if (
    environment === 'dhaka_rooftop' ||
    environment === 'river_nouka' ||
    /বিকেল|সন্ধ্যা|সূর্যাস্ত|sunset|evening|গোধূলি/.test(fullText)
  ) {
    skyTheme = 'golden_sunset'
  } else if (environment === 'fuchka_cart' || environment === 'hostel_night' || /রাত|night/.test(fullText)) {
    skyTheme = 'neon_evening'
  } else if (opts.genre === 'action' || detectedPose === 'shocked' || detectedPose === 'angry') {
    skyTheme = 'dramatic_action'
  }

  let weatherEffect: WeatherEffect = 'sparkles'
  if (environment === 'rainy_street') weatherEffect = 'heavy_rain'
  else if (skyTheme === 'golden_sunset') weatherEffect = 'sunbeams'
  else if (opts.genre === 'romance' || /প্রেম|ভালোবাসা|গোলাপ|ফুল|romance/.test(fullText))
    weatherEffect = 'romance_petals'
  else if (skyTheme === 'neon_evening') weatherEffect = 'golden_fireflies'

  let preset: CharacterStyleId = (opts.characterPreset as CharacterStyleId) || 'rafi'
  if (!opts.characterPreset || opts.characterPreset === 'rafi') {
    if (/নুসরাত|মেয়ে|আপু|তরুণী|nusrat|girl|woman|she/.test(fullText)) preset = 'nusrat'
    else if (/অনন্যা|হিজাব|ananya/.test(fullText)) preset = 'ananya'
    else if (/খালা|মা|আম্মু|ভাবি|khala|mother|aunt/.test(fullText)) preset = 'khala'
    else if (/দাদি|নানী|dadi|grandma/.test(fullText)) preset = 'dadi'
    else if (/রিকশা|rickshaw/.test(fullText)) preset = 'rickshaw_mama'
    else if (/টং|দোকানদার|tong/.test(fullText)) preset = 'cha_mama'
    else if (/স্যার|শিক্ষক|মাস্টার|teacher|sir/.test(fullText)) preset = 'teacher'
    else if (/গার্ড|দারোয়ান|guard/.test(fullText)) preset = 'guard'
    else if (/গিটার|গান|ফাহিম|guitar|fahim/.test(fullText)) preset = 'guitarist'
    else if (/তামিম|বন্ধু|দোস্ত|tamim|friend/.test(fullText)) preset = 'tamim'
  }

  let heldProp: HeldProp = 'none'
  if (/বিরিয়ানি|কাচ্চি|biryani/.test(fullText)) heldProp = 'biryani_plate'
  else if (/চা|কাপ|tea|cup|coffee/.test(fullText) || environment === 'tong_tea_stall') heldProp = 'tea_cup'
  else if (/ছাতা|বৃষ্টি|umbrella|rain/.test(fullText) || environment === 'rainy_street') heldProp = 'umbrella'
  else if (/বই|খাতা|পড়া|পরীক্ষা|book|exam|study/.test(fullText) || environment === 'library_study')
    heldProp = 'book'
  else if (/ফুচকা|চটপটি|fuchka/.test(fullText) || environment === 'fuchka_cart') heldProp = 'fuchka_plate'
  else if (/গিটার|গান|guitar/.test(fullText)) heldProp = 'guitar'
  else if (/ব্যাট|ক্রিকেট|cricket|bat/.test(fullText) || environment === 'cricket_field')
    heldProp = 'cricket_bat'
  else if (/গোলাপ|ফুল|rose|flower/.test(fullText)) heldProp = 'rose'
  else if (/ফোন|মোবাইল|সেলফি|phone|mobile/.test(fullText)) heldProp = 'phone'

  let emotionEffect: EmotionEffect = 'none'
  if (detectedPose === 'shocked') emotionEffect = 'shock_bolts'
  else if (detectedPose === 'angry') emotionEffect = 'anger_vein'
  else if (detectedPose === 'thinking') emotionEffect = 'question_marks'
  else if (detectedPose === 'dancing') emotionEffect = 'music_notes'
  else if (opts.genre === 'romance' || /ভালোবাসা|প্রেম|সুন্দর|love|heart/.test(fullText))
    emotionEffect = 'hearts'
  else emotionEffect = 'sparkles'

  const isFemale = preset === 'nusrat' || preset === 'ananya' || preset === 'khala' || preset === 'dadi'
  const hasTwoPeople =
    /দুজনে|দুইজন|বন্ধু|সাথে|রাফি|নুসরাত|আড্ডা|মামা|স্যার|খালা|রিকশা|together|both|friends|and|with/.test(
      fullText
    )

  const secondaryPreset: CharacterStyleId =
    preset === 'rafi'
      ? 'nusrat'
      : preset === 'nusrat'
        ? 'rafi'
        : environment === 'tong_tea_stall'
          ? 'cha_mama'
          : environment === 'rickshaw_ride'
            ? 'rickshaw_mama'
            : environment === 'classroom_exam'
              ? 'teacher'
              : 'tamim'

  const secondaryIsFemale = secondaryPreset === 'nusrat'

  const foregroundProps: ForegroundPropId[] = ['stray_cat', 'flying_birds']
  if (/বিরিয়ানি|কাচ্চি|খাবার|biryani|lunch|dinner/.test(fullText)) {
    foregroundProps.unshift('biryani_table')
  } else if (environment === 'tong_tea_stall' || /চা|সিঙ্গারা|টং|tea/.test(fullText)) {
    foregroundProps.unshift('tea_table')
  } else if (environment === 'classroom_exam' || environment === 'library_study') {
    foregroundProps.unshift('exam_desk')
  } else if (environment === 'hostel_night' || environment === 'bedroom_lazy') {
    foregroundProps.unshift('laptop_study_desk')
  } else if (environment === 'village_courtyard' || /পিঠা|গ্রাম|pitha/.test(fullText)) {
    foregroundProps.unshift('village_pitha')
  } else if (environment === 'dhaka_rooftop') {
    foregroundProps.unshift('rooftop_kites', 'potted_flowers')
  } else {
    foregroundProps.unshift('potted_flowers')
  }

  return {
    skyTheme,
    environment,
    weatherEffect,
    signboardText:
      environment === 'tong_tea_stall'
        ? 'মামা স্পেশাল মালাই চা'
        : environment === 'fuchka_cart'
          ? 'মামা ফুচকা ও চটপটি'
          : environment === 'classroom_exam'
            ? 'বাংলা ক্লাস • পরীক্ষা'
            : environment === 'dhaka_bus'
              ? 'ঢাকা মেট্রো বাস'
              : 'ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাস',
    primaryCharacter: {
      preset,
      pose: detectedPose,
      x: hasTwoPeople ? 128 : 195,
      y: 355,
      scale: hasTwoPeople ? 0.98 : 1.06,
      skinColor: String(opts.colors?.skinColor || (isFemale ? '#eab68c' : '#e5a97c')),
      hairColor: String(opts.colors?.hairColor || '#18181b'),
      primaryColor: String(opts.colors?.primaryColor || (isFemale ? '#e11d48' : '#2563eb')),
      secondaryColor: String(opts.colors?.secondaryColor || (isFemale ? '#f59e0b' : '#facc15')),
      hasGlasses: Boolean(opts.colors?.hasGlasses ?? (preset === 'nusrat' || preset === 'teacher')),
      hasBeard: Boolean(
        opts.colors?.hasBeard ??
          (preset === 'tamim' || preset === 'teacher' || preset === 'cha_mama' || preset === 'rickshaw_mama')
      ),
      hasBackpack: Boolean(opts.colors?.hasBackpack ?? (preset === 'rafi' || preset === 'nusrat')),
      heldProp,
      emotionEffect,
    },
    secondaryCharacter: {
      enabled: hasTwoPeople,
      preset: secondaryPreset,
      pose: 'talking',
      x: 278,
      y: 358,
      scale: 0.96,
      flipHorizontal: true,
      skinColor: secondaryIsFemale ? '#eab68c' : '#d99b66',
      hairColor: '#18181b',
      primaryColor: secondaryIsFemale ? '#ec4899' : '#0d9488',
      secondaryColor: secondaryIsFemale ? '#fde047' : '#f8fafc',
      heldProp: heldProp === 'tea_cup' ? 'tea_cup' : 'none',
    },
    foregroundProps,
  }
}

async function startServer() {
  const app = express()
  app.use(express.json({ limit: '5mb' }))

  // 1. High-Detail Free Google Gemini AI Bangla Cartoon Panel Generator (~5-7 seconds)
  app.post('/api/gemini/cartoon-image', async (req, res) => {
    const {
      prompt = '',
      setting = 'campus',
      pose = 'idle',
      genre = 'comedy',
      characterName = 'Rafi',
      characterPreset,
      dialogue = '',
      caption = '',
      colors,
    } = req.body ?? {}

    const baseBlueprint = buildSmartDefaultBlueprint({
      prompt: String(prompt),
      dialogue: String(dialogue),
      caption: String(caption),
      setting: String(setting),
      pose: String(pose),
      genre: String(genre),
      characterName: String(characterName),
      characterPreset: characterPreset ? String(characterPreset) : undefined,
      colors: colors && typeof colors === 'object' ? (colors as Record<string, unknown>) : undefined,
    })

    try {
      const ai = getAiClient()

      const artDirectorSystemInstruction = [
        'You are the Master Bangladeshi Cartoon & Webtoon Art Director for GolpoFrame.',
        'Deeply analyze ALL FOUR inputs together: Scene Description (দৃশ্য), Dialogue (সংলাপ), Caption (ক্যাপশন), and Setting (সেটিং).',
        'Return a rich JSON scene blueprint to compose a multi-layered, high-detail Bangladeshi comic panel (viewBox 400x500):',
        '1. Choose the most accurate Bangladeshi environment, skyTheme, and weatherEffect based on the combined meaning of Scene + Dialogue + Caption.',
        '2. Choose expressive primaryPreset, primaryPose, emotionEffect (sweat_drops, anger_vein, hearts, idea_bulb, question_marks, music_notes, shock_bolts, sparkles, tears_fountain), heldProp (tea_cup, umbrella, book, phone, fuchka_plate, guitar, cricket_bat, rose, exam_paper, lantern, biryani_plate, microphone, none), and vibrant Bangladeshi outfit colors.',
        '3. Set hasCompanion = true whenever Scene, Dialogue, or Caption mentions or implies a conversation, 2 people, friends, tea seller, rickshaw puller, family member, or teacher.',
        '4. Select 2-3 foregroundProps (tea_table, biryani_table, exam_desk, laptop_study_desk, stray_cat, potted_flowers, fairy_lights, flying_birds, rooftop_kites, village_pitha) that enrich the story.',
        '5. Provide signboardText in Bangla (2-4 words) fitting the exact scene.',
        '6. In customSvgElements, draw 2-4 crisp decorative cartoon SVG elements (<circle>, <path>, <rect>, <polygon>, <ellipse> with bold comic outline stroke="#1a1423" stroke-width="2.5") in the midground (x: 30..370, y: 90..330) representing specific objects mentioned in Scene/Dialogue/Caption (e.g. kites, lanterns, exam papers flying, food plates, moon, or festival banners). Do NOT draw human stick figures in customSvgElements.',
      ].join('\n')

      const userPromptText = [
        `Scene (দৃশ্য): ${prompt || 'Bangladeshi comic scene'}`,
        `Dialogue (সংলাপ): ${dialogue || 'None'}`,
        `Caption (ক্যাপশন): ${caption || 'None'}`,
        `Selected Setting: ${setting} (auto-detected environment: ${baseBlueprint.environment})`,
        `Selected Pose: ${pose} (auto-detected pose: ${baseBlueprint.primaryCharacter.pose})`,
        `Speaker / Character: ${characterName} (preset: ${characterPreset || baseBlueprint.primaryCharacter.preset})`,
        `Genre: ${genre}`,
      ].join('\n')

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPromptText,
        config: {
          systemInstruction: artDirectorSystemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skyTheme: {
                type: Type.STRING,
                enum: [
                  'golden_sunset',
                  'monsoon_storm',
                  'sunny_dhaka',
                  'starry_night',
                  'neon_evening',
                  'pastel_morning',
                  'dramatic_action',
                  'cozy_indoor',
                ],
              },
              environment: {
                type: Type.STRING,
                enum: [
                  'curzon_campus',
                  'dhaka_rooftop',
                  'tong_tea_stall',
                  'rainy_street',
                  'rickshaw_ride',
                  'classroom_exam',
                  'bedroom_lazy',
                  'hostel_night',
                  'library_study',
                  'tsc_bottola',
                  'cricket_field',
                  'dhaka_bus',
                  'fuchka_cart',
                  'river_nouka',
                  'village_courtyard',
                  'college_gate',
                ],
              },
              weatherEffect: {
                type: Type.STRING,
                enum: [
                  'sunbeams',
                  'heavy_rain',
                  'golden_fireflies',
                  'breeze_leaves',
                  'action_speedlines',
                  'romance_petals',
                  'sparkles',
                  'none',
                ],
              },
              signboardText: { type: Type.STRING },
              primaryPreset: {
                type: Type.STRING,
                enum: [
                  'rafi',
                  'nusrat',
                  'tamim',
                  'teacher',
                  'khala',
                  'guard',
                  'rickshaw_mama',
                  'cha_mama',
                  'ananya',
                  'guitarist',
                  'policeman',
                  'dadi',
                ],
              },
              primaryPose: {
                type: Type.STRING,
                enum: [
                  'idle',
                  'talking',
                  'shocked',
                  'running',
                  'celebrating',
                  'collapsed',
                  'confident',
                  'thinking',
                  'angry',
                  'crying',
                  'whispering',
                  'dancing',
                ],
              },
              emotionEffect: {
                type: Type.STRING,
                enum: [
                  'sweat_drops',
                  'anger_vein',
                  'hearts',
                  'idea_bulb',
                  'question_marks',
                  'music_notes',
                  'shock_bolts',
                  'sparkles',
                  'tears_fountain',
                  'none',
                ],
              },
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              heldProp: {
                type: Type.STRING,
                enum: [
                  'tea_cup',
                  'umbrella',
                  'book',
                  'phone',
                  'fuchka_plate',
                  'guitar',
                  'cricket_bat',
                  'rose',
                  'exam_paper',
                  'lantern',
                  'biryani_plate',
                  'microphone',
                  'none',
                ],
              },
              hasCompanion: { type: Type.BOOLEAN },
              companionPreset: {
                type: Type.STRING,
                enum: [
                  'rafi',
                  'nusrat',
                  'tamim',
                  'teacher',
                  'khala',
                  'guard',
                  'rickshaw_mama',
                  'cha_mama',
                  'ananya',
                  'guitarist',
                  'policeman',
                  'dadi',
                ],
              },
              companionPose: {
                type: Type.STRING,
                enum: [
                  'idle',
                  'talking',
                  'shocked',
                  'running',
                  'celebrating',
                  'collapsed',
                  'confident',
                  'thinking',
                  'angry',
                  'crying',
                  'whispering',
                  'dancing',
                ],
              },
              companionPrimaryColor: { type: Type.STRING },
              companionSecondaryColor: { type: Type.STRING },
              companionHeldProp: {
                type: Type.STRING,
                enum: [
                  'tea_cup',
                  'umbrella',
                  'book',
                  'phone',
                  'fuchka_plate',
                  'guitar',
                  'cricket_bat',
                  'rose',
                  'exam_paper',
                  'lantern',
                  'biryani_plate',
                  'microphone',
                  'none',
                ],
              },
              foregroundProps: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                  enum: [
                    'tea_table',
                    'biryani_table',
                    'exam_desk',
                    'laptop_study_desk',
                    'stray_cat',
                    'potted_flowers',
                    'fairy_lights',
                    'flying_birds',
                    'stack_of_books',
                    'rain_puddles',
                    'clay_lanterns',
                    'rooftop_kites',
                    'village_pitha',
                  ],
                },
              },
              customSvgElements: { type: Type.STRING },
            },
            required: [
              'skyTheme',
              'environment',
              'weatherEffect',
              'signboardText',
              'primaryPreset',
              'primaryPose',
              'emotionEffect',
              'primaryColor',
              'secondaryColor',
              'heldProp',
              'hasCompanion',
              'foregroundProps',
            ],
          },
        },
      })

      const aiData = JSON.parse(response.text || '{}') as Record<string, unknown>

      const mergedBlueprint: BanglaCartoonBlueprint = {
        skyTheme: (aiData.skyTheme as SkyTheme) || baseBlueprint.skyTheme,
        environment: (aiData.environment as BanglaEnvironment) || baseBlueprint.environment,
        weatherEffect: (aiData.weatherEffect as WeatherEffect) || baseBlueprint.weatherEffect,
        signboardText: String(aiData.signboardText || baseBlueprint.signboardText || ''),
        primaryCharacter: {
          ...baseBlueprint.primaryCharacter,
          preset:
            (aiData.primaryPreset as CharacterStyleId) ||
            (characterPreset as CharacterStyleId) ||
            baseBlueprint.primaryCharacter.preset,
          pose: (aiData.primaryPose as CartoonPoseId) || baseBlueprint.primaryCharacter.pose,
          emotionEffect:
            (aiData.emotionEffect as EmotionEffect) || baseBlueprint.primaryCharacter.emotionEffect,
          primaryColor: String(
            colors?.primaryColor || aiData.primaryColor || baseBlueprint.primaryCharacter.primaryColor
          ),
          secondaryColor: String(
            colors?.secondaryColor || aiData.secondaryColor || baseBlueprint.primaryCharacter.secondaryColor
          ),
          heldProp: (aiData.heldProp as HeldProp) || baseBlueprint.primaryCharacter.heldProp,
        },
        secondaryCharacter: {
          ...(baseBlueprint.secondaryCharacter || {
            enabled: false,
            preset: 'nusrat',
            pose: 'talking',
            x: 278,
            y: 358,
            scale: 0.96,
            skinColor: '#eab68c',
            hairColor: '#18181b',
            primaryColor: '#ec4899',
            secondaryColor: '#fde047',
          }),
          enabled: Boolean(aiData.hasCompanion ?? baseBlueprint.secondaryCharacter?.enabled),
          preset:
            (aiData.companionPreset as CharacterStyleId) ||
            baseBlueprint.secondaryCharacter?.preset ||
            'nusrat',
          pose: (aiData.companionPose as CartoonPoseId) || 'talking',
          primaryColor: String(aiData.companionPrimaryColor || '#ec4899'),
          secondaryColor: String(aiData.companionSecondaryColor || '#fde047'),
          heldProp: (aiData.companionHeldProp as HeldProp) || 'none',
        },
        foregroundProps: Array.isArray(aiData.foregroundProps)
          ? (aiData.foregroundProps as ForegroundPropId[])
          : baseBlueprint.foregroundProps,
        customSvgElements:
          typeof aiData.customSvgElements === 'string' ? aiData.customSvgElements : undefined,
      }

      const richSvg = composeBanglaCartoonSvg(mergedBlueprint)
      const base64Svg = Buffer.from(richSvg, 'utf-8').toString('base64')

      return res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        model: 'gemini-3-flash-preview',
      })
    } catch (err) {
      console.warn('Gemini cartoon fallback composer used:', err instanceof Error ? err.message : err)
      const richFallbackSvg = composeBanglaCartoonSvg(baseBlueprint)
      const base64Svg = Buffer.from(richFallbackSvg, 'utf-8').toString('base64')
      return res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        model: 'gemini-bangla-cartoon-composer',
      })
    }
  })

  // 2. Free Google Gemini AI Story Generator Endpoint
  app.post('/api/gemini/story', async (req, res) => {
    try {
      const { system = '', user = '' } = req.body ?? {}
      const ai = getAiClient()

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: String(user),
        config: {
          systemInstruction: String(system),
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          temperature: 0.85,
        },
      })

      return res.json({
        text: response.text || '{}',
        model: 'gemini-3.1-flash-lite',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate story with Gemini AI'
      console.error('Gemini story generation error:', message)
      return res.status(500).json({ error: message })
    }
  })

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    })
    app.use(vite.middlewares)
  } else {
    const distPath = path.join(__dirname, 'dist')
    app.use(express.static(distPath))
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }

  const PORT = Number(process.env.PORT) || 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GolpoFrame server running on http://0.0.0.0:${PORT}`)
  })
}

void startServer()
