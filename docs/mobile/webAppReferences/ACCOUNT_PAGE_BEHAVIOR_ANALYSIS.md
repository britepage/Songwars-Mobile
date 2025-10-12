# Account Page Behavior Analysis - Complete Q&A

## Overview
This document provides **exact behavioral specifications** for every interaction on the Account page, based on analysis of the production web app code. Use this to replicate the exact user experience in the mobile app.

---

## SECTION 1: Toggle Switch Behaviors

### 1A. Privacy Toggle (`is_public` field)

**What happens immediately when user clicks the toggle?**
- ✅ **Visual state changes** (toggle animates)
- ✅ **Form state updates only** (`form.value.is_public` changes)
- ❌ API call does NOT fire immediately
- ❌ No loading indicator

**Code Evidence** (Lines 616-632):
```typescript
function handlePrivacyToggle() {
  console.log('Privacy toggle clicked!')
  form.value.is_public = !form.value.is_public  // ← Only updates form state
  console.log('Privacy setting updated to:', form.value.is_public)
}

function handlePrivacyChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.is_public = target.checked  // ← Only updates form state
  console.log('Privacy changed to:', form.value.is_public)
}
```

**When does the database update occur?**
- ✅ **Only when "Save Profile" button is clicked**
- ❌ NOT immediately on toggle click

**Code Evidence** (Lines 672-712):
```typescript
async function saveProfile() {
  // ... avatar upload logic ...
  
  const updatedProfile = await profileStore.updateProfile(form.value)  // ← Saves ALL form fields
  if (updatedProfile) {
    router.push('/dashboard')
  }
}
```

**Does the toggle show any loading/saving indicator?**
- ❌ No - it's instant form state update only

**Can the user navigate away without saving?**
- ✅ **Yes** - no unsaved changes warning
- Changes are lost if not saved

**Unsaved changes warning?**
- ❌ No warning system implemented

---

### 1B. Theme Toggle (Light/Dark mode)

**What happens immediately when user clicks the toggle?**
- ✅ **Visual theme changes immediately** (entire app theme switches)
- ✅ **Saved to localStorage immediately**
- ✅ **DOM updated immediately**
- ❌ Form state does NOT update (theme not in form)
- ❌ API call does NOT fire

**Code Evidence** (Lines 498-522):
```typescript
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  // Update DOM immediately
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  document.documentElement.classList.toggle('light', newTheme === 'light')
  
  // Update checkbox state
  if (themeToggleRef.value) {
    themeToggleRef.value.checked = newTheme === 'dark'
  }
  
  // Update localStorage IMMEDIATELY
  localStorage.setItem('songwars-theme', newTheme)
  localStorage.setItem('songwars-theme-system', 'false')
}
```

**Is the theme preference stored in:**
- ❌ Database (profiles table) - NO theme field
- ✅ **localStorage/Preferences only**
- ❌ NOT in database at all

**Does clicking "Save Profile" affect the theme toggle?**
- ❌ **No** - theme is completely independent of profile save
- Theme saves immediately to localStorage, not to database

**Key Difference**: Theme toggle is the ONLY toggle that saves immediately. All other toggles wait for "Save Profile".

---

### 1C. Audio Toggle - Roulette Sound (`roulette_sound_enabled`)

**What happens immediately when user clicks the toggle?**
- ✅ **Visual state changes** (toggle animates)
- ✅ **Form state updates only** (`form.value.roulette_sound_enabled` changes)
- ❌ API call does NOT fire immediately
- ❌ NOT saved to localStorage/Preferences
- ❌ No loading indicator

**Code Evidence** (Lines 635-651):
```typescript
function handleRouletteSoundToggle() {
  console.log('Roulette sound toggle clicked!')
  form.value.roulette_sound_enabled = !form.value.roulette_sound_enabled  // ← Only form state
  console.log('Roulette sound setting updated to:', form.value.roulette_sound_enabled)
}

function handleRouletteSoundChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.roulette_sound_enabled = target.checked  // ← Only form state
  console.log('Roulette sound changed to:', form.value.roulette_sound_enabled)
}
```

**When does the database update occur?**
- ✅ **Only when "Save Profile" button is clicked**
- Saved as part of the full profile update

**Is there any preview/test sound when toggling?**
- ❌ No - just updates form state

**Does the toggle show any loading/saving indicator?**
- ❌ No

---

### 1D. Audio Toggle - Confetti Sound (`confetti_sound_enabled`)

**Behavior identical to Roulette Sound?**
- ✅ **Yes** - exact same pattern

**Code Evidence** (Lines 653-669):
```typescript
function handleConfettiSoundToggle() {
  console.log('Confetti sound toggle clicked!')
  form.value.confetti_sound_enabled = !form.value.confetti_sound_enabled  // ← Only form state
  console.log('Confetti sound setting updated to:', form.value.confetti_sound_enabled)
}

function handleConfettiSoundChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.confetti_sound_enabled = target.checked  // ← Only form state
  console.log('Confetti sound changed to:', form.value.confetti_sound_enabled)
}
```

