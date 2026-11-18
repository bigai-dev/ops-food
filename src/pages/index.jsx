import { Routes, Route, Navigate } from 'react-router-dom'
import { SidebarLayout } from '@/components/SidebarLayout'
import { useFoodOpsStore } from '@/store'
import { useI18n } from '@/i18n/I18nContext'
import { Dashboard } from './Dashboard'
import { Orders } from './Orders'
import { Kitchen } from './Kitchen'
import { Tables } from './Tables'
import { Inventory } from './Inventory'
import { Schedule } from './Schedule'
import { Settings } from './Settings'
import { Reports } from './Reports'

const NAV_ICONS = {
  dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  orders: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  kitchen: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="m4 8 16-4"/><path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8"/></svg>,
  tables: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="4" rx="2" ry="2"/><line x1="2" x2="22" y1="20" y2="20"/><line x1="12" x2="12" y1="16" y2="20"/></svg>,
  inventory: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  schedule: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  reports: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
}

export function FoodOpsLayout() {
  const { t, ln } = useI18n()
  // Subscribe to the data itself so badges and alerts update as soon as orders or stock change
  const inventory = useFoodOpsStore(s => s.inventory)
  const newOrderCount = useFoodOpsStore(s => s.orders.filter(o => o.status === 'new').length)
  const resetAll = useFoodOpsStore(s => s.resetAll)

  const lowStockItems = inventory.filter(i => i.stock < i.min)
  const lowStockCount = lowStockItems.length
  const notifications = lowStockItems.map(item => ({
    text: `⚠️ ${ln(item.name)} ${t('common.stockLow')} (${item.stock}${item.unit})`,
  }))

  const navItems = [
    { path: '/', label: t('nav.dashboard'), end: true, icon: NAV_ICONS.dashboard },
    { path: '/orders', label: t('nav.orders'), icon: NAV_ICONS.orders },
    { path: '/kitchen', label: t('nav.kitchen'), icon: NAV_ICONS.kitchen, badge: newOrderCount },
    { path: '/tables', label: t('nav.tables'), icon: NAV_ICONS.tables },
    { path: '/inventory', label: t('nav.inventory'), icon: NAV_ICONS.inventory, badge: lowStockCount },
    { path: '/schedule', label: t('nav.schedule'), icon: NAV_ICONS.schedule },
    { path: '/settings', label: t('nav.settings'), icon: NAV_ICONS.settings },
    { path: '/reports', label: t('nav.reports'), icon: NAV_ICONS.reports },
  ]

  return (
    <Routes>
      <Route
        element={
          <SidebarLayout
            navItems={navItems}
            title="FoodOps"
            icon="🍜"
            theme="foodops"
            notifications={notifications}
            onResetData={resetAll}
          />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="kitchen" element={<Kitchen />} />
        <Route path="tables" element={<Tables />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
