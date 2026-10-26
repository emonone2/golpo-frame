import { useEffect, useState } from 'react'
import { isGenre } from '../data/genres'
import type { GenreId } from '../types'

export type Route = {
  page: 'home' | 'dashboard' | 'studio' | 'generate' | 'gallery' | 'story' | 'profile' | 'diary' | 'login'
  id?: string
  genre?: GenreId
  username?: string
}

function decode(s: string | undefined): string | undefined {
  if (!s) return undefined
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

function parse(): Route {
  const [p, a, b] = window.location.hash.replace(/^#\/?/, '').split('/')
  switch (p) {
    case 'dashboard':
      return { page: 'dashboard' }
    case 'generate':
      return { page: 'generate' }
    case 'gallery':
      return { page: 'gallery' }
    case 'login':
      return { page: 'login' }
    case 'story':
      return { page: 'story', id: a || undefined }
    case 'u':
      return { page: 'profile', username: decode(a)?.toLowerCase() }
    case 'diary':
      return { page: 'diary', id: a || undefined }
    case 'studio':
      if (a === 'new') return { page: 'studio', genre: isGenre(b) ? b : 'action' }
      return { page: 'studio', id: a || undefined }
    default:
      return { page: 'home' }
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse)
  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function go(path: string) {
  window.location.hash = path
}
