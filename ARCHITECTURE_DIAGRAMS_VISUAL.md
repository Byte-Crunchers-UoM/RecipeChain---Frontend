# Web3Auth Flow Diagrams & Architecture

## New User Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                                │
│                                                                  │
│  User clicks: "Create an account" link                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SIGNUP PAGE                                │
│                                                                  │
│  1. User reads: "3-step process"                                │
│  2. User accepts terms & conditions                             │
│  3. User clicks: "Sign Up with Web3Auth"                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WEB3AUTH MODAL OPENS                           │
│                                                                  │
│  ✓ User connects blockchain wallet                              │
│  ✓ Web3Auth completes authentication                            │
│  ✓ User data stored in context & localStorage                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROLE SELECTION PAGE                           │
│                                                                  │
│  User chooses: Seller or Buyer                                  │
│  System saves role to localStorage                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                  ┌─────┴─────┐
                  │           │
                  ▼           ▼
        ┌──────────────┐  ┌──────────────┐
        │  KYC FORM    │  │ BUYER DETAILS│
        │ (for Seller) │  │   (for Buyer)│
        └──────┬───────┘  └──────┬───────┘
               │                 │
               └────────┬────────┘
                        │
                        ▼
        ┌─────────────────────────────┐
        │  USER PROFILE DATA SAVED    │
        │  TO localStorage            │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌───────────────────────────────┐
        │   REDIRECT TO DASHBOARD       │
        │                               │
        │  ✓ Seller → /seller/dashboard │
        │  ✓ Buyer → /buyer/dashboard   │
        └───────────────────────────────┘
```

---

## Returning User Fast Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        LOGIN PAGE                                │
│                                                                  │
│  User clicks: "Connect with Web3Auth"                           │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Check isUserExist()?         │
         │  (Check localStorage)         │
         └──────────┬───────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
      YES│ (existing)         │NO (new)
         │                     │
         ▼                     ▼
    ┌─────────────┐      ┌──────────────┐
    │ Get saved   │      │ Redirect to  │
    │ role from   │      │ /signup page │
    │ localStorage│      └──────────────┘
    └──────┬──────┘
           │
           ▼
    ┌──────────────────┐
    │ Web3Auth Modal   │
    │ opens            │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ ✓ User detected          │
    │ ✓ Same wallet from before│
    │ ✓ Role auto-restored     │
    └──────┬───────────────────┘
           │
           ▼
    ┌────────────────────────────┐
    │ INSTANT REDIRECT            │
    │ (NO ROLE SELECTION PAGE!)   │
    │                             │
    │ ✓ To correct dashboard      │
    │ ✓ With saved preferences    │
    │ ✓ Fully authenticated       │
    └────────────────────────────┘
```

---

## Authentication State Machine

```
START
  │
  ├─→ Check isWeb3AuthInitialized
  │      │
  │      └─→ FALSE: Show Loading
  │           │
  │           └─→ (Wait for init)
  │
  └─→ Check user exists?
         │
         ├─→ YES (Returning User)
         │    │
         │    ├─→ Login page behavior:
         │    │    ├─ Restore role from localStorage
         │    │    ├─ Call login()
         │    │    └─ Redirect to dashboard
         │    │
         │    └─→ Dashboard state:
         │         ├─ isAuthenticated = true
         │         ├─ user = {id, email, name, role}
         │         └─ Can access protected routes
         │
         └─→ NO (New User)
              │
              ├─→ Login page behavior:
              │    ├─ Show "Create account" link
              │    └─ Redirect to /signup
              │
              └─→ Signup flow:
                   ├─ Web3Auth modal
                   ├─ Role selection
                   ├─ Onboarding form
                   └─ Dashboard access
```

---

## Protected Route Logic

```
User tries to access: /seller/dashboard
                │
                ▼
    ┌─────────────────────────────┐
    │ Check: isWeb3AuthInitialized?│
    └────────┬────────────────────┘
             │
      ┌──────┴───────┐
      │              │
     NO              YES
      │              │
      ▼              ▼
   LOADING    ┌─────────────────┐
              │ Check: user null?│
              └────────┬────────┘
                       │
                ┌──────┴──────┐
                │             │
              YES             NO
                │             │
                ▼             ▼
          REDIRECT    ┌──────────────────┐
          TO LOGIN    │ Check: role match?│
                      │ (requiredRole)    │
                      └────────┬─────────┘
                               │
                        ┌──────┴──────┐
                        │             │
                       NO            YES
                        │             │
                        ▼             ▼
                    REDIRECT    ✅ RENDER
                    TO CORRECT  COMPONENT
                    DASHBOARD
```

---

## Component Hierarchy

