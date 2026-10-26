import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { createEntry } from '../lib/cloud'
import { errKey, useCT } from '../lib/communityI18n'
import { MAX_INCIDENT, validateStory } from '../lib/story/schema'
import type { GeneratedStory } from '../types'
import { Button, ButtonLink } from './Button'

type State =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved'; id: string }
  | { status: 'error'; text: string }

/** Saves the reviewed generator output to the user's PRIVATE diary. */
export default function SaveToDiary({ story }: { story: GeneratedStory }) {
  const { t } = useLang()
  const tc = useCT()
  const { configured, user } = useAuth()
  const [state, setState] = useState<State>({ status: 'idle' })

  // Any edit to the story re-enables saving.
  useEffect(() => {
    setState({ status: 'idle' })
  }, [story.data])

  if (!configured) return null

  // Opens in a new tab so the unsaved story in this tab isn't lost.
  if (!user) {
    return (
      <ButtonLink href="#/login" target="_blank" rel="noopener noreferrer" variant="ghost">
        {tc('signin_to_save')}
      </ButtonLink>
    )
  }

  const save = async () => {
    const checked = validateStory(story.data)
    if (!checked.ok) {
      setState({ status: 'error', text: t('fix_fields') })
      return
    }
    setState({ status: 'saving' })
    try {
      const created = await createEntry({
        ...checked.data,
        incident: story.options.incident.trim().slice(0, MAX_INCIDENT),
        genre: story.options.genre,
        language: story.options.language,
        source: story.source,
        engine: story.engine,
        visibility: 'private',
      })
      setState({ status: 'saved', id: created.id })
    } catch (e) {
      setState({ status: 'error', text: tc(errKey(e)) })
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={() => void save()} disabled={state.status === 'saving' || state.status === 'saved'}>
        📔 {state.status === 'saving' ? tc('saving') : tc('save_to_diary')}
      </Button>
      {state.status === 'saved' && (
        <span role="status" className="self-center text-sm text-emerald-300">
          {tc('saved_private')}{' '}
          <a className="underline" href={`#/diary/${state.id}`}>
            {tc('view_in_diary')}
          </a>
        </span>
      )}
      {state.status === 'error' && (
        <span role="alert" className="self-center text-sm text-rose-300">
          {state.text}
        </span>
      )}
    </>
  )
}
