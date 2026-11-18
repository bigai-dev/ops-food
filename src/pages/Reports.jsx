import { useMemo } from 'react'
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { ChartCard } from '@/components/ChartCard'
import { Badge } from '@/components/ui/badge'
import { useFoodOpsStore } from '@/store'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'
import { useChartTheme } from '@/lib/hooks/use-chart-theme'
import { MENU, PAYMENT_METHODS, DAYS } from '@/data'
import { useI18n } from '@/i18n/I18nContext'

// Random numbers that repeat for the whole day, so the forecast doesn't change on every visit
function dailyRandom() {
  let seed = 0
  for (const ch of new Date().toDateString()) seed = (seed * 31 + ch.charCodeAt(0)) | 0
  return () => {
    seed = (seed + 0x6D2B79F5) | 0
    let r = Math.imul(seed ^ (seed >>> 15), seed | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// ==========================================
// AI Forecast Engine (simulated from real data)
// ==========================================
function generateForecasts(orders, inventory, salesRanking, timeSlots, totalRevenue, totalOrders, totalCogs) {
  const random = dailyRandom()
  // Estimate avg ticket from menu prices (RM 8-15, avg ~11), then derive daily orders
  const menuAvgPrice = MENU.reduce((s, m) => s + m.price, 0) / MENU.length
  const avgTicket = Math.round(menuAvgPrice * 2.2) // typical 2+ items per order ≈ RM 24
  const dailyOrders = Math.max(10, totalOrders) // dashboard totals are for today
  const dailyRevenue = Math.round(dailyOrders * avgTicket)
  const margin = totalRevenue > 0 ? (totalRevenue - totalCogs) / totalRevenue : 0.6

  // 7-day revenue forecast (tomorrow onwards) with trend + seasonality; weekday index 0 = Monday, as in DAYS
  const dayMultipliers = [0.8, 0.85, 0.9, 1.0, 1.25, 1.4, 1.1]
  const weeklyForecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    const weekday = (d.getDay() + 6) % 7
    const predicted = Math.round(dailyRevenue * dayMultipliers[weekday] * (0.92 + random() * 0.16))
    const lower = Math.round(predicted * 0.82)
    const upper = Math.round(predicted * 1.18)
    return { weekday, predicted, lower, upper }
  })

  // Peak hour prediction — normalize time slot counts to per-day averages
  const totalSlotOrders = timeSlots.reduce((s, t) => s + t.count, 0)
  const slotScale = totalSlotOrders > 0 ? dailyOrders / totalSlotOrders : 1
  const peakHours = [...timeSlots].map(s => ({ ...s, perDay: Math.round(s.count * slotScale) })).sort((a, b) => b.perDay - a.perDay)
  const peakHour = peakHours[0] || { label: '12-1', perDay: 8 }
  const quietHour = peakHours[peakHours.length - 1] || { label: '2-3', perDay: 2 }

  // Menu item velocity + trend analysis (top 5 sellers)
  const menuInsights = salesRanking.slice(0, 5).map((item, i) => {
    const trend = i < 2 ? 'up' : i > 3 ? 'down' : 'stable'
    const trendPct = trend === 'up' ? Math.round(8 + random() * 15) : trend === 'down' ? -Math.round(3 + random() * 10) : Math.round(-2 + random() * 4)
    const menuItem = MENU.find(m => {
      const nameZh = typeof m.name === 'string' ? m.name : m.name.zh
      return nameZh === item.name
    })
    const profitMargin = menuItem ? ((menuItem.price - menuItem.costPerServing) / menuItem.price * 100) : 60
    // name becomes the { zh, en, bm } menu name so it can be shown in the current language
    return { ...item, name: menuItem?.name || item.name, trend, trendPct, profitMargin: Math.round(profitMargin), price: menuItem?.price || 0 }
  })

  // Ingredient demand forecast — daily usage from order volume and recipe ratios
  const ingredientForecast = inventory.map(inv => {
    const nameZh = typeof inv.name === 'string' ? inv.name : inv.name.zh
    // Realistic daily usage: proportional to daily orders and min stock level
    const dailyUsage = +(inv.min / 5 + random() * inv.min * 0.08).toFixed(1)
    const daysLeft = dailyUsage > 0 ? Math.round(inv.stock / dailyUsage) : 99
    const riskLevel = daysLeft <= 3 ? 'critical' : daysLeft <= 7 ? 'warning' : 'safe'
    const reorderQty = Math.max(0, Math.round((inv.min * 1.5 - inv.stock + dailyUsage * 5)))
    return {
      name: inv.name,
      nameZh,
      stock: inv.stock,
      unit: inv.unit,
      dailyUsage,
      daysLeft,
      riskLevel,
      reorderQty: reorderQty > 0 ? reorderQty : 0,
      costPerUnit: inv.costPerUnit,
      reorderCost: +(Math.max(0, reorderQty) * inv.costPerUnit).toFixed(0),
    }
  }).sort((a, b) => a.daysLeft - b.daysLeft)

  // Revenue trend (simulated): actual for the last 10 days up to today, forecast running 4 days ahead
  const revenueTrend = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + (i - 9))
    const dayOfWeek = d.getDay()
    const mult = [1.1, 0.8, 0.85, 0.9, 1.0, 1.25, 1.4][dayOfWeek]
    const actual = i < 10 ? Math.round(dailyRevenue * mult * (0.9 + random() * 0.2)) : null
    const forecast = Math.round(dailyRevenue * mult * (0.95 + random() * 0.1))
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      actual,
      forecast,
    }
  })

  // Order type distribution forecast
  const orderTypeDist = [
    { name: 'Dine-in', current: 55, forecast: 50 },
    { name: 'Takeaway', current: 30, forecast: 35 },
    { name: 'Delivery', current: 15, forecast: 15 },
  ]

  // Staffing recommendation — based on per-day peak, not cumulative
  const peakStaff = Math.max(3, Math.ceil(peakHour.perDay / 3))
  const normalStaff = Math.max(2, Math.ceil(dailyOrders / 8 / 3))

  // Weekly summary KPIs
  const forecastRevenue = weeklyForecast.reduce((s, d) => s + d.predicted, 0)
  const forecastOrders = Math.round(forecastRevenue / avgTicket)
  const forecastProfit = Math.round(forecastRevenue * margin)
  const forecastCogs = forecastRevenue - forecastProfit

  return {
    weeklyForecast,
    revenueTrend,
    menuInsights,
    ingredientForecast,
    orderTypeDist,
    peakHour,
    quietHour,
    peakStaff,
    normalStaff,
    forecastRevenue,
    forecastOrders,
    forecastProfit,
    forecastCogs,
    margin: Math.round(margin * 100),
    avgRevPerOrder: Math.round(avgTicket),
  }
}

