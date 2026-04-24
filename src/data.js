// ==========================================
// FoodOps — Malaysian F&B Data Model
// ==========================================

export const SST_RATE = 0.08

export const BUSINESS_INFO = {
  name: { zh: '好味轩', en: 'HaoWei Restaurant', bm: 'Restoran HaoWei' },
  sstRegNo: 'W10-2345-67890123',
  address: 'No. 12, Jalan SS2/55, 47300 Petaling Jaya, Selangor',
  phone: '03-7865 4321',
}

// ==========================================
// Menu
// ==========================================

export const MENU = [
  {
    id: 1,
    name: { zh: '海南鸡饭', en: 'Hainanese Chicken Rice', bm: 'Nasi Ayam Hainan' },
    price: 12, emoji: '🍗', bg: '#DBEAFE', category: 'rice',
    halal: true, costPerServing: 4.50,
    ingredients: { '鸡肉': 0.25, '米饭': 0.3 },
  },
  {
    id: 2,
    name: { zh: '叉烧饭', en: 'Char Siu Rice', bm: 'Nasi Char Siu' },
    price: 13, emoji: '🥩', bg: '#FCE7F3', category: 'rice',
    halal: false, costPerServing: 5.20,
    ingredients: { '叉烧': 0.2, '米饭': 0.3 },
  },
  {
    id: 3,
    name: { zh: '云吞面', en: 'Wonton Noodles', bm: 'Mi Wantan' },
    price: 10, emoji: '🥟', bg: '#FEF3C7', category: 'noodle',
    halal: false, costPerServing: 3.80,
    ingredients: { '猪肉': 0.15, '面条': 0.25 },
  },
  {
    id: 4,
    name: { zh: '咖喱面', en: 'Curry Noodles', bm: 'Mi Kari' },
    price: 11, emoji: '🍛', bg: '#FFE4E6', category: 'noodle',
    halal: true, costPerServing: 4.00,
    ingredients: { '鸡肉': 0.15, '面条': 0.25, '咖喱酱': 0.1 },
  },
  {
    id: 5,
    name: { zh: '炒粿条', en: 'Fried Kway Teow', bm: 'Kuey Teow Goreng' },
    price: 9, emoji: '🍝', bg: '#E0E7FF', category: 'noodle',
    halal: true, costPerServing: 3.20,
    ingredients: { '面条': 0.3, '虾': 0.1 },
  },
  {
    id: 6,
    name: { zh: '虾面', en: 'Prawn Noodles', bm: 'Mi Udang' },
    price: 12, emoji: '🦐', bg: '#D1FAE5', category: 'noodle',
    halal: true, costPerServing: 5.00,
    ingredients: { '虾': 0.2, '面条': 0.25 },
  },
  {
    id: 7,
    name: { zh: '肉骨茶', en: 'Bak Kut Teh', bm: 'Bak Kut Teh' },
    price: 15, emoji: '🍖', bg: '#FEF3C7', category: 'soup',
    halal: false, costPerServing: 6.50,
    ingredients: { '猪肉': 0.3, '米饭': 0.3 },
  },
  {
    id: 8,
    name: { zh: '椰浆饭', en: 'Nasi Lemak', bm: 'Nasi Lemak' },
    price: 8, emoji: '🥥', bg: '#ECFDF5', category: 'rice',
    halal: true, costPerServing: 2.80,
    ingredients: { '米饭': 0.3, '椰浆': 0.15 },
  },
]

// Helper: get localized menu name
export function menuName(item, locale = 'zh') {
  if (!item?.name) return ''
  if (typeof item.name === 'string') return item.name
  return item.name[locale] || item.name.zh || ''
}

// ==========================================
// Inventory / Ingredients
// ==========================================

