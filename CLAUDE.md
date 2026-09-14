# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

RecipeChain frontend: a Next.js 16 (App Router) app for a recipe marketplace where sellers publish recipes and buyers purchase them, paid for via an XRPL wallet. There are three user roles — **buyer**, **seller**, **admin** — each with its own route tree and dashboard. This repo is a pure client: it has no `app/api` routes of its own. All business data comes from a separate backend service reached at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`); this frontend will not function standalone.

## Commands

```bash
npm run dev              # start dev server (Turbopack, 8GB heap)
npm run build             # production build (8GB heap)
npm run lint               # eslint .

npm run test               # vitest run (src/tests/**)
npm run test:watch         # vitest watch mode
npm run test:coverage      # vitest run --coverage
npm run test:jest          # jest (__test__/**)
npm run test:jest:watch    # jest --watch
```

Run a single test:
```bash
npx vitest run src/tests/auth/login.test.tsx
npx jest __test__/components/FullRecipeView.test.tsx
```

There are **two parallel test setups** — Vitest (`vitest.config.ts` / `vitest.setup.ts`) for tests under `src/tests/**`, and Jest (`jest.config.js` / `jest.setup.ts`, via `next/jest`) for tests under `__test__/**`. Match the runner to whichever directory you're adding a test to; don't mix jest/vitest APIs across them.

## Architecture

### Auth model — three overlapping systems

Authentication/identity is split across three mechanisms that all have to agree for a page to render correctly:

1. **Supabase** (`@supabase/ssr`, `src/utils/supabase/{client,server}.ts`, `src/lib/supabase.ts`) — used in `middleware.ts` to check for a live Supabase session.
2. **Web3Auth** (`src/lib/web3/Web3AuthProvider.tsx`, wraps the app via `src/context/Providers.tsx`) — handles the actual login UI/social login and exposes a provider whose `private_key` request (`src/lib/web3/getWeb3AuthPrivKey.ts`) deterministically derives the user's XRPL wallet (`src/lib/xrpl/deriveXrpl.ts`, `getXrplWallet.ts`). The resulting ID token is POSTed to the external backend (`/auth/web3auth/sync`) via `AuthContext.syncWeb3AuthSession`, which is what actually establishes the app session.
3. **Cookie-based role/session flags** (`recipe_chain_authed`, `recipe_chain_role`) — set by the backend and read by `middleware.ts` to gate routes and redirect buyer vs seller vs unauthenticated users. This, not the Supabase session, is the source of truth for route protection.

`src/context/AuthContext.tsx` holds client-side user/role state and talks to the backend at `${NEXT_PUBLIC_API_URL}/me` (falling back to `/buyers/me/profile`) to hydrate the current user — it does not read Supabase or Web3Auth state directly for `isAuthenticated`.

### Route protection (`middleware.ts`)

Matcher covers `/seller/:path*`, `/buyer/:path*`, `/login`, `/signup`, `/select-role`. Logic:
- No Supabase user but `recipe_chain_authed=1` → force logout redirect to `/login` (stale cookie state).
- `/buyer/*` and `/seller/*` require `recipe_chain_authed=1` and the matching `recipe_chain_role` cookie; mismatched role gets redirected to the other role's home, not a 403.
- Visiting an auth route (`/login`, `/signup`, `/select-role`) while already authed redirects to the role's home (`/recipes` for buyer, `/seller/kyc` for seller) unless role is unset, in which case `/select-role` is allowed through.
- Sellers land at `/seller/kyc` by default; `src/lib/getSellerEntryRoute.ts` decides whether a seller should instead go to `/seller/dashboard` (requires KYC `verification_status === "approved"` **and** `kyc_approval_page_seen === true`).

### Route groups under `src/app`

- `(auth)` — `login`, `signup` (unauthenticated flows)
- `(protected)` — `buyer/{cookbook,feedback,profile,review}`, `seller/{dashboard,kyc,profile,recipes}`, `recipes/[id]`
- `admin/` — separate, ungrouped tree with its own `login`, `dashboard`, `buyers`, `sellers`, `recipes`, `reviews`, `finance` — admin auth is independent of the buyer/seller cookie flow above and is not covered by `middleware.ts`'s matcher.

### Data/service layer

- `src/lib/api/*.ts` — one file per backend domain (`buyer`, `cookbook`, `sellerKyc`, `wallet`, `aiAssistant`); each builds requests against `NEXT_PUBLIC_API_URL` with `credentials: "include"`.
- `src/services/*.ts` — `recipeService.ts`, `savedRecipeService.ts`, similar pattern, slightly older convention. When adding new backend-facing functions, prefer `src/lib/api/` for new domains.
- `src/lib/types/` — shared TS types/interfaces per domain (`buyer.ts`, `cookbook.ts`, `recipe.ts`, `wallet.ts`).
- `src/lib/xrpl/` and `src/lib/web3/` — wallet derivation and Web3Auth plumbing; see auth section above. XRPL network config comes from `NEXT_PUBLIC_XRPL_NETWORK` / `NEXT_PUBLIC_XRPL_EXPLORER_BASE_URL` / `NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS`.
- Payments: Stripe is used for fiat top-up flows (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, see `stripe-best-practices`/`upgrade-stripe` skills for integration changes); actual recipe purchases settle in XRP via the wallet/XRPL layer (`src/hooks/useRecipePurchase.ts`, `useRecipeBatchPurchase.ts`).
- Images are uploaded via Cloudinary (`next-cloudinary`, `src/lib/cloudinary.ts`, `NEXT_PUBLIC_CLOUDINARY_*`); `next.config.ts` whitelists `res.cloudinary.com` and `images.unsplash.com` for `next/image`.

### Context providers

`src/context/Providers.tsx` composes, in order: `Web3AuthProvider` → `AuthProvider` → `RecipeCartProvider`. `RecipeFilterContext` is separate and used only where needed (not global). Nest new global providers inside this file rather than adding them directly to `layout.tsx`.

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`, `vitest.config.ts` resolve alias, and `jest.config.js` `moduleNameMapper`). Keep all three in sync if the alias changes.

### UI components

shadcn/ui is configured (`components.json`): style `new-york`, base color `neutral`, icons from `lucide-react`, components live in `src/components/ui`. Class merging uses `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) — use it instead of manual `className` string concatenation.
