import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_INVENTORY, DEFAULT_SALES_RANKING, DEFAULT_TIME_SLOTS,
  DEFAULT_SCHEDULE, DEFAULT_STAFF_SETTINGS, DEFAULT_SCHEDULE_CONFIG,
  DEFAULT_ORDERS, DEFAULT_TABLE_CONFIG, MENU, STAFF, SST_RATE, KDS_STATUSES,
} from './data.js'

// Demo starting point — used on first load, by "Reset data", and when saved data is outdated
const initialState = () => ({
  inventory: structuredClone(DEFAULT_INVENTORY),
  orders: structuredClone(DEFAULT_ORDERS),
  totalRevenue: 7610.8, // today so far: 283 orders × ~RM 27 (incl. 6% SST)
  totalOrders: 283,
  totalCogs: 2790,
  totalSst: 430.8,
  salesRanking: structuredClone(DEFAULT_SALES_RANKING),
  timeSlots: structuredClone(DEFAULT_TIME_SLOTS),
  schedule: structuredClone(DEFAULT_SCHEDULE),
  staffSettings: structuredClone(DEFAULT_STAFF_SETTINGS),
  scheduleConfig: structuredClone(DEFAULT_SCHEDULE_CONFIG),
  tables: Array(DEFAULT_TABLE_CONFIG.length).fill(null), // null = available, orderId = occupied
  tableConfig: structuredClone(DEFAULT_TABLE_CONFIG), // { id, seats, x, y }[]
  tableOrder: [], // array of table IDs in display order; empty = use tableConfig order
})

