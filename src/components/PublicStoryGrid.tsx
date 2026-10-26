import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { getInitialPublicStories, listPublic } from '../lib/cloud'
import { useCT } from '../lib/communityI18n'
import { useLikes } from '../lib/useLikes'
import type { GenreId, PublicStory } from '../types'
import { Button } from './Button'
import { EmptyState, ErrorState, LoadingState } from './States'
import StoryGalleryCard from './StoryGalleryCard'

const PAGE = 12

interface Props {
  genre?: GenreId
  username?: string
  empty: { title: string; message: string; action?: ReactNode }
}

/** Paginated public story list with likes. Used by the gallery and creator profiles. */
export default function PublicStoryGrid({ genre, username, empty }: Props) {
  const { t } = useLang()
  const tc = useCT()
  const { user } = useAuth()
  const initialPage = getInitialPublicStories({ offset: 0, limit: PAGE, genre, username })
  const [items, setItems] = useState<PublicStory[]>(() => initialPage.items)
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>(() =>
    initialPage.items.length > 0 ? 'ready' : 'loading'
  )
  const [more, setMore] = useState<boolean>(() => initialPage.hasMore)
  const [moreBusy, setMoreBusy] = useState(false)
  const [moreError, setMoreError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const likes = useLikes(user?.id, items.map((i) => i.id))

  useEffect(() => {
    let active = true
    const cached = getInitialPublicStories({ offset: 0, limit: PAGE, genre, username })
    if (cached.items.length > 0) {
      setItems(cached.items)
      setMore(cached.hasMore)
      setPhase('ready')
    } else {
      setPhase('loading')
    }

    listPublic({ offset: 0, limit: PAGE, genre, username })
      .then((page) => {
        if (!active) return
        setItems(page.items)
        setMore(page.hasMore)
        setPhase('ready')
      })
      .catch(() => {
        if (active && cached.items.length === 0) setPhase('error')
      })
    return () => {
      active = false
    }
  }, [genre, username, attempt])

  const loadMore = async () => {
    setMoreBusy(true)
    setMoreError(false)
    try {
      const page = await listPublic({ offset: items.length, limit: PAGE, genre, username })
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))]
      })
      setMore(page.hasMore)
    } catch {
      setMoreError(true)
    } finally {
      setMoreBusy(false)
    }
  }

  if (phase === 'loading' && items.length === 0) return <LoadingState label={t('loading')} />
  if (phase === 'error') {
    return (
      <ErrorState
        title={t('error_title')}
        message={tc('load_failed')}
        action={<Button onClick={() => setAttempt((a) => a + 1)}>{t('retry')}</Button>}
      />
    )
  }
  if (items.length === 0) {
    return <EmptyState emoji="🖼️" title={empty.title} message={empty.message} action={empty.action} />
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <StoryGalleryCard
            key={s.id}
            story={s}
            liked={likes.liked.has(s.id)}
            count={likes.counts[s.id] ?? s.likeCount}
            onLike={likes.apply}
          />
        ))}
      </div>
      {moreError && (
        <p role="alert" className="mt-4 text-center text-sm text-rose-300">
          {tc('load_failed')}
        </p>
      )}
      {more && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => void loadMore()} disabled={moreBusy}>
            {moreBusy ? tc('loading_more') : tc('load_more')}
          </Button>
        </div>
      )}
    </div>
  )
}
