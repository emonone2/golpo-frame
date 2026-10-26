import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { genreById } from '../data/genres'
import { useCT } from '../lib/communityI18n'
import { fmtDate } from '../lib/format'
import { getLocalCommentCounts } from '../lib/localAuth'
import type { PublicStory } from '../types'
import LikeButton from './LikeButton'
import PanelArt from './PanelArt'
import ShareStoryMenu from './ShareStoryMenu'
import SourceBadge from './SourceBadge'
import StoryCommentsSection, { CommentToggleButton } from './StoryCommentsSection'

interface Props {
  story: PublicStory
  liked: boolean
  count: number
  onLike: (id: string, liked: boolean, count: number) => void
}

export default function StoryGalleryCard({ story, liked, count, onLike }: Props) {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const g = genreById[story.genre] || genreById.action
  const [expanded, setExpanded] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState<number>(() => {
    const local = getLocalCommentCounts([story.id])[story.id] ?? 0
    return Math.max(story.commentCount ?? 0, local)
  })

  const visiblePanels = expanded ? story.panels : story.panels.slice(0, 2)
  const hasMorePanels = story.panels.length > 2

  return (
    <article className="card-interactive animate-fade-up flex flex-col gap-3">
      {story.panels.length > 0 ? (
        <div className="space-y-2">
          <div
            className={`grid gap-2.5 ${
              visiblePanels.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {visiblePanels.map((p, i) => (
              <a
                key={i}
                href={`#/story/${story.id}`}
                className="group block overflow-hidden rounded-xl transition-transform duration-200 ease-out hover:scale-[1.02]"
              >
                <PanelArt
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
              </a>
            ))}
          </div>

          {hasMorePanels && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-white/10"
            >
              {expanded
                ? lang === 'bn'
                  ? '▲ সংক্ষিপ্ত করুন'
                  : '▲ Show less'
                : lang === 'bn'
                  ? `▼ সব ${story.panels.length}টি প্যানেল ও ছবি দেখুন`
                  : `▼ View all ${story.panels.length} panels & art`}
            </button>
          )}
        </div>
      ) : (
        <div className={`relative h-24 overflow-hidden rounded-xl bg-gradient-to-br ${g.gradient}`} aria-hidden>
          <div className="halftone absolute inset-0" />
          <span className="absolute right-3 top-2 text-5xl">{g.emoji}</span>
        </div>
      )}

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
          {g.emoji} {pick(g.name)} · {story.panels.length} {t('panels_count')}
        </p>
        <h3 className="mt-1 break-words text-lg font-bold leading-snug">
          <a href={`#/story/${story.id}`} className="hover:underline focus:outline-none focus-visible:underline">
            {story.title}
          </a>
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          <a href={`#/u/${story.username}`} className="font-semibold text-slate-200 hover:underline">
            {tc('by_user', { name: story.username })}
          </a>{' '}
          · {fmtDate(story.publishedAt, lang)}
        </p>
      </div>

      <p className="line-clamp-3 text-sm text-slate-300">{story.summary}</p>
      <SourceBadge source={story.source} />

      {/* Social Action Bar: Like, Comment, Share */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <LikeButton
            storyId={story.id}
            liked={liked}
            count={count}
            onChange={(l, c) => onLike(story.id, l, c)}
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

        <div className="flex items-center gap-3">
          <a
            href={`#/studio/${story.id}`}
            className="text-xs font-semibold text-amber-300 hover:underline"
          >
            🎨 {lang === 'bn' ? 'স্টুডিও' : 'Studio'}
          </a>
          <a href={`#/story/${story.id}`} className="text-sm font-semibold text-fuchsia-300 hover:underline">
            {tc('read_story')} →
          </a>
        </div>
      </div>

      {/* Expandable Comments Section */}
      <StoryCommentsSection
        storyId={story.id}
        initialCount={commentCount}
        open={commentsOpen}
        onCountChange={setCommentCount}
      />
    </article>
  )
}
