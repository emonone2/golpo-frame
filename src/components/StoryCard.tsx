import { useState } from 'react'
import { useLang } from '../context/LangContext'
import { genreById } from '../data/genres'
import { getLocalCommentCounts } from '../lib/localAuth'
import { go } from '../lib/router'
import { projectFromStory, upsertProject } from '../lib/storage'
import type { DemoStory } from '../types'
import { Button } from './Button'
import PanelArt from './PanelArt'
import ShareStoryMenu from './ShareStoryMenu'
import StoryCommentsSection, { CommentToggleButton } from './StoryCommentsSection'

export default function StoryCard({ story }: { story: DemoStory }) {
  const { t, pick, lang } = useLang()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [commentCount, setCommentCount] = useState<number>(
    () => getLocalCommentCounts([story.id])[story.id] ?? 0
  )

  const g = genreById[story.genre] || genreById.action

  const remix = () => {
    try {
      const project = projectFromStory(story, lang)
      upsertProject(project)
      go(`/studio/${project.id}`)
    } catch {
      setError(true)
    }
  }

  return (
    <article className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-fuchsia-300">
            {g.emoji} {pick(g.name)} · {story.panels.length} {t('panels_count')}
          </span>
          <h3 className="mt-1 text-lg font-bold">{pick(story.title)}</h3>
        </div>
      </div>
      <p className="text-sm text-slate-400">{pick(story.synopsis)}</p>

      {open && (
        <div className={`grid grid-cols-1 gap-3 ${story.panels.length > 3 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
          {story.panels.map((p, i) => (
            <PanelArt
              key={i}
              genre={story.genre}
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
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {t('save_failed')}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <CommentToggleButton
            open={commentsOpen}
            count={commentCount}
            onClick={() => setCommentsOpen((prev) => !prev)}
          />
          <ShareStoryMenu storyId={story.id} storyTitle={pick(story.title)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? t('hide') : t('read')}
          </Button>
          <Button onClick={remix}>{t('remix')}</Button>
        </div>
      </div>

      <StoryCommentsSection
        storyId={story.id}
        initialCount={commentCount}
        open={commentsOpen}
        onCountChange={setCommentCount}
      />
    </article>
  )
}
