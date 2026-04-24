import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ToastProvider'
import { useFoodOpsStore } from '@/store'
import { STAFF, SHIFTS, DAYS, staffName, staffRole } from '@/data'
import { useI18n } from '@/i18n/I18nContext'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'

const SHIFT_STYLE = {
  morning: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', label: '早', darkBg: 'rgba(59,130,246,0.25)', darkText: '#93C5FD' },
  afternoon: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', label: '午', darkBg: 'rgba(245,158,11,0.25)', darkText: '#FCD34D' },
  evening: { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC', label: '晚', darkBg: 'rgba(129,140,248,0.25)', darkText: '#A5B4FC' },
}

function checkConflict(shifts) {
  if (shifts.length < 2) return false
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = SHIFTS.find(s => s.id === shifts[i])
      const b = SHIFTS.find(s => s.id === shifts[j])
      if (a && b && a.start < b.end && b.start < a.end) return true
    }
  }
  return false
}

// Helper to get shift name
function shiftName(shift, locale) {
  if (!shift?.name) return ''
  if (typeof shift.name === 'string') return shift.name
  return shift.name[locale] || shift.name.zh || ''
}

// Helper to get day name
function dayName(day, locale) {
  if (typeof day === 'string') return day
  return day[locale] || day.zh || ''
}