export const DEFAULT_INVENTORY = [
  { name: { zh: '鸡肉', en: 'Chicken', bm: 'Ayam' }, stock: 120, min: 40, unit: 'kg', costPerUnit: 18, halal: true, halalCertExpiry: '2026-12-31' },
  { name: { zh: '猪肉', en: 'Pork', bm: 'Daging Babi' }, stock: 85, min: 30, unit: 'kg', costPerUnit: 22, halal: false, halalCertExpiry: null },
  { name: { zh: '虾', en: 'Prawns', bm: 'Udang' }, stock: 18, min: 20, unit: 'kg', costPerUnit: 45, halal: true, halalCertExpiry: '2026-09-15' },
  { name: { zh: '面条', en: 'Noodles', bm: 'Mi' }, stock: 75, min: 25, unit: 'kg', costPerUnit: 6, halal: true, halalCertExpiry: '2027-03-01' },
  { name: { zh: '米饭', en: 'Rice', bm: 'Nasi' }, stock: 150, min: 50, unit: 'kg', costPerUnit: 4, halal: true, halalCertExpiry: '2027-06-30' },
  { name: { zh: '椰浆', en: 'Coconut Milk', bm: 'Santan' }, stock: 12, min: 15, unit: 'L', costPerUnit: 8, halal: true, halalCertExpiry: '2026-08-20' },
  { name: { zh: '咖喱酱', en: 'Curry Paste', bm: 'Pes Kari' }, stock: 30, min: 10, unit: 'kg', costPerUnit: 15, halal: true, halalCertExpiry: '2026-11-30' },
  { name: { zh: '叉烧', en: 'Char Siu', bm: 'Char Siu' }, stock: 45, min: 18, unit: 'kg', costPerUnit: 32, halal: false, halalCertExpiry: null },
]

// Helper: get localized ingredient name (for inventory lookups by zh key)
export function ingredientName(item, locale = 'zh') {
  if (!item?.name) return ''
  if (typeof item.name === 'string') return item.name
  return item.name[locale] || item.name.zh || ''
}

// ==========================================
// Payment Methods (Malaysia)
// ==========================================

export const PAYMENT_METHODS = [
  { id: 'cash', name: { zh: '现金', en: 'Cash', bm: 'Tunai' }, icon: '💵' },
  { id: 'duitnow', name: { zh: 'DuitNow', en: 'DuitNow', bm: 'DuitNow' }, icon: '📱' },
  { id: 'tng', name: { zh: "Touch 'n Go", en: "Touch 'n Go", bm: "Touch 'n Go" }, icon: '🔵' },
  { id: 'grabpay', name: { zh: 'GrabPay', en: 'GrabPay', bm: 'GrabPay' }, icon: '🟢' },
  { id: 'fpx', name: { zh: 'FPX', en: 'FPX', bm: 'FPX' }, icon: '🏦' },
  { id: 'card', name: { zh: '刷卡', en: 'Card', bm: 'Kad' }, icon: '💳' },
]

// ==========================================
// Order Types
// ==========================================

export const ORDER_TYPES = [
  { id: 'dine-in', name: { zh: '堂食', en: 'Dine-in', bm: 'Makan sini' }, icon: '🍽️' },
  { id: 'takeaway', name: { zh: '打包', en: 'Takeaway', bm: 'Bungkus' }, icon: '📦' },
  { id: 'delivery', name: { zh: '外卖', en: 'Delivery', bm: 'Penghantaran' }, icon: '🛵' },
]

// ==========================================
// Tables
// ==========================================

export const DEFAULT_TABLE_CONFIG = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  seats: [2, 4, 4, 6, 2, 4, 4, 2, 6, 8][i],
  x: 60 + (i % 5) * 170,
  y: 60 + Math.floor(i / 5) * 200,
}))

// ==========================================
// KDS (Kitchen Display System)
// ==========================================

export const KDS_STATUSES = ['new', 'cooking', 'ready', 'served']

export const KDS_STATUS_CONFIG = {
  new:     { label: { zh: '新订单', en: 'New', bm: 'Baru' }, color: '#3B82F6', bg: '#DBEAFE', darkBg: 'rgba(59,130,246,0.15)' },
  cooking: { label: { zh: '制作中', en: 'Cooking', bm: 'Memasak' }, color: '#F59E0B', bg: '#FEF3C7', darkBg: 'rgba(245,158,11,0.15)' },
  ready:   { label: { zh: '待取餐', en: 'Ready', bm: 'Sedia' }, color: '#10B981', bg: '#D1FAE5', darkBg: 'rgba(16,185,129,0.15)' },
  served:  { label: { zh: '已完成', en: 'Served', bm: 'Dihidang' }, color: '#6B7280', bg: '#F3F4F6', darkBg: 'rgba(107,114,128,0.15)' },
}

// ==========================================
// Seed Orders (historical demo data)
// ==========================================

const today = new Date().toISOString().slice(0, 10)

