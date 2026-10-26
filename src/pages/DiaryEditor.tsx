import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Button, ButtonLink } from '../components/Button'
import CloudNotConfigured from '../components/CloudNotConfigured'
import PanelArt from '../components/PanelArt'
import SourceBadge from '../components/SourceBadge'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import VisibilityControl from '../components/VisibilityControl'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genres } from '../data/genres'
import { createEntry, getEntry, isUuid, setEntryVisibility, updateEntry } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import type { Key } from '../lib/i18n'
import { go } from '../lib/router'
import { LIMITS, MAX_INCIDENT, MAX_PANELS, MIN_PANELS, validateStory } from '../lib/story/schema'
import type { Issue, IssueCode } from '../lib/story/schema'
import type { DiaryEntry, EntryContent, GenreId, StoryCharacter, StoryPanelData, Visibility } from '../types'

interface Draft {
  title: string
  incident: string
  summary: string
  punchline: string
  genre: GenreId
  characters: StoryCharacter[]
  panels: StoryPanelData[]
}

type Load = 'loading' | 'error' | 'notfound' | 'ready'

const ISSUE_KEY: Record<IssueCode, Key> = {
  type: 'issue_empty',
  empty: 'issue_empty',
  too_long: 'issue_too_long',
  count: 'issue_count',
  speaker: 'issue_speaker',
  duplicate: 'issue_duplicate',
}

const blank = (): Draft => ({
  title: '',
  incident: '',
  summary: '',
  punchline: '',
  genre: 'comedy',
  characters: [],
  panels: [],
})

const fromEntry = (e: DiaryEntry): Draft => ({
  title: e.title,
  incident: e.incident,
  summary: e.summary,
  punchline: e.punchline,
  genre: e.genre,
  characters: e.characters,
  panels: e.panels,
})

const bad = (issue?: Issue) => (issue ? '!border-rose-400' : '')

