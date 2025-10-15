# My Songs Page Header - Complete Implementation Reference

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Purpose:** Complete implementation reference for My Songs page header section for pixel-perfect mobile replication

---

## Table of Contents

1. [Overview](#overview)
2. [Header Structure](#header-structure)
3. [Visual Specifications](#visual-specifications)
4. [Complete Code Implementation](#complete-code-implementation)
5. [Responsive Behavior](#responsive-behavior)
6. [Theme Integration](#theme-integration)
7. [Accessibility Features](#accessibility-features)
8. [Integration Points](#integration-points)
9. [Implementation Checklist](#implementation-checklist)

---

## Overview

The My Songs page header is a simple but important section that provides visual branding and context for the page. It consists of:

- **Music Icon**: Yellow gradient circular icon with black music note SVG
- **Page Title**: "Your Songs" in large, bold white text
- **Subtitle**: "Manage your uploaded tracks" in smaller gray text
- **Layout**: Horizontal flex layout with icon and text side-by-side

### Key Features
- Consistent with other page headers in the app (Upload, Dashboard)
- Responsive typography (smaller on mobile, larger on desktop)
- Theme-aware colors using CSS custom properties
- Clean, minimal design with proper spacing

---

## Header Structure

### HTML Structure

**File:** `pages/my-songs.vue` (lines 4-17)

```vue
<!-- Header -->
<div class="flex items-center justify-between mb-8">
  <div class="flex items-center space-x-3">
    <!-- Music Icon -->
    <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
      <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </div>
    
    <!-- Text Content -->
    <div>
      <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
      <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
    </div>
  </div>
</div>
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Page Container (max-w-6xl, mx-auto)                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Header Container (flex, items-center, mb-8)        │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Content Container (flex, items-center, space-x-3) │ │ │
│  │  │  ┌─────────────┐  ┌─────────────────────────────┐ │ │ │
│  │  │  │ Music Icon  │  │ Text Container              │ │ │ │
│  │  │  │ 48×48px     │  │ - Title: "Your Songs"      │ │ │ │
│  │  │  │ Yellow      │  │ - Subtitle: "Manage..."    │ │ │ │
│  │  │  │ Gradient    │  │                             │ │ │ │
│  │  │  └─────────────┘  └─────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Visual Specifications

### Music Icon

**Container:**
- **Size:** `w-12 h-12` (48px × 48px)
- **Shape:** `rounded-full` (perfect circle)
- **Background:** `bg-gradient-to-r from-yellow-400 to-yellow-500`
- **Layout:** `flex items-center justify-center` (centered content)

**Gradient Colors:**
- **Start:** `from-yellow-400` (#facc15)
- **End:** `to-yellow-500` (#eab308)
- **Direction:** `gradient-to-r` (left to right)

**SVG Icon:**
- **Size:** `w-6 h-6` (24px × 24px)
- **Color:** `text-black` (#000000)
- **Fill:** `fill="currentColor"`
- **ViewBox:** `viewBox="0 0 24 24"`

**SVG Path:**
```svg
<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
```

### Typography

**Title ("Your Songs"):**
- **Font Size:** 
  - Mobile: `text-2xl` (24px / 1.5rem)
  - Desktop: `md:text-3xl` (30px / 1.875rem)
- **Font Weight:** `font-bold` (700)
- **Color:** `text-white` with `theme-text-primary` fallback

**Subtitle ("Manage your uploaded tracks"):**
- **Font Size:** Default (16px / 1rem) - no size class specified
- **Font Weight:** Default (400) - no weight class specified
- **Color:** `text-gray-400` with `theme-text-secondary` fallback

### Spacing

**Header Container:**
- **Margin Bottom:** `mb-8` (32px / 2rem)
- **Layout:** `flex items-center justify-between`
- **Note:** `justify-between` is used but only one element, so effectively left-aligned

**Content Container:**
- **Layout:** `flex items-center`
- **Horizontal Spacing:** `space-x-3` (12px / 0.75rem between icon and text)

**Text Container:**
- **Layout:** Block (default) - contains title and subtitle stacked vertically
- **Spacing:** Default line-height between title and subtitle

### Page Container

**Outer Container:**
- **Min Height:** `min-h-screen` (100vh)
- **Padding:** 
  - Mobile: `p-4` (16px / 1rem)
  - Desktop: `md:p-8` (32px / 2rem)
- **Background:** `bg-black` with `theme-bg-primary` fallback

**Inner Container:**
- **Max Width:** `max-w-6xl` (1152px / 72rem)
- **Centering:** `mx-auto` (horizontal centering)

---

## Complete Code Implementation

### Vue Template

```vue
<template>
  <div class="min-h-screen p-4 md:p-8 bg-black theme-bg-primary">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <!-- Music Icon -->
          <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          
          <!-- Text Content -->
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
            <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
          </div>
        </div>
      </div>

      <!-- Song List Component -->
      <SongList ref="songListRef" />
    </div>
  </div>
</template>
```

### Complete Page Structure

```vue
<template>
  <div class="min-h-screen p-4 md:p-8 bg-black theme-bg-primary">
    <div class="max-w-6xl mx-auto">
      <!-- Header Section -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <!-- Music Icon -->
          <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          
          <!-- Text Content -->
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
            <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
          </div>
        </div>
      </div>

      <!-- Song List Component -->
      <SongList ref="songListRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProfileStore } from '~/store/profileStore';
import SongList from '~/components/dashboard/songList.vue';

definePageMeta({
  middleware: ['auth']
});

const profileStore = useProfileStore();
const songListRef = ref<any>(null);

onMounted(async () => {
  await profileStore.fetchProfile();
});
</script>
```

### CSS Classes Reference

**Container Classes:**
- `min-h-screen` - Minimum height of viewport
- `p-4` - Padding 16px on mobile
- `md:p-8` - Padding 32px on desktop (≥768px)
- `bg-black` - Black background
- `theme-bg-primary` - Theme-aware background fallback

**Layout Classes:**
- `max-w-6xl` - Maximum width 1152px
- `mx-auto` - Horizontal centering
- `flex` - Flexbox layout
- `items-center` - Vertical centering
- `justify-between` - Space between items (left-aligned in practice)
- `space-x-3` - 12px horizontal spacing between flex items

**Icon Classes:**
- `w-12 h-12` - 48px × 48px size
- `bg-gradient-to-r` - Left-to-right gradient
- `from-yellow-400` - Gradient start color (#facc15)
- `to-yellow-500` - Gradient end color (#eab308)
- `rounded-full` - Perfect circle
- `flex items-center justify-center` - Center content

**Typography Classes:**
- `text-2xl` - 24px font size on mobile
- `md:text-3xl` - 30px font size on desktop
- `font-bold` - 700 font weight
- `text-white` - White color
- `text-gray-400` - Gray-400 color
- `theme-text-primary` - Theme-aware text color fallback
- `theme-text-secondary` - Theme-aware secondary text color fallback

---

## Responsive Behavior

### Mobile (< 768px)

**Container:**
- Padding: `p-4` (16px on all sides)
- Full width with horizontal padding

**Icon:**
- Size: 48px × 48px (unchanged)
- Gradient and styling unchanged

**Typography:**
- Title: `text-2xl` (24px)
- Subtitle: Default size (16px)

**Layout:**
- Icon and text remain side-by-side
- 12px spacing between icon and text

### Desktop (≥ 768px)

**Container:**
- Padding: `md:p-8` (32px on all sides)
- Same max-width and centering

**Icon:**
- Size: 48px × 48px (unchanged)
- Gradient and styling unchanged

**Typography:**
- Title: `md:text-3xl` (30px) - larger on desktop
- Subtitle: Default size (16px) - unchanged

**Layout:**
- Icon and text remain side-by-side
- 12px spacing between icon and text

### Breakpoint Details

**Tailwind Breakpoint:** `md:` (≥768px)

**Responsive Changes:**
1. **Page Padding:** 16px → 32px
2. **Title Font Size:** 24px → 30px
3. **All other elements unchanged**

---

## Theme Integration

### CSS Custom Properties

The header uses theme-aware classes that fall back to CSS custom properties:

**Background:**
```css
.theme-bg-primary {
  background-color: var(--theme-bg-primary, #000000);
}
```

**Text Colors:**
```css
.theme-text-primary {
  color: var(--theme-text-primary, #ffffff);
}

.theme-text-secondary {
  color: var(--theme-text-secondary, #9ca3af);
}
```

### Light/Dark Mode Support

**Current Implementation:**
- Uses `bg-black` with `theme-bg-primary` fallback
- Uses `text-white` with `theme-text-primary` fallback
- Uses `text-gray-400` with `theme-text-secondary` fallback

**Theme Variable Mapping:**
- `--theme-bg-primary` → Page background color
- `--theme-text-primary` → Primary text color (white in dark mode)
- `--theme-text-secondary` → Secondary text color (gray-400 in dark mode)

**Icon Colors:**
- Gradient: Fixed colors (`from-yellow-400 to-yellow-500`)
- SVG: Fixed black (`text-black`)

### Theme Consistency

This header matches the design pattern used in other pages:
- **Dashboard:** Similar icon + title pattern
- **Upload Page:** Similar icon + title pattern
- **Account Page:** Different layout but similar typography

---

## Accessibility Features

### Semantic HTML

**Page Structure:**
```html
<div class="min-h-screen p-4 md:p-8 bg-black theme-bg-primary">
  <div class="max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
          <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Accessibility Attributes

**SVG Icon:**
- `aria-hidden="true"` - Decorative icon, hidden from screen readers
- `fill="currentColor"` - Inherits text color for theme compatibility

**Heading Structure:**
- `<h1>` - Primary page heading for screen readers
- Semantic hierarchy maintained

**Text Content:**
- `<p>` - Descriptive subtitle for context

### Screen Reader Support

**Announced Content:**
1. "Your Songs" (h1 heading)
2. "Manage your uploaded tracks" (paragraph)

**Hidden Content:**
- Music icon (decorative only)

### Color Contrast

**Text Contrast:**
- White text on black background: 21:1 (excellent)
- Gray-400 text on black background: 9.48:1 (excellent)

**Icon Contrast:**
- Black icon on yellow gradient: High contrast
- Yellow gradient is bright enough for visibility

### Keyboard Navigation

**Focus Management:**
- No interactive elements in header
- Focus moves naturally to first interactive element (tabs)

---

## Integration Points

### Page Layout Integration

**Container Hierarchy:**
```
Page Container (min-h-screen, p-4 md:p-8, bg-black)
└── Content Container (max-w-6xl, mx-auto)
    ├── Header Section (flex, items-center, mb-8)
    │   ├── Icon Container (w-12 h-12, gradient, rounded-full)
    │   │   └── SVG Icon (w-6 h-6, black)
    │   └── Text Container
    │       ├── H1 Title (text-2xl md:text-3xl, bold, white)
    │       └── P Subtitle (gray-400)
    └── SongList Component
```

### Component Dependencies

**Required Imports:**
```typescript
import { ref, onMounted } from 'vue';
import { useProfileStore } from '~/store/profileStore';
import SongList from '~/components/dashboard/songList.vue';
```

**Store Integration:**
```typescript
const profileStore = useProfileStore();

onMounted(async () => {
  await profileStore.fetchProfile();
});
```

### Middleware Integration

**Page Meta:**
```typescript
definePageMeta({
  middleware: ['auth']
});
```

### Navigation Integration

**URL:** `/my-songs`
**Route:** Handled by Nuxt.js file-based routing
**Authentication:** Required (auth middleware)

---

## Implementation Checklist

### Phase 1: Basic Structure
- [ ] Create page container with proper classes
- [ ] Add max-width container with centering
- [ ] Implement header container with flex layout

### Phase 2: Icon Implementation
- [ ] Create 48px circular container with gradient
- [ ] Add SVG music note icon (24px, black)
- [ ] Ensure proper centering within circle
- [ ] Add `aria-hidden="true"` to SVG

### Phase 3: Typography
- [ ] Implement responsive title (24px mobile, 30px desktop)
- [ ] Add subtitle with gray-400 color
- [ ] Apply theme-aware color classes
- [ ] Ensure proper font weights

### Phase 4: Spacing and Layout
- [ ] Add 12px spacing between icon and text
- [ ] Add 32px bottom margin to header
- [ ] Implement responsive padding (16px mobile, 32px desktop)
- [ ] Ensure proper alignment

### Phase 5: Theme Integration
- [ ] Add theme-aware background classes
- [ ] Add theme-aware text color classes
- [ ] Test light/dark mode compatibility
- [ ] Verify fallback colors

### Phase 6: Accessibility
- [ ] Add semantic HTML structure
- [ ] Include proper heading hierarchy
- [ ] Add ARIA attributes where needed
- [ ] Test with screen reader
- [ ] Verify color contrast ratios

### Phase 7: Integration
- [ ] Connect to profile store
- [ ] Add auth middleware
- [ ] Integrate with SongList component
- [ ] Test page navigation

### Phase 8: Testing
- [ ] Test responsive behavior at all breakpoints
- [ ] Verify theme switching
- [ ] Test accessibility features
- [ ] Cross-browser compatibility
- [ ] Mobile device testing

---

## Testing Requirements

### Visual Testing
- [ ] Icon renders correctly (48px circle, yellow gradient, black SVG)
- [ ] Typography matches specifications (sizes, weights, colors)
- [ ] Spacing is correct (12px between icon/text, 32px bottom margin)
- [ ] Responsive behavior works (padding and title size changes)
- [ ] Theme colors apply correctly

### Functional Testing
- [ ] Page loads without errors
- [ ] Profile store integration works
- [ ] Auth middleware functions correctly
- [ ] Navigation to/from page works
- [ ] SongList component loads after header

### Accessibility Testing
- [ ] Screen reader announces "Your Songs" and subtitle
- [ ] Icon is hidden from screen readers
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation works
- [ ] Focus management is proper

### Responsive Testing
- [ ] Mobile (< 768px): 16px padding, 24px title
- [ ] Desktop (≥ 768px): 32px padding, 30px title
- [ ] Tablet: Proper intermediate behavior
- [ ] Large screens: Max-width constraint works

### Cross-Browser Testing
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile browsers: Touch interaction works

---

## Notes for Mobile Implementation

1. **Touch Targets:** No interactive elements in header, so no touch target concerns

2. **Performance:** Minimal DOM elements, no performance impact

3. **Theme Variables:** Ensure mobile app supports the same CSS custom properties:
   - `--theme-bg-primary`
   - `--theme-text-primary` 
   - `--theme-text-secondary`

4. **Icon Rendering:** SVG renders well on all mobile devices

5. **Typography Scaling:** Respects system font size preferences

6. **Safe Areas:** No elements extend to screen edges, safe area compatible

---

**End of Document**
