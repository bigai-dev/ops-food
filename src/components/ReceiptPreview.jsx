import { useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BUSINESS_INFO, PAYMENT_METHODS, ORDER_TYPES, SST_RATE, menuName } from '@/data'
import { useFoodOpsStore } from '@/store'
import { useI18n } from '@/i18n/I18nContext'

export function ReceiptPreview({ order, open, onOpenChange }) {
  const { t, ln, locale } = useI18n()
  const receiptRef = useRef(null)
  const tableConfig = useFoodOpsStore(s => s.tableConfig)

  if (!order) return null

  const paymentLabel = PAYMENT_METHODS.find(p => p.id === order.paymentMethod)
  const orderTypeLabel = ORDER_TYPES.find(o => o.id === order.orderType)
  const table = order.tableId ? tableConfig.find(tc => tc.id === order.tableId) : null

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=320,height=600')
    if (!printWindow) return // pop-up blocked by the browser
    printWindow.document.write(`
      <html><head><title>Receipt #${order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; width: 280px; color: #000; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .item-row { display: flex; justify-content: space-between; padding: 1px 0; }
        .total-row { display: flex; justify-content: space-between; padding: 3px 0; font-weight: bold; font-size: 14px; }
        h2 { font-size: 16px; margin: 4px 0; }
        .small { font-size: 10px; color: #666; }
      </style></head><body>
      ${receiptRef.current?.innerHTML || ''}
      </body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 250)
  }

  const handleExportPdf = async () => {
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf(receiptRef.current, {
      margin: 4,
      filename: `receipt-${order.id}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' },
    })
  }

  const dateStr = order.date
    ? new Date(order.date).toLocaleString(locale === 'bm' ? 'ms-MY' : locale === 'en' ? 'en-MY' : 'zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : order.time

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>🧾 {t('receipt.title')} #{order.id}</DialogTitle>
        </DialogHeader>

        {/* Receipt content */}
        <div
          ref={receiptRef}
          className="bg-white text-black rounded-lg p-4 text-xs"
          style={{ fontFamily: "'Courier New', monospace", maxWidth: 300, margin: '0 auto' }}
        >
          {/* Header */}
          <div className="center bold" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 'bold', margin: '4px 0' }}>{ln(BUSINESS_INFO.name)}</h2>
            <p style={{ fontSize: 10, color: '#666' }}>{BUSINESS_INFO.address}</p>
            <p style={{ fontSize: 10, color: '#666' }}>Tel: {BUSINESS_INFO.phone}</p>
            <p style={{ fontSize: 10, color: '#666' }}>{t('receipt.sstReg')}: {BUSINESS_INFO.sstRegNo}</p>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Order info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.orderNo')}:</span>
            <span style={{ fontWeight: 'bold' }}>#{order.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.date')}:</span>
            <span>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.type')}:</span>
            <span>{orderTypeLabel ? `${orderTypeLabel.icon} ${ln(orderTypeLabel.name)}` : order.orderType}</span>
          </div>
          {order.tableId && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span>{t('receipt.table')}:</span>
              <span>T{order.tableId}{table ? ` (${table.seats} ${t('tables.seats')})` : ''}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.payment')}:</span>
            <span>{paymentLabel ? `${paymentLabel.icon} ${ln(paymentLabel.name)}` : order.paymentMethod}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Items */}
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <span>{menuName({ name: item.name }, locale)} ×{item.qty}</span>
              <span>RM {item.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.subtotal')}</span>
            <span>RM {order.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{t('receipt.sst', { rate: SST_RATE * 100 })}</span>
            <span>RM {order.sst.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', fontSize: 14 }}>
            <span>{t('receipt.total')}</span>
            <span>RM {order.total.toFixed(2)}</span>
          </div>

          <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 11, marginTop: 4 }}>
            {t('receipt.thankYou')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            🖨️ {t('receipt.print')}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleExportPdf}>
            📄 {t('receipt.exportPdf')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
