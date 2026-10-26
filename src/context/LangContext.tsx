import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { dictionaries } from '../lib/i18n'
import type { Bilingual, Key, Lang } from '../lib/i18n'

interface LangValue {
  lang: Lang
  toggle: () => void
  t: (key: Key) => string
  pick: (b: Bilingual) => string
}

const LangContext = createContext<LangValue | null>(null)
const STORE = 'golpoframe.lang'

function initialLang(): Lang {
  try {
    return localStorage.getItem(STORE) === 'bn' ? 'bn' : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(STORE, lang)
    } catch {
      /* storage unavailable; language still works for this session */
    }
  }, [lang])

  const toggle = useCallback(() => setLang((l) => (l === 'en' ? 'bn' : 'en')), [])

  const value = useMemo<LangValue>(
    () => ({
      lang,
      toggle,
      t: (key) => dictionaries[lang][key],
      pick: (b) => b[lang],
    }),
    [lang, toggle],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
