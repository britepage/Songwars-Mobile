# Account Page - Complete Implementation Guide

## Overview
This document provides **complete, production-ready code** for the SongWars Account page with exact implementation details for username read-only logic, admin-only features, role toggles, and pixel-perfect styling.

**Key Features**:
- Profile management (avatar, display name, username, bio)
- Username read-only once set
- Role toggle (Judge ↔ Artist)
- Social links management (artists only)
- Privacy, theme, and audio settings
- Admin-only "Manage Flags" link
- Account deletion

---

## 1. Component Overview

### Purpose
User account management page where users can:
- Edit profile information
- Upload avatar
- Toggle between Judge and Artist modes
- Manage social links (artists only)
- Configure privacy and audio settings
- Switch themes
- Delete account
- Access admin tools (admins only)

### Dependencies

```typescript
// Stores
import { useProfileStore } from '~/store/profileStore'
import { useAuthStore } from '~/store/authStore'
import { useSupabaseClient, useSupabaseUser } from '#imports'

// Components
import SocialLinksManager from '~/components/SocialLinksManager.vue'
import AccountDeletionModal from '~/components/AccountDeletionModal.vue'

// Router
import { useRouter } from 'vue-router'
```

### Layout Structure
```
┌────────────────────────────────────────┐
│ Header (Global - HeaderNavigation)     │
├────────────────────────────────────────┤
│ Profile Avatar (Centered)              │
│ Display Name                           │
│ "Profile" Button (if username exists)  │
├────────────────────────────────────────┤
│ Display Name Input                     │
│ Username Input (READ-ONLY once set) ⭐ │
│ Bio Textarea                           │
├────────────────────────────────────────┤
│ Privacy Settings Card                  │
│  ├─ Private ← Toggle → Public          │
│  └─ Description                        │
├────────────────────────────────────────┤
│ Theme Settings Card                    │
│  ├─ Light ← Toggle → Dark              │
│  └─ (Toggles across entire app)        │
├────────────────────────────────────────┤
│ Audio Settings Card                    │
│  ├─ Roulette Sound Toggle              │
│  └─ Confetti Sound Toggle              │
├────────────────────────────────────────┤
│ Account Type Card                      │
│  ├─ Judge ← Toggle → Artist            │
│  └─ "Artist Mode Active!" (if artist)  │
├────────────────────────────────────────┤
│ Social Links Card (Artists Only)       │
│  └─ Add/Remove Links (Max 3)           │
├────────────────────────────────────────┤
│ Save Profile Button                    │
│ Logout Button                          │
│ Manage Flags Link (Admins Only) ⭐     │
│ Delete Account Button (Danger)         │
├────────────────────────────────────────┤
│ Footer (Global - FooterNavigation)     │
└────────────────────────────────────────┘
```

---

## 2. Complete Template Code

### Full Template (Lines 1-314)

Due to length, here are the **critical sections**:

### Profile Header Section (Lines 8-51)
```vue
<div class="flex flex-col items-center space-y-6">
  <!-- Profile Picture - Centered and Clickable -->
  <div class="relative cursor-pointer group" @click="fileInput?.click()">
    <div class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-[#ffd200] shadow-lg transition-transform duration-200 group-hover:scale-105">
      <img
        v-if="avatarPreview || profileStore.profile?.avatar_url"
        :src="avatarPreview || profileStore.profile?.avatar_url"
        alt="Profile"
        class="w-full h-full object-cover"
      />
      <svg v-else class="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
    
    <!-- Edit overlay hint -->
    <div class="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
      <div class="bg-white/90 rounded-full p-2">
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </div>
    </div>
  </div>
  
  <!-- User Info - Under Profile Picture -->
  <div class="text-center flex flex-col items-center space-y-2">
    <h3 class="text-xl md:text-2xl font-semibold text-white theme-text-primary">
      {{ form.display_name || profileStore.profile?.display_name || 'User' }}
    </h3>
    <!-- Profile Button (if username exists) -->
    <button
      v-if="profileStore.profile?.username"
      @click="router.push(`/user/${profileStore.profile?.username}`)"
      class="bigbutton bigbutton-small"
    >
      Profile
    </button>
  </div>
</div>
```

