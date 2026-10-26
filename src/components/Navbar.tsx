import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useCT } from '../lib/communityI18n'
import type { Route } from '../lib/router'

export default function Navbar({ page }: { page: Route['page'] }) {
  const { t, toggle } = useLang()
  const tc = useCT()
  const { configured, user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const links: { page: Route['page']; href: string; text: string }[] = [
    { page: 'home', href: '#/', text: t('nav_home') },
    { page: 'generate', href: '#/generate', text: t('nav_generate') },
    { page: 'gallery', href: '#/gallery', text: tc('nav_gallery') },
    { page: 'diary', href: '#/diary', text: tc('nav_diary') },
    { page: 'dashboard', href: '#/dashboard', text: t('nav_dashboard') },
    { page: 'studio', href: '#/studio/new/action', text: t('nav_studio') },
  ]

  const active = (p: Route['page']) => page === p || (p === 'gallery' && (page === 'story' || page === 'profile'))

  const account = (onNavigate?: () => void) => {
    if (!configured) return null
    if (!user) {
      return (
        <a
          href="#/login"
          onClick={onNavigate}
          className="rounded-full border border-fuchsia-400/60 px-3 py-1.5 text-sm font-semibold text-fuchsia-200 hover:bg-fuchsia-500/10"
        >
          {tc('sign_in')}
        </a>
      )
    }
    return (
      <>
        <a
          href={profile ? `#/u/${profile.username}` : '#/diary'}
          onClick={onNavigate}
          className="max-w-[9rem] truncate rounded-full px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          @{profile?.username ?? '…'}
        </a>
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            void signOut()
          }}
          className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
        >
          {tc('sign_out')}
        </button>
      </>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <a href="#/" className="flex items-center gap-2" aria-label="GolpoFrame">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-400 text-lg">
            📖
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold">GolpoFrame</span>
            <span className="hidden text-[11px] text-slate-400 sm:block">{t('tagline')}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((l) => (
            <a
              key={l.page}
              href={l.href}
              aria-current={active(l.page) ? 'page' : undefined}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                active(l.page) ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {l.text}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">{account()}</div>
          <button
            type="button"
            onClick={toggle}
            className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-semibold hover:bg-white/10"
          >
            {t('switch_lang')}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={t('menu')}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm lg:hidden"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-2 lg:hidden" aria-label="Mobile">
          {links.map((l) => (
            <a
              key={l.page}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={active(l.page) ? 'page' : undefined}
              className="block rounded-lg px-3 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
            >
              {l.text}
            </a>
          ))}
          <div className="flex flex-wrap items-center gap-2 px-1 py-3">{account(() => setOpen(false))}</div>
        </nav>
      )}
    </header>
  )
}