```
RootLayout (Server)
│
├─ RootClientLayout (Client)
│  │
│  └─ Web3AuthProvider (Context Provider)
│     │
│     ├─ (auth) layout
│     │  ├─ login/page.tsx
│     │  │  ├─ useWeb3Auth()
│     │  │  └─ Login Form
│     │  │
│     │  ├─ signup/page.tsx
│     │  │  ├─ useWeb3Auth()
│     │  │  └─ Signup Form
│     │  │
│     │  └─ role-select/page.tsx
│     │     ├─ useWeb3Auth()
│     │     └─ Role Cards
│     │
│     ├─ (protected) layout
│     │  │
│     │  ├─ seller/dashboard/page.tsx
│     │  │  ├─ ProtectedRoute (requiredRole="seller")
│     │  │  ├─ useWeb3Auth()
│     │  │  └─ Seller Dashboard
│     │  │
│     │  ├─ buyer/dashboard/page.tsx
│     │  │  ├─ ProtectedRoute (requiredRole="buyer")
│     │  │  ├─ useWeb3Auth()
│     │  │  └─ Buyer Dashboard
│     │  │
│     │  └─ admin/dashboard/page.tsx
│     │     ├─ ProtectedRoute (requiredRole="admin")
│     │     ├─ useWeb3Auth()
│     │     └─ Admin Dashboard
│     │
│     └─ home/page.tsx
│        ├─ useWeb3Auth()
│        └─ Home Page
```

---

## Data Flow Diagram

```
Web3Auth Modal
     │
     ├─ User connects wallet
     │
     ▼
userInformation = await web3Auth.getUserInfo()
     │
     ├─ {sub, email, name, picture, ...}
     │
     ▼
Store in Context:
     ├─ userInfo (raw Web3Auth data)
     ├─ user (processed: {id, email, name, role})
     └─ isAuthenticated = true
     │
     ├─ Store in localStorage:
     │  ├─ recipechain_auth (full userInformation)
     │  └─ recipechain_role (selected role)
     │
     ▼
useWeb3Auth() available to:
     ├─ Login page → Check if exists
     ├─ Signup page → Get user data
     ├─ Role select → Store role
     ├─ Dashboards → Display user info
     └─ ProtectedRoute → Check access
```

---

## localStorage State Diagram

```
┌─────────────────────────────────────────┐
│         BEFORE LOGIN                    │
│  recipechain_auth: null                 │
│  recipechain_role: null                 │
│  Other data: exists from previous setup │
└─────────────────────────────────────────┘
         │
         ├─ New User → /signup
         │
         ▼
┌─────────────────────────────────────────┐
│      AFTER WEB3AUTH CONNECTION          │
│  recipechain_auth: {                    │
│    sub: "user_123",                     │
│    email: "user@example.com",           │
│    name: "John Doe",                    │
│    picture: "https://...",              │
│    ...                                  │
│  }                                      │
│  recipechain_role: null (not yet)       │
└─────────────────────────────────────────┘
         │
         └─ User selects role
         │
         ▼
┌─────────────────────────────────────────┐
│      AFTER ROLE SELECTION               │
│  recipechain_auth: {...}                │
│  recipechain_role: "seller" or "buyer"  │
└─────────────────────────────────────────┘
         │
         └─ User completes onboarding
         │
         ▼
┌─────────────────────────────────────────┐
│      ONBOARDING FORM DATA               │
│  recipechain_auth: {...}                │
│  recipechain_role: "seller"             │
│  park_chain_kyc_data: {...} (if seller) │
│  park_chain_buyer_data: {...} (if buyer)│
└─────────────────────────────────────────┘
         │
         ├─ User logs out
         │
         ▼
┌─────────────────────────────────────────┐
│         AFTER LOGOUT                    │
│  recipechain_auth: null ✓ (cleared)     │
│  recipechain_role: null ✓ (cleared)     │
│  Other data: might persist              │
└─────────────────────────────────────────┘
```

---

## Error Handling Flow

```
User Action
    │
    ▼
Try {
    Execute action
} Catch {
    │
    ├─ Web3Auth Error
    │  └─ Show: "Failed to connect. Please try again."
    │
    ├─ Network Error
    │  └─ Show: "Connection failed. Check internet."
    │
    ├─ Validation Error
    │  └─ Show: "Please fill in all required fields"
    │
    └─ Unknown Error
       └─ Log to console
       └─ Show: "Something went wrong. Try again."
    │
    └─ Set loading = false
    └─ User can retry
}
```

---

## Role-Based Access Matrix

