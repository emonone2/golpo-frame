import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, ButtonLink } from '../components/Button'
import CloudNotConfigured from '../components/CloudNotConfigured'
import PublicStoryGrid from '../components/PublicStoryGrid'
import { ErrorState, LoadingState } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { getProfileByUsername, updateMyProfile } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import { go } from '../lib/router'
import type { Profile as ProfileData } from '../types'

const USERNAME_RE = /^[a-z0-9_]{3,24}$/

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notfound' }
  | { status: 'ready'; profile: ProfileData }

function ProfileEditor({ profile, onSaved }: { profile: ProfileData; onSaved: (p: ProfileData) => void }) {
  const tc = useCT()
  const { refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile.username)
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [bio, setBio] = useState(profile.bio)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!USERNAME_RE.test(username)) return setMsg({ text: tc('err_username'), bad: true })
    setBusy(true)
    setMsg(null)
    try {
      const saved = await updateMyProfile(profile.id, { username, displayName: displayName.trim(), bio: bio.trim() })
      await refreshProfile()
      if (saved.username !== profile.username) {
        go(`/u/${saved.username}`)
        return
      }
      onSaved(saved)
      setMsg({ text: tc('profile_saved'), bad: false })
    } catch (err) {
      setMsg({ text: tc(errKey(err)), bad: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={(e) => void submit(e)} className="card mt-6 space-y-4">
      <h2 className="font-bold">{tc('edit_profile')}</h2>
      <div>
        <label htmlFor="p-username" className="mb-1 block text-xs font-semibold text-slate-400">
          {tc('username')}
        </label>
        <input
          id="p-username"
          value={username}
          maxLength={24}
          autoCapitalize="none"
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
        />
        <p className="mt-1 text-xs text-slate-500">{tc('username_hint')}</p>
      </div>
      <div>
        <label htmlFor="p-display" className="mb-1 block text-xs font-semibold text-slate-400">
          {tc('display_name')}
        </label>
        <input id="p-display" value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="p-bio" className="mb-1 block text-xs font-semibold text-slate-400">
          {tc('bio')}
        </label>
        <textarea id="p-bio" rows={3} value={bio} maxLength={280} onChange={(e) => setBio(e.target.value)} />
      </div>
      {msg && (
        <p
          role={msg.bad ? 'alert' : 'status'}
          className={`rounded-lg px-3 py-2 text-sm ${msg.bad ? 'bg-rose-500/15 text-rose-200' : 'bg-emerald-500/15 text-emerald-200'}`}
        >
          {msg.text}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? tc('saving') : tc('edit_profile')}
      </Button>
    </form>
  )
}

export default function Profile({ username }: { username?: string }) {
  const { t } = useLang()
  const tc = useCT()
  const { configured, user } = useAuth()
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!configured || !username) return
    let active = true
    setState({ status: 'loading' })
    setEditing(false)
    getProfileByUsername(username)
      .then((p) => {
        if (active) setState(p ? { status: 'ready', profile: p } : { status: 'notfound' })
      })
      .catch(() => {
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [configured, username, attempt])

  if (!configured) {
    return (
      <div className="px-4 py-16">
        <CloudNotConfigured />
      </div>
    )
  }
  if (!username || state.status === 'notfound') {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={tc('profile_notfound_title')}
          message={tc('profile_notfound_msg')}
          action={<ButtonLink href="#/gallery">{tc('back_gallery')}</ButtonLink>}
        />
      </div>
    )
  }
  if (state.status === 'loading') return <LoadingState label={t('loading')} />
  if (state.status === 'error') {
    return (
      <div className="px-4 py-16">
        <ErrorState
          title={t('error_title')}
          message={tc('load_failed')}
          action={<Button onClick={() => setAttempt((a) => a + 1)}>{t('retry')}</Button>}
        />
      </div>
    )
  }

  const p = state.profile
  const mine = user?.id === p.id

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-2xl font-extrabold text-ink-950">
          {(p.displayName || p.username).charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-extrabold">{p.displayName || `@${p.username}`}</h1>
          {p.displayName && <p className="text-sm text-slate-400">@{p.username}</p>}
          {p.bio && <p className="mt-2 max-w-xl whitespace-pre-line text-sm text-slate-300">{p.bio}</p>}
        </div>
        {mine && (
          <Button variant="ghost" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
            {tc('edit_profile')}
          </Button>
        )}
      </header>

      {mine && editing && (
        <ProfileEditor
          profile={p}
          onSaved={(saved) => {
            setState({ status: 'ready', profile: saved })
            setEditing(false)
          }}
        />
      )}

      <h2 className="mb-4 mt-10 text-xl font-extrabold">{tc('profile_stories')}</h2>
      <PublicStoryGrid
        username={p.username}
        empty={{
          title: tc('profile_empty_title'),
          message: mine ? tc('profile_empty_own') : tc('profile_empty_msg'),
          action: mine ? <ButtonLink href="#/diary">{tc('publish_cta')}</ButtonLink> : undefined,
        }}
      />
    </div>
  )
}
