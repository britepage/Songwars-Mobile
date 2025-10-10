# Auth Watcher Implementation - Complete Guide

## Overview
This document explains **exactly** how the SongWars web app implements auth state watching and automatic redirects. Use this to understand timing issues and replicate the behavior in the mobile app.

---

## 1. Complete User Watcher Code

### Location
**File**: `store/authStore.ts` (Lines 29-61)

### Exact Code
```typescript
// Watcher to react to changes in the @nuxtjs/supabase user composable
// This synchronizes your store's `authenticatedUser` and token refs,
// and handles routing based on authentication state.
watch(user, async (newUser, oldUser) => {
    // --- DEBUG LOG ---
    const currentPath = router.currentRoute.value.path;
    console.log('[Auth Watcher] Path:', currentPath, 'user:', user.value, 'authenticatedUser:', authenticatedUser.value);
    
    authenticatedUser.value = !!newUser;
    accessToken.value = newUser?.id || null;

    // Profile fetching/clearing is handled by components and signOut()

    // Note: Removed window.location.reload() - testing if modern state management 
    // can handle logout/account deletion cleanup without full page reload

    const { AUTH_STORE_REDIRECT_ROUTES } = await import('~/constants/publicRoutes');
    const isPublic = AUTH_STORE_REDIRECT_ROUTES.some(route => currentPath === route || currentPath.startsWith(route + '/') || currentPath.startsWith(route + '?'));

    // Special case: Never redirect away from /reset-password, even if not authenticated
    if (currentPath.startsWith('/reset-password')) {
        return;
    }

    if (newUser) { // User is authenticated
        // Only redirect to dashboard if on a public route, but not from user profile pages
        if (isPublic && currentPath !== '/dashboard/' && !currentPath.startsWith('/user/')) {
            router.push('/dashboard/');
        }
        // Otherwise, allow navigation to /account and other authenticated routes
    } else { // User is not authenticated
        if (!isPublic) {
            router.push('/sign-in/');
        }
    }
}, { immediate: true });
```

### Line-by-Line Explanation

**Line 29**: `watch(user, async (newUser, oldUser) => {`
- Watches the `user` ref from `useSupabaseUser()`
- Async callback to allow dynamic imports
- Receives both new and old user values

**Line 31**: `const currentPath = router.currentRoute.value.path;`
- Gets current route path BEFORE any redirects
- Used to determine if redirect is needed

**Line 32**: `console.log('[Auth Watcher] Path:', ...)`
- Debug log to track watcher firing
- Shows path, user state, and authenticatedUser flag

**Line 34**: `authenticatedUser.value = !!newUser;`
- Updates store's authenticated flag
- `!!newUser` converts to boolean (true if user exists)

**Line 35**: `accessToken.value = newUser?.id || null;`
- Stores user ID as access token reference
- Null if no user

**Lines 42-43**: Dynamic import and public route check
- Imports public routes at runtime (avoids circular dependencies)
- Checks if current path matches any public route

**Lines 46-48**: Reset password special case
- Never redirects away from `/reset-password`
- Allows password reset flow to complete

**Lines 50-58**: Redirect logic
- If authenticated (`newUser` exists):
  - Redirects to `/dashboard/` if on public route
  - Exception: Don't redirect from `/user/` profiles
- If not authenticated (`newUser` is null):
  - Redirects to `/sign-in/` if on protected route

**Line 61**: `{ immediate: true }`
- **CRITICAL**: Watcher runs immediately on store initialization
- Ensures auth check happens on page load
- This is why you might see `user: null` initially

---

## 2. User Ref Source

### Where `user` Comes From

**File**: `store/authStore.ts` (Line 10)
```typescript
const { client: supabase, user } = useSupabaseService()
```

**File**: `composables/useSupabaseService.ts` (Lines 11-12)
```typescript
const client = useSupabaseClient()
const user = useSupabaseUser()
```

### What is `useSupabaseUser()`?

This is provided by `@nuxtjs/supabase` module. It returns a **reactive ref** that:

1. **Automatically updates** when Supabase auth state changes
2. **Persists across page reloads** (uses localStorage/cookies)
3. **Is null** when no user is signed in
4. **Updates asynchronously** after successful sign-in