// Helper to build an order entry quickly
const _o = (id, items, opts) => {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const sst = +(subtotal * 0.08).toFixed(2)
  return { id, items, subtotal, sst, total: +(subtotal + sst).toFixed(2), cogs: +(items.reduce((s, i) => s + (MENU.find(m => m.id === i.menuId)?.costPerServing || 4) * i.qty, 0)).toFixed(2), status: 'served', ...opts }
}
const _i = (menuIdx, qty) => {
  const m = MENU[menuIdx]
  return { name: m.name, menuId: m.id, qty, unitPrice: m.price, subtotal: m.price * qty }
}
const pm = ['cash', 'duitnow', 'tng', 'grabpay', 'fpx', 'card']
const ot = ['dine-in', 'takeaway', 'delivery']

export const DEFAULT_ORDERS = [
  // Morning rush 11-12 (22 orders over multiple days)
  _o(85, [_i(0, 3), _i(7, 2)], { orderType: 'dine-in', tableId: 1, paymentMethod: 'cash', time: '11:10', date: `${today}T03:10:00.000Z`, timestamp: Date.now() - 86400000 * 6 }),
  _o(84, [_i(3, 2)], { orderType: 'dine-in', tableId: 3, paymentMethod: 'duitnow', time: '11:25', date: `${today}T03:25:00.000Z`, timestamp: Date.now() - 86400000 * 6 }),
  _o(83, [_i(0, 2), _i(5, 1)], { orderType: 'takeaway', tableId: null, paymentMethod: 'tng', time: '11:40', date: `${today}T03:40:00.000Z`, timestamp: Date.now() - 86400000 * 5 }),
  _o(82, [_i(6, 2)], { orderType: 'dine-in', tableId: 5, paymentMethod: 'cash', time: '11:50', date: `${today}T03:50:00.000Z`, timestamp: Date.now() - 86400000 * 5 }),
  // Lunch peak 12-1 (58 orders concept — show 15 recent)
  _o(81, [_i(0, 4), _i(3, 2)], { orderType: 'dine-in', tableId: 2, paymentMethod: 'duitnow', time: '12:05', date: `${today}T04:05:00.000Z`, timestamp: Date.now() - 86400000 * 4 }),
  _o(80, [_i(1, 3), _i(7, 3)], { orderType: 'dine-in', tableId: 4, paymentMethod: 'grabpay', time: '12:10', date: `${today}T04:10:00.000Z`, timestamp: Date.now() - 86400000 * 4 }),
  _o(79, [_i(2, 3), _i(4, 2)], { orderType: 'takeaway', tableId: null, paymentMethod: 'cash', time: '12:15', date: `${today}T04:15:00.000Z`, timestamp: Date.now() - 86400000 * 4 }),
  _o(78, [_i(5, 3)], { orderType: 'dine-in', tableId: 6, paymentMethod: 'tng', time: '12:20', date: `${today}T04:20:00.000Z`, timestamp: Date.now() - 86400000 * 3 }),
  _o(77, [_i(0, 2), _i(6, 1)], { orderType: 'dine-in', tableId: 7, paymentMethod: 'fpx', time: '12:25', date: `${today}T04:25:00.000Z`, timestamp: Date.now() - 86400000 * 3 }),
  _o(76, [_i(6, 3), _i(1, 2)], { orderType: 'dine-in', tableId: 8, paymentMethod: 'card', time: '12:30', date: `${today}T04:30:00.000Z`, timestamp: Date.now() - 86400000 * 3 }),
  _o(75, [_i(7, 5)], { orderType: 'delivery', tableId: null, paymentMethod: 'duitnow', time: '12:35', date: `${today}T04:35:00.000Z`, timestamp: Date.now() - 86400000 * 3 }),
  _o(74, [_i(0, 3), _i(2, 2)], { orderType: 'dine-in', tableId: 9, paymentMethod: 'cash', time: '12:40', date: `${today}T04:40:00.000Z`, timestamp: Date.now() - 86400000 * 2 }),
  _o(73, [_i(3, 3), _i(5, 2)], { orderType: 'dine-in', tableId: 1, paymentMethod: 'grabpay', time: '12:45', date: `${today}T04:45:00.000Z`, timestamp: Date.now() - 86400000 * 2 }),
  _o(72, [_i(4, 4)], { orderType: 'takeaway', tableId: null, paymentMethod: 'tng', time: '12:50', date: `${today}T04:50:00.000Z`, timestamp: Date.now() - 86400000 * 2 }),
  _o(71, [_i(1, 2), _i(6, 2)], { orderType: 'dine-in', tableId: 3, paymentMethod: 'duitnow', time: '12:55', date: `${today}T04:55:00.000Z`, timestamp: Date.now() - 86400000 * 2 }),
  // Afternoon 1-2
  _o(70, [_i(0, 2)], { orderType: 'dine-in', tableId: 2, paymentMethod: 'cash', time: '13:05', date: `${today}T05:05:00.000Z`, timestamp: Date.now() - 86400000 * 2 }),
  _o(69, [_i(2, 4), _i(7, 2)], { orderType: 'takeaway', tableId: null, paymentMethod: 'fpx', time: '13:15', date: `${today}T05:15:00.000Z`, timestamp: Date.now() - 86400000 * 1.5 }),
  _o(68, [_i(6, 2), _i(0, 1)], { orderType: 'dine-in', tableId: 5, paymentMethod: 'card', time: '13:30', date: `${today}T05:30:00.000Z`, timestamp: Date.now() - 86400000 * 1.5 }),
  _o(67, [_i(5, 2), _i(3, 2)], { orderType: 'dine-in', tableId: 4, paymentMethod: 'duitnow', time: '13:45', date: `${today}T05:45:00.000Z`, timestamp: Date.now() - 86400000 * 1 }),
  // Tea time 2-3
  _o(66, [_i(7, 3)], { orderType: 'takeaway', tableId: null, paymentMethod: 'tng', time: '14:15', date: `${today}T06:15:00.000Z`, timestamp: Date.now() - 86400000 * 1 }),
  _o(65, [_i(4, 2), _i(0, 1)], { orderType: 'dine-in', tableId: 6, paymentMethod: 'cash', time: '14:45', date: `${today}T06:45:00.000Z`, timestamp: Date.now() - 86400000 * 1 }),
  // Evening rush 5-6
  _o(64, [_i(0, 3), _i(1, 2)], { orderType: 'dine-in', tableId: 1, paymentMethod: 'grabpay', time: '17:10', date: `${today}T09:10:00.000Z`, timestamp: Date.now() - 86400000 * 1 }),
  _o(63, [_i(6, 3)], { orderType: 'dine-in', tableId: 7, paymentMethod: 'cash', time: '17:25', date: `${today}T09:25:00.000Z`, timestamp: Date.now() - 86400000 * 0.8 }),
  _o(62, [_i(2, 3), _i(5, 2)], { orderType: 'takeaway', tableId: null, paymentMethod: 'duitnow', time: '17:40', date: `${today}T09:40:00.000Z`, timestamp: Date.now() - 86400000 * 0.8 }),
  _o(61, [_i(3, 2), _i(7, 3)], { orderType: 'delivery', tableId: null, paymentMethod: 'tng', time: '17:55', date: `${today}T09:55:00.000Z`, timestamp: Date.now() - 86400000 * 0.8 }),
  // Dinner peak 6-7 (biggest rush)
  _o(60, [_i(0, 4), _i(6, 2)], { orderType: 'dine-in', tableId: 2, paymentMethod: 'duitnow', time: '18:00', date: `${today}T10:00:00.000Z`, timestamp: Date.now() - 3600000 * 10 }),
  _o(59, [_i(1, 3), _i(2, 2)], { orderType: 'dine-in', tableId: 3, paymentMethod: 'card', time: '18:05', date: `${today}T10:05:00.000Z`, timestamp: Date.now() - 3600000 * 9.5 }),
  _o(58, [_i(5, 4)], { orderType: 'dine-in', tableId: 8, paymentMethod: 'cash', time: '18:10', date: `${today}T10:10:00.000Z`, timestamp: Date.now() - 3600000 * 9 }),
  _o(57, [_i(7, 4), _i(4, 2)], { orderType: 'takeaway', tableId: null, paymentMethod: 'grabpay', time: '18:15', date: `${today}T10:15:00.000Z`, timestamp: Date.now() - 3600000 * 8.5 }),
  _o(56, [_i(0, 2), _i(3, 3)], { orderType: 'dine-in', tableId: 9, paymentMethod: 'fpx', time: '18:20', date: `${today}T10:20:00.000Z`, timestamp: Date.now() - 3600000 * 8 }),
  _o(55, [_i(6, 2), _i(1, 1)], { orderType: 'dine-in', tableId: 10, paymentMethod: 'tng', time: '18:25', date: `${today}T10:25:00.000Z`, timestamp: Date.now() - 3600000 * 7.5 }),
  _o(54, [_i(2, 3), _i(0, 2)], { orderType: 'dine-in', tableId: 4, paymentMethod: 'duitnow', time: '18:30', date: `${today}T10:30:00.000Z`, timestamp: Date.now() - 3600000 * 7 }),
  _o(53, [_i(5, 3), _i(7, 2)], { orderType: 'delivery', tableId: null, paymentMethod: 'cash', time: '18:35', date: `${today}T10:35:00.000Z`, timestamp: Date.now() - 3600000 * 6.5 }),
  _o(52, [_i(3, 4)], { orderType: 'dine-in', tableId: 5, paymentMethod: 'grabpay', time: '18:40', date: `${today}T10:40:00.000Z`, timestamp: Date.now() - 3600000 * 6 }),
  _o(51, [_i(0, 3), _i(6, 1)], { orderType: 'dine-in', tableId: 1, paymentMethod: 'card', time: '18:45', date: `${today}T10:45:00.000Z`, timestamp: Date.now() - 3600000 * 5.5 }),
  // 7-8pm
  _o(50, [_i(1, 4), _i(5, 2)], { orderType: 'dine-in', tableId: 6, paymentMethod: 'duitnow', time: '19:00', date: `${today}T11:00:00.000Z`, timestamp: Date.now() - 3600000 * 5 }),
  _o(49, [_i(0, 2), _i(4, 3)], { orderType: 'takeaway', tableId: null, paymentMethod: 'tng', time: '19:10', date: `${today}T11:10:00.000Z`, timestamp: Date.now() - 3600000 * 4.5 }),
  _o(48, [_i(6, 2), _i(7, 3)], { orderType: 'dine-in', tableId: 7, paymentMethod: 'cash', time: '19:20', date: `${today}T11:20:00.000Z`, timestamp: Date.now() - 3600000 * 4 }),
  _o(47, [_i(2, 2), _i(3, 2)], { orderType: 'dine-in', tableId: 2, paymentMethod: 'fpx', time: '19:30', date: `${today}T11:30:00.000Z`, timestamp: Date.now() - 3600000 * 3.5 }),
  _o(46, [_i(0, 5)], { orderType: 'dine-in', tableId: 8, paymentMethod: 'grabpay', time: '19:40', date: `${today}T11:40:00.000Z`, timestamp: Date.now() - 3600000 * 3 }),
  _o(45, [_i(5, 3), _i(1, 2)], { orderType: 'dine-in', tableId: 3, paymentMethod: 'duitnow', time: '19:50', date: `${today}T11:50:00.000Z`, timestamp: Date.now() - 3600000 * 2.5 }),
  // 8-9pm (closing)
  _o(44, [_i(7, 4)], { orderType: 'takeaway', tableId: null, paymentMethod: 'cash', time: '20:10', date: `${today}T12:10:00.000Z`, timestamp: Date.now() - 3600000 * 2 }),
  _o(43, [_i(6, 2)], { orderType: 'dine-in', tableId: 9, paymentMethod: 'card', time: '20:25', date: `${today}T12:25:00.000Z`, timestamp: Date.now() - 3600000 * 1.5 }),
  _o(42, [_i(0, 2), _i(2, 1)], { orderType: 'dine-in', tableId: 10, paymentMethod: 'tng', time: '20:40', date: `${today}T12:40:00.000Z`, timestamp: Date.now() - 3600000 * 1 }),
  _o(41, [_i(3, 2), _i(4, 1)], { orderType: 'delivery', tableId: null, paymentMethod: 'duitnow', time: '20:55', date: `${today}T12:55:00.000Z`, timestamp: Date.now() - 3600000 * 0.5 }),
]

