# FoodOps Database Schema

> This document describes the conceptual database structure for FoodOps.
> Each "sheet" below represents a database table. Currently, all data lives in localStorage via Zustand.
> Students can use this as a blueprint to migrate to a real database (Supabase, Firebase, etc.).

---

## Sheet 1: `menu_items`
**The menu — all dishes offered by the restaurant.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key, auto-increment |
| `name_zh` | VARCHAR(50) | No | `海南鸡饭` | Chinese name |
| `name_en` | VARCHAR(100) | No | `Hainanese Chicken Rice` | English name |
| `name_bm` | VARCHAR(100) | No | `Nasi Ayam Hainan` | Bahasa Melayu name |
| `price` | DECIMAL(8,2) | No | `12.00` | Price in RM |
| `emoji` | VARCHAR(4) | Yes | `🍗` | Display emoji |
| `bg_color` | VARCHAR(7) | Yes | `#DBEAFE` | Card background hex |
| `category` | VARCHAR(20) | No | `rice` | `rice`, `noodle`, `soup` |
| `halal` | BOOLEAN | No | `true` | Halal certification status |
| `cost_per_serving` | DECIMAL(8,2) | No | `4.50` | COGS per portion (RM) |
| `is_active` | BOOLEAN | No | `true` | Soft delete / menu toggle |
| `created_at` | TIMESTAMP | No | `2026-01-15 08:00:00` | |

**Relationships:** Referenced by `order_items.menu_item_id` and `menu_ingredients.menu_item_id`

---

## Sheet 2: `ingredients`
**Raw ingredients/inventory items tracked by the restaurant.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `name_zh` | VARCHAR(50) | No | `鸡肉` | Chinese name |
| `name_en` | VARCHAR(50) | No | `Chicken` | English name |
| `name_bm` | VARCHAR(50) | No | `Ayam` | BM name |
| `unit` | VARCHAR(10) | No | `kg` | `kg`, `L`, `pcs` |
| `cost_per_unit` | DECIMAL(8,2) | No | `18.00` | Purchase cost per unit (RM) |
| `stock` | DECIMAL(10,2) | No | `45.00` | Current stock level |
| `min_stock` | DECIMAL(10,2) | No | `20.00` | Reorder threshold |
| `halal` | BOOLEAN | No | `true` | Halal status |
| `halal_cert_expiry` | DATE | Yes | `2026-12-31` | NULL if not halal |
| `supplier_name` | VARCHAR(100) | Yes | `Ayam Segar Sdn Bhd` | Future: FK to suppliers |

**Relationships:** Referenced by `menu_ingredients.ingredient_id`

---

## Sheet 3: `menu_ingredients` (Junction Table)
**Maps which ingredients go into each menu item and how much.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `menu_item_id` | INTEGER | No | `1` | FK → `menu_items.id` |
| `ingredient_id` | INTEGER | No | `1` | FK → `ingredients.id` |
| `quantity_per_serving` | DECIMAL(6,3) | No | `0.250` | Amount used per portion |

**Example rows:**
| menu_item_id | ingredient_id | quantity_per_serving |
|:---:|:---:|:---:|
| 1 (海南鸡饭) | 1 (鸡肉) | 0.250 kg |
| 1 (海南鸡饭) | 5 (米饭) | 0.300 kg |
| 7 (肉骨茶) | 2 (猪肉) | 0.300 kg |
| 7 (肉骨茶) | 5 (米饭) | 0.300 kg |

---

## Sheet 4: `orders`
**Every order placed through the POS system.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key, auto-increment |
| `order_type` | ENUM | No | `dine-in` | `dine-in`, `takeaway`, `delivery` |
| `table_id` | INTEGER | Yes | `3` | FK → `tables.id`. NULL if takeaway/delivery |
| `payment_method` | VARCHAR(20) | No | `duitnow` | `cash`, `duitnow`, `tng`, `grabpay`, `fpx`, `card` |
| `subtotal` | DECIMAL(10,2) | No | `35.00` | Before SST |
| `sst` | DECIMAL(10,2) | No | `2.10` | 6% of subtotal |
| `total` | DECIMAL(10,2) | No | `37.80` | subtotal + sst |
| `cogs` | DECIMAL(10,2) | No | `14.30` | Total ingredient cost |
| `status` | ENUM | No | `new` | `new`, `cooking`, `ready`, `served` |
| `created_at` | TIMESTAMP | No | `2026-04-06 12:30:00` | |
| `served_at` | TIMESTAMP | Yes | `2026-04-06 12:45:00` | When status → served |

**Relationships:** Has many `order_items`. References `tables.id`.

---

## Sheet 5: `order_items` (Junction Table)
**Individual line items within each order.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `order_id` | INTEGER | No | `1` | FK → `orders.id` |
| `menu_item_id` | INTEGER | No | `1` | FK → `menu_items.id` |
| `quantity` | INTEGER | No | `2` | Number of portions |
| `unit_price` | DECIMAL(8,2) | No | `12.00` | Price at time of order |
| `line_total` | DECIMAL(10,2) | No | `24.00` | unit_price × quantity |

