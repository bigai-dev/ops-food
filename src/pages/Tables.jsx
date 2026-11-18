import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useFoodOpsStore } from '@/store'
import { menuName } from '@/data'
import { useI18n } from '@/i18n/I18nContext'

// ==========================================
// Table shape SVG — distinct shapes per size
// ==========================================
function TableShape({ seats, isOccupied, size = 'normal' }) {
  const fill = isOccupied ? 'var(--table-occupied-fill)' : 'var(--table-available-fill)'
  const stroke = isOccupied ? 'var(--table-occupied-stroke)' : 'var(--table-available-stroke)'

  const scale = size === 'large' ? 1.3 : 1

  if (seats <= 2) {
    return (
      <svg viewBox="0 0 80 80" style={{ width: 56 * scale, height: 56 * scale }}>
        <circle cx="40" cy="8" r="7" fill={stroke} opacity="0.5" />
        <circle cx="40" cy="72" r="7" fill={stroke} opacity="0.5" />
        <circle cx="40" cy="40" r="22" fill={fill} stroke={stroke} strokeWidth="2.5" />
      </svg>
    )
  }
  if (seats <= 4) {
    return (
      <svg viewBox="0 0 90 90" style={{ width: 64 * scale, height: 64 * scale }}>
        <circle cx="45" cy="8" r="7" fill={stroke} opacity="0.5" />
        <circle cx="45" cy="82" r="7" fill={stroke} opacity="0.5" />
        <circle cx="8" cy="45" r="7" fill={stroke} opacity="0.5" />
        <circle cx="82" cy="45" r="7" fill={stroke} opacity="0.5" />
        <rect x="18" y="18" width="54" height="54" rx="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
      </svg>
    )
  }
  if (seats <= 6) {
    return (
      <svg viewBox="0 0 110 80" style={{ width: 80 * scale, height: 58 * scale }}>
        <circle cx="37" cy="7" r="6.5" fill={stroke} opacity="0.5" />
        <circle cx="73" cy="7" r="6.5" fill={stroke} opacity="0.5" />
        <circle cx="37" cy="73" r="6.5" fill={stroke} opacity="0.5" />
        <circle cx="73" cy="73" r="6.5" fill={stroke} opacity="0.5" />
        <circle cx="7" cy="40" r="6.5" fill={stroke} opacity="0.5" />
        <circle cx="103" cy="40" r="6.5" fill={stroke} opacity="0.5" />
        <rect x="17" y="16" width="76" height="48" rx="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 130 80" style={{ width: 96 * scale, height: 58 * scale }}>
      <circle cx="35" cy="7" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="65" cy="7" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="95" cy="7" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="35" cy="73" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="65" cy="73" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="95" cy="73" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="7" cy="40" r="6.5" fill={stroke} opacity="0.5" />
      <circle cx="123" cy="40" r="6.5" fill={stroke} opacity="0.5" />
      <rect x="17" y="16" width="96" height="48" rx="10" fill={fill} stroke={stroke} strokeWidth="2.5" />
    </svg>
  )
}

// ==========================================
// Grid View — Sortable Table Card
// ==========================================
function SortableTableCard({ table, index, isEditMode, isOccupied, order, onCardClick, onFree, onRemove, onSeatsChange, t, locale }) {
  const handleElRef = useRef(null)
  const { ref, isDragging } = useSortable({
    id: table.id,
    index,
    disabled: !isEditMode,
    handle: handleElRef,
  })

  return (
    <div
      ref={ref}
      className={`table-card-wrapper stagger-item ${isDragging ? 'table-dragging' : ''} ${isEditMode ? 'edit-mode-card' : ''}`}
    >
      <TableCardInner
        table={table}
        isEditMode={isEditMode}
        isOccupied={isOccupied}
        order={order}
        onCardClick={onCardClick}
        onFree={onFree}
        onRemove={onRemove}
        onSeatsChange={onSeatsChange}
        handleRef={handleElRef}
        t={t}
        locale={locale}
      />
    </div>
  )
}

// ==========================================
// Shared card inner (used by grid + floor plan)
// ==========================================
function TableCardInner({ table, isEditMode, isOccupied, order, onCardClick, onFree, onRemove, onSeatsChange, handleRef, t, locale, compact = false }) {
  return (
    <div
      className={`table-card ${isOccupied ? 'table-card--occupied' : 'table-card--available'} ${!isEditMode ? 'table-card--interactive' : ''}`}
      onClick={() => !isEditMode && onCardClick()}
    >
      <div className={`table-card__status-strip ${isOccupied ? 'table-card__status-strip--occupied' : 'table-card__status-strip--available'}`} />
      <div className="table-card__content">
        {/* Drag handle area — only this part triggers DnD */}
        <div ref={isEditMode ? handleRef : undefined} style={isEditMode ? { cursor: 'grab' } : undefined}>
          <div className="flex items-center justify-between mb-2">
            <span className="table-card__number">T{table.id}</span>
            <Badge className={`table-card__badge ${isOccupied ? 'table-card__badge--occupied' : 'table-card__badge--available'}`}>
              {isOccupied ? t('tables.occupied') : t('tables.available')}
            </Badge>
          </div>

          <div className="table-card__visual">
            <TableShape seats={table.seats} isOccupied={isOccupied} />
          </div>
        </div>

        {isEditMode ? (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button type="button" className="table-action-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onSeatsChange(table.seats - 1) }}>-</button>
            <span className="text-xs font-semibold tabular-nums w-12 text-center">{table.seats} {t('tables.seats')}</span>
            <button type="button" className="table-action-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onSeatsChange(table.seats + 1) }}>+</button>
          </div>
        ) : (
          <p className="text-xs text-center mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {table.seats} {t('tables.seats')}
          </p>
        )}

        {!isEditMode && order && !compact && (
          <div className="table-card__order-preview">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>#{order.id}</span>
              <span className="text-xs font-bold tabular-nums">RM {(order.total || order.subtotal || 0).toFixed(2)}</span>
            </div>
            <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              {order.items.map(i => menuName({ name: i.name }, locale)).join(', ')}
            </p>
          </div>
        )}

        {isEditMode && !isOccupied && (
          <button type="button" className="table-action-btn table-action-btn--danger w-full mt-2" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onRemove() }}>
            {t('tables.removeTable')}
          </button>
        )}

        {!isEditMode && isOccupied && (
          <button type="button" className="table-action-btn table-action-btn--outline w-full mt-2" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); e.preventDefault(); onFree() }}>
            {t('tables.free')}
          </button>
        )}
      </div>
    </div>
  )
}

