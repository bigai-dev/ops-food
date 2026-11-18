import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useI18n } from '@/i18n/I18nContext'
import { TopBar } from './TopBar'

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
  )
}

function SidebarNav({ navItems, title, icon, onResetData }) {
  const { t } = useI18n()
  const pathname = usePathname()
  const isActivePath = (item) =>
    item.end ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`)

  return (
    <div className="flex flex-col h-full text-white w-55" style={{ background: 'var(--demo-sidebar-bg, #0F172A)' }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 className="sidebar-logo flex items-center gap-2.5">
          {icon && <span className="flex items-center justify-center text-sm" style={{ width: 36, height: 36, background: 'var(--color-primary)', borderRadius: 10 }}>{icon}</span>}
          {title}
        </h1>
      </div>

      <nav className="flex-1 py-3 px-3 overflow-y-auto" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const isActive = isActivePath(item)
          return (
            <Link
              key={item.path}
              href={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`nav-item-precise flex items-center text-sm ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{
                gap: 12,
                background: isActive ? 'var(--demo-sidebar-active, var(--color-primary))' : undefined,
              }}
            >
              <span className="flex items-center justify-center shrink-0" style={{ width: 24, height: 24 }}>{item.icon}</span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge > 0 && (
                <span className="flex items-center justify-center text-white font-bold" style={{ background: '#EF4444', borderRadius: 20, minWidth: 18, height: 18, fontSize: 10, padding: '0 5px' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-white/10 space-y-2">
        {onResetData && (
          <AlertDialog>
            <AlertDialogTrigger className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              {t('common.reset')}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.resetConfirm')}</AlertDialogTitle>
                <AlertDialogDescription>{t('common.resetDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={onResetData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.confirm')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}

export function SidebarLayout({ navItems, title, icon, theme, notifications, onResetData, children }) {
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div data-theme={theme} className="flex h-screen overflow-hidden">
      <aside className="hidden md:block shrink-0">
        <SidebarNav navItems={navItems} title={title} icon={icon} onResetData={onResetData} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <div className="md:hidden fixed top-0 left-0 z-40 p-2">
          <SheetTrigger aria-label={t('common.navigation')} className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-card shadow-md cursor-pointer hover:bg-accent text-foreground">
            <MenuIcon />
          </SheetTrigger>
        </div>
        {/* Match the desktop sidebar width (the sheet's default is 3/4 of the screen) */}
        <SheetContent side="left" className="p-0 w-55 data-[side=left]:w-55 border-r-0">

          <SheetTitle className="sr-only">{title} {t('common.navigation')}</SheetTitle>
          <SidebarNav navItems={navItems} title={title} icon={icon} onResetData={onResetData} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar notifications={notifications} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
