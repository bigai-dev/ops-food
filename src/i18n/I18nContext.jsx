import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('foodops_locale') || 'zh'
  })

  const t = useCallback((key, params) => {
    let str = translations[locale]?.[key] || translations.zh?.[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }
    return str
  }, [locale])

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale)
    localStorage.setItem('foodops_locale', newLocale)
  }, [])

  // Helper to get localized name from { zh, en, bm } object
  const ln = useCallback((nameObj) => {
    if (!nameObj) return ''
    if (typeof nameObj === 'string') return nameObj
    return nameObj[locale] || nameObj.zh || ''
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, ln }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
