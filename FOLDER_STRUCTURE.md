# RecipeChain Frontend - Folder Structure & Navigation Guide

## Project Structure

```
RecipeChain---Frontend/
├── src/
│   ├── app/                 # Next.js App Router (Pages & Routing)
│   ├── components/          # Reusable React Components
│   ├── context/             # React Context Providers
│   ├── lib/                 # Library code and utilities
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── services/            # API services and external integrations
├── public/                  # Static assets (images, fonts, etc.)
└── [config files]          # Configuration files at root
```

---

## Folder Descriptions

### `/src/app/` - Next.js App Router
This is the core of your application's routing system using Next.js 13+ App Router.

**What to include:**
- `page.tsx` - Route pages (e.g., `app/about/page.tsx` → `/about`)
- `layout.tsx` - Layouts that wrap pages
- `loading.tsx` - Loading UI for Suspense boundaries
- `error.tsx` - Error handling UI
- `not-found.tsx` - 404 page
- `route.ts` - API routes (e.g., `app/api/recipes/route.ts`)

**Current Routes:**
- `/` - Home page (`app/page.tsx`)
- `/recipes` - Recipes listing (`app/recipes/page.tsx`)
- `/profile` - User profile (`app/profile/page.tsx`)
- `/about` - About page (`app/about/page.tsx`)

**Example:**
```
app/
├── page.tsx              → / (Home)
├── layout.tsx            → Root layout for all pages
├── recipes/
│   ├── page.tsx         → /recipes
│   └── [id]/
│       └── page.tsx     → /recipes/:id (Dynamic route)
└── api/
    └── recipes/
        └── route.ts     → /api/recipes (API endpoint)
```

---

### `/src/components/` - Reusable Components
Shared React components used across multiple pages.

**What to include:**
- UI components (Buttons, Cards, Modals, Forms)
- Layout components (Header, Footer, Sidebar, Navbar)
- Feature-specific components (RecipeCard, UserAvatar)
- Compound components with multiple files in subfolders

**Organization Tips:**
```
components/
├── ui/                   # Generic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── layout/              # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
└── recipe/              # Feature-specific components
    ├── RecipeCard.tsx
    ├── RecipeList.tsx
    └── RecipeForm.tsx
```

**Example Component:**
```typescript
// components/ui/Button.tsx
export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="...">
      {children}
    </button>
  );
}
```

---

### `/src/context/` - React Context Providers
Global state management using React Context API.

**What to include:**
- Authentication context (user login state)
- Theme context (dark/light mode)
- Blockchain/Web3 context (wallet connection)
- Shopping cart or app-wide state

**Example:**
```typescript
// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Usage in layout.tsx:**
```typescript
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### `/src/lib/` - Library Code
Utility functions, helpers, and shared logic.

#### `/src/lib/types/` - TypeScript Types
Centralized type definitions and interfaces.

**What to include:**
- Interface definitions
- Type aliases
- Enums
- Shared types used across the app

**Example:**
```typescript
// lib/types/recipe.ts
export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  author: string;
  blockchainHash?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export enum RecipeCategory {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  DESSERT = 'dessert',
}
```

#### `/src/lib/utils/` - Utility Functions
Helper functions and utilities.

**What to include:**
- String manipulation helpers
- Date formatting functions
- Validation functions
- Data transformation utilities
- Class name utilities (e.g., `cn()` for Tailwind)

**Example:**
```typescript
// lib/utils/classNames.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils/formatDate.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
```

---

### `/src/services/` - API Services & External Integrations
Functions for interacting with external APIs, blockchain, and backend services.

**What to include:**
- API client functions
- Blockchain integration (Web3, ethers.js)
- Third-party service integrations
- Data fetching functions

**Example:**
```typescript
// services/recipeService.ts
export async function fetchRecipes() {
  const response = await fetch('/api/recipes');
  return response.json();
}

export async function createRecipe(recipe: Recipe) {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  return response.json();
}

// services/blockchainService.ts
import { ethers } from 'ethers';

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    return provider;
  }
  throw new Error('MetaMask not installed');
}

export async function storeRecipeOnChain(recipeHash: string) {
  // Blockchain logic here
}
```

---

### `/public/` - Static Assets
Static files served directly by Next.js.

**What to include:**
- Images (`/public/images/logo.png` → `/images/logo.png`)
- Fonts (if not using Google Fonts)
- Favicons (`favicon.ico`)
- Robots.txt, sitemap.xml
- Other static assets

**Example Usage:**
```typescript
// In a component
import Image from 'next/image';

export function Logo() {
  return <Image src="/images/logo.png" alt="Logo" width={100} height={50} />;
}
```

---

## Next.js App Router Navigation

### How Routing Works