**Same timing**:
- ✅ Form state only
- ✅ Saves on "Save Profile" button
- ❌ No immediate database save

---

### 1E. Account Type Toggle (Judge ↔ Artist, `role` field)

**What happens immediately when user clicks the toggle?**
- ✅ **Visual state changes** (toggle animates)
- ✅ **Form state updates** (`form.value.role` changes)
- ✅ **Social Links section appears/disappears immediately** (reactive)
- ✅ **"Artist Mode Active!" notification appears immediately**
- ❌ API call does NOT fire immediately
- ❌ No loading indicator

**Code Evidence** (Lines 595-614):
```typescript
function handleAccountTypeToggle() {
  console.log('Account type toggle clicked!')
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'  // ← Immediate update
  console.log('Switching role from', form.value.role, 'to', newRole)
  form.value.role = newRole
}
```

**Template Reactivity** (Lines 241-252):
```vue
<!-- Notification appears immediately when form.role === 'artist' -->
<div v-if="form.role === 'artist'" class="...">
  <p>🎵 Artist Mode Active! You can now upload and manage your songs.</p>
</div>

<!-- Social links appear immediately when form.role === 'artist' -->
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

**When does the database update occur?**
- ✅ **Only when "Save Profile" button is clicked**

**After toggling to Artist:**
- ✅ **Social Links section appears immediately** (no save required)
- ❌ Does NOT require page refresh
- UI is fully reactive to `form.role` changes

**Does the toggle show any loading/saving indicator?**
- ❌ No

**Is there a confirmation dialog?**
- ❌ No confirmation required

---

### Toggle Summary Table

| Toggle | Immediate Effect | Database Save | Storage | UI Reactive |
|--------|------------------|---------------|---------|-------------|
| **Privacy** | Form state only | On "Save Profile" | No | Yes |
| **Theme** | DOM + localStorage | Never (not in DB) | Immediately | Yes |
| **Roulette Sound** | Form state only | On "Save Profile" | No | Yes |
| **Confetti Sound** | Form state only | On "Save Profile" | No | Yes |
| **Account Type** | Form state only | On "Save Profile" | No | Yes (shows/hides sections) |

**Key Pattern**: All toggles (except Theme) update form state immediately, save to database only when "Save Profile" is clicked.

---

## SECTION 2: "Save Profile" Button Behavior

### 2A. When is the button enabled/disabled?

**Computed Property** (Lines 382-384):
```typescript
const canSave = computed(() => {
  return form.value.username && form.value.display_name
})
```

**Enable Conditions**:
- ✅ **Enabled when** `username` AND `display_name` both exist
- ❌ NOT dirty tracking (doesn't check if form changed)
- ✅ **Disabled while saving** (`isSaving.value === true`)

**Button Template** (Lines 255-262):
```vue
<button
  @click="saveProfile"
  :disabled="isSaving"  <!-- Disabled during save -->
  class="bigbutton bigbutton-medium w-full"
  :class="{ 'saving-state': isSaving }"
>
  {{ isSaving ? 'Saving...' : 'Save Profile' }}
</button>
```

### 2B. What fields are included in the save payload?

**Code Evidence** (Lines 692-695):
```typescript
// Update profile logic
form.value.musical_preferences = selectedGenres.value.join(',')

const updatedProfile = await profileStore.updateProfile(form.value)  // ← Sends ENTIRE form object
```

**From profileStore.updateProfile()** (store/profileStore.ts lines 69-118):
```typescript
async function updateProfile(newProfile: any) {
  // Remove fields not present in schema
  const { website, ...sanitized } = newProfile || {} as any;

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...sanitized, id: user.value.id })  // ← ALL fields sent
    .eq('id', user.value.id)
    .select()
    .single();
}
```

**Answer**:
- ✅ **ALL form fields are sent** (even unchanged ones)
- ❌ NOT dirty tracking - sends entire form object

**Complete Payload** (from form interface lines 337-353):
```typescript
{
  username: string,
  display_name: string,
  bio: string,
  avatar_url: string,
  musical_preferences: string,
  region: string,
  age_range: string,
  role: string,              // 'user' or 'artist'
  is_public: boolean,
  roulette_sound_enabled: boolean,
  confetti_sound_enabled: boolean,
  social_links: any[],      // JSONB array
  created_at: string,
  updated_at: string
}
```

### 2C. Fields EXCLUDED from save payload

**Code Evidence** (profileStore.ts line 81):
```typescript
const { website, ...sanitized } = newProfile || {} as any;
```

**Excluded Fields**:
- ✅ `website` - explicitly removed (not in schema)
- ❌ `id` - NOT excluded, but added by profileStore (line 85)
- ❌ `created_at` - Sent but database ignores (has DEFAULT)
- ❌ `updated_at` - Sent but database ignores (has DEFAULT)

**Answer**:
- ✅ Only `website` is explicitly excluded
- Other fields sent but may be ignored by database

### 2D. Save button click behavior

**Button shows** (Lines 255-262):
- ✅ **"Saving..." text** when `isSaving === true`
- ❌ No separate loading spinner (just text)
- ✅ **Disabled state** (`:disabled="isSaving"`)
- ✅ **Blue background color** (`.saving-state` class)

**Code Evidence** (Lines 907-916):
```css
.saving-state {
  background: #3b82f6 !important;  /* Blue */
  color: white !important;
}