### How It Gets Updated

The `@nuxtjs/supabase` module:
1. Listens to Supabase `onAuthStateChange` events
2. Updates the `user` ref when auth state changes
3. Syncs with server-side session (SSR)
4. Handles token refresh automatically

**You don't manually update the `user` ref** - the module does it for you.

---

## 3. Timing and Sequence

### Initial Page Load

```
1. Nuxt app starts
2. authStore initialized
3. useSupabaseUser() returns current user (may be null initially)
4. Watcher runs IMMEDIATELY (immediate: true)
5. If user is null and route is protected → redirect to /sign-in
6. @nuxtjs/supabase checks localStorage/cookies for session
7. If valid session found → user ref updated
8. Watcher fires AGAIN with populated user
9. Redirect to /dashboard if on public route
```

**Key Point**: The watcher fires **twice** on initial load:
- Once immediately (user may be null)
- Again when session is restored (user populated)

### Sign-In Flow

```
1. User submits sign-in form
2. SignInForm.vue calls authStore.signInWithEmail()
3. authStore calls supabase.auth.signInWithPassword()
4. Supabase API request (async)
5. ⏱️ Brief delay while waiting for response
6. Supabase returns session data
7. @nuxtjs/supabase detects session
8. Module updates user ref
9. Watcher fires with newUser populated
10. Redirect to /dashboard
```

**Key Point**: There's a **delay** between calling `signInWithPassword()` and the `user` ref updating. This is why you might see:
```
[Auth Watcher] user: null  // Old value
[Auth Watcher] user: { id: '...', email: '...' }  // New value
```

### Sign-Out Flow

```
1. authStore.signOut() called
2. supabase.auth.signOut() called
3. @nuxtjs/supabase detects sign-out
4. user ref set to null
5. Watcher fires with newUser = null
6. Redirect to /sign-in if on protected route
```

---

## 4. Complete Sign-In Flow Diagram

### Detailed Sequence with Timing

```
Time: 0ms
├─ User clicks "Sign In" button
│
Time: 0-5ms
├─ handleSignIn() function called
├─ signingIn.value = true (loading state)
├─ authStore.signInError = null (clear previous errors)
│
Time: 5-10ms
├─ authStore.signInWithEmail(email, password) called
│  └─ signInError.value = null (clear in store)
│  └─ supabase.auth.signInWithPassword({ email, password }) called
│
Time: 10ms - 500ms (NETWORK REQUEST)
├─ ⏳ Waiting for Supabase API response
├─ 💡 USER REF IS STILL NULL DURING THIS TIME
│
Time: 500ms (example - actual varies)
├─ ✅ Supabase API returns success
├─ Session data received
│
Time: 505ms
├─ @nuxtjs/supabase module detects new session
├─ Module updates user ref internally
│  └─ user.value = { id: '...', email: '...', ... }
│
Time: 510ms
├─ 🔥 WATCHER FIRES
├─ watch(user, ...) callback executes
├─ newUser = { id: '...', email: '...' }
├─ authenticatedUser.value = true
├─ Checks current path
├─ Determines redirect needed
│
Time: 515ms
├─ router.push('/dashboard/') called
│
Time: 520ms
├─ Navigation complete
├─ User sees dashboard
│
Time: 525ms
├─ handleSignIn() finally block executes
├─ signingIn.value = false (stop loading)
```

### Critical Timing Points

1. **Gap between API call and user ref update**: 500ms (varies by network)
2. **Watcher fires AFTER user ref updates**: Not during the API call
3. **Component loading state**: Independent of watcher timing

---

## 5. Auth Redirect Logic

### Public Routes (No Redirect)

**From**: `constants/publicRoutes.ts`

```typescript
export const AUTH_STORE_REDIRECT_ROUTES = [
  '/sign-in',
  '/registration', 
  '/reset-password',
  '/reset-password-email',
  '/update-password',
  '/user',
  '/preview',
  '/'
];
```

**Check Logic**:
```typescript
const isPublic = AUTH_STORE_REDIRECT_ROUTES.some(route => 
  currentPath === route || 
  currentPath.startsWith(route + '/') || 
  currentPath.startsWith(route + '?')
);
```

