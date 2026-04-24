import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFoodOpsStore } from '@/store'
import { STAFF, SHIFTS, DAYS, staffName, staffRole } from '@/data'
import { useI18n } from '@/i18n/I18nContext'
import { useDarkMode } from '@/lib/hooks/use-dark-mode'

const SHIFT_STYLE = {
  morning: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD', darkBg: 'rgba(59,130,246,0.25)', darkText: '#93C5FD' },
  afternoon: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D', darkBg: 'rgba(245,158,11,0.25)', darkText: '#FCD34D' },
  evening: { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC', darkBg: 'rgba(129,140,248,0.25)', darkText: '#A5B4FC' },
}

function shiftLabel(shift, locale) {
  if (!shift?.name) return ''
  if (typeof shift.name === 'string') return shift.name
  return shift.name[locale] || shift.name.zh || ''
}

function dayLabel(day, locale) {
  if (typeof day === 'string') return day
  return day[locale] || day.zh || ''
}

export function Settings() {
  const { t, locale } = useI18n()
  const { isDark } = useDarkMode()
  const staffSettings = useFoodOpsStore(s => s.staffSettings)
  const scheduleConfig = useFoodOpsStore(s => s.scheduleConfig)
  const updateStaffSetting = useFoodOpsStore(s => s.updateStaffSetting)
  const updateScheduleConfig = useFoodOpsStore(s => s.updateScheduleConfig)

  const togglePreferredShift = (si, shiftId) => {
    const current = staffSettings[si].preferredShifts
    const updated = current.includes(shiftId)
      ? current.filter(s => s !== shiftId)
      : [...current, shiftId]
    updateStaffSetting(si, { preferredShifts: updated })
  }

  const toggleUnavailableDay = (si, dayIdx) => {
    const current = staffSettings[si].unavailableDays
    const updated = current.includes(dayIdx)
      ? current.filter(d => d !== dayIdx)
      : [...current, dayIdx]
    updateStaffSetting(si, { unavailableDays: updated })
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="demo-page-header text-foreground">{t('settings.title')}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Global constraints */}
      <Card className="card-hover">
        <CardContent style={{ padding: 24 }}>
          <h3 className="font-semibold heading-font mb-4" style={{ fontSize: 15 }}>{t('settings.globalRules')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>{t('settings.minCooks')}</Label>
              <Input type="number" min={0} max={3} value={scheduleConfig.minCooksPerShift}
                onChange={e => updateScheduleConfig({ minCooksPerShift: Number(e.target.value) || 0 })} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{t('settings.minCooksHint')}</p>
            </div>
            <div>
              <Label>{t('settings.weekdayStaff')}</Label>
              <Input type="number" min={1} max={5} value={scheduleConfig.minStaffPerShift}
                onChange={e => updateScheduleConfig({ minStaffPerShift: Number(e.target.value) || 1 })} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{t('settings.weekdayHint')}</p>
            </div>
            <div>
              <Label>{t('settings.weekendStaff')}</Label>
              <Input type="number" min={1} max={5} value={scheduleConfig.weekendStaffPerShift}
                onChange={e => updateScheduleConfig({ weekendStaffPerShift: Number(e.target.value) || 1 })} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{t('settings.weekendHint')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-staff settings */}
      <div className="space-y-4">
        <h3 className="font-semibold heading-font" style={{ fontSize: 15 }}>{t('settings.staffPrefs')}</h3>
        {STAFF.map((staff, si) => {
          const s = staffSettings[si]
          if (!s) return null
          return (
            <Card key={si} className="card-hover">
              <CardContent style={{ padding: 24 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="font-semibold heading-font" style={{ fontSize: 16 }}>{staffName(staff, locale)}</div>
                  <Badge variant="outline" className="text-xs">{staffRole(staff, locale)}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">{t('settings.maxShifts')}</Label>
                        <Input type="number" min={1} max={7} value={s.maxShiftsPerWeek}
                          onChange={e => updateStaffSetting(si, { maxShiftsPerWeek: Number(e.target.value) || 1 })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('settings.minRest')}</Label>
                        <Input type="number" min={0} max={4} value={s.minRestDays}
                          onChange={e => updateStaffSetting(si, { minRestDays: Number(e.target.value) || 0 })} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{t('settings.maxConsecutive')}</Label>
                        <Input type="number" min={1} max={7} value={s.maxConsecutiveDays}
                          onChange={e => updateStaffSetting(si, { maxConsecutiveDays: Number(e.target.value) || 1 })} className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">{t('settings.preferredShifts')}</Label>
                      <div className="flex gap-2">
                        {SHIFTS.map(shift => {
                          const active = s.preferredShifts.includes(shift.id)
                          const st = SHIFT_STYLE[shift.id]
                          return (
                            <button key={shift.id} onClick={() => togglePreferredShift(si, shift.id)}
                              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-all"
                              style={{ background: active ? (isDark ? st.darkBg : st.bg) : 'transparent', color: active ? (isDark ? st.darkText : st.text) : 'var(--color-muted-foreground)', borderColor: active ? (isDark ? 'transparent' : st.border) : 'var(--color-border)' }}>
                              {shiftLabel(shift, locale)}
                              {active && ' ✓'}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-2 block">{t('settings.unavailableDays')}</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAYS.map((day, di) => {
                        const unavailable = s.unavailableDays.includes(di)
                        return (
                          <button key={di} onClick={() => toggleUnavailableDay(si, di)}
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-all"
                            style={{ background: unavailable ? 'rgba(239,68,68,0.1)' : 'transparent', color: unavailable ? '#DC2626' : 'var(--color-muted-foreground)', borderColor: unavailable ? 'rgba(239,68,68,0.3)' : 'var(--color-border)' }}>
                            {dayLabel(day, locale)}
                            {unavailable && ' ✕'}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('settings.unavailableHint')}{s.unavailableDays.length === 0 ? t('settings.noFixedRest') : s.unavailableDays.map(d => dayLabel(DAYS[d], locale)).join('、')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