// ==========================================
// Floor Plan — Draggable Table on Canvas
// ==========================================

// Smallest table card height on the floor plan — used to pull tables saved outside the floor back into view
const MIN_TABLE_HEIGHT = 130

// Where a dragged table lands for this pointer position, kept inside the floor so it can't be dropped out of sight
function floorPosition(e, el, offset) {
  const floor = el.parentElement
  const rect = floor.getBoundingClientRect()
  const x = e.clientX - rect.left - floor.clientLeft - offset.x
  const y = e.clientY - rect.top - floor.clientTop - offset.y
  return {
    x: Math.max(0, Math.min(floor.clientWidth - el.offsetWidth, x)),
    y: Math.max(0, Math.min(floor.clientHeight - el.offsetHeight, y)),
  }
}

// First spot on the default layout grid that fits on the floor and doesn't overlap another table
function findFreeSpot(tableConfig, floorSize) {
  const width = floorSize?.width ?? 900
  const height = floorSize?.height ?? 500
  for (let y = 60; y + 170 <= height; y += 200) {
    for (let x = 60; x + 150 <= width; x += 170) {
      const taken = tableConfig.some(t => Math.abs((t.x || 0) - x) < 150 && Math.abs((t.y || 0) - y) < 170)
      if (!taken) return { x, y }
    }
  }
  return null // floor is full — the store falls back to its default position
}

