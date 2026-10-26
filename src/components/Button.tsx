import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-50'

const styles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-ink-950 shadow-md shadow-fuchsia-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-500/30 hover:brightness-110',
  secondary:
    'bg-gradient-to-r from-emerald-400 to-teal-400 text-ink-950 hover:-translate-y-0.5 hover:brightness-110 shadow-lg shadow-emerald-500/20',
  ghost:
    'border border-white/20 text-slate-100 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10',
  danger:
    'border border-rose-400/50 text-rose-300 hover:-translate-y-0.5 hover:bg-rose-500/15',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={`${base} ${styles[variant]} ${className}`} {...props} />
}

export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return <a className={`${base} ${styles[variant]} ${className}`} {...props} />
}

