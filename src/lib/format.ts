import type { Lang } from './i18n'

export function fmtDate(
  iso: string | null,
  lang: Lang,
  opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', opts)
}
