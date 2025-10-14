# Upload Section Styling - CSS and Visual Design Reference

**Document Purpose**: This document provides exact CSS, styling, colors, spacing, and visual design specifications from the production web app's upload section for pixel-perfect mobile UI implementation.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/dashboard/songUploader.vue` (template section, lines 1-336)

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Layout Structure](#layout-structure)
4. [Card Styling](#card-styling)
5. [Upload Zone Styling](#upload-zone-styling)
6. [Icon Specifications](#icon-specifications)
7. [Button Styling](#button-styling)
8. [Input Field Styling](#input-field-styling)
9. [Status Indicator Styling](#status-indicator-styling)
10. [Spacing and Padding](#spacing-and-padding)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Visual Effects](#visual-effects)
13. [Complete CSS Reference](#complete-css-reference)

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **SongWars Yellow** | `#ffd200` | Primary brand color, buttons, accents | `bg-[#ffd200]` `text-[#ffd200]` |
| **Yellow Hover** | `#e6bd00` | Button hover state | `hover:bg-[#e6bd00]` |
| **Yellow 5%** | `#ffd200` @ 5% opacity | Selected file background | `bg-[#ffd200]/5` |
| **Yellow 90%** | `#ffd200` @ 90% opacity | Button active/hover | `bg-[#ffd200]/90` |

### Status Colors

| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **Success Green** | Tailwind green-400 | Verified status, success states | `bg-green-400` `text-green-400` |
| **Success Green Alt** | Tailwind green-300 | Secondary success text | `text-green-300` |
| **Success Green Button** | Tailwind green-500 | Success button background | `bg-green-500` |
| **Warning Yellow** | Tailwind yellow-400 | Processing states | `bg-yellow-400` `text-yellow-400` |
| **Error Red** | Tailwind red-400 | Error states, duplicate detection | `bg-red-400` `text-red-400` |
| **Error Red Border** | Tailwind red-500 | Error box borders | `border-red-500` |
| **Error Red Background** | Tailwind red-500 @ 5% | Error box background | `bg-red-500/5` |
| **Info Blue** | Tailwind blue-600 | Uploading/processing button | `bg-blue-600` |

### Neutral Colors

| Color Name | Usage | Tailwind Class |
|------------|-------|----------------|
| **Gray 600** | Borders (neutral), dots (inactive) | `border-gray-600` `bg-gray-600` |
| **Gray 700** | Backgrounds (inactive), disabled buttons | `bg-gray-700` |
| **Gray 400** | Disabled text | `text-gray-400` |

### Theme-Aware Classes

| Class | Purpose | Light Mode | Dark Mode |
|-------|---------|------------|-----------|
| `theme-bg-card` | Card background | Light color | Dark color |
| `theme-border-card` | Card border | Light border | Dark border |
| `theme-bg-subcard` | Nested card background | Lighter | Darker |
| `theme-text-primary` | Primary text | Black/dark | White/light |
| `theme-text-secondary` | Secondary text | Gray | Light gray |
| `theme-text-muted` | Muted text | Light gray | Dark gray |
| `theme-input` | Input background | White | Dark |

---

## Typography

### Font Sizes

| Usage | Size | Tailwind Class | Pixel Value |
|-------|------|----------------|-------------|
| **Section Headers** | Large | `text-lg` | 18px |
| **Main Upload Text** | Extra Large | `text-xl` | 20px |
| **File Name** | Large | `text-lg` | 18px |
| **Body Text** | Base | (default) | 16px |
| **Labels** | Small | `text-sm` | 14px |
| **Helper Text** | Small | `text-sm` | 14px |
| **Muted Text** | Extra Small | `text-xs` | 12px |
| **Status Text** | Small | `text-sm` | 14px |

### Font Weights

| Usage | Weight | Tailwind Class |
|-------|--------|----------------|
| **Section Headers** | Semibold | `font-semibold` |
| **Upload Text** | Medium | `font-medium` |
| **Button Text** | Semibold | `font-semibold` |
| **Yellow "browse"** | Medium | `font-medium` |
| **Labels** | Medium | `font-medium` |

### Text Colors by Context

**Section Headers**:
```css
class="text-lg font-semibold theme-text-primary"
```

**Upload Text** (empty state):
```css
class="text-xl font-medium theme-text-primary mb-2"
```

**Secondary Instructions**:
```css
class="theme-text-secondary"
```

**Yellow "browse" Highlight**:
```css
<span class="text-[#ffd200] font-medium">browse</span>
```

**Helper Text**:
```css
class="text-sm theme-text-muted mt-2"
```

**File Name** (selected):
```css
class="text-lg font-medium text-[#ffd200]"
```

---

## Layout Structure

### Overall Container

**Code** (line 2):
```css
class="max-w-7xl mx-auto space-y-8"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Max Width** | `max-w-7xl` | 1280px |
| **Horizontal Center** | `mx-auto` | Auto margins |
| **Vertical Spacing** | `space-y-8` | 32px between children |

### Grid Layout

**Code** (line 4):
```css
class="grid grid-cols-1 lg:grid-cols-3 gap-8"
```

| Property | Mobile | Desktop (lg) | Value |
|----------|--------|--------------|-------|
| **Columns** | 1 | 3 | `grid-cols-1` / `lg:grid-cols-3` |
| **Gap** | 32px | 32px | `gap-8` |

### Column Spans

**Left Column** (line 7):
```css
class="lg:col-span-2 space-y-6"
```

| Property | Mobile | Desktop | Value |
|----------|--------|---------|-------|
| **Span** | 1 (full width) | 2 columns (66.6%) | `lg:col-span-2` |
| **Spacing** | 24px vertical | 24px vertical | `space-y-6` |

**Right Column** (line 137):
```css
class="lg:col-span-1 space-y-6"
```

| Property | Mobile | Desktop | Value |
|----------|--------|---------|-------|
| **Span** | 1 (full width) | 1 column (33.3%) | `lg:col-span-1` |
| **Spacing** | 24px vertical | 24px vertical | `space-y-6` |

---

## Card Styling

### Standard Card

**Used for**: All major sections (File Upload, Song Details, Upload Status, Rights, Guidelines)

**Code** (lines 10, 74, 140, 206, 260):
```css
class="rounded-2xl p-6 border theme-bg-card theme-border-card"
```

### Card Components

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Border Radius** | Extra Large 2 | 16px | `rounded-2xl` |
| **Padding** | 6 | 24px (all sides) | `p-6` |
| **Border** | 1px | 1px | `border` |
| **Background** | Theme card | Varies | `theme-bg-card` |
| **Border Color** | Theme card | Varies | `theme-border-card` |

### Section Headers (inside cards)

**Code** (lines 11-16, 75-80, 141-146, 261-266):
```css
class="text-lg font-semibold theme-text-primary mb-4 flex items-center"
```

**With Icon**:
```html
<h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
  <svg class="w-5 h-5 mr-2 text-[#ffd200]">...</svg>
  Section Title
</h3>
```

| Property | Value | Class |
|----------|-------|-------|
| **Font Size** | 18px | `text-lg` |
| **Font Weight** | Semibold | `font-semibold` |
| **Text Color** | Theme primary | `theme-text-primary` |
| **Bottom Margin** | 16px (most), 24px (Song Details) | `mb-4` or `mb-6` |
| **Layout** | Flexbox | `flex items-center` |
| **Icon Size** | 20px × 20px | `w-5 h-5` |
| **Icon Margin** | 8px right | `mr-2` |
| **Icon Color** | Yellow #ffd200 | `text-[#ffd200]` |

---

## Upload Zone Styling

### Drag-and-Drop Container

**Code** (lines 18-24):
```css
class="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#ffd200] transition-colors cursor-pointer group"
:class="{ 'border-[#ffd200] bg-[#ffd200]/5': selectedFile }"
```

### Empty State Styling

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Border Width** | 2px | 2px | `border-2` |
| **Border Style** | Dashed | - | `border-dashed` |
| **Border Color** | Gray 600 | - | `border-gray-600` |
| **Hover Border** | Yellow #ffd200 | - | `hover:border-[#ffd200]` |
| **Border Radius** | Extra Large | 12px | `rounded-xl` |
| **Padding** | 8 | 32px (all sides) | `p-8` |
| **Text Align** | Center | - | `text-center` |
| **Cursor** | Pointer | - | `cursor-pointer` |
| **Transition** | Colors | - | `transition-colors` |
| **Group** | Hover trigger | - | `group` |

### Selected State Styling

**When file is selected** (`selectedFile` is truthy):

| Property | Value | Class |
|----------|-------|-------|
| **Border Color** | Yellow #ffd200 | `border-[#ffd200]` |
| **Background** | Yellow @ 5% opacity | `bg-[#ffd200]/5` |

**Visual Effect**: Subtle yellow tint shows file is selected

### Upload Icon Container (Empty State)

**Code** (line 26):
```css
class="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-[#ffd200] group-hover:text-black transition-colors"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 16 × 16 | 64px × 64px | `w-16 h-16` |
| **Center** | Auto margins | - | `mx-auto` |
| **Background** | Gray 700 | - | `bg-gray-700` |
| **Hover Background** | Yellow #ffd200 | - | `group-hover:bg-[#ffd200]` |
| **Shape** | Circle | - | `rounded-full` |
| **Display** | Flex center | - | `flex items-center justify-center` |
| **Hover Text** | Black | - | `group-hover:text-black` |
| **Transition** | Colors | - | `transition-colors` |

### Upload Icon (SVG)

**Code** (line 27):
```css
class="w-8 h-8"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Size** | 8 × 8 | 32px × 32px |
| **Color** | Inherits from parent | - |

**SVG Path**: Cloud with down arrow

### Music Icon Container (Selected State)

**Code** (line 39):
```css
class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 16 × 16 | 64px × 64px | `w-16 h-16` |
| **Center** | Auto margins | - | `mx-auto` |
| **Background** | Yellow #ffd200 | - | `bg-[#ffd200]` |
| **Shape** | Circle | - | `rounded-full` |
| **Display** | Flex center | - | `flex items-center justify-center` |

**Difference from empty**: Solid yellow background (not gray)

### Music Icon (SVG)

**Code** (line 40):
```css
class="w-8 h-8 text-black"
```

| Property | Value | Class |
|----------|-------|-------|
| **Size** | 32px × 32px | `w-8 h-8` |
| **Color** | Black | `text-black` |

**SVG Path**: Music note icon

### Upload Text (Empty State)

**Code** (lines 32-34):
```html
<p class="text-xl font-medium theme-text-primary mb-2">Upload your song</p>
<p class="theme-text-secondary">Drag and drop an audio file or <span class="text-[#ffd200] font-medium">browse</span></p>
<p class="text-sm theme-text-muted mt-2">MP3, WAV, M4A up to 50MB</p>
```

**Main Text**:
- Font size: 20px (`text-xl`)
- Font weight: Medium (`font-medium`)
- Color: Theme primary
- Bottom margin: 8px (`mb-2`)

**Secondary Text**:
- Color: Theme secondary
- Yellow "browse": `text-[#ffd200] font-medium`

**Helper Text**:
- Font size: 14px (`text-sm`)
- Color: Theme muted
- Top margin: 8px (`mt-2`)

### File Selected Text

**Code** (lines 45-53):
```html
<p class="text-lg font-medium text-[#ffd200]">{{ selectedFile.name }}</p>
<div class="theme-text-secondary space-y-1">
  <p>Original: {{ formatFileSize(selectedFile.size) }}</p>
  <div v-if="needsConversion" class="text-sm">
    <p class="text-green-400">After conversion: {{ estimatedFileSize }}</p>
    <p class="text-green-300 text-xs">{{ compressionInfo }}</p>
    <p class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
  </div>
</div>
```

**Filename**:
- Font size: 18px (`text-lg`)
- Font weight: Medium (`font-medium`)
- Color: Yellow #ffd200

**File Info**:
- Color: Theme secondary
- Spacing: 4px vertical (`space-y-1`)

**Conversion Info**:
- Size: 14px (`text-sm`)
- Success: Green 400 (`text-green-400`)
- Details: Green 300, 12px (`text-green-300 text-xs`)
- Warning: Yellow 400, 12px (`text-yellow-400 text-xs`)

### Remove File Button

**Code** (lines 54-59):
```css
class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
```

| Property | Value | Class |
|----------|-------|-------|
| **Color** | Red 400 | `text-red-400` |
| **Hover Color** | Red 300 | `hover:text-red-300` |
| **Font Size** | 14px | `text-sm` |
| **Font Weight** | Medium | `font-medium` |
| **Top Margin** | 8px | `mt-2` |
| **Transition** | Colors | `transition-colors` |

---

## Button Styling

### Upload Button - Ready State

**Code** (lines 214-223):
```css
class="w-full py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed"
```

**Conditional classes when ready**:
```css
'bg-[#ffd200] hover:bg-[#e6bd00] text-black shadow-lg'
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Width** | Full | 100% | `w-full` |
| **Padding Vertical** | 4 | 16px | `py-4` |
| **Border Radius** | Extra Large | 12px | `rounded-xl` |
| **Font Weight** | Semibold | - | `font-semibold` |
| **Background** | Yellow #ffd200 | - | `bg-[#ffd200]` |
| **Hover Background** | Yellow #e6bd00 | - | `hover:bg-[#e6bd00]` |
| **Text Color** | Black | - | `text-black` |
| **Shadow** | Large | - | `shadow-lg` |
| **Transition** | All properties | 300ms | `transition-all duration-300` |
| **Transform** | Enabled | - | `transform` |
| **Hover Scale** | 102% | - | `hover:scale-[1.02]` |
| **Active Scale** | 98% | - | `active:scale-[0.98]` |

### Upload Button - Disabled State

**Code** (line 220):
```css
'bg-gray-700 cursor-not-allowed text-gray-400'
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Gray 700 | `bg-gray-700` |
| **Cursor** | Not allowed | `cursor-not-allowed` `disabled:cursor-not-allowed` |
| **Text Color** | Gray 400 | `text-gray-400` |
| **Transform** | None | `disabled:transform-none` |

### Upload Button - Uploading State

**Code** (line 221):
```css
'bg-blue-600 text-white'
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Blue 600 | `bg-blue-600` |
| **Text Color** | White | `text-white` |

**With Spinner** (lines 225-230):
```html
<svg class="animate-spin -ml-1 mr-3 h-5 w-5">...</svg>
Uploading...
```

### Upload Button - Success State

**Code** (line 222):
```css
'bg-green-500 text-white'
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Green 500 | `bg-green-500` |
| **Text Color** | White | `text-white` |

**With Checkmark** (lines 233-236):
```html
<svg class="w-6 h-6 mr-2 animate-scale-check">...</svg>
Success!
```

---

## Input Field Styling

### Text Inputs (Title, Artist)

**Code** (lines 86-91, 97-102):
```css
class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Width** | Full | 100% | `w-full` |
| **Padding Horizontal** | 4 | 16px | `px-4` |
| **Padding Vertical** | 3 | 12px | `py-3` |
| **Background** | Theme input | - | `theme-input` |
| **Border** | 1px | 1px | `border` |
| **Border Radius** | Large | 8px | `rounded-lg` |
| **Focus Outline** | None | - | `focus:outline-none` |
| **Focus Ring** | 2px yellow | 2px | `focus:ring-2 focus:ring-[#ffd200]` |
| **Focus Border** | Transparent | - | `focus:border-transparent` |
| **Transition** | All properties | - | `transition-all` |

### Select Dropdown (Genre)

**Code** (lines 108-122):
```css
class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
```

**Additional Properties**:

| Property | Value | Class |
|----------|-------|-------|
| **Appearance** | None (custom styling) | `appearance-none` |
| **Cursor** | Pointer | `cursor-pointer` |

**Same styling as text inputs** + removes native dropdown arrow

### Labels

**Code** (lines 85, 96, 107):
```css
class="block text-sm font-medium theme-text-secondary mb-2"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Display** | Block | - | `block` |
| **Font Size** | Small | 14px | `text-sm` |
| **Font Weight** | Medium | - | `font-medium` |
| **Text Color** | Theme secondary | - | `theme-text-secondary` |
| **Bottom Margin** | 2 | 8px | `mb-2` |

### Input Placeholder

**Examples**:
- "Enter song title"
- "Enter artist name"
- "Select Genre" (for dropdown)

**Styling**: Handled by browser defaults with theme-input

---

## Status Indicator Styling

### Status Dot

**Code** (lines 152, 162, 172-178, 196):
```css
class="w-2 h-2 rounded-full mr-2"
```

**Dynamic Color Classes**:
- Green: `bg-green-400`
- Yellow: `bg-yellow-400`
- Red: `bg-red-400`
- Gray: `bg-gray-600`

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 2 × 2 | 8px × 8px | `w-2 h-2` |
| **Shape** | Circle | - | `rounded-full` |
| **Right Margin** | 2 | 8px | `mr-2` |

### Status Text

**Code** (lines 153-155, 163-165, 179-189, 197-199):
```css
class="text-sm"
```

**Dynamic Color Classes**:
- Green: `text-green-400`
- Yellow: `text-yellow-400`
- Red: `text-red-400`
- Muted: `theme-text-muted`

| Property | Value | Class |
|----------|-------|-------|
| **Font Size** | 14px | `text-sm` |

### Status Row Layout

**Code** (lines 149-157):
```css
class="flex items-center justify-between"
```

| Property | Value | Class |
|----------|-------|-------|
| **Display** | Flex | `flex` |
| **Align** | Center | `items-center` |
| **Justify** | Space between | `justify-between` |

**Left side**: Label text  
**Right side**: Dot + status text

### Status Container

**Code** (line 148):
```css
class="space-y-3"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Vertical Spacing** | 3 | 12px between rows |

---

## Icon Specifications

### Section Header Icons

**Code** (lines 12, 76, 142, 262, 270, 276, 282, 288):
```css
class="w-5 h-5 mr-2 text-[#ffd200]"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 5 × 5 | 20px × 20px | `w-5 h-5` |
| **Right Margin** | 2 | 8px | `mr-2` |
| **Color** | Yellow #ffd200 | - | `text-[#ffd200]` |
| **Stroke** | 2px | 2px | `stroke-width="2"` (in SVG) |

**Icon Types Used**:
- Upload cloud (File Upload section)
- Music notes (Song Details section)
- Checkmark circle (Upload Status section)
- Info circle (Upload Guidelines section)

### Guideline Checkmark Icons

**Code** (line 270):
```css
class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 4 × 4 | 16px × 16px | `w-4 h-4` |
| **Right Margin** | 2 | 8px | `mr-2` |
| **Top Margin** | 0.5 | 2px | `mt-0.5` |
| **Color** | Yellow #ffd200 | - | `text-[#ffd200]` |
| **Flex Shrink** | None | - | `flex-shrink-0` |

**Purpose**: Filled checkmark circles before each guideline

### Button Icons

**Spinner** (lines 226, 239):
```css
class="animate-spin -ml-1 mr-3 h-5 w-5"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 5 × 5 | 20px × 20px | `h-5 w-5` |
| **Left Margin** | -1 | -4px | `-ml-1` |
| **Right Margin** | 3 | 12px | `mr-3` |
| **Animation** | Spin | - | `animate-spin` |

**Checkmark** (line 233):
```css
class="w-6 h-6 mr-2 animate-scale-check"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 6 × 6 | 24px × 24px | `w-6 h-6` |
| **Right Margin** | 2 | 8px | `mr-2` |
| **Animation** | Scale check | - | `animate-scale-check` |

**Warning Icon** (lines 246, 305):
```css
class="w-5 h-5 mr-2"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Size** | 5 × 5 | 20px × 20px |
| **Right Margin** | 2 | 8px |

---

## Spacing and Padding

### Padding Scale

| Class | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `p-3` | 3 | 12px | Helper boxes |
| `p-4` | 4 | 16px | Guidelines |
| `p-6` | 6 | 24px | Cards |
| `p-8` | 8 | 32px | Upload zone |
| `px-4` | 4 (horizontal) | 16px | Input padding |
| `py-3` | 3 (vertical) | 12px | Input padding |
| `py-4` | 4 (vertical) | 16px | Button padding |

### Margin Scale

| Class | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `mb-2` | 2 | 8px | Small bottom spacing |
| `mb-4` | 4 | 16px | Section header spacing |
| `mb-6` | 6 | 24px | Larger header spacing |
| `mt-1` | 1 | 4px | Checkbox alignment, small top spacing |
| `mt-2` | 2 | 8px | Helper text, small spacing |
| `mt-4` | 4 | 16px | Helper box top spacing |
| `mr-2` | 2 | 8px | Icon spacing |
| `mr-3` | 3 | 12px | Spinner spacing |

### Gap and Space

| Class | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `gap-3` | 3 | 12px | Rights confirmation |
| `gap-6` | 6 | 24px | Form grid |
| `gap-8` | 8 | 32px | Main grid |
| `space-x-3` | 3 (horizontal) | 12px | Icon spacing |
| `space-y-1` | 1 (vertical) | 4px | File info |
| `space-y-2` | 2 (vertical) | 8px | Helper sections |
| `space-y-3` | 3 (vertical) | 12px | Status rows, guidelines |
| `space-y-4` | 4 (vertical) | 16px | Upload zone content |
| `space-y-6` | 6 (vertical) | 24px | Column sections |
| `space-y-8` | 8 (vertical) | 32px | Main sections |

---

## Responsive Breakpoints

### Breakpoint Reference

| Breakpoint | Screen Width | Usage |
|------------|--------------|-------|
| **Mobile** | < 768px | Single column layout |
| **md** | ≥ 768px | 2-column form grid |
| **lg** | ≥ 1024px | 3-column main grid (2:1 split) |

### Grid Responsiveness

**Main Grid** (line 4):
```css
grid grid-cols-1 lg:grid-cols-3
```

- Mobile: 1 column (stacked)
- Desktop (lg+): 3 columns

**Form Grid** (line 82):
```css
grid grid-cols-1 md:grid-cols-2
```

- Mobile: 1 column (stacked)
- Tablet (md+): 2 columns side-by-side

### Column Spanning

**Song Title Field** (line 84):
```css
class="md:col-span-2"
```

- Mobile: 1 column (default)
- Tablet/Desktop: Spans 2 columns (full width)

**Artist and Genre**:
- Mobile: 1 column each (stacked)
- Tablet/Desktop: Side-by-side (1 column each)

---

## Border Radius Values

### Border Radius Scale

| Class | Size Name | Value | Usage |
|-------|-----------|-------|-------|
| `rounded-lg` | Large | 8px | Inputs, dropdowns |
| `rounded-xl` | Extra Large | 12px | Upload zone, button |
| `rounded-2xl` | 2X Large | 16px | Card containers |
| `rounded-full` | Full circle | 50% | Dots, icon containers |

### Usage by Component

**Cards**: `rounded-2xl` (16px)  
**Upload Zone**: `rounded-xl` (12px)  
**Buttons**: `rounded-xl` (12px)  
**Inputs**: `rounded-lg` (8px)  
**Icon Containers**: `rounded-full` (circle)  
**Status Dots**: `rounded-full` (circle)

---

## Visual Effects

### Transitions

| Element | Class | Duration | Properties |
|---------|-------|----------|------------|
| **Upload Zone** | `transition-colors` | Default (150ms) | Colors |
| **Icon Container** | `transition-colors` | Default | Colors |
| **Button** | `transition-all` | 300ms | All properties |
| **Remove Button** | `transition-colors` | Default | Colors |
| **Inputs** | `transition-all` | Default | All properties |
| **Error Box** | `transition-all` | 300ms | All properties |

### Transform Effects

**Button Hover**:
```css
transform hover:scale-[1.02]
```

**Effect**: Grows to 102% on hover

**Button Active**:
```css
active:scale-[0.98]
```

**Effect**: Shrinks to 98% when clicked

**Button Disabled**:
```css
disabled:transform-none
```

**Effect**: No transform when disabled

### Animations

**Spinner** (lines 226, 239):
```css
animate-spin
```

**Effect**: Continuous rotation

**Checkmark** (line 233):
```css
animate-scale-check
```

**Custom Animation** (lines 642-650):
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

**Effect**: Checkmark pops in with bounce (0 → 120% → 100%)

### Hover States

**Upload Zone**:
- Border: Gray 600 → Yellow #ffd200
- Icon background: Gray 700 → Yellow #ffd200
- Icon color: Inherited → Black

**Button**:
- Background: Yellow #ffd200 → Darker yellow #e6bd00
- Scale: 100% → 102%

**Remove Button**:
- Text color: Red 400 → Red 300

---

## Complete CSS Reference

### Color Classes Used

```css
/* Yellow Accent */
text-[#ffd200]           /* Yellow text */
bg-[#ffd200]             /* Yellow background */
hover:bg-[#e6bd00]       /* Yellow hover */
bg-[#ffd200]/5           /* Yellow @ 5% opacity */
bg-[#ffd200]/90          /* Yellow @ 90% opacity */
border-[#ffd200]         /* Yellow border */
focus:ring-[#ffd200]     /* Yellow focus ring */

/* Success Green */
bg-green-400             /* Status dot */
text-green-400           /* Status text, conversion info */
text-green-300           /* Secondary success text */
bg-green-500             /* Success button */

/* Warning/Processing Yellow */
bg-yellow-400            /* Processing dot */
text-yellow-400          /* Processing text, WAV warning */

/* Error Red */
bg-red-400               /* Error dot */
text-red-400             /* Error text, remove button */
text-red-300             /* Remove button hover */
border-red-500           /* Error box border */
bg-red-500/5             /* Error box background */

/* Neutral Grays */
bg-gray-600              /* Inactive dots, neutral borders */
bg-gray-700              /* Icon background, disabled button */
text-gray-400            /* Disabled text */
border-gray-600          /* Upload zone border */

/* Info Blue */
bg-blue-600              /* Uploading button */
bg-blue-900/30           /* Help box background */
text-blue-200            /* Help box text */
text-blue-300            /* Help box headers, links */
border-blue-400          /* Help box border */

/* Black/White */
text-black               /* Button text, selected icon */
text-white               /* Loading/success button text */

/* Theme Classes */
theme-bg-card            /* Card background */
theme-border-card        /* Card border */
theme-bg-subcard         /* Nested card background */
theme-text-primary       /* Primary text */
theme-text-secondary     /* Secondary text */
theme-text-muted         /* Muted text */
theme-input              /* Input background */
```

### Layout Classes Used

```css
/* Container */
max-w-7xl               /* 1280px max width */
mx-auto                 /* Center horizontally */

/* Grid */
grid                    /* CSS Grid */
grid-cols-1             /* 1 column (mobile) */
lg:grid-cols-3          /* 3 columns at lg breakpoint */
md:grid-cols-2          /* 2 columns at md breakpoint */
lg:col-span-2           /* Span 2 columns */
lg:col-span-1           /* Span 1 column */
md:col-span-2           /* Span 2 columns at md */
gap-6                   /* 24px grid gap */
gap-8                   /* 32px grid gap */

/* Flexbox */
flex                    /* Flexbox */
flex-1                  /* Flex grow */
items-center            /* Center items vertically */
items-start             /* Align items to start */
justify-between         /* Space between */
justify-center          /* Center content */

/* Spacing */
space-y-1               /* 4px vertical spacing */
space-y-2               /* 8px vertical spacing */
space-y-3               /* 12px vertical spacing */
space-y-4               /* 16px vertical spacing */
space-y-6               /* 24px vertical spacing */
space-y-8               /* 32px vertical spacing */
space-x-3               /* 12px horizontal spacing */
```

### Sizing Classes Used

```css
/* Width */
w-full                  /* 100% width */
w-2                     /* 8px */
w-4                     /* 16px */
w-5                     /* 20px */
w-6                     /* 24px */
w-8                     /* 32px */
w-12                    /* 48px (dashboard header) */
w-16                    /* 64px */

/* Height */
h-2                     /* 8px */
h-4                     /* 16px */
h-5                     /* 20px */
h-6                     /* 24px */
h-8                     /* 32px */
h-12                    /* 48px (dashboard header) */
h-16                    /* 64px */

/* Min-width */
min-w-0                 /* Allow shrinking */
```

### Typography Classes Used

```css
/* Size */
text-xs                 /* 12px */
text-sm                 /* 14px */
text-base               /* 16px (implicit) */
text-lg                 /* 18px */
text-xl                 /* 20px */
text-2xl                /* 24px (dashboard header) */
text-3xl                /* 30px (dashboard header md+) */

/* Weight */
font-medium             /* 500 weight */
font-semibold           /* 600 weight */
font-bold               /* 700 weight */

/* Alignment */
text-center             /* Center align */
text-left               /* Left align */

/* Other */
leading-relaxed         /* Line height */
truncate                /* Text overflow ellipsis */
whitespace-pre-wrap     /* Preserve whitespace and wrap */
```

### Border Classes Used

```css
/* Width */
border                  /* 1px all sides */
border-2                /* 2px all sides */

/* Style */
border-dashed           /* Dashed border */

/* Color */
border-gray-600         /* Gray 600 */
border-gray-700         /* Gray 700 */
border-red-500          /* Red 500 */
border-blue-400         /* Blue 400 */
theme-border-card       /* Theme-aware */

/* Radius */
rounded-lg              /* 8px */
rounded-xl              /* 12px */
rounded-2xl             /* 16px */
rounded-full            /* Circle/pill */
```

### Position and Display Classes

```css
/* Display */
block                   /* Block */
inline-block            /* Inline block */
flex                    /* Flexbox */
grid                    /* CSS Grid */
hidden                  /* Display none */

/* Flex/Grid Children */
flex-1                  /* Grow */
flex-shrink-0           /* No shrink */

/* Cursor */
cursor-pointer          /* Pointer cursor */
cursor-not-allowed      /* Not allowed cursor */

/* Other */
appearance-none         /* Remove default styling */
outline-none            /* Remove outline */
```

---

## Visual Design Specifications

### Yellow Brand Color

**Primary**: `#ffd200`

**Color Swatch**:
```
████████  #ffd200  (Primary - buttons, accents, icons)
████████  #e6bd00  (Hover - darker yellow)
```

**Usage**:
- All header icons
- Upload button (ready state)
- "browse" text highlight
- Focus rings on inputs
- Selected upload zone border
- Selected file name
- Guideline checkmarks

### Upload Zone Visual States

#### Empty State
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                                             │
│              ┌─────────┐                    │
│              │   ☁️    │  (gray circle)     │
│              └─────────┘                    │
│                                             │
│           Upload your song                  │
│   Drag and drop an audio file or browse    │
│         MP3, WAV, M4A up to 50MB           │
│                                             │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
  Gray dashed border (2px)
```

#### Hover State
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                                             │
│              ┌─────────┐                    │
│              │   ☁️    │  (yellow circle)   │
│              └─────────┘                    │
│                                             │
│           Upload your song                  │
│   Drag and drop an audio file or browse    │
│         MP3, WAV, M4A up to 50MB           │
│                                             │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
  Yellow dashed border (#ffd200)
```

#### Selected State
```
┌─────────────────────────────────────────────┐
│ Slight yellow background tint (5% opacity)  │
│                                             │
│              ┌─────────┐                    │
│              │   🎵    │  (yellow circle)   │
│              └─────────┘                    │
│                                             │
│              my-song.mp3  (yellow text)     │
│              Original: 5.2 MB               │
│         After conversion: 520 KB            │
│                                             │
└─────────────────────────────────────────────┘
  Yellow solid border (#ffd200)
```

### Button Visual States

#### Ready State
```
┌─────────────────────────────────────────────┐
│        🔼 Upload Song                       │
└─────────────────────────────────────────────┘
  Yellow background (#ffd200), black text
  Hover: Darker yellow (#e6bd00)
  Slight grow on hover (102%)
```

#### Disabled State
```
┌─────────────────────────────────────────────┐
│        🔼 Upload Song                       │
└─────────────────────────────────────────────┘
  Gray background (gray-700), gray text (gray-400)
  No hover effects
```

#### Uploading State
```
┌─────────────────────────────────────────────┐
│        ⟳ Uploading...                       │
└─────────────────────────────────────────────┘
  Blue background (blue-600), white text
  Spinning loader icon
```

#### Success State
```
┌─────────────────────────────────────────────┐
│        ✓ Success!                           │
└─────────────────────────────────────────────┘
  Green background (green-500), white text
  Animated checkmark
```

#### Duplicate State
```
┌─────────────────────────────────────────────┐
│        ⚠ Duplicate Detected                 │
└─────────────────────────────────────────────┘
  Gray background (disabled), gray text
  Warning icon
```

---

## Rights Confirmation Styling

**Code** (lines 206-211):
```css
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <label class="flex items-start gap-3 theme-text-secondary">
    <input type="checkbox" v-model="rightsConfirmed" class="mt-1" />
    <span>I confirm I own the rights to upload and distribute this audio.</span>
  </label>
</div>
```

| Property | Value | Class |
|----------|-------|-------|
| **Container** | Standard card | `rounded-2xl p-6 border` |
| **Label Layout** | Flex start | `flex items-start gap-3` |
| **Gap** | 12px | `gap-3` |
| **Text Color** | Theme secondary | `theme-text-secondary` |
| **Checkbox Margin** | 4px top | `mt-1` |

---

## Upload Guidelines Styling

**Code** (lines 260-294):

### Container

```css
class="rounded-2xl p-6 border theme-bg-card theme-border-card"
```

**Same as other cards**: 16px radius, 24px padding, theme border

### Guidelines List

```css
class="space-y-3 text-sm theme-text-secondary"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Spacing** | 3 (vertical) | 12px | `space-y-3` |
| **Font Size** | Small | 14px | `text-sm` |
| **Text Color** | Theme secondary | - | `theme-text-secondary` |

### Guideline Item

```css
class="flex items-start"
```

**Icon** (16px yellow checkmark) + **Text**

| Property | Value | Class |
|----------|-------|-------|
| **Layout** | Flex | `flex items-start` |
| **Align** | Start (top) | `items-start` |

---

## Error Display Styling

**Code** (lines 299-334):

### Error Container

```css
class="theme-bg-card rounded-2xl p-6 border transition-all duration-300 border-red-500 bg-red-500/5"
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Theme card + Red tint | `theme-bg-card bg-red-500/5` |
| **Border** | Red | `border-red-500` |
| **Border Radius** | 16px | `rounded-2xl` |
| **Padding** | 24px | `p-6` |
| **Transition** | All | `transition-all duration-300` |

### Error Content Layout

```css
class="flex items-start space-x-3"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Layout** | Flex | - | `flex` |
| **Align** | Start | - | `items-start` |
| **Gap** | 3 (horizontal) | 12px | `space-x-3` |

### Error Icon

```css
class="w-6 h-6 text-red-400"
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Size** | 6 × 6 | 24px × 24px |
| **Color** | Red 400 | - |

### Error Message

```css
class="font-medium text-red-400"
```

**Pre-formatted text**:
```css
class="whitespace-pre-wrap font-sans text-sm"
```

### Help Box (WAV Conversion)

```css
class="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-400"
```

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Top Margin** | 4 | 16px | `mt-4` |
| **Padding** | 3 | 12px | `p-3` |
| **Background** | Blue 900 @ 30% | - | `bg-blue-900/30` |
| **Border Radius** | Large | 8px | `rounded-lg` |
| **Border** | Blue 400 | - | `border-blue-400` |

---

## Implementation Checklist for Mobile

### Colors
- [ ] Use exact yellow: #ffd200 for primary brand color
- [ ] Use hover yellow: #e6bd00 for button hovers
- [ ] Use green-400 for success states
- [ ] Use yellow-400 for processing/warning states
- [ ] Use red-400 for error states
- [ ] Use gray-600/700 for neutral/disabled states
- [ ] Implement theme-aware classes for light/dark modes

### Typography
- [ ] Section headers: 18px semibold
- [ ] Main upload text: 20px medium
- [ ] Labels: 14px medium
- [ ] Body text: 16px (base)
- [ ] Helper text: 12px
- [ ] Status text: 14px

### Layout
- [ ] Max container width: 1280px
- [ ] 2-column grid on desktop (2:1 ratio)
- [ ] Single column on mobile
- [ ] 32px gap between grid columns
- [ ] 24px spacing between sections

### Cards
- [ ] Border radius: 16px (rounded-2xl)
- [ ] Padding: 24px (p-6)
- [ ] 1px border with theme colors
- [ ] Theme-aware backgrounds

### Upload Zone
- [ ] 2px dashed border (gray-600)
- [ ] 12px border radius (rounded-xl)
- [ ] 32px padding (p-8)
- [ ] Hover: Yellow border (#ffd200)
- [ ] Selected: Yellow border + 5% yellow background
- [ ] Center-aligned text
- [ ] Pointer cursor

### Icons
- [ ] 64px × 64px circular containers
- [ ] 32px × 32px icons inside
- [ ] 20px × 20px header icons (yellow)
- [ ] 16px × 16px guideline checkmarks (yellow)
- [ ] 8px × 8px status dots (colored)

### Buttons
- [ ] Full width
- [ ] 16px vertical padding
- [ ] 12px border radius (rounded-xl)
- [ ] Semibold font
- [ ] Ready: Yellow (#ffd200) background, black text
- [ ] Hover: Scale to 102%, darker yellow
- [ ] Active: Scale to 98%
- [ ] Disabled: No transform, gray background

### Inputs
- [ ] Full width
- [ ] 16px/12px padding (horizontal/vertical)
- [ ] 8px border radius (rounded-lg)
- [ ] Yellow focus ring (2px, #ffd200)
- [ ] Theme-aware background and border

### Status Indicators
- [ ] 8px × 8px circular dots
- [ ] Colors: green-400, yellow-400, red-400, gray-600
- [ ] 8px right margin from text
- [ ] 14px status text

### Spacing
- [ ] Card padding: 24px
- [ ] Upload zone padding: 32px
- [ ] Input padding: 16px/12px
- [ ] Section spacing: 24px
- [ ] Grid gap: 32px
- [ ] Status row spacing: 12px

### Visual Effects
- [ ] Transitions: 300ms for buttons, default for others
- [ ] Hover scale: 102% for buttons
- [ ] Active scale: 98% for buttons
- [ ] Spinner animation for loading states
- [ ] Checkmark scale animation (0 → 120% → 100%)

---

## Quick Reference

### Exact Hex Colors

```
#ffd200  - Primary yellow (brand color)
#e6bd00  - Hover yellow (darker)
```

### Exact Tailwind Classes by Component

**Card Container**:
```
rounded-2xl p-6 border theme-bg-card theme-border-card
```

**Section Header**:
```
text-lg font-semibold theme-text-primary mb-4 flex items-center
```

**Header Icon**:
```
w-5 h-5 mr-2 text-[#ffd200]
```

**Upload Zone (Empty)**:
```
border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#ffd200] transition-colors cursor-pointer group
```

**Upload Zone (Selected)**:
```
border-[#ffd200] bg-[#ffd200]/5
```

**Upload Button (Ready)**:
```
w-full py-4 rounded-xl font-semibold bg-[#ffd200] hover:bg-[#e6bd00] text-black shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
```

**Input Field**:
```
w-full px-4 py-3 theme-input border rounded-lg focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all
```

**Status Dot**:
```
w-2 h-2 rounded-full mr-2 bg-{color}-400
```

### Pixel Measurements

| Element | Measurement |
|---------|-------------|
| **Container max width** | 1280px |
| **Card border radius** | 16px |
| **Upload zone border radius** | 12px |
| **Button border radius** | 12px |
| **Input border radius** | 8px |
| **Card padding** | 24px |
| **Upload zone padding** | 32px |
| **Input padding** | 16px (h) × 12px (v) |
| **Button padding** | 16px (vertical) |
| **Grid gap** | 32px |
| **Section spacing** | 24px |
| **Icon container** | 64px × 64px |
| **Upload icon** | 32px × 32px |
| **Header icon** | 20px × 20px |
| **Status dot** | 8px × 8px |

---

## Contact & Questions

For questions about styling, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue`
- **Tailwind Docs**: https://tailwindcss.com/docs

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

