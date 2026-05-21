# Alankarana

Mobile-first PWA for sales & inventory management — built with React + Redux Toolkit + Firebase.

## Stack

- **Vite** — build tool (sub-second HMR, smaller bundles than CRA)
- **React 18** + **React Router 6**
- **Redux Toolkit** — state management
- **Firebase v10** — auth, Firestore, storage (with offline persistence)
- **MUI 5** — component primitives (theme-driven)
- **Framer Motion** — animations
- **vite-plugin-pwa** — service worker, manifest, offline caching

## Setup

```bash
# 1. Install
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Fill in Firebase + Cloudinary creds in .env.local

# 4. Run dev server
npm run dev

# 5. Build for production
npm run build
```

### For future deployments:
```bash
npm run build && firebase deploy

## Project Structure

```
src/
 ├── app/               App root + global providers
 ├── routes/            Router config + guards
 ├── pages/             Route-level pages (lazy-loaded)
 ├── components/
 │    ├── common/       Reusable atoms (buttons, inputs)
 │    ├── layout/       TopBar, BottomNav
 │    └── feedback/     Toasts, dialogs, skeletons
 ├── modules/           Feature modules (inventory, sales, etc.)
 ├── services/          Business logic (sales engine, code gen)
 ├── firebase/          Firebase init + queries
 ├── hooks/             Custom hooks
 ├── utils/             Pure helpers (format, math)
 ├── store/             Redux store + slices
 ├── theme/             Tokens, MUI theme, provider, global CSS
 ├── layouts/           AppLayout, AuthLayout
 ├── assets/            Static assets
 └── constants/         App constants (categories, routes)
```

## Build Progress

### ✅ Round 1 — Scaffold
- Project structure, theme system, Redux store, routing, layouts
- Global feedback (toasts, confirm dialogs), offline tracking
- Unsaved-changes guard, item code generator, utilities
- PWA config

### ✅ Round 2 — Auth + Data Layer (this commit)
- **Firebase auth**: phone OTP (invisible reCAPTCHA) + email/password
- **Auth listener**: keeps Redux in sync with Firebase auth state
- **User profile**: auto-creates Firestore profile on first sign-in, fetches role
- **Login page**: tabbed UI (phone / email), OTP countdown + resend, full error handling
- **User menu**: avatar dropdown with sign-out confirmation
- **Public route guard**: redirects authenticated users away from /login
- **Firestore CRUD service**: `create`, `update`, `remove`, `getOne`, `getMany`, `txn`, `batch`
- **Generic query builder**: composes where/orderBy/limit from plain objects
- **Reactive hooks**: `useCollection`, `useDoc`, `useMutation` — every module's data layer
- **Cloudinary service**: unsigned upload with progress + client-side compression
- **Categories sync**: live subscription, merges Firestore custom + defaults
- **Domain slices**: sales, expenses, requests, vendors added to store
- **Firestore security rules**: RBAC (admin/staff/accountant) with self-bootstrap
- **Firestore indexes**: compound queries pre-declared
- **firebase.json**: hosting + rules + indexes config ready for `firebase deploy`

### ✅ Round 3 — Inventory Module (this commit)
- **Inventory list page**: sticky search, summary chips, filter sheet (bottom sheet on mobile), animated cards, skeleton loading, empty states, FAB
- **Item card**: image thumbnail, name, code, price, stock-status chip with color coding
- **Item detail page**: hero image, status badge, profit/margin stats, stock block, notes, primary "Record a sale" CTA, edit/duplicate/copy-code/delete menu, themed delete confirm
- **Add/Edit form** (single page, `mode` prop): react-hook-form, draft auto-save (localStorage, 7-day expiry), unsaved-changes guard, live profit + expected-revenue preview, sticky save button
- **Image picker**: multi-upload, client-side compression (4MB → ~200KB), progress per slot, max 4 photos
- **Category select**: dropdown with inline "Add new category" dialog — persists to Firestore globally
- **Pure filter logic** (`inventoryFilters.js`): search by name or code, category, stock status, flag (new/old/best-selling), sort — used by list page and reports later
- **Inventory service** (`inventoryService.js`): `createItem`, `updateItem`, `deleteItem`, `duplicateItem`, code generation on create, derived field computation in one place
- **Common components**: `EmptyState`, `StickySearch` (debounced), `FAB`, `ImagePicker`, `CategorySelect`
- Cleaner rewrite of `useUnsavedChangesGuard` blocker handling

### ✅ Rounds 4-8 — Sales, Expenses, Reports, Requests, Settings, Dashboard (this commit)

**Sales (Round 4)**
- New Sale page: item picker (autocomplete by name/code), qty, actual price (defaults to item's selling price but editable), discount, customer name, payment type, notes
- **Atomic Firestore transaction**: reads stock, checks availability, writes sale + decrements stock in one commit — no race conditions
- Live profit/loss preview as you type
- Sales list page: today/week/month/custom date filter, summary card (revenue + profit), reverse-sale option (restores stock atomically)
- `SaleCard` component with payment-type chip, profit/loss indicator

**Expenses (Round 5)**
- Add expense form: type, amount, date picker, optional bill photo, notes
- Bulk purchase toggle: shows vendor name + bill number fields for wholesale tracking
- Draft auto-save + unsaved-changes guard
- Expenses list: date filter, type icons, summary with top-3 category breakdown

**Reports (Round 6)**
- 4 tabs: Overview, Sales, Expenses, Inventory
- Net P&L card (sale profit minus expenses)
- Pure-SVG bar chart (no extra library) for revenue trend
- Top categories with progress bars
- Best-selling items list
- Expense breakdown with progress bars
- Inventory snapshot (stock value, low/out counts)

**Requests (Round 7)**
- Quick-add field at top, no separate page
- 3 tabs: Pending / Completed / All
- Tap checkbox to toggle complete (with strikethrough animation)
- Optional category tag, customer name

**Settings (Round 7)**
- Profile card with avatar, name, role
- Manage section: Categories, Vendors, Customer Requests
- Theme toggle (dark mode switch)
- About / version
- Sign-out with confirmation

**Categories management**
- List all (default + custom)
- Add new with inline dialog
- Delete custom only (defaults are protected)

**Vendors management**
- Full CRUD with name, phone, address, notes
- Linked from bulk purchase entry

**Dashboard (Round 8)**
- Today's sales hero ("₹X earned" or "Ready when you are")
- 4 stat cards: today sales, profit, stock value, monthly expenses — all tappable
- Primary "Record a sale" CTA
- Low-stock alert section (linked to item details)
- Recent sales today
- Best-sellers this week (top 3 with rank badges)
- Pending customer requests teaser

### What's intentionally NOT in this commit
- **Offline write queue**: Firestore's built-in offline persistence handles most cases automatically — writes queue when offline and sync when reconnected. A custom queue would be needed only for image uploads (Cloudinary doesn't queue). If you need this, ping me.
- **Virtualized lists**: not yet needed at scale (~hundreds of items). When you cross 2-3k items, add `react-window` to the inventory list.
- **PDF / Excel export from reports**: not in spec; easy to add later.

## Design Tokens

All colors, spacing, typography, shadows, and motion live in `src/theme/tokens.js`.
Change the palette once — the whole app updates. Light/dark modes auto-switch
on system preference and persist user choice.

## PWA

Install on phone: open the deployed URL in Chrome/Safari, "Add to Home Screen".
Works offline thanks to Firestore persistent cache + service worker runtime caching.
