import { useEffect, useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import CloudNotConfigured from '../components/CloudNotConfigured'
import LikeButton from '../components/LikeButton'
import PanelArt from '../components/PanelArt'
import ShareStoryMenu from '../components/ShareStoryMenu'
import SourceBadge from '../components/SourceBadge'
import { ErrorState, LoadingState } from '../components/States'
import StoryCommentsSection, { CommentToggleButton } from '../components/StoryCommentsSection'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genreById } from '../data/genres'
import { copyPublicToDiary, getInitialPublicStoryById, getPublicStory, recordShare } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import { fmtDate } from '../lib/format'
import { useLikes } from '../lib/useLikes'
import type { PublicStory } from '../types'

type State = { status: 'loading' } | { status: 'error' } | { status: 'notfound' } | { status: 'ready'; story: PublicStory }

export default function StoryDetail({ id }: { id?: string }) {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { configured, user } = useAuth()
  const initialStory = getInitialPublicStoryById(id)
  const [state, setState] = useState<State>(() =>
    initialStory ? { status: 'ready', story: initialStory } : { status: 'loading' }
  )
  const [attempt, setAttempt] = useState(0)
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [saveMsg, setSaveMsg] = useState<{ text: string; bad: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(true)
  const [commentCount, setCommentCount] = useState<number>(() => initialStory?.commentCount ?? 0)

  const story = state.status === 'ready' ? state.story : null
  const likes = useLikes(user?.id, story ? [story.id] : [])

  useEffect(() => {
    if (!configured) return
    if (!id) {
      setState({ status: 'notfound' })
      return
    }
    let active = true
    const cached = getInitialPublicStoryById(id)
    if (cached) {
      setState({ status: 'ready', story: cached })
      setCommentCount(cached.commentCount ?? 0)
    } else {
      setState({ status: 'loading' })
    }
    getPublicStory(id)
      .then((s) => {
        if (active) {
          setState(s ? { status: 'ready', story: s } : cached ? { status: 'ready', story: cached } : { status: 'notfound' })
          if (s) setCommentCount(s.commentCount ?? 0)
        }
      })
      .catch(() => {
        if (active && !cached) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [id, configured, attempt])

  if (!configured) {
    return (
      <div className="px-4 py-16">
        <CloudNotConfigured />
      </div>
    )
  }
  if (state.status === 'loading') return <LoadingState label={t('loading')} />
  if (state.status === 'error') {
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
  if (state.status === 'notfound' || !story) {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={tc('story_notfound_title')}
          message={tc('story_notfound_msg')}
          action={<ButtonLink href="#/gallery">{tc('back_gallery')}</ButtonLink>}
        />
      </div>
    )
  }

  const g = genreById[story.genre] || genreById.action
  const url = `${window.location.origin}${window.location.pathname}#/story/${story.id}`
  const mine = user?.id === story.ownerId

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      await recordShare(story.id, 'copy_link')
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  const saveCopy = async () => {
    setSaving(true)
    setSaveMsg(null)
    try {
      await copyPublicToDiary(story, tc('copy_note', { name: story.username }))
      await recordShare(story.id, 'diary_repost')
      setSaveMsg({ text: tc('copy_saved'), bad: false })
    } catch (e) {
      setSaveMsg({ text: tc(errKey(e)), bad: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <a href="#/gallery" className="text-sm font-semibold text-fuchsia-300 hover:underline">
        ← {tc('back_gallery')}
      </a>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
          {g.emoji} {pick(g.name)} · {story.panels.length} {t('panels_count')}
        </p>
        <h1 className="mt-1 break-words text-3xl font-extrabold leading-tight">{story.title}</h1>
        <p className="mt-2 text-sm text-slate-400">
          <a href={`#/u/${story.username}`} className="font-semibold text-slate-200 hover:underline">
            {tc('by_user', { name: story.username })}
          </a>{' '}
          · {fmtDate(story.publishedAt, lang)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <SourceBadge source={story.source} />
          <LikeButton
            storyId={story.id}
            liked={likes.liked.has(story.id)}
            count={likes.counts[story.id] ?? story.likeCount}
            onChange={(l, c) => likes.apply(story.id, l, c)}
          />
          <CommentToggleButton
            open={commentsOpen}
            count={commentCount}
            onClick={() => setCommentsOpen((prev) => !prev)}
          />
          <ShareStoryMenu
            storyId={story.id}
            storyTitle={story.title}
            initialCount={story.shareCount ?? 0}
            story={story}
          />
        </div>
      </header>

      <p className="mt-6 text-slate-200">{story.summary}</p>

      {story.characters.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2 text-xs">
          {story.characters.map((c, i) => (
            <li key={i} className="rounded-full border border-white/15 px-3 py-1 text-slate-300">
              <span className="font-semibold text-white">{c.name}</span> · {c.role}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {story.panels.map((p, i) => (
          <PanelArt
            key={i}
            genre={story.genre}
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

      <blockquote className="card mt-8 border-fuchsia-400/30 text-center text-lg font-bold">“{story.punchline}”</blockquote>

      {/* Comments Section on Story Detail */}
      <div className="mt-8">
        <StoryCommentsSection
          storyId={story.id}
          initialCount={commentCount}
          open={commentsOpen}
          onCountChange={setCommentCount}
        />
      </div>

      <section className="card mt-8 space-y-3" aria-label={tc('share')}>
        <h2 className="font-bold">{tc('share')}</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input readOnly value={url} aria-label={tc('copy_link')} onFocus={(e) => e.currentTarget.select()} />
          <Button variant="ghost" onClick={() => void copyLink()} className="shrink-0">
            {tc('copy_link')}
          </Button>
        </div>
        {copied === 'ok' && (
          <p role="status" className="text-sm text-emerald-300">
            {tc('copied')}
          </p>
        )}
        {copied === 'fail' && (
          <p role="alert" className="text-sm text-amber-300">
            {tc('copy_failed')}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
          <ButtonLink href={`#/studio/${story.id}`} variant="secondary">
            🎨 {lang === 'bn' ? 'স্টুডিওতে এডিট করুন' : 'Edit in Studio'}
          </ButtonLink>
          {mine ? (
            <ButtonLink href={`#/diary/${story.id}`} variant="ghost">
              {tc('edit_in_diary')}
            </ButtonLink>
          ) : user ? (
            <Button variant="ghost" onClick={() => void saveCopy()} disabled={saving}>
              {saving ? tc('saving') : tc('save_copy')}
            </Button>
          ) : (
            <ButtonLink href="#/login" variant="ghost">
              {tc('signin_to_save_copy')}
            </ButtonLink>
          )}
          {saveMsg && (
            <span role={saveMsg.bad ? 'alert' : 'status'} className={`text-sm ${saveMsg.bad ? 'text-rose-300' : 'text-emerald-300'}`}>
              {saveMsg.text}{' '}
              {!saveMsg.bad && (
                <a href="#/diary" className="underline">
                  {tc('view_in_diary')}
                </a>
              )}
            </span>
          )}
        </div>
      </section>
    </div>
  )
}
