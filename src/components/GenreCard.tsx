import { useLang } from '../context/LangContext'
import type { GenreMeta } from '../types'

export default function GenreCard({ genre }: { genre: GenreMeta }) {
  const { t, pick } = useLang()

  return (
    <a
      href={`#/studio/new/${genre.id}`}
      aria-label={`${pick(genre.name)}: ${t('start_genre')}`}
      className={`group animate-fade-up relative flex min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${genre.gradient} p-4 shadow-lg transition-all duration-200 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-fuchsia-500/25 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-white`}
    >
      <div className="halftone absolute inset-0 transition-opacity duration-200 group-hover:opacity-80" />
      <span
        aria-hidden
        className="absolute right-3 top-2 text-5xl transition-transform duration-200 ease-out group-hover:-rotate-6 group-hover:scale-115"
      >
        {genre.emoji}
      </span>
      <div className="relative">
        <h3 className="text-lg font-extrabold text-white drop-shadow">{pick(genre.name)}</h3>
        <p className="text-xs text-white/90">{pick(genre.desc)}</p>
      </div>
    </a>
  )
}

