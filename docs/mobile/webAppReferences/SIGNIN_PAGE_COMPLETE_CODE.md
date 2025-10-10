# Sign In Page - Complete Code Reference

## Overview
This document contains the **complete, unmodified code** for the SongWars Sign In page and all its dependencies. Use this as a reference for creating the mobile Ionic version.

---

## 1. Main Sign In Page Component

**File**: `pages/sign-in.vue`

### Template
```vue
<template>
  <div class="min-h-screen flex items-center justify-center p-6 theme-bg-primary">
    <div class="max-w-md w-full rounded-2xl shadow-xl p-8 border theme-bg-card theme-border-card">
      <!-- Header -->
      <div class="text-center mb-8">
        <!-- Large SongWars Logo taking up 70% of the top -->
              <div class="w-full flex justify-center mb-6">
                <div class="logo-swap w-4/5 max-w-xs">
                  <img src="/tapey.svg" alt="SongWars Logo" class="logo--light w-full object-contain" />
                  <img src="/tapey-white.svg" alt="SongWars Logo" class="logo--dark w-full object-contain" />
                </div>
              </div>
        <h1 class="text-3xl font-bold mb-2 theme-text-primary">Welcome Back</h1>
        <p class="text-sm theme-text-secondary">
          Sign in to your SongWars account
        </p>
      </div>

      <!-- Form -->
      <SignInForm />

      <!-- Links -->
      <div class="mt-8 text-center space-y-3">
        <div class="p-3 rounded-lg border bg-[#ffd200]/10 border-[#ffd200]/20">
          <p class="text-sm mb-2 theme-text-secondary">
            New to SongWars?
          </p>
          <NuxtLink 
            to="/preview" 
            class="inline-block px-4 py-2 text-sm font-medium text-black bg-[#ffd200] border border-black rounded-lg shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
          >
            Try it out!
          </NuxtLink>
        </div>
        <p class="text-sm theme-text-secondary">
          Don't have an account?
          <NuxtLink to="/registration" class="font-medium text-[#b58900] hover:text-[#866200] transition-colors">
            Create Account
          </NuxtLink>
        </p>
        <p class="text-sm theme-text-secondary">
          <NuxtLink to="/reset-password-email" class="font-medium text-[#b58900] hover:text-[#866200] transition-colors">
            Forgot your password?
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
```

### Script
```typescript
<script setup lang="ts">
import SignInForm from '~/components/signIn/signInForm.vue';
import { computed } from 'vue'

// Read current theme from the DOM to avoid hydration mismatches
const isDarkMode = computed(() => {
  if (typeof document !== 'undefined' && document.documentElement) {
    return document.documentElement.getAttribute('data-theme') === 'dark'
  }
  return false
})
</script>
```

### Key Features
- Full-screen centered layout
- Theme-aware logo swap (light/dark)
- Embeds `SignInForm` component
- Links to trial (`/preview`), registration, and password reset
- Retro yellow CTA button styling

---

## 2. Sign In Form Component

**File**: `components/signIn/SignInForm.vue`