export const useFoodOpsStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // State
      // ==========================================
      ...initialState(),

      // ==========================================
      // Staff Settings
      // ==========================================
      updateStaffSetting: (staffIdx, updates) => {
        set(state => {
          const newSettings = [...state.staffSettings]
          newSettings[staffIdx] = { ...newSettings[staffIdx], ...updates }
          return { staffSettings: newSettings }
        })
      },

      updateScheduleConfig: (updates) => {
        set(state => ({ scheduleConfig: { ...state.scheduleConfig, ...updates } }))
      },

      // ==========================================
      // Order Submission (with SST, COGS, payment, type)
      // ==========================================
      submitOrder: (orderItems, options = {}) => {
        const state = get()
        const { orderType = 'dine-in', tableId = null, paymentMethod = 'cash' } = options

        let subtotal = 0
        let cogs = 0
        const items = []
        const inventoryUpdates = {}

        for (const [menuId, qty] of Object.entries(orderItems)) {
          if (qty <= 0) continue
          const menuItem = MENU.find(m => m.id === Number(menuId))
          if (!menuItem) continue

          const lineTotal = menuItem.price * qty
          subtotal += lineTotal
          cogs += (menuItem.costPerServing || 0) * qty
          items.push({
            name: menuItem.name,
            menuId: menuItem.id,
            qty,
            unitPrice: menuItem.price,
            subtotal: lineTotal,
          })

          // Calculate inventory deductions
          for (const [ingredient, amount] of Object.entries(menuItem.ingredients)) {
            inventoryUpdates[ingredient] = (inventoryUpdates[ingredient] || 0) + amount * qty
          }
        }

        if (items.length === 0) return null

        // SST calculation
        const sst = +(subtotal * SST_RATE).toFixed(2)
        const total = +(subtotal + sst).toFixed(2)
        cogs = +cogs.toFixed(2)

        // Deduct inventory
        const newInventory = state.inventory.map(inv => {
          // Match by zh name for ingredient lookup
          const invNameZh = typeof inv.name === 'string' ? inv.name : inv.name.zh
          const deduction = inventoryUpdates[invNameZh] || 0
          return { ...inv, stock: Math.max(0, +(inv.stock - deduction).toFixed(2)) }
        })

        // Update sales ranking (immutable) — keeps every dish so any of them can climb into the top 5
        let newRanking = state.salesRanking.map(r => ({ ...r }))
        items.forEach(item => {
          const itemNameZh = typeof item.name === 'string' ? item.name : item.name?.zh || ''
          const idx = newRanking.findIndex(r => r.name === itemNameZh)
          if (idx >= 0) {
            newRanking[idx] = { ...newRanking[idx], count: newRanking[idx].count + item.qty }
          } else {
            newRanking = [...newRanking, { name: itemNameZh, count: item.qty }]
          }
        })
        newRanking.sort((a, b) => b.count - a.count)

        // Update time slots — the slot whose start hour is closest to now (the shop closes 3-5pm)
        const hour = new Date().getHours()
        const newTimeSlots = [...state.timeSlots]
        const slotIndex = DEFAULT_TIME_SLOTS.reduce((best, slot, i) =>
          Math.abs(slot.start - hour) < Math.abs(DEFAULT_TIME_SLOTS[best].start - hour) ? i : best, 0)
        if (newTimeSlots[slotIndex]) {
          newTimeSlots[slotIndex] = { ...newTimeSlots[slotIndex], count: newTimeSlots[slotIndex].count + 1 }
        }

        // Update tables — use config index, not tableId - 1
        const newTables = [...state.tables]
        const orderId = state.orders.reduce((max, o) => Math.max(max, o.id), 0) + 1
        if (orderType === 'dine-in' && tableId) {
          const tIdx = state.tableConfig.findIndex(t => t.id === tableId)
          if (tIdx >= 0) newTables[tIdx] = orderId
        }

        const order = {
          id: orderId,
          items,
          subtotal,
          sst,
          total,
          cogs,
          orderType,
          tableId: orderType === 'dine-in' ? tableId : null,
          paymentMethod,
          status: 'new',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString(),
          timestamp: Date.now(),
        }

        set({
          orders: [order, ...state.orders],
          inventory: newInventory,
          totalRevenue: +(state.totalRevenue + total).toFixed(2),
          totalOrders: state.totalOrders + 1,
          totalCogs: +(state.totalCogs + cogs).toFixed(2),
          totalSst: +(state.totalSst + sst).toFixed(2),
          salesRanking: newRanking,
          timeSlots: newTimeSlots,
          tables: newTables,
        })

        return order
      },

      // ==========================================
      // KDS — Kitchen Display Status Flow
      // ==========================================
      advanceOrderStatus: (orderId) => {
        set(state => {
          const newOrders = state.orders.map(order => {
            if (order.id !== orderId) return order
            const currentIdx = KDS_STATUSES.indexOf(order.status)
            if (currentIdx < 0 || currentIdx >= KDS_STATUSES.length - 1) return order
            const nextStatus = KDS_STATUSES[currentIdx + 1]
            return { ...order, status: nextStatus }
          })

          // Free table when dine-in order is served (unless new guests with another order sit there now)
          const order = newOrders.find(o => o.id === orderId)
          let newTables = state.tables
          if (order?.status === 'served' && order.orderType === 'dine-in' && order.tableId) {
            const tIdx = state.tableConfig.findIndex(t => t.id === order.tableId)
            if (tIdx >= 0 && state.tables[tIdx] === orderId) {
              newTables = [...state.tables]
              newTables[tIdx] = null
            }
          }

          return { orders: newOrders, tables: newTables }
        })
      },

      // ==========================================
      // Table Management
      // ==========================================
      freeTable: (tableId) => {
        set(state => {
          const tIdx = state.tableConfig.findIndex(t => t.id === tableId)
          if (tIdx < 0) return {}
          const newTables = [...state.tables]
          newTables[tIdx] = null
          return { tables: newTables }
        })
      },

      addTable: (seats = 4, position = null) => {
        set(state => {
          const maxId = state.tableConfig.reduce((max, t) => Math.max(max, t.id), 0)
          const newId = maxId + 1
          const order = state.tableOrder.length > 0 ? [...state.tableOrder, newId] : []
          // Use the free spot picked on the floor plan, else a default position offset from existing tables
          const col = state.tableConfig.length % 5
          const row = Math.floor(state.tableConfig.length / 5)
          const { x, y } = position || { x: 60 + col * 170, y: 60 + row * 170 }
          return {
            tableConfig: [...state.tableConfig, { id: newId, seats, x, y }],
            tables: [...state.tables, null],
            tableOrder: order,
          }
        })
      },

      removeTable: (tableId) => {
        set(state => {
          const idx = state.tableConfig.findIndex(t => t.id === tableId)
          if (idx < 0) return {}
          if (state.tables[idx] !== null) return {} // can't remove occupied table
          return {
            tableConfig: state.tableConfig.filter(t => t.id !== tableId),
            tables: state.tables.filter((_, i) => i !== idx),
            tableOrder: state.tableOrder.filter(id => id !== tableId),
          }
        })
      },

      updateTableSeats: (tableId, seats) => {
        set(state => ({
          tableConfig: state.tableConfig.map(t => t.id === tableId ? { ...t, seats: Math.max(2, Math.min(8, seats)) } : t),
        }))
      },

      updateTablePosition: (tableId, x, y) => {
        set(state => ({
          tableConfig: state.tableConfig.map(t => t.id === tableId ? { ...t, x, y } : t),
        }))
      },

      setTableOrder: (order) => set({ tableOrder: order }),

      initTableOrder: () => {
        const state = useFoodOpsStore.getState()
        if (!state.tableOrder || state.tableOrder.length !== state.tableConfig.length) {
          set({ tableOrder: state.tableConfig.map(t => t.id) })
        }
      },

      // ==========================================
      // Inventory Management
      // ==========================================
      updateInventoryStock: (index, newStock) => {
        set(state => {
          const newInventory = [...state.inventory]
          newInventory[index] = { ...newInventory[index], stock: Math.max(0, +newStock) }
          return { inventory: newInventory }
        })
      },

      restockItem: (index, amount) => {
        set(state => {
          const newInventory = [...state.inventory]
          newInventory[index] = { ...newInventory[index], stock: +(newInventory[index].stock + amount).toFixed(2) }
          return { inventory: newInventory }
        })
      },

      // ==========================================
      // Schedule Management
      // ==========================================
      updateSchedule: (staffIdx, dayIdx, shifts) => {
        const newSchedule = get().schedule.map(row => row.map(cell => [...cell]))
        newSchedule[staffIdx][dayIdx] = shifts
        set({ schedule: newSchedule })
      },

      setSchedule: (schedule) => set({ schedule }),

      autoArrange: () => {
        const state = get()
        const settings = state.staffSettings
        const config = state.scheduleConfig
        const staffCount = STAFF.length
        const dayCount = 7
        const shiftIds = ['morning', 'afternoon', 'evening']

        const sched = Array.from({ length: staffCount }, () =>
          Array.from({ length: dayCount }, () => [])
        )
        const counts = Array(staffCount).fill(0)

        const canAssign = (si, day) => {
          const s = settings[si]
          if (sched[si][day].length > 0) return false
          if (counts[si] >= s.maxShiftsPerWeek) return false
          if (s.unavailableDays.includes(day)) return false
          // Days are not filled in order, so count the working streak on both sides of this day
          let streak = 1
          for (let d = day - 1; d >= 0 && sched[si][d].length > 0; d--) streak++
          for (let d = day + 1; d < dayCount && sched[si][d].length > 0; d++) streak++
          if (streak > s.maxConsecutiveDays) return false
          // Working this day must still leave enough days off in the week
          const daysOffAfter = sched[si].filter(d => d.length === 0).length - 1
          if (daysOffAfter < s.minRestDays) return false
          return true
        }

        // Get staff role by zh name for cook detection
        const getStaffRoleZh = (si) => {
          const staff = STAFF[si]
          return typeof staff.role === 'string' ? staff.role : staff.role.zh
        }

        // PASS 1: Ensure every person gets a fair minimum
        for (let si = 0; si < staffCount; si++) {
          const s = settings[si]
          const targetMin = Math.max(1, Math.ceil(s.maxShiftsPerWeek * 0.6))
          const availDays = Array.from({ length: dayCount }, (_, i) => i)
            .filter(d => !s.unavailableDays.includes(d))
          const step = Math.max(1, Math.floor(availDays.length / targetMin))

          for (let i = 0; i < targetMin && i * step < availDays.length; i++) {
            const day = availDays[Math.min(i * step, availDays.length - 1)]
            if (!canAssign(si, day)) continue
            const bestShift = s.preferredShifts[0] || shiftIds[si % shiftIds.length]
            sched[si][day].push(bestShift)
            counts[si]++
          }
        }

        // PASS 2: Fill remaining coverage gaps
        for (let day = 0; day < dayCount; day++) {
          const isWeekend = day >= 5
          for (const shiftId of shiftIds) {
            const currentCount = sched.filter(s => s[day].includes(shiftId)).length
            const target = isWeekend ? config.weekendStaffPerShift : config.minStaffPerShift
            const needed = target - currentCount
            if (needed <= 0) continue

            const candidates = []
            for (let si = 0; si < staffCount; si++) {
              if (!canAssign(si, day)) continue
              if (sched[si][day].length > 0) continue
              let score = 0
              const s = settings[si]
              const utilization = counts[si] / s.maxShiftsPerWeek
              score += Math.round((1 - utilization) * 10)
              const prefIdx = s.preferredShifts.indexOf(shiftId)
              if (prefIdx === 0) score += 3
              else if (prefIdx >= 0) score += 1
              if (config.minCooksPerShift > 0 && getStaffRoleZh(si) === '厨师') {
                const cooksCovered = sched
                  .filter((_, idx) => getStaffRoleZh(idx) === '厨师' && sched[idx][day].includes(shiftId)).length
                if (cooksCovered < config.minCooksPerShift) score += 5
              }
              candidates.push({ si, score })
            }

            candidates.sort((a, b) => b.score - a.score)
            for (let i = 0; i < Math.min(needed, candidates.length); i++) {
              sched[candidates[i].si][day].push(shiftId)
              counts[candidates[i].si]++
            }
          }
        }

        // PASS 3: Top-up anyone still below 60% of their max
        for (let si = 0; si < staffCount; si++) {
          const s = settings[si]
          const targetMin = Math.max(1, Math.ceil(s.maxShiftsPerWeek * 0.6))
          if (counts[si] >= targetMin) continue
          for (let day = 0; day < dayCount && counts[si] < targetMin; day++) {
            if (!canAssign(si, day)) continue
            for (const shiftId of [...s.preferredShifts, ...shiftIds]) {
              if (!sched[si][day].includes(shiftId)) {
                sched[si][day].push(shiftId)
                counts[si]++
                break
              }
            }
          }
        }

        set({ schedule: sched })
        return sched
      },

      // ==========================================
      // Helpers
      // ==========================================
      getOrderById: (orderId) => {
        return get().orders.find(o => o.id === orderId)
      },

      // ==========================================
      // Reset
      // ==========================================
      resetAll: () => {
        set(initialState())
      },
    }),
    {
      name: 'foodops_store',
      version: 7, // bump to reload sample data in browsers that saved the old numbers
      migrate: () => initialState(),
    }
  )
)
