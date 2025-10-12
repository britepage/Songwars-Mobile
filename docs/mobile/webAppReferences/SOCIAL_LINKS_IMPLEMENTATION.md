# Social Links Section - Web App Implementation Reference

**Document Purpose**: This document provides pixel-perfect implementation details of the Social Links section from the production web app's Account Page, enabling exact mobile app parity.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `pages/account.vue` (lines 248-252)
- `components/SocialLinksManager.vue` (complete file, 185 lines)
- `utils/socialPlatforms.ts` (complete file, 230 lines)

---

## Table of Contents

1. [Overview](#overview)
2. [Visual Specifications](#visual-specifications)
3. [Layout & Structure](#layout--structure)
4. [Platform Icons Implementation](#platform-icons-implementation)
5. [Text Content](#text-content)
6. [Platform Configuration](#platform-configuration)
7. [Component Integration](#component-integration)
8. [Conditional Rendering](#conditional-rendering)
9. [Complete Code References](#complete-code-references)

---

## Overview

The Social Links section allows **artists only** to add up to 3 social media or streaming platform links to their profile. The section features:

- Platform-specific icons with brand colors
- Automatic platform detection from URLs
- Visual cards for each added link
- Add/remove functionality
- Maximum 3 links constraint
- Support for 13+ platforms

**Visibility**: Artists only (`v-if="form.role === 'artist'"`)

---

## Visual Specifications

### Spacing & Layout

| Element | Specification | Tailwind Class |
|---------|--------------|----------------|
| **Section Container** | 24px padding, 12px border radius | `p-6 rounded-2xl` |
| **Link Cards Spacing** | 16px vertical gap | `space-y-4` |
| **Link Card Padding** | 16px all sides | `p-4` |
| **Link Card Border Radius** | 8px | `rounded-lg` |
| **Horizontal Item Spacing** | 12px gap | `space-x-3` |
| **Icon Container Size** | 40px × 40px | `w-10 h-10` |
| **Icon Size** | 24px × 24px | `w-6 h-6` |

### Typography

| Element | Font Size | Tailwind Class | Color |
|---------|-----------|----------------|-------|
| **Section Title** | 18px | `text-lg` | White (theme-text-primary) |
| **Intro Text** | 14px | `text-sm` | Gray-400 (theme-text-secondary) |
| **Link Label** | 14px | `text-sm font-medium` | White (theme-text-primary) |
| **Link URL** | 14px | `text-sm` | Gray-400 (theme-text-secondary) |
| **Helper Text** | 12px | `text-xs` | Gray-500 (theme-text-muted) |
| **Max Links Message** | 14px | `text-sm text-center` | Gray-400 (theme-text-secondary) |

### Colors & Styling

| Element | Background | Border | Special |
|---------|-----------|--------|---------|
| **Section Container** | `bg-gray-800 theme-bg-card` | `border-gray-700 theme-border-card` | - |
| **Link Card** | `theme-bg-subcard` | `theme-border-subcard` | - |
| **Icon Container** | Platform color @ 20% opacity | None | Circular |
| **Icon** | Platform brand color | None | CDN image |
| **Add Button** | `#ffd200` (yellow) | None | `rounded-lg` |
| **Remove Button** | `#ef4444` (red-500) | None | Hover: `#b91c1c` |

---

## Layout & Structure

### Complete HTML Structure

```vue
<!-- Main Container -->
<div class="rounded-2xl p-6 border border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
  
  <!-- Section Header -->
  <h3 class="text-lg font-semibold mb-6 flex items-center text-white theme-text-primary">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]">...</svg>
    Social Links
  </h3>
  
  <!-- Intro Text -->
  <p class="text-sm mb-6 text-gray-400 theme-text-secondary">
    Add up to 3 social media or streaming platform links to showcase your music and connect with fans.
  </p>

  <!-- Existing Links List -->
  <div class="space-y-4">
    <div class="flex items-center space-x-3 p-4 rounded-lg border theme-bg-subcard theme-border-subcard">
      
      <!-- Platform Icon (40px × 40px circular) -->
      <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
           :style="{ backgroundColor: platformColor + '20' }">
        <div class="w-6 h-6" :style="{ color: platformColor }" v-html="iconHTML"></div>
      </div>
      
      <!-- Link Info -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-white theme-text-primary">{{ label }}</div>
        <div class="text-sm truncate text-gray-400 theme-text-secondary">{{ url }}</div>
      </div>
      
      <!-- Remove Button -->
      <button class="flex-shrink-0 p-2 text-red-500 hover:text-red-700">
        <svg class="w-4 h-4">...</svg> <!-- X icon -->
      </button>
    </div>
  </div>

  <!-- Add New Link Form (if < 3 links) -->
  <div v-if="socialLinks.length < 3" class="mt-6">
    <div class="flex space-x-3">
      <input type="url" placeholder="https://open.spotify.com/artist/..." 
             class="w-full px-4 py-3 border rounded-lg ... theme-input" />
      <button class="px-6 py-3 bg-[#ffd200] text-black rounded-lg">Add</button>
    </div>
    <div class="mt-3 text-xs text-gray-500 theme-text-muted">
      Supported platforms: Spotify, Apple Music, YouTube, Instagram, Twitter, TikTok, SoundCloud, Bandcamp, Facebook, LinkedIn, Twitch, Patreon, and more
    </div>
  </div>

  <!-- Max Links Reached Message (if >= 3 links) -->
  <div v-else class="mt-6 p-4 rounded-lg theme-bg-subcard theme-border-subcard border">
    <p class="text-sm text-center text-gray-400 theme-text-secondary">
      You've reached the maximum of 3 social links.
    </p>
  </div>
</div>
```

---

## Platform Icons Implementation

### Icon Rendering Mechanism

**Technology**: External CDN images embedded as HTML via `v-html`

**NOT**: SVG paths, icon fonts, or base64 encoded images

### Icon Container Structure

```vue
<!-- Outer Container: 40px × 40px circle with 20% opacity background -->
<div 
  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
  :style="{ backgroundColor: getPlatformConfig(link.platform)?.color + '20' }"
>
  <!-- Inner Container: 24px × 24px icon with platform color -->
  <div 
    class="w-6 h-6"
    :style="{ color: getPlatformConfig(link.platform)?.color }"
    v-html="getPlatformConfig(link.platform)?.icon || '🔗'"
  ></div>
</div>
```

### Key Implementation Details

1. **Background Color**: Platform color with `'20'` appended for 20% opacity (e.g., `#1DB954` → `#1DB95420`)
2. **Icon Color**: Full platform brand color via inline `color` style
3. **Fallback**: Unicode link emoji `🔗` if platform not recognized
4. **Shape**: Circular container (`rounded-full`)
5. **Centering**: Flexbox (`flex items-center justify-center`)

### getPlatformConfig() Function

**Location**: `utils/socialPlatforms.ts` (lines 209-211)

```typescript
export function getPlatformConfig(platformKey: string): PlatformConfig | null {
  return SUPPORTED_PLATFORMS[platformKey] || null
}
```

**Returns**: `PlatformConfig` object containing:
```typescript
{
  name: string      // Display name (e.g., "Spotify")
  icon: string      // HTML img tag with CDN URL
  color: string     // Hex color code (e.g., "#1DB954")
  domains: string[] // Supported domains for detection
}
```

---

## Text Content

### 1. Section Title
**Location**: `SocialLinksManager.vue` (line 7)
```
Social Links
```
- Icon: Link chain SVG in yellow (`#ffd200`)
- Class: `text-lg font-semibold mb-6 flex items-center`

### 2. Introductory Text
**Location**: `SocialLinksManager.vue` (lines 10-12)
```
Add up to 3 social media or streaming platform links to showcase your music and connect with fans.
```
- Class: `text-sm mb-6 text-gray-400 theme-text-secondary`

### 3. Input Placeholder
**Location**: `SocialLinksManager.vue` (line 63)
```
https://open.spotify.com/artist/...
```

### 4. Add Button Text
**Location**: `SocialLinksManager.vue` (line 73)
```
Add
```
or
```
Adding...
```
(when `isAddingLink === true`)

### 5. Supported Platforms Helper Text
**Location**: `SocialLinksManager.vue` (lines 83-85)
```
Supported platforms: Spotify, Apple Music, YouTube, Instagram, Twitter, TikTok, SoundCloud, Bandcamp, Facebook, LinkedIn, Twitch, Patreon, and more
```
- Class: `mt-3 text-xs text-gray-500 theme-text-muted`

### 6. Maximum Links Reached Message
**Location**: `SocialLinksManager.vue` (lines 90-92)
```
You've reached the maximum of 3 social links.
```
- Class: `text-sm text-center text-gray-400 theme-text-secondary`
- Container: `mt-6 p-4 rounded-lg theme-bg-subcard theme-border-subcard border`

### 7. Validation Error Messages
**Location**: `SocialLinksManager.vue` (lines 78-80, 144-165)

**Possible Messages**:
- `"Please enter a valid URL from a supported platform"`
- `"Unable to detect platform from URL"`
- `"This platform or URL is already added"`

**Styling**: `mt-2 text-sm text-red-500`

---

## Platform Configuration

### Complete Platform List (13 Platforms)

**Location**: `utils/socialPlatforms.ts` (lines 17-116)

#### 1. Spotify
```typescript
{
  name: 'Spotify',
  icon: '<img src="https://cdn.simpleicons.org/spotify/1DB954" alt="Spotify" width="24" height="24" />',
  color: '#1DB954',
  domains: ['spotify.com', 'open.spotify.com']
}
```

#### 2. Apple Music
```typescript
{
  name: 'Apple Music',
  icon: '<img src="https://cdn.simpleicons.org/applemusic/FA243C" alt="Apple Music" width="24" height="24" />',
  color: '#FA243C',
  domains: ['music.apple.com', 'itunes.apple.com']
}
```

#### 3. YouTube
```typescript
{
  name: 'YouTube',
  icon: '<img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width="24" height="24" />',
  color: '#FF0000',
  domains: ['youtube.com', 'youtu.be', 'm.youtube.com']
}
```

#### 4. Instagram
```typescript
{
  name: 'Instagram',
  icon: '<img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" />',
  color: '#E4405F',
  domains: ['instagram.com', 'www.instagram.com']
}
```

#### 5. Twitter / X
```typescript
{
  name: 'X',
  icon: '<img src="https://cdn.simpleicons.org/x/000000" alt="X" width="24" height="24" />',
  color: '#000000',
  domains: ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com']
}
```

#### 6. TikTok
```typescript
{
  name: 'TikTok',
  icon: '<img src="https://cdn.simpleicons.org/tiktok/000000" alt="TikTok" width="24" height="24" />',
  color: '#000000',
  domains: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com']
}
```

#### 7. SoundCloud
```typescript
{
  name: 'SoundCloud',
  icon: '<img src="https://cdn.simpleicons.org/soundcloud/FF3300" alt="SoundCloud" width="24" height="24" />',
  color: '#FF3300',
  domains: ['soundcloud.com', 'www.soundcloud.com']
}
```

#### 8. Bandcamp
```typescript
{
  name: 'Bandcamp',
  icon: '<img src="https://cdn.simpleicons.org/bandcamp/629aa0" alt="Bandcamp" width="24" height="24" />',
  color: '#629aa0',
  domains: ['bandcamp.com', 'www.bandcamp.com']
}
```

#### 9. Amazon Music
```typescript
{
  name: 'Amazon Music',
  icon: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg" alt="Amazon Music" width="24" height="24" />',
  color: '#FF9900',
  domains: ['music.amazon.com', 'www.music.amazon.com', 'amazon.com/music']
}
```

#### 10. Facebook
```typescript
{
  name: 'Facebook',
  icon: '<img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" />',
  color: '#1877F2',
  domains: ['facebook.com', 'www.facebook.com', 'fb.com']
}
```

#### 11. LinkedIn
```typescript
{
  name: 'LinkedIn',
  icon: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" />',
  color: '#0A66C2',
  domains: ['linkedin.com', 'www.linkedin.com']
}
```

#### 12. Twitch
```typescript
{
  name: 'Twitch',
  icon: '<img src="https://cdn.simpleicons.org/twitch/9146FF" alt="Twitch" width="24" height="24" />',
  color: '#9146FF',
  domains: ['twitch.tv', 'www.twitch.tv']
}
```

#### 13. Patreon
```typescript
{
  name: 'Patreon',
  icon: '<img src="https://cdn.simpleicons.org/patreon/FF424D" alt="Patreon" width="24" height="24" />',
  color: '#FF424D',
  domains: ['patreon.com', 'www.patreon.com']
}
```

#### 14. Generic Website
```typescript
{
  name: 'Website',
  icon: '<img src="https://api.iconify.design/mdi:globe.svg" alt="Website" width="24" height="24" />',
  color: '#6B7280',
  domains: [] // Fallback for any valid URL
}
```

### CDN Sources

**Primary**: `https://cdn.simpleicons.org/` (most platforms)  
**Secondary**: `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/` (Amazon, LinkedIn)  
**Fallback**: `https://api.iconify.design/` (generic website icon)

**Format**: `https://cdn.simpleicons.org/{platform}/{color}`

---

## Component Integration

### Usage in Account Page

**Location**: `pages/account.vue` (lines 248-252)

```vue
<!-- Social Links Section (Artists Only) -->
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

### Component Props

**Location**: `SocialLinksManager.vue` (lines 102-104)

```typescript
const props = defineProps<{
  modelValue: SocialLink[]
}>()
```

### Component Emits

**Location**: `SocialLinksManager.vue` (lines 107-109)

```typescript
const emit = defineEmits<{
  'update:modelValue': [value: SocialLink[]]
}>()
```

### Data Model

**Location**: `utils/socialPlatforms.ts` (lines 2-6)

```typescript
export interface SocialLink {
  platform: string  // Platform key (e.g., "spotify", "youtube")
  url: string       // Full URL (e.g., "https://open.spotify.com/artist/...")
  label: string     // Display name (e.g., "Spotify", "YouTube")
}
```

---

## Conditional Rendering

### 1. Section Visibility
```vue
v-if="form.role === 'artist'"
```
**Logic**: Only artists see the Social Links section. Fans do not.

### 2. Add New Link Form
```vue
v-if="socialLinks.length < 3"
```
**Logic**: Show add form when user has 0, 1, or 2 links.

### 3. Max Links Message
```vue
v-else  <!-- when socialLinks.length >= 3 -->
```
**Logic**: Show message when user has reached the maximum of 3 links.

### 4. Validation Error
```vue
v-if="urlError"
```
**Logic**: Show error message when URL validation fails.

### 5. Button Loading State
```vue
{{ isAddingLink ? 'Adding...' : 'Add' }}
:disabled="!newLinkUrl.trim() || isAddingLink"
```
**Logic**: 
- Change button text during submission
- Disable button when URL is empty or currently adding

---

## Complete Code References

### 1. SocialLinksManager.vue (Complete Component)

**File**: `components/SocialLinksManager.vue`  
**Lines**: 1-185  
**Purpose**: Main component for managing social links on Account Page

**Key Sections**:
- **Lines 1-94**: Template (HTML structure)
- **Lines 97-185**: Script (component logic)
- **Lines 10-12**: Introductory text
- **Lines 14-54**: Existing links display
- **Lines 22-31**: Platform icon rendering
- **Lines 34-41**: Link info display
- **Lines 44-52**: Remove button
- **Lines 57-86**: Add new link form
- **Lines 83-85**: Supported platforms text
- **Lines 89-93**: Max links message
- **Lines 136-173**: addLink() method with validation

### 2. socialPlatforms.ts (Utility Functions)

**File**: `utils/socialPlatforms.ts`  
**Lines**: 1-230  
**Purpose**: Platform detection, configuration, and validation

**Key Functions**:
- **Lines 17-116**: `SUPPORTED_PLATFORMS` constant (all 14 platforms)
- **Lines 123-168**: `detectPlatform(url)` - Auto-detect platform from URL
- **Lines 175-193**: `createSocialLink(url)` - Create SocialLink object
- **Lines 200-202**: `validateSocialLink(url)` - Validate URL
- **Lines 209-211**: `getPlatformConfig(key)` - Get platform config

### 3. Account.vue Integration

**File**: `pages/account.vue`  
**Lines**: 248-252  
**Purpose**: Integration point for Social Links section

```vue
<!-- Social Links Section (Artists Only) -->
<SocialLinksManager
  v-if="form.role === 'artist'"
  v-model="form.social_links"
/>
```

---

## Implementation Checklist for Mobile

### Layout & Styling
- [ ] Create 40px × 40px circular icon containers
- [ ] Apply platform color with 20% opacity to icon backgrounds
- [ ] Render 24px × 24px platform icons inside containers
- [ ] Implement 16px padding on link cards
- [ ] Use 8px border radius on cards
- [ ] Apply 16px vertical spacing between link cards
- [ ] Implement theme-aware backgrounds and borders

### Platform Icons
- [ ] Load icons from CDN URLs (not embedded SVGs)
- [ ] Implement fallback to 🔗 emoji for unrecognized platforms
- [ ] Apply platform-specific brand colors to icons
- [ ] Support all 13 platforms listed above

### Functionality
- [ ] Implement artist-only visibility check
- [ ] Enforce 3-link maximum
- [ ] Auto-detect platform from URL
- [ ] Validate URLs against supported platforms
- [ ] Prevent duplicate platforms/URLs
- [ ] Show appropriate error messages
- [ ] Update parent form on changes (v-model pattern)

### Text Content
- [ ] Display introductory text exactly as specified
- [ ] Show supported platforms helper text
- [ ] Display max links message when limit reached
- [ ] Show validation errors in red text

### User Experience
- [ ] Enable Enter key to submit new link
- [ ] Disable Add button when URL is empty
- [ ] Show loading state during link addition
- [ ] Clear error when user starts typing
- [ ] Truncate long URLs in display

---

## Testing Scenarios

### Test Case 1: Add Valid Links
1. User enters Spotify artist URL
2. System detects platform automatically
3. Shows Spotify icon with green color (#1DB954)
4. Displays platform name and URL

### Test Case 2: Maximum Links
1. User adds 3 social links
2. Add form disappears
3. Max links message appears
4. No way to add more links

### Test Case 3: Invalid URL
1. User enters invalid or unsupported URL
2. System shows error: "Please enter a valid URL from a supported platform"
3. Link is not added
4. Error clears when user starts typing again

### Test Case 4: Duplicate Detection
1. User tries to add same platform twice
2. System shows error: "This platform or URL is already added"
3. Link is not added

### Test Case 5: Fan User
1. User account is set to role: "fan"
2. Social Links section does not appear
3. No way to add social links as fan

---

## Mobile-Specific Considerations

### Network/Offline Handling
- Platform icons load from external CDN
- Consider caching CDN images locally
- Provide fallback for offline icon display

### Image Loading
- All icons are external `<img>` tags
- Not base64 encoded
- Not embedded SVG paths
- Requires network access to display

### Performance
- 24px × 24px icons are small and load quickly
- CDN URLs are optimized for global delivery
- Consider preloading icons for common platforms

### Platform Detection
- URL parsing happens client-side
- No server call needed for platform detection
- Works offline once utility code is loaded

---

## Quick Reference Table

| Platform | Color Code | Icon CDN URL |
|----------|-----------|--------------|
| Spotify | `#1DB954` | `https://cdn.simpleicons.org/spotify/1DB954` |
| Apple Music | `#FA243C` | `https://cdn.simpleicons.org/applemusic/FA243C` |
| YouTube | `#FF0000` | `https://cdn.simpleicons.org/youtube/FF0000` |
| Instagram | `#E4405F` | `https://cdn.simpleicons.org/instagram/E4405F` |
| Twitter/X | `#000000` | `https://cdn.simpleicons.org/x/000000` |
| TikTok | `#000000` | `https://cdn.simpleicons.org/tiktok/000000` |
| SoundCloud | `#FF3300` | `https://cdn.simpleicons.org/soundcloud/FF3300` |
| Bandcamp | `#629aa0` | `https://cdn.simpleicons.org/bandcamp/629aa0` |
| Amazon Music | `#FF9900` | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg` |
| Facebook | `#1877F2` | `https://cdn.simpleicons.org/facebook/1877F2` |
| LinkedIn | `#0A66C2` | `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg` |
| Twitch | `#9146FF` | `https://cdn.simpleicons.org/twitch/9146FF` |
| Patreon | `#FF424D` | `https://cdn.simpleicons.org/patreon/FF424D` |
| Website | `#6B7280` | `https://api.iconify.design/mdi:globe.svg` |

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/SocialLinksManager.vue`
- **Platform Utils**: `utils/socialPlatforms.ts`
- **Integration**: `pages/account.vue` (line 248)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

