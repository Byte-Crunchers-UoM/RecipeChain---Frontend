# Web3Auth Implementation Details - Developer Reference

## Context: Web3AuthProvider

### Location
`src/app/lib/web3/Web3AuthProvider.tsx`

### Purpose
Central authentication provider for the entire application. Manages Web3Auth initialization, user login/logout, and user state persistence.

### Exported Hook
```typescript
const { /* properties */ } = useWeb3Auth()
```

### Available Properties & Methods

#### **State Properties**
```typescript
selectedRole: UserRole | null
// Currently selected role for signup flow
// Values: 'seller', 'buyer', 'admin'

web3Auth: Web3Auth | null
// Web3Auth instance (null until initialized)

provider: IProvider | null
// Web3 provider for blockchain interactions

isWeb3AuthInitialized: boolean
// True when Web3Auth has finished initializing

userInfo: any
// Raw data from Web3Auth (contains sub, email, name, etc)

user: Web3AuthUser | null
// Processed user object with id, email, name, role

isAuthenticated: boolean
// True if user is currently authenticated
```

#### **Methods**
```typescript
setSelectedRole(role: UserRole): void
// Set the role before login (used in signup flow)

login(): Promise<void>
// Trigger Web3Auth modal and connect user
// Saves user data to localStorage with 'recipechain_' prefix

logout(): Promise<void>
// Disconnect user and clear all data

isUserExist(): boolean
// Check if user has completed signup before
// Returns true if localStorage has both auth and role data

getWalletAddress(): string | null
// Get user's wallet address (returns null if not available)
```

---

## User Objects

### Web3AuthUser Interface
```typescript
interface Web3AuthUser {
  id: string;           // Unique user ID from Web3Auth (sub field)
  email?: string;       // User's email address
  name?: string;        // User's name from Web3Auth profile
  role?: UserRole;      // User's selected role: 'seller', 'buyer', 'admin'
}
```

### localStorage Structure

**After successful Web3Auth login:**
```javascript
{
  recipechain_auth: {
    "sub": "abc123def456...",      // Web3Auth user ID
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://...",
    "aud": "...",
    "iss": "https://...",
    "iat": 1234567890,
    "exp": 1234567890,
    "walletAddress": "0x123..." // Optional, depends on Web3Auth config
  },
  recipechain_role: "seller"  // or "buyer" or "admin"
}
```

---

## Login Flow - Step by Step

### New User Flow
```typescript
// 1. User clicks "Create an account" on login page
router.push('/signup')

// 2. On signup page, user accepts terms
const handleSignup = async () => {
  if (!acceptTerms) {
    setError('Please accept terms')
    return
  }
  
  // 3. User clicks "Sign Up with Web3Auth"
  setConnectLoading(true)
  
  // 4. Web3Auth modal opens (user connects wallet)
  // 5. After connection, login() is called
  await login()
  
  // 6. User redirected to role-select page
  router.push('/role-select')
}

// 7. User selects role and continues
const handleContinue = async () => {
  setSelectedRole(selectedRole)
  
  // 8. Save to localStorage
  localStorage.setItem('recipechain_role', selectedRole)
  
  // 9. Redirect to onboarding
  if (selectedRole === 'seller') {
    router.push('/chef-kyc')
  } else {
    router.push('/buyer-details')
  }
}

// 10. User completes onboarding form
// 11. Form data saved to localStorage
// 12. User redirected to dashboard
```

### Existing User Flow
```typescript
// 1. User visits /login
// 2. User clicks "Connect with Web3Auth"

const handleLogin = async () => {
  // 3. Check if user exists
  const userExists = isUserExist()
  // Returns true if recipechain_auth and recipechain_role exist
  
  if (userExists) {
    // 4. Get saved role from localStorage
    const storedRole = localStorage.getItem('recipechain_role')
    
    // 5. Set role in context
    setSelectedRole(storedRole)
    
    // 6. Call login (Web3Auth modal opens)
    await login()
    
    // 7. User object updated with previous role
    // 8. useEffect hook triggers
    // 9. User redirected to role-specific dashboard
    if (user.role === 'seller') {
      router.push('/seller/dashboard')
    } else if (user.role === 'buyer') {
      router.push('/buyer/dashboard')
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard')
    }
  } else {
    // 4. New user - redirect to signup
    router.push('/signup')
  }
}
```

---

## Role-Based Routing

### Login Redirects
| User State | Action | Result |
|---|---|---|
| New user | Click login | → /signup |
| Existing seller | Click login | → /seller/dashboard |
| Existing buyer | Click login | → /buyer/dashboard |
| Existing admin | Click login | → /admin/dashboard |

### Protected Routes
```typescript
// ProtectedRoute component checks:
1. Is user authenticated? (user.id exists)
2. Does user have required role? (requiredRole matches user.role)
3. If not → Redirect to appropriate dashboard or login
```

