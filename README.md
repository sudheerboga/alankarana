# Alankarana

Mobile-first PWA for boutique sales & inventory management — built with React + Redux Toolkit + Firebase.

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

### 🚧 Coming next
- **Round 4**: Sales module — search-item-then-sell flow, atomic stock decrement via Firestore transaction, sale history, payment types, customer name
- **Round 5**: Expenses + bulk purchase tracking (vendors)
- **Round 6**: Reports module
- **Round 7**: Requests, settings, categories management
- **Round 8**: Offline sync queue, dashboard with real stats, polish

## Design Tokens

All colors, spacing, typography, shadows, and motion live in `src/theme/tokens.js`.
Change the palette once — the whole app updates. Light/dark modes auto-switch
on system preference and persist user choice.

## PWA

Install on phone: open the deployed URL in Chrome/Safari, "Add to Home Screen".
Works offline thanks to Firestore persistent cache + service worker runtime caching.
