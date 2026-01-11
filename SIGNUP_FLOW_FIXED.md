# RecipeChain Signup Flow - Fixed Implementation

## Overview
The signup flow has been completely fixed to follow this sequence:
1. **Web3Auth Connection** - User connects their Web3 wallet
2. **Role Selection** - User chooses Seller (Chef) or Buyer role
3. **Role-Specific Onboarding** - User completes relevant form based on selected role

## Fixed Signup Flow

### Step 1: Signup Page (`/signup`)
**File**: `src/app/(auth)/signup/page.tsx`

When user clicks "Sign up with Web3Auth":
- Terms & Conditions checkbox must be accepted
- `login()` function is called (triggers Web3Auth modal)
- User connects their Web3 wallet
- After successful connection, `isWeb3Connected` is set to true
- `useEffect` automatically redirects to `/role-select`

```tsx
// Signup flow
const handleSignup = async () => {
  if (!acceptTerms) {
    setError('Please accept the terms and conditions');
    return;
  }

  try {
    setError('');
    setConnectLoading(true);

    // Step 1: Connect with Web3Auth (required before role selection)
    await login();
    
    // Step 2: Mark as connected - this triggers the useEffect redirect
    setIsWeb3Connected(true);
  } catch (err) {
    console.error('Web3Auth signup failed:', err);
    setError('Failed to connect with Web3Auth. Please try again.');
    setConnectLoading(false);
  }
};

// Auto-redirect after Web3Auth connection
useEffect(() => {
  if (user && user.id && isWeb3Connected) {
    router.push('/role-select');  // ✅ Go to role selection
  }
}, [user, isWeb3Connected, router]);
```

### Step 2: Role Selection Page (`/role-select`)
**File**: `src/app/(auth)/role-select/page.tsx`

User selects their role:
- **Seller (Chef)** - For uploaders and recipe creators
- **Buyer** - For recipe consumers/discoverers

When user clicks "Continue":
- `setContextRole(selectedRole)` updates the user's role in Web3AuthContext
- Role is saved to localStorage as `recipechain_role`
- User is redirected to role-specific onboarding page

```tsx
const handleContinue = async () => {
  if (!selectedRole) return;
  
  try {
    setIsSubmitting(true);
    
    // Set the selected role in context
    setContextRole(selectedRole as 'seller' | 'buyer');
    
    // Save role to localStorage
    localStorage.setItem('recipechain_role', selectedRole);
    
    // Route to appropriate onboarding page
    if (selectedRole === 'seller') {
      router.push('/chef-kyc');      // ✅ Seller flow
    } else {
      router.push('/buyer-details');  // ✅ Buyer flow
    }
  } catch (error) {
    console.error('Error selecting role:', error);
    setIsSubmitting(false);
  }
};
```

### Step 3A: Seller/Chef KYC Form (`/chef-kyc`)
**File**: `src/app/(auth)/chef-kyc/page.tsx`

For users who selected "Seller" role:
- Complete KYC (Know Your Customer) form
- Provide credentials and identity verification
- Submit for approval

Protection: Page checks if `user.role === 'seller'`, else redirects to role selection

### Step 3B: Buyer Details Form (`/buyer-details`)
**File**: `src/app/(auth)/buyer-details/page.tsx`

For users who selected "Buyer" role:
- Complete buyer profile information
- Set dietary preferences
- Set cuisine preferences

Protection: Page checks if `user.role === 'buyer'`, else redirects to role selection

## Web3AuthProvider Context Updates

**File**: `src/app/lib/web3/Web3AuthProvider.tsx`

### Key Changes:

#### 1. **Login Function** - No Default Role
```tsx
const login = async () => {
  // ... Web3Auth connection ...
  const newUser: Web3AuthUser = {
    id: userId,
    email: userInformation?.email,
    name: userInformation?.name,
    role: undefined,  // ✅ NOT setting default role
  };
  setUser(newUser);
  // ... saves to localStorage WITHOUT role ...
};
```

#### 2. **Custom setSelectedRole Function**
```tsx
const setSelectedRole = (role: UserRole) => {
  setSelectedRoleState(role);
  
  // Update user object with the selected role
  if (user) {
    const updatedUser = { ...user, role };
    setUser(updatedUser);
  }
  
  // Save role to localStorage
  localStorage.setItem('recipechain_role', role);
};
```

This ensures:
- User object is updated with role
- Role is persisted to localStorage
- Context is updated for all components using `useWeb3Auth()`

## Data Flow

```
[Signup Page] 
    ↓ (click "Sign up with Web3Auth")
[Web3Auth Modal]
    ↓ (wallet connection successful)
[Login function executes]
    ├─ Saves user info to localStorage (without role)
    ├─ Sets user in context
    └─ Triggers redirect via useEffect
    ↓
[Role Select Page]
    ├─ Validates user has Web3Auth (user.id exists)
    └─ Cannot proceed without Web3Auth connection
    ↓ (click "Continue" with role selected)
[setContextRole function executes]
    ├─ Updates user.role in context
    ├─ Saves role to localStorage
    └─ Redirects based on role
    ↓
[Role-Specific Form]
    ├─ Chef KYC (for sellers) → /chef-kyc
    └─ Buyer Details (for buyers) → /buyer-details
    ↓ (form submission)
[Dashboard/Home]
```

## localStorage Keys Used

- `recipechain_auth` - User's Web3Auth information (set after step 1)
- `recipechain_role` - User's selected role (set after step 2)

## Error Handling

### If user tries to access:

1. **Role Select without Web3Auth**
   - Redirected back to `/signup`
   - Message: "Please sign up with Web3Auth first"

2. **Buyer Details without selecting Buyer role**
   - Redirected to `/role-select`
   
3. **Chef KYC without selecting Seller role**
   - Redirected to `/role-select`

## Testing the Flow

1. **Start Fresh**: Open `/signup` in incognito window (clears localStorage)
2. **Step 1**: Click "Sign up with Web3Auth"
   - Expected: Web3Auth modal opens
3. **Step 2**: Connect wallet
   - Expected: Redirected to `/role-select`
4. **Step 3**: Select a role (Seller or Buyer)
   - Expected: Redirected to role-specific form (`/chef-kyc` or `/buyer-details`)
5. **Step 4**: Complete form
   - Expected: Redirected to dashboard/home

## Summary of Fixes

✅ **Removed hardcoded buyer redirect** - No longer goes directly to `/buyer-details`  
✅ **Proper Web3Auth flow** - Web3Auth modal displays correctly on signup  
✅ **Role selection enforced** - Users MUST select a role before proceeding  
✅ **Form-specific access** - Each form only accessible with correct role  
✅ **Persistent state** - Role and auth data saved to localStorage  
✅ **Context updates** - Web3AuthProvider properly manages role state  

All compilation errors have been fixed and the complete signup flow is now functional!