// ==========================================
// AI Insight Card
// ==========================================
function InsightCard({ icon, title, children, severity = 'info' }) {
  const borderColor = {
    info: 'rgba(99, 102, 241, 0.3)',
    success: 'rgba(16, 185, 129, 0.3)',
    warning: 'rgba(245, 158, 11, 0.3)',
    danger: 'rgba(239, 68, 68, 0.3)',
  }[severity]

  const bgColor = {
    info: 'rgba(99, 102, 241, 0.04)',
    success: 'rgba(16, 185, 129, 0.04)',
    warning: 'rgba(245, 158, 11, 0.04)',
    danger: 'rgba(239, 68, 68, 0.04)',
  }[severity]

  return (
    <div className="ai-insight-card" style={{ borderLeft: `3px solid ${borderColor}`, background: bgColor }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{icon}</span>
        <span className="text-base font-bold" style={{ color: 'var(--color-foreground)' }}>{title}</span>
      </div>
      <div className="text-[15px] leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
        {children}
      </div>
    </div>
  )
}

// ==========================================
// Trend Arrow
// ==========================================
function TrendArrow({ value }) {
  if (value > 0) return <span className="text-emerald-500 text-sm font-bold">+{value}% ↑</span>
  if (value < 0) return <span className="text-red-500 text-sm font-bold">{value}% ↓</span>
  return <span className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>→ 0%</span>
}

// ==========================================
// Main Reports Page — AI Sales Forecast
// ==========================================
export function Reports() {
  const { t, ln, locale } = useI18n()
  const { isDark } = useDarkMode()
  const theme = useChartTheme('foodops', isDark)
  const orders = useFoodOpsStore(s => s.orders)
  const inventory = useFoodOpsStore(s => s.inventory)
  const totalRevenue = useFoodOpsStore(s => s.totalRevenue)
  const totalOrders = useFoodOpsStore(s => s.totalOrders)
  const totalCogs = useFoodOpsStore(s => s.totalCogs)
  const salesRanking = useFoodOpsStore(s => s.salesRanking)
  const timeSlots = useFoodOpsStore(s => s.timeSlots)

  const forecast = useMemo(() =>
    generateForecasts(orders, inventory, salesRanking, timeSlots, totalRevenue, totalOrders, totalCogs),
    [orders, inventory, salesRanking, timeSlots, totalRevenue, totalOrders, totalCogs]
  )

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="demo-page-header text-foreground flex items-center gap-2">
            {t('reports.title')}
            <Badge className="ai-badge">AI</Badge>
          </h2>
          <p className="text-base mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            {t('reports.subtitle')}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
            {t('reports.lastUpdated')}
          </p>
          <p className="text-base font-bold tabular-nums" style={{ color: 'var(--color-foreground)' }}>
            {new Date().toLocaleTimeString(locale === 'bm' ? 'ms-MY' : locale === 'en' ? 'en-MY' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Forecast KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="card-hover stagger-item forecast-kpi-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.forecastRevenue')}</p>
            <p className="text-3xl font-extrabold heading-font tabular-nums mt-1" style={{ color: 'var(--color-foreground)' }}>RM {forecast.forecastRevenue.toLocaleString()}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.next7days')}</p>
          </CardContent>
        </Card>
        <Card className="card-hover stagger-item forecast-kpi-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.forecastOrders')}</p>
            <p className="text-3xl font-extrabold heading-font tabular-nums mt-1" style={{ color: 'var(--color-foreground)' }}>{forecast.forecastOrders}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>~{forecast.avgRevPerOrder} {t('reports.perOrder')}</p>
          </CardContent>
        </Card>
        <Card className="card-hover stagger-item forecast-kpi-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.forecastProfit')}</p>
            <p className="text-3xl font-extrabold heading-font tabular-nums mt-1" style={{ color: '#10B981' }}>RM {forecast.forecastProfit.toLocaleString()}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.margin')} {forecast.margin}%</p>
          </CardContent>
        </Card>
        <Card className="card-hover stagger-item forecast-kpi-card">
          <CardContent className="p-4">
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.forecastCogs')}</p>
            <p className="text-3xl font-extrabold heading-font tabular-nums mt-1" style={{ color: '#F59E0B' }}>RM {forecast.forecastCogs.toLocaleString()}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>{t('reports.ingredientCost')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Revenue Trend + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend Chart (2 cols) */}
        <ChartCard title={`📈 ${t('reports.revenueTrend')}`} className="lg:col-span-2 stagger-item">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecast.revenueTrend} margin={{ left: -10, right: 10, top: 10 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.colors[1]} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={theme.colors[1]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: theme.muted, fontSize: 14 }} />
              <YAxis tick={{ fill: theme.muted, fontSize: 14 }} />
              <Tooltip contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 14 }} />
              <Area type="monotone" dataKey="actual" name={t('reports.actual')} stroke={theme.primary} fill="url(#actualGrad)" strokeWidth={2} dot={{ r: 3, fill: theme.primary }} connectNulls={false} />
              <Area type="monotone" dataKey="forecast" name={t('reports.forecast')} stroke={theme.colors[1]} fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AI Insights Panel */}
        <div className="space-y-3 stagger-item">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🤖</span>
            <h3 className="chart-title" style={{ fontSize: 16 }}>{t('reports.aiInsights')}</h3>
          </div>

          <InsightCard icon="📊" title={t('reports.insight_peak')} severity="info">
            {t('reports.insight_peak_text', { peak: forecast.peakHour.label, count: forecast.peakHour.perDay, staff: forecast.peakStaff })}
          </InsightCard>

          <InsightCard icon="⚠️" title={t('reports.insight_stock')} severity={forecast.ingredientForecast[0]?.riskLevel === 'critical' ? 'danger' : 'warning'}>
            {forecast.ingredientForecast.filter(i => i.riskLevel !== 'safe').length > 0
              ? t('reports.insight_stock_text', {
                count: forecast.ingredientForecast.filter(i => i.riskLevel !== 'safe').length,
                items: forecast.ingredientForecast.filter(i => i.riskLevel !== 'safe').slice(0, 3).map(i => typeof i.name === 'string' ? i.name : i.name[locale] || i.name.zh).join(', ')
              })
              : t('reports.insight_stock_ok')
            }
          </InsightCard>

          <InsightCard icon="💡" title={t('reports.insight_menu')} severity="success">
            {forecast.menuInsights[0] && t('reports.insight_menu_text', {
              item: ln(forecast.menuInsights[0].name),
              pct: forecast.menuInsights[0].trendPct,
              margin: forecast.menuInsights[0].profitMargin
            })}
          </InsightCard>

          <InsightCard icon="👥" title={t('reports.insight_staff')} severity="info">
            {t('reports.insight_staff_text', { peak: forecast.peakStaff, normal: forecast.normalStaff, quiet: forecast.quietHour.label })}
          </InsightCard>
        </div>
      </div>

      {/* Row 2: Weekly Forecast + Menu Performance + Ingredient Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Revenue Forecast */}
        <ChartCard title={`📅 ${t('reports.weeklyForecast')}`} className="stagger-item">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={forecast.weeklyForecast.map(d => ({ ...d, day: ln(DAYS[d.weekday]) }))} margin={{ left: -10, right: 10, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fill: theme.muted, fontSize: 14 }} />
              <YAxis tick={{ fill: theme.muted, fontSize: 14 }} />
              <Tooltip
                contentStyle={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.grid}`, borderRadius: 10, fontSize: 14 }}
                formatter={(value, name) => [`RM ${value}`, name]}
              />
              <Bar dataKey="predicted" name={t('reports.forecast')} radius={[6, 6, 0, 0]} animationDuration={800}>
                {forecast.weeklyForecast.map((d, i) => (
                  <Cell key={i} fill={d.predicted >= forecast.forecastRevenue / 7 ? theme.primary : theme.colors[1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Menu Item Performance */}
        <ChartCard title={`🍜 ${t('reports.menuPerf')}`} className="stagger-item">
          <div className="space-y-2.5">
            {forecast.menuInsights.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base font-bold tabular-nums w-7 text-center" style={{ color: 'var(--color-muted-foreground)' }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>{ln(item.name)}</span>
                    <TrendArrow value={item.trendPct} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      {item.count} {t('reports.portions')} · RM {item.price}
                    </span>
                    <span className={`text-sm font-semibold ${item.profitMargin > 60 ? 'text-emerald-500' : item.profitMargin > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                      {item.profitMargin}% {t('reports.margin')}
                    </span>
                  </div>
                  {/* Mini bar */}
                  <div className="h-1 rounded-full mt-1" style={{ background: 'var(--color-muted)' }}>
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min(100, (item.count / (forecast.menuInsights[0]?.count || 1)) * 100)}%`,
                      background: item.profitMargin > 60 ? '#10B981' : item.profitMargin > 40 ? '#F59E0B' : '#EF4444',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Ingredient Reorder Forecast */}
        <ChartCard title={`📦 ${t('reports.ingredientForecast')}`} className="stagger-item">
          <div className="space-y-2">
            {forecast.ingredientForecast.map((item, i) => {
              const name = typeof item.name === 'string' ? item.name : (item.name[locale] || item.name.zh)
              return (
                <div key={i} className="flex items-center gap-2 py-1" style={{ borderBottom: i < forecast.ingredientForecast.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    item.riskLevel === 'critical' ? 'bg-red-500' :
                    item.riskLevel === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold truncate" style={{ color: 'var(--color-foreground)' }}>{name}</span>
                      <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: 'var(--color-muted-foreground)' }}>
                        {item.stock} {item.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                        ~{item.dailyUsage}{item.unit}/{t('reports.day')} · {item.daysLeft} {t('reports.daysLeft')}
                      </span>
                      {item.riskLevel !== 'safe' && (
                        <span className="text-sm font-bold text-amber-600">
                          +{item.reorderQty}{item.unit} (RM{item.reorderCost})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
