import { useLang } from '../context/LangContext'
import { useCT } from '../lib/communityI18n'
import type { EntrySource } from '../types'

/** Always tells the reader how a story was produced. Template output is never labeled as AI. */
export default function SourceBadge({ source }: { source: EntrySource }) {
  const { t } = useLang()
  const tc = useCT()
  const map: Record<EntrySource, { icon: string; text: string; cls: string }> = {
    template: { icon: '🧩', text: t('badge_template'), cls: 'border-amber-400/50 bg-amber-500/10 text-amber-200' },
    ai: { icon: '🤖', text: t('badge_ai'), cls: 'border-sky-400/50 bg-sky-500/10 text-sky-200' },
    manual: { icon: '✍️', text: tc('badge_manual'), cls: 'border-white/20 bg-white/5 text-slate-200' },
  }
  const item = map[source] ?? map.manual
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${item.cls}`}>
      <span aria-hidden>{item.icon}</span> {item.text}
    </span>
  )
}
