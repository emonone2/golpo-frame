import type { ReactNode } from 'react'

export function LoadingState({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-slate-300">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-fuchsia-400" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

interface StateProps {
  emoji: string
  title: string
  message: string
  action?: ReactNode
}

export function EmptyState({ emoji, title, message, action }: StateProps) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center gap-3 py-12 text-center">
      <span className="text-5xl" aria-hidden>
        {emoji}
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-slate-400">{message}</p>
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ title, message, action }: Omit<StateProps, 'emoji'>) {
  return (
    <div
      role="alert"
      className="card mx-auto flex max-w-lg flex-col items-center gap-3 border-rose-400/40 py-12 text-center"
    >
      <span className="text-5xl" aria-hidden>
        ⚠️
      </span>
      <h3 className="text-lg font-bold text-rose-300">{title}</h3>
      <p className="text-sm text-slate-300">{message}</p>
      {action && <div className="mt-2 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