### Username Field (Lines 67-80) ⭐ CRITICAL
```vue
<!-- Username -->
<div>
  <label class="block text-sm font-medium mb-2 text-white theme-text-primary">Username</label>
  <input
    type="text"
    v-model="form.username"
    placeholder="Choose username"
    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all theme-input-base"
    :class="isUsernameLocked ? 'opacity-60 cursor-not-allowed' : ''"
    :disabled="isUsernameLocked"
  />
  <p v-if="usernameError" class="mt-2 text-sm text-red-500">{{ usernameError }}</p>
  <p v-if="isUsernameLocked" class="mt-1 text-xs theme-text-muted">Username is set and cannot be changed.</p>
</div>
```

**Key Logic (Lines 386-390)**:
```typescript
// Lock username if one already exists in the stored profile
const isUsernameLocked = computed(() => {
  const existing = profileStore.profile?.username
  return !!existing && !!form.value.username && form.value.username === existing
})
```

**Behavior**:
- If profile has username → Field is disabled and shows message
- If no username yet → Field is editable
- Message: "Username is set and cannot be changed."
- Visual: Reduced opacity (`opacity-60`) and not-allowed cursor

### Account Type Toggle (Lines 211-246) ⭐
```vue
<!-- Role Toggle -->
<div class="rounded-2xl p-6 border border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold mb-6 flex items-center text-white theme-text-primary">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
    Account Type
  </h3>
  
  <div class="flex items-center justify-between mb-4">
    <span class="text-sm text-white theme-text-primary">Judge</span>
    
    <!-- Account Type Toggle Switch -->
    <div class="toggle-switch" @click="handleAccountTypeToggle">
      <input 
        type="checkbox" 
        class="toggle-input" 
        :checked="form.role === 'artist'"
        @change="handleAccountTypeChange"
        id="account-type-toggle"
      />
      <label for="account-type-toggle" class="toggle-label" @click="handleAccountTypeLabelClick"></label>
    </div>
    
    <span class="text-sm text-white theme-text-primary">Artist</span>
  </div>
  
  <p class="text-sm mt-2 text-gray-400 theme-text-secondary">
    Switch to Artist mode to unlock song upload features
  </p>
  <div v-if="form.role === 'artist'" class="mt-3 p-3 border rounded-lg bg-[#ffd200]/20 border-[#ffd200]/30 theme-artist-notification">
    <p class="text-sm text-[#ffd200] font-medium">
      🎵 Artist Mode Active! You can now upload and manage your songs.
    </p>
  </div>
</div>
```

**Toggle Logic (Lines 595-614)**:
```typescript
function handleAccountTypeToggle() {
  console.log('Account type toggle clicked!')
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  console.log('Switching role from', form.value.role, 'to', newRole)
  form.value.role = newRole
}

function handleAccountTypeChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newRole = target.checked ? 'artist' : 'user'
  console.log('Account type changed to:', newRole)
  form.value.role = newRole
}

function handleAccountTypeLabelClick() {
  console.log('Account type label clicked!')
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  console.log('Switching role from', form.value.role, 'to', newRole)
  form.value.role = newRole
}
```

**Note**: Role is stored as `'user'` (Judge) or `'artist'` in database, but displayed as "Judge" / "Artist" in UI.

### Manage Flags Link (Lines 272-280) ⭐
```vue
<!-- Admin Section -->
<div v-if="isAdmin" class="mt-4">
  <button
    @click="router.push('/admin/flags')"
    class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-link hover:text-gray-300"
  >
    Manage Flags
  </button>
</div>
```

**Admin Check Logic (Lines 406-418)**:
```typescript
// Check admin status
const checkAdmin = async () => {
  if (!user.value) {
    isAdmin.value = false
    return
  }
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.value.id)
    .maybeSingle()
  isAdmin.value = !!data
}
```

**Called In** (Lines 798-799, 820-826):
```typescript
// In onMounted
await checkAdmin()

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await checkAdmin()
  } else {
    isAdmin.value = false
  }
})
```

**Database Query**:
- Table: `admin_users`
- Check: User ID exists in table
- Returns: Boolean `isAdmin.value`

---

## 4. Critical Logic Requirements

### A. Username Read-Only Logic ⭐

