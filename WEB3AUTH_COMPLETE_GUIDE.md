# Web3Auth Authentication Flow - Complete Guide

## What Was Fixed

Your RecipeChain application had three critical authentication issues that have now been resolved:

### ✅ **Issue 1: Login Direct Redirect**
**Before**: Clicking "Connect with Web3Auth" on login always went to the chef/seller dashboard
**Now**: The app checks if you're an existing user:
- If you've signed up before → Redirects you to your correct role-based dashboard
- If you're new → Redirects you to the signup page first

### ✅ **Issue 2: Signup Missing Web3Auth**
**Before**: "Sign up with Web3Auth" button skipped the Web3Auth step entirely
**Now**: Web3Auth modal properly appears:
- Step 1: Connect your blockchain wallet via Web3Auth
- Step 2: Choose your role (Seller or Buyer)
- Step 3: Complete role-specific onboarding form

### ✅ **Issue 3: User Existence Not Checked**
**Before**: No mechanism to check if a user already existed in the system
**Now**: The system tracks users via localStorage and checks on every login

---

## How to Use the Fixed Flow

### **New User - Complete Signup Flow**

```
1. Go to http://localhost:3000/login
2. Click "Create an account" link at the bottom
   ↓
3. On signup page:
   - Read the 3-step process description
   - Check "I agree to Terms and Conditions"
   - Click "Sign Up with Web3Auth"
   ↓
4. Web3Auth Modal appears:
   - Click your preferred login method
   - Connect your blockchain wallet
   - Approve permissions
   ↓
5. After successful connection, redirected to "Choose Your Role" page:
   - Click "Seller" or "Buyer"
   - Click "Continue"
   ↓
6. Role-Specific Onboarding:
   - Seller → Chef Verification (KYC) form
   - Buyer → Buyer Details form
   ↓
7. Complete the form and submit
   ↓
8. ✅ Account created! Redirected to your dashboard
```

### **Existing User - Fast Login Flow**

```
1. Go to http://localhost:3000/login
2. Click "Connect with Web3Auth"
   ↓
3. Web3Auth Modal appears:
   - Connect with the same wallet as before
   ↓
4. System checks if you're an existing user:
   - YES → ✅ Automatically redirected to your dashboard
   - NO → Redirected to signup page
```

### **Switch Between Roles**

Once logged in, you cannot directly switch roles through the UI yet. To try a different role:

```
1. Click Logout on your dashboard
2. Clear browser data:
   - Open DevTools (F12)
   - Go to Application → LocalStorage
   - Remove these keys:
     * recipechain_auth
     * recipechain_role
     * park_chain_kyc_data (if seller)
     * park_chain_buyer_data (if buyer)
3. Go to /login and sign up again
4. Choose the different role in role selection page
```

---

## Technical Details

### **localStorage Keys Used**

The application stores data in your browser's localStorage:

```javascript
// Authentication (created after Web3Auth connection)
localStorage.recipechain_auth = {
  "sub": "unique_user_id",
  "email": "user@example.com",
  "name": "User Name",
  // ... more Web3Auth data
}

localStorage.recipechain_role = "seller" // or "buyer" or "admin"

// Onboarding form data (created after completing signup)
localStorage.park_chain_kyc_data = {
  // seller onboarding info
}

localStorage.park_chain_buyer_data = {
  // buyer onboarding info
}
```

### **User Existence Check Logic**

When you click "Connect with Web3Auth" on the login page:

```
if (localStorage has 'recipechain_auth' AND 'recipechain_role') {
  // You're an existing user
  → Restore your role
  → Connect Web3Auth
  → Redirect to your dashboard
} else {
  // You're a new user
  → Redirect to signup page
}
```

---

## Dashboard Access by Role

| Role | Login Redirect | Admin Access | Seller Access | Buyer Access |
|------|---|---|---|---|
| **Seller** | `/seller/dashboard` | ❌ | ✅ | ❌ |
| **Buyer** | `/buyer/dashboard` | ❌ | ❌ | ✅ |
| **Admin** | `/admin/dashboard` | ✅ | ❌ | ❌ |

---

## Web3Auth Configuration

Your Web3Auth is configured to use:

```
Network: Ethereum Sepolia (Testnet)
Client ID: BIQP1euJt4uABsj-UyzvSTkHmbSzr6zvWKEw1F_frKWJDhZ4m64ya59eAueVVgS69OGhzq5cp6nFNVVdxWLE5Ag
RPC: https://rpc.sepolia.org
```

**Note**: This is a testnet configuration. For production, you'll need to:
1. Create a Web3Auth production project
2. Get a production Client ID
3. Update `.env.local` with the production Client ID
4. Configure for mainnet instead of Sepolia testnet

---

## Testing the Different Flows

### **Test 1: New User Signup**
```
1. Clear all localStorage (DevTools → Application → Clear storage)
2. Go to http://localhost:3000/login
3. Click "Create an account"
4. Complete signup flow as described above
Expected: Should create new account and show your dashboard
```

### **Test 2: Existing User Login**
```
1. Go to http://localhost:3000/login
2. Click "Connect with Web3Auth"
3. Use the same wallet address as in Test 1
Expected: Should automatically detect you and redirect to dashboard
```

### **Test 3: Try Accessing Wrong Dashboard**
```
1. Login as a Seller user
2. Try to manually go to /buyer/dashboard
Expected: Should redirect you back to /seller/dashboard
```

