# File Selected State Styling - Web App Implementation Reference

**Document Purpose**: This document provides exact styling specifications for the "file selected" state in the upload section, answering specific questions for mobile app UI parity.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/dashboard/songUploader.vue` (lines 38-61)

---

## Table of Contents

1. [Direct Answers to Questions](#direct-answers-to-questions)
2. [Complete HTML Structure](#complete-html-structure)
3. [Visual Specifications](#visual-specifications)
4. [Icon Styling Details](#icon-styling-details)
5. [Text Styling Details](#text-styling-details)
6. [Conditional Display Logic](#conditional-display-logic)
7. [Layout and Spacing](#layout-and-spacing)
8. [Complete Code Reference](#complete-code-reference)
9. [Visual Examples](#visual-examples)

---

## Direct Answers to Questions

### Q1: Is the file extension displayed in black or yellow?

**Answer**: **YELLOW** (#ffd200)

The **entire filename including extension** is displayed in yellow. There is NO color differentiation between the filename and extension.

**Code** (line 45):
```html
<p class="text-lg font-medium text-[#ffd200]">{{ selectedFile.name }}</p>
```

**Example**:
- Filename: `my-song.mp3`
- Display: <span style="color: #ffd200">`my-song.mp3`</span> (all yellow)

**NOT**: ~~my-song<span style="color: #ffd200">.mp3</span>~~ (mixed colors)

---

### Q2: Is any conversion information shown?

**Answer**: **YES**, conversion information IS shown, but **conditionally** based on file type.

**Condition**: `v-if="needsConversion"`

**When Shown**:
- ✅ WAV files (always needs conversion)
- ✅ M4A files (always needs conversion)
- ❌ MP3 files (no conversion needed)
- ❌ AAC files (no conversion needed)
- ❌ OGG files (no conversion needed)

**What's Shown** (lines 48-52):
```html
<div v-if="needsConversion" class="text-sm">
  <p class="text-green-400">After conversion: {{ estimatedFileSize }}</p>
  <p class="text-green-300 text-xs">{{ compressionInfo }}</p>
  <p v-if="selectedFile?.name.toLowerCase().endsWith('.wav')" class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