function FloorPlanTable({ table, floorSize, isEditMode, isOccupied, order, onCardClick, onFree, onRemove, onSeatsChange, onPositionChange, t }) {
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const elRef = useRef(null)

  const handlePointerDown = useCallback((e) => {
    if (!isEditMode) return
    e.preventDefault()
    e.stopPropagation()
    const rect = elRef.current.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    setDragging(true)
    elRef.current.setPointerCapture(e.pointerId)
  }, [isEditMode])

  const handlePointerMove = useCallback((e) => {
    if (!dragging || !elRef.current) return
    const { x, y } = floorPosition(e, elRef.current, dragOffset.current)
    elRef.current.style.left = x + 'px'
    elRef.current.style.top = y + 'px'
  }, [dragging])

  const handlePointerUp = useCallback((e) => {
    if (!dragging) return
    setDragging(false)
    elRef.current.releasePointerCapture(e.pointerId)
    const { x, y } = floorPosition(e, elRef.current, dragOffset.current)
    onPositionChange(x, y)
  }, [dragging, onPositionChange])

  const tableWidth = table.seats <= 2 ? 100 : table.seats <= 4 ? 110 : table.seats <= 6 ? 130 : 150
  const left = floorSize ? Math.max(0, Math.min(table.x || 0, floorSize.width - tableWidth)) : (table.x || 0)
  const top = floorSize ? Math.max(0, Math.min(table.y || 0, floorSize.height - MIN_TABLE_HEIGHT)) : (table.y || 0)

  return (
    <div
      ref={elRef}
      className={`floor-plan__table ${dragging ? 'floor-plan__table--dragging' : ''} ${isEditMode ? 'floor-plan__table--editable' : ''} ${isOccupied ? 'floor-plan__table--occupied' : ''}`}
      style={{
        position: 'absolute',
        left,
        top,
        width: tableWidth,
        touchAction: 'none',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => !isEditMode && !dragging && onCardClick()}
    >
      {/* Drag handle — only this area starts drag */}
      <div
        onPointerDown={handlePointerDown}
        style={isEditMode ? { cursor: 'grab' } : undefined}
      >
        <div className="floor-plan__table-label">
          <span className="floor-plan__table-id">T{table.id}</span>
          {isOccupied && order && (
            <span className="floor-plan__table-amount">RM {(order.total || 0).toFixed(0)}</span>
          )}
        </div>

        <div className="floor-plan__table-shape">
          <TableShape seats={table.seats} isOccupied={isOccupied} size="large" />
        </div>
      </div>

      {/* Seat count */}
      <div className="floor-plan__table-seats">
        {isEditMode ? (
          <div className="flex items-center gap-1">
            <button type="button" className="floor-plan__seat-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onSeatsChange(table.seats - 1) }}>-</button>
            <span>{table.seats}</span>
            <button type="button" className="floor-plan__seat-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onSeatsChange(table.seats + 1) }}>+</button>
          </div>
        ) : (
          <span>{table.seats} {t('tables.seats')}</span>
        )}
      </div>

      {/* Status dot */}
      <div className={`floor-plan__status-dot ${isOccupied ? 'floor-plan__status-dot--occupied' : 'floor-plan__status-dot--available'}`} />

      {/* Actions */}
      {!isEditMode && isOccupied && (
        <button type="button" className="floor-plan__action-btn" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onFree() }}>
          {t('tables.free')}
        </button>
      )}
      {isEditMode && !isOccupied && (
        <button type="button" className="floor-plan__action-btn floor-plan__action-btn--danger" onPointerDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onRemove() }}>
          ✕
        </button>
      )}
    </div>
  )
}

