import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { setLike } from '../lib/cloud'
import { useCT } from '../lib/communityI18n'

interface Props {
  storyId: string
  liked: boolean
  count: number
  onChange: (liked: boolean, count: number) => void
}

const cls = (liked: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-60 ${
    liked ? 'border-rose-400/60 bg-rose-500/15 text-rose-200' : 'border-white/15 text-slate-300 hover:bg-white/10'
  }`

export default function LikeButton({ storyId, liked, count, onChange }: Props) {
  const tc = useCT()
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  // Signed-out visitors go to the sign-in page. The server enforces this too.
  if (!user) {
    return (
      <a href="#/login" title={tc('like_signin')} aria-label={tc('like_signin')} className={cls(false)}>
        <span aria-hidden>♡</span> {count}
      </a>
    )
  }

  const click = async () => {
    setBusy(true)
    setFailed(false)
    const next = !liked
    onChange(next, Math.max(0, count + (next ? 1 : -1))) // optimistic
    try {
      onChange(next, await setLike(storyId, next))
    } catch {
      onChange(liked, count) // revert
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button type="button" aria-pressed={liked} disabled={busy} onClick={() => void click()} aria-label={liked ? tc('unlike') : tc('like')} className={cls(liked)}>
        <span aria-hidden>{liked ? '♥' : '♡'}</span> {count}
      </button>
      {failed && (
        <span role="alert" className="mt-1 text-xs text-rose-300">
          {tc('like_failed')}
        </span>
      )}
    </span>
  )
}
