'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, translations } from '@/lib/i18n'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: typeof translations.fr }
const Ctx = createContext<LangCtx>({ lang: 'fr', setLang: () => {}, t: translations.fr })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang
    if (stored && translations[stored]) { setLangState(stored); return }
    const browser = navigator.language.toLowerCase()
    if (browser.startsWith('de')) setLangState('de')
    else if (browser.startsWith('en')) setLangState('en')
    else setLangState('fr')
  }, [])

  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem('lang', l) }
  return <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</Ctx.Provider>
}
export const useLang = () => useContext(Ctx)
