import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { copyPublicToDiary, recordShare } from '../lib/cloud'
import { getLocalShareCounts } from '../lib/localAuth'
import type { PublicStory, SharePlatform } from '../types'

interface Props {
  storyId: string
  storyTitle: string
  initialCount?: number
  story?: PublicStory
  onShareCountChange?: (newCount: number) => void
}

export default function ShareStoryMenu({
  storyId,
  storyTitle,
  initialCount = 0,
  story,
  onShareCountChange,
}: Props) {
  const { lang } = useLang()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState<number>(() => {
    const local = getLocalShareCounts([storyId])[storyId] ?? 0
    return Math.max(initialCount, local)
  })
  const [feedback, setFeedback] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const local = getLocalShareCounts([storyId])[storyId] ?? 0
    setCount((prev) => Math.max(prev, initialCount, local))
  }, [storyId, initialCount])

  useEffect(() => {
    if (!open) return
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const storyUrl = `${window.location.origin}${window.location.pathname}#/story/${storyId}`

  const handleShare = async (platform: SharePlatform) => {
    if (busy) return
    setBusy(true)
    setFeedback(null)

    try {
      const shareText = `📖 "${storyTitle}" — GolpoFrame কমিক গল্পটি পড়ুন: ${storyUrl}`

      if (platform === 'copy_link') {
        try {
          await navigator.clipboard.writeText(storyUrl)
        } catch {
          // fallback if clipboard blocked
        }
      } else if (platform === 'facebook' || platform === 'whatsapp' || platform === 'twitter') {
        try {
          await navigator.clipboard.writeText(shareText)
        } catch {
          // fallback
        }
      } else if (platform === 'diary_repost' && story && user) {
        await copyPublicToDiary(
          story,
          lang === 'bn'
            ? `@${story.username}-এর গল্প থেকে শেয়ার ও সংরক্ষণ করা হয়েছে।`
            : `Shared & saved from @${story.username}'s story.`
        )
      }

      const nextCount = await recordShare(storyId, platform)
      setCount(nextCount)
      onShareCountChange?.(nextCount)

      if (platform === 'copy_link') {
        setFeedback(lang === 'bn' ? '✅ লিংক কপি ও শেয়ার হয়েছে!' : '✅ Link copied & shared!')
      } else if (platform === 'diary_repost') {
        setFeedback(lang === 'bn' ? '✅ ডায়েরিতে রিপোস্ট হয়েছে!' : '✅ Reposted to diary!')
      } else if (platform === 'whatsapp') {
        setFeedback(
          lang === 'bn'
            ? '✅ WhatsApp শেয়ার মেসেজ কপি ও রেকর্ড হয়েছে!'
            : '✅ WhatsApp share text copied & recorded!'
        )
      } else if (platform === 'facebook') {
        setFeedback(
          lang === 'bn'
            ? '✅ Facebook শেয়ার লিংক কপি ও রেকর্ড হয়েছে!'
            : '✅ Facebook share link copied & recorded!'
        )
      } else {
        setFeedback(lang === 'bn' ? '✅ শেয়ার সম্পন্ন হয়েছে!' : '✅ Shared successfully!')
      }

      setTimeout(() => {
        setFeedback(null)
        setOpen(false)
      }, 1500)
    } catch {
      setFeedback(lang === 'bn' ? '⚠️ শেয়ার করতে সমস্যা হয়েছে' : '⚠️ Could not share')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-semibold transition ${
          open
            ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
            : 'border-white/15 text-slate-300 hover:bg-white/10'
        }`}
      >
        <span aria-hidden>🔗</span>
        <span>{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-bold text-emerald-300">
          {count}
        </span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-64 rounded-2xl border border-white/15 bg-ink-900/95 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="text-xs font-bold text-slate-200">
              🔗 {lang === 'bn' ? 'গল্পটি শেয়ার করুন' : 'Share this story'}
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">
              {count} {lang === 'bn' ? 'বার শেয়ার' : 'shares'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleShare('copy_link')}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              <span>📋</span>
              <span>{lang === 'bn' ? 'গল্পের লিংক কপি করুন' : 'Copy Story Link'}</span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void handleShare('facebook')}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold text-slate-100 transition hover:border-blue-400/40 hover:bg-blue-500/10"
            >
              <span>📘</span>
              <span>{lang === 'bn' ? 'Facebook-এ শেয়ার করুন' : 'Share on Facebook'}</span>
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void handleShare('whatsapp')}
              className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold text-slate-100 transition hover:border-emerald-400/40 hover:bg-emerald-500/10"
            >
              <span>💬</span>
              <span>{lang === 'bn' ? 'WhatsApp-এ শেয়ার করুন' : 'Share on WhatsApp'}</span>
            </button>

            {story && user && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleShare('diary_repost')}
                className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left font-semibold text-amber-200 transition hover:border-amber-400/40 hover:bg-amber-500/10"
              >
                <span>📔</span>
                <span>
                  {lang === 'bn' ? 'ডায়েরিতে রিপোস্ট ও সেভ করুন' : 'Repost & Save to Diary'}
                </span>
              </button>
            )}
          </div>

          {feedback && (
            <p
              role="status"
              className="mt-2 rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-center text-xs font-semibold text-emerald-200"
            >
              {feedback}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
