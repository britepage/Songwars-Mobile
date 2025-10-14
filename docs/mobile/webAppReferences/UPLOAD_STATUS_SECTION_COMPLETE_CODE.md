# Upload Status Section - Complete Implementation Code

**Document Purpose**: This document provides the EXACT Upload Status section implementation from the production web app, ready for direct copy-paste into mobile app.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/dashboard/songUploader.vue` (lines 140-203, 368-377)

---

## Complete Vue Template

**Copy-paste ready template for Upload Status section:**

```vue
<!-- Upload Status -->
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Upload Status
  </h3>
  
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">File Selected</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="selectedFile ? 'text-green-400' : 'theme-text-muted'">
          {{ selectedFile ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">Details Complete</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="(songTitle && songArtist && songGenre) ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="(songTitle && songArtist && songGenre) ? 'text-green-400' : 'theme-text-muted'">
          {{ (songTitle && songArtist && songGenre) ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">File Verified</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" 
             :class="{
               'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
               'bg-red-400': uploadStore.isDuplicate,
               'bg-yellow-400': uploadStore.isGeneratingFingerprint,
               'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
             }"></div>
        <span class="text-sm" 
              :class="{
                'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
                'text-red-400': uploadStore.isDuplicate,
                'text-yellow-400': uploadStore.isGeneratingFingerprint,
                'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
              }">
          {{ uploadStore.isGeneratingFingerprint ? 'Processing...' : 
             uploadStore.isDuplicate ? 'Duplicate' :
             uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}
        </span>
      </div>
    </div>
    
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">Ready to Upload</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="canUpload ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="canUpload ? 'text-green-400' : 'theme-text-muted'">
          {{ canUpload ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
  </div>
</div>
```

---

## Complete Script Implementation

### Required Imports

```typescript
import { ref, computed } from 'vue'
import { useUploadStore } from '~/store/uploadStore'
```

### Store Integration

```typescript
const uploadStore = useUploadStore()
```

### State References (from component)

```typescript
// These refs should already exist in your component
const selectedFile = ref<File | null>(null)
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const rightsConfirmed = ref(false)
```

### Computed Property: canUpload

```typescript
const canUpload = computed(() => {
  return selectedFile.value && 
         songTitle.value && 
         songArtist.value && 
         songGenre.value && 
         rightsConfirmed.value && 
         !uploadStore.uploading &&
         uploadStore.fingerprintGenerated &&
         !uploadStore.isDuplicate
})
```

### Upload Store State Requirements

**Your uploadStore must expose these state properties:**

```typescript
// In store/uploadStore.ts
const fingerprintGenerated = ref(false)
const isDuplicate = ref(false)
const isGeneratingFingerprint = ref(false)
const uploading = ref(false)

return {
  fingerprintGenerated,
  isDuplicate,
  isGeneratingFingerprint,
  uploading,
  // ... other exports
}
```

---

## Header Icon: Yellow Checkmark Circle

**Complete SVG code:**

```vue
<svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

**Specifications**:
- Size: 20px × 20px (`w-5 h-5`)
- Right margin: 8px (`mr-2`)
- Color: Yellow #ffd200 (`text-[#ffd200]`)
- Style: Outline (not filled)
- Stroke width: 2px

**Visual**: Circle with checkmark inside

---

## Status Row Logic

### Row 1: File Selected

**Condition**: `selectedFile ? true : false`

**Dot Color**:
- True: Green (`bg-green-400`)
- False: Gray (`bg-gray-600`)

**Status Text**:
- True: "Yes" (`text-green-400`)
- False: "No" (`theme-text-muted`)

**Code**:
```vue
<div class="flex items-center justify-between">
  <span class="theme-text-secondary">File Selected</span>
  <div class="flex items-center">
    <div class="w-2 h-2 rounded-full mr-2" :class="selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
    <span class="text-sm" :class="selectedFile ? 'text-green-400' : 'theme-text-muted'">
      {{ selectedFile ? 'Yes' : 'No' }}
    </span>
  </div>
</div>
```

---

### Row 2: Details Complete

**Condition**: `(songTitle && songArtist && songGenre) ? true : false`

**Dot Color**:
- True: Green (`bg-green-400`)
- False: Gray (`bg-gray-600`)

**Status Text**:
- True: "Yes" (`text-green-400`)
- False: "No" (`theme-text-muted`)

**Code**:
```vue
<div class="flex items-center justify-between">
  <span class="theme-text-secondary">Details Complete</span>
  <div class="flex items-center">
    <div class="w-2 h-2 rounded-full mr-2" :class="(songTitle && songArtist && songGenre) ? 'bg-green-400' : 'bg-gray-600'"></div>
    <span class="text-sm" :class="(songTitle && songArtist && songGenre) ? 'text-green-400' : 'theme-text-muted'">
      {{ (songTitle && songArtist && songGenre) ? 'Yes' : 'No' }}
    </span>
  </div>
</div>
```

---

### Row 3: File Verified (Complex)

**Four possible states:**

| State | Dot Color | Text | Text Color | Condition |
|-------|-----------|------|------------|-----------|
| **Verified** | Green | "Verified" | Green 400 | `fingerprintGenerated && !isDuplicate` |
| **Duplicate** | Red | "Duplicate" | Red 400 | `isDuplicate` |
| **Processing** | Yellow | "Processing..." | Yellow 400 | `isGeneratingFingerprint` |
| **Pending** | Gray | "Pending" | Muted | None of above |

**Code**:
```vue
<div class="flex items-center justify-between">
  <span class="theme-text-secondary">File Verified</span>
  <div class="flex items-center">
    <div class="w-2 h-2 rounded-full mr-2" 
         :class="{
           'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
           'bg-red-400': uploadStore.isDuplicate,
           'bg-yellow-400': uploadStore.isGeneratingFingerprint,
           'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
         }"></div>
    <span class="text-sm" 
          :class="{
            'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
            'text-red-400': uploadStore.isDuplicate,
            'text-yellow-400': uploadStore.isGeneratingFingerprint,
            'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
          }">
      {{ uploadStore.isGeneratingFingerprint ? 'Processing...' : 
         uploadStore.isDuplicate ? 'Duplicate' :
         uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}
    </span>
  </div>
</div>
```

---

### Row 4: Ready to Upload

**Condition**: `canUpload` (computed property)

**Dot Color**:
- True: Green (`bg-green-400`)
- False: Gray (`bg-gray-600`)

**Status Text**:
- True: "Yes" (`text-green-400`)
- False: "No" (`theme-text-muted`)

**Code**:
```vue
<div class="flex items-center justify-between">
  <span class="theme-text-secondary">Ready to Upload</span>
  <div class="flex items-center">
    <div class="w-2 h-2 rounded-full mr-2" :class="canUpload ? 'bg-green-400' : 'bg-gray-600'"></div>
    <span class="text-sm" :class="canUpload ? 'text-green-400' : 'theme-text-muted'">
      {{ canUpload ? 'Yes' : 'No' }}
    </span>
  </div>
</div>
```

---

## Complete Working Component

**Full component with all code combined:**

```vue
<template>
  <!-- Upload Status -->
  <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
    <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
      <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Upload Status
    </h3>
    
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="theme-text-secondary">File Selected</span>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full mr-2" :class="selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
          <span class="text-sm" :class="selectedFile ? 'text-green-400' : 'theme-text-muted'">
            {{ selectedFile ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="theme-text-secondary">Details Complete</span>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full mr-2" :class="(songTitle && songArtist && songGenre) ? 'bg-green-400' : 'bg-gray-600'"></div>
          <span class="text-sm" :class="(songTitle && songArtist && songGenre) ? 'text-green-400' : 'theme-text-muted'">
            {{ (songTitle && songArtist && songGenre) ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="theme-text-secondary">File Verified</span>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full mr-2" 
               :class="{
                 'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
                 'bg-red-400': uploadStore.isDuplicate,
                 'bg-yellow-400': uploadStore.isGeneratingFingerprint,
                 'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
               }"></div>
          <span class="text-sm" 
                :class="{
                  'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
                  'text-red-400': uploadStore.isDuplicate,
                  'text-yellow-400': uploadStore.isGeneratingFingerprint,
                  'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
                }">
            {{ uploadStore.isGeneratingFingerprint ? 'Processing...' : 
               uploadStore.isDuplicate ? 'Duplicate' :
               uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}
          </span>
        </div>
      </div>
      
      <div class="flex items-center justify-between">
        <span class="theme-text-secondary">Ready to Upload</span>
        <div class="flex items-center">
          <div class="w-2 h-2 rounded-full mr-2" :class="canUpload ? 'bg-green-400' : 'bg-gray-600'"></div>
          <span class="text-sm" :class="canUpload ? 'text-green-400' : 'theme-text-muted'">
            {{ canUpload ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUploadStore } from '~/store/uploadStore'

// Upload store
const uploadStore = useUploadStore()

// Form state (these should already exist in your component)
const selectedFile = ref<File | null>(null)
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const rightsConfirmed = ref(false)

// Computed: Can upload when all requirements met
const canUpload = computed(() => {
  return selectedFile.value && 
         songTitle.value && 
         songArtist.value && 
         songGenre.value && 
         rightsConfirmed.value && 
         !uploadStore.uploading &&
         uploadStore.fingerprintGenerated &&
         !uploadStore.isDuplicate
})
</script>
```

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

### Header Icon (Yellow Checkmark)

```css
w-5 h-5 mr-2 text-[#ffd200]
```

- `w-5 h-5` - 20px × 20px
- `mr-2` - 8px right margin
- `text-[#ffd200]` - Yellow color

### Status Container

```css
space-y-3
```

- 12px vertical spacing between rows

### Status Row

```css
flex items-center justify-between
```

- `flex` - Flexbox layout
- `items-center` - Vertical centering
- `justify-between` - Label left, status right

### Row Label

```css
theme-text-secondary
```

- Secondary text color (gray in dark mode)

### Status Indicator Container

```css
flex items-center
```

- `flex` - Flexbox layout
- `items-center` - Vertical centering
- Contains: Dot + Text

### Status Dot

```css
w-2 h-2 rounded-full mr-2
```

- `w-2 h-2` - 8px × 8px
- `rounded-full` - Circle (50% radius)
- `mr-2` - 8px right margin

**Dynamic Color Classes**:
- `bg-green-400` - Success/verified
- `bg-red-400` - Error/duplicate
- `bg-yellow-400` - Processing
- `bg-gray-600` - Pending/inactive

### Status Text

```css
text-sm
```

- `text-sm` - 14px font size

**Dynamic Color Classes**:
- `text-green-400` - Success/verified
- `text-red-400` - Error/duplicate
- `text-yellow-400` - Processing
- `theme-text-muted` - Pending/inactive

---

## Complete Code Blocks

### Template Only (Copy-Paste)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Upload Status
  </h3>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">File Selected</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="selectedFile ? 'text-green-400' : 'theme-text-muted'">{{ selectedFile ? 'Yes' : 'No' }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">Details Complete</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="(songTitle && songArtist && songGenre) ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="(songTitle && songArtist && songGenre) ? 'text-green-400' : 'theme-text-muted'">{{ (songTitle && songArtist && songGenre) ? 'Yes' : 'No' }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">File Verified</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="{'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate, 'bg-red-400': uploadStore.isDuplicate, 'bg-yellow-400': uploadStore.isGeneratingFingerprint, 'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate}"></div>
        <span class="text-sm" :class="{'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate, 'text-red-400': uploadStore.isDuplicate, 'text-yellow-400': uploadStore.isGeneratingFingerprint, 'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate}">{{ uploadStore.isGeneratingFingerprint ? 'Processing...' : uploadStore.isDuplicate ? 'Duplicate' : uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">Ready to Upload</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="canUpload ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="canUpload ? 'text-green-400' : 'theme-text-muted'">{{ canUpload ? 'Yes' : 'No' }}</span>
      </div>
    </div>
  </div>
</div>
```

### Script Only (Copy-Paste)

```typescript
import { ref, computed } from 'vue'
import { useUploadStore } from '~/store/uploadStore'

const uploadStore = useUploadStore()
const selectedFile = ref<File | null>(null)
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const rightsConfirmed = ref(false)

const canUpload = computed(() => {
  return selectedFile.value && 
         songTitle.value && 
         songArtist.value && 
         songGenre.value && 
         rightsConfirmed.value && 
         !uploadStore.uploading &&
         uploadStore.fingerprintGenerated &&
         !uploadStore.isDuplicate
})
```

---

## Ionic/Mobile Adaptations

### For Ionic Framework

**Replace card with ion-card:**

```vue
<ion-card class="upload-status-card">
  <ion-card-header>
    <ion-card-title class="status-header">
      <svg class="header-icon" ...>...</svg>
      Upload Status
    </ion-card-title>
  </ion-card-header>
  
  <ion-card-content>
    <!-- Status rows here -->
  </ion-card-content>
</ion-card>
```

**Custom CSS for Ionic:**

```css
.upload-status-card {
  border-radius: 16px;
  padding: 24px;
  margin: 0;
}

.status-header {
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
```

### Status Dot Component (Reusable)

**Create reusable component for status dots:**

```vue
<template>
  <div class="flex items-center">
    <div class="status-dot" :class="dotColor"></div>
    <span class="status-text" :class="textColor">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dotColor: string
  textColor: string
  text: string
}>()
</script>

<style scoped>
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}
.status-text {
  font-size: 14px;
}
</style>
```

**Usage:**

```vue
<StatusDot 
  :dotColor="selectedFile ? 'bg-green-400' : 'bg-gray-600'"
  :textColor="selectedFile ? 'text-green-400' : 'theme-text-muted'"
  :text="selectedFile ? 'Yes' : 'No'"
/>
```

---

## Implementation Checklist

### Setup
- [ ] Import required dependencies (ref, computed)
- [ ] Import useUploadStore
- [ ] Initialize uploadStore reference
- [ ] Create state refs (selectedFile, songTitle, songArtist, songGenre, rightsConfirmed)

### Template
- [ ] Add card container with styling
- [ ] Add section header with yellow checkmark SVG
- [ ] Add status container with space-y-3
- [ ] Add 4 status rows (File Selected, Details Complete, File Verified, Ready to Upload)
- [ ] Each row: label left, dot + text right

### Status Logic
- [ ] Row 1: Check selectedFile boolean
- [ ] Row 2: Check all three form fields filled
- [ ] Row 3: Check uploadStore states (4 conditions)
- [ ] Row 4: Use canUpload computed property

### Computed Property
- [ ] Create canUpload computed property
- [ ] Check 8 conditions (file, title, artist, genre, rights, !uploading, fingerprint, !duplicate)

### Styling
- [ ] Apply theme classes for light/dark mode
- [ ] Use exact Tailwind classes from reference
- [ ] Verify yellow color is #ffd200
- [ ] Verify dot size is 8px × 8px
- [ ] Verify spacing is 12px between rows

### Store Integration
- [ ] Ensure uploadStore exposes: fingerprintGenerated, isDuplicate, isGeneratingFingerprint, uploading
- [ ] Verify reactive updates work
- [ ] Test all status states change correctly

---

## Quick Reference

### Header SVG (Yellow Checkmark)

```vue
<svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
</svg>
```

### Status Dot Pattern

```vue
<div class="w-2 h-2 rounded-full mr-2" :class="condition ? 'bg-green-400' : 'bg-gray-600'"></div>
```

### Status Text Pattern

```vue
<span class="text-sm" :class="condition ? 'text-green-400' : 'theme-text-muted'">
  {{ condition ? 'Yes' : 'No' }}
</span>
```

### canUpload Logic

```typescript
selectedFile && songTitle && songArtist && songGenre && 
rightsConfirmed && !uploading && fingerprintGenerated && !isDuplicate
```

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue` (lines 140-203)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

