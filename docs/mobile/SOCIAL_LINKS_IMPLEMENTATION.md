# Social Links Implementation Guide

## Overview
This document explains the **actual** social links implementation in the SongWars web app and how to replicate it exactly in the mobile app.

**CRITICAL**: Social links are stored as a **JSONB array** in the `profiles.social_links` column. There is **NO** separate `user_social_links` table.

---

## Database Schema

### Storage Location
**Table**: `profiles`  
**Column**: `social_links` (JSONB type)  
**Structure**:
```json
[
  {
    "platform": "spotify",
    "url": "https://open.spotify.com/artist/...",
    "label": "Spotify"
  },
  {
    "platform": "instagram",
    "url": "https://instagram.com/username",
    "label": "Instagram"
  }
]
```

### Constraints
- Maximum 3 links per user
- Stored directly in profiles table
- No foreign key relationships
- Updated via `UPDATE profiles SET social_links = ...`

### Migration Reference
From `supabase/migrations/20240701_create_profiles_table.sql`:
```sql
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    display_name text,
    avatar_url text,
    bio text,
    region text,
    age_range text,
    musical_preferences text,
    role text NOT NULL DEFAULT 'fan',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```

**Note**: The `social_links` column is added via a later migration as a JSONB field. Check your production schema for exact column definition.

---

## Utility Functions

### Complete socialPlatforms.ts (Copy-Paste Entire File)

**Location**: `utils/socialPlatforms.ts`

```typescript
// Social media platform detection and configuration
export interface SocialLink {
  platform: string
  url: string
  label: string
}

export interface PlatformConfig {
  name: string
  icon: string
  color: string
  domains: string[]
  urlPattern?: RegExp
}

// Supported social media platforms
export const SUPPORTED_PLATFORMS: Record<string, PlatformConfig> = {
  spotify: {
    name: 'Spotify',
    icon: `<img src="https://cdn.simpleicons.org/spotify/1DB954" alt="Spotify" width="24" height="24" />`,
    color: '#1DB954',
    domains: ['spotify.com', 'open.spotify.com'],
    urlPattern: /^https?:\/\/(open\.)?spotify\.com\/(artist|album|track|playlist)\//
  },
  apple_music: {
    name: 'Apple Music',
    icon: `<img src="https://cdn.simpleicons.org/applemusic/FA243C" alt="Apple Music" width="24" height="24" />`,
    color: '#FA243C',
    domains: ['music.apple.com', 'itunes.apple.com'],
    urlPattern: /^https?:\/\/(music\.)?apple\.com\//
  },
  youtube: {
    name: 'YouTube',
    icon: `<img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width="24" height="24" />`,
    color: '#FF0000',
    domains: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//
  },
  instagram: {
    name: 'Instagram',
    icon: `<img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" />`,
    color: '#E4405F',
    domains: ['instagram.com', 'www.instagram.com'],
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\//
  },
  twitter: {
    name: 'X',
    icon: `<img src="https://cdn.simpleicons.org/x/000000" alt="X" width="24" height="24" />`,
    color: '#000000',
    domains: ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'],
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//
  },
  tiktok: {
    name: 'TikTok',
    icon: `<img src="https://cdn.simpleicons.org/tiktok/000000" alt="TikTok" width="24" height="24" />`,
    color: '#000000',
    domains: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\//
  },
  soundcloud: {
    name: 'SoundCloud',
    icon: `<img src="https://cdn.simpleicons.org/soundcloud/FF3300" alt="SoundCloud" width="24" height="24" />`,
    color: '#FF3300',
    domains: ['soundcloud.com', 'www.soundcloud.com'],
    urlPattern: /^https?:\/\/(www\.)?soundcloud\.com\//
  },
  bandcamp: {
    name: 'Bandcamp',
    icon: `<img src="https://cdn.simpleicons.org/bandcamp/629aa0" alt="Bandcamp" width="24" height="24" />`,
    color: '#629aa0',
    domains: ['bandcamp.com', 'www.bandcamp.com'],
    urlPattern: /^https?:\/\/(www\.)?bandcamp\.com\//
  },
  amazon: {
    name: 'Amazon Music',
    icon: `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg" alt="Amazon Music" width="24" height="24" />`,
    color: '#FF9900',
    domains: ['music.amazon.com', 'www.music.amazon.com', 'amazon.com/music'],
    urlPattern: /^https?:\/\/(www\.)?(music\.)?amazon\.com\/(music\/)?/
  },
  facebook: {
    name: 'Facebook',
    icon: `<img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" />`,
    color: '#1877F2',
    domains: ['facebook.com', 'www.facebook.com', 'fb.com'],
    urlPattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\//
  },
  linkedin: {
    name: 'LinkedIn',
    icon: `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" />`,
    color: '#0A66C2',
    domains: ['linkedin.com', 'www.linkedin.com'],
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\//
  },
  twitch: {
    name: 'Twitch',
    icon: `<img src="https://cdn.simpleicons.org/twitch/9146FF" alt="Twitch" width="24" height="24" />`,
    color: '#9146FF',
    domains: ['twitch.tv', 'www.twitch.tv'],
    urlPattern: /^https?:\/\/(www\.)?twitch\.tv\//
  },
  patreon: {
    name: 'Patreon',
    icon: `<img src="https://cdn.simpleicons.org/patreon/FF424D" alt="Patreon" width="24" height="24" />`,
    color: '#FF424D',
    domains: ['patreon.com', 'www.patreon.com'],
    urlPattern: /^https?:\/\/(www\.)?patreon\.com\//
  },
  website: {
    name: 'Website',
    icon: `<img src="https://api.iconify.design/mdi:globe.svg" alt="Website" width="24" height="24" />`,
    color: '#6B7280',
    domains: [],
    urlPattern: /^https?:\/\//
  }
}