This matches:
- Exact path: `/sign-in`
- With trailing slash: `/sign-in/`
- With subpaths: `/user/username`
- With query params: `/sign-in?redirect=/dashboard`

### Special Cases

**1. Reset Password Page**
```typescript
if (currentPath.startsWith('/reset-password')) {
    return; // Never redirect away
}
```
- Allows password reset flow to complete
- Even if user is not authenticated

**2. User Profile Pages**
```typescript
if (isPublic && currentPath !== '/dashboard/' && !currentPath.startsWith('/user/')) {
    router.push('/dashboard/');
}
```
- Don't redirect away from `/user/username` profiles
- These are public but don't trigger dashboard redirect

### Redirect Decision Tree

```
Is user authenticated?
├─ YES
│  ├─ On public route? (/sign-in, /registration, etc.)
│  │  ├─ YES
│  │  │  ├─ Is /user/ profile page?
│  │  │  │  ├─ YES → Stay on page
│  │  │  │  └─ NO → Redirect to /dashboard
│  │  └─ NO → Stay on current page (already on protected route)
│  └─ No redirect needed
│
└─ NO (not authenticated)
   ├─ Is /reset-password page?
   │  └─ YES → Stay (allow password reset)
   │
   ├─ On public route?
   │  ├─ YES → Stay (allowed to view)
   │  └─ NO → Redirect to /sign-in
```

---

## 6. Other Auth Mechanisms

### Middleware Files

#### `middleware/auth.ts`

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  // If the route is public (startsWith), skip auth check
  if (AUTH_MIDDLEWARE_PUBLIC_ROUTES.some(route => to.path.startsWith(route))) {
    return;
  }
  
  // Only enforce auth on client
  if (process.server) {
    return;
  }
  
  const authStore = useAuthStore();
  if (!authStore.authenticatedUser) {
    return navigateTo('/sign-in');
  }
});
```

**When it runs**:
- On every route navigation
- BEFORE the route component loads
- Server-side and client-side

**What it does**:
- Checks if route requires auth
- If auth required and user not authenticated → redirect to `/sign-in`

**Different from watcher**:
- Middleware runs on navigation
- Watcher runs on auth state change
- Both work together for complete protection

#### `middleware/trial.ts`

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // If user is authenticated, redirect to dashboard
    if (user) {
      return navigateTo('/dashboard');
    }
  } catch (error) {
    console.log('Server-side auth check failed, allowing client-side handling');
  }
});
```

**When it runs**:
- Applied to specific pages (likely `/preview`)
- Server-side auth check

**What it does**:
- Redirects authenticated users away from trial pages
- Prevents signed-in users from seeing trial experience

### Nuxt Config

**File**: `nuxt.config.ts` (Lines 41-57)

```typescript
supabase: {
  url: process.env.NUXT_PUBLIC_SUPABASE_URL,
  key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
  redirect: true,
  redirectOptions: {
    login: '/sign-in',
    callback: '/api/auth/callback',
    exclude: SUPABASE_EXCLUDE_ROUTES,
  },
  clientOptions: {
    auth: {
      flowType: 'pkce',
    },
  },
},
```

**Key Settings**:
- `redirect: true` - Module handles automatic redirects
- `login: '/sign-in'` - Default login page
- `callback: '/api/auth/callback'` - OAuth callback endpoint
- `exclude: SUPABASE_EXCLUDE_ROUTES` - Don't auto-redirect from these pages
- `flowType: 'pkce'` - Use PKCE flow (secure for mobile/SPA)

**Excluded Routes** (from `constants/publicRoutes.ts`):
```typescript
export const SUPABASE_EXCLUDE_ROUTES = [
  '/registration',
  '/reset-password',
  '/reset-password-email',
  '/user',
  '/user/',
  '/user/*',
  '/preview',
  '/preview/',
  '/preview/*'
  // /sign-in intentionally omitted
];
```

**Note**: `/sign-in` is NOT excluded - authenticated users SHOULD be redirected away from it.

### Summary: Three Layers of Auth