</div>
```

**Three Lines**:
1. "After conversion: 5 MB" (green-400, 14px)
2. "90% smaller after MP3 conversion" (green-300, 12px)
3. "⚡ Converting to MP3 (may take 30-60s)" (yellow-400, 12px) - **WAV only**

---

### Q3: What's the exact icon styling?

**Answer**: **Black music note in solid yellow circle with NO border**

**Icon Container** (line 39):
```html
<div class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center">
```

| Property | Value |
|----------|-------|
| **Size** | 64px × 64px (`w-16 h-16`) |
| **Background** | **Solid yellow** #ffd200 (`bg-[#ffd200]`) |
| **Shape** | Circle (`rounded-full`) |
| **Border** | **NONE** (no border classes) |
| **Position** | Centered (`mx-auto`) |

**Music Note SVG** (lines 40-42):
```html
<svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
</svg>
```

| Property | Value |
|----------|-------|
| **Size** | 32px × 32px (`w-8 h-8`) |
| **Color** | **Black** (`text-black`) |
| **Fill** | Solid (`fill="currentColor"`) |

**Visual**:
```
    ┌──────────────┐
    │              │
    │      🎵      │  32px black music note
    │              │
    └──────────────┘
   64px yellow circle
   NO border or ring
```

---

### Q4: Are there conditional displays based on file type?

**Answer**: **YES**, three conditional displays:

#### 1. Conversion Info Section

**Condition**: `v-if="needsConversion"`

**Shown for**: WAV and M4A files

**Hidden for**: MP3, AAC, OGG files

**Code** (line 48):
```html
<div v-if="needsConversion" class="text-sm">
  <!-- Conversion details -->
</div>
```

#### 2. WAV-Specific Warning

**Condition**: `v-if="selectedFile?.name.toLowerCase().endsWith('.wav')"`

**Shown for**: Only WAV files

**Hidden for**: All other file types (including M4A)

**Code** (line 51):
```html
<p v-if="selectedFile?.name.toLowerCase().endsWith('.wav')" class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
```

**Text**: "⚡ Converting to MP3 (may take 30-60s)"

**Color**: Yellow 400

#### 3. Original File Size

**Condition**: Always shown (no conditional)

**Code** (line 47):
```html
<p>Original: {{ formatFileSize(selectedFile.size) }}</p>
```

**Summary Table**:

| Display Element | MP3 File | M4A File | WAV File |
|-----------------|----------|----------|----------|
| **Filename** | ✅ Yellow | ✅ Yellow | ✅ Yellow |
| **Original Size** | ✅ Gray | ✅ Gray | ✅ Gray |
| **After conversion** | ❌ Hidden | ✅ Green | ✅ Green |
| **Compression %** | ❌ Hidden | ✅ Green | ✅ Green |
| **WAV warning** | ❌ Hidden | ❌ Hidden | ✅ Yellow |
| **Remove button** | ✅ Red | ✅ Red | ✅ Red |

---

### Q5: What's the exact Remove button styling?

**Answer**: **Red text link** (not a visual button), changes to lighter red on hover

**Code** (lines 54-59):
```html
<button 
  @click.stop="clearFile"
  class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
>
  Remove file
</button>
```

| Property | Value | Class |
|----------|-------|-------|
| **Color** | Red 400 | `text-red-400` |
| **Hover Color** | Red 300 (lighter) | `hover:text-red-300` |
| **Font Size** | 14px | `text-sm` |
| **Font Weight** | Medium (500) | `font-medium` |
| **Top Margin** | 8px | `mt-2` |
| **Transition** | Colors | `transition-colors` |

**Visual Appearance**: Plain text link (no background, no border, no padding)

---

## Complete HTML Structure

### Full File Selected State

**Location**: `songUploader.vue` (lines 38-61)

```vue
<div v-else class="space-y-3">
  
  <!-- Icon Container: 64px yellow circle -->
  <div class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center">
    <!-- Music Note Icon: 32px black -->
    <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  </div>
  
  <!-- File Information Container -->
  <div>
    <!-- Filename: 18px yellow medium -->
    <p class="text-lg font-medium text-[#ffd200]">{{ selectedFile.name }}</p>
    
    <!-- File Details: gray secondary, 4px spacing between lines -->
    <div class="theme-text-secondary space-y-1">
      <!-- Original File Size: 16px gray -->
      <p>Original: {{ formatFileSize(selectedFile.size) }}</p>
      
      <!-- Conversion Information (conditional on needsConversion) -->
      <div v-if="needsConversion" class="text-sm">
        <!-- After Conversion Size: 14px green-400 -->
        <p class="text-green-400">After conversion: {{ estimatedFileSize }}</p>
        <!-- Compression Ratio: 12px green-300 -->
        <p class="text-green-300 text-xs">{{ compressionInfo }}</p>
        <!-- WAV Warning (conditional on .wav extension): 12px yellow-400 -->
        <p v-if="selectedFile?.name.toLowerCase().endsWith('.wav')" class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
      </div>
    </div>
    
    <!-- Remove File Button: 14px red-400, hover red-300 -->
    <button 
      @click.stop="clearFile"
      class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
    >
      Remove file
    </button>
  </div>
  
</div>
```

### Parent Container (Upload Zone)

**Code** (lines 18-24):
```vue
<div 
  @click="fileInput?.click()"
  @dragover.prevent
  @drop.prevent="handleDrop"
  class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#ffd200] transition-colors cursor-pointer group"
  :class="{ 'border-[#ffd200] bg-[#ffd200]/5': selectedFile }"
>
```

**When File Selected** (`selectedFile` is truthy):
- Border: Solid yellow #ffd200 (was dashed gray)
- Background: Yellow @ 5% opacity (was transparent)
- Border style: Still uses `border-dashed` but appears solid with yellow

---

## Visual Specifications

### Icon Container Specifications

```css
w-16 h-16                /* 64px × 64px */
mx-auto                  /* Centered horizontally */
bg-[#ffd200]            /* Solid yellow background */
rounded-full            /* Perfect circle */
flex                    /* Flexbox */
items-center            /* Center vertically */
justify-center          /* Center horizontally */
```

**Measurements**:
- Width: 64px
- Height: 64px
- Background: #ffd200 (100% opacity)
- Border: None
- Border radius: 50% (full circle)

**Color Swatch**:
```
████  #ffd200  (Icon container background)
```

### Music Note SVG Specifications

```css
w-8 h-8                 /* 32px × 32px */
text-black              /* Black color */
```

**Attributes**:
- `fill="currentColor"` - Uses text color (black)
- `viewBox="0 0 24 24"` - 24×24 coordinate system

**SVG Path** (exact):
```
M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z
```

**Visual**: Musical note with stem and note head

**Measurements**:
- Width: 32px
- Height: 32px
- Color: Black (#000000)
- Stroke: None (filled icon)

---

## Text Styling Details

### Filename

**Code** (line 45):
```css
class="text-lg font-medium text-[#ffd200]"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Font Size** | Large | 18px |
| **Font Weight** | Medium | 500 |
| **Color** | Yellow | #ffd200 |
| **Text Align** | Center | (inherited from parent) |

**Content**: Full filename with extension (e.g., `"my-song.mp3"`)

**Color Swatch**:
```
████  #ffd200  (Filename color)
```

### Original File Size

**Code** (line 47):
```html
<p>Original: {{ formatFileSize(selectedFile.size) }}</p>
```

**Parent Container** (line 46):
```css
class="theme-text-secondary space-y-1"
```

| Property | Value |
|----------|-------|
| **Font Size** | Base (16px) |
| **Color** | Theme secondary (gray) |
| **Text Align** | Center (inherited) |

**Format**: `"Original: X.X MB"` or `"Original: X.X KB"`

**Example**: `"Original: 5.2 MB"`

### After Conversion Size

**Code** (line 49):
```css
class="text-green-400"
```

**Parent** (line 48):
```css
class="text-sm"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Font Size** | Small | 14px |
| **Color** | Green 400 | Tailwind green-400 |
| **Display** | Conditional | `v-if="needsConversion"` |

**Content**: `"After conversion: X.X KB"` or `"After conversion: X.X MB"`

### Compression Info

**Code** (line 50):
```css
class="text-green-300 text-xs"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Font Size** | Extra small | 12px |
| **Color** | Green 300 | Tailwind green-300 |
| **Display** | Conditional | `v-if="needsConversion"` |

**Content**: `"90% smaller after MP3 conversion"` (dynamic percentage)

### WAV Warning

**Code** (line 51):
```css
class="text-yellow-400 text-xs mt-1"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Font Size** | Extra small | 12px | `text-xs` |
| **Color** | Yellow 400 | - | `text-yellow-400` |
| **Top Margin** | 1 | 4px | `mt-1` |
| **Display** | Conditional | - | `v-if WAV file` |

**Content**: `"⚡ Converting to MP3 (may take 30-60s)"`

### Remove File Button

**Code** (lines 54-59):
```css
class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
```

| Property | Value | Class |
|----------|-------|-------|
| **Font Size** | 14px | `text-sm` |
| **Font Weight** | Medium (500) | `font-medium` |
| **Color** | Red 400 | `text-red-400` |
| **Hover Color** | Red 300 (lighter) | `hover:text-red-300` |
| **Top Margin** | 8px | `mt-2` |
| **Transition** | Colors | `transition-colors` |

**Visual**: Plain text link (no button background or border)

**Content**: `"Remove file"`

---

## Icon Styling Details

### Container Breakdown

```html
<div class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center">
```

**Class by Class**:

| Class | Property | Value |
|-------|----------|-------|
| `w-16` | width | 64px |
| `h-16` | height | 64px |
| `mx-auto` | margin-left, margin-right | auto (centers) |
| `bg-[#ffd200]` | background-color | #ffd200 |
| `rounded-full` | border-radius | 50% (circle) |
| `flex` | display | flex |
| `items-center` | align-items | center |
| `justify-center` | justify-content | center |

**No Border Classes**: The container has NO border, stroke, or outline.

### SVG Icon Breakdown

```html
<svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
```

**Class by Class**:

| Class | Property | Value |
|-------|----------|-------|
| `w-8` | width | 32px |
| `h-8` | height | 32px |
| `text-black` | color | #000000 |

**SVG Attributes**:
- `fill="currentColor"` - Fills with text color (black)
- `viewBox="0 0 24 24"` - Coordinate system

**Path**:
```
M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z
```

**Icon Type**: Musical note (filled, not outline)

---

## Conditional Display Logic

### needsConversion Computed Property

**Location**: `songUploader.vue` (lines 379-381)

```typescript
const needsConversion = computed(() => {
  return selectedFile.value ? webAudioConverter.isConversionNeeded(selectedFile.value) : false
})
```

**Logic**: Checks file extension via `webAudioConverter.isConversionNeeded()`

**Returns true for**:
- `.wav` files
- `.wave` files  
- `.m4a` files
- `.aac` files

**Returns false for**:
- `.mp3` files
- `.ogg` files
- Other formats

### WAV-Specific Check

**Code** (line 51):
```vue
v-if="selectedFile?.name.toLowerCase().endsWith('.wav')"
```

**Logic**: String check on filename (case-insensitive)

**Returns true for**:
- `song.wav`
- `track.WAV`
- `audio.Wave` (if lowercase check matches)

---

## Layout and Spacing

### Container Structure

```
┌─────────────────────────────────────────┐
│  Upload Zone (p-8 = 32px padding)       │
│                                         │
│            ┌─────────┐                  │
│            │   🎵    │  Icon (64px)     │
│            └─────────┘                  │
│                ↓ 12px (space-y-3)       │
│          my-song.mp3  (yellow, 18px)    │
│                ↓ 4px (space-y-1)        │
│          Original: 5.2 MB (gray, 16px)  │
│                ↓ 4px (space-y-1)        │
│    After conversion: 520 KB (green, 14px) │
│                ↓ 0px (inline)           │
│    90% smaller (green-300, 12px)        │
│                ↓ 4px (mt-1)             │
│    ⚡ Converting... (yellow, 12px)      │
│                ↓ 8px (mt-2)             │
│          Remove file (red, 14px)        │
│                                         │
└─────────────────────────────────────────┘
```

### Spacing Measurements

**Outer Container** (line 38):
```css
class="space-y-3"
```
- **Between icon and text**: 12px

**File Info Container** (line 46):
```css
class="theme-text-secondary space-y-1"
```
- **Between info lines**: 4px

**WAV Warning** (line 51):
```css
class="... mt-1"
```
- **Top margin**: 4px

**Remove Button** (line 56):
```css
class="... mt-2"
```
- **Top margin**: 8px

### Text Alignment

**All content is center-aligned** due to parent container:

**Upload Zone** (line 22):
```css
class="... text-center ..."
```

**Result**:
- Icon: Centered via `mx-auto`
- All text: Centered
- Remove button: Centered

---

## Complete Code Reference

### Lines 38-61 (Complete)

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

### Parent Upload Zone (with file selected)

**Code** (line 23):
```vue
:class="{ 'border-[#ffd200] bg-[#ffd200]/5': selectedFile }"
```

**Applied Classes when file selected**:
- `border-[#ffd200]` - Solid yellow border
- `bg-[#ffd200]/5` - Yellow background @ 5% opacity

---

## Visual Examples

### Example 1: MP3 File Selected

**File**: `my-song.mp3` (5.2 MB)

**Display**:
```
     ┌────────────┐
     │            │
     │     🎵     │  64px yellow circle (#ffd200)
     │            │  32px black music note
     └────────────┘

    my-song.mp3        (yellow #ffd200, 18px medium)
    
    Original: 5.2 MB   (gray, 16px)
    
    Remove file        (red-400, 14px medium)
```

**No conversion info shown** (MP3 doesn't need conversion)

### Example 2: WAV File Selected

**File**: `track.wav` (50 MB)

**Display**:
```
     ┌────────────┐
     │            │
     │     🎵     │  64px yellow circle (#ffd200)
     │            │  32px black music note
     └────────────┘

    track.wav                              (yellow #ffd200, 18px medium)
    
    Original: 50 MB                        (gray, 16px)
    After conversion: 5 MB                 (green-400, 14px)
    90% smaller after MP3 conversion       (green-300, 12px)
    ⚡ Converting to MP3 (may take 30-60s) (yellow-400, 12px)
    
    Remove file                            (red-400, 14px medium)
```

**All conversion info shown** (WAV needs conversion)

### Example 3: M4A File Selected

**File**: `audio.m4a` (10 MB)

**Display**:
```
     ┌────────────┐
     │            │
     │     🎵     │  64px yellow circle (#ffd200)
     │            │  32px black music note
     └────────────┘

    audio.m4a                              (yellow #ffd200, 18px medium)
    
    Original: 10 MB                        (gray, 16px)
    After conversion: 5 MB                 (green-400, 14px)
    50% smaller after MP3 conversion       (green-300, 12px)
    
    Remove file                            (red-400, 14px medium)
```

**No WAV warning** (only for WAV files), but shows conversion info

---

## Color Specifications

### All Colors Used

| Element | Color Name | Hex/Class | Usage |
|---------|-----------|-----------|-------|
| **Icon Background** | Yellow | #ffd200 | `bg-[#ffd200]` |
| **Music Note** | Black | #000000 | `text-black` |
| **Filename** | Yellow | #ffd200 | `text-[#ffd200]` |
| **Original Size** | Theme Secondary | Varies (gray in dark mode) | `theme-text-secondary` |
| **After Conversion** | Green 400 | Tailwind green-400 | `text-green-400` |
| **Compression Info** | Green 300 | Tailwind green-300 | `text-green-300` |
| **WAV Warning** | Yellow 400 | Tailwind yellow-400 | `text-yellow-400` |
| **Remove Button** | Red 400 | Tailwind red-400 | `text-red-400` |
| **Remove Hover** | Red 300 | Tailwind red-300 | `hover:text-red-300` |

### Upload Zone Background (with file)

| Property | Value | Class |
|----------|-------|-------|
| **Border Color** | Yellow #ffd200 | `border-[#ffd200]` |
| **Border Width** | 2px | `border-2` |
| **Border Style** | Dashed | `border-dashed` |
| **Background** | Yellow @ 5% | `bg-[#ffd200]/5` |

---

## Implementation Checklist for Mobile

### Icon Container
- [ ] Create 64px × 64px circular container
- [ ] Apply solid yellow background (#ffd200)
- [ ] Center horizontally (mx-auto or equivalent)
- [ ] Use flexbox to center content
- [ ] **DO NOT add border** (no border on container)

### Music Note Icon
- [ ] Use 32px × 32px SVG icon
- [ ] Apply black color
- [ ] Use filled music note (not outline)
- [ ] SVG path: `M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z`

### Filename Display
- [ ] Use 18px font size
- [ ] Apply medium weight (500)
- [ ] **Use yellow color** (#ffd200)
- [ ] Display full filename with extension
- [ ] **No color differentiation** for extension
- [ ] Center-align text

### File Size Info
- [ ] Display "Original: X.X MB"
- [ ] Use 16px font size (base)
- [ ] Use gray/secondary color
- [ ] Center-align text

### Conversion Info (Conditional)
- [ ] Show only if needsConversion is true
- [ ] "After conversion:" in green-400, 14px
- [ ] Compression percentage in green-300, 12px
- [ ] WAV warning in yellow-400, 12px (WAV only)
- [ ] Include lightning emoji ⚡

### Remove Button
- [ ] Display as text link (not button)
- [ ] Text: "Remove file"
- [ ] Color: red-400
- [ ] Hover: red-300
- [ ] Font: 14px medium
- [ ] Transition on color change

### Spacing
- [ ] 12px between icon and filename (space-y-3)
- [ ] 4px between file info lines (space-y-1)
- [ ] 4px before WAV warning (mt-1)
- [ ] 8px before remove button (mt-2)
- [ ] Center-align all content

### Parent Container
- [ ] Apply yellow border when file selected
- [ ] Apply 5% yellow background tint
- [ ] Keep center text alignment
- [ ] Maintain 32px padding

---

## Quick Reference

### Key Styling Classes

**Icon Container**:
```
w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center
```

**Music Note SVG**:
```
w-8 h-8 text-black
```

**Filename**:
```
text-lg font-medium text-[#ffd200]
```

**Original Size Container**:
```
theme-text-secondary space-y-1
```

**After Conversion**:
```
text-green-400
```

**Compression Info**:
```
text-green-300 text-xs
```

**WAV Warning**:
```
text-yellow-400 text-xs mt-1
```

**Remove Button**:
```
text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors
```

### Critical Design Details

✅ **Filename is ALL yellow** (including extension)  
✅ **Icon has NO border** (solid yellow circle)  
✅ **Icon color is black** (not yellow)  
✅ **Conversion info IS shown** (for WAV/M4A)  
✅ **Center-aligned layout**  
✅ **12px spacing** between icon and text  
✅ **4px spacing** between info lines  

---

## Contact & Questions

For questions about styling, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue` (lines 38-61)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