/**
 * Detects the social media platform from a URL
 * @param url - The URL to analyze
 * @returns Platform configuration or null if not recognized
 */
export function detectPlatform(url: string): PlatformConfig | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Clean and normalize the URL
  let cleanUrl = url.trim()
  
  // Add https:// if no protocol is provided
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }

  // Validate URL format
  try {
    new URL(cleanUrl)
  } catch {
    return null
  }

  // Extract domain from URL
  const urlObj = new URL(cleanUrl)
  const hostname = urlObj.hostname.toLowerCase()
  
  // Remove www. prefix for comparison
  const domain = hostname.replace(/^www\./, '')

  // Check each platform
  for (const [platformKey, config] of Object.entries(SUPPORTED_PLATFORMS)) {
    // Check if domain matches
    if (config.domains.some(platformDomain => domain === platformDomain)) {
      // If there's a URL pattern, validate it
      if (config.urlPattern && !config.urlPattern.test(cleanUrl)) {
        continue
      }
      return config
    }
  }

  // If no specific platform matches, check if it's a valid website URL
  if (SUPPORTED_PLATFORMS.website.urlPattern!.test(cleanUrl)) {
    return SUPPORTED_PLATFORMS.website
  }

  return null
}

/**
 * Creates a social link object from a URL
 * @param url - The URL to process
 * @returns SocialLink object or null if invalid
 */
export function createSocialLink(url: string): SocialLink | null {
  const platform = detectPlatform(url)
  
  if (!platform) {
    return null
  }

  // Clean and normalize the URL
  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }

  return {
    platform: Object.keys(SUPPORTED_PLATFORMS).find(key => SUPPORTED_PLATFORMS[key] === platform) || 'website',
    url: cleanUrl,
    label: platform.name
  }
}

/**
 * Validates a social link URL
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function validateSocialLink(url: string): boolean {
  return detectPlatform(url) !== null
}

/**
 * Gets the platform configuration by key
 * @param platformKey - The platform key
 * @returns Platform configuration or null if not found
 */
export function getPlatformConfig(platformKey: string): PlatformConfig | null {
  return SUPPORTED_PLATFORMS[platformKey] || null
}

/**
 * Gets all supported platform keys
 * @returns Array of platform keys
 */
export function getSupportedPlatformKeys(): string[] {
  return Object.keys(SUPPORTED_PLATFORMS)
}

/**
 * Formats a social link for display
 * @param link - The social link object
 * @returns Formatted display string
 */