### Template (Lines 1-108)
```vue
<template>
    <form @submit.prevent="handleSignIn" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium mb-2 theme-text-secondary">Email address</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          class="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input border"
          name="email"
          autocomplete="email"
          autocapitalize="off"
          spellcheck="false"
          ref="emailInputEl"
          placeholder="you@example.com"
        />
      </div>
  
      <div>
        <label for="password" class="block text-sm font-medium mb-2 theme-text-secondary">Password</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          class="w-full px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input border"
          name="password"
          autocomplete="current-password"
          autocapitalize="off"
          spellcheck="false"
          ref="passwordInputEl"
          placeholder="••••••••"
        />
      </div>
  
      <!-- Display error message from authStore -->
      <div v-if="authStore.signInError" class="p-4 rounded-lg text-sm font-medium text-center border"
           :class="isDarkMode ? 'bg-red-900/30 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'">
        {{ authStore.signInError }}
      </div>
  
      <div>
        <button
          type="submit"
          :disabled="signingIn"
          class="bigbutton bigbutton-medium w-full flex justify-center items-center"
          :class="{ 'opacity-50 cursor-not-allowed': signingIn }"
        >
          <svg v-if="signingIn" class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ signingIn ? 'Signing In...' : 'Sign In' }}
        </button>
      </div>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t theme-border-card"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 theme-text-secondary theme-bg-card">Or continue with</span>
        </div>
      </div>

      <!-- Google Sign In Button -->
      <div>
        <button
          @click="handleGoogleSignIn"
          :disabled="signingInWithGoogle"
          class="w-full flex justify-center items-center px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-signin-btn"
          :class="[{ 'opacity-50 cursor-not-allowed': signingInWithGoogle }]"
        >
          <svg v-if="signingInWithGoogle" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {{ signingInWithGoogle ? 'Signing in with Google...' : 'Continue with Google' }}
        </button>
      </div>

      <!-- Facebook Sign In Button -->
      <div class="mt-3">
        <button
          @click="handleFacebookSignIn"
          :disabled="signingInWithFacebook"
          class="w-full flex justify-center items-center px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-signin-btn"
          :class="[{ 'opacity-50 cursor-not-allowed': signingInWithFacebook }]"
        >
          <svg v-if="signingInWithFacebook" class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#1877F2" d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.696h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
          </svg>
          {{ signingInWithFacebook ? 'Signing in with Facebook...' : 'Continue with Facebook' }}
        </button>
      </div>
    </form>
</template>
```

### Script (Lines 111-166)
```typescript
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/store/authStore';
import { useThemeStore } from '~/store/themeStore';
import { useOAuthSignIn } from '~/composables/useOAuthSignIn';

// Local reactive states for form inputs and UI feedback
const email = ref('');
const password = ref('');
const signingIn = ref(false); // Manages button loading state

// Pinia store instance
const authStore = useAuthStore();
const themeStore = useThemeStore();
const isDarkMode = computed(() => themeStore.theme === 'dark');
const emailInputEl = ref<HTMLInputElement | null>(null)
const passwordInputEl = ref<HTMLInputElement | null>(null)

// OAuth sign-in handlers and loading states
const { signingInWithGoogle, signingInWithFacebook, handleGoogleSignIn, handleFacebookSignIn } = useOAuthSignIn()
  // Note: router is typically used in the parent page or authStore's watcher for redirects after auth.
  // If you need direct router pushes *within* this form, uncomment below:
  // const router = useRouter();
  
  const handleSignIn = async () => {
    signingIn.value = true; // Set loading state for the button
    authStore.signInError = null; // Clear previous error from store
  
    try {
      // Call the authStore action to sign in with email and password
      // authStore.signInWithEmail throws an error on failure, which is caught here.
      await authStore.signInWithEmail(email.value, password.value);
  
      // If sign-in is successful, authStore's watch(user) will handle the router push to dashboard
      // No explicit router.push here if you rely on the authStore's watcher.
  
    } catch (error: any) {
      // Error is already set in authStore.signInError by authStore.signInWithEmail
      console.error('Sign-in process caught in component:', error);
    } finally {
    signingIn.value = false; // Reset loading state
  }
};

// Mitigate autofill flicker by stabilizing initial values to whatever the
  // browser has autofilled before Vue hydration completes.
  onMounted(() => {
    // Sync initial DOM values (incl. browser autofill) into Vue state immediately
    requestAnimationFrame(() => {
      const emailVal = emailInputEl.value?.value
      const passVal = passwordInputEl.value?.value
      if (typeof emailVal === 'string') email.value = emailVal
      if (typeof passVal === 'string') password.value = passVal
    })
  })
</script>
```

