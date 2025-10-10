# Auth Redirect Fix - Mobile Implementation

## Problem
The auth redirect stopped working after moving the watcher logic to `authStore.ts` because **`onMounted` lifecycle hook does NOT work in Pinia stores**. 

Pinia stores are plain JavaScript objects, not Vue components, so they don't support Vue lifecycle hooks like `onMounted`.

## Root Cause

### Why it works in the web app (Nuxt):
- Nuxt provides special SSR hooks that allow `useRouter()` during store initialization
- Nuxt's server-side context enables lifecycle-like behaviors in stores

### Why it doesn't work in mobile app (Ionic Vue):
- Ionic Vue uses standard Vue 3 (client-side only)
- Vue lifecycle hooks (`onMounted`, `onBeforeMount`, etc.) only work in Vue components
- Pinia stores cannot access these hooks

## Solution

**Move the auth redirect watcher from `authStore.ts` to `App.vue`** where Vue lifecycle hooks work properly.

This is the recommended best practice for Ionic Vue applications.

## Implementation

### 1. Cleaned up authStore.ts

**Removed** (lines 223-282):
- `onMounted` block with auth ready flag
- `watch(user, ...)` block
- Unused imports: `watch`, `onMounted`, `useRouter`, `AUTH_STORE_REDIRECT_ROUTES`

**Kept**:
- All auth actions and state management
- `initializeAuth()` function (called from App.vue)

### 2. Implemented Auth Watcher in App.vue

**Added**:
```typescript
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { AUTH_STORE_REDIRECT_ROUTES } from '@/constants/publicRoutes'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // ... existing splash screen and status bar code ...
  
  // Initialize auth - loads session from Capacitor Storage
  await authStore.initializeAuth()
  console.log('[App.vue] Auth initialized, user:', authStore.user?.id)
})

// Watch for auth state changes and handle redirects
watch(() => authStore.user, (newUser) => {
  const currentPath = router.currentRoute.value.path
  
  const isPublic = AUTH_STORE_REDIRECT_ROUTES.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  )
  
  // Special case: Never redirect away from /reset-password
  if (currentPath.startsWith('/reset-password')) {
    return
  }
  
  if (newUser) {
    // User is authenticated - redirect from public routes to dashboard
    if (isPublic && currentPath !== '/preview') {
      router.push('/tabs/dashboard')
    }
  } else {
    // User is not authenticated - redirect from protected routes to sign-in
    if (!isPublic) {
      router.push('/sign-in')
    }
  }
}, { immediate: true })
```

## Key Differences from Store Implementation

| Aspect | Store (Doesn't Work) | App.vue (Works) |
|--------|---------------------|-----------------|
| Lifecycle Hooks | ❌ Not available | ✅ Available |
| `useRouter()` | ❌ Not accessible during init | ✅ Accessible in setup |
| `watch()` | ❌ Runs but timing issues | ✅ Runs correctly with `immediate: true` |
| Capacitor Storage | ⚠️ Needs manual timing | ✅ Handled by `onMounted` + `initializeAuth` |

## How It Works

1. **App.vue mounts** - `onMounted` hook executes
2. **Auth initializes** - `authStore.initializeAuth()` loads session from Capacitor Storage
3. **Watcher starts** - `watch(() => authStore.user, ...)` begins monitoring
4. **User signs in** - Store updates `user` ref
5. **Watcher triggers** - Detects user change and performs redirect
6. **Navigation happens** - Router pushes to `/tabs/dashboard`

## Testing Results

✅ Build succeeds with no errors
✅ No linter warnings
✅ Auth store cleaned up (removed 60 lines of non-working code)
✅ Auth watcher now in proper location (App.vue component)

## Expected Behavior

After this fix:
- ✅ Sign in → Redirects to `/tabs/dashboard`
- ✅ Sign out → Redirects to `/sign-in`
- ✅ Navigate to protected route while logged out → Redirects to `/sign-in`
- ✅ Navigate to `/sign-in` while logged in → Redirects to `/tabs/dashboard`
- ✅ Reload page while logged in → Stays on current route
- ✅ `/reset-password` route → Never redirects

## Architecture Alignment

This implementation now follows the same pattern as other Ionic Vue applications:
- ✅ Auth logic in store (data + actions)
- ✅ Auth watcher in component (lifecycle + routing)
- ✅ Centralized public routes constant
- ✅ Clean separation of concerns

## Files Changed

1. `src/stores/authStore.ts` - Removed non-working lifecycle code
2. `src/App.vue` - Added auth watcher with proper lifecycle hooks
3. `src/constants/publicRoutes.ts` - Already existed (no changes)

---

**Status**: ✅ Complete
**Date**: October 10, 2025
**Testing**: Ready for user testing

