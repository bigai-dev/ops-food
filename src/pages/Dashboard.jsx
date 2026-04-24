import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { KpiCard } from '@/components/KpiCard'
import { ChartCard } from '@/components/ChartCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFoodOpsStore } from '@/store'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { useChartTheme } from '@/lib/hooks/use-chart-theme'
import { useI18n } from '@/i18n/I18nContext'
import { PAYMENT_METHODS, ORDER_TYPES, menuName } from '@/data'

const PAYMENT_COLORS = ['#3B82F6', '#10B981', '#6366F1', '#22C55E', '#F59E0B', '#EF4444']

export function Dashboard() {
  const { t, ln, locale } = useI18n()
  const { totalRevenue, totalOrders, totalCogs, totalSst, salesRanking, timeSlots, inventory, orders } = useFoodOpsStore()
  const { isDark } = useDarkMode()
  const theme = useChartTheme('foodops', isDark)

  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
  const lowStockCount = inventory.filter(i => i.stock < i.min).length
  const margin = totalRevenue > 0 ? Math.round((totalRevenue - totalCogs) / totalRevenue * 100) : 0

  const okCount = inventory.filter(i => i.stock >= i.min * 1.5).length
  const lowCount = inventory.filter(i => i.stock >= i.min && i.stock < i.min * 1.5).length
  const critCount = inventory.filter(i => i.stock < i.min).length
  const invData = [
    { name: t('common.sufficient'), value: okCount, color: '#10B981' },
    { name: t('common.low'), value: lowCount, color: '#F59E0B' },
    { name: t('common.critical'), value: critCount, color: '#EF4444' },
  ].filter(d => d.value > 0)

  // Payment breakdown from recent orders
  const paymentMap = {}
  orders.forEach(o => {
    if (o.paymentMethod) paymentMap[o.paymentMethod] = (paymentMap[o.paymentMethod] || 0) + 1
  })
  const paymentData = Object.entries(paymentMap).map(([id, count]) => {
    const pm = PAYMENT_METHODS.find(p => p.id === id)
    return { name: pm ? ln(pm.name) : id, value: count }
  })

  return (
    <div className="page-enter space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="demo-page-header text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('dashboard.subtitle')} · {new Date().toLocaleDateString(locale === 'bm' ? 'ms-MY' : locale === 'en' ? 'en-MY' : 'zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
        </div>
      </div>

      {/* KPI Cards — 2 rows × 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stagger-item">
          <KpiCard title={t('dashboard.revenue')} value={totalRevenue} prefix="RM " color="blue" hero trend={15}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dashboard.orders')} value={totalOrders} suffix={` ${t('dashboard.count')}`} color="green"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>}
          />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dashboard.avgOrder')} value={avgOrder} prefix="RM " color="amber"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dashboard.margin')} value={margin} suffix="%" color={margin > 50 ? 'green' : 'amber'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>}
          />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dashboard.sstCollected')} value={Math.round(totalSst)} prefix="RM " color="purple"
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>}
          />
        </div>
        <div className="stagger-item">
          <KpiCard title={t('dashboard.lowStock')} value={lowStockCount} suffix={` ${t('dashboard.items')}`} color={lowStockCount > 0 ? 'red' : 'green'}
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard title={`🔥 ${t('dashboard.hotSellers')}`} className="lg:col-span-2 stagger-item">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={salesRanking} layout="vertical" margin={{ left: 10, right: 20, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
              <XAxis type="number" tick={{ fill: theme.muted, fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={75} tick={{ fill: theme.label || theme.text, fontSize: 14, fontWeight: 700 }} />
              <Tooltip contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 13 }} />
              <Bar dataKey="count" name={t('reports.portions')} radius={[0, 6, 6, 0]} animationDuration={800}>
                {salesRanking.map((_, i) => (
                  <Cell key={i} fill={theme.colors[i % theme.colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`⏰ ${t('dashboard.timeAnalysis')}`} className="lg:col-span-2 stagger-item">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={timeSlots} margin={{ left: -10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: theme.muted, fontSize: 12 }} />
              <YAxis tick={{ fill: theme.muted, fontSize: 12 }} />
              <Tooltip contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 13 }} />
              <Bar dataKey="count" name={t('reports.orderCount2')} radius={[6, 6, 0, 0]} animationDuration={800}>
                {timeSlots.map((slot, i) => (
                  <Cell key={i} fill={slot.count >= 10 ? theme.primary : theme.colors[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`📦 ${t('dashboard.inventoryStatus')}`} className="lg:col-span-1 stagger-item">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={invData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" animationDuration={800}>
                {invData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col items-center gap-1.5 -mt-1">
            {invData.map(d => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Payment breakdown + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {paymentData.length > 0 && (
          <ChartCard title={`💳 ${t('dashboard.paymentBreakdown')}`} className="stagger-item">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" animationDuration={800}>
                  {paymentData.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 -mt-1">
              {paymentData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: PAYMENT_COLORS[i % PAYMENT_COLORS.length] }} />
                  {d.name} ({d.value})
                </span>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Recent Orders */}
        <Card className={`stagger-item ${paymentData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold heading-font">{t('dashboard.recentOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🍜</div>
                <p className="font-semibold heading-font">{t('dashboard.noOrders')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('dashboard.noOrdersHint')}</p>
              </div>
            ) : (
              <div className="space-y-0">
                {orders.slice(0, 5).map((order, idx) => {
                  const orderTypeObj = ORDER_TYPES.find(o => o.id === order.orderType)
                  const pmObj = PAYMENT_METHODS.find(p => p.id === order.paymentMethod)
                  return (
                    <div key={order.id} className={`flex items-center justify-between py-3 ${idx < Math.min(orders.length, 5) - 1 ? 'border-b border-border' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-8">#{order.id}</span>
                        {orderTypeObj && <span className="text-sm">{orderTypeObj.icon}</span>}
                        <span className="text-sm">
                          {order.items.map(i => `${menuName({ name: i.name }, locale)}×${i.qty}`).join('、')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {pmObj && <span className="text-xs">{pmObj.icon}</span>}
                        <span className="text-xs text-muted-foreground">{order.time}</span>
                        <span className="text-sm font-bold tabular-nums">RM {(order.total || order.subtotal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