### Styles (Lines 168-234)
```css
<style scoped>
.bigbutton {
  border: 2px solid #000;
  border-radius: 5px;
  background: #ffd200;
  color: #000;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  top: 0;
  left: 0;
  transition-property: box-shadow, top, left;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}

/* Small size */
.bigbutton-small {
  line-height: 1.2em;
  padding: 8px 16px;
  font-size: 0.875em;
  box-shadow: 2px 2px 0 #000;
}

.bigbutton-small:hover {
  top: 2px;
  left: 2px;
  box-shadow: 1px 1px 0 #000 !important;
}

/* Medium size (default) */
.bigbutton-medium {
  line-height: 1.4em;
  padding: 12px 24px;
  font-size: 1.125em;
  box-shadow: 2px 2px 0 #000;
}

.bigbutton-medium:hover {
  top: 2px;
  left: 2px;
  box-shadow: 1px 1px 0 #000 !important;
}

/* Large size */
.bigbutton-large {
  line-height: 1.5em;
  padding: 20px 45px;
  font-size: 1.5em;
  box-shadow: 3px 3px 0 #000;
}

.bigbutton-large:hover {
  top: 4px;
  left: 4px;
  box-shadow: 1px 1px 0 #000 !important;
}

.bigbutton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  top: 0;
  left: 0;
  box-shadow: 3px 3px 0 #000;
}
</style>
```

### Key Features
- Email/password input fields with theme-aware styling
- Loading states for all sign-in methods
- Error display from authStore
- Retro "bigbutton" styling (3 sizes)
- Google OAuth button with branded icon
- Facebook OAuth button with branded icon
- Autofill flicker mitigation (onMounted sync)
- Focus ring styling (`#ffd200`)

---

## 3. OAuth Sign-In Composable

**File**: `composables/useOAuthSignIn.ts`

```typescript
/**
 * Shared OAuth Sign-In Composable
 * Handles Google and Facebook authentication with loading states
 */

import { ref } from 'vue'
import { useAuthStore } from '~/store/authStore'

export const useOAuthSignIn = () => {
  const authStore = useAuthStore()
  const signingInWithGoogle = ref(false)
  const signingInWithFacebook = ref(false)

  const handleGoogleSignIn = async () => {
    signingInWithGoogle.value = true
    authStore.signInError = null

    try {
      await authStore.signInWithGoogle()
    } catch (error: any) {
      console.error('Google sign-in process caught in component:', error)
    } finally {
      signingInWithGoogle.value = false
    }
  }

  const handleFacebookSignIn = async () => {
    signingInWithFacebook.value = true
    authStore.signInError = null

    try {
      await authStore.signInWithFacebook()
    } catch (error: any) {
      console.error('Facebook sign-in process caught in component:', error)
    } finally {
      signingInWithFacebook.value = false
    }
  }

  return {
    signingInWithGoogle,
    signingInWithFacebook,
    handleGoogleSignIn,
    handleFacebookSignIn
  }
}
```

### Purpose
- Reusable composable for OAuth authentication
- Manages loading states for both providers
- Error handling and logging
- Used by both SignInForm and RegistrationForm

---

## 4. Supabase Service Composable

**File**: `composables/useSupabaseService.ts`

```typescript
/**
 * Centralized Supabase service composable
 * Provides consistent access to Supabase client and user state
 * Eliminates the need for stores to import Supabase directly
 */
import { computed } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { User } from '@supabase/supabase-js'

export const useSupabaseService = () => {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  return {
    client,
    user,
    // Helper to check if user is authenticated
    isAuthenticated: computed(() => !!user.value),
    // Helper to get user ID safely
    userId: computed(() => user.value?.id || null),
    // Helper to get user email safely
    userEmail: computed(() => user.value?.email || null),
  }
}

/**
 * Type-safe wrapper for common Supabase operations
 */
export const useSupabaseOperations = () => {
  const { client, user } = useSupabaseService()

  /**
   * Generic error handler for Supabase operations
   */
  const handleError = (error: any, operation: string) => {
    console.error(`Supabase ${operation} error:`, error)
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      data: null
    }
  }

  /**
   * Generic success handler for Supabase operations
   */
  const handleSuccess = (data: any, operation: string) => {
    console.log(`Supabase ${operation} success:`, data)
    return {
      success: true,
      error: null,
      data
    }
  }

  /**
   * Safe database query with error handling
   */
  const safeQuery = async <T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    operationName: string
  ) => {
    try {
      const { data, error } = await operation()
      if (error) {
        return handleError(error, operationName)
      }
      return handleSuccess(data, operationName)
    } catch (error) {
      return handleError(error, operationName)
    }
  }

  /**
   * Safe authentication operation
   */
  const safeAuth = async (
    operation: () => Promise<{ data: any; error: any }>,
    operationName: string
  ) => {
    try {
      const { data, error } = await operation()
      if (error) {
        return handleError(error, operationName)
      }
      return handleSuccess(data, operationName)
    } catch (error) {
      return handleError(error, operationName)
    }
  }

  return {
    client,
    user,
    safeQuery,
    safeAuth,
    handleError,
    handleSuccess
  }
}
```

