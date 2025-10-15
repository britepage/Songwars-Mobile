# Upload Guidelines Section - Complete Implementation Code

**Document Purpose**: This document provides the EXACT Upload Guidelines section implementation from the production web app, ready for direct copy-paste into mobile app.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/dashboard/songUploader.vue` (lines 260-294)

---

## Complete Vue Template

**Copy-paste ready template for Upload Guidelines section:**

```vue
<!-- Upload Guidelines -->
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Upload Guidelines
  </h3>
  
  <div class="space-y-3 text-sm theme-text-secondary">
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Only original music you own the rights to</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>High quality audio files (MP3, WAV, M4A)</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Maximum file size: 50MB</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Songs enter the weekly battle rotation</span>
    </div>
  </div>
</div>
```

---

## Icon SVG Code

### Header Icon: Info Circle

**Copy-paste ready SVG:**

```vue
<svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

**Specifications**:
- Size: 20px × 20px (`w-5 h-5`)
- Right margin: 8px (`mr-2`)
- Color: Yellow #ffd200 (`text-[#ffd200]`)
- Style: Outline (not filled)
- Stroke width: 2px

**Visual**: Circle with lowercase 'i' inside

---

### Checkmark Icon: Circle with Check

**Copy-paste ready SVG (used 4 times):**

```vue
<svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

**Specifications**:
- Size: 16px × 16px (`w-4 h-4`)
- Right margin: 8px (`mr-2`)
- Top margin: 2px (`mt-0.5`) - for alignment with text
- Color: Yellow #ffd200 (`text-[#ffd200]`)
- Style: Filled (`fill="currentColor"`)
- No shrink: `flex-shrink-0` - prevents icon from shrinking

**Visual**: Filled circle with checkmark inside

---

## Guidelines Text

### Four Guidelines (Exact Text)

1. **Guideline 1**:
```
Only original music you own the rights to
```

2. **Guideline 2**:
```
High quality audio files (MP3, WAV, M4A)
```

3. **Guideline 3**:
```
Maximum file size: 50MB
```

4. **Guideline 4**:
```
Songs enter the weekly battle rotation
```

**Important**: Use exact text, no modifications or clarifications

---

## CSS Classes Reference

### Card Container

```css
rounded-2xl p-6 border theme-bg-card theme-border-card
```

- `rounded-2xl` - 16px border radius
- `p-6` - 24px padding all sides
- `border` - 1px border
- `theme-bg-card` - Theme background
- `theme-border-card` - Theme border color

### Section Header

```css
text-lg font-semibold theme-text-primary mb-4 flex items-center
```

- `text-lg` - 18px font size
- `font-semibold` - 600 font weight
- `theme-text-primary` - Primary text color
- `mb-4` - 16px bottom margin
- `flex items-center` - Flexbox with vertical centering

### Header Icon

```css
w-5 h-5 mr-2 text-[#ffd200]
```

- `w-5 h-5` - 20px × 20px
- `mr-2` - 8px right margin
- `text-[#ffd200]` - Yellow color

### Guidelines List Container

```css
space-y-3 text-sm theme-text-secondary
```

- `space-y-3` - 12px vertical spacing between items
- `text-sm` - 14px font size
- `theme-text-secondary` - Secondary text color (gray)

### Guideline Item

```css
flex items-start
```

- `flex` - Flexbox layout
- `items-start` - Align items to top (for multi-line text)

### Checkmark Icon

```css
w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0
```

- `w-4 h-4` - 16px × 16px
- `mr-2` - 8px right margin
- `mt-0.5` - 2px top margin (alignment)
- `text-[#ffd200]` - Yellow color
- `flex-shrink-0` - Don't shrink icon

---

## Complete Code Blocks

### Template Only (Copy-Paste)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Upload Guidelines
  </h3>
  <div class="space-y-3 text-sm theme-text-secondary">
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Only original music you own the rights to</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>High quality audio files (MP3, WAV, M4A)</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Maximum file size: 50MB</span>
    </div>
    <div class="flex items-start">
      <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Songs enter the weekly battle rotation</span>
    </div>
  </div>
</div>
```

### Script Implementation

**No special script logic needed** - this is pure static content.

**Optional** (if you want to make guidelines configurable):

```typescript
const guidelines = [
  'Only original music you own the rights to',
  'High quality audio files (MP3, WAV, M4A)',
  'Maximum file size: 50MB',
  'Songs enter the weekly battle rotation'
]
```

**Then in template:**

```vue
<div v-for="(guideline, index) in guidelines" :key="index" class="flex items-start">
  <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
  <span>{{ guideline }}</span>
</div>
```

---

## Ionic/Mobile Adaptations

### For Ionic Framework

**Replace card with ion-card:**

```vue
<ion-card class="guidelines-card">
  <ion-card-header>
    <ion-card-title class="guidelines-header">
      <svg class="header-icon" ...>...</svg>
      Upload Guidelines
    </ion-card-title>
  </ion-card-header>
  
  <ion-card-content>
    <div class="guidelines-list">
      <div class="guideline-item">
        <svg class="checkmark-icon" ...>...</svg>
        <span>Only original music you own the rights to</span>
      </div>
      <!-- Repeat for other guidelines -->
    </div>
  </ion-card-content>
</ion-card>
```

**Custom CSS for Ionic:**

```css
.guidelines-card {
  border-radius: 16px;
  padding: 24px;
  margin: 0;
}

.guidelines-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.header-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #ffd200;
}