.saving-state:hover {
  top: 0;
  left: 0;
  box-shadow: 3px 3px 0 #000;  /* No hover animation */
}
```

**On successful save** (Lines 695-711):
- ✅ **Redirects to Dashboard** (`router.push('/dashboard')`)
- ❌ Does NOT stay on Account page
- ❌ No success toast/message (just redirects)
- ✅ Button state resets (in finally block)

**On error**:
- ✅ **Button returns to normal state** (in finally block)
- ❌ No specific error message display in Account page
- Error would appear from profileStore if any

**Complete Flow** (Lines 672-712):
```typescript
async function saveProfile() {
  if (!canSave.value) return
  
  isSaving.value = true  // ← Button becomes blue, shows "Saving..."
  try {
    // Upload avatar if new file selected
    if (avatarFile.value) {
      const avatarUrl = await uploadAvatar()
      if (avatarUrl) {
        form.value.avatar_url = avatarUrl
      }
    }
    
    // Prepare profile data
    form.value.musical_preferences = selectedGenres.value.join(',')
    
    // Save to database
    const updatedProfile = await profileStore.updateProfile(form.value)
    if (updatedProfile) {
      avatarFile.value = null
      router.push('/dashboard')  // ← Redirects on success
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    // No user-facing error message shown
  } finally {
    isSaving.value = false  // ← Always reset button state
  }
}
```

---

## SECTION 3: Input Fields Layout & Behavior

### 3A. Display Name Input (Lines 56-65)

**Is it wrapped in a card container?**
- ❌ **No** - just label and input directly
- Part of the larger form, not in individual cards

**Structure**:
```vue
<div>
  <label class="block text-sm font-medium mb-2 text-white theme-text-primary">Display Name</label>
  <input
    type="text"
    v-model="form.display_name"
    placeholder="Enter display name"
    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all theme-input-base"
  />
</div>
```

**Layout**:
- Label above input
- No card wrapper
- Full width input
- Standard input styling

### 3B. Username Input (Lines 67-80)

**Same card structure as Display Name?**
- ✅ **Yes** - identical structure (label + input, no card)

**When is it read-only/disabled?**
- ✅ **After it's set once** (on first save)
- Condition: `isUsernameLocked === true`

**Code Evidence** (Lines 386-390):
```typescript
const isUsernameLocked = computed(() => {
  const existing = profileStore.profile?.username
  return !!existing && !!form.value.username && form.value.username === existing
})
```

**Locking Conditions**:
1. Profile has a username (`profileStore.profile?.username` exists)
2. AND form has a username (`form.value.username` exists)
3. AND they match (hasn't been changed in form)

**Visual indication when locked** (Lines 75-79):
```vue
<input
  :class="isUsernameLocked ? 'opacity-60 cursor-not-allowed' : ''"
  :disabled="isUsernameLocked"
/>
<p v-if="isUsernameLocked" class="mt-1 text-xs theme-text-muted">
  Username is set and cannot be changed.
</p>
```

- ✅ **Disabled/grayed out input** (`opacity-60`)
- ✅ **Read-only styling** (reduced opacity)
- ✅ **Helper text**: "Username is set and cannot be changed."
- ✅ **Disabled attribute** (`:disabled="true"`)
- ✅ **Not-allowed cursor** (`cursor-not-allowed`)

### 3C. Bio Textarea (Lines 82-91)

**Same card structure as Display Name and Username?**
- ✅ **Yes** - label + textarea, no card wrapper

**Structure**:
```vue
<div>
  <label class="block text-sm font-medium mb-2 text-white theme-text-primary">Bio</label>
  <textarea
    v-model="form.bio"
    placeholder="Tell us about yourself..."
    rows="3"
    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all resize-none theme-input-base"
  ></textarea>
</div>
```

**Any character limit displayed?**
- ❌ No character limit or counter shown

**Auto-resize as user types?**
- ❌ No - fixed at 3 rows (`rows="3"`)
- `resize-none` class prevents manual resizing

### 3D. Other Profile Inputs

**Are region, age_range, musical_preferences visible on the Account page?**
- ❌ **Not visible on web app Account page**
- They exist in form state (lines 355-371) but no input fields in template
- Likely legacy fields or for future features

**Summary**: Only Display Name, Username, and Bio have input fields. All other profile fields are hidden or unused.

---

## SECTION 4: Social Links Section (Artists Only)

### 4A. When is this section visible?

**Code Evidence** (Lines 248-252):
```vue
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

**Visibility Timing**:
- ✅ **Only when `role === 'artist'`**
- ✅ **Immediately after toggling to Artist** (reactive)
- ❌ Does NOT require saving role change first
- ❌ Does NOT require page refresh

**Sequence**:
1. User clicks Account Type toggle
2. `form.value.role` changes to `'artist'`
3. `v-if="form.role === 'artist'"` becomes true
4. Social Links section appears instantly
5. User can add links immediately
6. Must click "Save Profile" to persist role AND links

### 4B. Add Link Interface - EXACT Layout

**From SocialLinksManager.vue** (lines 57-75):
```vue
<div v-if="socialLinks.length < 3" class="mt-6">
  <div class="flex space-x-3">
    <div class="flex-1">
      <input
        v-model="newLinkUrl"
        type="url"
        placeholder="https://open.spotify.com/artist/..."
        class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all bg-gray-700 border-gray-600 text-white placeholder-gray-400 theme-input"
        @keyup.enter="addLink"
      />
    </div>
    <button
      @click="addLink"
      :disabled="!newLinkUrl.trim() || isAddingLink"
      class="px-6 py-3 bg-[#ffd200] text-black rounded-lg font-medium hover:bg-[#ffd200]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {{ isAddingLink ? 'Adding...' : 'Add' }}
    </button>
  </div>
</div>
```

**Layout**:
- Horizontal flexbox (`flex space-x-3`)
- URL input on left (flex-1 to fill space)
- "Add" button on right (fixed width)
- 12px gap between input and button (`space-x-3`)

### 4C. Add Link Behavior

**When user enters URL and clicks "Add"** (SocialLinksManager.vue lines 136-173):
```typescript
function addLink() {
  if (!newLinkUrl.value.trim()) return
  
  // Validate URL
  if (!validateSocialLink(newLinkUrl.value)) {
    urlError.value = 'Please enter a valid URL from a supported platform'
    return
  }
  
  // Create social link (auto-detect platform)
  const socialLink = createSocialLink(newLinkUrl.value)  // ← Platform auto-detection
  if (!socialLink) {
    urlError.value = 'Unable to detect platform from URL'
    return
  }
  
  // Check for duplicates
  const isDuplicate = socialLinks.value.some(link => 
    link.url === socialLink.url || 
    link.platform === socialLink.platform
  )
  
  if (isDuplicate) {
    urlError.value = 'This platform or URL is already added'
    return
  }
  
  // Add the link to local state
  socialLinks.value.push(socialLink)  // ← Added to component state
  newLinkUrl.value = ''
}
```

**Answer**:
- ✅ **Platform is auto-detected from URL**
- ❌ User does NOT select platform manually
- ✅ **Link is added to form state only** (via v-model binding)
- ❌ Link is NOT saved to database immediately
- ✅ **Must click "Save Profile" to persist**

**v-model Binding** (account.vue line 251):
```vue
<SocialLinksManager
  v-model="form.social_links"  <!-- Two-way binding to form state -->
/>
```

**Saves with profile** (line 695):
```typescript
const updatedProfile = await profileStore.updateProfile(form.value)
// form.value includes social_links array
```

### 4D. Existing Links Display

**From SocialLinksManager.vue** (lines 14-54):
```vue
<div class="space-y-4">
  <div
    v-for="(link, index) in socialLinks"
    :key="index"
    class="flex items-center space-x-3 p-4 rounded-lg border theme-bg-subcard theme-border-subcard"
  >
    <!-- Platform Icon -->
    <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
         :style="{ backgroundColor: getPlatformConfig(link.platform)?.color + '20' }">
      <div class="w-6 h-6" :style="{ color: getPlatformConfig(link.platform)?.color }"
           v-html="getPlatformConfig(link.platform)?.icon || '🔗'"></div>
    </div>
    
    <!-- Link Info -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium theme-text-primary">{{ link.label }}</div>
      <div class="text-sm truncate theme-text-secondary">{{ link.url }}</div>
    </div>
    
    <!-- Remove Button -->
    <button @click="removeLink(index)" class="flex-shrink-0 p-2 text-red-500 hover:text-red-700">
      <svg class="w-4 h-4" ...><!-- X icon --></svg>
    </button>
  </div>
</div>
```

**How are added links shown?**
- ✅ **List with platform icon, label, URL, and remove button**
- Platform icon with brand color background
- Label (platform name) and URL displayed
- Red X button to remove

**Remove link behavior** (SocialLinksManager.vue lines 175-177):
```typescript
function removeLink(index: number) {
  socialLinks.value.splice(index, 1)  // ← Removes from component state only
}
```

**Answer**:
- ✅ **Removes from form state** (via v-model)
- ❌ Does NOT save to database immediately
- ✅ **Must click "Save Profile" to persist removal**
- ❌ No confirmation dialog

### 4E. Social Links Data Structure

**From web app**:
```json
[
  {
    "platform": "spotify",
    "url": "https://open.spotify.com/artist/...",
    "label": "Spotify"
  }
]
```

**Confirmed**:
- ✅ `label` is **auto-set from platform** (not user-editable)
- ✅ `platform` is **auto-detected** (not user-selected)
- ❌ No other fields

**From createSocialLink()** (utils/socialPlatforms.ts lines 175-193):
```typescript
export function createSocialLink(url: string): SocialLink | null {
  const platform = detectPlatform(url)  // ← Auto-detect
  
  if (!platform) return null

  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }

  return {
    platform: Object.keys(SUPPORTED_PLATFORMS).find(key => SUPPORTED_PLATFORMS[key] === platform) || 'website',
    url: cleanUrl,
    label: platform.name  // ← Auto-set from platform config
  }
}
```

---

## SECTION 5: Special Elements

### 5A. "Manage Flags" Button/Link

**Where is it positioned?** (Lines 272-280):
```vue
<!-- Logout Button -->
<button @click="handleLogout" class="...">
  Logout
</button>

<!-- Admin Section (AFTER Logout, BEFORE Delete Account) -->
<div v-if="isAdmin" class="mt-4">
  <button @click="router.push('/admin/flags')" class="...">
    Manage Flags
  </button>
</div>

<!-- Danger Zone (Delete Account) -->
<div class="mt-6">
  <button @click="showDeleteModal = true" class="...">
    Delete My Account
  </button>
</div>
```

**Position**: After Logout, before Delete Account

**Visibility logic**:
- ✅ **Checks `admin_users` table**
- ❌ Does NOT check `profiles.role === 'admin'` (no such value)

**Code Evidence** (Lines 406-418):
```typescript
const checkAdmin = async () => {
  if (!user.value) {
    isAdmin.value = false
    return
  }
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.value.id)
    .maybeSingle()  // ← Queries admin_users table
  isAdmin.value = !!data  // ← True if user ID found in table
}
```

**Is it:**
- ✅ **A button** (standard `<button>` element)
- ❌ Not a text link

**Styling** (Line 276):
```vue
class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-link hover:text-gray-300"
```

### 5B. Avatar Upload

**Click behavior** (Lines 13, 420-432):
```vue
<div class="relative cursor-pointer group" @click="fileInput?.click()">
  <!-- Avatar display -->
</div>

<input
  type="file"
  @change="handleFileChange"
  accept="image/*"
  ref="fileInput"
  class="hidden"
/>
```

**Answer**:
- ✅ **Opens file picker immediately** (clicks hidden input)
- ❌ Does NOT show menu (Camera vs Photo Library)
- Web app uses native file input

**Upload timing** (Lines 679-689):
```typescript
async function saveProfile() {
  // Upload avatar if a new file was selected
  if (avatarFile.value) {
    const avatarUrl = await uploadAvatar()  // ← Uploads during save
    if (avatarUrl) {
      form.value.avatar_url = avatarUrl
    }
  }
  
  // Then save profile with new avatar URL
  const updatedProfile = await profileStore.updateProfile(form.value)
}
```

**Answer**:
- ❌ Does NOT upload immediately on selection
- ✅ **Uploads when "Save Profile" is clicked**
- File is stored in `avatarFile.value` until save
- Preview shown immediately (`avatarPreview.value`)

**For Mobile**: Use Capacitor Camera with menu option:
```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const selectAvatarSource = async () => {
  // Show action sheet
  const actionSheet = await actionSheetController.create({
    header: 'Select Avatar',
    buttons: [
      { text: 'Take Photo', handler: () => openCamera() },
      { text: 'Choose from Library', handler: () => openGallery() },
      { text: 'Cancel', role: 'cancel' }
    ]
  });
  await actionSheet.present();
};
```

---

## SECTION 6: Form State Management

### 6A. Initial Load

**When page loads, profile data is:**
- ✅ **Fetched fresh on page mount** (NOT from store)

**Code Evidence** (Lines 714-803):
```typescript
onMounted(async () => {
  if (user.value) {
    const { data: profile, error } = await profileStore.fetchProfile()  // ← Fresh fetch
    
    if (profile) {
      form.value = { 
        ...profile,
        social_links: Array.isArray(profile.social_links) ? profile.social_links : []
      }
      // ... load other data
    }
  }
})
```

**Answer**:
- ✅ Calls `profileStore.fetchProfile()` on mount
- Loads fresh data from database into form
- Does NOT assume profileStore already has data

### 6B. Form State Synchronization

**If a toggle is clicked but "Save Profile" is not clicked:**
- ✅ **Form state diverges from database**
- ✅ **User can navigate away (no warning)**
- ✅ **Changes are lost** (no persistence)
- ❌ NO "unsaved changes" warning
- ❌ Changes do NOT persist in form (if they navigate back)

**Evidence**: No unsaved changes detection or navigation guards in code.

**What Happens**:
1. User toggles Privacy to Private
2. `form.value.is_public = false` (local state only)
3. User clicks "Battle" tab in footer
4. Navigates to dashboard
5. `form.value.is_public` change is lost
6. If user returns to Account page, profile is re-fetched from database
7. Privacy shows original value (Public)

### 6C. Reactive Updates

**If profile updates from another source:**
- ✅ **Form keeps local state until saved**
- ❌ Does NOT automatically update to reflect external changes

**Evidence**: No watchers on `profileStore.profile` that update form state.

**Watchers Present** (Lines 805-826):
```typescript
// Watch for social links changes (debug only)
watch(() => form.value.social_links, (newSocialLinks) => {
  console.log('Social links changed:', newSocialLinks)
}, { deep: true })

// Watch for profile store changes (debug only)  
watch(() => profileStore.profile, (newProfile) => {
  console.log('Profile store changed:', newProfile)
}, { deep: true })

// Watch for user changes to check admin status
watch(user, async (newUser) => {
  if (newUser) {
    await checkAdmin()
  }
})
```

**These watchers are for**:
- Debug logging (social links, profile store)
- Admin status checking (user changes)
- NOT for syncing form state

---

## SECTION 7: Edge Cases & Validation

### 7A. Username Validation

**Can username be changed after initial set?**
- ❌ **No** - locked once set (via `isUsernameLocked` computed)

**Duplicate username handling** (Lines 392-395):
```typescript
const usernameError = computed(() => {
  return profileStore.lastErrorCode === 'USERNAME_TAKEN' ? 'That username is taken. Please choose another.' : ''
})
```

**When error shows**:
- ✅ **Shows error on save attempt** (after API returns error)
- ❌ NOT before submit (no pre-validation)

**From profileStore.updateProfile()** (profileStore.ts lines 91-103):
```typescript
if (error) {
  if ((error as any).code === '23505' || 
      (error as any).code === '42501' || 
      `${error.message}`.includes('unique') && `${error.message}`.includes('username')) {
    lastErrorCode.value = 'USERNAME_TAKEN';  // ← Sets error code
  }
  return null;
}
```

**Error Flow**:
1. User tries to save with duplicate username
2. Database returns error (code 23505 - unique violation)
3. `profileStore.lastErrorCode` set to `'USERNAME_TAKEN'`
4. `usernameError` computed displays message
5. Save fails, user stays on Account page

### 7B. Required Fields

**Code Evidence** (Lines 382-384):
```typescript
const canSave = computed(() => {
  return form.value.username && form.value.display_name
})
```

**Required fields for save to succeed**:
- ✅ `username`
- ✅ `display_name`
- ❌ `bio` - NOT required (optional)
- ❌ All others - NOT required

**Button disabled when**:
- Missing username OR display name
- Currently saving (`isSaving === true`)

### 7C. Concurrent Updates

**If user has two tabs open and saves in both:**
- ✅ **Last write wins** (no conflict detection)

**Evidence**: No optimistic locking, version checking, or conflict resolution in code.

**What Happens**:
1. Tab 1: User loads profile (version A)
2. Tab 2: User loads profile (version A)
3. Tab 1: User changes bio to "Hello", clicks Save
4. Database updated to version B (bio: "Hello")
5. Tab 2: User changes bio to "World", clicks Save
6. Database updated to version C (bio: "World")
7. Tab 1's change overwritten
8. No warning or conflict detection

---

## SECTION 8: Complete Code Snippets

### All Toggle Handlers (Consolidated)

```typescript
// 1. Privacy Toggle
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

// 2. Theme Toggle (DIFFERENT - saves immediately)
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  document.documentElement.classList.add('no-transitions')
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  document.documentElement.classList.toggle('light', newTheme === 'light')
  
  if (themeToggleRef.value) {
    themeToggleRef.value.checked = newTheme === 'dark'
  }
  
  localStorage.setItem('songwars-theme', newTheme)  // ← Saves immediately
  localStorage.setItem('songwars-theme-system', 'false')

  setTimeout(() => {
    document.documentElement.classList.remove('no-transitions')
  }, 60)
}

// 3. Roulette Sound Toggle
function handleRouletteSoundToggle() {
  form.value.roulette_sound_enabled = !form.value.roulette_sound_enabled
}

function handleRouletteSoundChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.roulette_sound_enabled = target.checked
}

// 4. Confetti Sound Toggle
function handleConfettiSoundToggle() {
  form.value.confetti_sound_enabled = !form.value.confetti_sound_enabled
}

function handleConfettiSoundChange(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.confetti_sound_enabled = target.checked
}

// 5. Account Type Toggle
function handleAccountTypeToggle() {
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  form.value.role = newRole
}

function handleAccountTypeChange(event: Event) {
  const target = event.target as HTMLInputElement
  const newRole = target.checked ? 'artist' : 'user'
  form.value.role = newRole
}
```

**Pattern**: All toggles (except theme) just update `form.value.FIELD`. Theme is special - updates DOM and localStorage immediately.

### Save Profile Function (Complete)

```typescript
async function saveProfile() {
  if (!canSave.value) return
  
  isSaving.value = true
  try {
    console.log('Starting profile save...')
    
    // 1. Upload avatar if a new file was selected
    if (avatarFile.value) {
      console.log('Avatar file detected, uploading...')
      const avatarUrl = await uploadAvatar()
      if (avatarUrl) {
        form.value.avatar_url = avatarUrl
        console.log('Avatar URL updated:', avatarUrl)
      } else {
        console.error('Failed to upload avatar')
      }
    }
    
    // 2. Prepare musical preferences
    form.value.musical_preferences = selectedGenres.value.join(',')
    console.log('Saving profile with data:', form.value)
    
    // 3. Save to database (ALL form fields)
    const updatedProfile = await profileStore.updateProfile(form.value)
    if (updatedProfile) {
      console.log('Profile updated successfully')
      
      // Clear the avatar file since it's now uploaded
      avatarFile.value = null
      
      // 4. Redirect to dashboard
      router.push('/dashboard')
    } else {
      console.error('Failed to update profile')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false  // Always reset button state
  }
}
```

### Form Initialization

```typescript
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

### Watchers (Lines 805-826)

```typescript
// 1. Watch social links (debug logging only)
watch(() => form.value.social_links, (newSocialLinks, oldSocialLinks) => {
  console.log('Social links changed:', {
    old: oldSocialLinks?.length || 0,
    new: newSocialLinks?.length || 0,
    links: newSocialLinks
  })
}, { deep: true })

// 2. Watch profile store (debug logging only)
watch(() => profileStore.profile, (newProfile) => {
  console.log('Profile store changed:', newProfile)
}, { deep: true })

// 3. Watch user for admin check
watch(user, async (newUser) => {
  if (newUser) {
    await checkAdmin()  // ← Re-check admin status
  } else {
    isAdmin.value = false
  }
})
```

**Purpose**:
- First two watchers are DEBUG ONLY (console logs)
- Third watcher maintains admin status when user changes

---

## SECTION 9: Visual/UX Specifications

### 9A. Spacing Between Sections

**From template** (Line 54):
```vue
<div class="w-full max-w-md space-y-6">
  <!-- All form sections -->
</div>
```

**Vertical Spacing**:
- `space-y-6` = **24px between each section**
- Same on mobile and desktop
- Consistent throughout form

**Individual Sections**:
```vue
<!-- Display Name -->
<div>...</div>

<!-- 24px gap (space-y-6) -->

<!-- Username -->
<div>...</div>

<!-- 24px gap -->

<!-- Bio -->
<div>...</div>

<!-- 24px gap -->

<!-- Privacy Card -->
<div class="rounded-2xl p-6 ...">...</div>

<!-- 24px gap -->

<!-- Theme Card -->
<div class="rounded-2xl p-6 ...">...</div>
```

### 9B. Button Styling

**Save Profile Button**:

**Dimensions**:
- Width: `w-full` (100% of container = max-w-md = 448px)
- Padding: `12px 24px` (from `.bigbutton-medium`)
- Font size: `1.125em` (from `.bigbutton-medium`)
- Height: Auto (~48px total with padding)

**Colors**:

| State | Background | Text | Border | Shadow |
|-------|------------|------|--------|--------|
| **Normal** | `#ffd200` | `#000000` | `2px solid #000` | `2px 2px 0 #000` |
| **Hover** | `#ffd200` | `#000000` | `2px solid #000` | `1px 1px 0 #000` |
| **Saving** | `#3b82f6` (blue) | `#ffffff` (white) | `2px solid #000` | `3px 3px 0 #000` |
| **Disabled** | `#ffd200` | `#000000` | `2px solid #000` | `3px 3px 0 #000` |

**CSS** (Lines 840-916):
```css
.bigbutton-medium {
  line-height: 1.4em;
  padding: 12px 24px;
  font-size: 1.125em;
  box-shadow: 2px 2px 0 #000;
}

.saving-state {
  background: #3b82f6 !important;  /* Blue when saving */
  color: white !important;
}

.bigbutton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Other Buttons**:

**Logout** (Line 265-270):
```vue
class="w-full px-4 py-3 transition-colors font-medium mt-4 text-white theme-button-link hover:text-red-400"
```
- Full width
- White text, red hover
- No border or background

**Delete Account** (Lines 288-293):
```vue
class="w-full px-4 py-2 transition-colors font-medium text-white theme-button-danger"
```
- Full width
- White text, red hover (`hover:text-red-400`)
- No border or background

### 9C. Card Containers

**Settings Cards** (Privacy, Theme, Audio, Account Type):

**Do inputs have card wrappers?**
- ❌ **Inputs do NOT have card wrappers** (Display Name, Username, Bio)
- ✅ **Settings sections DO have card wrappers** (Privacy, Theme, etc.)

**Card Specifications** (Line 94):
```vue
class="rounded-2xl p-6 border border-gray-700 bg-gray-800 theme-bg-card theme-border-card"
```

**Breakdown**:

| Property | Value | Pixels/Notes |
|----------|-------|--------------|
| **Border radius** | `rounded-2xl` | 16px |
| **Border color** | `border-gray-700` | #374151 (overridden by theme) |
| **Border thickness** | `border` | 1px |
| **Background** | `bg-gray-800` | #1f2937 (overridden by theme) |
| **Padding** | `p-6` | 24px all sides |

**Theme-Aware Actual Colors**:

**Light Mode**:
- Background: `#ffffff` (white)
- Border: `#d1d5db` (gray-300)

**Dark Mode**:
- Background: `#1f2937` (gray-800)
- Border: `#374151` (gray-700)

---

## Behavior Flow Diagrams

### Toggle → Save Flow

```
User clicks Privacy Toggle
         ↓
form.value.is_public = false  (form state only)
         ↓
Toggle animates to OFF position
         ↓
User continues editing...
         ↓
         ↓
User clicks "Save Profile"
         ↓
isSaving.value = true
Button shows "Saving..." (blue background)
         ↓
await uploadAvatar() (if avatar changed)
         ↓
await profileStore.updateProfile(form.value)  ← ALL fields sent
         ↓
POST /profiles with {is_public: false, ...}
         ↓
Database updated
         ↓
Response received
         ↓
router.push('/dashboard')
         ↓
User redirected, changes saved ✅
```

### Theme Toggle Flow (Immediate Save)

```
User clicks Theme Toggle
         ↓
document.documentElement.setAttribute('data-theme', 'dark')
         ↓
localStorage.setItem('songwars-theme', 'dark')  ← Saves immediately
         ↓
Entire app theme changes instantly
         ↓
Done ✅ (independent of "Save Profile")
```

### Social Links Add Flow

```
User enters URL (https://spotify.com/artist/...)
         ↓
User clicks "Add" button
         ↓
Platform auto-detected (Spotify)
         ↓
socialLink object created: {platform: 'spotify', url: '...', label: 'Spotify'}
         ↓
socialLinks.value.push(socialLink)  (component state)
         ↓
v-model emits to parent
         ↓
form.value.social_links updated  (form state)
         ↓
Link appears in list immediately
         ↓
User continues editing...
         ↓
User clicks "Save Profile"
         ↓
await profileStore.updateProfile(form.value)
         ↓
POST /profiles with {social_links: [{...}], ...}
         ↓
Database updated with new links ✅
```

---

## Quick Reference: What Saves When

### Immediate Saves (No "Save Profile" Required)
- ✅ **Theme toggle** → localStorage only

### Deferred Saves (Requires "Save Profile" Button)
- ✅ **Privacy toggle** → Database
- ✅ **Roulette sound toggle** → Database
- ✅ **Confetti sound toggle** → Database
- ✅ **Account type toggle** → Database
- ✅ **Social links add/remove** → Database
- ✅ **Display name change** → Database
- ✅ **Username change** → Database (if not locked)
- ✅ **Bio change** → Database
- ✅ **Avatar upload** → Storage + Database URL

### Never Saved to Database
- ✅ **Theme preference** (localStorage only)

---

## Summary: Critical Behaviors

**1. NO unsaved changes warnings** - User can navigate away and lose edits

**2. Theme is special** - Only toggle that saves immediately (to localStorage, not database)

**3. All other toggles are deferred** - Update form state, save on button click

**4. Social links are reactive** - Appear/disappear with role toggle without saving

**5. Save redirects to dashboard** - User doesn't stay on Account page

**6. Username locks after first set** - Cannot be changed once saved

**7. Admin check uses separate table** - `admin_users` table, not a role field

**8. All fields sent on save** - No dirty tracking, sends entire form

**9. Last write wins** - No conflict detection for concurrent edits

**10. Required fields** - Only username and display_name required

