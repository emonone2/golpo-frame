import { useCallback, useEffect, useState } from 'react'
import { Button, ButtonLink } from '../components/Button'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import StoryCard from '../components/StoryCard'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genreById } from '../data/genres'
import { demoStories } from '../data/stories'
import { useCT } from '../lib/communityI18n'
import { clearProjects, loadProjects } from '../lib/storage'
import {
  deleteStoryFromSupabase,
  fetchPublicStories,
  fetchUserStories,
  saveStoryToSupabase,
} from '../lib/supabase/stories'
import type { Project } from '../types'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; projects: Project[]; publicProjects: Project[] }

export default function Dashboard() {
  const { t, pick, lang } = useLang()
  const tc = useCT()
  const { user, profile, isConfigured, openAuth, signOut } = useAuth()
  const [state, setState] = useState<State>(() => {
    try {
      const localList = loadProjects()
      return {
        status: 'ready',
        projects: localList,
        publicProjects: localList.filter((p) => p.isPublic),
      }
    } catch {
      return { status: 'loading' }
    }
  })
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my')

  const load = useCallback(() => {
    Promise.all([fetchUserStories(), fetchPublicStories()])
      .then(([projects, publicProjects]) => {
        setState({ status: 'ready', projects, publicProjects })
      })
      .catch(() => {
        setState((prev) => (prev.status === 'ready' ? prev : { status: 'error' }))
      })
  }, [])

  useEffect(() => {
    load()
  }, [load, user?.id])

  const remove = async (id: string) => {
    if (!window.confirm(t('confirm_delete'))) return
    try {
      await deleteStoryFromSupabase(id)
      load()
    } catch {
      setState({ status: 'error' })
    }
  }

  const togglePublic = async (p: Project) => {
    const nextPublic = !p.isPublic
    try {
      await saveStoryToSupabase(p, { isPublic: nextPublic })
      load()
    } catch (err) {
      console.error('Failed to toggle public visibility:', err)
    }
  }

  const reset = () => {
    if (!window.confirm(t('confirm_reset'))) return
    clearProjects()
    load()
  }

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium' })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Top Banner & Account Header */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-ink-900/60 p-4 sm:p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user && (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-lg font-extrabold text-ink-950">
                {(profile?.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">{t('dash_title')}</h1>
              <p className="mt-1 text-sm text-slate-300">
                {user
                  ? `${profile?.displayName || user.email?.split('@')[0] || 'User'} (${user.email})${
                      profile?.username ? ` · @${profile.username}` : ''
                    }`
                  : isConfigured
                  ? `${t('auth_demo_mode')} · ${t('dash_sub')}`
                  : t('dash_sub')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!user ? (
              <Button variant="ghost" onClick={() => openAuth('login')}>
                🔐 {t('auth_signin')}
              </Button>
            ) : (
              <>
                <ButtonLink href="#/generate" variant="ghost">
                  ✨ {t('nav_generate')}
                </ButtonLink>
                <ButtonLink href="#/diary" variant="ghost">
                  📔 {tc('nav_diary')}
                </ButtonLink>
                <Button
                  variant="ghost"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  {tc('sign_out')}
                </Button>
              </>
            )}
            <ButtonLink href="#/studio/new/action">+ {t('new_comic')}</ButtonLink>
          </div>
        </div>
      </div>

      {/* Tabs: My Comics vs Public Community */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
            activeTab === 'my'
              ? 'bg-amber-400 text-ink-950 shadow-md shadow-amber-400/20'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          📁 {t('panels')} ({state.status === 'ready' ? state.projects.length : '...'})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('public')}
          className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
            activeTab === 'public'
              ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          🌐 {t('auth_public_comic')} (
          {state.status === 'ready' ? state.publicProjects.length : '...'})
        </button>
      </div>

      {state.status === 'loading' && <LoadingState label={t('loading')} />}

      {state.status === 'error' && (
        <ErrorState
          title={t('error_title')}
          message={t('error_storage')}
          action={
            <>
              <Button onClick={load}>{t('retry')}</Button>
              <Button variant="danger" onClick={reset}>
                {t('reset_data')}
              </Button>
            </>
          }
        />
      )}

      {/* MY COMICS TAB */}
      {state.status === 'ready' && activeTab === 'my' && (
        <>
          {state.projects.length === 0 ? (
            <EmptyState
              emoji="🗂️"
              title={t('empty_title')}
              message={t('empty_desc')}
              action={<ButtonLink href="#/studio/new/action">{t('new_comic')}</ButtonLink>}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.projects.map((p) => {
                const g = genreById[p.genre] ?? genreById.action
                const isOwner = !p.userId || (user && p.userId === user.id)

                return (
                  <article key={p.id} className="card flex flex-col gap-3 group relative overflow-hidden">
                    <div
                      className={`h-24 rounded-xl bg-gradient-to-br ${g.gradient} relative overflow-hidden flex items-end p-3`}
                    >
                      <div className="halftone absolute inset-0 opacity-40" />
                      <span aria-hidden className="absolute right-3 top-2 text-4xl">
                        {g.emoji}
                      </span>
                      {user && (
                        <button
                          type="button"
                          onClick={() => togglePublic(p)}
                          className={`relative z-10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition border ${
                            p.isPublic
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                              : 'bg-black/50 border-white/20 text-slate-300'
                          }`}
                          title="Toggle visibility"
                        >
                          {p.isPublic ? `🌐 ${t('auth_public_comic')}` : `🔒 ${t('auth_private_comic')}`}
                        </button>
                      )}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{p.title}</h3>
                      {p.summary && (
                        <p className="mt-1 text-xs text-slate-300 line-clamp-2">{p.summary}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {pick(g.name)} · {p.panels.length} {t('panels_count')} · {t('updated')}{' '}
                        {fmt(p.updatedAt)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <ButtonLink href={`#/studio/${p.id}`}>{t('open')}</ButtonLink>
                      {isOwner && (
                        <Button variant="danger" onClick={() => remove(p.id)}>
                          {t('delete')}
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* PUBLIC COMMUNITY TAB */}
      {state.status === 'ready' && activeTab === 'public' && (
        <>
          {state.publicProjects.length === 0 ? (
            <div className="card text-center py-12">
              <span className="text-4xl">🌐</span>
              <h3 className="mt-2 text-lg font-bold">No public stories shared yet</h3>
              <p className="mt-1 text-xs text-slate-400">
                Create a story in Studio, mark it as Public, and it will appear here for everyone to read!
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.publicProjects.map((p) => {
                const g = genreById[p.genre] ?? genreById.action
                const isOwner = user && p.userId === user.id

                return (
                  <article key={p.id} className="card flex flex-col gap-3">
                    <div
                      className={`h-24 rounded-xl bg-gradient-to-br ${g.gradient} relative overflow-hidden flex items-end p-3`}
                    >
                      <span aria-hidden className="absolute right-3 top-2 text-4xl">
                        {g.emoji}
                      </span>
                      <span className="relative z-10 rounded-full bg-emerald-500/30 border border-emerald-400 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                        🌐 Public Story
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-white">{p.title}</h3>
                      {p.summary && (
                        <p className="mt-1 text-xs text-slate-300 line-clamp-2">{p.summary}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {pick(g.name)} · {p.panels.length} {t('panels_count')}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      <ButtonLink href={`#/studio/${p.id}`}>{t('open')}</ButtonLink>
                      {isOwner && (
                        <Button variant="danger" onClick={() => remove(p.id)}>
                          {t('delete')}
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Demo Stories Section */}
      <section className="mt-14">
        <h2 className="text-xl font-extrabold">{t('demo_title')}</h2>
        <p className="mb-5 mt-1 text-sm text-slate-400">{t('demo_sub')}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {demoStories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </section>
    </div>
  )
}
