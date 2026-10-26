import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../components/Button'
import { LoadingState } from '../components/States'
import { useAuth } from '../context/AuthContext'
import type { AuthIssue } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { useCT } from '../lib/communityI18n'
import type { CKey } from '../lib/communityI18n'
import { go } from '../lib/router'

const ISSUE_KEY: Record<AuthIssue, CKey> = {
  invalid: 'auth_invalid',
  exists: 'auth_exists',
  weak: 'auth_weak',
  unconfirmed: 'auth_unconfirmed',
  rate_limit: 'auth_rate_limit',
  email_disabled: 'auth_email_disabled',
  unknown: 'auth_unknown',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
  const { t, lang } = useLang()
  const tc = useCT()
  const { loading, user, signIn, signUp } = useAuth()

  // Auth mode: 'in' (Sign In) vs 'up' (Create Account)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null)

  // Redirect to dashboard immediately upon authentication
  useEffect(() => {
    if (user) go('/dashboard')
  }, [user])

  if (loading) return <LoadingState label={t('loading')} />

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault()
    const addr = email.trim().toLowerCase()
    if (!EMAIL_RE.test(addr)) {
      return setMsg({ text: tc('err_email'), bad: true })
    }
    if (password.length < 6) {
      return setMsg({
        text: lang === 'bn' ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন।' : 'Use at least 6 characters.',
        bad: true,
      })
    }

    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'in') {
        const issue = await signIn(addr, password)
        if (issue) {
          setMsg({ text: tc(ISSUE_KEY[issue]), bad: true })
        } else {
          go('/dashboard')
        }
      } else {
        const r = await signUp(addr, password)
        if (r.issue) {
          setMsg({ text: tc(ISSUE_KEY[r.issue]), bad: true })
        } else {
          go('/dashboard')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold">{tc('login_title')}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {lang === 'bn'
          ? 'শুধু ইমেইল এবং পাসওয়ার্ড দিয়ে অ্যাকাউন্ট তৈরি বা লগইন করুন — কোনো ইমেইল ভেরিফিকেশনের প্রয়োজন নেই।'
          : 'Create an account or sign in using just your email and password — no email verification required.'}
      </p>

      <div className="card mt-6 space-y-5">
        {/* Mode selector: Sign In vs Create Account */}
        <div role="group" className="grid grid-cols-2 gap-1 rounded-full border border-white/15 p-1">
          {(['in', 'up'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m)
                setMsg(null)
              }}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                mode === m
                  ? 'bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'in' ? tc('mode_signin') : tc('mode_signup')}
            </button>
          ))}
        </div>

        {/* Direct Email & Password Form */}
        <form noValidate onSubmit={(e) => void handleEmailAuth(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-400">
              {tc('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-400">
              {tc('password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === 'up' && (
              <p className="mt-1 text-xs text-slate-500">
                {lang === 'bn'
                  ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন। অ্যাকাউন্ট খোলার সাথে সাথেই আপনার ড্যাশবোর্ডে প্রবেশ করবেন।'
                  : 'At least 6 characters. You will enter your dashboard immediately upon creating the account.'}
              </p>
            )}
          </div>

          {msg && (
            <p
              role={msg.bad ? 'alert' : 'status'}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.bad ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-200'
              }`}
            >
              {msg.text}
            </p>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? tc('submit_working') : mode === 'in' ? tc('mode_signin') : tc('mode_signup')}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'in' ? 'up' : 'in')
            setMsg(null)
          }}
          className="block w-full pt-2 text-center text-sm font-semibold text-fuchsia-300 hover:underline"
        >
          {mode === 'in' ? tc('no_account') : tc('has_account')}
        </button>
      </div>
    </div>
  )
}