function Field({ label, htmlFor, issue, children }: { label: string; htmlFor?: string; issue?: Issue; children: ReactNode }) {
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

export default function DiaryEditor({ id }: { id: string }) {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { configured, loading: authLoading, user } = useAuth()
  const uid = user?.id
  const isNew = id === 'new'

  const [load, setLoad] = useState<Load>(isNew ? 'ready' : 'loading')
  const [entry, setEntry] = useState<DiaryEntry | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [dirty, setDirty] = useState(false)
  const [showIssues, setShowIssues] = useState(false)
  const [saving, setSaving] = useState(false)
  const [visBusy, setVisBusy] = useState(false)
  const [notice, setNotice] = useState<{ text: string; bad: boolean } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (isNew || !uid) return
    if (!isUuid(id)) {
      setLoad('notfound')
      return
    }
    let active = true
    setLoad('loading')
    getEntry(id)
      .then((e) => {
        if (!active) return
        if (!e) {
          setLoad('notfound')
          return
        }
        setEntry(e)
        setDraft(fromEntry(e))
        setDirty(false)
        setLoad('ready')
      })
      .catch(() => {
        if (active) setLoad('error')
      })
    return () => {
      active = false
    }
  }, [id, uid, isNew, attempt])

  const isNote = draft.panels.length === 0

  const issues = useMemo<Issue[]>(() => {
    const out: Issue[] = []
    const incident = draft.incident.trim()
    if (incident.length > MAX_INCIDENT) out.push({ path: 'incident', code: 'too_long' })
    if (isNote) {
      const title = draft.title.trim()
      if (!title) out.push({ path: 'title', code: 'empty' })
      else if (title.length > LIMITS.title) out.push({ path: 'title', code: 'too_long' })
      if (!incident) out.push({ path: 'incident', code: 'empty' })
    } else {
      const v = validateStory({
        title: draft.title,
        summary: draft.summary,
        punchline: draft.punchline,
        characters: draft.characters,
        panels: draft.panels,
      })
      if (!v.ok) out.push(...v.issues)
    }
    return out
  }, [draft, isNote])

  const shown = showIssues ? issues : []
  const at = (path: string) => shown.find((x) => x.path === path)

  const edit = (fn: (d: Draft) => Draft) => {
    setDraft(fn)
    setDirty(true)
    setNotice(null)
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
        : { ...d, panels: [...d.panels, { scene: '', caption: '', speaker: d.characters[0]?.name ?? '', dialogue: '' }] },
    )

  const save = async () => {
    setShowIssues(true)
    if (issues.length > 0) return
    setSaving(true)
    setNotice(null)
    try {
      const base: Omit<EntryContent, 'title' | 'summary' | 'punchline' | 'characters' | 'panels'> = {
        incident: draft.incident.trim(),
        genre: draft.genre,
        language: entry?.language ?? lang,
        source: entry?.source ?? 'manual',
        engine: entry?.engine ?? '',
      }
      let content: EntryContent
      if (isNote) {
        content = { ...base, title: draft.title.trim(), summary: '', punchline: '', characters: [], panels: [] }
      } else {
        const v = validateStory({
          title: draft.title,
          summary: draft.summary,
          punchline: draft.punchline,
          characters: draft.characters,
          panels: draft.panels,
        })
        if (!v.ok) return
        content = { ...base, ...v.data }
      }

      if (isNew) {
        const created = await createEntry({ ...content, visibility: 'private' })
        go(`/diary/${created.id}`)
        return
      }
      const updated = await updateEntry(id, content)
      setEntry(updated)
      setDraft(fromEntry(updated))
      setDirty(false)
      setShowIssues(false)
      setNotice({ text: tc('entry_saved'), bad: false })
    } catch (e) {
      setNotice({ text: tc(errKey(e)), bad: true })
    } finally {
      setSaving(false)
    }
  }

  const changeVisibility = async (v: Visibility) => {
    if (!entry) return
    setVisBusy(true)
    setNotice(null)
    try {
      setEntry(await setEntryVisibility(entry.id, v))
      setNotice({ text: v === 'public' ? tc('published_ok') : tc('unpublished_ok'), bad: false })
    } catch (e) {
      setNotice({ text: tc(errKey(e)), bad: true })
    } finally {
      setVisBusy(false)
    }
  }

  // ---- states ----
  if (!configured) {
    return (
      <div className="px-4 py-16">
        <CloudNotConfigured />
      </div>
    )
  }
  if (authLoading) return <LoadingState label={t('loading')} />
  if (!user) {
    return (
      <div className="px-4 py-16">
        <EmptyState
          emoji="🔐"
          title={tc('signin_required_title')}
          message={tc('signin_required_msg')}
          action={<ButtonLink href="#/login">{tc('sign_in')}</ButtonLink>}
        />
      </div>
    )
  }
  if (load === 'loading') return <LoadingState label={t('loading')} />
  if (load === 'error') {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={t('error_title')}
          message={tc('load_failed')}
          action={<Button onClick={() => setAttempt((a) => a + 1)}>{t('retry')}</Button>}
        />
      </div>
    )
  }
  if (load === 'notfound') {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={t('error_title')}
          message={tc('err_not_found')}
          action={<ButtonLink href="#/diary">{tc('back_diary')}</ButtonLink>}
        />
      </div>
    )
  }

  const canPublish = !!entry && entry.panels.length >= MIN_PANELS && !dirty

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <a href="#/diary" className="text-sm font-semibold text-fuchsia-300 hover:underline">
        ← {tc('back_diary')}
      </a>

      <div className="mb-6 mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{isNew ? tc('editor_new') : tc('editor_edit')}</h1>
          {entry && !isNote && (
            <div className="mt-2">
              <SourceBadge source={entry.source} />
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && <span className="text-xs text-amber-300">{t('unsaved')}</span>}
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? tc('saving') : t('save')}
          </Button>
        </div>
      </div>

      {notice && (
        <p
          role={notice.bad ? 'alert' : 'status'}
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${notice.bad ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-200'}`}
        >
          {notice.text}
        </p>
      )}

      {entry && (
        <div className="card mb-6">
          <VisibilityControl
            value={entry.visibility}
            canPublish={canPublish}
            blockedReason={dirty ? tc('save_first') : tc('need_panels')}
            busy={visBusy || dirty}
            onChange={(v) => void changeVisibility(v)}
          />
          {entry.visibility === 'public' && (
            <p className="mt-2 text-xs text-amber-300">
              {tc('public_edit_note')}{' '}
              <a href={`#/story/${entry.id}`} className="underline">
                {tc('view_public')}
              </a>
            </p>
          )}
          {dirty && entry.visibility === 'private' && <p className="mt-2 text-xs text-slate-500">{tc('save_first')}</p>}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card space-y-4">
            <Field label={t('story_title')} htmlFor="e-title" issue={at('title')}>
              <input
                id="e-title"
                value={draft.title}
                className={`!text-lg !font-bold ${bad(at('title'))}`}
                onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))}
              />
            </Field>

            <Field label={tc('incident_private')} htmlFor="e-incident" issue={at('incident')}>
              <textarea
                id="e-incident"
                rows={isNote ? 6 : 3}
                value={draft.incident}
                className={bad(at('incident'))}
                onChange={(e) => edit((d) => ({ ...d, incident: e.target.value }))}
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {draft.incident.trim().length}/{MAX_INCIDENT}
              </p>
            </Field>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400">{t('genre')}</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={draft.genre === g.id}
                    onClick={() => edit((d) => ({ ...d, genre: g.id }))}
                    className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                      draft.genre === g.id
                        ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white'
                        : 'border-white/15 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {g.emoji} {pick(g.name)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isNote ? (
            <div className="card flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">{tc('note_hint')}</p>
              <ButtonLink href="#/generate" variant="ghost">
                {t('cta_generate')}
              </ButtonLink>
            </div>
          ) : (
            <>
              <div className="card space-y-4">
                <Field label={t('story_summary')} htmlFor="e-summary" issue={at('summary')}>
                  <textarea
                    id="e-summary"
                    rows={3}
                    value={draft.summary}
                    className={bad(at('summary'))}
                    onChange={(e) => edit((d) => ({ ...d, summary: e.target.value }))}
                  />
                </Field>
                <Field label={t('story_punchline')} htmlFor="e-punch" issue={at('punchline')}>
                  <textarea
                    id="e-punch"
                    rows={2}
                    value={draft.punchline}
                    className={bad(at('punchline'))}
                    onChange={(e) => edit((d) => ({ ...d, punchline: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="card space-y-3">
                <h2 className="font-bold">{t('characters')}</h2>
                {at('characters') && (
                  <p role="alert" className="text-xs text-rose-300">
                    {t(ISSUE_KEY[at('characters')!.code])}
                  </p>
                )}
                {draft.characters.map((c, i) => (
                  <div key={i} className="grid gap-3 sm:grid-cols-2">
                    <Field label={t('char_name')} htmlFor={`e-cn-${i}`} issue={at(`characters.${i}.name`)}>
                      <input
                        id={`e-cn-${i}`}
                        value={c.name}
                        className={bad(at(`characters.${i}.name`))}
                        onChange={(e) => setCharacter(i, { name: e.target.value })}
                      />
                    </Field>
                    <Field label={t('char_role')} htmlFor={`e-cr-${i}`} issue={at(`characters.${i}.role`)}>
                      <input
                        id={`e-cr-${i}`}
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
                  <h2 className="text-lg font-extrabold">
                    {t('panels')} ({draft.panels.length})
                  </h2>
                  <Button variant="ghost" onClick={addPanel} disabled={draft.panels.length >= MAX_PANELS}>
                    + {t('add_panel')}
                  </Button>
                </div>
                {at('panels') && (
                  <p role="alert" className="text-xs text-rose-300">
                    {t(ISSUE_KEY[at('panels')!.code])}
                  </p>
                )}

                {draft.panels.map((p, i) => (
                  <div key={i} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">
                        {t('panel_n')} {i + 1}
                      </h3>
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
                          disabled={i === draft.panels.length - 1}
                          aria-label={t('move_down')}
                          title={t('move_down')}
                          className="rounded-lg border border-white/15 px-2 py-1 text-sm hover:bg-white/10 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removePanel(i)}
                          disabled={draft.panels.length <= MIN_PANELS}
                          aria-label={t('remove')}
                          title={t('remove')}
                          className="rounded-lg border border-rose-400/40 px-2 py-1 text-sm text-rose-300 hover:bg-rose-500/10 disabled:opacity-30"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <Field label={t('scene')} htmlFor={`e-scene-${i}`} issue={at(`panels.${i}.scene`)}>
                      <textarea
                        id={`e-scene-${i}`}
                        rows={3}
                        value={p.scene}
                        className={bad(at(`panels.${i}.scene`))}
                        onChange={(e) => setPanel(i, { scene: e.target.value })}
                      />
                    </Field>
                    <Field label={t('caption')} htmlFor={`e-cap-${i}`} issue={at(`panels.${i}.caption`)}>
                      <textarea
                        id={`e-cap-${i}`}
                        rows={2}
                        value={p.caption}
                        className={bad(at(`panels.${i}.caption`))}
                        onChange={(e) => setPanel(i, { caption: e.target.value })}
                      />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-[12rem_1fr]">
                      <Field label={t('speaker')} htmlFor={`e-spk-${i}`} issue={at(`panels.${i}.speaker`)}>
                        <select
                          id={`e-spk-${i}`}
                          value={p.speaker}
                          onChange={(e) => setPanel(i, { speaker: e.target.value })}
                          className={`w-full rounded-lg border border-white/15 bg-ink-900 px-3 py-2 text-sm text-slate-100 focus:border-fuchsia-400 focus:outline-none ${bad(at(`panels.${i}.speaker`))}`}
                        >
                          {!draft.characters.some((c) => c.name === p.speaker) && (
                            <option value={p.speaker}>{p.speaker || '—'}</option>
                          )}
                          {draft.characters.map((c, j) => (
                            <option key={j} value={c.name}>
                              {c.name || '—'}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label={t('dialogue')} htmlFor={`e-dia-${i}`} issue={at(`panels.${i}.dialogue`)}>
                        <textarea
                          id={`e-dia-${i}`}
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
            </>
          )}
        </div>

        {!isNote && (
          <aside aria-label={t('preview')} className="lg:sticky lg:top-20 lg:self-start">
            <h2 className="mb-4 text-lg font-extrabold">{t('preview')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {draft.panels.map((p, i) => (
                <PanelArt
                  key={i}
                  genre={draft.genre}
                  index={i}
                  caption={p.caption}
                  dialogue={p.dialogue}
                  speaker={p.speaker}
                  scene={p.scene}
                  setting={p.setting}
                  pose={p.pose}
                  characterPreset={p.characterPreset}
                  colors={p.colors}
                  sfx={p.sfx}
                  imageUrl={p.imageUrl}
                  bubbleStyle={p.bubbleStyle}
                  bubblePosition={p.bubblePosition}
                  tailDirection={p.tailDirection}
                  fontSize={p.fontSize}
                  captionPosition={p.captionPosition}
                />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
