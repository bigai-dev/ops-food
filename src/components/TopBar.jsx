import { useState, useRef, useEffect } from 'react'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { useI18n } from '@/i18n/I18nContext'

const LOCALES = [
  { id: 'zh', label: '中', name: '中文', lang: 'zh' },
  { id: 'en', label: 'EN', name: 'English', lang: 'en' },
  { id: 'bm', label: 'BM', name: 'Bahasa Melayu', lang: 'ms' },
]

// Colours come straight from the theme variables so they follow FoodOps light/dark.
// Icons stay quiet by default and light up on hover or while their panel is open.
const ICON_BUTTON =
  'relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg outline-none ' +
  'text-(--color-muted-foreground) transition-colors duration-150 ' +
  'hover:bg-(--color-muted) hover:text-(--color-foreground) ' +
  'aria-expanded:bg-(--color-muted) aria-expanded:text-(--color-foreground) ' +
  'focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4'

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
  )
}

export function TopBar({ notifications = [], logo }) {
  const { isDark, toggle } = useDarkMode()
  const { locale, changeLocale, t } = useI18n()
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-border bg-card">
      {logo && <div className="flex-1">{logo}</div>}
      {!logo && <div className="flex-1" />}

      <div className="relative" ref={notifRef}>
        <button
          type="button"
          className={ICON_BUTTON}
          aria-label={`${t('common.notifications')}${notifications.length > 0 ? ` (${t('common.newCount', { count: notifications.length })})` : ''}`}
          aria-expanded={showNotifications}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <BellIcon />
          {notifications.length > 0 && (
            // Same red as the sidebar badges; the ring cuts it cleanly out of the bell
            <span className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold leading-none tabular-nums text-white ring-2 ring-(--color-card)">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b border-border font-semibold text-sm heading-font">
              {t('common.notifications')} ({notifications.length})
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="px-3 py-2.5 text-sm text-muted-foreground">{t('common.noNotifications')}</div>
              )}
              {notifications.map((n, i) => (
                <div key={i} className="px-3 py-2.5 text-sm border-b border-border last:border-0 hover:bg-muted/50">
                  {n.text || n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alerts on the left of the divider, display preferences on the right */}
      <span aria-hidden="true" className="mx-1.5 h-5 w-px bg-(--color-border)" />

      {/* Language switcher: a recessed track with the current language raised */}
      <div role="group" aria-label={t('common.language')} className="flex h-9 items-center gap-0.5 rounded-lg bg-muted p-1">
        {LOCALES.map(loc => {
          const active = locale === loc.id
          return (
            <button
              key={loc.id}
              type="button"
              lang={loc.lang}
              title={loc.name}
              aria-pressed={active}
              onClick={() => changeLocale(loc.id)}
              className={`flex h-7 min-w-9 items-center justify-center rounded-md px-2 text-xs font-semibold outline-none transition-[color,background-color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/50 ${
                active
                  ? 'bg-(--color-card) text-(--color-foreground) shadow-[0_1px_2px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] dark:bg-white/12'
                  : 'cursor-pointer text-(--color-muted-foreground) hover:text-(--color-foreground)'
              }`}
            >
              {loc.label}
            </button>
          )
        })}
      </div>

      <button type="button" className={ICON_BUTTON} onClick={toggle} aria-label={isDark ? t('common.lightMode') : t('common.darkMode')}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
