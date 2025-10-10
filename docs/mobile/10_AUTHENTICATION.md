# Mobile Authentication Guide

## Overview
How to implement Supabase Auth on mobile with Ionic/Capacitor: email/password, OAuth (Google/Facebook) via deep links, session handling, and password reset.

## Table of Contents
- Supabase client configuration
- Deep linking (iOS/Android) and callback URL
- Email/password flows
- OAuth flows
- Session persistence
- Password reset
- Security notes

---

## Supabase Client Configuration

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)
```

Add to `.env`:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_OAUTH_CALLBACK=songwars://auth/callback
```

## Deep Linking

### Capacitor Config
```ts
// capacitor.config.ts (excerpt)
plugins: {
  App: {
    appUrlOpen: {
      iosCustomScheme: 'songwars',
      androidCustomScheme: 'songwars'
    }
  }
}
```

### iOS Associated Domains
- In Xcode, add URL Type: Identifier=SongWars, URL Schemes=`songwars`
- Add Associated Domains if you use universal links

### Android Intent Filter
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="songwars" android:host="auth" android:path="/callback" />
</intent-filter>
```

### Handling Callback
```ts
// src/composables/useAuthDeepLink.ts
import { App } from '@capacitor/app'
import { useRouter } from 'vue-router'

export function useAuthDeepLink() {
  const router = useRouter()
  App.addListener('appUrlOpen', ({ url }) => {
    if (url.startsWith('songwars://auth/callback')) {
      // Supabase will parse the URL itself for PKCE; just route
      router.replace('/tabs/dashboard')
    }
  })
}
```

## Email/Password Flows

```ts
// src/store/authStore.ts (interface only)
async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

async function signOut() {
  await supabase.auth.signOut()
}
```

## OAuth Flows (Google/Facebook)

```ts
// src/composables/useOAuth.ts
import { supabase } from '@/lib/supabaseClient'

const redirectTo = import.meta.env.VITE_OAUTH_CALLBACK

export function useOAuth() {
  const google = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  const facebook = () => supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo } })
  return { google, facebook }
}
```

## Session Persistence
- Supabase JS handles persistence with `persistSession: true`
- On app start, check current session:
```ts
const { data } = await supabase.auth.getSession()
if (data.session) router.replace('/tabs/dashboard')
```

## Password Reset
- Use “reset via email” flow. Set redirect to a mobile route you handle.
```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'songwars://auth/callback?mode=reset'
})
```
Handle in `appUrlOpen` and present a change-password screen that calls:
```ts
await supabase.auth.updateUser({ password: newPassword })
```

## Security Notes
- Use `Service Role` key only on server, never in app.
- Enforce RLS policies (already in backend docs).
- Use HTTPS endpoints and consider certificate pinning in production.
- Use `Preferences` to store low-sensitivity flags only; avoid storing secrets.

