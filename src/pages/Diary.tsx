import { useEffect, useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import CloudNotConfigured from '../components/CloudNotConfigured'
import SourceBadge from '../components/SourceBadge'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import VisibilityControl from '../components/VisibilityControl'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genreById } from '../data/genres'
import {
  deleteEntry,
  duplicateEntry,
  fetchPublicLikeCounts,
  listDiary,
  setEntryVisibility,
} from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import { fmtDate } from '../lib/format'
import { listLocalDiaryEntries } from '../lib/localAuth'
import type { DiaryEntry, Visibility } from '../types'

const PAGE = 20
type Filter = 'all' | 'private' | 'public'

interface CardProps {
  entry: DiaryEntry
  busy: boolean
  likeCount: number | undefined
  onDuplicate: () => void
  onDelete: () => void
  onVisibility: (v: Visibility) => void
}

function EntryCard({ entry: e, busy, likeCount, onDuplicate, onDelete, onVisibility }: CardProps) {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const g = genreById[e.genre]
  const isNote = e.panels.length === 0
  const body = e.summary || e.incident

  return (
    <li className="relative animate-fade-up">
      <span
        aria-hidden
        className="absolute -left-[1.875rem] top-6 h-3 w-3 rounded-full border-2 border-ink-950 bg-fuchsia-400"
      />
      <article className="card-interactive space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>{fmtDate(e.createdAt, lang)}</span>
          <span aria-hidden>·</span>
          <span>
            {g.emoji} {pick(g.name)}
          </span>
          {isNote ? (
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-semibold text-slate-200">
              📝 {tc('kind_note')}
            </span>
          ) : (
            <>
              <span aria-hidden>·</span>
              <span>
                {e.panels.length} {t('panels_count')}
              </span>
              <SourceBadge source={e.source} />
            </>
          )}
          {e.visibility === 'public' && likeCount !== undefined && <span>♥ {likeCount}</span>}
        </div>

        <h3 className="break-words text-lg font-bold leading-snug">
          <a href={`#/diary/${e.id}`} className="hover:underline">
            {e.title}
          </a>
        </h3>
        {body && <p className="line-clamp-3 text-sm text-slate-300">{body}</p>}

        <VisibilityControl
          compact
          value={e.visibility}
          canPublish={e.panels.length >= 4}
          blockedReason={tc('need_panels')}
          busy={busy}
          onChange={onVisibility}
        />

        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`#/diary/${e.id}`} variant="ghost">
            {tc('edit')}
          </ButtonLink>
          <Button variant="ghost" onClick={onDuplicate} disabled={busy}>
            {tc('duplicate')}
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={busy}>
            {t('delete')}
          </Button>
          {e.visibility === 'public' && (
            <ButtonLink href={`#/story/${e.id}`} variant="ghost">
              🌍 {tc('view_public')}
            </ButtonLink>
          )}
        </div>
      </article>
    </li>
  )
}

