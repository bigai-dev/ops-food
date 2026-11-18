import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useFoodOpsStore } from '@/store'
import { MENU, menuName, PAYMENT_METHODS, ORDER_TYPES, SST_RATE } from '@/data'
import { useToast } from '@/components/ToastProvider'
import { useI18n } from '@/i18n/I18nContext'
import { ReceiptPreview } from '@/components/ReceiptPreview'

export function Orders() {
  const { t, ln, locale } = useI18n()
  const [currentOrder, setCurrentOrder] = useState({})
  const [orderType, setOrderType] = useState('dine-in')
  const [tableId, setTableId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [lastOrder, setLastOrder] = useState(null)
  const [showReceipt, setShowReceipt] = useState(false)

  const submitOrder = useFoodOpsStore(s => s.submitOrder)
  const tables = useFoodOpsStore(s => s.tables)
  const tableConfig = useFoodOpsStore(s => s.tableConfig) || []
  const { showChain } = useToast()

  const changeQty = (id, delta) => {
    setCurrentOrder(prev => {
      const current = prev[id] || 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) delete updated[id]
      else updated[id] = next
      return updated
    })
  }

  const orderItems = Object.entries(currentOrder).filter(([, qty]) => qty > 0)
  const subtotal = orderItems.reduce((sum, [id, qty]) => {
    const item = MENU.find(m => m.id === Number(id))
    return sum + (item ? item.price * qty : 0)
  }, 0)
  const sst = +(subtotal * SST_RATE).toFixed(2)
  const total = +(subtotal + sst).toFixed(2)

  const handleSubmit = () => {
    if (orderItems.length === 0) return
    if (orderType === 'dine-in' && !tableId) return

    const order = submitOrder(currentOrder, { orderType, tableId, paymentMethod })
    if (!order) return

    setCurrentOrder({})
    setLastOrder(order)
    setTableId(null)

    showChain([
      { text: `✅ ${t('orders.submitted')} #${order.id} — RM ${order.total.toFixed(2)}`, type: 'success' },
      { text: `📦 ${t('orders.inventoryDeducted')}`, type: 'info' },
      { text: `📊 ${t('orders.dashboardUpdated')}`, type: 'info' },
    ])

    import('canvas-confetti').then(m => m.default({
      particleCount: 80, spread: 60, origin: { y: 0.7 },
      colors: ['#B64E10', '#E99541', '#389469', '#E7BF57'],
    }))
  }

  return (
    <div className="page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 heading-font">{t('orders.menu')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {MENU.map(item => {
              const qty = currentOrder[item.id] || 0
              return (
                <Card key={item.id} className="card-hover overflow-hidden cursor-default">
                  <div className="menu-thumb relative flex items-center justify-center" style={{ '--thumb': item.bg, height: 64, borderRadius: '8px 8px 0 0', fontSize: 36 }}>
                    {item.emoji}
                    {/* Halal badge */}
                    <span
                      className={`absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.halal
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-300'
                      }`}
                    >
                      {item.halal ? t('orders.halal') : t('orders.nonHalal')}
                    </span>
                  </div>
                  <CardContent style={{ padding: 16 }}>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 700 }} className="truncate">
                      {menuName(item, locale)}
                    </p>
                    <p className="menu-price" style={{ fontSize: 13, marginTop: 2 }}>RM {item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-sm" onClick={() => changeQty(item.id, -1)} disabled={qty === 0}>-</Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-sm" onClick={() => changeQty(item.id, 1)}>+</Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-lg font-bold mb-4 heading-font">{t('orders.currentOrder')}</h2>
          <Card>
            <CardContent className="p-4">
              {orderItems.length === 0 && !lastOrder ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">👈</div>
                  <p className="font-medium text-sm">{t('orders.selectHint')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t('orders.addHint')}</p>
                </div>
              ) : orderItems.length === 0 && lastOrder ? (
                /* Post-order: show receipt button */
                <div className="text-center py-6 space-y-3">
                  <div className="text-4xl">✅</div>
                  <p className="font-semibold heading-font">{t('orders.submitted')} #{lastOrder.id}</p>
                  <p className="text-lg font-bold">RM {lastOrder.total.toFixed(2)}</p>
                  <Button variant="outline" className="w-full" onClick={() => setShowReceipt(true)}>
                    🧾 {t('orders.viewReceipt')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Order Type */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('orders.orderType')}</p>
                    <div className="flex gap-1.5">
                      {ORDER_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => { setOrderType(type.id); if (type.id !== 'dine-in') setTableId(null) }}
                          className={`flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-all text-center ${
                            orderType === type.id
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <span className="block text-base">{type.icon}</span>
                          {ln(type.name)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table selector (dine-in only) */}
                  {orderType === 'dine-in' && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('orders.selectTable')}</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {tableConfig.map((table, idx) => {
                          const isOccupied = tables[idx] !== null
                          const isSelected = tableId === table.id
                          return (
                            <button
                              key={table.id}
                              disabled={isOccupied}
                              onClick={() => setTableId(table.id)}
                              className={`rounded-lg border p-1.5 text-xs font-medium transition-all ${
                                isSelected ? 'bg-primary text-primary-foreground border-primary'
                                  : isOccupied ? 'opacity-40 cursor-not-allowed bg-muted'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              T{table.id}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Payment method */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('orders.paymentMethod')}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PAYMENT_METHODS.map(pm => (
                        <button
                          key={pm.id}
                          onClick={() => setPaymentMethod(pm.id)}
                          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-all text-center ${
                            paymentMethod === pm.id
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <span className="mr-1">{pm.icon}</span>
                          {ln(pm.name)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Items */}
                  {orderItems.map(([id, qty]) => {
                    const item = MENU.find(m => m.id === Number(id))
                    if (!item) return null
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <p className="text-sm font-medium">{menuName(item, locale)}</p>
                            <p className="text-xs text-muted-foreground">×{qty}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">RM {(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}

                  <Separator />

                  {/* Totals with SST */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('orders.subtotal')}</span>
                      <span className="tabular-nums">RM {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('orders.sst', { rate: SST_RATE * 100 })}</span>
                      <span className="tabular-nums">RM {sst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>{t('orders.total')}</span>
                      <span className="tabular-nums">RM {total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={orderType === 'dine-in' && !tableId}
                  >
                    {t('orders.submit')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      {lastOrder && (
        <ReceiptPreview
          order={lastOrder}
          open={showReceipt}
          onOpenChange={setShowReceipt}
        />
      )}
    </div>
  )
}
