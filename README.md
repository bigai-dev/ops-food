# FoodOps

A trilingual, fully client-side restaurant operations dashboard for a Malaysian F&B shop — POS, kitchen display, tables, inventory, scheduling, and an AI sales forecast in one place.

FoodOps is a single-page demo app that simulates the day-to-day operations of a restaurant: taking orders, running a kitchen display, tracking tables and stock, scheduling staff, and reviewing a simulated AI sales forecast. It was built as a starting point for the Vibe Coding Workshop, so anyone can run it locally with no backend, no sign-up, and no API keys, then extend it with AI-assisted coding.

## Features

- **Dashboard** — KPI cards, revenue and sales charts, sales ranking, and payment-method mix
- **Point of sale (Orders)** — build an order, pick order type, table, and payment method, then preview and print a receipt
- **Kitchen display system (Kitchen)** — live order tickets with kitchen statuses
- **Table map (Tables)** — dine-in floor view with available/occupied states, an editable floor plan, and drag-and-drop arrangement
- **Inventory** — stock levels, low-stock reorder alerts, and cost tracking, with low-stock badges in the sidebar
- **Staff scheduling (Schedule)** — weekly shift grid with an auto-arrange scheduler across morning/afternoon/evening shifts
- **AI Forecast (Reports)** — simulated AI sales forecast: 7-day revenue projection, AI insight cards, menu-item performance, and an ingredient reorder forecast
- **Schedule settings (Settings)** — global scheduling rules (min cooks/staff per shift, weekend staffing) and per-staff preferences (preferred shifts, unavailable days, max shifts per week)
- **Receipt printing** — after placing an order, preview a receipt and export it to PDF (`html2pdf.js`)
- **Top bar controls** — language switcher and a light/dark theme toggle on every page
- **Demo-data reset** — one-click reset to the seed demo data from the sidebar
- **Trilingual UI** — full Chinese / English / Bahasa Melayu support via a custom i18n layer
- **Dark mode** — built-in light/dark theming with CSS variables
- **Local persistence** — all state is saved to the browser's `localStorage`, so your data survives refreshes
- **Live notifications** — sidebar badges for new kitchen orders and low-stock items

## Tech Stack

- **Framework:** React 19 + React Router 7
- **Build tooling:** Vite 8
- **Language:** JavaScript (JSX, ES modules)
- **Styling:** Tailwind CSS v4 with shadcn/ui (Base Nova style) and `tw-animate-css`
- **State management:** Zustand 5 with `persist` middleware (localStorage)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Drag and drop:** `@dnd-kit/react` + `@dnd-kit/helpers`
- **PDF export:** `html2pdf.js` (receipt printing)
- **Fonts:** DM Sans (body) and Plus Jakarta Sans (headings), loaded from Google Fonts
- **Extras:** `canvas-confetti`
- **Internationalization:** custom i18n context (zh / en / bm)

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Then open http://localhost:5173 in your browser. Hot reload is on — edit any file and it updates instantly.

Other available commands:

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload        |
| `npm run build`   | Build an optimized production bundle to `dist/` |
| `npm run preview` | Serve the built bundle locally              |
| `npm run lint`    | Run ESLint                                  |
| `npm test`        | Run the store tests in `tests/`             |

This project has no backend and no environment variables — all data lives in your browser's `localStorage`. To start fresh, use the reset option in the sidebar or clear the site's local storage in your browser dev tools.

## Project Structure

- `index.html` — Vite entry point
- `vite.config.js` — Vite + Tailwind config and the `@/` path alias
- `components.json` — shadcn/ui configuration
- `src/main.jsx` — app bootstrap (providers + router)
- `src/App.jsx` — route wrapper
- `src/data.js` — demo data: menu, staff, tables, inventory, SST rate
- `src/store.js` — Zustand store with localStorage persistence
- `src/index.css` — Tailwind layers, CSS variables, and dark-mode tokens
- `src/pages/` — one file per route (Dashboard, Orders, Kitchen, Tables, Inventory, Schedule, Reports, Settings)
- `src/components/` — layout and feature components, with `ui/` holding shadcn/ui primitives
- `src/i18n/` — translations and the I18n context
- `src/lib/` — `utils.js` helper, plus `hooks/` with custom hooks (`use-dark-mode`, `use-chart-theme`, `use-count-up`)
- `product/` — product docs: plan, sketched DB schema, feature list, and design reference
- `tests/` — test files

## Notes

This app was built as a hands-on demo for the **Vibe Coding Workshop**. It is intentionally self-contained: no backend, no accounts, no secrets. All "business data" (restaurant name, SST number, address, menu) in `src/data.js` is fabricated for the demo. It is designed to be a sandbox for practicing prompt-driven development — fork it, extend it, and rebuild it however you like. The `product/` folder includes a sketched database schema if you later want to wire it to a real backend.
