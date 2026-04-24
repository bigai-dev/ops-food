import { useFoodOpsStore } from '@/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { KDS_STATUSES, KDS_STATUS_CONFIG, ORDER_TYPES, menuName } from '@/data'
import { useI18n } from '@/i18n/I18nContext'

function elapsed(timestamp) {
  if (!timestamp) return ''
  const diff = Math.floor((Date.now() - timestamp) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

export function Kitchen() {
  const { t, ln, locale } = useI18n()
  const orders = useFoodOpsStore(s => s.orders)
  const advanceOrderStatus = useFoodOpsStore(s => s.advanceOrderStatus)

  return (
    <div className="page-enter space-y-5">
      <div>
        <h2 className="demo-page-header text-foreground">{t('kitchen.title')}</h2>
        <p className="text-muted-foreground text-sm mt-0.5">{t('kitchen.subtitle')}</p>
      </div>

      {/* Mobile: tabs; Desktop: columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KDS_STATUSES.map(status => {
          const config = KDS_STATUS_CONFIG[status]
          const statusOrders = orders.filter(o => o.status === status)
          const isLast = status === 'served'

          return (
            <div key={status} className="space-y-3">
              {/* Column header */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: config.color }}
                />
                <h3 className="font-semibold heading-font text-sm">
                  {ln(config.label)}
                </h3>
                <Badge variant="outline" className="text-xs ml-auto">
                  {statusOrders.length}
                </Badge>
              </div>

              {/* Order cards */}
              <div className="space-y-2 min-h-30">
                {statusOrders.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                    {t('kitchen.noOrders')}
                  </div>
                )}

                {statusOrders.map(order => {
                  const orderTypeObj = ORDER_TYPES.find(o => o.id === order.orderType)
                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        status === 'new' ? 'kds-pulse' : ''
                      } ${isLast ? 'opacity-60' : ''}`}
                      style={{
                        borderLeft: `3px solid ${config.color}`,
                      }}
                      onClick={() => !isLast && advanceOrderStatus(order.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold heading-font text-sm">#{order.id}</span>
                          <div className="flex items-center gap-1.5">
                            {order.tableId && (
                              <Badge variant="outline" className="text-[10px] px-1.5">
                                {t('kitchen.table')} {order.tableId}
                              </Badge>
                            )}
                            {orderTypeObj && (
                              <span className="text-xs">{orderTypeObj.icon}</span>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-0.5">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span>{menuName({ name: item.name }, locale)} ×{item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>RM {order.total.toFixed(2)}</span>
                          <span>{elapsed(order.timestamp)} {t('kitchen.ago')}</span>
                        </div>

                        {/* Action hint */}
                        {!isLast && (
                          <div
                            className="text-[10px] font-medium text-center rounded py-0.5 mt-1"
                            style={{ background: config.bg, color: config.color }}
                          >
                            → {ln(KDS_STATUS_CONFIG[KDS_STATUSES[KDS_STATUSES.indexOf(status) + 1]]?.label)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
