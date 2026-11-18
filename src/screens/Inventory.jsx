import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchInput } from '@/components/SearchInput'
import { useFoodOpsStore } from '@/store'
import { ingredientName } from '@/data'
import { useI18n } from '@/i18n/I18nContext'
import { useToast } from '@/components/ToastProvider'

export function Inventory() {
  const { t, locale } = useI18n()
  const inventory = useFoodOpsStore(s => s.inventory)
  const restockItem = useFoodOpsStore(s => s.restockItem)
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [halalOnly, setHalalOnly] = useState(false)
  const [restockAmounts, setRestockAmounts] = useState({})

  const filtered = inventory.filter(item => {
    const name = ingredientName(item, locale)
    const nameZh = typeof item.name === 'string' ? item.name : item.name.zh
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || nameZh.includes(search)
    const matchHalal = !halalOnly || item.halal
    return matchSearch && matchHalal
  })

  const today = new Date()

  const handleRestock = (idx, name) => {
    const amount = restockAmounts[idx]
    if (!amount || amount <= 0) return
    restockItem(idx, amount)
    setRestockAmounts(prev => ({ ...prev, [idx]: '' }))
    addToast(`✅ ${name} +${amount}`, 'success')
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-lg font-bold heading-font">{t('inventory.title')}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHalalOnly(!halalOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap ${
              halalOnly
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'text-muted-foreground border-border hover:border-emerald-300'
            }`}
          >
            ☪ {t('inventory.halalFilter')}
          </button>
          <SearchInput value={search} onChange={setSearch} placeholder={t('inventory.search')} />
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden card-hover overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventory.name')}</TableHead>
              <TableHead className="text-center w-16">{t('inventory.halal')}</TableHead>
              <TableHead className="text-right">{t('inventory.stock')}</TableHead>
              <TableHead className="text-right">{t('inventory.minStock')}</TableHead>
              <TableHead className="w-32">{t('inventory.ratio')}</TableHead>
              <TableHead>{t('inventory.status')}</TableHead>
              <TableHead className="text-right">{t('inventory.costUnit')}</TableHead>
              <TableHead className="text-center">{t('inventory.certExpiry')}</TableHead>
              <TableHead className="text-center">{t('inventory.restock')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-6">{t('inventory.notFound')}</TableCell></TableRow>
            ) : filtered.map((item) => {
              const name = ingredientName(item, locale)
              const realIdx = inventory.indexOf(item)
              const ratio = Math.min(item.stock / (item.min * 2), 1) * 100
              const isLow = item.stock < item.min
              const isCritical = item.stock < item.min * 0.5

              let certStatus = null
              if (item.halalCertExpiry) {
                const expiry = new Date(item.halalCertExpiry)
                const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
                if (daysLeft < 0) certStatus = 'expired'
                else if (daysLeft < 90) certStatus = 'expiring'
              }

              return (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-center">
                    {item.halal ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">☪</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.stock} {item.unit}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{item.min} {item.unit}</TableCell>
                  <TableCell>
                    <Progress value={ratio} className={`h-2 ${isCritical ? '[&>div]:bg-red-500' : isLow ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
                  </TableCell>
                  <TableCell>
                    {isCritical ? (
                      <Badge variant="destructive">{t('inventory.critical')}</Badge>
                    ) : isLow ? (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">{t('inventory.low')}</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">{t('inventory.sufficient')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    RM {item.costPerUnit?.toFixed(2) || '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {!item.halalCertExpiry ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : certStatus === 'expired' ? (
                      <Badge variant="destructive" className="text-[10px]">{t('inventory.expired')}</Badge>
                    ) : certStatus === 'expiring' ? (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">{t('inventory.expiringSoon')}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{item.halalCertExpiry}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Popover>
                      <PopoverTrigger render={<Button variant="outline" size="sm" className="h-7 text-xs px-2.5" />}>
                        + {t('inventory.restock')}
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="end">
                        <p className="text-xs font-semibold mb-2 heading-font">{name}</p>
                        <div className="flex gap-1.5">
                          <Input
                            type="number"
                            min={1}
                            placeholder={t('inventory.restockAmount')}
                            value={restockAmounts[realIdx] || ''}
                            onChange={e => setRestockAmounts(prev => ({ ...prev, [realIdx]: Number(e.target.value) || '' }))}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            className="h-8 text-xs px-3 shrink-0"
                            onClick={() => handleRestock(realIdx, name)}
                            disabled={!restockAmounts[realIdx] || restockAmounts[realIdx] <= 0}
                          >
                            ✓
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {t('inventory.stock')}: {item.stock} {item.unit}
                        </p>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
