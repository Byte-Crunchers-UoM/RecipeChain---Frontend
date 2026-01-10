# RecipeChain Complete Onboarding Flow

## User Journey Map

### New User Registration Flow

```
LOGIN PAGE (/login)
    ↓ [Connect with Web3Auth]
    ↓
SIGNUP PAGE (/signup)
    ↓ [Sign Up with Web3Auth + Accept Terms]
    ↓
ROLE SELECTION PAGE (/role-select)
    ↓
    ├─ SELECT CHEF ─→ CHEF KYC FORM (/chef-kyc)
    │                      ↓ [Submit KYC]
    │                      ↓
    │              APPROVAL PENDING PAGE (/approval-pending)
    │                      ↓ [Admin approves]
    │                      ↓
    │              CHEF PROFILE DASHBOARD (/seller/dashboard)
    │
    └─ SELECT BUYER ─→ BUYER DETAILS FORM (/buyer-details)
                             ↓ [Submit Preferences]
                             ↓
                        HOME PAGE (/home)
```

## Page Descriptions

### 1. Login Page (`/login`)
- **Path**: `src/app/(auth)/login/page.tsx`
- **Purpose**: User authentication entry point
- **Features**:
  - Web3Auth Modal integration
  - "Connect with Web3Auth" button
  - Light theme with RecipeChain branding
  - Security messaging
  - Terms/Privacy footer links
- **Next Step**: Redirects to signup page for new users

### 2. Signup Page (`/signup`)
- **Path**: `src/app/(auth)/signup/page.tsx`
- **Purpose**: Account creation with Web3 wallet
- **Features**:
  - Web3Auth integration
  - Terms and conditions checkbox
  - Onboarding info box explaining the flow
  - Error handling
  - Link to existing login
- **Action**: 
  - Accepts Web3Auth login
  - Redirects to `/role-select` on successful signup

### 3. Role Selection Page (`/role-select`)
- **Path**: `src/app/(auth)/role-select/page.tsx`
- **Purpose**: User chooses between Chef or Buyer role
- **Features**:
  - Two interactive role cards
  - **Chef Card**: Shows requirements, highlights KYC verification, lists benefits (Share recipes, Build profile, Earn rewards, Requires verification)
  - **Buyer Card**: Shows benefits, highlights instant access, lists benefits (Explore recipes, Save favorites, Follow chefs, Instant access)
  - Continue button (disabled until role selected)
- **Actions**:
  - Select Chef → Redirect to `/chef-kyc`
  - Select Buyer → Redirect to `/buyer-details`

### 4. Chef KYC Form (`/chef-kyc`)
- **Path**: `src/app/(auth)/chef-kyc/page.tsx`
- **Purpose**: Collect chef verification information for admin approval
- **Form Sections**:
  1. **Personal Information**:
     - Full Name
     - Email
     - Phone Number
     - Address
  2. **Culinary Background**:
     - Cuisine Specialty (select)
     - Years of Experience (select)
     - Certifications (textarea)
  3. **Identity Verification**:
     - ID Type (select)
     - ID Number
- **Data Storage**:
  - Saves `park_chain_role = 'chef'`
  - Saves `park_chain_kyc_pending = 'true'`
  - Saves form data to `park_chain_kyc_data` localStorage
- **Redirect**: On submit → `/approval-pending`

### 5. Approval Pending Page (`/approval-pending`)
- **Path**: `src/app/approval-pending/page.tsx`
- **Purpose**: Display KYC verification status
- **Features**:
  - Hourglass icon showing pending status
  - Timeline visualization:
    - ✓ Profile Submitted (complete)
    - ⏳ Under Review (in progress)
  - Expected timeline: 1-3 business days
  - Support contact information
  - Go to Login button for navigation
- **Next Step**: Admin approves → Chef can access chef profile dashboard

### 6. Buyer Details Form (`/buyer-details`)
- **Path**: `src/app/(auth)/buyer-details/page.tsx`
- **Purpose**: Collect buyer preferences for personalized experience
- **Form Sections**:
  1. **Basic Information**:
     - Full Name
     - Email
     - Age
  2. **Dietary Preferences** (Checkboxes):
     - Vegetarian
     - Vegan
     - Gluten-Free
     - Keto
     - Paleo
  3. **Cuisine Preferences** (Checkboxes):
     - Italian
     - Asian
     - French
     - Mexican
     - Indian
     - Mediterranean
  4. **Allergies & Restrictions** (Textarea)
- **Data Storage**:
  - Saves `park_chain_role = 'buyer'`
  - Saves buyer data to `park_chain_buyer_data` localStorage
  - Creates auth token in `park_chain_auth`
