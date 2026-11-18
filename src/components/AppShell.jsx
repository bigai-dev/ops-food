'use client'

import { useSyncExternalStore } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ToastProvider } from '@/components/ToastProvider'
import { I18nProvider } from '@/i18n/I18nContext'
import { FoodOpsLayout } from '@/screens'

const noSubscribe = () => () => {}

// All data, language and dark mode are saved in the browser,
// so the app only draws itself once it is running there.
export function AppShell({ children }) {
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false)
  if (!inBrowser) return null

  return (
    <I18nProvider>
      <TooltipProvider>
        <ToastProvider>
          <FoodOpsLayout>{children}</FoodOpsLayout>
        </ToastProvider>
      </TooltipProvider>
    </I18nProvider>
  )
}