**Example rows (Order #1: 海南鸡饭 ×2, 椰浆饭 ×1):**
| order_id | menu_item_id | quantity | unit_price | line_total |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 1 (海南鸡饭) | 2 | 12.00 | 24.00 |
| 1 | 8 (椰浆饭) | 1 | 8.00 | 8.00 |

---

## Sheet 6: `staff`
**All employees of the restaurant.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `name_zh` | VARCHAR(50) | No | `阿明` | Chinese name |
| `name_en` | VARCHAR(50) | No | `Ah Ming` | English name |
| `name_bm` | VARCHAR(50) | No | `Ah Ming` | BM name |
| `role` | VARCHAR(30) | No | `厨师` | `厨师`, `服务员`, `收银`, `清洁` |
| `phone` | VARCHAR(15) | Yes | `012-345-6789` | |
| `is_active` | BOOLEAN | No | `true` | Employment status |
| `hourly_rate` | DECIMAL(6,2) | Yes | `12.50` | RM per hour |
| `joined_at` | DATE | No | `2025-03-01` | |

**Relationships:** Has one `staff_settings`. Has many `schedule_entries`.

---

## Sheet 7: `staff_settings`
**Scheduling preferences per staff member (1:1 with staff).**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `staff_id` | INTEGER | No | `1` | FK → `staff.id` (UNIQUE) |
| `max_shifts_per_week` | INTEGER | No | `5` | 1-7 |
| `min_rest_days` | INTEGER | No | `1` | 0-4 |
| `max_consecutive_days` | INTEGER | No | `5` | 1-7 |
| `preferred_shifts` | JSON | No | `["morning","evening"]` | Array of shift IDs |
| `unavailable_days` | JSON | No | `[3]` | Array of day indices (0=Mon) |

---

## Sheet 8: `schedule_entries`
**Actual shift assignments — one row per staff-day-shift combination.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key |
| `staff_id` | INTEGER | No | `1` | FK → `staff.id` |
| `week_start` | DATE | No | `2026-04-06` | Monday of the schedule week |
| `day_of_week` | INTEGER | No | `0` | 0=Mon, 1=Tue, ... 6=Sun |
| `shift_id` | VARCHAR(20) | No | `morning` | `morning`, `afternoon`, `evening` |

**Example rows (阿明's Monday):**
| staff_id | week_start | day_of_week | shift_id |
|:---:|:---:|:---:|:---:|
| 1 | 2026-04-06 | 0 | morning |

> **Note:** The current demo stores this as a 2D array `schedule[staffIdx][dayIdx] = ['morning']`.
> In a real DB, each assignment is its own row for proper querying.

---

## Sheet 9: `tables`
**Physical tables in the restaurant.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `id` | INTEGER | No | `1` | Primary Key (table number) |
| `seats` | INTEGER | No | `4` | Seating capacity |
| `status` | ENUM | No | `available` | `available`, `occupied`, `reserved` |
| `current_order_id` | INTEGER | Yes | `5` | FK → `orders.id`. NULL when available |
| `location` | VARCHAR(50) | Yes | `indoor-left` | Floor plan position |

---

## Sheet 10: `business_config`
**Restaurant-wide settings stored as key-value pairs.**

| Column | Type | Nullable | Example | Notes |
|--------|------|----------|---------|-------|
| `key` | VARCHAR(50) | No | `sst_rate` | Primary Key |
| `value` | TEXT | No | `0.06` | String value (parse as needed) |
| `description` | TEXT | Yes | `SST tax rate` | Human-readable description |

**Example rows:**
| key | value | description |
|-----|-------|-------------|
| `sst_rate` | `0.06` | Sales & Service Tax rate (6%) |
| `business_name_zh` | `好味轩` | Restaurant name (Chinese) |
| `business_name_en` | `HaoWei Restaurant` | Restaurant name (English) |
| `business_name_bm` | `Restoran HaoWei` | Restaurant name (Bahasa Melayu) |
| `sst_reg_no` | `W10-2345-67890123` | SST registration number |
| `address` | `No. 12, Jalan SS2/55, 47300 PJ` | Business address |
| `phone` | `03-7865 4321` | Business phone |
| `min_cooks_per_shift` | `1` | Schedule config |
| `min_staff_per_shift` | `1` | Schedule config (weekday) |
| `weekend_staff_per_shift` | `2` | Schedule config (weekend) |

---

## Entity Relationship Diagram (Text)

```
menu_items ──┬── menu_ingredients ──── ingredients
             │
             └── order_items ──── orders ──── tables
                                    │
                                    └── (payment_method, order_type)

staff ──┬── staff_settings
        │
        └── schedule_entries

business_config (standalone key-value store)
```

## Migration Notes for Students

**From localStorage to Supabase (free tier):**

1. Create a Supabase project (free, no credit card)
2. Run the SQL to create these 10 tables
3. Enable Row Level Security (RLS) for multi-user access
4. Replace Zustand `persist` with Supabase queries
5. Add Supabase Auth for staff login

**Key differences:**
- localStorage: single device, no auth, limited to ~5MB
- Supabase: multi-device, real-time sync, auth, unlimited
- The 2D schedule array becomes normalized rows in `schedule_entries`
- The `ingredients` map in menu items becomes the `menu_ingredients` junction table
- Order items are separated from orders (normalization)
