# FoodOps — Product Plan for Malaysian F&B

## Vision
The all-in-one restaurant management system built specifically for Malaysian F&B operators — from hawker stalls to multi-outlet restaurants. Trilingual, SST-compliant, and designed for the realities of Malaysian dining.

---

## Target Users

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Hawker / Kopitiam stall owner** | Solo or 2-3 staff, high volume, low margin | Speed, simplicity, offline mode, receipt printing |
| **Small restaurant owner** | 5-15 staff, dine-in + takeaway | Staff scheduling, inventory, SST invoices, reports |
| **F&B chain operator** | Multiple outlets, centralized ops | Multi-outlet dashboard, consolidated reporting, role-based access |
| **Kitchen staff** | Cooks on the line | Kitchen display, order queue, ticket prioritization |
| **Floor staff / Cashier** | Taking orders, handling payments | Fast POS, table management, payment integration |

---

## Competitive Landscape (Malaysia)

| Competitor | Strengths | Weaknesses | Price |
|------------|-----------|------------|-------|
| **StoreHub** | Full POS + inventory + e-commerce, strong MY presence | Expensive for small operators, hardware lock-in | RM99-299/mo |
| **Slurp!** | MY-focused, SST-compliant, food delivery integration | Dated UI, limited reporting | RM79-199/mo |
| **Cashier Live** | Affordable, simple | Very basic features, poor mobile experience | RM49-99/mo |
| **Mr. Speedy / Eats365** | Enterprise-grade, intl presence | Overkill for small operators, not MY-localized | RM199-499/mo |
| **Paper / Excel** | Free, familiar | No automation, error-prone, no compliance | Free |

### FoodOps Positioning
**Affordable, modern, Malaysia-first** — the gap between "too basic" (Cashier Live, paper) and "too expensive/complex" (StoreHub, Eats365). Purpose-built for the Malaysian market with trilingual support, SST compliance, and local payment integrations from day one.

---

## RICE-Prioritized Roadmap

### Phase 1 — Foundation (Q1) 🔴 Critical
_Make it legally compliant and operationally viable_

| Feature | RICE | Why Critical |
|---------|------|-------------|
| **SST Tax Calculation & Invoice** | 6000 | Legal requirement — no F&B can operate without this |
| **Receipt & Kitchen Ticket Printing** | 4800 | Every restaurant needs physical receipts and kitchen tickets |
| **Multi-language Support (BM/CN/EN)** | 4000 | Malaysian workforce is trilingual — non-negotiable |
| **Daily/Weekly/Monthly Reports** | 3200 | Owners need to see P&L, tax reports, and trends |

**Milestone:** A real restaurant can use FoodOps for daily operations.

### Phase 2 — Experience (Q2) 🟡 High
_Make it delightful and reliable_

| Feature | RICE | Why Important |
|---------|------|---------------|
| **Mobile-first Responsive Redesign** | 3200 | Tablets at counter, phones for floor staff |
| **Kitchen Display System (KDS)** | 2800 | Eliminate paper tickets, real-time order queue |
| **Offline Mode / PWA** | 2800 | Hawker stalls have unreliable WiFi |
| **Payment Integration (DuitNow/TnG/FPX)** | 2700 | Cash is declining, e-wallets are standard |

**Milestone:** Full front-of-house + back-of-house digital workflow.

### Phase 3 — Scale (Q3) 🟢 Growth
_Enable real business management_

| Feature | RICE | Why Now |
|---------|------|---------|
| **Backend Database & Auth** | 2308 | Move from localStorage to real multi-user system |
| **Table Management & Dine-in/Takeaway** | 1920 | Proper restaurant workflow |
| **Inventory Auto-Reorder Alerts** | 1667 | WhatsApp alerts to supplier when stock is low |
| **Halal Certification Tracking** | 1333 | Important for Muslim-majority market |

**Milestone:** Multi-user system with real data persistence.

### Phase 4 — Expand (Q4) 🔵 Strategic
_Add revenue-driving and operational features_