**Computed Property** (Lines 386-390):
```typescript
const isUsernameLocked = computed(() => {
  const existing = profileStore.profile?.username
  return !!existing && !!form.value.username && form.value.username === existing
})
```

**Conditions for Locking**:
1. `profileStore.profile?.username` exists (user has set username before)
2. AND `form.value.username` exists (field is populated)
3. AND they match (user hasn't changed it in form)

**Template Usage** (Lines 70-79):
```vue
<input
  type="text"
  v-model="form.username"
  placeholder="Choose username"
  class="..."
  :class="isUsernameLocked ? 'opacity-60 cursor-not-allowed' : ''"
  :disabled="isUsernameLocked"
/>
<p v-if="usernameError" class="mt-2 text-sm text-red-500">{{ usernameError }}</p>
<p v-if="isUsernameLocked" class="mt-1 text-xs theme-text-muted">Username is set and cannot be changed.</p>
```

**Message**: **"Username is set and cannot be changed."**

**Styling When Locked**:
- `opacity-60` - Grayed out appearance
- `cursor-not-allowed` - Not-allowed cursor on hover
- `:disabled="true"` - Input disabled attribute
- Gray text color: `theme-text-muted`

**Username Error** (Lines 392-395):
```typescript
const usernameError = computed(() => {
  return profileStore.lastErrorCode === 'USERNAME_TAKEN' ? 'That username is taken. Please choose another.' : ''
})
```

### B. Manage Flags Link (Admin-Only) ⭐

**Conditional Display** (Line 273):
```vue
<div v-if="isAdmin" class="mt-4">
  <button @click="router.push('/admin/flags')" ...>
    Manage Flags
  </button>
</div>
```

**Admin Check Function** (Lines 406-418):
```typescript
const isAdmin = ref(false)

const checkAdmin = async () => {
  if (!user.value) {
    isAdmin.value = false
    return
  }
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.value.id)
    .maybeSingle()
  isAdmin.value = !!data
}
```

**When It's Called**:
1. In `onMounted()` after profile loads (line 799)
2. In `watch(user)` when user changes (lines 820-826)

**Database Table**: `admin_users`
- Contains user IDs of admin users
- Simple lookup: If user ID exists → admin
- Uses `.maybeSingle()` to avoid errors if not found

**Navigation Target**: `/admin/flags`

**Styling**:
```vue
class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-link hover:text-gray-300"
```
- Full width button
- White text with gray hover
- Positioned after Logout button, before Delete Account

### C. Account Type Toggle ⭐

**Role Values**:
- Database: `'user'` (Judge) or `'artist'` (Artist)
- UI Display: "Judge" or "Artist"

**Toggle State** (Line 228):
```vue
:checked="form.role === 'artist'"
```
- **Off** (left): Judge mode (`role: 'user'`)
- **On** (right): Artist mode (`role: 'artist'`)

**Toggle Handlers** (Lines 595-614):
```typescript
function handleAccountTypeToggle() {
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  form.value.role = newRole
}

function handleAccountTypeChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newRole = target.checked ? 'artist' : 'user'
  form.value.role = newRole
}

function handleAccountTypeLabelClick() {
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  form.value.role = newRole
}
```

**Artist Mode Notification** (Lines 241-245):
```vue
<div v-if="form.role === 'artist'" class="mt-3 p-3 border rounded-lg bg-[#ffd200]/20 border-[#ffd200]/30 theme-artist-notification">
  <p class="text-sm text-[#ffd200] font-medium">
    🎵 Artist Mode Active! You can now upload and manage your songs.
  </p>
</div>
```

**What Changes**:
- Footer navigation: Adds "Add Song" and "My Songs" tabs
- Social links section: Becomes visible
- Upload features: Unlocked on dashboard

---

## 5. Data Management

### Profile Fetching (Lines 714-803)

```typescript
onMounted(async () => {
  console.log('Profile page mounted, user:', user.value)
  
  // Set theme toggle checkbox state
  if (themeToggleRef.value) {
    const currentTheme = document.documentElement.getAttribute('data-theme')
    themeToggleRef.value.checked = currentTheme === 'dark'
  }
  
  if (user.value) {
    console.log('User authenticated, fetching profile for ID:', user.value.id)
    const { data: profile, error } = await profileStore.fetchProfile()
    console.log('Profile fetch result:', { profile, error })
    
    if (profile) {
      // Profile exists, load it
      form.value = { 
        ...profile,
        social_links: Array.isArray(profile.social_links) ? profile.social_links : []
      }
      avatarPreview.value = profile.avatar_url || ''
      selectedGenres.value = profile.musical_preferences
        ? profile.musical_preferences.split(',').map((g: string) => g.trim()).filter(Boolean)
        : []
    } else {
      // No profile exists, create a default one
      const baseUsername = user.value.email?.split('@')[0] || 'user'
      const timestamp = Date.now().toString().slice(-4)
      const username = `${baseUsername}${timestamp}`
      
      const defaultProfile = {
        id: user.value.id,
        username: username,
        display_name: user.value.email?.split('@')[0] || 'New User',
        bio: '',
        avatar_url: '',
        musical_preferences: '',
        region: '',
        age_range: '',
        role: 'user',
        is_public: true,
        roulette_sound_enabled: true,
        confetti_sound_enabled: true,
        social_links: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const createdProfile = await profileStore.updateProfile(defaultProfile)
      
      if (createdProfile) {
        form.value = { ...createdProfile }
        selectedGenres.value = []
      }
    }
    
    // Check admin status
    await checkAdmin()
  }
})
```

**Flow**:
1. Fetch profile from profileStore
2. If exists → Load into form
3. If doesn't exist → Create default profile with auto-generated username
4. Check admin status
5. Set theme toggle state

### Form State (Lines 337-371)

```typescript
interface ProfileForm {
  username: string | null;
  display_name: string | null;
  website?: string | null;
  bio: string | null;
  avatar_url: string | null;
  musical_preferences: string | null;
  region: string | null;
  age_range: string | null;
  role: string;
  is_public: boolean;
  roulette_sound_enabled: boolean;
  confetti_sound_enabled: boolean;
  social_links: any[];
  created_at: string;
  updated_at: string;
}

const form = ref<ProfileForm>({
  username: '',
  display_name: '',
  website: '',
  bio: '',
  avatar_url: '',
  musical_preferences: '',
  region: '',
  age_range: '',
  role: 'user',
  is_public: true,
  roulette_sound_enabled: true,
  confetti_sound_enabled: true,
  social_links: [],
  created_at: '',
  updated_at: ''
})
```

### Save Profile (Lines 672-712)

```typescript
async function saveProfile() {
  if (!canSave.value) return
  
  isSaving.value = true
  try {
    // Upload avatar if a new file was selected
    if (avatarFile.value) {
      const avatarUrl = await uploadAvatar()
      if (avatarUrl) {
        form.value.avatar_url = avatarUrl
      }
    }
    
    // Update profile
    form.value.musical_preferences = selectedGenres.value.join(',')
    
    const updatedProfile = await profileStore.updateProfile(form.value)
    if (updatedProfile) {
      // Clear the avatar file since it's now uploaded
      avatarFile.value = null
      
      // Redirect to dashboard after successful save
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}
```

### Avatar Upload (Lines 455-487)

```typescript
async function uploadAvatar() {
  if (!avatarFile.value || !user.value) return null
  
  try {
    // Create a unique filename
    const fileExt = avatarFile.value.name.split('.').pop()
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile.value)
    
    if (error) {
      console.error('Avatar upload error:', error)
      return null
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return urlData.publicUrl
    
  } catch (error) {
    console.error('Avatar upload failed:', error)
    return null
  }
}
```

---

## 6. Styling Specifications

### Card Styling

**Settings Cards** (Privacy, Theme, Audio, Account Type):
```vue
class="rounded-2xl p-6 border border-gray-700 bg-gray-800 theme-bg-card theme-border-card"
```

**Breakdown**:
```css
rounded-2xl           /* 16px border radius */
p-6                   /* 24px padding */
border                /* 1px border */
border-gray-700       /* #374151 border (overridden by theme) */
bg-gray-800           /* #1f2937 background (overridden by theme) */
theme-bg-card         /* Theme-aware background */
theme-border-card     /* Theme-aware border */
```

**Theme-Aware Behavior** (from main.css):
```css
.theme-bg-card {
  background-color: var(--card-bg);
}
[data-theme="light"] .theme-bg-card {
  background-color: #ffffff;
}
[data-theme="dark"] .theme-bg-card {
  background-color: #1f2937; /* gray-800 */
}
```

### Toggle Switch Styling (Lines 929-989)

**Complete Toggle CSS**:
```css
/* Real Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
  margin: 10px;
}

.toggle-switch .toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
  z-index: -1;
}

.toggle-switch .toggle-label {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 24px;
  background-color: #6b7280; /* gray-500 for light mode */
  border-radius: 34px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 1;
}

.toggle-switch .toggle-label::before {
  content: "";
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  background-color: #fff;
  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s;
}

/* Active (ON) state - yellow background */
.toggle-switch .toggle-input:checked + .toggle-label {
  background-color: #ffd200; /* SongWars yellow */
}

.toggle-switch .toggle-input:checked + .toggle-label::before {
  transform: translateX(16px); /* Slide to right */
}

/* Inactive (OFF) state - gray background */
.toggle-switch .toggle-input:not(:checked) + .toggle-label {
  background-color: #6b7280; /* gray-500 */
}

.toggle-switch .toggle-input:not(:checked) + .toggle-label::before {
  transform: translateX(2px); /* Stay at left */
}
```

**Toggle Dimensions**:
- **Track**: 40px × 24px
- **Slider**: 20px × 20px circle
- **Slide distance**: 16px (from left to right)

**Colors**:
- **Off**: `#6b7280` (gray-500) track, white slider
- **On**: `#ffd200` (yellow) track, white slider

### Input Styling

**All Text Inputs**:
```vue
class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all theme-input-base"
```

**Breakdown**:
```css
w-full                       /* 100% width */
px-4                         /* 16px horizontal padding */
py-3                         /* 12px vertical padding */
border                       /* 1px border */
rounded-lg                   /* 8px border radius */
focus:outline-none           /* Remove default outline */
focus:ring-2                 /* 2px focus ring */
focus:ring-[#ffd200]         /* Yellow focus ring */
focus:border-transparent     /* Hide border on focus */
transition-all               /* Smooth transitions */
theme-input-base             /* Theme-aware background/text */
```

**Theme-Aware Behavior** (from main.css lines 434-447):
```css
.theme-input-base {
  background-color: var(--card-bg) !important;
  border-color: var(--card-border) !important;
  color: var(--text-primary) !important;
}
[data-theme="dark"] .theme-input-base {
  background-color: #1f2937 !important; /* gray-800 */
  border-color: #4b5563 !important; /* gray-600 */
  color: #ffffff !important;
}
```

### Button Styling

**Save Profile Button** (Lines 255-262):
```vue
<button
  @click="saveProfile"
  :disabled="isSaving"
  class="bigbutton bigbutton-medium w-full"
  :class="{ 'saving-state': isSaving }"
>
  {{ isSaving ? 'Saving...' : 'Save Profile' }}
</button>
```

**Saving State CSS** (Lines 907-916):
```css
.saving-state {
  background: #3b82f6 !important;  /* Blue background */
  color: white !important;
}

.saving-state:hover {
  top: 0;
  left: 0;
  box-shadow: 3px 3px 0 #000;  /* No hover effect when saving */
}
```

**Logout Button** (Lines 265-270):
```vue
<button
  @click="handleLogout"
  class="w-full px-4 py-3 transition-colors font-medium mt-4 text-white theme-button-link hover:text-red-400"
>
  Logout
</button>
```

**Delete Account Button** (Lines 287-293):
```vue
<button
  @click="showDeleteModal = true"
  class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-danger"
>
  Delete My Account
</button>
```

**Button Theme Classes** (from main.css):
```css
.theme-button-link {
  color: var(--text-secondary);
}
.theme-button-link:hover {
  color: var(--text-primary);
}

.theme-button-danger {
  color: var(--text-secondary);
}
.theme-button-danger:hover {
  color: #ef4444; /* red-500 */
}
```

---

## 7. Social Links Section

### Integration (Lines 248-252)

```vue
<!-- Social Links Section (Artists Only) -->
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

**Conditional Display**:
- Only visible when `form.role === 'artist'`
- Uses v-model for two-way binding
- Component from `components/SocialLinksManager.vue`

**Complete Implementation**: See `SOCIAL_LINKS_IMPLEMENTATION.md`

**Key Features**:
- Add up to 3 social media links
- Platform auto-detection
- Validation and duplicate checking
- Stored in `profile.social_links` JSONB array

---

## 8. Settings Sections

### Privacy Toggle (Lines 93-123)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" ...><!-- Lock icon --></svg>
    Privacy
  </h3>
  
  <div class="flex items-center justify-between mb-4">
    <span class="text-sm theme-text-primary">Private Profile</span>
    
    <div class="toggle-switch" @click="handlePrivacyToggle">
      <input 
        type="checkbox" 
        class="toggle-input" 
        :checked="form.is_public"
        @change="handlePrivacyChange"
        id="privacy-toggle"
      />
      <label for="privacy-toggle" class="toggle-label" @click="handlePrivacyLabelClick"></label>
    </div>
    
    <span class="text-sm theme-text-primary">Public Profile</span>
  </div>
  
  <p class="text-sm mt-2 theme-text-secondary">
    {{ form.is_public ? 'Your profile is visible to everyone' : 'Your profile is only visible to you' }}
  </p>
</div>
```

**State**:
- **Off** (Private): `is_public: false`
- **On** (Public): `is_public: true`

**Handlers** (Lines 616-632):
```typescript
function handlePrivacyToggle() {
  form.value.is_public = !form.value.is_public
}

function handlePrivacyChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.is_public = target.checked
}

function handlePrivacyLabelClick() {
  form.value.is_public = !form.value.is_public
}
```

### Theme Toggle (Lines 125-151)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" ...><!-- Moon icon --></svg>
    Theme
  </h3>
  
  <div class="flex items-center justify-between">
    <span class="text-sm theme-text-primary">Light Mode</span>
    
    <div class="toggle-switch" @click="handleToggleClick">
      <input 
        type="checkbox" 
        class="toggle-input" 
        ref="themeToggleRef"
        @change="handleToggleChange"
        id="theme-toggle"
      />
      <label for="theme-toggle" class="toggle-label" @click="handleLabelClick"></label>
    </div>
    
    <span class="text-sm theme-text-primary">Dark Mode</span>
  </div>
</div>
```

**State**:
- **Off** (Light): `data-theme="light"`
- **On** (Dark): `data-theme="dark"`

**Handler** (Lines 498-522):
```typescript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  // Disable transitions briefly
  document.documentElement.classList.add('no-transitions')

  // Update DOM immediately
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  document.documentElement.classList.toggle('light', newTheme === 'light')
  
  // Update checkbox state
  if (themeToggleRef.value) {
    themeToggleRef.value.checked = newTheme === 'dark'
  }
  
  // Update localStorage
  localStorage.setItem('songwars-theme', newTheme)
  localStorage.setItem('songwars-theme-system', 'false')

  setTimeout(() => {
    document.documentElement.classList.remove('no-transitions')
  }, 60)
}
```

**Mobile Modification**: Use `Capacitor.Preferences` instead of `localStorage`

### Audio Settings (Lines 153-209)

**Roulette Sound Toggle**:
```vue
<div class="flex items-center justify-between mb-4">
  <span class="text-sm theme-text-primary">Roulette Sound</span>
  
  <div class="toggle-switch" @click="handleRouletteSoundToggle">
    <input 
      type="checkbox" 
      class="toggle-input" 
      :checked="form.roulette_sound_enabled"
      @change="handleRouletteSoundChange"
      id="roulette-sound-toggle"
    />
    <label for="roulette-sound-toggle" class="toggle-label" @click="handleRouletteSoundLabelClick"></label>
  </div>
  
  <span class="text-sm theme-text-primary">
    {{ form.roulette_sound_enabled ? 'On' : 'Off' }}
  </span>
