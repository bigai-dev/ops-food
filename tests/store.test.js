import test from 'node:test'
import assert from 'node:assert/strict'
import { useFoodOpsStore } from '../src/store.js'
import { STAFF } from '../src/data.js'

const store = () => useFoodOpsStore.getState()

// What a first-time visitor sees, captured before any test changes the store
const DATA_KEYS = ['orders', 'totalRevenue', 'totalOrders', 'totalCogs', 'totalSst', 'salesRanking', 'timeSlots', 'tables', 'tableConfig']
const pickData = state => Object.fromEntries(DATA_KEYS.map(k => [k, state[k]]))
const firstLoad = structuredClone(pickData(store()))

test.beforeEach(() => store().resetAll())

test('new orders get a number that is not already used', () => {
  const highest = Math.max(...store().orders.map(o => o.id))
  const first = store().submitOrder({ 1: 1 }, { orderType: 'takeaway' })
  const second = store().submitOrder({ 2: 1 }, { orderType: 'takeaway' })

  assert.equal(first.id, highest + 1)
  assert.equal(second.id, highest + 2)
  const ids = store().orders.map(o => o.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('sample orders are stored newest first', () => {
  const timestamps = store().orders.map(o => o.timestamp)
  assert.deepEqual(timestamps, [...timestamps].sort((a, b) => b - a))
  assert.equal(store().orders[0].id, Math.max(...store().orders.map(o => o.id)))
})

test('reset data brings back exactly what a fresh start shows', () => {
  store().submitOrder({ 1: 2 }, { orderType: 'dine-in', tableId: 4 })
  store().addTable(4)
  store().resetAll()

  assert.deepEqual(pickData(store()), firstLoad)
})

test('an order at 6:30pm is counted in the 6-7 time slot', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 8, 24, 18, 30).getTime() })
  const before = store().timeSlots.find(s => s.label === '6-7').count

  store().submitOrder({ 1: 1 }, { orderType: 'takeaway' })

  assert.equal(store().timeSlots.find(s => s.label === '6-7').count, before + 1)
  assert.equal(store().timeSlots.find(s => s.label === '8-9').count, firstLoad.timeSlots.find(s => s.label === '8-9').count)
})

test('a dish outside the top 5 keeps its sales and can climb into the top 5', () => {
  store().submitOrder({ 8: 1 }, { orderType: 'takeaway' }) // 椰浆饭 is not in the starting top 5
  assert.equal(store().salesRanking.find(r => r.name === '椰浆饭')?.count, 1)

  store().submitOrder({ 8: 89 }, { orderType: 'takeaway' })
  const top5 = store().salesRanking.slice(0, 5).map(r => r.name)
  assert.ok(top5.includes('椰浆饭'))
})

test('serving an old order does not free a table that new guests are using', () => {
  const tableIdx = store().tableConfig.findIndex(t => t.id === 3)
  const oldOrder = store().submitOrder({ 1: 1 }, { orderType: 'dine-in', tableId: 3 })
  store().freeTable(3) // first guests leave
  const newOrder = store().submitOrder({ 2: 1 }, { orderType: 'dine-in', tableId: 3 })

  for (let i = 0; i < 3; i++) store().advanceOrderStatus(oldOrder.id) // new → cooking → ready → served
  assert.equal(store().tables[tableIdx], newOrder.id)

  for (let i = 0; i < 3; i++) store().advanceOrderStatus(newOrder.id)
  assert.equal(store().tables[tableIdx], null)
})

test('add table uses the free spot it is given', () => {
  store().addTable(4, { x: 910, y: 60 })
  const added = store().tableConfig.at(-1)
  assert.deepEqual({ x: added.x, y: added.y }, { x: 910, y: 60 })
  assert.equal(store().tables.length, store().tableConfig.length)
})

test('auto-arrange follows every staff rule from the Settings page', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n }

  for (let run = 0; run < 300; run++) {
    const staffSettings = STAFF.map(() => ({
      maxShiftsPerWeek: 1 + rnd(7),
      minRestDays: rnd(5),
      maxConsecutiveDays: 1 + rnd(7),
      preferredShifts: ['morning', 'afternoon', 'evening'].filter(() => rnd(2)),
      unavailableDays: [0, 1, 2, 3, 4, 5, 6].filter(() => rnd(6) === 0),
    }))
    const scheduleConfig = { minCooksPerShift: rnd(4), minStaffPerShift: 1 + rnd(5), weekendStaffPerShift: 1 + rnd(5) }
    useFoodOpsStore.setState({ staffSettings, scheduleConfig })

    store().autoArrange()

    store().schedule.forEach((week, si) => {
      const rules = staffSettings[si]
      const shifts = week.reduce((c, day) => c + day.length, 0)
      const daysOff = week.filter(day => day.length === 0).length
      let streak = 0, longest = 0
      week.forEach(day => { streak = day.length ? streak + 1 : 0; longest = Math.max(longest, streak) })

      assert.ok(shifts <= rules.maxShiftsPerWeek, `run ${run}, staff ${si}: too many shifts`)
      assert.ok(daysOff >= rules.minRestDays, `run ${run}, staff ${si}: ${daysOff} days off, needs ${rules.minRestDays}`)
      assert.ok(longest <= rules.maxConsecutiveDays, `run ${run}, staff ${si}: ${longest} days in a row, max ${rules.maxConsecutiveDays}`)
      rules.unavailableDays.forEach(d => assert.equal(week[d].length, 0, `run ${run}, staff ${si}: works on day off ${d}`))
    })
  }
})
