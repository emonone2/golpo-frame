import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '../components/Button'
import SaveToDiary from '../components/SaveToDiary'
import PanelArt from '../components/PanelArt'
import { ErrorState, LoadingState } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genres } from '../data/genres'
import { createEntry } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import type { Key, Lang } from '../lib/i18n'
import { go } from '../lib/router'
import { projectFromGenerated, upsertProject } from '../lib/storage'
import { isAiConfigured } from '../lib/story/aiAdapter'
import { checkOptions, generateStory } from '../lib/story/generate'
import type { OptionError } from '../lib/story/generate'
import { MAX_INCIDENT, MAX_PANELS, MIN_PANELS, validateStory } from '../lib/story/schema'
import type { Issue, IssueCode } from '../lib/story/schema'
import type {
  GeneratedStory,
  GenreId,
  HumorStyle,
  StoryCharacter,
  StoryData,
  StoryOptions,
  StoryPanelData,
} from '../types'

interface FormState {
  incident: string
  heroName: string
  genre: GenreId
  humor: HumorStyle
  language: Lang
  panelCount: number
  engine: 'template' | 'ai'
}

const HUMORS: { id: HumorStyle; label: Key }[] = [
  { id: 'witty', label: 'humor_witty' },
  { id: 'slapstick', label: 'humor_slapstick' },
  { id: 'wholesome', label: 'humor_wholesome' },
  { id: 'absurd', label: 'humor_absurd' },
]

const COUNTS = [4, 5, 6, 7, 8]

const ISSUE_KEY: Record<IssueCode, Key> = {
  type: 'issue_empty',
  empty: 'issue_empty',
  too_long: 'issue_too_long',
  count: 'issue_count',
  speaker: 'issue_speaker',
  duplicate: 'issue_duplicate',
}

const FORM_ERR: Record<OptionError, Key> = {
  incident_empty: 'err_incident_empty',
  incident_long: 'err_incident_long',
  panel_count: 'err_panels',
}

const bad = (issue?: Issue) => (issue ? '!border-rose-400' : '')

function Choice({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white'
          : 'border-white/15 text-slate-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  htmlFor,
  issue,
  children,
}: {
  label: string
  htmlFor?: string
  issue?: Issue
  children: ReactNode
}) {
  const { t } = useLang()
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold text-slate-400">
        {label}
      </label>
      {children}
      {issue && (
        <p role="alert" className="mt-1 text-xs text-rose-300">
          {t(ISSUE_KEY[issue.code])}
        </p>
      )}
    </div>
  )
}