// ==========================================
// Sales Rankings (default demo data)
// ==========================================

export const DEFAULT_SALES_RANKING = [
  { name: '海南鸡饭', count: 156 },
  { name: '肉骨茶', count: 132 },
  { name: '叉烧饭', count: 118 },
  { name: '云吞面', count: 97 },
  { name: '虾面', count: 84 },
]

export const DEFAULT_TIME_SLOTS = [
  { label: '11-12', count: 22 },
  { label: '12-1', count: 58 },
  { label: '1-2', count: 35 },
  { label: '2-3', count: 15 },
  { label: '5-6', count: 28 },
  { label: '6-7', count: 65 },
  { label: '7-8', count: 48 },
  { label: '8-9', count: 12 },
]

// ==========================================
// Staff
// ==========================================

export const STAFF = [
  { name: { zh: '阿明', en: 'Ah Ming', bm: 'Ah Ming' }, role: { zh: '厨师', en: 'Chef', bm: 'Tukang Masak' } },
  { name: { zh: '小丽', en: 'Xiao Li', bm: 'Xiao Li' }, role: { zh: '服务员', en: 'Waiter', bm: 'Pelayan' } },
  { name: { zh: '阿伟', en: 'Ah Wei', bm: 'Ah Wei' }, role: { zh: '厨师', en: 'Chef', bm: 'Tukang Masak' } },
  { name: { zh: '美美', en: 'Mei Mei', bm: 'Mei Mei' }, role: { zh: '收银', en: 'Cashier', bm: 'Juruwang' } },
  { name: { zh: '老王', en: 'Lao Wang', bm: 'Lao Wang' }, role: { zh: '清洁', en: 'Cleaner', bm: 'Pembersih' } },
]