</div>

<p class="text-sm mb-4 theme-text-secondary">
  Play sound when the roulette wheel spins during battles
</p>
```

**Confetti Sound Toggle**:
```vue
<div class="flex items-center justify-between mb-4">
  <span class="text-sm theme-text-primary">Confetti Sound</span>
  
  <div class="toggle-switch" @click="handleConfettiSoundToggle">
    <input 
      type="checkbox" 
      class="toggle-input" 
      :checked="form.confetti_sound_enabled"
      @change="handleConfettiSoundChange"
      id="confetti-sound-toggle"
    />
    <label for="confetti-sound-toggle" class="toggle-label" @click="handleConfettiSoundLabelClick"></label>
  </div>
  
  <span class="text-sm theme-text-primary">
    {{ form.confetti_sound_enabled ? 'On' : 'Off' }}
  </span>
</div>

<p class="text-sm theme-text-secondary">
  Play sound when you vote in battles
</p>
```

**Handlers** (Lines 634-669): Similar pattern to other toggles

---

## 10. Role-Based Features Summary

### Features Matrix

| Feature | All Users | Artists Only | Admins Only |
|---------|-----------|--------------|-------------|
| **Profile editing** | ✅ | ✅ | ✅ |
| **Avatar upload** | ✅ | ✅ | ✅ |
| **Username** | ✅ (read-only once set) | ✅ (read-only once set) | ✅ |
| **Display name** | ✅ | ✅ | ✅ |
| **Bio** | ✅ | ✅ | ✅ |
| **Privacy toggle** | ✅ | ✅ | ✅ |
| **Theme toggle** | ✅ | ✅ | ✅ |
| **Audio settings** | ✅ | ✅ | ✅ |
| **Account type toggle** | ✅ | ✅ | ✅ |
| **Social links** | ❌ | ✅ | ✅ |
| **Manage Flags link** | ❌ | ❌ | ✅ |
| **Delete account** | ✅ | ✅ | ✅ |

### Conditional Rendering Code

**Social Links** (Line 249-252):
```vue
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