export default function Generator() {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { user } = useAuth()
  const aiReady = isAiConfigured()

  const [form, setForm] = useState<FormState>(() => ({
    incident: '',
    heroName: '',
    genre: 'comedy',
    humor: 'witty',
    language: lang,
    panelCount: 6,
    engine: 'template',
  }))
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle')
  const [result, setResult] = useState<GeneratedStory | null>(null)
  const [seed, setSeed] = useState(0)
  const [formError, setFormError] = useState<OptionError | null>(null)
  const [fellBack, setFellBack] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [showIssues, setShowIssues] = useState(false)
  const [saveError, setSaveError] = useState<'invalid' | 'storage' | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishNotice, setPublishNotice] = useState<{ text: string; bad: boolean } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  const setF = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const run = async (nextSeed: number) => {
    const options: StoryOptions = {
      incident: form.incident.trim(),
      heroName: form.heroName.trim(),
      genre: form.genre,
      humor: form.humor,
      language: form.language,
      panelCount: form.panelCount,
      seed: nextSeed,
    }
    const err = checkOptions(options)
    setFormError(err)
    if (err) return

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setPhase('loading')
    try {
      const out = await generateStory(options, form.engine === 'ai', ctrl.signal)
      if (ctrl.signal.aborted) return
      setResult(out.story)
      setSeed(nextSeed)
      setFellBack(out.fellBack)
      setDirty(false)
      setShowIssues(false)
      setSaveError(null)
      setPhase('ready')
    } catch {
      if (!ctrl.signal.aborted) setPhase('error')
    }
  }

  const regenerate = () => {
    if (dirty && !window.confirm(t('confirm_regen'))) return
    void run(seed + 1)
  }

  const startOver = () => {
    abortRef.current?.abort()
    setResult(null)
    setPhase('idle')
    setSeed(0)
    setDirty(false)
    setShowIssues(false)
    setSaveError(null)
  }

  // ---- editing ----
  const edit = (fn: (d: StoryData) => StoryData) => {
    setResult((r) => (r ? { ...r, data: fn(r.data) } : r))
    setDirty(true)
    setSaveError(null)
  }

  const setCharacter = (i: number, patch: Partial<StoryCharacter>) =>
    edit((d) => {
      const old = d.characters[i].name
      const characters = d.characters.map((c, j) => (j === i ? { ...c, ...patch } : c))
      const renamed = patch.name !== undefined && patch.name !== old
      const panels = renamed
        ? d.panels.map((p) => (p.speaker === old ? { ...p, speaker: patch.name as string } : p))
        : d.panels
      return { ...d, characters, panels }
    })

  const setPanel = (i: number, patch: Partial<StoryPanelData>) =>
    edit((d) => ({ ...d, panels: d.panels.map((p, j) => (j === i ? { ...p, ...patch } : p)) }))

  const movePanel = (i: number, dir: -1 | 1) =>
    edit((d) => {
      const j = i + dir
      if (j < 0 || j >= d.panels.length) return d
      const panels = [...d.panels]
      ;[panels[i], panels[j]] = [panels[j], panels[i]]
      return { ...d, panels }
    })

  const removePanel = (i: number) =>
    edit((d) => (d.panels.length <= MIN_PANELS ? d : { ...d, panels: d.panels.filter((_, j) => j !== i) }))

  const addPanel = () =>
    edit((d) =>
      d.panels.length >= MAX_PANELS
        ? d
        : {
            ...d,
            panels: [...d.panels, { scene: '', caption: '', speaker: d.characters[0]?.name ?? '', dialogue: '' }],
          },
    )

  // ---- validation of edits ----
  const validation = useMemo(() => (result ? validateStory(result.data) : null), [result])
  const issues: Issue[] = showIssues && validation && !validation.ok ? validation.issues : []
  const at = (path: string) => issues.find((x) => x.path === path)

  const createComic = () => {
    if (!result) return
    setShowIssues(true)
    const checked = validateStory(result.data)
    if (!checked.ok) {
      setSaveError('invalid')
      return
    }
    try {
      const project = projectFromGenerated({ ...result, data: checked.data })
      upsertProject(project)
      go(`/studio/${project.id}`)
    } catch {
      setSaveError('storage')
    }
  }

  const handlePublish = async () => {
    if (!result) return
    if (!user) {
      window.location.hash = '#/login'
      return
    }
    setShowIssues(true)
    const checked = validateStory(result.data)
    if (!checked.ok) {
      setPublishNotice({
        text: lang === 'bn' ? 'অনুগ্রহ করে লাল চিহ্নিত ঘরগুলো ঠিক করুন।' : t('fix_fields'),
        bad: true,
      })
      return
    }
    setIsPublishing(true)
    setPublishNotice(null)
    try {
      await createEntry({
        ...checked.data,
        incident: result.options.incident.trim().slice(0, MAX_INCIDENT),
        genre: result.options.genre,
        language: result.options.language,
        source: result.source,
        engine: result.engine,
        visibility: 'public',
      })
      setPublishNotice({
        text:
          lang === 'bn'
            ? '🎉 গল্পটি সফলভাবে প্রকাশিত হয়েছে! হোম পেজে নিয়ে যাওয়া হচ্ছে...'
            : '🎉 Story published successfully! Redirecting to Home page...',
        bad: false,
      })
      setTimeout(() => {
        window.location.hash = '#/'
      }, 1000)
    } catch (err) {
      console.error('Publish error:', err)
      setPublishNotice({
        text: tc(errKey(err)),
        bad: true,
      })
      setIsPublishing(false)
    }
  }

  const data = result?.data
  const incidentLen = form.incident.trim().length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">{t('gen_title')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">{t('gen_sub')}</p>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void run(0)
        }}
        className="card space-y-5"
      >
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="incident" className="text-xs font-semibold text-slate-400">
              {t('incident')}
            </label>
            <button
              type="button"
              onClick={() => setF('incident', t('sample_incident'))}
              className="text-xs font-semibold text-fuchsia-300 hover:underline"
            >
              {t('sample_btn')}
            </button>
          </div>
          <textarea
            id="incident"
            rows={4}
            value={form.incident}
            placeholder={t('incident_ph')}
            onChange={(e) => setF('incident', e.target.value)}
            aria-invalid={formError === 'incident_empty' || formError === 'incident_long'}
          />
          <div className="mt-1 flex justify-between gap-3 text-xs">
            <span className="text-rose-300" role={formError ? 'alert' : undefined}>
              {formError ? t(FORM_ERR[formError]) : ''}
            </span>
            <span className={incidentLen > MAX_INCIDENT ? 'text-rose-300' : 'text-slate-500'}>
              {incidentLen}/{MAX_INCIDENT}
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t('hero_name')} htmlFor="hero">
            <input
              id="hero"
              value={form.heroName}
              maxLength={40}
              placeholder={t('hero_name_ph')}
              onChange={(e) => setF('heroName', e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-400">{t('out_lang')}</p>
            <div className="flex flex-wrap gap-2">
              <Choice active={form.language === 'en'} onClick={() => setF('language', 'en')}>
                English
              </Choice>
              <Choice active={form.language === 'bn'} onClick={() => setF('language', 'bn')}>
                বাংলা
              </Choice>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">{t('genre')}</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Choice key={g.id} active={form.genre === g.id} onClick={() => setF('genre', g.id)}>
                {g.emoji} {pick(g.name)}
              </Choice>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400">{t('humor_style')}</p>
            <div className="flex flex-wrap gap-2">
              {HUMORS.map((h) => (
                <Choice key={h.id} active={form.humor === h.id} onClick={() => setF('humor', h.id)}>
                  {t(h.label)}
                </Choice>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold text-slate-400">{t('panel_count')}</p>
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((n) => (
                <Choice key={n} active={form.panelCount === n} onClick={() => setF('panelCount', n)}>
                  {n}
                </Choice>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-slate-400">{t('engine')}</p>
          <div className="flex flex-wrap gap-2">
            <Choice active={form.engine === 'template'} onClick={() => setF('engine', 'template')}>
              🧩 {t('engine_template')}
            </Choice>
            <Choice active={form.engine === 'ai'} disabled={!aiReady} onClick={() => setF('engine', 'ai')}>
              🤖 {t('engine_ai')}
            </Choice>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {form.engine === 'ai' ? t('ai_privacy') : t('template_note')}
          </p>
          {!aiReady && <p className="mt-1 text-xs text-slate-500">{t('ai_unavailable')}</p>}
        </div>

        <Button type="submit" disabled={phase === 'loading'}>
          ✨ {t('generate')}
        </Button>
      </form>

      {phase === 'loading' && <LoadingState label={t('generating')} />}

      {phase === 'error' && (
        <div className="mt-8">
          <ErrorState
            title={t('error_title')}
            message={t('gen_failed')}
            action={<Button onClick={() => void run(seed)}>{t('retry')}</Button>}
          />
        </div>
      )}

      {phase === 'ready' && result && data && (
        <section className="mt-10 space-y-6" aria-label={t('edit_title')}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">{t('edit_title')}</h2>
              <p className="mt-1 text-sm text-slate-400">{t('edit_sub')}</p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                result.source === 'ai'
                  ? 'border-sky-400/50 bg-sky-500/10 text-sky-200'
                  : 'border-amber-400/50 bg-amber-500/10 text-amber-200'
              }`}
            >
              {result.source === 'ai' ? `🤖 ${t('badge_ai')}` : `🧩 ${t('badge_template')}`}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {t('engine_label')}: {result.engine}
          </p>

          {fellBack && (
            <p role="status" className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-200">
              {t('notice_fallback')}
            </p>
          )}
          {saveError && (
            <p role="alert" className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-200">
              {saveError === 'invalid' ? t('fix_fields') : t('save_failed')}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="!bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25"
            >
              🚀 {isPublishing ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'হোম পেজে প্রকাশ করুন (Publish)' : 'Publish to Home')}
            </Button>
            <Button onClick={createComic}>🎬 {t('create_comic')}</Button>
            <Button variant="ghost" onClick={regenerate}>
              🔄 {t('regenerate')}
            </Button>
            <SaveToDiary story={result} />
            <Button variant="ghost" onClick={startOver}>
              {t('start_over')}
            </Button>
          </div>

          {publishNotice && (
            <p
              role="alert"
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${
                publishNotice.bad
                  ? 'border border-rose-500/30 bg-rose-500/20 text-rose-200'
                  : 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-200'
              }`}
            >
              {publishNotice.text}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="card space-y-4">
                <Field label={t('story_title')} htmlFor="s-title" issue={at('title')}>
                  <input
                    id="s-title"
                    value={data.title}
                    className={`!text-lg !font-bold ${bad(at('title'))}`}
                    onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))}
                  />
                </Field>
                <Field label={t('story_summary')} htmlFor="s-summary" issue={at('summary')}>
                  <textarea
                    id="s-summary"
                    rows={3}
                    value={data.summary}
                    className={bad(at('summary'))}
                    onChange={(e) => edit((d) => ({ ...d, summary: e.target.value }))}
                  />
                </Field>
                <Field label={t('story_punchline')} htmlFor="s-punch" issue={at('punchline')}>
                  <textarea
                    id="s-punch"
                    rows={2}
                    value={data.punchline}
                    className={bad(at('punchline'))}
                    onChange={(e) => edit((d) => ({ ...d, punchline: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="card space-y-3">
                <h3 className="font-bold">{t('characters')}</h3>
                {at('characters') && (
                  <p role="alert" className="text-xs text-rose-300">
                    {t(ISSUE_KEY[at('characters')!.code])}
                  </p>
                )}
                {data.characters.map((c, i) => (
                  <div key={i} className="grid gap-3 sm:grid-cols-2">
                    <Field label={t('char_name')} htmlFor={`c-name-${i}`} issue={at(`characters.${i}.name`)}>
                      <input
                        id={`c-name-${i}`}
                        value={c.name}
                        className={bad(at(`characters.${i}.name`))}
                        onChange={(e) => setCharacter(i, { name: e.target.value })}
                      />
                    </Field>
                    <Field label={t('char_role')} htmlFor={`c-role-${i}`} issue={at(`characters.${i}.role`)}>
                      <input
                        id={`c-role-${i}`}
                        value={c.role}
                        className={bad(at(`characters.${i}.role`))}
                        onChange={(e) => setCharacter(i, { role: e.target.value })}
                      />
                    </Field>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold">
                    {t('panels')} ({data.panels.length})
                  </h3>
                  <Button variant="ghost" onClick={addPanel} disabled={data.panels.length >= MAX_PANELS}>
                    + {t('add_panel')}
                  </Button>
                </div>
                {at('panels') && (
                  <p role="alert" className="text-xs text-rose-300">
                    {t(ISSUE_KEY[at('panels')!.code])}
                  </p>
                )}

                {data.panels.map((p, i) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">
                        {t('panel_n')} {i + 1}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => movePanel(i, -1)}
                          disabled={i === 0}
                          aria-label={t('move_up')}
                          title={t('move_up')}
                          className="rounded-lg border border-white/15 px-2 py-1 text-sm hover:bg-white/10 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => movePanel(i, 1)}
                          disabled={i === data.panels.length - 1}
                          aria-label={t('move_down')}
                          title={t('move_down')}
                          className="rounded-lg border border-white/15 px-2 py-1 text-sm hover:bg-white/10 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removePanel(i)}
                          disabled={data.panels.length <= MIN_PANELS}
                          aria-label={t('remove')}
                          title={t('remove')}
                          className="rounded-lg border border-rose-400/40 px-2 py-1 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <Field label={t('scene')} htmlFor={`p-scene-${i}`} issue={at(`panels.${i}.scene`)}>
                      <textarea
                        id={`p-scene-${i}`}
                        rows={3}
                        value={p.scene}
                        className={bad(at(`panels.${i}.scene`))}
                        onChange={(e) => setPanel(i, { scene: e.target.value })}
                      />
                    </Field>
                    <Field label={t('caption')} htmlFor={`p-cap-${i}`} issue={at(`panels.${i}.caption`)}>
                      <textarea
                        id={`p-cap-${i}`}
                        rows={2}
                        value={p.caption}
                        className={bad(at(`panels.${i}.caption`))}
                        onChange={(e) => setPanel(i, { caption: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                      <Field label={t('speaker')} htmlFor={`p-spk-${i}`} issue={at(`panels.${i}.speaker`)}>
                        <select
                          id={`p-spk-${i}`}
                          value={p.speaker}
                          onChange={(e) => setPanel(i, { speaker: e.target.value })}
                          className={`w-full rounded-lg border border-white/15 bg-ink-900 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none ${bad(at(`panels.${i}.speaker`))}`}
                        >
                          {!data.characters.some((c) => c.name === p.speaker) && (
                            <option value={p.speaker}>{p.speaker || '—'}</option>
                          )}
                          {data.characters.map((c, j) => (
                            <option key={j} value={c.name}>
                              {c.name || '—'}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t('dialogue')} htmlFor={`p-dia-${i}`} issue={at(`panels.${i}.dialogue`)}>
                        <textarea
                          id={`p-dia-${i}`}
                          rows={2}
                          value={p.dialogue}
                          className={bad(at(`panels.${i}.dialogue`))}
                          onChange={(e) => setPanel(i, { dialogue: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside aria-label={t('preview')} className="lg:sticky lg:top-20 lg:self-start">
              <h3 className="mb-4 text-lg font-extrabold">{t('preview')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {data.panels.map((p, i) => (
                  <PanelArt
                    key={i}
                    genre={result.options.genre}
                    index={i}
                    caption={p.caption}
                    dialogue={p.dialogue}
                    speaker={p.speaker}
                    scene={p.scene}
                    setting={p.setting}
                    pose={p.pose}
                    sfx={p.sfx}
                  />
                ))}
              </div>
            </aside>
          </div>

          {/* ── Bottom Prominent Publish Bar ── */}
          <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 p-6 backdrop-blur-sm shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  ✨ {lang === 'bn' ? 'হোম পেজে লাইভ শেয়ারিং' : 'Live Home Feed'}
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-white">
                  🚀 {lang === 'bn' ? 'গল্পটি কি সবার সাথে শেয়ার করতে প্রস্তুত?' : 'Ready to share your comic with everyone?'}
                </h3>
                <p className="mt-1 max-w-xl text-sm text-slate-300">
                  {lang === 'bn'
                    ? 'নিচে "হোম পেজে প্রকাশ করুন" বাটনে চাপ দিলে আপনার এই গল্পটি সরাসরি প্ল্যাটফর্মের হোম পেজে যুক্ত হয়ে যাবে এবং অন্য সব নিবন্ধিত ব্যবহারকারী এটি তাদের হোম পেজে পড়তে ও লাইক দিতে পারবেন।'
                    : 'Clicking Publish will immediately feature this comic on the home page for everyone to read, enjoy, and like.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="!bg-emerald-500 hover:!bg-emerald-600 text-white font-extrabold px-6 py-3 text-base shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                >
                  🚀 {isPublishing ? (lang === 'bn' ? 'প্রকাশ হচ্ছে...' : 'Publishing...') : (lang === 'bn' ? 'হোম পেজে প্রকাশ করুন (Publish)' : 'Publish to Home')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