1. **Nuxt Supabase Module** (nuxt.config.ts)
   - Automatic redirects
   - Session management
   - Lowest level

2. **Middleware** (middleware/auth.ts)
   - Route-level guards
   - Runs on navigation
   - Second level

3. **Auth Store Watcher** (store/authStore.ts)
   - React to auth state changes
   - Dynamic redirects
   - Highest level

---

## 7. Debugging the Mobile Issue

### Problem: Watcher Fires with `user: null` After Successful Sign-In

#### Root Cause

The watcher is firing **immediately** (due to `{ immediate: true }`) before the session is restored or the sign-in completes.

#### Why This Happens

**Web App Sequence**:
```
1. Page loads
2. authStore initialized
3. Watcher runs immediately → user: null (OK, will check again later)
4. @nuxtjs/supabase checks localStorage
5. Session found → user ref updated
6. Watcher fires again → user: { ... } (Correct)
```

**Mobile App Issue**:
```
1. App launches
2. authStore initialized
3. Watcher runs immediately → user: null
4. ❌ Redirects to /sign-in before Capacitor Storage is checked
5. @nuxtjs/supabase tries to check Capacitor Storage
6. ⏰ Storage read is async and slower
7. Session found → user ref updated
8. Watcher fires again → user: { ... }
9. ⚠️ But already redirected to /sign-in!
```

### Key Differences: Web vs Mobile

| Aspect | Web (localStorage) | Mobile (Capacitor Storage) |
|--------|-------------------|----------------------------|
| **Storage Type** | `localStorage` (sync) | `Capacitor.Storage` (async) |
| **Read Speed** | Instant (~1ms) | Slower (~50-200ms) |
| **Timing** | User ref updated before watcher | Watcher fires before storage read |
| **Initial Value** | May have user immediately | Always null initially |

### Solutions for Mobile

#### Option 1: Add Loading State

```typescript
const authInitialized = ref(false);

// Wait for @nuxtjs/supabase to initialize
onMounted(async () => {
  // Give module time to restore session from storage
  await new Promise(resolve => setTimeout(resolve, 100));
  authInitialized.value = true;
});

watch(user, async (newUser) => {
  // Don't redirect until auth is initialized
  if (!authInitialized.value) {
    return;
  }
  
  // Rest of watcher logic...
}, { immediate: false }); // Change to false!
```

#### Option 2: Use Supabase Events Instead

```typescript
// In authStore setup
onMounted(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, 'Session:', session);
    
    if (event === 'SIGNED_IN') {
      router.push('/dashboard');
    } else if (event === 'SIGNED_OUT') {
      router.push('/sign-in');
    }
  });
  
  // Cleanup on unmount
  onUnmounted(() => {
    authListener.subscription.unsubscribe();
  });
});
```

**Events to handle**:
- `SIGNED_IN` - User signed in
- `SIGNED_OUT` - User signed out
- `TOKEN_REFRESHED` - Session refreshed
- `USER_UPDATED` - User data changed
- `INITIAL_SESSION` - Session restored on load

#### Option 3: Check Session Before Redirect

```typescript
watch(user, async (newUser) => {
  const currentPath = router.currentRoute.value.path;
  
  // For mobile: Check if session is being restored
  if (!newUser) {
    // Don't redirect immediately - check if session exists
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Session exists, user ref will update soon
      console.log('Session exists, waiting for user ref to update');
      return; // Don't redirect
    }
  }
  
  // Rest of watcher logic...
}, { immediate: true });
```

#### Option 4: Delay Initial Redirect

```typescript
const hasCheckedInitialAuth = ref(false);

watch(user, async (newUser) => {
  if (!hasCheckedInitialAuth.value) {
    // First run - wait for potential session restore
    await new Promise(resolve => setTimeout(resolve, 200));
    hasCheckedInitialAuth.value = true;
    
    // Check again after delay
    if (!user.value) {
      // Still no user after delay, proceed with redirect
      if (!isPublic) {
        router.push('/sign-in');
      }
    }
    return;
  }
  
  // Subsequent runs - immediate response
  // ... rest of logic
}, { immediate: true });
```

### Recommended Approach for Mobile

**Combine Option 1 and Option 2**:

