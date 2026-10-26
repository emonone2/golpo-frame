import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { addComment, deleteComment, listComments } from '../lib/cloud'
import { fmtDate } from '../lib/format'
import { getLocalCommentCounts } from '../lib/localAuth'
import type { StoryComment } from '../types'
import { Button } from './Button'

export function CommentToggleButton({
  open,
  count,
  onClick,
}: {
  open: boolean
  count: number
  onClick: () => void
}) {
  const { lang } = useLang()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
        open
          ? 'border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-200'
          : 'border-white/15 text-slate-300 hover:bg-white/10'
      }`}
    >
      <span aria-hidden>💬</span>
      <span>{lang === 'bn' ? 'কমেন্ট' : 'Comment'}</span>
      <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-fuchsia-300">
        {count}
      </span>
    </button>
  )
}

interface Props {
  storyId: string
  initialCount?: number
  open: boolean
  onCountChange?: (newCount: number) => void
}

export default function StoryCommentsSection({
  storyId,
  initialCount = 0,
  open,
  onCountChange,
}: Props) {
  const { lang } = useLang()
  const { user } = useAuth()
  const [comments, setComments] = useState<StoryComment[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const localCount = getLocalCommentCounts([storyId])[storyId] ?? 0
    if (localCount > initialCount) {
      onCountChange?.(localCount)
    }
  }, [storyId, initialCount, onCountChange])

  useEffect(() => {
    if (!open) return
    let active = true
    setLoading(true)
    listComments(storyId)
      .then((list) => {
        if (!active) return
        setComments(list)
        onCountChange?.(list.length)
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [storyId, open, onCountChange])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || submitting) return
    if (!user) {
      window.location.hash = '#/login'
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const created = await addComment(storyId, trimmed)
      setComments((prev) => {
        const next = [...prev, created]
        onCountChange?.(next.length)
        return next
      })
      setText('')
    } catch {
      setError(
        lang === 'bn'
          ? 'কমেন্ট পোস্ট করা যায়নি। আবার চেষ্টা করুন।'
          : 'Could not post comment. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => {
        const next = prev.filter((c) => c.id !== commentId)
        onCountChange?.(next.length)
        return next
      })
    } catch {
      // ignore delete error
    }
  }

  return (
    <section
      aria-label={lang === 'bn' ? 'মন্তব্যসমূহ' : 'Comments'}
      className="mt-2 rounded-2xl border border-white/10 bg-ink-950/80 p-3.5"
    >
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">
          💬 {lang === 'bn' ? `মন্তব্যসমূহ (${comments.length})` : `Comments (${comments.length})`}
        </h4>
      </div>

      {/* Comment List */}
      {loading ? (
        <p className="py-3 text-center text-xs text-slate-400">
          {lang === 'bn' ? 'কমেন্ট লোড হচ্ছে...' : 'Loading comments...'}
        </p>
      ) : comments.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-400">
          {lang === 'bn'
            ? 'এখনও কোনো কমেন্ট নেই। প্রথম কমেন্টটি আপনিই করুন!'
            : 'No comments yet. Be the first to comment!'}
        </p>
      ) : (
        <ul className="mb-3 max-h-60 space-y-2.5 overflow-y-auto pr-1">
          {comments.map((c) => {
            const isMine = user?.id === c.userId
            return (
              <li
                key={c.id}
                className="rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-[10px] font-extrabold text-ink-950">
                      {(c.displayName || c.username || 'U').charAt(0).toUpperCase()}
                    </span>
                    <a
                      href={`#/u/${c.username}`}
                      className="font-bold text-slate-100 hover:underline"
                    >
                      @{c.username}
                    </a>
                    <span className="text-[10px] text-slate-500">
                      · {fmtDate(c.createdAt, lang)}
                    </span>
                  </div>
                  {isMine && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(c.id)}
                      title={lang === 'bn' ? 'কমেন্ট মুছুন' : 'Delete comment'}
                      className="text-[11px] font-semibold text-rose-300 hover:text-rose-200"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-slate-200 leading-relaxed">
                  {c.content}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'এই গল্পটি সম্পর্কে আপনার মতামত বা কমেন্ট লিখুন...'
                  : 'Write a comment on this comic story...'
              }
              aria-label={lang === 'bn' ? 'কমেন্ট লিখুন' : 'Write a comment'}
              className="!py-1.5 !text-xs"
            />
            <Button
              type="submit"
              disabled={submitting || !text.trim()}
              className="shrink-0 !px-3.5 !py-1.5 !text-xs font-bold"
            >
              {submitting
                ? lang === 'bn'
                  ? 'যাচ্ছে...'
                  : 'Posting...'
                : lang === 'bn'
                  ? 'কমেন্ট করুন'
                  : 'Post'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-xs text-rose-300">
              {error}
            </p>
          )}
        </form>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-xs">
          <span className="text-slate-300">
            {lang === 'bn' ? 'কমেন্ট করতে আপনার অ্যাকাউন্টে লগইন করুন' : 'Sign in to post a comment'}
          </span>
          <a href="#/login" className="font-bold text-amber-300 hover:underline">
            {lang === 'bn' ? 'সাইন ইন →' : 'Sign in →'}
          </a>
        </div>
      )}
    </section>
  )
}
