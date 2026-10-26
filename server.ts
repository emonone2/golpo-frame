import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai'
import {
  buildSmartDefaultBlueprint,
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
} from './src/lib/image/banglaCartoonComposer.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  })
}

const ACTIVE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
]

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
      variationSeed,
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
      variationSeed: typeof variationSeed === 'number' ? variationSeed : Date.now(),
    })

    try {
      const ai = getAiClient()

      const artDirectorSystemInstruction = [
        'You are the Master Bangladeshi Cartoon & Webtoon Art Director for GolpoFrame.',
        'Deeply analyze ALL FOUR inputs together (including Bangla, Banglish like "akta nodi thakbe", or English): Scene Description (দৃশ্য), Dialogue (সংলাপ), Caption (ক্যাপশন), and Setting (সেটিং).',
        'Return a rich JSON scene blueprint to compose a multi-layered, high-detail Bangladeshi comic panel (viewBox 400x500):',
        '1. Choose the most accurate Bangladeshi environment (e.g., river_nouka for nodi/nouka/river/water, village_courtyard for gram/pahar/village, rainy_street for bristi/rain, dhaka_rooftop for chhad/rooftop, tong_tea_stall for cha/tong/biryani, etc.), skyTheme, and weatherEffect based on the Scene Description.',
        '2. Choose expressive primaryPreset, primaryPose, emotionEffect, heldProp, and vibrant Bangladeshi outfit colors.',
        '3. Set hasCompanion = true whenever Scene, Dialogue, or Caption mentions or implies 2 people, conversation, friends, boatman, tea seller, rickshaw puller, family member, or teacher.',
        '4. Select 2-3 foregroundProps that enrich the story.',
        '5. Provide signboardText in Bangla (2-4 words) fitting the exact scene.',
        '6. In customSvgElements, draw 3-6 detailed cartoon SVG elements (<circle>, <path>, <rect>, <polygon>, <ellipse>, <g> with bold comic outline stroke="#1a1423" stroke-width="2.5") in the midground (x: 20..380, y: 70..340) that directly illustrate the specific objects, animals, nature, boats, hills, trees, vehicles, or actions described in the user Scene Description (দৃশ্য). Do NOT draw human stick figures in customSvgElements.',
      ].join('\n')

      const userPromptText = [
        `Scene Description (দৃশ্যের বর্ণনা - HIGHEST PRIORITY): ${prompt || 'Bangladeshi comic scene'}`,
        `Dialogue (সংলাপ): ${dialogue || 'None'}`,
        `Caption (ক্যাপশন): ${caption || 'None'}`,
        `Auto-detected environment from text: ${baseBlueprint.environment}`,
        `Selected Setting: ${setting}`,
        `Selected Pose: ${pose} (auto-detected pose: ${baseBlueprint.primaryCharacter.pose})`,
        `Speaker / Character: ${characterName} (preset: ${characterPreset || baseBlueprint.primaryCharacter.preset})`,
        `Genre: ${genre}`,
      ].join('\n')

      const responseSchema = {
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
      }

      let responseText = ''
      let usedModel = ACTIVE_GEMINI_MODELS[0]
      for (const candidateModel of ACTIVE_GEMINI_MODELS) {
        try {
          const response = await Promise.race([
            ai.models.generateContent({
              model: candidateModel,
              contents: userPromptText,
              config: {
                systemInstruction: artDirectorSystemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.LOW,
                },
              },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Gemini model timeout')), 3000)
            ),
          ])
          if (response.text) {
            responseText = response.text
            usedModel = candidateModel
            break
          }
        } catch {
          // Try next active model in the fallback chain
          continue
        }
      }

      if (!responseText) {
        throw new Error('All Gemini models returned empty response')
      }

      const aiData = JSON.parse(responseText) as Record<string, unknown>

      // If text explicitly detected a non-default environment (like river_nouka for "akta nodi thakbe"), keep it if AI returned curzon_campus
      const resolvedEnvironment: BanglaEnvironment =
        baseBlueprint.environment !== 'curzon_campus' && aiData.environment === 'curzon_campus'
          ? baseBlueprint.environment
          : (aiData.environment as BanglaEnvironment) || baseBlueprint.environment

      const combinedCustomSvg = [
        baseBlueprint.customSvgElements || '',
        typeof aiData.customSvgElements === 'string' ? aiData.customSvgElements : '',
      ]
        .filter(Boolean)
        .join('\n')

      const mergedBlueprint: BanglaCartoonBlueprint = {
        skyTheme: (aiData.skyTheme as SkyTheme) || baseBlueprint.skyTheme,
        environment: resolvedEnvironment,
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
        customSvgElements: combinedCustomSvg || undefined,
      }

      const richSvg = composeBanglaCartoonSvg(mergedBlueprint)
      const base64Svg = Buffer.from(richSvg, 'utf-8').toString('base64')

      return res.json({
        imageUrl: `data:image/svg+xml;base64,${base64Svg}`,
        model: usedModel,
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

      let responseText = ''
      let usedModel = 'gemini-3.1-flash-lite'
      for (const candidateModel of ACTIVE_GEMINI_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model: candidateModel,
            contents: String(user),
            config: {
              systemInstruction: String(system),
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              temperature: 0.85,
            },
          })
          if (response.text) {
            responseText = response.text
            usedModel = candidateModel
            break
          }
        } catch {
          // Try next model
        }
      }

      return res.json({
        text: responseText || '{}',
        model: usedModel,
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
