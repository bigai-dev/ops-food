import '../src/index.css'
import { AppShell } from '@/components/AppShell'

export const metadata = {
  title: 'FoodOps — 餐饮一站式管理系统',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍜</text></svg>",
  },
}

export default function RootLayout({ children }) {
  return (
    // Dark mode is switched on in the browser before the page appears
    <html lang="zh-CN" suppressHydrationWarning>
      {/* Theme on <body> so pop-ups (menus, dialogs, toasts) get the FoodOps colours too */}
      <body data-theme="foodops">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
