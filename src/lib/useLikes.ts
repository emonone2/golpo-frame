import { useCallback, useEffect, useState } from 'react'
import { fetchLikedSet } from './cloud'

/** Tracks which of `ids` the signed-in user has liked, plus fresh counts after toggling. */
export function useLikes(userId: string | undefined, ids: string[]) {
  const [liked, setLiked] = useState<Set<string>>(() => new Set())
  const [counts, setCounts] = useState<Record<string, number>>({})
  const key = ids.join(',')

  useEffect(() => {
    if (!userId || key === '') {
      setLiked(new Set())
      return
    }
    let active = true
    fetchLikedSet(key.split(','))
      .then((s) => {
        if (active) setLiked(s)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [userId, key])

  const apply = useCallback((id: string, isLiked: boolean, count: number) => {
    setLiked((prev) => {
      const next = new Set(prev)
      if (isLiked) next.add(id)
      else next.delete(id)
      return next
    })
    setCounts((prev) => ({ ...prev, [id]: count }))
  }, [])

  return { liked, counts, apply }
}
