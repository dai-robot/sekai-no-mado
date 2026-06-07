import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DICTS, LANGS, LANG_LOCALE, type Lang, type TKey } from './translations'

const STORAGE_KEY = 'mado.lang'

function detectLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
  if (stored && LANGS.includes(stored)) return stored

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const raw of candidates) {
    const code = raw.toLowerCase().split('-')[0]
    const found = LANGS.find((l) => l === code)
    if (found) return found
  }
  return 'en'
}

interface I18nValue {
  lang: Lang
  locale: string
  setLang: (l: Lang) => void
  t: (key: TKey) => string
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem(STORAGE_KEY, l)
    document.documentElement.lang = l
  }, [])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[lang]
    return {
      lang,
      locale: LANG_LOCALE[lang],
      setLang,
      t: (key: TKey) => dict[key] ?? DICTS.en[key] ?? key
    }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