Next.js App Router uses **file-system based routing**. The folder structure in `/src/app/` automatically creates routes.

#### Basic Routes
```
app/page.tsx                    → /
app/about/page.tsx              → /about
app/recipes/page.tsx            → /recipes
app/profile/page.tsx            → /profile
```

#### Dynamic Routes
Use `[parameter]` for dynamic segments:
```
app/recipes/[id]/page.tsx       → /recipes/123, /recipes/456
app/blog/[slug]/page.tsx        → /blog/hello-world
```

**Access parameters:**
```typescript
// app/recipes/[id]/page.tsx
export default function RecipePage({ params }: { params: { id: string } }) {
  return <div>Recipe ID: {params.id}</div>;
}
```

#### Catch-All Routes
Use `[...parameter]` for catch-all segments:
```
app/docs/[...slug]/page.tsx     → /docs/a, /docs/a/b, /docs/a/b/c
```

#### Route Groups
Use `(folderName)` to organize without affecting URL:
```
app/(marketing)/about/page.tsx  → /about
app/(marketing)/blog/page.tsx   → /blog
app/(shop)/cart/page.tsx        → /cart
```

---

### Navigation Methods

#### 1. Using `<Link>` Component (Recommended)
```typescript
import Link from 'next/link';

export function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/recipes">Recipes</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/about">About</Link>
    </nav>
  );
}
```

#### 2. Programmatic Navigation
```typescript
'use client';

import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  const handleLogin = async () => {
    // Login logic
    router.push('/profile'); // Navigate after login
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

#### 3. Using `redirect()` (Server Components)
```typescript
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const isAuthenticated = false; // Check auth

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <div>Protected Content</div>;
}
```

---

### Special Files in App Router

| File | Purpose | Example |
|------|---------|---------|
| `layout.tsx` | Shared UI for route segment | Root layout with header/footer |
| `page.tsx` | Unique UI for a route | Home page, About page |
| `loading.tsx` | Loading UI with Suspense | Skeleton loader |
| `error.tsx` | Error boundary UI | Error message display |
| `not-found.tsx` | 404 UI | Custom 404 page |
| `route.ts` | API endpoint | REST API routes |
| `template.tsx` | Re-rendered layout | Forms that reset on navigation |
| `default.tsx` | Fallback for parallel routes | Advanced routing |

---

### Layout Hierarchy

Layouts nest and wrap child routes:

```
app/
├── layout.tsx              (Root Layout - wraps everything)
│   └── recipes/
│       ├── layout.tsx      (Recipes Layout - wraps all /recipes/*)
│       │   ├── page.tsx    (/recipes)
│       │   └── [id]/
│       │       └── page.tsx (/recipes/:id)
```

**Example:**
```typescript
// app/layout.tsx (Root)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

// app/recipes/layout.tsx
export default function RecipesLayout({ children }) {
  return (
    <div>
      <RecipesSidebar />
      <main>{children}</main>
    </div>
  );
}
```

---

### Server vs Client Components

**Server Components (Default):**
- No `'use client'` directive
- Run on server, faster, SEO-friendly
- Cannot use hooks (useState, useEffect)
- Cannot use browser APIs

**Client Components:**
- Add `'use client'` at top
- Run in browser
- Can use React hooks
- Can handle user interactions

```typescript
// Server Component (default)
export default function RecipesPage() {
  return <div>Recipes</div>;
}

// Client Component
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## Path Aliases

Use `@/` to import from `/src/`:

```typescript
// Instead of: import { Button } from '../../components/ui/Button'
import { Button } from '@/components/ui/Button';
import { Recipe } from '@/lib/types/recipe';
import { fetchRecipes } from '@/services/recipeService';
```

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Best Practices

1. **Keep components small and focused** - One responsibility per component
2. **Use TypeScript** - Define types in `/lib/types/`
3. **Organize by feature** - Group related components together
4. **Server components by default** - Only use `'use client'` when needed
5. **Co-locate related files** - Keep tests and styles near components
6. **Use consistent naming** - PascalCase for components, camelCase for functions
7. **Extract reusable logic** - Move to `/lib/utils/` or custom hooks
8. **Keep services thin** - API logic in `/services/`, business logic in components

---

## Quick Reference

**Creating a new page:**
1. Create `app/your-route/page.tsx`
2. Export default function component
3. Access at `/your-route`

**Creating a new component:**
1. Create file in `components/` folder
2. Export named or default component
3. Import using `@/components/ComponentName`

**Adding API route:**
1. Create `app/api/your-endpoint/route.ts`
2. Export GET, POST, etc. functions
3. Access at `/api/your-endpoint`

**Navigation:**
```typescript
import Link from 'next/link';
<Link href="/recipes">Go to Recipes</Link>
```

---

For more information, visit:
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Documentation](https://react.dev)