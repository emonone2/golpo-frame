import { useCT } from '../lib/communityI18n'
import type { Visibility } from '../types'

interface Props {
  value: Visibility
  canPublish: boolean
  /** Shown when publishing is not possible right now. */
  blockedReason?: string
  busy?: boolean
  compact?: boolean
  onChange: (v: Visibility) => void
}

export default function VisibilityControl({ value, canPublish, blockedReason, busy, compact, onChange }: Props) {
  const tc = useCT()

  const choose = (v: Visibility) => {
    if (v === value || busy) return
    if (v === 'public' && !window.confirm(tc('confirm_publish'))) return
    onChange(v)
  }

  const seg = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
      active ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
    }`

  const blocked = value === 'private' && !canPublish

  return (
    <div>
      <div role="group" aria-label={tc('visibility')} className="inline-flex rounded-full border border-white/15 p-1">
        <button type="button" aria-pressed={value === 'private'} disabled={busy} onClick={() => choose('private')} className={seg(value === 'private')}>
          🔒 {tc('private')}
        </button>
        <button
          type="button"
          aria-pressed={value === 'public'}
          disabled={busy || blocked}
          onClick={() => choose('public')}
          className={seg(value === 'public')}
        >
          🌍 {tc('public')}
        </button>
      </div>
      {!compact && (
        <p className="mt-1 text-xs text-slate-400">{value === 'public' ? tc('vis_public_help') : tc('vis_private_help')}</p>
      )}
      {blocked && blockedReason && <p className="mt-1 text-xs text-amber-300">{blockedReason}</p>}
    </div>
  )
}