**Manage Flags** (Lines 273):
```vue
<div v-if="isAdmin" class="mt-4">
  <button @click="router.push('/admin/flags')">
    Manage Flags
  </button>
</div>
```

**Artist Mode Notification** (Line 241):
```vue
<div v-if="form.role === 'artist'" class="...theme-artist-notification">
  <p class="text-sm text-[#ffd200] font-medium">
    🎵 Artist Mode Active! You can now upload and manage your songs.
  </p>
</div>
```

---

## 11. Mobile Ionic Conversion

### Page Structure

**Mobile Template**:
```vue
<template>
  <ion-page>
    <!-- NO ion-header - using global HeaderNavigation -->
    
    <ion-content class="ion-no-padding">
      <div class="pt-16 pb-20">  <!-- Padding for header/footer -->
        <div class="max-w-6xl mx-auto p-4 md:p-6">
          
          <!-- Profile Section -->
          <div class="flex flex-col items-center space-y-6">
            <!-- Avatar, Name, Username Button -->
            <!-- (Same as web app) -->
          </div>
          
          <!-- Profile Form -->
          <div class="w-full max-w-md space-y-6 mx-auto">
            <!-- Display Name Input -->
            <!-- Username Input (READ-ONLY logic) -->
            <!-- Bio Textarea -->
            
            <!-- Settings Cards -->
            <!-- Social Links (Artists) -->
            
            <!-- Buttons -->
            <!-- Manage Flags (Admins) -->
          </div>
        </div>
      </div>
    </ion-content>
    
    <!-- Account Deletion Modal -->
    <AccountDeletionModal 
      :show-modal="showDeleteModal"
      @close="showDeleteModal = false"
    />
    
    <!-- Hidden File Input -->
    <input
      type="file"
      @change="handleFileChange"
      accept="image/*"
      ref="fileInput"
      class="hidden"
    />
  </ion-page>
</template>
```

