import { useState } from 'react'
import { ButtonLink } from '../components/Button'
import CloudNotConfigured from '../components/CloudNotConfigured'
import PublicStoryGrid from '../components/PublicStoryGrid'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { genres } from '../data/genres'
import { useCT } from '../lib/communityI18n'
import type { GenreId } from '../types'

export default function Gallery() {
  const { pick } = useLang()
  const tc = useCT()
  const { configured } = useAuth()
  const [genre, setGenre] = useState<GenreId | 'all'>('all')

  if (!configured) {
    return (
      <div className="px-4 py-16">
        <CloudNotConfigured />
      </div>
    )
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
      active ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white' : 'border-white/15 text-slate-300 hover:bg-white/10'
    }`

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">{tc('gallery_title')}</h1>
      <p className="mb-6 mt-1 text-sm text-slate-400">{tc('gallery_sub')}</p>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={tc('all_genres')}>
        <button type="button" aria-pressed={genre === 'all'} onClick={() => setGenre('all')} className={chip(genre === 'all')}>
          {tc('all_genres')}
        </button>
        {genres.map((g) => (
          <button key={g.id} type="button" aria-pressed={genre === g.id} onClick={() => setGenre(g.id)} className={chip(genre === g.id)}>
            {g.emoji} {pick(g.name)}
          </button>
        ))}
      </div>

      <PublicStoryGrid
        genre={genre === 'all' ? undefined : genre}
        empty={{
          title: tc('gallery_empty_title'),
          message: tc('gallery_empty_msg'),
          action: <ButtonLink href="#/diary">{tc('publish_cta')}</ButtonLink>,
        }}
      />
    </div>
  )
}