### Dashboard Protection
```typescript
// /src/app/(protected)/seller/dashboard/page.tsx
useEffect(() => {
  if (isWeb3AuthInitialized && (!user || user.role !== 'seller')) {
    router.push('/login')
  }
}, [user, isWeb3AuthInitialized, router])
```

---

## Logout Process

```typescript
const handleLogout = async () => {
  try {
    // 1. Call logout
    await logout()
    
    // 2. Inside logout():
    // - web3Auth.logout() called
    // - provider cleared
    // - userInfo cleared
    // - user cleared (set to null)
    // - isAuthenticated set to false
    // - selectedRole cleared
    // - localStorage items removed:
    //   * recipechain_auth
    //   * recipechain_role
    
    // 3. useEffect in ProtectedRoute detects user = null
    // 4. User redirected to /login
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
```

---

## Common Implementation Patterns

### Pattern 1: Check if User is Logged In
```typescript
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'

function MyComponent() {
  const { user, isWeb3AuthInitialized } = useWeb3Auth()
  
  if (!isWeb3AuthInitialized) {
    return <LoadingSpinner />
  }
  
  if (!user) {
    return <p>Please log in</p>
  }
  
  return <p>Welcome, {user.name}!</p>
}
```

### Pattern 2: Protect a Page by Role
```typescript
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'
import ProtectedRoute from '@/components/custom/ProtectedRoute'

export default function SellerOnlyPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <div>Only sellers see this</div>
    </ProtectedRoute>
  )
}
```

### Pattern 3: Role-Based Rendering
```typescript
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'

function Dashboard() {
  const { user } = useWeb3Auth()
  
  switch(user?.role) {
    case 'seller':
      return <SellerDashboard />
    case 'buyer':
      return <BuyerDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <LoginRequired />
  }
}
```

### Pattern 4: Redirect After Action
```typescript
import { useRouter } from 'next/navigation'
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'

export default function UploadRecipe() {
  const router = useRouter()
  const { user } = useWeb3Auth()
  
  const handleUpload = async (recipe) => {
    // ... upload logic ...
    
    // Redirect to seller dashboard
    if (user?.role === 'seller') {
      router.push('/seller/dashboard')
    }
  }
}
```

---

## Error Handling

### Web3Auth Initialization Errors
```typescript
const init = async () => {
  try {
    const web3authInstance = new Web3Auth({...})
    await web3authInstance.init()
    setIsWeb3AuthInitialized(true)
  } catch (error) {
    console.error('Web3Auth initialization error:', error)
    // Still set to true to allow retry
    setIsWeb3AuthInitialized(true)
  }
}
```

### Login Errors
```typescript
const handleLogin = async () => {
  try {
    await login()
  } catch (err) {
    console.error('Login failed:', err)
    setError('Failed to connect. Please try again.')
  }
}
```

### Common Errors
```
Error: useWeb3Auth must be used within Web3AuthProvider
  → Provider not wrapping component
  → Fix: Ensure RootClientLayout uses Web3AuthProvider

Error: Web3Auth not initialized
  → Initialization failed
  → Fix: Check console for init errors, restart dev server

Error: localStorage.recipechain_auth is undefined
  → User data not saved
  → Fix: Check if login() completes successfully
```

---

## Testing Scenarios

### Test 1: Fresh Install - New User Signup
```bash
# Setup
1. Clear localStorage: localStorage.clear()
2. Go to /login

# Expected Flow
1. Click "Create account"
2. Redirected to /signup
3. Accept terms
4. Click "Sign Up with Web3Auth"
5. Web3Auth modal appears
6. Complete Web3Auth
7. Redirected to /role-select
8. Select role and continue
9. Complete onboarding form
10. Redirected to dashboard

# Verify
- localStorage has recipechain_auth
- localStorage has recipechain_role
- User object populated in context
- isAuthenticated = true
```

### Test 2: Returning User Login
```bash
# Setup
1. Have completed signup (from Test 1)
2. Restart browser
3. Go to /login

# Expected Flow
1. Click "Connect with Web3Auth"
2. Web3Auth modal appears
3. Complete same wallet auth
4. Automatically redirected to dashboard
5. No role selection page

# Verify
- isUserExist() returns true
- User object auto-restored from localStorage
- Correct dashboard for user's role
```

### Test 3: Protected Route Access
```bash
# Setup
1. Login as seller

# Test
1. Try to access /buyer/dashboard manually
2. Or try to access /admin/dashboard

# Expected
- Redirect to /seller/dashboard
- Not allowed to access other roles
```

### Test 4: Logout
```bash
# Setup
1. Login and on dashboard

# Test
1. Click Logout

# Expected
- Redirected to /login
- localStorage cleared
- User object cleared
- On next login, treated as new user (if localStorage not restored)
```

---

## Migration from Old Context

If migrating code from old `Web3AuthContext`:

### Old Import
```typescript
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

const { user, isLoading, isAuthenticated } = useWeb3Auth()
```

### New Import
```typescript
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'

const { user, isWeb3AuthInitialized } = useWeb3Auth()
// Note: isLoading changed to isWeb3AuthInitialized
// Structure is similar but enhanced
```