### Key Conversions

**Inputs**: Keep as `<input>` (NOT `<ion-input>`)
```vue
<!-- ✅ Use standard inputs with Tailwind -->
<input type="text" v-model="form.display_name" class="theme-input-base" />
```

**Textarea**: Keep as `<textarea>` (NOT `<ion-textarea>`)
```vue
<!-- ✅ Use standard textarea -->
<textarea v-model="form.bio" class="theme-input-base" rows="3"></textarea>
```

**Buttons**: Use standard `<button>` with `.bigbutton` classes
```vue
<!-- ✅ Custom retro buttons -->
<button class="bigbutton bigbutton-medium w-full" @click="saveProfile">
  Save Profile
</button>
```

**Layout**: Use Tailwind flexbox (NOT Ionic grid)
```vue
<!-- ✅ Tailwind flexbox -->
<div class="flex flex-col items-center space-y-6">
```

### Mobile-Specific Adjustments

**1. File Picker** (instead of click on avatar):
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

async function selectAvatar() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos  // Or CameraSource.Camera
    });

    // Convert to blob and upload
    const response = await fetch(image.webPath);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
    
    avatarFile.value = file;
    avatarPreview.value = image.webPath;
  } catch (error) {
    console.error('Error selecting image:', error);
  }
}
```

**2. Theme Storage** (use Capacitor):
```typescript
import { Preferences } from '@capacitor/preferences';