export function formatSocialLink(link: SocialLink): string {
  const config = getPlatformConfig(link.platform)
  return `${config?.icon || '🔗'} ${config?.name || 'Link'}: ${link.url}`
}
```

---

## Web App Component Patterns

### 1. SocialLinksManager.vue (Editor Component)

**Purpose**: Add, edit, and remove social links on the account page

**Key Features**:
- v-model pattern for reactive updates
- Max 3 links enforcement
- URL validation using `validateSocialLink()`
- Duplicate detection
- Platform auto-detection

**Usage Pattern** (from `pages/account.vue`):
```vue
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

**Data Flow**:
```typescript
// In parent component (account.vue)
const form = ref({
  // ... other fields
  social_links: [],
  // ...
})

// On save
await profileStore.updateProfile({
  social_links: form.value.social_links
})
```

### 2. SocialLinksDisplay.vue (Display Component)

**Purpose**: Display social links on public user profile pages

**Usage Pattern** (from `pages/user/[username].vue`):
```vue
<SocialLinksDisplay
  v-if="profile.role === 'artist' && profile.social_links && profile.social_links.length > 0"
  :social-links="profile.social_links"
/>
```

**Styling**:
- Grid layout (1-3 columns responsive)
- Platform-specific icons and colors
- External link targets (`target="_blank"`)
- Hover effects

---

## ProfileStore Integration

### Web App Implementation (store/profileStore.ts)

**Fetching Profile**:
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.value.id)
  .maybeSingle()

if (data) {
  profile.value = data
  // social_links is already in data as JSONB
}
```

**Updating Social Links**:
```typescript
async function updateProfile(newProfile: any) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      ...sanitized, 
      id: user.value.id 
    }, { onConflict: 'id' })
    .select()
    .single()
  
  if (data) {
    profile.value = data
  }
}

// Usage
await profileStore.updateProfile({
  social_links: [
    { platform: 'spotify', url: '...', label: 'Spotify' }
  ]
})
```

**Accessing Social Links**:
```typescript
// From any component
const socialLinks = computed(() => profileStore.profile?.social_links || [])
```

---

## Mobile Ionic Conversion

### Step 1: Copy Utils File
Copy `utils/socialPlatforms.ts` **exactly as-is** to your mobile project:
```bash
cp utils/socialPlatforms.ts mobile-app/src/utils/socialPlatforms.ts
```

### Step 2: Convert SocialLinksManager to Ionic

```vue
<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Social Links</ion-card-title>
      <ion-card-subtitle>
        Add up to 3 social media or streaming platform links
      </ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <!-- Existing Links -->
      <ion-list v-if="socialLinks.length > 0">
        <ion-item
          v-for="(link, index) in socialLinks"
          :key="index"
        >
          <ion-icon
            :icon="getPlatformIcon(link.platform)"
            slot="start"
            :style="{ color: getPlatformColor(link.platform) }"
          />
          <ion-label>
            <h3>{{ link.label }}</h3>
            <p>{{ link.url }}</p>
          </ion-label>
          <ion-button
            fill="clear"
            color="danger"
            slot="end"
            @click="removeLink(index)"
          >
            <ion-icon :icon="trash" />
          </ion-button>
        </ion-item>
      </ion-list>

      <!-- Add New Link -->
      <div v-if="socialLinks.length < 3" class="add-link">
        <ion-item>
          <ion-label position="floating">
            Paste social media URL
          </ion-label>
          <ion-input
            v-model="newLinkUrl"
            type="url"
            placeholder="https://instagram.com/yourprofile"
          />
        </ion-item>

        <ion-text v-if="urlError" color="danger">
          <p>{{ urlError }}</p>
        </ion-text>

        <ion-button
          expand="block"
          @click="addLink"
          :disabled="!newLinkUrl || !!urlError || saving"
        >
          <ion-icon slot="start" :icon="add" />
          {{ saving ? 'Adding...' : 'Add Link' }}
        </ion-button>
      </div>

      <ion-text v-if="socialLinks.length >= 3" color="medium">
        <p>Maximum 3 links reached</p>
      </ion-text>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
         IonList, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText } from '@ionic/vue'
import { add, trash } from 'ionicons/icons'
import { useProfileStore } from '@/stores/profileStore'
import { createSocialLink, validateSocialLink, getPlatformConfig } from '@/utils/socialPlatforms'

const profileStore = useProfileStore()

const newLinkUrl = ref('')
const urlError = ref('')
const saving = ref(false)

const socialLinks = computed(() => profileStore.profile?.social_links || [])