export function Schedule() {
  const { t, locale } = useI18n()
  const { isDark } = useDarkMode()
  const schedule = useFoodOpsStore(s => s.schedule)
  const updateSchedule = useFoodOpsStore(s => s.updateSchedule)
  const autoArrange = useFoodOpsStore(s => s.autoArrange)
  const { showChain } = useToast()
  const [arranging, setArranging] = useState(false)

  const toggleShift = (staffIdx, dayIdx, shiftId) => {
    const current = schedule[staffIdx][dayIdx]
    const hasShift = current.includes(shiftId)
    const updated = hasShift
      ? current.filter(s => s !== shiftId)
      : [...current, shiftId]
    updateSchedule(staffIdx, dayIdx, updated)
  }

  const handleAutoArrange = () => {
    setArranging(true)
    setTimeout(() => {
      autoArrange()
      setArranging(false)
      showChain([
        { text: `🤖 ${t('schedule.autoArrange')} ✅`, type: 'success' },
        { text: '📋 按角色偏好分配，每人5-6班/周', type: 'info' },
        { text: '✅ 无冲突，周末加强覆盖', type: 'info' },
      ])
      import('canvas-confetti').then(m => m.default({
        particleCount: 60, spread: 50, origin: { y: 0.7 },
        colors: ['#2563EB', '#10B981', '#F59E0B'],
      }))
    }, 800)
  }

  const coveragePerShift = DAYS.map((_, di) =>
    SHIFTS.map(shift => STAFF.filter((_, si) => schedule[si][di].includes(shift.id)).length)
  )
  const totalConflicts = STAFF.reduce((count, _, si) =>
    count + DAYS.reduce((c, _, di) => c + (checkConflict(schedule[si][di]) ? 1 : 0), 0), 0
  )
  const staffShiftCounts = STAFF.map((_, si) =>
    schedule[si].reduce((c, dayShifts) => c + dayShifts.length, 0)
  )

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="demo-page-header text-foreground">{t('schedule.title')}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString(locale === 'bm' ? 'ms-MY' : locale === 'en' ? 'en-MY' : 'zh-CN', { month: 'long' })} {t('schedule.subtitle')}
          </p>
        </div>
        <Button
          onClick={handleAutoArrange}
          disabled={arranging}
          size="lg"
          className="gap-2 shadow-lg"
          style={{ background: 'var(--color-primary)', fontSize: 15, padding: '10px 24px' }}
        >
          {arranging ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              {t('schedule.arranging')}
            </>
          ) : (
            <>🤖 {t('schedule.autoArrange')}</>
          )}
        </Button>
      </div>

      {/* Staff workload cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {STAFF.map((staff, si) => {
          const count = staffShiftCounts[si]
          const isLight = count < 4
          const isHeavy = count > 6
          const restDays = schedule[si].filter(d => d.length === 0).length
          const shiftBreakdown = {}
          schedule[si].forEach(day => day.forEach(s => { shiftBreakdown[s] = (shiftBreakdown[s] || 0) + 1 }))

          return (
            <div
              key={si}
              className="rounded-lg border border-border p-3"
              style={{
                boxShadow: 'var(--shadow-card)',
                background: isHeavy ? (isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.04)') : isLight ? (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.04)') : 'var(--color-card)',
                borderColor: isHeavy ? (isDark ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.2)') : isLight ? (isDark ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.2)') : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-sm heading-font">{staffName(staff, locale)}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{staffRole(staff, locale)}</span>
                </div>
                <span className={`text-lg font-bold tabular-nums heading-font ${isHeavy ? 'text-red-600' : isLight ? 'text-amber-600' : 'text-foreground'}`}>{count}</span>
              </div>
              <div className="flex gap-1">
                {['morning', 'afternoon', 'evening'].map(sid => {
                  const c = shiftBreakdown[sid] || 0
                  const s = SHIFT_STYLE[sid]
                  return (
                    <div key={sid} className="flex-1 rounded text-center py-0.5" style={{ background: c > 0 ? (isDark ? s.darkBg : s.bg) : (isDark ? 'rgba(255,255,255,0.06)' : 'var(--color-muted)'), fontSize: 11, fontWeight: 600, color: c > 0 ? (isDark ? s.darkText : s.text) : 'var(--color-muted-foreground)' }}>
                      {s.label}{c > 0 ? ` ${c}` : ''}
                    </div>
                  )
                })}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {restDays} {t('schedule.restDays')}
                {isHeavy && <span className="text-red-500 ml-1">· {t('schedule.tooMany')}</span>}
                {isLight && <span className="text-amber-500 ml-1">· {t('schedule.tooFew')}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {totalConflicts > 0 && (
        <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          {totalConflicts} {t('schedule.conflicts')}
        </div>
      )}

      {/* Schedule Grid */}
      <div className="rounded-lg border border-border overflow-x-auto" style={{ boxShadow: 'var(--shadow-card)' }}>
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'var(--color-muted)' }}>
              <th className="text-left p-3 font-semibold whitespace-nowrap border-b border-border sticky left-0 z-10 bg-muted" style={{ fontFamily: 'var(--font-heading)', width: 100 }}>{t('schedule.staff')}</th>
              {DAYS.map((day, di) => (
                <th key={di} className="text-center p-3 font-semibold whitespace-nowrap border-b border-border" style={{ fontFamily: 'var(--font-heading)' }}>
                  <div>{dayName(day, locale)}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {coveragePerShift[di].map((count, si) => (
                      <span key={si} className="rounded-full" style={{ width: 6, height: 6, background: count > 0 ? [SHIFT_STYLE.morning.border, SHIFT_STYLE.afternoon.border, SHIFT_STYLE.evening.border][si] : (isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB') }} />
                    ))}
                  </div>
                </th>
              ))}
              <th className="text-center p-3 font-semibold border-b border-border whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)', width: 60 }}>{t('schedule.totalShifts')}</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map((staff, si) => (
              <tr key={si} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 whitespace-nowrap sticky left-0 z-10 bg-card">
                  <div className="font-semibold" style={{ fontFamily: 'var(--font-heading)', fontSize: 14 }}>{staffName(staff, locale)}</div>
                  <div className="text-xs text-muted-foreground">{staffRole(staff, locale)}</div>
                </td>
                {DAYS.map((_, di) => {
                  const cellShifts = schedule[si][di]
                  const hasConflict = checkConflict(cellShifts)
                  const isRestDay = cellShifts.length === 0

                  return (
                    <td key={di} className="p-1.5 text-center" style={hasConflict ? { background: 'rgba(239,68,68,0.06)' } : undefined}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full rounded-lg p-2 transition-all duration-150 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer" style={{ minHeight: 44 }}>
                            {isRestDay ? (
                              <span className="text-xs text-muted-foreground/50">{t('schedule.rest')}</span>
                            ) : (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {cellShifts.map(shiftId => {
                                  const s = SHIFT_STYLE[shiftId]
                                  if (!s) return null
                                  const shift = SHIFTS.find(x => x.id === shiftId)
                                  return (
                                    <span key={shiftId} className="inline-flex items-center justify-center rounded-md text-xs font-semibold"
                                      style={{ background: hasConflict ? 'rgba(239,68,68,0.1)' : (isDark ? s.darkBg : s.bg), color: hasConflict ? '#DC2626' : (isDark ? s.darkText : s.text), border: `1px solid ${hasConflict ? '#FCA5A5' : (isDark ? 'transparent' : s.border)}`, padding: '3px 10px', fontSize: 12 }}>
                                      {shiftName(shift, locale)}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                            {hasConflict && <div className="text-[10px] text-red-500 font-semibold mt-0.5">⚠</div>}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-2" align="center">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 px-1" style={{ fontFamily: 'var(--font-heading)' }}>
                            {staffName(staff, locale)} · {dayName(DAYS[di], locale)}
                          </p>
                          <div className="space-y-1">
                            {SHIFTS.map(shift => {
                              const isActive = cellShifts.includes(shift.id)
                              const s = SHIFT_STYLE[shift.id]
                              const wouldConflict = !isActive && cellShifts.some(existing => {
                                const a = SHIFTS.find(x => x.id === existing)
                                return a && shift.start < a.end && a.start < shift.end
                              })
                              return (
                                <button
                                  key={shift.id}
                                  onClick={() => !wouldConflict && toggleShift(si, di, shift.id)}
                                  disabled={wouldConflict}
                                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${wouldConflict ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}`}
                                >
                                  <span className="w-3 h-3 rounded-sm border shrink-0" style={{ background: isActive ? (isDark ? s.darkBg : s.bg) : 'transparent', borderColor: wouldConflict ? (isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB') : s.border }} />
                                  <span className="flex-1 text-left">{shiftName(shift, locale)}</span>
                                  <span className="text-xs text-muted-foreground">{shift.time}</span>
                                  {isActive && <span className="text-emerald-500 text-xs">✓</span>}
                                </button>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                  )
                })}
                <td className="p-3 text-center">
                  <span className="tabular-nums font-semibold" style={{ fontSize: 15 }}>{staffShiftCounts[si]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {SHIFTS.map(shift => {
          const s = SHIFT_STYLE[shift.id]
          return (
            <span key={shift.id} className="flex items-center gap-1.5">
              <span className="inline-block rounded" style={{ width: 12, height: 12, background: s.bg, border: `1px solid ${s.border}` }} />
              {shiftName(shift, locale)} {shift.time}
            </span>
          )
        })}
      </div>
    </div>
  )
}