### Property Mapping
| Old | New | Notes |
|---|---|---|
| `isLoading` | `isWeb3AuthInitialized` | Same concept, different name |
| `user` | `user` | Now includes role information |
| `login()` | `login()` | Same interface |
| `logout()` | `logout()` | Same interface |
| - | `isUserExist()` | New function |
| - | `getWalletAddress()` | New function |
| - | `selectedRole` | New state for signup flow |
| - | `isAuthenticated` | New state tracking |

---

## Debugging Tips

### Check User State in Console
```javascript
// Open DevTools console and run:
localStorage.getItem('recipechain_auth')
localStorage.getItem('recipechain_role')
```

### Debug Web3Auth Initialization
```typescript
// Add to Web3AuthProvider init
const init = async () => {
  try {
    console.log('Initializing Web3Auth...')
    const web3authInstance = new Web3Auth({...})
    await web3authInstance.init()
    console.log('Web3Auth initialized successfully')
    console.log('Status:', web3authInstance.status)
    setIsWeb3AuthInitialized(true)
  } catch (error) {
    console.error('Web3Auth init failed:', error)
  }
}
```

### Monitor User State Changes
```typescript
// Add useEffect for debugging
useEffect(() => {
  console.log('User changed:', user)
  console.log('Is authenticated:', isAuthenticated)
}, [user, isAuthenticated])
```

---

## Performance Considerations

1. **Lazy Initialization**: Web3Auth initializes on mount, not on demand
2. **localStorage**: Used for persistence, no database calls
3. **Context Updates**: Re-renders all consuming components
4. **Modal Performance**: Web3Auth modal handled by Web3Auth library

---

## Security Notes

⚠️ **Current State** (Test/Development):
- User data stored in plaintext localStorage
- No backend verification
- Web3Auth tokens not validated on backend
- No session expiry

✅ **Production Recommendations**:
1. Store tokens securely (httpOnly cookies)
2. Verify Web3Auth tokens on backend
3. Implement session expiry (typically 1 hour)
4. Use refresh tokens for longer sessions
5. Never expose sensitive data in localStorage
6. Implement CSRF protection
7. Use HTTPS only
8. Implement rate limiting on auth endpoints

---

## Code Examples

### Example 1: Create a Protected Page
```typescript
// pages/seller/settings/page.tsx
"use client"

import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'
import ProtectedRoute from '@/components/custom/ProtectedRoute'
import { useRouter } from 'next/navigation'

export default function SellerSettings() {
  const { user, logout } = useWeb3Auth()
  const router = useRouter()
  
  const handleSave = async () => {
    // Save settings...
    console.log('Settings saved for', user?.email)
  }
  
  return (
    <ProtectedRoute requiredRole="seller">
      <div>
        <h1>Settings for {user?.name}</h1>
        <button onClick={handleSave}>Save Settings</button>
        <button onClick={async () => {
          await logout()
          router.push('/login')
        }}>Logout</button>
      </div>
    </ProtectedRoute>
  )
}
```

### Example 2: Custom Auth Hook
```typescript
// hooks/useRequireAuth.ts
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useRequireAuth = (requiredRole?: string) => {
  const { user, isWeb3AuthInitialized } = useWeb3Auth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isWeb3AuthInitialized) return
    
    if (!user) {
      router.push('/login')
    } else if (requiredRole && user.role !== requiredRole) {
      router.push('/login')
    }
  }, [user, isWeb3AuthInitialized, requiredRole, router])
  
  return { user, isLoading: !isWeb3AuthInitialized }
}
```

### Example 3: Role-Based Menu
```typescript
// components/Navigation.tsx
import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider'
import Link from 'next/link'

export default function Navigation() {
  const { user } = useWeb3Auth()
  
  return (
    <nav>
      {user?.role === 'seller' && (
        <>
          <Link href="/seller/dashboard">Dashboard</Link>
          <Link href="/seller/recipes">My Recipes</Link>
        </>
      )}
      
      {user?.role === 'buyer' && (
        <>
          <Link href="/buyer/dashboard">Dashboard</Link>
          <Link href="/recipes">Browse Recipes</Link>
        </>
      )}
      
      {user?.role === 'admin' && (
        <>
          <Link href="/admin/dashboard">Admin Panel</Link>
          <Link href="/admin/users">Users</Link>
        </>
      )}
    </nav>
  )
}
```

---

## Related Files

- **Web3AuthProvider**: `src/app/lib/web3/Web3AuthProvider.tsx`
- **Login Page**: `src/app/(auth)/login/page.tsx`
- **Signup Page**: `src/app/(auth)/signup/page.tsx`
- **Role Selection**: `src/app/(auth)/role-select/page.tsx`
- **Protected Route**: `components/custom/ProtectedRoute.tsx`
- **Types**: `src/types/index.d.ts`

---

**Last Updated**: January 11, 2026
**Version**: 2.0