.guidelines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.guideline-item {
  display: flex;
  align-items: flex-start;
}

.checkmark-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  margin-top: 2px;
  color: #ffd200;
  flex-shrink: 0;
}
```

---

## Icon Specifications

### Info Circle Icon (Header)

**SVG Code**:
```xml
<svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

**Attributes**:
- `fill="none"` - Outline style
- `stroke="currentColor"` - Uses text color
- `stroke-width="2"` - 2px stroke
- `viewBox="0 0 24 24"` - 24×24 coordinate system

**Path Explanation**:
- Circle: `M21 12a9 9 0 11-18 0 9 9 0 0118 0z`
- Info symbol: `M13 16h-1v-4h-1m1-4h.01`

**Visual**: Circle with 'i' (information symbol)

---

### Checkmark Circle Icon (Guidelines)

**SVG Code** (reused 4 times):
```xml
<svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

**Attributes**:
- `fill="currentColor"` - Filled style
- `viewBox="0 0 24 24"` - 24×24 coordinate system

**Path Explanation**:
- Circle: `m6 2a9 9 0 11-18 0 9 9 0 0118 0z`
- Checkmark: `M9 12l2 2 4-4`

**Visual**: Filled circle with checkmark inside

---

## Styling Specifications

### Colors

| Element | Color | Hex/Class |
|---------|-------|-----------|
| **Header Icon** | Yellow | #ffd200 |
| **Checkmark Icons** | Yellow | #ffd200 |
| **Header Text** | Theme Primary | `theme-text-primary` |
| **Guideline Text** | Theme Secondary | `theme-text-secondary` |

### Spacing

| Element | Spacing | Pixels | Class |
|---------|---------|--------|-------|
| **Card Padding** | 6 | 24px | `p-6` |
| **Header Bottom** | 4 | 16px | `mb-4` |
| **Between Guidelines** | 3 | 12px | `space-y-3` |
| **Header Icon Right** | 2 | 8px | `mr-2` |
| **Checkmark Right** | 2 | 8px | `mr-2` |
| **Checkmark Top** | 0.5 | 2px | `mt-0.5` |

### Typography

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| **Header** | 18px | Semibold (600) | `text-lg font-semibold` |
| **Guidelines** | 14px | Normal (400) | `text-sm` |

### Layout

| Element | Display | Alignment | Class |
|---------|---------|-----------|-------|
| **Header** | Flex | Vertical center | `flex items-center` |
| **Guideline Item** | Flex | Top aligned | `flex items-start` |

**Why `items-start`**: Allows icon to stay at top if text wraps to multiple lines

---

## Implementation Notes

### No Script Logic Required

This section is **pure static content**. No reactive data, computed properties, or methods needed.

**Minimal script**:
```typescript
// No special code needed
```

### Icon Alignment

**Checkmark icons use `mt-0.5` (2px top margin)**:

**Purpose**: Visually aligns icon with first line of text

**Why needed**: 
- Text has line-height that extends above/below
- Small top margin centers icon with text baseline
- Creates better visual alignment

### Icon No-Shrink

**Checkmark icons use `flex-shrink-0`**:

**Purpose**: Prevents icon from shrinking if container width is constrained

**Why needed**:
- Ensures icons stay 16px even if text wraps
- Maintains visual consistency
- Prevents distortion

### Theme Classes

**Theme-aware classes used**:
- `theme-bg-card` - Card background
- `theme-border-card` - Card border
- `theme-text-primary` - Header text
- `theme-text-secondary` - Guideline text

**For mobile without theme system**: Replace with specific colors (see Song Details doc for mappings)

---

## Quick Implementation Guide

### Step 1: Copy Template

Copy the complete template block into your component's template section.

### Step 2: Verify Theme Classes

Ensure your app has theme classes defined, or replace with specific colors:
- `theme-bg-card` → `bg-white` or `bg-gray-800`
- `theme-border-card` → `border-gray-200` or `border-gray-700`
- `theme-text-primary` → `text-black` or `text-white`
- `theme-text-secondary` → `text-gray-600` or `text-gray-400`

### Step 3: Test Display

Check that:
- Yellow info icon appears in header
- Yellow checkmarks appear before each guideline
- Text is properly aligned
- Spacing matches web app

---

## Ionic Implementation Example

**Complete Ionic version:**

```vue
<template>
  <ion-card class="guidelines-card">
    <ion-card-header>
      <ion-card-title class="guidelines-header">
        <svg class="header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Upload Guidelines
      </ion-card-title>
    </ion-card-header>
    
    <ion-card-content>
      <div class="guidelines-list">
        <div class="guideline-item">
          <svg class="checkmark-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Only original music you own the rights to</span>
        </div>
        <div class="guideline-item">
          <svg class="checkmark-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>High quality audio files (MP3, WAV, M4A)</span>
        </div>
        <div class="guideline-item">
          <svg class="checkmark-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Maximum file size: 50MB</span>
        </div>
        <div class="guideline-item">
          <svg class="checkmark-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Songs enter the weekly battle rotation</span>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<style scoped>
