import type { GeneratedStory, StoryOptions } from '../../types'
import { buildPrompt, getAiModel, parseModelJson } from './aiAdapter'
import { MAX_INCIDENT, MAX_PANELS, MIN_PANELS, validateStory } from './schema'
import { generateFromTemplate, TEMPLATE_ENGINE } from './templateGenerator'

export type OptionError = 'incident_empty' | 'incident_long' | 'panel_count'

export function checkOptions(o: StoryOptions): OptionError | null {
  const n = o.incident.trim().length
  if (n === 0) return 'incident_empty'
  if (n > MAX_INCIDENT) return 'incident_long'
  if (!Number.isInteger(o.panelCount) || o.panelCount < MIN_PANELS || o.panelCount > MAX_PANELS) {
    return 'panel_count'
  }
  return null
}

export interface GenerateResult {
  story: GeneratedStory
  /** True when AI was requested but the template was used instead. */
  fellBack: boolean
}

const AI_TIMEOUT_MS = 25000

export async function generateStory(
  options: StoryOptions,
  useAi: boolean,
  signal?: AbortSignal,
): Promise<GenerateResult> {
  if (useAi) {
    const model = getAiModel()
    if (model) {
      const ctrl = new AbortController()
      const timer = window.setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS)
      const onAbort = () => ctrl.abort()
      signal?.addEventListener('abort', onAbort)
      try {
        const raw = await model.complete(buildPrompt(options), ctrl.signal)
        const checked = validateStory(parseModelJson(raw), options.panelCount)
        if (checked.ok) {
          return { story: { source: 'ai', engine: model.name, options, data: checked.data }, fellBack: false }
        }
      } catch (err) {
        if (signal?.aborted) throw err
        // Network error, timeout, bad JSON: fall through to the template.
      } finally {
        window.clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
      }
    }
  }

  const checked = validateStory(generateFromTemplate(options), options.panelCount)
  if (!checked.ok) throw new Error('Template output failed validation')
  return {
    story: { source: 'template', engine: TEMPLATE_ENGINE, options, data: checked.data },
    fellBack: useAi,
  }
}