// ==========================================
// Main Tables Page
// ==========================================
export function Tables() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const tables = useFoodOpsStore(s => s.tables)
  const tableConfig = useFoodOpsStore(s => s.tableConfig) || []
  const tableOrder = useFoodOpsStore(s => s.tableOrder) || []
  const orders = useFoodOpsStore(s => s.orders)
  const freeTable = useFoodOpsStore(s => s.freeTable)
  const addTable = useFoodOpsStore(s => s.addTable)
  const removeTable = useFoodOpsStore(s => s.removeTable)
  const updateTableSeats = useFoodOpsStore(s => s.updateTableSeats)
  const updateTablePosition = useFoodOpsStore(s => s.updateTablePosition)
  const setTableOrder = useFoodOpsStore(s => s.setTableOrder)
  const initTableOrder = useFoodOpsStore(s => s.initTableOrder)

  const [isEditMode, setIsEditMode] = useState(false)
  const [viewMode, setViewMode] = useState('floor') // 'grid' or 'floor'
  const [selectedOrder, setSelectedOrder] = useState(null)
  const floorRef = useRef(null)
  const [floorSize, setFloorSize] = useState(null)

  useEffect(() => { initTableOrder() }, [initTableOrder])

  // Track the floor plan size so tables stay inside it and new ones land in a free spot
  useEffect(() => {
    const floor = floorRef.current
    if (!floor) return
    const observer = new ResizeObserver(() => setFloorSize({ width: floor.clientWidth, height: floor.clientHeight }))
    observer.observe(floor)
    return () => observer.disconnect()
  }, [viewMode])

  const displayOrder = tableOrder.length === tableConfig.length
    ? tableOrder
    : tableConfig.map(t => t.id)

  const orderedTables = displayOrder.map(id => {
    const configIdx = tableConfig.findIndex(t => t.id === id)
    if (configIdx < 0) return null
    const tc = tableConfig[configIdx]
    const orderId = tables[configIdx] ?? null
    return { ...tc, orderId, configIdx }
  }).filter(Boolean)

  const occupiedCount = orderedTables.filter(t => t.orderId !== null).length
  const availableCount = orderedTables.filter(t => t.orderId === null).length
  const totalSeats = orderedTables.reduce((s, t) => s + t.seats, 0)
  const occupancyPct = orderedTables.length > 0 ? Math.round(occupiedCount / orderedTables.length * 100) : 0

  const handleCardClick = (table) => {
    if (table.orderId) {
      const order = orders.find(o => o.id === table.orderId)
      if (order) setSelectedOrder(order)
    } else {
      navigate('/orders')
    }
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="demo-page-header text-foreground">{t('tables.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
            {isEditMode
              ? (viewMode === 'floor' ? t('tables.dragHintFloor') || t('tables.dragHint') : t('tables.dragHint'))
              : t('tables.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-card)',
                color: viewMode === 'grid' ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
              {t('tables.gridView')}
            </button>
            <button
              onClick={() => setViewMode('floor')}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'floor' ? 'var(--color-primary)' : 'var(--color-card)',
                color: viewMode === 'floor' ? 'var(--color-primary-foreground)' : 'var(--color-muted-foreground)',
                borderLeft: '1px solid var(--color-border)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              {t('tables.floorView')}
            </button>
          </div>

          <Button
            variant={isEditMode ? 'default' : 'outline'}
            onClick={() => setIsEditMode(!isEditMode)}
            className="gap-1.5"
          >
            {isEditMode ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> {t('tables.viewMode')}</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> {t('tables.editMode')}</>
            )}
          </Button>
          {isEditMode && (
            <Button onClick={() => addTable(4, findFreeSpot(tableConfig, floorSize))} className="gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              {t('tables.addTable')}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Dashboard Strip */}
      <div className="table-summary-strip">
        <div className="table-summary-strip__item">
          <div className="table-summary-strip__icon table-summary-strip__icon--available">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <p className="table-summary-strip__value">{availableCount}</p>
            <p className="table-summary-strip__label">{t('tables.available_count')}</p>
          </div>
        </div>
        <div className="table-summary-strip__divider" />
        <div className="table-summary-strip__item">
          <div className="table-summary-strip__icon table-summary-strip__icon--occupied">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <p className="table-summary-strip__value">{occupiedCount}</p>
            <p className="table-summary-strip__label">{t('tables.occupied_count')}</p>
          </div>
        </div>
        <div className="table-summary-strip__divider" />
        <div className="table-summary-strip__item">
          <div className="table-summary-strip__icon table-summary-strip__icon--seats">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18v-5a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5"/><path d="M3 18h18"/><path d="M7 14v-2"/><path d="M17 14v-2"/></svg>
          </div>
          <div>
            <p className="table-summary-strip__value">{totalSeats}</p>
            <p className="table-summary-strip__label">{t('tables.totalSeats')}</p>
          </div>
        </div>
        <div className="table-summary-strip__divider" />
        <div className="table-summary-strip__item table-summary-strip__item--wide">
          <div className="table-summary-strip__occupancy">
            <div className="flex items-center justify-between mb-1">
              <span className="table-summary-strip__label">{t('tables.occupied_count')}</span>
              <span className="table-summary-strip__value text-sm">{occupancyPct}%</span>
            </div>
            <div className="table-summary-strip__bar">
              <div className="table-summary-strip__bar-fill" style={{ width: `${occupancyPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* === GRID VIEW === */}
      {viewMode === 'grid' && (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return
            setTableOrder(move(displayOrder, event))
          }}
        >
          <div className="table-grid">
            {orderedTables.map((table, index) => {
              const isOccupied = table.orderId !== null
              const order = isOccupied ? orders.find(o => o.id === table.orderId) : null
              return (
                <SortableTableCard
                  key={table.id}
                  table={table}
                  index={index}
                  isEditMode={isEditMode}
                  isOccupied={isOccupied}
                  order={order}
                  onCardClick={() => handleCardClick(table)}
                  onFree={() => freeTable(table.id)}
                  onRemove={() => removeTable(table.id)}
                  onSeatsChange={(seats) => updateTableSeats(table.id, seats)}
                  t={t}
                  locale={locale}
                />
              )
            })}
          </div>
        </DragDropProvider>
      )}

      {/* === FLOOR PLAN VIEW === */}
      {viewMode === 'floor' && (
        <div className="floor-plan__container" ref={floorRef}>
          {/* Grid background */}
          <svg className="floor-plan__grid-bg" width="100%" height="100%">
            <defs>
              <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-border)" strokeWidth="1" opacity="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#floorGrid)" />
          </svg>

          {/* Restaurant features */}
          <div className="floor-plan__feature floor-plan__feature--entrance">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            {t('tables.entrance') || 'Entrance'}
          </div>
          <div className="floor-plan__feature floor-plan__feature--kitchen">
            🍳 {t('nav.kitchen') || 'Kitchen'}
          </div>
          <div className="floor-plan__feature floor-plan__feature--counter">
            💰 {t('tables.counter') || 'Counter'}
          </div>

          {/* Tables */}
          {orderedTables.map(table => {
            const isOccupied = table.orderId !== null
            const order = isOccupied ? orders.find(o => o.id === table.orderId) : null
            return (
              <FloorPlanTable
                key={table.id}
                table={table}
                floorSize={floorSize}
                isEditMode={isEditMode}
                isOccupied={isOccupied}
                order={order}
                onCardClick={() => handleCardClick(table)}
                onFree={() => freeTable(table.id)}
                onRemove={() => removeTable(table.id)}
                onSeatsChange={(seats) => updateTableSeats(table.id, seats)}
                onPositionChange={(x, y) => updateTablePosition(table.id, x, y)}
                t={t}
              />
            )
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="heading-font">{t('tables.orderDetails')} #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{menuName({ name: item.name }, locale)} x{item.qty}</span>
                    <span className="font-medium tabular-nums">RM {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 space-y-1" style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>{t('orders.subtotal')}</span>
                  <span className="tabular-nums">RM {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-muted-foreground)' }}>{t('orders.sst')}</span>
                  <span className="tabular-nums">RM {selectedOrder.sst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>{t('orders.total')}</span>
                  <span className="tabular-nums">RM {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  freeTable(selectedOrder.tableId)
                  setSelectedOrder(null)
                }}
              >
                {t('tables.free')}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