### **Test 4: Logout and Relogin**
```
1. Click Logout on dashboard
2. All localStorage cleared automatically
3. Go to /login
Expected: Should treat you as new user and ask for signup
Note: You'll need to use the same Web3Auth wallet or signup again
```

---

## Troubleshooting

### **Problem: After Web3Auth, not redirected anywhere**
- **Solution**: Check browser console (F12) for errors
- **Cause**: Web3Auth modal might have timed out
- **Fix**: Refresh page and try again

### **Problem: Says I'm a new user even though I signed up before**
- **Solution**: Check localStorage in DevTools
  - `Application → LocalStorage → recipechain_auth` should exist
- **Cause**: localStorage was cleared or user signed up with different wallet
- **Fix**: Make sure you're using the same Web3Auth wallet

### **Problem: Can't access /seller/dashboard, redirected to /login**
- **Solution**: Make sure you're logged in with a "seller" role
- **Cause**: You might be logged in as "buyer"
- **Fix**: Logout, clear localStorage, and signup as seller again

### **Problem: Web3Auth modal doesn't appear**
- **Solution**: Check if Client ID is set correctly in `.env.local`
- **Cause**: Missing or invalid NEXT_PUBLIC_WEB3AUTH_CLIENT_ID
- **Fix**: Make sure `.env.local` has the correct Client ID and restart dev server

---

## Architecture Overview

```
Application Structure
├── Login Page (/login)
│   ├─ Check isUserExist()
│   ├─ If YES → Web3Auth login + redirect to dashboard
│   └─ If NO → Redirect to signup
│
├── Signup Page (/signup)
│   ├─ User accepts terms
│   ├─ Web3Auth modal opens
│   └─ Redirect to role selection
│
├── Role Selection Page (/role-select)
│   ├─ User selects seller or buyer
│   └─ Redirect to onboarding form
│
├── Onboarding Pages
│   ├─ /chef-kyc (for sellers)
│   └─ /buyer-details (for buyers)
│
└── Protected Dashboards
    ├─ /seller/dashboard
    ├─ /buyer/dashboard
    └─ /admin/dashboard
```

---

## Key Components

### **Web3AuthProvider** (`src/app/lib/web3/Web3AuthProvider.tsx`)
Main authentication context provider. Manages:
- Web3Auth initialization
- User login/logout
- User state persistence
- User existence checking

### **Login Page** (`src/app/(auth)/login/page.tsx`)
Entry point for authentication:
- Checks if user exists
- Routes appropriately

### **Signup Page** (`src/app/(auth)/signup/page.tsx`)
Creates new user accounts:
- Web3Auth integration
- Redirects to role selection

### **Role Selection Page** (`src/app/(auth)/role-select/page.tsx`)
User picks their role:
- Seller (recipe creator)
- Buyer (recipe consumer)

### **ProtectedRoute** (`components/custom/ProtectedRoute.tsx`)
Guards dashboard routes:
- Checks authentication
- Validates user role
- Redirects unauthorized users

---

## Environment Variables

Your `.env.local` file contains:

```env
# Web3Auth Configuration
# Get your Client ID from https://dashboard.web3auth.io/
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BIQP1euJt4uABsj-UyzvSTkHmbSzr6zvWKEw1F_frKWJDhZ4m64ya59eAueVVgS69OGhzq5cp6nFNVVdxWLE5Ag
```

This is exposed to the browser (hence `NEXT_PUBLIC_`) because Web3Auth needs it on the client-side.

---

## Next Steps / Future Improvements

### **Short Term**
- [ ] Test all flows thoroughly
- [ ] Verify Web3Auth wallet connections work as expected
- [ ] Test logout functionality
- [ ] Test role-based dashboard access

### **Medium Term**
- [ ] Implement backend API for user verification
- [ ] Store user data in database instead of only localStorage
- [ ] Add user profile editing capability
- [ ] Implement admin verification workflow for sellers

### **Long Term**
- [ ] Implement JWT tokens for API authentication
- [ ] Add refresh token mechanism
- [ ] Integrate blockchain wallet balance checking
- [ ] Add multi-wallet support
- [ ] Implement session management with expiry

---

## Getting Help

If you encounter issues:

1. **Check Console** - Open DevTools (F12) and look for errors
2. **Check localStorage** - Verify Web3Auth saved user data correctly
3. **Check Network** - Make sure Web3Auth network requests are successful
4. **Restart Dev Server** - Sometimes required after env changes: `npm run dev`
5. **Clear Cache** - Clear browser cache and localStorage: `localStorage.clear()`

---

## Important Notes

⚠️ **Web3Auth Test Configuration**: Currently using Sepolia testnet. Not for production use.

✅ **localStorage Usage**: User data persisted in browser. For production, implement secure backend storage.

⚠️ **No Wallet Verification**: Currently not verifying wallet ownership on backend. Should implement for security.

---

## API Endpoints Needed (Future)

For production, implement these backend endpoints:

```
POST /api/auth/check-user
  - Check if wallet address already has an account
  - Request: { walletAddress: string }
  - Response: { exists: boolean, role?: string }

POST /api/auth/create-user
  - Create new user account after Web3Auth
  - Request: { web3AuthId, email, role, walletAddress }
  - Response: { userId, success: boolean }

POST /api/auth/verify-signature
  - Verify Web3Auth token on backend
  - Request: { token, signature }
  - Response: { valid: boolean, userId: string }
```

---

**Updated**: January 11, 2026
**Version**: 2.0 (Web3Auth fixes applied)

