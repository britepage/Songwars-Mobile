# Upload Song Page - Web App Implementation Reference

**Document Purpose**: This document provides complete implementation details of the Upload Song functionality from the production web app, enabling exact mobile app parity with all features and workflows.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `pages/dashboard.vue` (lines 86-109)
- `components/dashboard/songUploader.vue` (complete file, 652 lines)
- `store/uploadStore.ts` (upload logic and state management)

---

## Table of Contents

1. [Overview](#overview)
2. [Page Integration](#page-integration)
3. [Visual Layout](#visual-layout)
4. [File Upload Section](#file-upload-section)
5. [Song Details Form](#song-details-form)
6. [Waveform Clip Selection](#waveform-clip-selection)
7. [Upload Status Panel](#upload-status-panel)
8. [Rights Confirmation](#rights-confirmation)
9. [Upload Button States](#upload-button-states)
10. [Upload Guidelines Panel](#upload-guidelines-panel)
11. [Error Display](#error-display)
12. [Upload Workflow](#upload-workflow)
13. [Technical Implementation](#technical-implementation)
14. [Complete Code References](#complete-code-references)

---

## Overview

The Upload Song functionality is **integrated into the Dashboard page**, not a separate page. It's accessed via a section parameter and provides a complete workflow for artists to upload their music to the SongWars platform.

**Key Features:**
- Drag-and-drop file upload
- Automatic format conversion (WAV → MP3)
- Duplicate detection via audio fingerprinting
- 30-second clip selection with waveform visualization
- Real-time upload status tracking
- Rights confirmation requirement
- Comprehensive error handling
- Auto-extraction of metadata from filenames

**Access Methods:**
- Dashboard URL with query parameter: `/dashboard?section=upload`
- Footer navigation "Upload" button
- Direct navigation from other pages

---

## Page Integration

### Dashboard Integration

**Location**: `pages/dashboard.vue` (lines 86-109)

```vue
<!-- Upload Section -->
<div v-if="activeSection === 'upload'" class="h-full overflow-y-auto p-4 md:p-8 theme-bg-primary">
  <div class="w-full max-w-6xl mx-auto">
    <!-- Upload Header -->
    <div class="text-center md:text-left mb-8">
      <div class="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-3 md:space-y-0 md:space-x-3 mb-4">
        <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-black font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
          </svg>
        </div>
        <div class="text-center md:text-left">
          <h2 class="text-2xl md:text-3xl font-bold theme-text-primary">Upload Your Song</h2>
          <p class="theme-text-secondary">Share your music with the SongWars community</p>
        </div>
      </div>
    </div>

    <!-- Song Uploader Component -->
    <div>
      <SongUploader @upload-complete="handleUploadComplete" />
    </div>
  </div>
</div>
```

### Section State Management

**Location**: `pages/dashboard.vue` (lines 151, 158-167)

```typescript
// Active section state
const activeSection = ref('battle')

// Watch for URL query parameter changes
watch(() => route.query.section, (newSection) => {
  if (newSection === 'upload') {
    activeSection.value = 'upload'
  } else {
    activeSection.value = 'battle'
    // Reset battle completion state when switching to battle section
    isBattleComplete.value = false
    isBattleInProgress.value = false
  }
}, { immediate: true })
```

### Navigation

Users access upload via:
1. **Footer Navigation**: Click "Upload" button
2. **Direct URL**: Navigate to `/dashboard?section=upload`
3. **Programmatic**: `router.push('/dashboard?section=upload')`

### Post-Upload Behavior

**Location**: `pages/dashboard.vue` (lines 227-231)

```typescript
const handleUploadComplete = () => {
  console.log('[Dashboard] Upload completed successfully')
  router.push('/my-songs')
}
```

After successful upload, user is redirected to "My Songs" page.

---

## Visual Layout

### Overall Structure

**Two-Column Responsive Grid Layout**

```vue
<div class="max-w-7xl mx-auto space-y-8">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <!-- Left Column - Main Upload Area (2/3 width on desktop) -->
    <div class="lg:col-span-2 space-y-6">
      <!-- File Upload Section -->
      <!-- Song Details Section -->
      <!-- Waveform Clip Selection -->
    </div>

    <!-- Right Column - Upload Actions & Status (1/3 width on desktop) -->
    <div class="lg:col-span-1 space-y-6">
      <!-- Upload Status Panel -->
      <!-- Rights Confirmation -->
      <!-- Upload Button -->
      <!-- Upload Guidelines -->
    </div>
  </div>

  <!-- Error Display (full width at bottom) -->
</div>
```

### Layout Specifications

| Element | Mobile | Desktop | Classes |
|---------|--------|---------|---------|
| **Container** | Full width | 1280px max | `max-w-7xl mx-auto` |
| **Grid** | 1 column | 3 columns (2:1 split) | `grid-cols-1 lg:grid-cols-3` |
| **Gap** | 32px | 32px | `gap-8` |
| **Vertical Spacing** | 24px | 24px | `space-y-6` |
| **Left Column** | 1 column | 2 columns | `lg:col-span-2` |
| **Right Column** | 1 column | 1 column | `lg:col-span-1` |

### Section Card Styling

All major sections use consistent card styling:

```css
rounded-2xl           /* 16px border radius */
p-6                  /* 24px padding */
border               /* 1px border */
theme-bg-card        /* Theme-aware background */
theme-border-card    /* Theme-aware border color */
```

---

## File Upload Section

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ 🔽 Select Audio File                           │
├─────────────────────────────────────────────────┤
│                                                 │
│              [Empty State]                      │
│                  ☁️                             │
│           Upload your song                      │
│    Drag and drop an audio file or browse       │
│         MP3, WAV, M4A up to 50MB               │
│                                                 │
│              [File Selected]                    │
│                  🎵                             │
│            my-song.mp3                          │
│            Original: 5.2 MB                     │
│          After conversion: 520 KB               │
│              90% smaller                        │
│           [Remove file]                         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure (Empty State)

**Location**: `songUploader.vue` (lines 10-36)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
    </svg>
    Select Audio File
  </h3>
  
  <div 
    @click="fileInput?.click()"
    @dragover.prevent
    @drop.prevent="handleDrop"
    class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#ffd200] transition-colors cursor-pointer group"
    :class="{ 'border-[#ffd200] bg-[#ffd200]/5': selectedFile }"
  >
    <div v-if="!selectedFile" class="space-y-4">
      <div class="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-[#ffd200] group-hover:text-black transition-colors">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
        </svg>
      </div>
      <div>
        <p class="text-xl font-medium theme-text-primary mb-2">Upload your song</p>
        <p class="theme-text-secondary">Drag and drop an audio file or <span class="text-[#ffd200] font-medium">browse</span></p>
        <p class="text-sm theme-text-muted mt-2">MP3, WAV, M4A up to 50MB</p>
      </div>
    </div>
  </div>
</div>
```

### HTML Structure (File Selected)

**Location**: `songUploader.vue` (lines 38-61)

```vue
<div v-else class="space-y-3">
  <div class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center">
    <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  </div>
  <div>
    <p class="text-lg font-medium text-[#ffd200]">{{ selectedFile.name }}</p>
    <div class="theme-text-secondary space-y-1">
      <p>Original: {{ formatFileSize(selectedFile.size) }}</p>
      <div v-if="needsConversion" class="text-sm">
        <p class="text-green-400">After conversion: {{ estimatedFileSize }}</p>
        <p class="text-green-300 text-xs">{{ compressionInfo }}</p>
        <p v-if="selectedFile?.name.toLowerCase().endsWith('.wav')" class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
      </div>
    </div>
    <button 
      @click.stop="clearFile"
      class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
    >
      Remove file
    </button>
  </div>
</div>
```

### Drag-and-Drop Zone Styling

| State | Border | Background | Icon Color | Classes |
|-------|--------|-----------|------------|---------|
| **Empty** | Dashed gray-600 | Transparent | Gray-700 | `border-gray-600` |
| **Hover (Empty)** | Dashed yellow | Transparent | Yellow (#ffd200) | `hover:border-[#ffd200] group-hover:bg-[#ffd200]` |
| **File Selected** | Dashed yellow | Yellow 5% opacity | Yellow | `border-[#ffd200] bg-[#ffd200]/5` |

### File Input Element

**Location**: `songUploader.vue` (lines 64-70)

```vue
<input
  type="file"
  @change="handleFileChange"
  accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
  ref="fileInput"
  class="hidden"
/>
```

**Accepted Formats**:
- `.mp3` - MP3 audio
- `.wav` - WAV audio
- `.m4a` - M4A/AAC audio
- `.aac` - AAC audio
- `.ogg` - OGG audio
- `audio/*` - Any audio MIME type

### Text Content

#### Section Title
```
Select Audio File
```

#### Empty State Text
```
Upload your song
Drag and drop an audio file or browse
MP3, WAV, M4A up to 50MB
```
- "browse" is highlighted in yellow (#ffd200)

#### File Selected State
```
{filename}
Original: {size}
After conversion: {estimatedSize}  (if conversion needed)
{compressionPercent}% smaller after MP3 conversion
⚡ Converting to MP3 (may take 30-60s)  (if WAV file)
```

#### Button Text
```
Remove file
```
- Red color (`text-red-400 hover:text-red-300`)

---

## Song Details Form

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ 🎵 Song Details                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Song Title *                                    │
│ ┌─────────────────────────────────────────────┐ │
│ │ Enter song title                            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Artist Name *        Genre *                    │
│ ┌──────────────────┐ ┌──────────────────────┐  │
│ │ Enter artist name│ │ Select Genre ▼      │  │
│ └──────────────────┘ └──────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 74-124)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-6 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
    </svg>
    Song Details
  </h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Song Title -->
    <div class="md:col-span-2">
      <label class="block text-sm font-medium theme-text-secondary mb-2">Song Title</label>
      <input
        type="text"
        v-model="songTitle"
        placeholder="Enter song title"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
      />
    </div>
    
    <!-- Artist Name -->
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Artist Name</label>
      <input
        type="text"
        v-model="songArtist"
        placeholder="Enter artist name"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
      />
    </div>
    
    <!-- Genre -->
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
      <select
        v-model="songGenre"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled class="theme-bg-card">Select Genre</option>
        <option 
          v-for="genre in genres" 
          :key="genre" 
          :value="genre" 
          class="theme-bg-card theme-text-primary"
        >
          {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
        </option>
      </select>
    </div>
  </div>
</div>
```

### Form Fields

#### 1. Song Title

| Property | Value |
|----------|-------|
| **Field Type** | Text input |
| **Label** | "Song Title" |
| **Placeholder** | "Enter song title" |
| **Width** | Full width (spans 2 columns on desktop) |
| **Required** | Yes (for upload) |
| **Auto-fill** | Yes (extracted from filename) |
| **v-model** | `songTitle` |

#### 2. Artist Name

| Property | Value |
|----------|-------|
| **Field Type** | Text input |
| **Label** | "Artist Name" |
| **Placeholder** | "Enter artist name" |
| **Width** | Half width (1 column on desktop) |
| **Required** | Yes (for upload) |
| **Auto-fill** | Yes (extracted from filename) |
| **v-model** | `songArtist` |

#### 3. Genre

| Property | Value |
|----------|-------|
| **Field Type** | Select dropdown |
| **Label** | "Genre" |
| **Placeholder** | "Select Genre" (disabled first option) |
| **Width** | Half width (1 column on desktop) |
| **Required** | Yes (for upload) |
| **Options** | MASTER_GENRES list |
| **Indicators** | ● (battle-ready) or ○ (not ready) |
| **v-model** | `songGenre` |

### Genre Battle-Ready Indicators

**Location**: `songUploader.vue` (lines 115-120, 416-440)

```vue
<option 
  v-for="genre in genres" 
  :key="genre" 
  :value="genre" 
  class="theme-bg-card theme-text-primary"
>
  {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
</option>
```

**Indicators**:
- `●` (filled circle) - Genre is battle-ready (has enough songs for battles)
- `○` (empty circle) - Genre is not yet battle-ready

**Logic**: Fetched via RPC call to `get_battle_available_genres()`

### Input Styling

| State | Classes |
|-------|---------|
| **Base** | `w-full px-4 py-3 theme-input border rounded-lg transition-all` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent` |
| **Label** | `block text-sm font-medium theme-text-secondary mb-2` |

**Spacing**:
- Padding: 16px horizontal, 12px vertical (`px-4 py-3`)
- Label margin: 8px bottom (`mb-2`)
- Field gap: 24px (`gap-6`)

### Auto-Extraction Feature

**Location**: `songUploader.vue` (lines 466-475, 519-528)

When a file is selected, the system automatically extracts artist and title from filename:

```typescript
// Auto-extract title and artist from filename
const extracted = extractArtistAndTitle(file.name)

// Always populate fields with extracted data when a new file is selected
if (extracted.title) {
  songTitle.value = extracted.title
}
if (extracted.artist) {
  songArtist.value = extracted.artist
}
```

**Filename Patterns Supported**:
- `Artist - Title.mp3`
- `Artist-Title.mp3`
- `Title.mp3` (artist defaults to filename)

---

## Waveform Clip Selection

### Visual Layout

Shows **only when a file is selected** (`v-if="audioPreviewUrl"`).

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Waveform Visualization Component]            │
│  ═══════════╦═══════════════════════════       │
│             ║← 30 second selection              │
│  [00:00]   [Playback controls]   [03:45]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 127-133)

```vue
<div v-if="audioPreviewUrl" class="theme-bg-card rounded-2xl p-6 border theme-border-card">
  <WaveformSelector 
    :audio-url="audioPreviewUrl"
    :initial-clip-start="clipStart"
    @clip-changed="handleClipChange"
  />
</div>
```

### Component Details

**Component**: `WaveformSelectorDual.vue`  
**Purpose**: Visual selection of 30-second clip from full song

**Props**:
- `audio-url`: URL of the audio file (blob URL)
- `initial-clip-start`: Starting time in seconds (default 0)

**Emits**:
- `clip-changed`: Emits new clip start time when user adjusts selection

**Features**:
- Full waveform visualization
- Draggable 30-second selection window
- Playback preview of selected clip
- Visual highlighting of selected region
- Time display

### Clip Start Handling

**Location**: `songUploader.vue` (lines 363-364, 570-573)

```typescript
const clipStart = ref(0)
const audioPreviewUrl = ref<string | null>(null)

const handleClipChange = (newClipStart: number) => {
  clipStart.value = newClipStart
}
```

The selected clip start time is passed to the upload function and stored in the database.

---

## Upload Status Panel

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ ✓ Upload Status                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ File Selected              ● Yes / ○ No         │
│ Details Complete           ● Yes / ○ No         │
│ File Verified              ● Verified           │
│                            ○ Processing...      │
│                            ● Duplicate          │
│                            ○ Pending            │
│ Ready to Upload            ● Yes / ○ No         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 140-203)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Upload Status
  </h3>
  
  <div class="space-y-3">
    <!-- File Selected -->
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">File Selected</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="selectedFile ? 'text-green-400' : 'theme-text-muted'">
          {{ selectedFile ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
    
    <!-- Details Complete -->
    <div class="flex items-center justify-between">
      <span class="theme-text-secondary">Details Complete</span>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="(songTitle && songArtist && songGenre) ? 'bg-green-400' : 'bg-gray-600'"></div>
        <span class="text-sm" :class="(songTitle && songArtist && songGenre) ? 'text-green-400' : 'theme-text-muted'">
          {{ (songTitle && songArtist && songGenre) ? 'Yes' : 'No' }}
        </span>
      </div>
    </div>
    
    <!-- File Verified -->
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
    
    <!-- Ready to Upload -->
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

### Status Indicators

#### 1. File Selected

| Condition | Dot Color | Text | Text Color |
|-----------|-----------|------|------------|
| File selected | Green (`bg-green-400`) | "Yes" | Green (`text-green-400`) |
| No file | Gray (`bg-gray-600`) | "No" | Muted (`theme-text-muted`) |

**Logic**: `selectedFile ? true : false`

#### 2. Details Complete

| Condition | Dot Color | Text | Text Color |
|-----------|-----------|------|------------|
| All fields filled | Green (`bg-green-400`) | "Yes" | Green (`text-green-400`) |
| Missing fields | Gray (`bg-gray-600`) | "No" | Muted (`theme-text-muted`) |

**Logic**: `(songTitle && songArtist && songGenre) ? true : false`

#### 3. File Verified

| Condition | Dot Color | Text | Text Color |
|-----------|-----------|------|------------|
| Verified (not duplicate) | Green (`bg-green-400`) | "Verified" | Green (`text-green-400`) |
| Duplicate detected | Red (`bg-red-400`) | "Duplicate" | Red (`text-red-400`) |
| Processing fingerprint | Yellow (`bg-yellow-400`) | "Processing..." | Yellow (`text-yellow-400`) |
| Not yet checked | Gray (`bg-gray-600`) | "Pending" | Muted (`theme-text-muted`) |

**Logic**: Based on `uploadStore` state:
- `fingerprintGenerated && !isDuplicate` → Verified (green)
- `isDuplicate` → Duplicate (red)
- `isGeneratingFingerprint` → Processing (yellow)
- Otherwise → Pending (gray)

#### 4. Ready to Upload

| Condition | Dot Color | Text | Text Color |
|-----------|-----------|------|------------|
| Can upload | Green (`bg-green-400`) | "Yes" | Green (`text-green-400`) |
| Cannot upload | Gray (`bg-gray-600`) | "No" | Muted (`theme-text-muted`) |

**Logic**: `canUpload` computed property (all requirements met)

### Dot Styling

**Size**: 8px × 8px (`w-2 h-2`)  
**Shape**: Circular (`rounded-full`)  
**Position**: 8px left margin from text (`mr-2`)  
**Colors**:
- Green: `bg-green-400` / `text-green-400`
- Red: `bg-red-400` / `text-red-400`
- Yellow: `bg-yellow-400` / `text-yellow-400`
- Gray: `bg-gray-600` / `theme-text-muted`

---

## Rights Confirmation

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ ☐ I confirm I own the rights to upload and     │
│   distribute this audio.                        │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 206-211)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <label class="flex items-start gap-3 theme-text-secondary">
    <input type="checkbox" v-model="rightsConfirmed" class="mt-1" />
    <span>I confirm I own the rights to upload and distribute this audio.</span>
  </label>
</div>
```

### Exact Text Content

```
I confirm I own the rights to upload and distribute this audio.
```

### Styling

| Element | Classes | Notes |
|---------|---------|-------|
| **Container** | `rounded-2xl p-6 border theme-bg-card theme-border-card` | Standard card styling |
| **Label** | `flex items-start gap-3 theme-text-secondary` | Flexbox with 12px gap |
| **Checkbox** | `mt-1` | 4px top margin for alignment |
| **Text** | `theme-text-secondary` | Secondary text color |

### Validation

**Required**: Yes - must be checked before upload is enabled

**Logic**: `rightsConfirmed` is included in `canUpload` computed property

---

## Upload Button States

### Visual States

The upload button has **6 distinct states** with different styling and text:

```
1. Disabled (Gray)        - Requirements not met
2. Ready (Yellow)         - Can upload
3. Uploading (Blue)       - Upload in progress
4. Success (Green)        - Upload complete
5. Verifying (Blue)       - Fingerprint generation
6. Duplicate (Red)        - Duplicate detected
```

### HTML Structure

**Location**: `songUploader.vue` (lines 214-257)

```vue
<button
  @click="initiateUpload"
  :disabled="!canUpload"
  class="w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
  :class="{
    'bg-[#ffd200] hover:bg-[#e6bd00] text-black shadow-lg': canUpload && !uploadStore.uploading && !uploadStore.isSuccess,
    'bg-gray-700 cursor-not-allowed text-gray-400': !canUpload,
    'bg-blue-600 text-white': uploadStore.uploading && !uploadStore.isSuccess,
    'bg-green-500 text-white': uploadStore.isSuccess && uploadStore.uploadMessage
  }"
>
  <!-- Uploading State -->
  <div v-if="uploadStore.uploading && !uploadStore.isSuccess" class="flex items-center justify-center">
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    {{ uploadStore.conversionStage === 'decoding' ? 'Decoding...' : uploadStore.conversionStage === 'encoding' ? 'Converting...' : 'Uploading...' }}
  </div>
  
  <!-- Success State -->
  <div v-else-if="uploadStore.isSuccess && uploadStore.uploadMessage" class="flex items-center justify-center">
    <svg class="w-6 h-6 mr-2 animate-scale-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
    Success!
  </div>
  
  <!-- Verifying State -->
  <div v-else-if="uploadStore.isGeneratingFingerprint" class="flex items-center justify-center">
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    Verifying File...
  </div>
  
  <!-- Duplicate State -->
  <div v-else-if="uploadStore.isDuplicate" class="flex items-center justify-center">
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Duplicate Detected
  </div>
  
  <!-- Default/Ready State -->
  <div v-else class="flex items-center justify-center">
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
    </svg>
    Upload Song
  </div>
</button>
```

### Button State Details

#### 1. Disabled (Gray)

**Condition**: `!canUpload`

| Property | Value |
|----------|-------|
| **Background** | `bg-gray-700` |
| **Text Color** | `text-gray-400` |
| **Cursor** | `cursor-not-allowed` |
| **Disabled** | Yes |
| **Hover Effect** | None |
| **Text** | "Upload Song" |
| **Icon** | Upload cloud icon |

#### 2. Ready (Yellow)

**Condition**: `canUpload && !uploading && !isSuccess`

| Property | Value |
|----------|-------|
| **Background** | `bg-[#ffd200]` |
| **Hover Background** | `bg-[#e6bd00]` |
| **Text Color** | `text-black` |
| **Shadow** | `shadow-lg` |
| **Hover Effect** | `scale-[1.02]` |
| **Active Effect** | `scale-[0.98]` |
| **Text** | "Upload Song" |
| **Icon** | Upload cloud icon |

#### 3. Uploading (Blue)

**Condition**: `uploading && !isSuccess`

| Property | Value |
|----------|-------|
| **Background** | `bg-blue-600` |
| **Text Color** | `text-white` |
| **Disabled** | Yes |
| **Text (varies)** | "Decoding..." / "Converting..." / "Uploading..." |
| **Icon** | Spinning loader |

**Text Changes**:
- `conversionStage === 'decoding'` → "Decoding..."
- `conversionStage === 'encoding'` → "Converting..."
- Otherwise → "Uploading..."

#### 4. Success (Green)

**Condition**: `isSuccess && uploadMessage`

| Property | Value |
|----------|-------|
| **Background** | `bg-green-500` |
| **Text Color** | `text-white` |
| **Text** | "Success!" |
| **Icon** | Checkmark (animated) |
| **Animation** | Scale check animation |

#### 5. Verifying (Blue)

**Condition**: `isGeneratingFingerprint`

| Property | Value |
|----------|-------|
| **Background** | `bg-blue-600` |
| **Text Color** | `text-white` |
| **Disabled** | Yes |
| **Text** | "Verifying File..." |
| **Icon** | Spinning loader |

#### 6. Duplicate (Red)

**Condition**: `isDuplicate`

| Property | Value |
|----------|-------|
| **Background** | `bg-gray-700` (inherits disabled style) |
| **Text Color** | `text-gray-400` |
| **Disabled** | Yes |
| **Text** | "Duplicate Detected" |
| **Icon** | Warning/info icon |

### Button Dimensions

| Property | Value | Class |
|----------|-------|-------|
| **Width** | Full width | `w-full` |
| **Padding** | 16px vertical | `py-4` |
| **Border Radius** | 12px | `rounded-xl` |
| **Font Weight** | Semibold | `font-semibold` |
| **Transition** | 300ms | `transition-all duration-300` |

### Hover/Active Effects

```css
transform hover:scale-[1.02]     /* Slight grow on hover */
active:scale-[0.98]              /* Slight shrink on click */
disabled:transform-none          /* No transform when disabled */
```

### Success Animation

**Location**: `songUploader.vue` (lines 642-650)

```css
@keyframes scale-check {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.animate-scale-check {
  animation: scale-check 0.5s ease-out forwards;
}
```

---

## Upload Guidelines Panel

### Visual Layout

```
┌─────────────────────────────────────────────────┐
│ ℹ️ Upload Guidelines                            │
├─────────────────────────────────────────────────┤
│                                                 │
│ ✓ Only original music you own the rights to    │
│ ✓ High quality audio files (MP3, WAV, M4A)     │
│ ✓ Maximum file size: 50MB                      │
│ ✓ Songs enter the weekly battle rotation       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 260-294)

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

### Guidelines Text

**4 Guidelines** (exact text):

1. ```
   Only original music you own the rights to
   ```

2. ```
   High quality audio files (MP3, WAV, M4A)
   ```

3. ```
   Maximum file size: 50MB
   ```

4. ```
   Songs enter the weekly battle rotation
   ```

### Styling

| Element | Classes | Notes |
|---------|---------|-------|
| **Container** | `rounded-2xl p-6 border theme-bg-card theme-border-card` | Standard card |
| **Title** | `text-lg font-semibold theme-text-primary mb-4` | 18px, semibold |
| **List Container** | `space-y-3 text-sm theme-text-secondary` | 12px spacing, 14px text |
| **List Item** | `flex items-start` | Flexbox for icon + text |
| **Icon** | `w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0` | 16px, yellow, top-aligned |
| **Text** | `theme-text-secondary` | Secondary text color |

**Icon**: Yellow checkmark circle (filled)

---

## Error Display

### Visual Layout

Shows **only when there's an error** (`uploadMessage && !isSuccess && !uploading`).

```
┌─────────────────────────────────────────────────┐
│ ⚠️  {Error Message}                             │
│                                                 │
│ [WAV Conversion Help Section if applicable]    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### HTML Structure

**Location**: `songUploader.vue` (lines 299-334)

```vue
<div
  v-if="uploadStore.uploadMessage && !uploadStore.isSuccess && !uploadStore.uploading"
  class="theme-bg-card rounded-2xl p-6 border transition-all duration-300 border-red-500 bg-red-500/5"
>
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0">
      <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </div>
    <div class="flex-1">
      <div class="font-medium text-red-400">
        <pre class="whitespace-pre-wrap font-sans text-sm">{{ uploadStore.uploadMessage }}</pre>
      </div>
      
      <!-- Show manual conversion help for WAV conversion failures -->
      <div v-if="uploadStore.uploadMessage.includes('WAV conversion failed')" class="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-400">
        <h4 class="text-blue-300 font-medium mb-2">🎵 Quick Manual Conversion Guide:</h4>
        <div class="text-blue-200 text-sm space-y-2">
          <p><strong>Option 1 - Online Converter:</strong></p>
          <ul class="list-disc list-inside ml-2 space-y-1">
            <li>Visit <a href="https://cloudconvert.com/wav-to-mp3" target="_blank" class="underline text-blue-300">CloudConvert.com</a></li>
            <li>Upload your WAV file</li>
            <li>Download the MP3 version</li>
            <li>Upload the MP3 here</li>
          </ul>
          <p><strong>Option 2 - Free Software:</strong></p>
          <ul class="list-disc list-inside ml-2">
            <li>Download <a href="https://www.audacityteam.org/" target="_blank" class="underline text-blue-300">Audacity (free)</a></li>
            <li>Open your WAV file → File → Export → Export as MP3</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Styling

| Element | Classes | Notes |
|---------|---------|-------|
| **Container** | `theme-bg-card rounded-2xl p-6 border border-red-500 bg-red-500/5` | Red accent |
| **Icon** | `w-6 h-6 text-red-400` | Warning icon, 24px |
| **Message** | `font-medium text-red-400` | Red text |
| **Pre-wrap** | `whitespace-pre-wrap font-sans text-sm` | Preserves line breaks |
| **Help Box** | `mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-400` | Blue info box |

### WAV Conversion Help

Shows **only if error message contains "WAV conversion failed"**.

**Content**:
- Title: "🎵 Quick Manual Conversion Guide:"
- Two options with step-by-step instructions
- Links to CloudConvert and Audacity
- Blue color scheme for info (not error)

**Exact Links**:
- CloudConvert: `https://cloudconvert.com/wav-to-mp3`
- Audacity: `https://www.audacityteam.org/`

---

## Upload Workflow

### Complete Upload Process

```
1. File Selection
   ↓
2. File Validation (MIME type + extension)
   ↓
3. Duplicate Detection (SHA-256 fingerprint)
   ↓
4. Metadata Extraction (filename → title/artist)
   ↓
5. User Fills Details (title, artist, genre)
   ↓
6. Waveform Selection (30-second clip)
   ↓
7. Rights Confirmation (checkbox)
   ↓
8. Format Conversion (if WAV → MP3)
   ↓
9. Upload to Supabase Storage
   ↓
10. Database Record Creation
   ↓
11. Success Confirmation
   ↓
12. Form Reset & Redirect
```

### Step-by-Step Details

#### Step 1: File Selection

**Methods**:
- Click upload zone → file browser
- Drag and drop onto upload zone

**Code**: `songUploader.vue` (lines 443-495, 497-540)

```typescript
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  
  if (file) {
    // Check if it's an audio file by MIME type or extension
    const isAudioFile = file.type.startsWith('audio/') || 
                       /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)
    
    if (isAudioFile) {
      // Clear any previous upload status and fingerprint state
      uploadStore.clearUploadStatus()
      uploadStore.clearFingerprintState()
      
      // Process file for duplicate detection
      const result = await uploadStore.handleFileSelection(file)
      
      if (result.success) {
        selectedFile.value = file
        audioPreviewUrl.value = URL.createObjectURL(file)
        clipStart.value = 0
        
        // Auto-extract title and artist from filename
        const extracted = extractArtistAndTitle(file.name)
        
        if (extracted.title) {
          songTitle.value = extracted.title
        }
        if (extracted.artist) {
          songArtist.value = extracted.artist
        }
      } else {
        // Show duplicate error
        alert(result.message)
        target.value = ''
        selectedFile.value = null
        audioPreviewUrl.value = null
      }
    } else {
      alert('Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)')
      target.value = ''
    }
  }
}
```

#### Step 2: File Validation

**Checks**:
1. MIME type starts with "audio/"
2. Extension matches: `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`

**Rejection**: Alert shown, file input cleared

#### Step 3: Duplicate Detection

**Process**:
1. Generate SHA-256 fingerprint of file
2. Check against existing songs in database
3. Update status indicators

**States**:
- `isGeneratingFingerprint: true` → "Processing..."
- `fingerprintGenerated: true, isDuplicate: false` → "Verified" (green)
- `isDuplicate: true` → "Duplicate" (red)

**Code**: Handled by `uploadStore.handleFileSelection()`

#### Step 4: Metadata Extraction

**Automatic extraction from filename**:
- Pattern: "Artist - Title.mp3"
- Extracts artist and title
- Pre-fills form fields

**Code**: `utils/titleExtractor.ts`

#### Step 5: User Fills Details

**Required Fields**:
- Song Title
- Artist Name
- Genre (dropdown selection)

**Validation**: All fields must be non-empty

#### Step 6: Waveform Selection

**Process**:
1. Audio preview URL created from file blob
2. WaveformSelectorDual component loads
3. User drags to select 30-second clip
4. Clip start time stored

**Default**: Clip starts at 0 seconds

#### Step 7: Rights Confirmation

**Requirement**: Checkbox must be checked

**Text**: "I confirm I own the rights to upload and distribute this audio."

#### Step 8: Format Conversion (if needed)

**Conditions**:
- WAV files: Always converted to MP3
- Large files: May be converted for optimization

**Process**:
1. Button shows "Decoding..."
2. Audio decoded to raw format
3. Button shows "Converting..."
4. Encoded to MP3 format
5. Conversion progress tracked

**Code**: `utils/audioConverterWebAudio.ts`

#### Step 9: Upload to Storage

**Process**:
1. Button shows "Uploading..."
2. File uploaded to Supabase Storage bucket: `song-audio`
3. Filename: `songs/{song_id}.mp3`

**Code**: `uploadStore.ts`

#### Step 10: Database Record Creation

**Table**: `songs`

**Fields**:
- `id`: UUID (generated)
- `user_id`: Current user ID
- `title`: Song title
- `artist`: Artist name
- `genre`: Selected genre
- `filename`: Storage filename
- `url`: Public URL
- `clip_start_time`: Selected clip start
- `audio_fingerprint`: SHA-256 hash
- Other fields: defaults

#### Step 11: Success Confirmation

**Visual Feedback**:
1. Button turns green
2. Shows checkmark with animation
3. Text: "Success!"
4. Success state lasts 3 seconds

#### Step 12: Form Reset & Redirect

**Actions**:
1. Clear all form fields
2. Clear selected file
3. Clear preview URL
4. Reset clip start to 0
5. Uncheck rights confirmation
6. Clear file input value
7. Clear upload store state
8. Redirect to `/my-songs` page

**Code**: `songUploader.vue` (lines 610-632)

```typescript
if (uploadStore.isSuccess) {
  // Clear form fields
  selectedFile.value = null
  songTitle.value = ''
  songArtist.value = ''
  songGenre.value = ''
  clipStart.value = 0
  audioPreviewUrl.value = null
  rightsConfirmed.value = false
  
  // Clear file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // Emit upload complete event
  emit('upload-complete')

  // Clear success state after delay
  setTimeout(() => {
    uploadStore.clearUploadStatus()
  }, 3000)
}
```

---

## Technical Implementation

### Component State

**Location**: `songUploader.vue` (lines 356-365)

```typescript
// Local component state
const selectedFile = ref<File | null>(null)
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const clipStart = ref(0)
const audioPreviewUrl = ref<string | null>(null)
const rightsConfirmed = ref(false)
```

### Computed Properties

**Location**: `songUploader.vue` (lines 368-401)

```typescript
// Can upload when all requirements met
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

// Check if file needs format conversion
const needsConversion = computed(() => {
  return selectedFile.value ? webAudioConverter.isConversionNeeded(selectedFile.value) : false
})

// Calculate estimated file size after conversion
const estimatedFileSize = computed(() => {
  if (!selectedFile.value) return null
  
  if (needsConversion.value) {
    const ratio = webAudioConverter.getEstimatedCompressionRatio(selectedFile.value)
    const estimatedSize = selectedFile.value.size * ratio
    return formatFileSize(estimatedSize)
  }
  
  return formatFileSize(selectedFile.value.size)
})

// Calculate compression percentage
const compressionInfo = computed(() => {
  if (!selectedFile.value || !needsConversion.value) return null
  
  const ratio = webAudioConverter.getEstimatedCompressionRatio(selectedFile.value)
  const reduction = Math.round((1 - ratio) * 100)
  return `${reduction}% smaller after MP3 conversion`
})
```

### Upload Store Integration

**Store**: `store/uploadStore.ts`

**Key Functions**:
- `handleFileSelection(file)` - Processes file and checks for duplicates
- `uploadSong(file, title, artist, genre, clipStart, rightsConfirmed)` - Uploads song
- `clearUploadStatus()` - Resets upload state
- `clearFingerprintState()` - Resets fingerprint state

**Store State**:
- `uploading: boolean` - Upload in progress
- `uploadMessage: string` - Status/error message
- `isSuccess: boolean` - Upload succeeded
- `fingerprintGenerated: boolean` - Fingerprint created
- `isDuplicate: boolean` - Duplicate detected
- `isGeneratingFingerprint: boolean` - Fingerprint in progress
- `conversionStage: string` - Current conversion stage

### File Handling Functions

**Location**: `songUploader.vue` (lines 542-566)

```typescript
// Clear selected file and reset state
const clearFile = () => {
  selectedFile.value = null
  audioPreviewUrl.value = null
  clipStart.value = 0
  
  // Clear the file input and upload status
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).value = ''
  }
  uploadStore.clearUploadStatus()
  uploadStore.clearFingerprintState()
  
  // Clear auto-populated fields when file is removed
  songTitle.value = ''
  songArtist.value = ''
}

// Format file size for display
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

### Upload Initiation

**Location**: `songUploader.vue` (lines 593-633)

```typescript
const initiateUpload = async () => {
  if (!selectedFile.value) {
    console.error('No file selected for upload')
    return
  }

  await uploadStore.uploadSong(
    selectedFile.value,
    songTitle.value,
    songArtist.value,
    songGenre.value,
    clipStart.value,
    rightsConfirmed.value
  )

  if (uploadStore.isSuccess) {
    // Clear form fields
    selectedFile.value = null
    songTitle.value = ''
    songArtist.value = ''
    songGenre.value = ''
    clipStart.value = 0
    audioPreviewUrl.value = null
    rightsConfirmed.value = false
    
    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }

    // Emit upload complete event
    emit('upload-complete')

    // Clear success state after delay
    setTimeout(() => {
      uploadStore.clearUploadStatus()
    }, 3000)
  }
}
```

### Genre Management

**Location**: `songUploader.vue` (lines 413-440)

```typescript
// Use master genre list for upload form
const genres = MASTER_GENRES

// Battle-ready genres for status indicators
const battleReadyGenres = ref<string[]>([])

// Fetch battle-ready genres
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}

// Check if genre is battle-ready
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

**RPC Function**: `get_battle_available_genres()` - Returns genres with enough songs for battles

---

## Complete Code References

### Main Component

**File**: `components/dashboard/songUploader.vue`  
**Lines**: 1-652 (complete file)

**Key Sections**:
- **Lines 1-336**: Template (HTML structure)
- **Lines 338-639**: Script (component logic)
- **Lines 641-651**: Styles (animations)

### Dashboard Integration

**File**: `pages/dashboard.vue`  
**Lines**: 86-109 (upload section)  
**Lines**: 151-187 (section state management)  
**Lines**: 227-231 (upload complete handler)

### Upload Store

**File**: `store/uploadStore.ts`  
**Purpose**: Handles upload logic, file validation, duplicate detection, format conversion

**Key Functions**:
- `uploadSong()` - Main upload function
- `handleFileSelection()` - Processes file selection
- `generateAudioFingerprint()` - Creates SHA-256 hash
- Audio conversion functions

### Utility Files

**Files**:
- `utils/audioConverterWebAudio.ts` - WAV to MP3 conversion
- `utils/titleExtractor.ts` - Filename parsing for metadata
- `utils/genres.ts` - MASTER_GENRES list

### Waveform Component

**File**: `components/WaveformSelectorDual.vue`  
**Purpose**: Visual waveform display and 30-second clip selection

---

## Implementation Checklist for Mobile

### Page Structure
- [ ] Integrate upload section into dashboard with query parameter
- [ ] Create 2-column responsive layout (lg:grid-cols-3, 2:1 split)
- [ ] Implement section switching (battle ↔ upload)
- [ ] Add page header with icon and title

### File Upload Section
- [ ] Create drag-and-drop zone
- [ ] Implement click-to-browse functionality
- [ ] Add hover effects (border color change)
- [ ] Show empty state with upload icon
- [ ] Show file selected state with music icon
- [ ] Display filename and file size
- [ ] Show conversion info for WAV files
- [ ] Implement "Remove file" button
- [ ] Accept: MP3, WAV, M4A, AAC, OGG
- [ ] 50MB file size limit

### Song Details Form
- [ ] Create 3 input fields (title, artist, genre)
- [ ] Implement responsive 2-column layout
- [ ] Add genre dropdown with all genres
- [ ] Show battle-ready indicators (● vs ○)
- [ ] Implement focus states (yellow ring)
- [ ] Auto-extract metadata from filename
- [ ] Validate all fields filled

### Waveform Selection
- [ ] Show waveform component when file selected
- [ ] Implement 30-second clip selection
- [ ] Display clip start time
- [ ] Handle clip change events

### Upload Status Panel
- [ ] Create 4 status indicators with dots
- [ ] Implement color coding (green/yellow/red/gray)
- [ ] Update "File Selected" status
- [ ] Update "Details Complete" status
- [ ] Update "File Verified" status with sub-states
- [ ] Update "Ready to Upload" status
- [ ] Real-time status synchronization

### Rights Confirmation
- [ ] Add checkbox with label
- [ ] Exact text: "I confirm I own the rights to upload and distribute this audio."
- [ ] Include in upload validation

### Upload Button
- [ ] Implement 6 button states
- [ ] State 1: Disabled (gray)
- [ ] State 2: Ready (yellow with hover)
- [ ] State 3: Uploading (blue with spinner)
- [ ] State 4: Success (green with checkmark)
- [ ] State 5: Verifying (blue with spinner)
- [ ] State 6: Duplicate (with warning icon)
- [ ] Add scale animations on hover/click
- [ ] Show conversion stage text

### Upload Guidelines
- [ ] Create guidelines panel
- [ ] Add 4 guidelines with checkmark icons
- [ ] Yellow icon color (#ffd200)
- [ ] Proper spacing between items

### Error Display
- [ ] Show error box for upload failures
- [ ] Red border and background
- [ ] Warning icon
- [ ] Pre-formatted text with line breaks
- [ ] WAV conversion help section (conditional)
- [ ] Links to CloudConvert and Audacity

### Upload Workflow
- [ ] Implement file selection (click + drag)
- [ ] Validate file type and size
- [ ] Generate audio fingerprint (SHA-256)
- [ ] Check for duplicates
- [ ] Extract metadata from filename
- [ ] Handle WAV to MP3 conversion
- [ ] Upload to Supabase storage
- [ ] Create database record
- [ ] Show success confirmation
- [ ] Reset form after 3 seconds
- [ ] Redirect to /my-songs

### Technical Implementation
- [ ] Set up component state management
- [ ] Create computed properties for validation
- [ ] Implement uploadStore integration
- [ ] Add file handling functions
- [ ] Implement drag-and-drop handlers
- [ ] Add audio preview URL creation
- [ ] Fetch battle-ready genres
- [ ] Handle upload complete event
- [ ] Implement form reset logic

### Styling
- [ ] Apply theme-aware classes
- [ ] Use yellow accent color (#ffd200)
- [ ] Implement consistent card styling
- [ ] Add proper spacing (p-6, space-y-6)
- [ ] Create hover effects and transitions
- [ ] Implement responsive breakpoints
- [ ] Add animations (spinner, checkmark)

---

## Important Notes

### Not a Separate Page

The upload functionality is **integrated into the dashboard**, accessed via URL query parameter (`?section=upload`), not a standalone page.

### Duplicate Detection

Before upload is allowed:
1. Audio fingerprint generated (SHA-256)
2. Checked against existing songs
3. Upload blocked if duplicate found

This prevents the same song from being uploaded multiple times.

### Format Conversion

**WAV files are automatically converted to MP3** to save storage costs:
- Conversion happens client-side
- Shows progress: "Decoding..." → "Converting..." → "Uploading..."
- Can take 30-60 seconds for large files
- If conversion fails, shows manual conversion help

### Rights Confirmation

**Mandatory checkbox** - users must confirm they own the rights to the audio before upload is enabled.

### Success Flow

After successful upload:
1. Form shows success state (3 seconds)
2. Form resets automatically
3. User redirected to "My Songs" page
4. Can view uploaded song immediately

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue`
- **Dashboard Integration**: `pages/dashboard.vue`
- **Upload Store**: `store/uploadStore.ts`

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