const addLink = async () => {
  if (!newLinkUrl.value || urlError.value) return

  saving.value = true

  try {
    const socialLink = createSocialLink(newLinkUrl.value)
    if (!socialLink) {
      urlError.value = 'Unable to detect platform from URL'
      saving.value = false
      return
    }

    // Check for duplicates
    const isDuplicate = socialLinks.value.some(link => 
      link.url === socialLink.url || link.platform === socialLink.platform
    )
    
    if (isDuplicate) {
      urlError.value = 'This platform or URL is already added'
      saving.value = false
      return
    }

    const updatedLinks = [...socialLinks.value, socialLink]
    await profileStore.updateProfile({
      social_links: updatedLinks,
    })

    newLinkUrl.value = ''
    urlError.value = ''
  } catch (error) {
    console.error('Error adding link:', error)
    urlError.value = 'Failed to add link'
  } finally {
    saving.value = false
  }
}

const removeLink = async (index: number) => {
  try {
    const updatedLinks = socialLinks.value.filter((_, i) => i !== index)
    await profileStore.updateProfile({
      social_links: updatedLinks,
    })
  } catch (error) {
    console.error('Error removing link:', error)
  }
}
</script>
```

### Step 3: Convert SocialLinksDisplay to Ionic

```vue
<template>
  <div v-if="socialLinks && socialLinks.length > 0">
    <h3>Social Links</h3>
    <ion-list>
      <ion-item
        v-for="(link, index) in socialLinks"
        :key="index"
        :href="link.url"
        target="_blank"
        button
      >
        <ion-icon
          :icon="getPlatformIcon(link.platform)"
          slot="start"
          :style="{ color: getPlatformColor(link.platform) }"
        />
        <ion-label>
          {{ link.label }}
        </ion-label>
        <ion-icon :icon="openOutline" slot="end" />
      </ion-item>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/vue'
import { openOutline } from 'ionicons/icons'
import { getPlatformConfig, type SocialLink } from '@/utils/socialPlatforms'

const props = defineProps<{
  socialLinks: SocialLink[]
}>()
</script>
```

---

## Validation & Error Handling

### Validation Rules (from web app)

1. **URL Format**: Must be valid URL with http:// or https://
2. **Supported Platform**: Must match one of 14 supported platforms
3. **Max Links**: Cannot exceed 3 links
4. **No Duplicates**: Same platform or URL cannot be added twice

### Error Messages
```typescript
// Invalid URL
'Please enter a valid URL from a supported platform'

// Platform not detected
'Unable to detect platform from URL'

// Duplicate
'This platform or URL is already added'

// Max reached
'Maximum 3 links reached'
```

---

## Testing Checklist

- [ ] Social links save to `profiles.social_links` JSONB column
- [ ] No queries to `user_social_links` table (doesn't exist)
- [ ] Platform auto-detection works for all 14 platforms
- [ ] URL validation prevents invalid links
- [ ] Duplicate detection works (same platform/URL)
- [ ] Max 3 links enforced
- [ ] Links display correctly on profile pages
- [ ] External links open in new tab/browser
- [ ] Platform icons and colors match web app
- [ ] Remove link functionality works
- [ ] Empty state shows when no links

---

## Common Mistakes to Avoid

❌ **WRONG**: Querying a separate table
```typescript
// DON'T DO THIS - No user_social_links table exists!
const { data } = await supabase
  .from('user_social_links')
  .select('*')
```

✅ **CORRECT**: Reading from profiles
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()

const socialLinks = data?.social_links || []
```

❌ **WRONG**: Separate state for social links
```typescript
const socialLinks = ref([])
```

✅ **CORRECT**: Computed from profile
```typescript
const socialLinks = computed(() => profileStore.profile?.social_links || [])
```

---

## Quick Reference

**Storage**: `profiles.social_links` (JSONB)  
**Max Links**: 3  
**Utility File**: `utils/socialPlatforms.ts`  
**Platforms**: 14 (Spotify, Apple Music, YouTube, Instagram, Twitter/X, TikTok, SoundCloud, Bandcamp, Amazon Music, Facebook, LinkedIn, Twitch, Patreon, Website)  
**Update**: `profileStore.updateProfile({ social_links: [...] })`  
**Access**: `profileStore.profile?.social_links || []`