// Save theme
await Preferences.set({ key: 'songwars-theme', value: newTheme });

// Load theme
const { value } = await Preferences.get({ key: 'songwars-theme' });
```

**3. Admin Check** (same database query):
```typescript
const { data } = await supabase
  .from('admin_users')
  .select('id')
  .eq('id', user.value.id)
  .maybeSingle()
isAdmin.value = !!data
```

---

## 12. Testing Checklist

### Username Logic
- [ ] Username field editable for new users
- [ ] Username field disabled once set
- [ ] Shows "Username is set and cannot be changed." message
- [ ] Field has reduced opacity when locked
- [ ] Cursor shows not-allowed icon
- [ ] Username error displays if taken

### Admin Features
- [ ] Manage Flags link hidden for non-admins
- [ ] Manage Flags link visible for admin users
- [ ] Link navigates to `/admin/flags`
- [ ] Admin status checked on mount
- [ ] Admin status updates when user changes

### Role Toggle
- [ ] Toggle switches between Judge and Artist
- [ ] Database stores as 'user' vs 'artist'
- [ ] UI shows "Judge" vs "Artist"
- [ ] "Artist Mode Active!" message shows for artists
- [ ] Social links appear/disappear with role change
- [ ] Footer navigation updates with role change

### Social Links
- [ ] Only visible for artists
- [ ] Can add up to 3 links
- [ ] Shows "max 3 links" message when full
- [ ] Platform auto-detection works
- [ ] Links saved to `profile.social_links` JSONB

### Settings Toggles
- [ ] Privacy toggle works (private ↔ public)
- [ ] Theme toggle works (light ↔ dark)
- [ ] Theme persists to storage
- [ ] Roulette sound toggle works
- [ ] Confetti sound toggle works
- [ ] All toggles save to profile

### Visual Parity
- [ ] Card styling matches web app
- [ ] Toggle switches match (40px × 24px)
- [ ] Toggle colors match (gray-500 off, yellow on)
- [ ] Input styling matches web app
- [ ] Button styling matches web app
- [ ] Spacing and padding match
- [ ] Theme-aware colors work

### Functionality
- [ ] Avatar upload works (native file picker)
- [ ] Save profile button works
- [ ] Logout button works
- [ ] Delete account opens modal
- [ ] Profile button navigates to public profile
- [ ] All inputs save correctly
- [ ] Redirect to dashboard after save

---

## 13. Quick Reference

### Critical Logic

**Username Read-Only**:
```typescript
const isUsernameLocked = computed(() => {
  const existing = profileStore.profile?.username
  return !!existing && !!form.value.username && form.value.username === existing
})
```
Message: "Username is set and cannot be changed."

**Admin Check**:
```typescript
const { data } = await supabase
  .from('admin_users')
  .select('id')
  .eq('id', user.value.id)
  .maybeSingle()
isAdmin.value = !!data
```

**Role Toggle**:
```typescript
const newRole = form.value.role === 'artist' ? 'user' : 'artist'
form.value.role = newRole
```

### Key Colors

```css
Yellow (primary): #ffd200
Toggle on: #ffd200 (yellow)
Toggle off: #6b7280 (gray-500)
Focus ring: #ffd200
Saving button: #3b82f6 (blue)
Error text: #ef4444 (red-500)
```

### Toggle Dimensions

```css
Track: 40px × 24px
Slider: 20px × 20px
Slide distance: 16px
```

---

**Summary**: The Account page uses standard HTML inputs with Tailwind styling (NO Ionic form components). Username becomes read-only once set, Manage Flags link is admin-only, and role toggle controls access to artist features (social links, upload).

