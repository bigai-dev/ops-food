# 🍜 FoodOps — Vibe Coding Workshop Demo

A demo restaurant-management single-page app built for the **Vibe Coding Workshop**. It's a pretend POS / kitchen / inventory / reports dashboard for a Malaysian F&B shop — trilingual (中文 / English / Bahasa Melayu), dark-mode-ready, and fully client-side (no backend, no sign-up, no API keys).

You will use this as a starting point and extend it with **Claude Code**.

---

## 🚀 Quick Start (5 minutes)

### 1. Prerequisites

You only need **Node.js 20+** and **npm**. Check with:

```bash
node --version   # should print v20.x or higher
npm --version
```

If you don't have it: install from [nodejs.org](https://nodejs.org) (LTS version).

### 2. Clone & install

```bash
git clone https://github.com/<your-username>/demo2-foodops.git
cd demo2-foodops
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

Open the printed URL (usually http://localhost:5173). Hot-reload is on — edit any file and it updates instantly.

That's it. No environment variables, no database, no accounts. Everything lives in your browser's `localStorage`.

### Other commands

| Command           | What it does                                 |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the dev server (hot reload)            |
| `npm run build`   | Build an optimised bundle into `dist/`       |
| `npm run preview` | Serve the built bundle locally               |
| `npm run lint`    | Run ESLint                                   |

### Reset the demo data

The app persists state in `localStorage`. To start fresh:

1. Open the site in your browser
2. Open DevTools → Application → Local Storage → delete the `foodops-*` entries
3. Refresh

Or just open in an incognito window.

---

## 🧭 What's Inside

### Tech stack

- **React 19** + **Vite 8** — build tooling
- **Tailwind CSS v4** + **shadcn/ui** (Base Nova style) — styling & components
- **Zustand** — state management (with localStorage persistence)
- **React Router v7** — routing
- **Recharts** — dashboard charts
- **Lucide React** — icons
- **Custom i18n** — trilingual support (zh / en / bm)

### Pages

| Route         | What it is                                                   |
| ------------- | ------------------------------------------------------------ |
| `/dashboard`  | KPIs, revenue charts, sales ranking, payment mix             |
| `/orders`     | Point-of-sale: build an order, pick table & payment, print receipt |
| `/kitchen`    | Kitchen display system — live order tickets                  |
| `/tables`     | Dine-in table map (available / occupied / reserved)          |
| `/inventory`  | Stock levels, reorder alerts, cost tracking                  |
| `/schedule`   | Staff shift scheduler                                        |
| `/reports`    | Daily/weekly SST reports, P&L snapshot                       |
| `/settings`   | Language switcher, theme, demo-data reset                    |

### Project layout

```
demo2-foodops/
├── index.html              # Vite entry point
├── vite.config.js          # Vite + Tailwind config, @/ path alias
├── components.json         # shadcn/ui config
├── src/
│   ├── main.jsx            # App bootstrap (providers + router)
│   ├── App.jsx             # Route wrapper
│   ├── data.js             # Demo data: menu, staff, tables, SST rate
│   ├── store.js            # Zustand store (orders, inventory, etc.)
│   ├── index.css           # Tailwind + CSS variables + dark-mode tokens
│   ├── pages/              # One file per route
│   ├── components/
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog…)
│   │   ├── SidebarLayout.jsx
│   │   ├── TopBar.jsx
│   │   ├── KpiCard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── ReceiptPreview.jsx
│   │   └── ToastProvider.jsx
│   ├── i18n/               # translations + I18nContext
│   └── lib/
│       ├── utils.js        # cn() helper
│       └── hooks/          # useDarkMode, useChartTheme, useCountUp
├── product/                # Product docs (plan, DB schema, design reference)
└── tests/                  # Vitest tests
```

---

## 🛠 Modify This with Claude Code

This repo is designed to be a **sandbox for practising prompt-driven development**. Below are suggested exercises, each with a sample Claude Code prompt you can paste directly. Start small, work up.

> Tip: when Claude edits files, keep the dev server (`npm run dev`) running so you can see every change live.

### 🟢 Warm-up — Small, safe changes

Try these first to build confidence:

- **Rename the restaurant**
  > *In `src/data.js`, change `BUSINESS_INFO.name` to my own restaurant name in all three languages (zh / en / bm). Also update the logo emoji in `src/components/SidebarLayout.jsx` to match.*

- **Add a new menu item**
  > *Add a new item to the `MENU` array in `src/data.js` called "Roti Canai" (zh: 印度煎饼, bm: Roti Canai), priced RM 3, category "appetizer", halal true. Give it the 🫓 emoji. Make sure it shows up on the Orders page.*

- **Change the brand colour**
  > *Change the primary accent colour from blue to emerald green across the whole app. Look in `src/index.css` for the CSS variables and update both light and dark mode.*

### 🟡 Intermediate — Touch multiple files

- **Add a "Tax-inclusive" pricing toggle** in Settings that re-renders the menu with prices that already include 8% SST.

- **Add a new page `/customers`** in the sidebar that lists repeat customers based on order history. Include a search input and a badge showing total lifetime spend.

- **Export reports to CSV** — Add a "Download CSV" button on the Reports page that exports the current day's orders.

- **Add keyboard shortcuts** — `O` to open Orders, `K` for Kitchen, `D` for Dashboard, `/` to focus search.

### 🔴 Ambitious — Bigger redesigns

- **Rewrite Orders into a split-screen tablet POS** with a category sidebar on the left, item grid in the middle, and running cart on the right.

- **Add a 4th language** (e.g. Tamil) — extend `src/i18n/translations.js` and the locale selector.

- **Wire it to a real backend** — Replace the Zustand localStorage with Supabase. Use the schema sketched in `product/DB_SCHEMA.md` as a starting point.

- **Build a customer-facing QR menu** — A new public route `/menu/:tableId` that a customer at a table scans to place orders directly.

### Suggested Claude Code prompt style

Claude works best with:
1. **What** you want (the feature, in 1–2 sentences)
2. **Where** it lives (point at the file / route)
3. **Why / constraints** (keep it trilingual, match existing styling, don't break persistence, etc.)

Example:

> *I want to add a "Happy Hour" feature. Between 3pm–6pm local time, all drinks in the menu should display a 20% discount badge on the Orders page and the order total should apply the discount. The data lives in `src/data.js` (look for `category: 'drink'`), the Orders UI is in `src/pages/Orders.jsx`, and the total is computed in `src/store.js` → `submitOrder`. Keep all three languages working (see `src/i18n/translations.js`).*

---

## 📚 Background Reading

- [`product/PRODUCT_PLAN.md`](product/PRODUCT_PLAN.md) — the imagined product roadmap (Malaysian F&B context, RICE-prioritised features)
- [`product/DB_SCHEMA.md`](product/DB_SCHEMA.md) — sketched database schema if you were to add a real backend
- [`product/features.csv`](product/features.csv) — flat feature list
- [`product/design-reference.html`](product/design-reference.html) — the original hand-written HTML/CSS design reference used to guide the rebuild

---

## 🔒 Secrets & Safety

This project has **no secrets, no API keys, and no backend**. All "business data" in [`src/data.js`](src/data.js) (restaurant name, SST number, address) is fabricated for the demo.

If you extend this project to talk to a real backend (Supabase, Stripe, OpenAI, etc.):

- Put keys in a `.env.local` file — it's already in [`.gitignore`](.gitignore)
- Never commit `.env*` files
- For Vite, client-side vars must be prefixed `VITE_` (and will be **publicly visible** in the built JS — don't put server secrets there)

---

## 🐛 Troubleshooting

| Symptom                                       | Fix                                                          |
| --------------------------------------------- | ------------------------------------------------------------ |
| `npm install` fails with Node version errors  | Upgrade to Node 20+ (`nvm install 20 && nvm use 20`)         |
| Port 5173 is in use                           | `npm run dev -- --port 5174`                                 |
| Styles look broken after editing `index.css`  | Save & hard-refresh (Cmd+Shift+R). Check the Vite terminal for Tailwind errors. |
| localStorage has stale data                   | DevTools → Application → Local Storage → clear site data     |
| Dark mode doesn't toggle                      | Check `src/lib/hooks/use-dark-mode.js` and the `<html>` class in DevTools |

---

## 📝 License

This is workshop material — use it however you like. Fork it, break it, rebuild it, ship it.