export default function Diary() {
  const { t, lang } = useLang()
  const tc = useCT()
  const { configured, loading: authLoading, user } = useAuth()
  const uid = user?.id
  const initialLocal = uid ? listLocalDiaryEntries(uid, 0, PAGE) : { items: [], hasMore: false }

  const [items, setItems] = useState<DiaryEntry[]>(() => initialLocal.items)
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>(() =>
    initialLocal.items.length > 0 ? 'ready' : 'loading'
  )
  const [more, setMore] = useState<boolean>(() => initialLocal.hasMore)
  const [moreBusy, setMoreBusy] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [banner, setBanner] = useState<{ text: string; bad: boolean } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [likes, setLikes] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!uid) return
    let active = true
    const localPage = listLocalDiaryEntries(uid, 0, PAGE)
    if (localPage.items.length > 0) {
      setItems(localPage.items)
      setMore(localPage.hasMore)
      setPhase('ready')
    } else {
      setPhase('loading')
    }
    listDiary(0, PAGE)
      .then((page) => {
        if (!active) return
        setItems(page.items)
        setMore(page.hasMore)
        setPhase('ready')
      })
      .catch(() => {
        if (active && localPage.items.length === 0) setPhase('error')
      })
    return () => {
      active = false
    }
  }, [uid, attempt])

  const publicKey = items.filter((i) => i.visibility === 'public').map((i) => i.id).join(',')
  useEffect(() => {
    if (publicKey === '') return
    let active = true
    fetchPublicLikeCounts(publicKey.split(','))
      .then((c) => {
        if (active) setLikes(c)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [publicKey])

  const loadMore = async () => {
    setMoreBusy(true)
    try {
      const page = await listDiary(items.length, PAGE)
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))]
      })
      setMore(page.hasMore)
    } catch (e) {
      setBanner({ text: tc(errKey(e)), bad: true })
    } finally {
      setMoreBusy(false)
    }
  }

  const run = async (id: string, fn: () => Promise<string>) => {
    setBusyId(id)
    setBanner(null)
    try {
      setBanner({ text: await fn(), bad: false })
    } catch (e) {
      setBanner({ text: tc(errKey(e)), bad: true })
    } finally {
      setBusyId(null)
    }
  }

  const duplicate = (entry: DiaryEntry) =>
    run(entry.id, async () => {
      const copy = await duplicateEntry(entry, tc('copy_suffix'))
      setItems((prev) => [copy, ...prev])
      return tc('dup_done')
    })

  const remove = (entry: DiaryEntry) => {
    if (!window.confirm(tc('confirm_delete_entry'))) return
    return run(entry.id, async () => {
      await deleteEntry(entry.id)
      setItems((prev) => prev.filter((i) => i.id !== entry.id))
      return tc('deleted_ok')
    })
  }

  const changeVisibility = (entry: DiaryEntry, v: Visibility) =>
    run(entry.id, async () => {
      const updated = await setEntryVisibility(entry.id, v)
      setItems((prev) => prev.map((i) => (i.id === entry.id ? updated : i)))
      return v === 'public' ? tc('published_ok') : tc('unpublished_ok')
    })

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

  const shown = items.filter((i) => filter === 'all' || i.visibility === filter)
  const groups: { label: string; items: DiaryEntry[] }[] = []
  for (const e of shown) {
    const label = fmtDate(e.createdAt, lang, { month: 'long', year: 'numeric' })
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  }

  const filters: { id: Filter; text: string }[] = [
    { id: 'all', text: tc('filter_all') },
    { id: 'private', text: `🔒 ${tc('filter_private')}` },
    { id: 'public', text: `🌍 ${tc('filter_public')}` },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{tc('diary_title')}</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">{tc('diary_sub')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="#/diary/new">+ {tc('new_note')}</ButtonLink>
          <ButtonLink href="#/generate" variant="ghost">
            {t('cta_generate')}
          </ButtonLink>
        </div>
      </div>

      <div role="group" aria-label={tc('visibility')} className="mb-6 inline-flex rounded-full border border-white/15 p-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === f.id ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.text}
          </button>
        ))}
      </div>

      {banner && (
        <p
          role={banner.bad ? 'alert' : 'status'}
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${banner.bad ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-200'}`}
        >
          {banner.text}
        </p>
      )}

      {phase === 'loading' && <LoadingState label={t('loading')} />}
      {phase === 'error' && (
        <ErrorState
          title={t('error_title')}
          message={tc('load_failed')}
          action={<Button onClick={() => setAttempt((a) => a + 1)}>{t('retry')}</Button>}
        />
      )}

      {phase === 'ready' && items.length === 0 && (
        <EmptyState
          emoji="📔"
          title={tc('diary_empty_title')}
          message={tc('diary_empty_msg')}
          action={
            <>
              <ButtonLink href="#/diary/new">{tc('new_note')}</ButtonLink>
              <ButtonLink href="#/generate" variant="ghost">
                {t('cta_generate')}
              </ButtonLink>
            </>
          }
        />
      )}

      {phase === 'ready' && items.length > 0 && shown.length === 0 && (
        <p className="card text-center text-sm text-slate-400">{tc('diary_filter_empty')}</p>
      )}

      {phase === 'ready' &&
        groups.map((grp) => (
          <section key={grp.label} className="mb-8" aria-label={grp.label}>
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-fuchsia-300">{grp.label}</h2>
            <ol className="ml-1 space-y-4 border-l border-white/15 pl-6">
              {grp.items.map((e) => (
                <EntryCard
                  key={e.id}
                  entry={e}
                  busy={busyId === e.id}
                  likeCount={likes[e.id]}
                  onDuplicate={() => void duplicate(e)}
                  onDelete={() => void remove(e)}
                  onVisibility={(v) => void changeVisibility(e, v)}
                />
              ))}
            </ol>
          </section>
        ))}

      {phase === 'ready' && more && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => void loadMore()} disabled={moreBusy}>
            {moreBusy ? tc('loading_more') : tc('load_more')}
          </Button>
        </div>
      )}
    </div>
  )
}
