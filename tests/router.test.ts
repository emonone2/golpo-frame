import test from 'node:test'
import assert from 'node:assert/strict'
import { isGenre } from '../src/data/genres'
import type { GenreId } from '../src/types'

type Route = {
  page: 'home' | 'dashboard' | 'studio' | 'generate' | 'gallery' | 'story' | 'profile' | 'diary' | 'login'
  id?: string
  genre?: GenreId
  username?: string
}

function parseHash(hash: string): Route {
  const [p, a, b] = hash.replace(/^#\/?/, '').split('/')
  switch (p) {
    case 'dashboard':
      return { page: 'dashboard' }
    case 'generate':
      return { page: 'generate' }
    case 'gallery':
      return { page: 'gallery', genre: isGenre(a) ? a : undefined }
    case 'story':
      return { page: 'story', id: a || undefined }
    case 'u':
      return { page: 'profile', username: a ? decodeURIComponent(a) : undefined }
    case 'diary':
      return { page: 'diary', id: a || undefined }
    case 'login':
      return { page: 'login' }
    case 'studio':
      if (a === 'new') return { page: 'studio', genre: isGenre(b) ? b : 'action' }
      return { page: 'studio', id: a || undefined }
    default:
      return { page: 'home' }
  }
}

test('Router: hash parsing matches all app routes', () => {
  assert.deepEqual(parseHash('#/'), { page: 'home' })
  assert.deepEqual(parseHash(''), { page: 'home' })
  assert.deepEqual(parseHash('#/gallery'), { page: 'gallery', genre: undefined })
  assert.deepEqual(parseHash('#/gallery/comedy'), { page: 'gallery', genre: 'comedy' })
  assert.deepEqual(parseHash('#/diary'), { page: 'diary', id: undefined })
  assert.deepEqual(parseHash('#/diary/entry-123'), { page: 'diary', id: 'entry-123' })
  assert.deepEqual(parseHash('#/story/abc-xyz'), { page: 'story', id: 'abc-xyz' })
  assert.deepEqual(parseHash('#/u/rafi_art'), { page: 'profile', username: 'rafi_art' })
  assert.deepEqual(parseHash('#/studio/new/horror'), { page: 'studio', genre: 'horror' })
  assert.deepEqual(parseHash('#/studio/my-comic'), { page: 'studio', id: 'my-comic' })
  assert.deepEqual(parseHash('#/login'), { page: 'login' })
  assert.deepEqual(parseHash('#/generate'), { page: 'generate' })
})
