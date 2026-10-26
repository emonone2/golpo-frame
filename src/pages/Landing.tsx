import { useEffect, useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import GenreCard from '../components/GenreCard'
import PanelArt from '../components/PanelArt'
import { LoadingState } from '../components/States'
import StoryCard from '../components/StoryCard'
import StoryGalleryCard from '../components/StoryGalleryCard'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genres } from '../data/genres'
import { demoStories } from '../data/stories'
import { getInitialPublicStories, listPublic } from '../lib/cloud'
import { useCT } from '../lib/communityI18n'
import { useLikes } from '../lib/useLikes'
import type { GenreId, PublicStory } from '../types'

export default function Landing() {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { user, profile, configured } = useAuth()

  const [genreFilter, setGenreFilter] = useState<GenreId | 'all'>('all')
  const initialFeed = getInitialPublicStories({ offset: 0, limit: 9 })

  // Community public stories feed — initialized immediately from cache/local so page renders in 0ms
  const [communityStories, setCommunityStories] = useState<PublicStory[]>(() => initialFeed.items)
  const [communityLoading, setCommunityLoading] = useState<boolean>(
    () => initialFeed.items.length === 0
  )
  const [communityHasMore, setCommunityHasMore] = useState<boolean>(() => initialFeed.hasMore)
  const [loadingMore, setLoadingMore] = useState(false)

  const likes = useLikes(
    user?.id,
    communityStories.map((s) => s.id)
  )

  useEffect(() => {
    let active = true
    const targetGenre = genreFilter === 'all' ? undefined : genreFilter
    const cached = getInitialPublicStories({ offset: 0, limit: 9, genre: targetGenre })

    if (cached.items.length > 0) {
      setCommunityStories(cached.items)
      setCommunityHasMore(cached.hasMore)
      setCommunityLoading(false)
    } else {
      setCommunityLoading(true)
    }

    listPublic({
      offset: 0,
      limit: 9,
      genre: targetGenre,
    })
      .then((page) => {
        if (!active) return
        setCommunityStories(page.items)
        setCommunityHasMore(page.hasMore)
        setCommunityLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.warn('Could not load community stories for home page:', err)
        if (cached.items.length === 0) setCommunityStories([])
        setCommunityLoading(false)
      })

    return () => {
      active = false
    }
  }, [configured, genreFilter])

  const handleLoadMore = async () => {
    if (loadingMore || !communityHasMore) return
    setLoadingMore(true)
    try {
      const page = await listPublic({
        offset: communityStories.length,
        limit: 6,
        genre: genreFilter === 'all' ? undefined : genreFilter,
      })
      setCommunityStories((prev) => {
        const existing = new Set(prev.map((s) => s.id))
        return [...prev, ...page.items.filter((s) => !existing.has(s.id))]
      })
      setCommunityHasMore(page.hasMore)
    } catch (err) {
      console.error('Failed to load more stories:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const hero = demoStories[0]
  const steps = [
    { n: 1, title: t('step1_t'), desc: t('step1_d') },
    { n: 2, title: t('step2_t'), desc: t('step2_d') },
    { n: 3, title: t('step3_t'), desc: t('step3_d') },
  ]

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${
      active
        ? 'border-amber-400 bg-amber-400/20 text-amber-200 shadow-sm shadow-amber-400/20 scale-[1.02]'
        : 'border-white/15 text-slate-300 hover:-translate-y-0.5 hover:bg-white/10'
    }`

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* ── Logged In User Greeting Banner ── */}
      {user && (
        <section className="animate-scale-in mt-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/10 to-amber-500/10 p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'bn' ? 'লগইন স্ট্যাটাস' : 'Logged in'}
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-white">
                {tc('home_user_welcome', {
                  name: profile?.username || user.email?.split('@')[0] || 'User',
                })}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="#/generate" variant="secondary" className="!py-1.5 !text-xs font-bold">
                ✍️ {lang === 'bn' ? 'নতুন গল্প বানাও' : 'New Story'}
              </ButtonLink>
              <ButtonLink href="#/diary" variant="ghost" className="!py-1.5 !text-xs font-bold">
                📔 {tc('nav_diary')}
              </ButtonLink>
              <ButtonLink href="#/studio/new/action" variant="ghost" className="!py-1.5 !text-xs font-bold">
                🎨 {lang === 'bn' ? 'কমিক স্টুডিও' : 'Studio'}
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* ── Hero Section ── */}
      <section className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
        <div className="animate-fade-up">
          <span className="inline-block rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200">
            {t('hero_badge')}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{t('hero_title')}</h1>
          <p className="mt-4 max-w-md text-slate-300">{t('hero_sub')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="#/studio/new/action">{t('cta_start')}</ButtonLink>
            <ButtonLink href="#/generate" variant="ghost">
              {t('cta_generate')}
            </ButtonLink>
            <ButtonLink href="#/dashboard" variant="ghost">
              {t('cta_dashboard')}
            </ButtonLink>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3" aria-hidden>
          {hero.panels.map((p, i) => (
            <div
              key={i}
              className={`transition-transform duration-300 hover:scale-[1.03] ${
                i === 1 ? 'mt-6 animate-float-delayed' : 'animate-float'
              }`}
            >
              <PanelArt
                genre={hero.genre}
                index={i}
                caption={pick(p.caption)}
                dialogue={pick(p.dialogue)}
                speaker={p.speaker ? pick(p.speaker) : undefined}
                setting={p.setting}
                pose={p.pose}
                sfx={p.sfx ? pick(p.sfx) : undefined}
                bubbleStyle={p.bubbleStyle}
                bubblePosition={p.bubblePosition}
                tailDirection={p.tailDirection}
                captionPosition={p.captionPosition}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── 🌟 COMMUNITY STORIES SECTION (সবার শেয়ার করা গল্পসমূহ) ── */}
      <section id="community-stories" className="border-t border-white/10 py-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
              🔥 {tc('home_community_badge')}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-white">{tc('home_community_title')}</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{tc('home_community_sub')}</p>
          </div>
          <ButtonLink href="#/gallery" variant="ghost" className="!text-xs font-bold">
            {tc('home_view_all_gallery')} →
          </ButtonLink>
        </div>

        {/* Genre Filter Chips */}
        {configured && (
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label={tc('all_genres')}>
            <button
              type="button"
              aria-pressed={genreFilter === 'all'}
              onClick={() => setGenreFilter('all')}
              className={chip(genreFilter === 'all')}
            >
              ✨ {tc('all_genres')}
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={genreFilter === g.id}
                onClick={() => setGenreFilter(g.id)}
                className={chip(genreFilter === g.id)}
              >
                {g.emoji} {pick(g.name)}
              </button>
            ))}
          </div>
        )}

        {/* Community Story Cards */}
        {communityLoading ? (
          <div className="py-12">
            <LoadingState label={lang === 'bn' ? 'কমিউনিটির গল্প লোড হচ্ছে...' : 'Loading community stories...'} />
          </div>
        ) : communityStories.length > 0 ? (
          <div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {communityStories.map((s) => (
                <StoryGalleryCard
                  key={s.id}
                  story={s}
                  liked={likes.liked.has(s.id)}
                  count={likes.counts[s.id] ?? s.likeCount}
                  onLike={likes.apply}
                />
              ))}
            </div>

            {/* Load more or explore full gallery buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {communityHasMore && (
                <Button onClick={handleLoadMore} disabled={loadingMore} variant="secondary">
                  {loadingMore ? tc('loading_more') : tc('load_more')}
                </Button>
              )}
              <ButtonLink href="#/gallery" variant="ghost">
                🖼️ {tc('home_view_all_gallery')} ({communityStories.length}+)
              </ButtonLink>
            </div>
          </div>
        ) : (
          /* Empty state / Fallback when no public stories have been shared yet */
          <div className="space-y-8">
            <div className="rounded-2xl border border-dashed border-white/20 bg-ink-900/60 p-8 text-center">
              <span className="text-4xl">📖✨</span>
              <h3 className="mt-3 text-lg font-bold text-white">{tc('gallery_empty_title')}</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{tc('home_empty_prompt')}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <ButtonLink href="#/generate">✍️ {lang === 'bn' ? 'প্রথম গল্পটি তৈরি করুন' : 'Create First Story'}</ButtonLink>
                <ButtonLink href="#/diary" variant="ghost">
                  📔 {tc('publish_cta')}
                </ButtonLink>
              </div>
            </div>

            {/* Show Demo Stories so the page is never empty */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-300">
                  💡 {lang === 'bn' ? 'ডেমো কমিক গল্প (উদাহরণ)' : 'Sample Demo Comics'}
                </h3>
                <p className="text-xs text-slate-400">{t('demo_sub')}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {demoStories.map((s) => (
                  <StoryCard key={s.id} story={s} />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Genres Selection Section ── */}
      <section className="py-10">
        <h2 className="text-2xl font-extrabold">{t('genres_title')}</h2>
        <p className="mb-6 mt-1 text-sm text-slate-400">{t('genres_sub')}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {genres.map((g) => (
            <GenreCard key={g.id} genre={g} />
          ))}
        </div>
      </section>

      {/* ── How It Works Steps ── */}
      <section className="py-10">
        <h2 className="mb-6 text-2xl font-extrabold">{t('how_title')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="card">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-extrabold text-ink-950">
                {s.n}
              </span>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom Call To Action Band ── */}
      <section className="my-10 rounded-3xl bg-gradient-to-r from-fuchsia-600 to-amber-500 p-8 text-center">
        <h2 className="text-2xl font-extrabold text-white">{t('cta_band_title')}</h2>
        <div className="mt-5">
          <ButtonLink href="#/studio/new/fantasy" className="!bg-ink-950 !bg-none text-white">
            {t('cta_start')}
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