### Purpose
- Centralized access to Supabase client
- Reactive user state from `@nuxtjs/supabase`
- Helper computed properties for auth checks
- Type-safe operation wrappers (optional)

---

## 5. Auth Store (Relevant Parts)

**File**: `store/authStore.ts`

### Sign-In Methods (Lines 97-173)

```typescript
async function signInWithEmail(email: string, password: string) {
    signInError.value = null; // Clear previous errors
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        console.error('Auth Store: Supabase signInWithEmail error:', error.message);
        signInError.value = error.message;
        throw error;
    }
    
    // The `watch(user, ...)` handler above will automatically update state and redirect
    console.log('Auth Store: Sign-in request sent. Session will be handled by useSupabaseUser watch.');
    return data; // Return data for component to use
}

async function signInWithGoogle() {
    signInError.value = null; // Clear previous errors
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/api/auth/callback`
        }
    });

    if (error) {
        console.error('Auth Store: Google OAuth error:', error.message);
        signInError.value = error.message;
        throw error;
    }
    
    console.log('Auth Store: Google OAuth initiated');
    return data;
}

async function signInWithFacebook() {
    signInError.value = null;
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: `${window.location.origin}/api/auth/callback`
        }
    });

    if (error) {
        console.error('Auth Store: Facebook OAuth error:', error.message);
        signInError.value = error.message;
        throw error;
    }

    console.log('Auth Store: Facebook OAuth initiated');
    return data;
}
```

### User Watcher (Lines 29-61)
```typescript
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

### Key Features
- `signInWithEmail()`: Email/password authentication
- `signInWithGoogle()`: Google OAuth with redirect to `/api/auth/callback`
- `signInWithFacebook()`: Facebook OAuth with redirect to `/api/auth/callback`
- `signInError` ref for displaying errors
- User watcher handles automatic redirects after successful auth
- Redirect logic considers public routes and current path

---

## 6. Styling Summary

### Colors Used
```css
/* Primary Brand Yellow */
#ffd200

/* Yellow variants for links */
#b58900 (default)
#866200 (hover)

/* Focus ring */
#ffd200

/* Google brand colors */
#4285F4 (blue)
#34A853 (green)
#FBBC05 (yellow)
#EA4335 (red)

/* Facebook brand color */
#1877F2
```

### Key CSS Classes (Theme-Aware)
```css
/* Layout */
.theme-bg-primary
.theme-bg-card
.theme-border-card

/* Typography */
.theme-text-primary
.theme-text-secondary

/* Inputs */
.theme-input

/* Buttons */
.theme-signin-btn (for OAuth buttons)
.bigbutton (retro yellow button)
.bigbutton-medium (default size)

/* Logo */
.logo-swap (switches between light/dark logos)
.logo--light (visible in light mode)
.logo--dark (visible in dark mode)
```

### Responsive Design
- Full-height layout: `min-h-screen`
- Centered card: `flex items-center justify-center`
- Max width: `max-w-md` (448px)
- Padding: `p-6` (24px) on container, `p-8` (32px) on card
- Mobile-friendly spacing: `space-y-6`, `space-y-3`

---

## 7. Dependencies

### NPM Packages
- `vue` (3.x)
- `@nuxtjs/supabase`
- `pinia`
- `@supabase/supabase-js`