// Helper: get localized staff name/role
export function staffName(staff, locale = 'zh') {
  if (!staff?.name) return ''
  if (typeof staff.name === 'string') return staff.name
  return staff.name[locale] || staff.name.zh || ''
}
export function staffRole(staff, locale = 'zh') {
  if (!staff?.role) return ''
  if (typeof staff.role === 'string') return staff.role
  return staff.role[locale] || staff.role.zh || ''
}

// ==========================================
// Schedule Settings
// ==========================================

export const DEFAULT_STAFF_SETTINGS = [
  { maxShiftsPerWeek: 5, minRestDays: 1, preferredShifts: ['morning', 'evening'], unavailableDays: [], maxConsecutiveDays: 5 },
  { maxShiftsPerWeek: 6, minRestDays: 1, preferredShifts: ['afternoon', 'morning'], unavailableDays: [], maxConsecutiveDays: 5 },
  { maxShiftsPerWeek: 5, minRestDays: 2, preferredShifts: ['evening'], unavailableDays: [3], maxConsecutiveDays: 4 },
  { maxShiftsPerWeek: 5, minRestDays: 1, preferredShifts: ['morning', 'afternoon'], unavailableDays: [], maxConsecutiveDays: 5 },
  { maxShiftsPerWeek: 6, minRestDays: 1, preferredShifts: ['evening', 'afternoon'], unavailableDays: [], maxConsecutiveDays: 6 },
]

