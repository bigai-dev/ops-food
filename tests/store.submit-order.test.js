import test from 'node:test'
import assert from 'node:assert/strict'
import { useFoodOpsStore } from '../src/store.js'
import {
  DEFAULT_INVENTORY,
  DEFAULT_ORDERS,
  DEFAULT_SALES_RANKING,
  DEFAULT_TIME_SLOTS,
  DEFAULT_SCHEDULE,
  DEFAULT_STAFF_SETTINGS,
  DEFAULT_SCHEDULE_CONFIG,
  DEFAULT_TABLE_CONFIG,
} from '../src/data.js'

const resetStore = () => {
  useFoodOpsStore.setState({
    inventory: structuredClone(DEFAULT_INVENTORY),
    orders: structuredClone(DEFAULT_ORDERS),
    totalRevenue: 48650,
    totalOrders: 283,
    totalCogs: 18420,
    totalSst: 3892,
    salesRanking: [
      Object.freeze({ ...DEFAULT_SALES_RANKING[0] }),
      ...structuredClone(DEFAULT_SALES_RANKING.slice(1)),
    ],
    timeSlots: structuredClone(DEFAULT_TIME_SLOTS),
    schedule: structuredClone(DEFAULT_SCHEDULE),
    staffSettings: structuredClone(DEFAULT_STAFF_SETTINGS),
    scheduleConfig: structuredClone(DEFAULT_SCHEDULE_CONFIG),
    tables: Array(10).fill(null),
    tableConfig: structuredClone(DEFAULT_TABLE_CONFIG),
    tableOrder: [],
  })
}

test('submitOrder updates sales ranking without mutating frozen entries', () => {
  resetStore()

  assert.doesNotThrow(() => {
    useFoodOpsStore.getState().submitOrder(
      { 1: 1 },
      { orderType: 'takeaway', paymentMethod: 'cash' }
    )
  })

  const updatedTopSeller = useFoodOpsStore.getState().salesRanking.find(
    item => item.name === '海南鸡饭'
  )

  assert.equal(updatedTopSeller?.count, DEFAULT_SALES_RANKING[0].count + 1)
})