```
Route                    Seller  Buyer   Admin   Anon
────────────────────────────────────────────────────────
/login                     ✓       ✓       ✓       ✓
/signup                    ✓       ✓       ✓       ✓
/role-select              ✓*      ✓*      ✓*      ✗
/seller/dashboard          ✓       ✗       ✗       ✗
/buyer/dashboard           ✗       ✓       ✗       ✗
/admin/dashboard           ✗       ✗       ✓       ✗
/home                      ✓       ✓       ✓       ✗
/chef-kyc (seller form)    ✓       ✗       ✗       ✗
/buyer-details             ✗       ✓       ✗       ✗

Legend:
✓ = Allowed
✗ = Blocked (redirect)
✓* = Only if Web3Auth completed
Anon = Anonymous (not logged in)
```

---

## Session Lifecycle

```
SESSION START
    │
    ├─ Web3Auth.init()
    │
    ├─ Check localStorage for existing session
    │
    ├─ If found:
    │  └─ Restore user from localStorage
    │     ├─ user = parsed recipechain_auth
    │     └─ isAuthenticated = true
    │
    └─ If not found:
       └─ user = null
       └─ isAuthenticated = false
    │
    ▼
SESSION ACTIVE (User logged in)
    │
    ├─ All protected routes accessible
    ├─ Context provides user data
    ├─ localStorage persists session
    │
    ├─ Page refresh:
    │  └─ Session restored automatically
    │
    └─ Browser close:
       └─ Session persists (localStorage)
    │
    ▼
SESSION END (Logout)
    │
    ├─ logout() called
    │  │
    │  ├─ web3Auth.logout()
    │  ├─ Clear context state
    │  │  ├─ user = null
    │  │  ├─ userInfo = null
    │  │  ├─ isAuthenticated = false
    │  │  └─ provider = null
    │  │
    │  └─ Clear localStorage
    │     ├─ Remove recipechain_auth
    │     └─ Remove recipechain_role
    │
    ├─ Redirect to /login
    │
    └─ Session fully cleared
```

---

## Web3Auth Initialization Sequence

```
1. Component Mounts
   └─ useEffect() triggers
   
2. Web3Auth Instance Created
   └─ new Web3Auth({...config})
   
3. Initialize Web3Auth
   └─ web3authInstance.init()
   
4. Set isWeb3AuthInitialized = true
   └─ Even if initialization fails (allows retry)
   
5. Check if Already Connected
   └─ if (web3authInstance.status === 'connected')
      ├─ YES: Get user info
      ├─ Set userInfo
      └─ Set provider
      
6. Context Ready
   └─ All hooks now functional
   └─ User can login/logout
```

---

## Key Functions & Their Flow

```
┌─ login() ─────────────────────────────────┐
│ 1. web3Auth.connect()                     │
│    └─ Opens Web3Auth modal                │
│ 2. Wait for user to complete              │
│ 3. Get provider                           │
│ 4. Get userInformation                    │
│ 5. Save to localStorage                   │
│ 6. Update context state                   │
│ 7. Return to component                    │
└───────────────────────────────────────────┘

┌─ logout() ────────────────────────────────┐
│ 1. web3Auth.logout()                      │
│    └─ Disconnects wallet                  │
│ 2. Clear all state                        │
│ 3. Clear localStorage                     │
│ 4. Set isAuthenticated = false            │
│ 5. Return to component                    │
└───────────────────────────────────────────┘

┌─ isUserExist() ───────────────────────────┐
│ 1. Check localStorage.recipechain_auth    │
│ 2. Check localStorage.recipechain_role    │
│ 3. Return: both exist? true : false       │
└───────────────────────────────────────────┘
```

---

## Comparison: Before vs After

```
BEFORE (Broken):
────────────────────────────────────────
Login page:
  User clicks button
    → Always seller dashboard
    → No user detection
    
Signup page:
  User clicks button
    → Skip Web3Auth
    → Go directly to role select
    
User tracking:
  → No existence check
  → Could create duplicates

AFTER (Fixed):
────────────────────────────────────────
Login page:
  User clicks button
    → Check isUserExist()
    → Route accordingly
    → Proper Web3Auth
    
Signup page:
  User clicks button
    → Web3Auth modal appears
    → Role selection after
    → Proper sequencing
    
User tracking:
  → Dedicated function
  → Reliable detection
  → localStorage backed
```

---

## Technology Stack

```
Frontend Framework
├─ Next.js 16.0.1
├─ React 19.2.0
└─ TypeScript 5

Web3 & Blockchain
├─ Web3Auth Modal 10.7.0
├─ Web3Auth Base 9.7.0
├─ Ethereum (Sepolia testnet)
└─ EIP155 chain namespace

State Management
├─ React Context API
├─ Custom Web3AuthProvider
└─ localStorage persistence

UI Framework
├─ Tailwind CSS 4
├─ Lucide React (icons)
└─ Custom styling

Build Tools
├─ Turbopack
├─ ESLint
└─ PostCSS
```

---

**Diagram Version**: 2.0  
**Updated**: January 11, 2026  
**Status**: Complete ✅