```typescript
// In mobile authStore
const authInitialized = ref(false);

// Watch for initial session
onMounted(async () => {
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log('Mobile: Session found on init');
    // Wait for user ref to populate
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  authInitialized.value = true;
});

// Use both watcher and events
watch(user, async (newUser) => {
  if (!authInitialized.value) return;
  
  // Standard watcher logic
  // ...
}, { immediate: false }); // Don't run immediately

// Also listen to auth events
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    router.push('/dashboard');
  } else if (event === 'SIGNED_OUT') {
    router.push('/sign-in');
  }
});
```

---

## 8. Code Comparison: Web vs Mobile

### Web App Approach (Works)

```typescript
// ✅ Works because localStorage is synchronous
const { client: supabase, user } = useSupabaseService();

watch(user, async (newUser) => {
  // user ref already updated from localStorage
  // by the time watcher runs
  
  if (newUser) {
    router.push('/dashboard');
  } else {
    router.push('/sign-in');
  }
}, { immediate: true });
```

### Mobile App Issue (Problematic)

```typescript
// ❌ Problematic because Capacitor Storage is async
const { client: supabase, user } = useSupabaseService();

watch(user, async (newUser) => {
  // user ref still null - storage not read yet
  // Redirects too early!
  
  if (newUser) {
    router.push('/dashboard'); // Never reached initially
  } else {
    router.push('/sign-in'); // Always fires first
  }
}, { immediate: true });
```

### Mobile App Solution (Correct)

```typescript
// ✅ Correct for mobile - wait for storage
const { client: supabase, user } = useSupabaseService();
const authReady = ref(false);

onMounted(async () => {
  // Wait for Capacitor Storage to be checked
  const { data: { session } } = await supabase.auth.getSession();
  
  // Give time for user ref to update
  if (session) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  authReady.value = true;
});

watch(user, async (newUser) => {
  if (!authReady.value) return;
  
  // Now safe to redirect
  if (newUser) {
    router.push('/dashboard');
  } else {
    router.push('/sign-in');
  }
}, { immediate: false }); // Changed to false
```

---

## 9. Quick Reference

### Web App Auth Watcher Characteristics

| Feature | Value |
|---------|-------|
| **Watcher Target** | `user` ref from `useSupabaseUser()` |
| **Immediate** | `true` - runs on initialization |
| **Timing** | Fires after `user` ref updates |
| **Storage** | `localStorage` (synchronous) |
| **Redirect Logic** | Checks public routes, handles special cases |
| **Debug Logs** | `[Auth Watcher] Path: ...` |

### Mobile App Modifications Needed

| Change | Reason |
|--------|--------|
| **Add `authReady` flag** | Wait for Capacitor Storage |
| **Use `onMounted()` check** | Ensure session loaded |
| **Set `immediate: false`** | Don't run before ready |
| **Add delay after session check** | Give user ref time to update |
| **Consider auth events** | More reliable than watcher alone |

### Common Pitfalls

❌ **Don't**: Use `{ immediate: true }` with Capacitor Storage  
✅ **Do**: Wait for storage to be checked first

❌ **Don't**: Redirect on first `null` value  
✅ **Do**: Verify no session exists before redirecting

❌ **Don't**: Rely only on watcher  
✅ **Do**: Also listen to `onAuthStateChange` events

❌ **Don't**: Assume user ref updates instantly  
✅ **Do**: Add delays for async storage operations

---

## 10. Testing Checklist

For mobile app:

- [ ] Auth watcher doesn't fire before storage is checked
- [ ] User with valid session not redirected to /sign-in on app launch
- [ ] Sign-in redirects to /dashboard after user ref updates
- [ ] Sign-out redirects to /sign-in
- [ ] Protected routes redirect unauthenticated users
- [ ] Public routes accessible without auth
- [ ] `/reset-password` never redirects away
- [ ] `/user/` profiles don't trigger dashboard redirect
- [ ] Debug logs show correct timing
- [ ] No race conditions between watcher and storage

---

**Summary**: The web app's auth watcher works because `localStorage` is synchronous. Mobile apps need to account for async Capacitor Storage by waiting for initialization before redirecting.