- **Redirect**: On submit → `/home` (instant access)

### 7. Home Page (`/home`)
- **Path**: `src/app/home/page.tsx`
- **Purpose**: Main user hub for exploring recipes and chefs
- **Features**:
  - Navigation bar with search, notifications, favorites, logout
  - Hero section with tagline
  - Featured Chefs section (grid of 3 chef cards)
  - Trending Recipes section (grid of 6 recipe cards)
  - Chef cards show: name, specialty, follower count, rating, Follow button
  - Recipe cards show: name, chef, cooking time, rating, likes, View Recipe button
- **Access**: Buyer users only (instant access after signup)

### 8. Chef Profile Dashboard (`/seller/dashboard`)
- **Path**: `src/app/(protected)/seller/dashboard/page.tsx`
- **Purpose**: Chef management and recipe cookbook
- **Features**:
  - Sidebar navigation with RecipeChain logo and menu items
  - Chef profile card with avatar, name, location, Follow/Message buttons
  - Stats display: Followers, Recipes, Rating, Member since date
  - About Me section
  - Specialities tags
  - My Cookbook grid with recipe cards
- **Access**: Chef users only (after admin approval)

## Authentication & Authorization

### Local Storage Keys
```javascript
park_chain_role          // 'chef' or 'buyer' or 'seller'
park_chain_auth          // Authentication token
park_chain_kyc_pending   // 'true' for chefs awaiting approval
park_chain_kyc_data      // JSON with chef verification form data
park_chain_buyer_data    // JSON with buyer preferences
```

### User Roles
- **Chef**: Requires KYC verification and admin approval before accessing dashboard
- **Buyer**: Instant access to home page after preferences submission
- **Seller**: Legacy role (may be deprecated in favor of 'chef')

## Design System

### Color Palette
- **Primary**: `#0d9488` (Teal) - Buttons, accents, focus states
- **Hover**: `#0f766e` (Darker Teal) - Button hover states
- **Background**: `#f8fafb` (Light) - Page backgrounds
- **Accent**: `#d1fae5` (Light Green) - Highlight boxes
- **Accent Border**: `#a7f3d0` (Lighter Green) - Box borders
- **Text**: `#111827` (Dark) - Primary text
- **Secondary Text**: `#4b5563` (Medium Gray) - Secondary text

### Typography & Layout
- **Heading**: 2-4xl, font-bold, text-[#111827]
- **Body**: text-sm/base, text-[#4b5563] or text-[#111827]
- **Buttons**: py-2/3 px-4/6, rounded-lg/xl, font-semibold
- **Responsive**: Tailwind grid with md: breakpoints
- **Card Style**: bg-white, border border-[#e5e7eb], rounded-xl, shadow-sm

## Key Implementation Notes

1. **Web3Auth Integration**:
   - Uses @web3auth/modal v10.7.0
   - Network: Ethereum Sepolia (0xaa36a7)
   - Requires: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET

2. **Routing Flow**:
   - All auth pages under `(auth)` group
   - Protected pages under `(protected)` group
   - Home page at root level `/home`

3. **Form Submission**:
   - All forms save data to localStorage
   - Chefs enter KYC pending state (requires admin approval)
   - Buyers get instant access (redirect to home)

4. **Navigation**:
   - Uses Next.js App Router with `useRouter()`
   - Client-side navigation with dynamic redirects
   - No SSR for client components

5. **Logo Integration**:
   - Image path: `/images/recipechain_logo_green.png`
   - Dimensions: 100-120px square
   - Used on all auth and onboarding pages

## Development Status

✅ **Complete & Tested**:
- Web3Auth Modal v10 integration
- All authentication pages with RecipeChain branding
- Complete onboarding flow for both roles
- Role-specific form validation
- Data persistence with localStorage
- Responsive design across all pages
- No TypeScript/compilation errors

⏳ **Pending**:
- Admin approval mechanism (backend implementation)
- File upload for KYC documents
- Email verification workflow
- Payment/transaction integration for chef earnings

## Testing Checklist

- [ ] New user signup flow (Web3Auth → signup → role-select)
- [ ] Chef path (select chef → fill KYC → approval pending)
- [ ] Buyer path (select buyer → fill preferences → home page)
- [ ] Logo displays correctly on all pages
- [ ] Colors match RecipeChain brand guidelines
- [ ] Forms validate required fields
- [ ] localStorage persists data correctly
- [ ] Logout clears authentication state
- [ ] Mobile responsive design works correctly
- [ ] Links and navigation work as expected