| Feature | RICE | Strategic Value |
|---------|------|-----------------|
| **Online Ordering & QR Menu** | 1200 | Customer self-ordering reduces labor cost |
| **Staff Attendance & Payroll** | 1000 | Malaysian labor law compliance (OT, EPF) |
| **Waste Tracking & COGS** | 1000 | Margin optimization for thin-margin F&B |
| **Shift Swap & Leave** | 800 | Staff satisfaction and retention |

### Phase 5+ — Platform (Q5-Q6) ⚪ Future
| Feature | RICE | Notes |
|---------|------|-------|
| Multi-outlet Support | 738 | Chain restaurant requirement |
| Supplier Management & POs | 640 | Formalize procurement |
| Grab/ShopeeFood Integration | 625 | Consolidate delivery orders |
| Customer Loyalty / Stamp Card | 480 | Drive repeat visits |

---

## Malaysia-Specific Requirements

### Legal & Compliance
- **SST (Sales & Service Tax)**: 8% on F&B, must appear on invoice
- **LHDN e-Invoice**: Malaysia's mandatory e-invoicing (phased rollout 2024-2025)
- **Halal compliance**: Track ingredient halal status, certification expiry
- **Labor law**: Minimum wage RM1,500, OT rates, EPF/SOCSO contributions

### Payment Landscape
- **DuitNow QR**: Universal QR standard (BNM mandate) — must support
- **Touch 'n Go eWallet**: Most popular e-wallet (~20M users)
- **GrabPay**: Strong in F&B due to GrabFood integration
- **FPX (Online Banking)**: For larger B2B payments
- **Cash**: Still ~40% of hawker transactions — must support cash drawer

### Language & Culture
- **UI Language**: BM (official), Chinese (business), English (tech-savvy)
- **Menu language**: Often Chinese with BM/EN descriptions
- **Currency**: MYR (RM) with 2 decimal places, no tipping culture
- **Operating hours**: Many F&B operate split shifts (lunch + dinner)
- **Hawker culture**: Speed > features, minimal training tolerance

### Infrastructure Reality
- **Internet**: Unreliable in hawker centers, food courts
- **Devices**: Mix of cheap Android tablets, phones, some iPads
- **Printers**: Epson/Star thermal receipt printers (80mm standard)
- **Power**: Some stalls lack stable power — battery backup needed

---

## Architecture Decision: What Needs to Change

### Current State (Demo)
- Client-only React SPA with Zustand + localStorage
- No authentication, no database, no API
- Single-user, single-device, single-language
- No printing, no payments, no tax

### Target State (Production)
| Layer | Current | Target |
|-------|---------|--------|
| Database | localStorage | Supabase (Postgres) |
| Auth | None | Supabase Auth + RLS (role-based) |
| API | None | Vercel Functions or Supabase Edge Functions |
| Payments | None | Revenue Monster / iPay88 (MY payment gateway) |
| Printing | None | Web Bluetooth (thermal) or print server |
| Offline | None | Service Worker + IndexedDB sync |
| Hosting | Local dev | Vercel |
| i18n | Chinese only | react-intl or next-intl (BM/CN/EN) |

---

## Key Metrics to Track

| Metric | Target | Why |
|--------|--------|-----|
| Order processing time | <15 seconds | Speed is everything in F&B |
| System uptime | 99.5% | Downtime = lost revenue |
| Offline recovery | <5s sync on reconnect | Hawker stall reality |
| Staff onboarding time | <30 minutes | Low tech literacy tolerance |
| SST report accuracy | 100% | Legal compliance |
| Monthly active outlets | Growth metric | Business health |

---

## Next Steps

1. **Validate with real operators** — Interview 3-5 Malaysian F&B owners (kopitiam, hawker, restaurant)
2. **Technical spike** — Backend setup (Supabase + Vercel), auth flow, SST calculation engine
3. **Phase 1 build** — SST, receipts, i18n, reports
4. **Pilot** — Deploy to 1-2 friendly restaurants for real-world testing
