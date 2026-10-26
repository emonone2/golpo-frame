import type { GenreId, GenreMeta } from '../types'

export const genres: GenreMeta[] = [
  {
    id: 'action',
    emoji: '⚡',
    gradient: 'from-rose-600 via-orange-500 to-amber-400',
    name: { en: 'Action', bn: 'অ্যাকশন' },
    desc: { en: 'Fast cuts, bold impact frames.', bn: 'দ্রুত দৃশ্য, জোরালো ফ্রেম।' },
  },
  {
    id: 'romance',
    emoji: '🌸',
    gradient: 'from-pink-500 via-rose-400 to-orange-300',
    name: { en: 'Romance', bn: 'রোমান্স' },
    desc: { en: 'Soft light and quiet glances.', bn: 'নরম আলো আর নীরব চাহনি।' },
  },
  {
    id: 'fantasy',
    emoji: '🐉',
    gradient: 'from-violet-600 via-fuchsia-500 to-sky-400',
    name: { en: 'Fantasy', bn: 'ফ্যান্টাসি' },
    desc: { en: 'Magic, myths and glowing worlds.', bn: 'জাদু, মিথ আর আলোকিত জগৎ।' },
  },
  {
    id: 'scifi',
    emoji: '🚀',
    gradient: 'from-sky-600 via-cyan-500 to-emerald-400',
    name: { en: 'Sci-Fi', bn: 'সায়েন্স ফিকশন' },
    desc: { en: 'Neon cities and distant stars.', bn: 'নিওন শহর আর দূরের তারা।' },
  },
  {
    id: 'horror',
    emoji: '👻',
    gradient: 'from-slate-800 via-purple-900 to-red-800',
    name: { en: 'Horror', bn: 'হরর' },
    desc: { en: 'Long shadows and held breath.', bn: 'দীর্ঘ ছায়া আর থমকে যাওয়া নিঃশ্বাস।' },
  },
  {
    id: 'comedy',
    emoji: '😂',
    gradient: 'from-yellow-400 via-lime-400 to-teal-400',
    name: { en: 'Comedy', bn: 'কমেডি' },
    desc: { en: 'Big reactions, perfect timing.', bn: 'বড় প্রতিক্রিয়া, নিখুঁত টাইমিং।' },
  },
]

export const genreById = Object.fromEntries(genres.map((g) => [g.id, g])) as Record<GenreId, (typeof genres)[number]>

export function isGenre(x: string | undefined): x is GenreId {
  return !!x && x in genreById
}