### Internal Dependencies
```typescript
// Components
import SignInForm from '~/components/signIn/signInForm.vue'

// Stores
import { useAuthStore } from '~/store/authStore'
import { useThemeStore } from '~/store/themeStore'

// Composables
import { useOAuthSignIn } from '~/composables/useOAuthSignIn'
import { useSupabaseService } from '~/composables/useSupabaseService'
import { useSupabaseClient, useSupabaseUser } from '#imports'

// Vue Router
import { useRouter } from '#app'

// Constants
import { AUTH_STORE_REDIRECT_ROUTES } from '~/constants/publicRoutes'
```

### Assets
- `/tapey.svg` (light mode logo)
- `/tapey-white.svg` (dark mode logo)

---

## 8. Authentication Flow

### Email/Password Sign In
1. User enters email and password
2. Form submission calls `handleSignIn()`
3. `handleSignIn()` calls `authStore.signInWithEmail()`
4. AuthStore calls Supabase `auth.signInWithPassword()`
5. On success, Supabase updates session
6. `@nuxtjs/supabase` module detects session change
7. AuthStore's `watch(user)` triggers
8. User is redirected to `/dashboard/`
9. Error displayed via `authStore.signInError` if failed

### OAuth Sign In (Google/Facebook)
1. User clicks OAuth button
2. Button calls `handleGoogleSignIn()` or `handleFacebookSignIn()`
3. Composable calls authStore OAuth method
4. AuthStore calls Supabase `auth.signInWithOAuth()`
5. User redirected to provider's OAuth page
6. After authorization, provider redirects to `/api/auth/callback`
7. Callback endpoint exchanges code for session
8. User redirected to `/dashboard/`

### Autofill Handling
- Uses `requestAnimationFrame()` in `onMounted()` to sync autofilled values
- Prevents hydration mismatch and visual flicker
- Refs to input elements (`emailInputEl`, `passwordInputEl`)

---

## 9. Mobile Conversion Notes

### Ionic Equivalents

**Layout**:
- Replace `<div>` containers with `<ion-page>`, `<ion-content>`
- Use `<ion-card>` for the sign-in card
- Replace `flex` classes with Ionic grid or flexbox utilities

**Inputs**:
- Replace `<input>` with `<ion-input>`
- Replace `<label>` with `<ion-label position="floating">`
- Use `<ion-item>` wrapper for form fields

**Buttons**:
- Replace `<button>` with `<ion-button>`
- Keep `.bigbutton` custom CSS for primary button
- Use `expand="block"` for full-width buttons

**Styling**:
- Import theme CSS (see `COMPLETE_STYLE_GUIDE.md`)
- Use Ionic CSS variables for theming
- Preserve exact colors (`#ffd200`, etc.)

**OAuth**:
- Use Capacitor plugins for native OAuth
- Configure deep linking for callback URLs
- See `10_AUTHENTICATION.md` for mobile OAuth setup

**Navigation**:
- Replace `<NuxtLink>` with `<ion-router-link>` or `router.push()`
- Use Ionic navigation stack

---

## 10. Testing Checklist

- [ ] Email/password sign-in works
- [ ] Google OAuth works
- [ ] Facebook OAuth works
- [ ] Error messages display correctly
- [ ] Loading states show during sign-in
- [ ] Theme toggle works (light/dark)
- [ ] Logo swaps correctly between themes
- [ ] Links navigate to correct pages
- [ ] Autofill doesn't cause visual flicker
- [ ] Retro button styling matches web app
- [ ] Focus states visible (yellow ring)
- [ ] Responsive on mobile devices
- [ ] Safe area insets respected (iOS)
- [ ] OAuth redirects work on native platforms

---

**Reference**: For exact styling specifications, see `COMPLETE_STYLE_GUIDE.md`  
**Reference**: For OAuth deep linking setup, see `10_AUTHENTICATION.md`  
**Reference**: For component conversion patterns, see `05_COMPONENTS_CONVERSION.md`