export const DEFAULT_SCHEDULE_CONFIG = {
  minCooksPerShift: 1,
  minStaffPerShift: 1,
  weekendStaffPerShift: 2,
}

export const SHIFTS = [
  { id: 'morning', name: { zh: '早班', en: 'Morning', bm: 'Pagi' }, time: '9:00-15:00', start: 9, end: 15 },
  { id: 'afternoon', name: { zh: '午班', en: 'Afternoon', bm: 'Tengahari' }, time: '12:00-18:00', start: 12, end: 18 },
  { id: 'evening', name: { zh: '晚班', en: 'Evening', bm: 'Malam' }, time: '17:00-23:00', start: 17, end: 23 },
]

export const DAYS = [
  { zh: '周一', en: 'Mon', bm: 'Isn' },
  { zh: '周二', en: 'Tue', bm: 'Sel' },
  { zh: '周三', en: 'Wed', bm: 'Rab' },
  { zh: '周四', en: 'Thu', bm: 'Kha' },
  { zh: '周五', en: 'Fri', bm: 'Jum' },
  { zh: '周六', en: 'Sat', bm: 'Sab' },
  { zh: '周日', en: 'Sun', bm: 'Ahd' },
]

export const DEFAULT_SCHEDULE = [
  [['morning'], ['morning'], ['morning','afternoon'], ['morning'], ['morning'], ['evening'], []],
  [['afternoon'], ['afternoon'], ['afternoon'], ['afternoon'], [], ['morning'], ['morning']],
  [['evening'], ['evening'], ['evening'], [], ['evening'], ['morning'], ['evening']],
  [['morning'], ['morning'], [], ['morning'], ['morning'], ['afternoon'], ['afternoon']],
  [['afternoon'], [], ['evening'], ['evening'], ['afternoon'], ['evening'], []],
]
