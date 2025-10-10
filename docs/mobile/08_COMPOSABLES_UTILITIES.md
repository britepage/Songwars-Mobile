# Composables & Utilities Conversion Guide

## Overview
This guide maps every SongWars web composable and utility to its mobile equivalent, with code you can copy/paste. Where we replace browser APIs with native plugins, you’ll see the updated usage.

## Table of Contents
- Composable mappings
- Utility mappings
- Mobile replacements and adapters
- Copy/paste examples

---

## Composable Mappings

The web app exposes 10 composables located in `composables/`:

- `useAudioContext.ts` → Replace with native audio bootstrap; most apps will not need a WebAudio context on mobile
- `useAudioElements.ts` → Replace with centralized native audio service (`services/audioService.ts`)
- `useAudioPlayer.ts` → Keep name; re-implement using native audio service (see Audio System doc)
- `useAudioProgress.ts` → Folded into `useAudioPlayer` progress callbacks
- `useAudioTimeouts.ts` → Folded into `clipService` auto-stop logic
- `useBattleAudio.ts` → Keep name; re-implement using two `useAudioPlayer` instances (see Audio System doc)
- `useMobileDetection.ts` → Replace with Capacitor `Device` helpers (see `deviceService`)
- `useOAuthSignIn.ts` → Keep name; update for native deep links (see Authentication doc)
- `useSupabaseService.ts` → Keep; same client, different `redirectTo` for OAuth
- `useTaggedSongs.ts` → Keep; adjust audio calls to `useAudioPlayer`

### Example: useSupabaseService (mobile-safe)
```ts
// src/composables/useSupabaseService.ts
import { createClient } from '@supabase/supabase-js'
import { ref } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

const client = createClient(supabaseUrl, supabaseKey, {
  auth: { flowType: 'pkce', detectSessionInUrl: true }
})

const user = ref<any | null>(null)
client.auth.onAuthStateChange((_e, session) => {
  user.value = session?.user ?? null
})

export function useSupabaseService() {
  return { client, user }
}
```

### Example: useOAuthSignIn (native deep links)
```ts
// src/composables/useOAuthSignIn.ts
import { useSupabaseService } from '@/composables/useSupabaseService'

const CALLBACK = import.meta.env.VITE_OAUTH_CALLBACK // e.g., songwars://auth/callback

export function useOAuthSignIn() {
  const { client } = useSupabaseService()

  const signInWithGoogle = async () => {
    return client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: CALLBACK, skipBrowserRedirect: false }
    })
  }

  const signInWithFacebook = async () => {
    return client.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: CALLBACK, skipBrowserRedirect: false }
    })
  }

  return { signInWithGoogle, signInWithFacebook }
}
```

### Example: useAudioPlayer (mobile)
Use the version from `11_AUDIO_SYSTEM.md`. It replaces HTMLAudio with the native audio service.

### Example: useBattleAudio (mobile)
Use the version from `11_AUDIO_SYSTEM.md`. It coordinates two players with voting phases.

### Example: useTaggedSongs (audio integration)
```ts
import { useSupabaseService } from '@/composables/useSupabaseService'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { ref } from 'vue'

export function useTaggedSongs() {
  const { client, user } = useSupabaseService()
  const audioPlayer = useAudioPlayer()

  const taggedSongs = ref<any[]>([])
  const loading = ref(false)

  const fetchTaggedSongs = async () => {
    loading.value = true
    const { data } = await client
      .from('user_tags')
      .select('*, songs(*), profiles(username, display_name, avatar_url)')
      .eq('user_id', user.value?.id)
      .order('created_at', { ascending: false })
    taggedSongs.value = data || []
    loading.value = false
  }

  const playTaggedSong = async (song: any) => {
    await audioPlayer.togglePlay({
      songId: String(song.songs.id),
      audioUrl: song.songs.url,
      clipStartTime: song.songs.clip_start_time || 0,
      autoStopAfter: 30000
    })
  }

  return { taggedSongs, loading, fetchTaggedSongs, playTaggedSong }
}
```

---

## Utility Mappings

Utilities in `utils/` (web) → mobile equivalents:

- `audioConverterWebAudio.ts` → For mobile, prefer server-side conversion or Capacitor-community FFmpeg if needed. Provide a thin adapter that falls back to web when running in browser.
- `genres.ts` → No change; pure constants.
- `socialPlatforms.ts` → No change; pure constants/validation.
- `titleExtractor.ts` → No change; pure string logic.
- `trialManager.ts` → Keep logic, but persist counters with Capacitor `Preferences`.

### Example: trialManager (persist via Preferences)
```ts
// src/utils/trialManager.mobile.ts
import { Preferences } from '@capacitor/preferences'

const KEY = 'songwars_trial_battles'

export async function getTrialCount(): Promise<number> {
  const { value } = await Preferences.get({ key: KEY })
  return Number(value || '0')
}

export async function incrementTrial(): Promise<number> {
  const next = (await getTrialCount()) + 1
  await Preferences.set({ key: KEY, value: String(next) })
  return next
}

export async function resetTrial() {
  await Preferences.remove({ key: KEY })
}
```

---

## Mobile Replacements and Adapters

- Replace direct DOM audio handling with `audioService` and `clipService`
- Replace `localStorage/sessionStorage` with Capacitor `Preferences`
- Replace window focus/visibility events with Capacitor `App` events
- Replace drag-and-drop file access with Camera/Filesystem pickers

---

## Copy/Paste Index

- Supabase client: see snippet above
- OAuth sign-in: see snippet above
- Audio player: see `11_AUDIO_SYSTEM.md`
- Battle audio: see `11_AUDIO_SYSTEM.md`
- Offline store: see `07_STATE_MANAGEMENT.md`
- Device helpers: see `12_NATIVE_FEATURES.md`