.guidelines-card {
  border-radius: 16px;
  margin: 0;
}

.guidelines-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.header-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: #ffd200;
}

.guidelines-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
}

.guideline-item {
  display: flex;
  align-items: flex-start;
}

.checkmark-icon {
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin-right: 8px;
  margin-top: 2px;
  color: #ffd200;
}
</style>
```

---

## Implementation Checklist

### Template
- [ ] Add card container with rounded-2xl, p-6, border
- [ ] Add section header with "Upload Guidelines" text
- [ ] Add info circle SVG icon (20px yellow) in header
- [ ] Add guidelines container with space-y-3
- [ ] Add 4 guideline items with flex items-start
- [ ] Add checkmark SVG icons (16px yellow) before each
- [ ] Use exact guideline text

### Icons
- [ ] Header icon: Info circle (outline, 20px)
- [ ] Checkmark icons: Circle with check (filled, 16px)
- [ ] All icons in yellow (#ffd200)
- [ ] Use exact SVG paths provided

### Styling
- [ ] Card border radius: 16px
- [ ] Card padding: 24px
- [ ] Header font: 18px semibold
- [ ] Guidelines font: 14px normal
- [ ] Spacing between guidelines: 12px
- [ ] Icon margins: 8px right, 2px top (checkmarks)

### Colors
- [ ] Yellow icons: #ffd200
- [ ] Header text: Theme primary or black
- [ ] Guideline text: Theme secondary or gray
- [ ] Theme-aware background and border

---

## Quick Reference

### Header Icon SVG Path

```
d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
```

### Checkmark Icon SVG Path

```
d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
```

### Yellow Color

```
#ffd200
```

### Guidelines Text

```
1. Only original music you own the rights to
2. High quality audio files (MP3, WAV, M4A)
3. Maximum file size: 50MB
4. Songs enter the weekly battle rotation
```

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue` (lines 260-294)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

