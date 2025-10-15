# Clip Selector HTML and CSS Specifications

**Document Purpose**: This document provides the exact HTML structure and CSS/Tailwind specifications for the clip selector section from the production web app.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/WaveformSelectorDual.vue` (lines 1-708)

---

## Complete HTML Structure

**Copy-paste ready HTML for entire clip selector:**

```vue
<div class="bg-black rounded-lg p-4">
  <!-- Header -->
  <h4 class="text-white font-medium mb-4 flex items-center">
    <svg class="w-4 h-4 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"/>
    </svg>
    Select 30s Clip - Drag the Frame to Your Best Segment
  </h4>
  
  <!-- Waveform Container -->
  <div class="bg-gray-900 rounded-lg mb-4 h-20 relative overflow-hidden">
    <!-- Base gray waveform -->
    <div class="absolute inset-0 z-0"></div>
    
    <!-- Yellow waveform (masked) -->
    <div class="absolute inset-0 z-10"></div>
    
    <!-- Selection frame -->
    <div 
      v-if="duration >= 30"
      class="absolute selection-frame z-20"
      :style="selectionFrameStyle"
    >
    </div>
    
    <!-- Loading state -->
    <div v-if="loading || !audioUrl" class="absolute inset-0 flex items-center justify-center z-30">
      <div class="flex items-center space-x-2 text-gray-400">
        <svg v-if="loading" class="animate-spin h-5 w-5">...</svg>
        <span v-if="loading">Loading waveform...</span>
        <span v-else-if="!audioUrl">Waiting for audio file...</span>
      </div>
    </div>
  </div>
  
  <!-- Selection Info -->
  <div class="flex justify-between items-center mb-4">
    <div class="text-sm text-gray-300">
      <span v-if="duration >= 30">
        <span class="text-[#ffd200] font-medium">Selected: {{ formatTime(selectedStart) }}</span> → 
        <span class="text-[#ffd200] font-medium">{{ formatTime(selectedStart + 30) }}</span>
        <span class="text-gray-400 ml-2">(30 seconds)</span>
      </span>
      <span v-else class="text-green-400">
        ✓ Entire song will be used ({{ formatTime(duration) }})
      </span>
    </div>
    <div class="text-xs text-gray-400">
      Total: {{ formatTime(duration) }}
    </div>
  </div>
  
  <!-- Control Buttons -->
  <div class="flex space-x-2">
    <button
      v-if="!isPlaying"
      class="px-4 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      {{ duration >= 30 ? 'Preview Selection' : 'Preview Song' }}
    </button>
    
    <button
      v-if="isPlaying"
      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
      type="button"
    >
      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
      </svg>
      Stop
    </button>
    
    <button
      v-if="duration >= 30"
      class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      Reset to Start
    </button>
  </div>
  
  <!-- Tip Block -->
  <div class="mt-3 text-xs text-gray-400 bg-gray-900 rounded p-2">
    <span v-if="duration >= 30">
      💡 <strong>Tip:</strong> Drag the golden frame across the waveform to select your best 30-second clip. 
      The yellow waveform bars show exactly what will be used in battles!
    </span>
    <span v-else>
      ✅ <strong>Perfect!</strong> Your song is under 30 seconds, so the entire track will be used in battles. 
      The yellow waveform shows your full song!
    </span>
  </div>
</div>
```

---

## 1. Header Block Specifications

**Code** (lines 3-8):
```html
<h4 class="text-white font-medium mb-4 flex items-center">
  <svg class="w-4 h-4 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"/>
  </svg>
  Select 30s Clip - Drag the Frame to Your Best Segment
</h4>
```

### Header Styling

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Font Size** | Base | 16px | (implicit) |
| **Font Weight** | Medium | 500 | `font-medium` |
| **Color** | White | #ffffff | `text-white` |
| **Bottom Margin** | 4 | 16px | `mb-4` |
| **Layout** | Flex | - | `flex items-center` |

### Icon Styling

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Size** | 4 × 4 | 16px × 16px | `w-4 h-4` |
| **Right Margin** | 2 | 8px | `mr-2` |
| **Color** | Yellow | #ffd200 | `text-[#ffd200]` |
| **Stroke** | 2px | 2px | `stroke-width="2"` |

**Icon Type**: Video camera (outline style)

**SVG Path**:
```
d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z"
```

---

## 2. Selected Time Display

**Code** (lines 42-56):
```html
<div class="flex justify-between items-center mb-4">
  <div class="text-sm text-gray-300">
    <span v-if="duration >= 30">
      <span class="text-[#ffd200] font-medium">Selected: {{ formatTime(selectedStart) }}</span> → 
      <span class="text-[#ffd200] font-medium">{{ formatTime(selectedStart + 30) }}</span>
      <span class="text-gray-400 ml-2">(30 seconds)</span>
    </span>
    <span v-else class="text-green-400">
      ✓ Entire song will be used ({{ formatTime(duration) }})
    </span>
  </div>
  <div class="text-xs text-gray-400">
    Total: {{ formatTime(duration) }}
  </div>
</div>
```

### Layout Styling

| Property | Value | Class |
|----------|-------|-------|
| **Display** | Flex | `flex` |
| **Justify** | Space between | `justify-between` |
| **Align** | Center | `items-center` |
| **Bottom Margin** | 16px | `mb-4` |

### Left Side (Selected Range)

**Container**:
```css
text-sm text-gray-300
```

**Selected Times** (yellow):
```css
text-[#ffd200] font-medium
```

| Property | Value |
|----------|-------|
| **Font Size** | 14px (`text-sm`) |
| **Font Weight** | Medium 500 (`font-medium`) |
| **Color** | #ffd200 (`text-[#ffd200]`) |

**Example Display**: <span style="color:#ffd200">**Selected: 0:30**</span> → <span style="color:#ffd200">**1:00**</span> <span style="color:#9ca3af">(30 seconds)</span>

**"(30 seconds)" Note**:
```css
text-gray-400 ml-2
```

| Property | Value |
|----------|-------|
| **Color** | Gray 400 |
| **Left Margin** | 8px (`ml-2`) |

**Short Song Display** (< 30s):
```css
text-green-400
```
- Color: Green 400
- Shows checkmark and full duration message

### Right Side (Total Duration)

```css
text-xs text-gray-400
```

| Property | Value |
|----------|-------|
| **Font Size** | 12px (`text-xs`) |
| **Color** | Gray 400 (`text-gray-400`) |

**Example**: <span style="color:#9ca3af; font-size:12px">Total: 3:45</span>

---

## 3. Waveform Container

**Code** (lines 11-38):
```html
<div class="bg-gray-900 rounded-lg mb-4 h-20 relative overflow-hidden">
  <!-- Base gray waveform (z-0) -->
  <div ref="baseWaveform" class="absolute inset-0 z-0"></div>
  
  <!-- Yellow waveform (z-10, CSS masked) -->
  <div ref="yellowWaveform" class="absolute inset-0 z-10" :style="yellowMaskStyle"></div>
  
  <!-- Selection frame (z-20) -->
  <div 
    v-if="duration >= 30"
    ref="selectionFrame" 
    class="absolute selection-frame z-20"
    :style="selectionFrameStyle"
  >
  </div>
  
  <!-- Loading overlay (z-30) -->
  <div v-if="loading || !audioUrl" class="absolute inset-0 flex items-center justify-center z-30">
    <div class="flex items-center space-x-2 text-gray-400">
      <svg v-if="loading" class="animate-spin h-5 w-5">...</svg>
      <span>Loading waveform...</span>
    </div>
  </div>
</div>
```

### Container Styling

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Background** | Gray 900 | Tailwind | `bg-gray-900` |
| **Border Radius** | Large | 8px | `rounded-lg` |
| **Bottom Margin** | 4 | 16px | `mb-4` |
| **Height** | 20 | **80px** | `h-20` |
| **Position** | Relative | - | `relative` |
| **Overflow** | Hidden | - | `overflow-hidden` |

**Height is Fixed**: Exactly 80px (not responsive)

### Waveform Layers

**Layer 1 - Base Waveform**:
```css
absolute inset-0 z-0
```
- Position: Absolute, full container (`inset-0`)
- Z-index: 0 (bottom layer)
- Background layer (gray waveform)

**Layer 2 - Yellow Waveform**:
```css
absolute inset-0 z-10
```
- Position: Absolute, full container
- Z-index: 10 (middle layer)
- CSS masked to show only selected region

**Layer 3 - Selection Frame**:
```css
absolute selection-frame z-20
```
- Position: Absolute, positioned via inline styles
- Z-index: 20 (top interactive layer)
- Custom class `.selection-frame` (see CSS section)

**Layer 4 - Loading Overlay**:
```css
absolute inset-0 flex items-center justify-center z-30
```
- Z-index: 30 (topmost)
- Only shown when loading or no audio

---

## 4. Selection Frame Styling

### Complete CSS

**From lines 665-683:**

```css
.selection-frame {
  border: 5px solid #ffffff;
  border-radius: 8px;
  background: transparent;
  cursor: grab;
  box-shadow: 0 0 0 2px #000000, 0 2px 12px rgba(255, 210, 0, 0.6);
  transition: all 0.2s ease;
  pointer-events: all;
}

.selection-frame:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 0 0 2px #000000, 0 4px 16px rgba(255, 210, 0, 0.8);
}

.selection-frame:hover {
  box-shadow: 0 0 0 2px #000000, 0 2px 16px rgba(255, 210, 0, 0.7);
}
```

### Visual Breakdown

**Border**:
- Width: 5px
- Style: Solid
- Color: White (#ffffff)

**Border Radius**:
- Value: 8px

**Background**:
- Transparent (see-through to waveform)

**Box Shadow** (layered):
1. **Inner Ring**: `0 0 0 2px #000000`
   - Spread: 2px
   - Color: Black (outline)
   - Purpose: Creates black border around white border
   
2. **Outer Glow**: `0 2px 12px rgba(255, 210, 0, 0.6)`
   - Offset: 2px down
   - Blur: 12px
   - Color: Yellow @ 60% opacity
   - Purpose: Creates yellow glow effect

**Visual Layers**:
```
┌─────────────────────┐
│  Yellow glow (12px) │
│ ┌─────────────────┐ │
│ │ Black ring (2px)│ │
│ │┌───────────────┐│ │
│ ││White border   ││ │
│ ││   (5px)       ││ │
│ ││ Transparent   ││ │
│ ││   interior    ││ │
│ │└───────────────┘│ │
│ └─────────────────┘ │
└─────────────────────┘
```

### Interaction States

**Normal State**:
- Cursor: `grab`
- Shadow blur: 12px
- Shadow opacity: 0.6

**Hover State**:
- Cursor: `grab`
- Shadow blur: 16px (brighter)
- Shadow opacity: 0.7

**Active State** (dragging):
- Cursor: `grabbing`
- Transform: `scale(1.02)` (2% larger)
- Shadow blur: 16px
- Shadow opacity: 0.8 (brightest)

**Transitions**:
- Property: `all`
- Duration: 0.2s
- Easing: `ease`

### Important Notes

**NO Bracket Handles**: The frame is just a bordered rectangle with glow, no separate left/right bracket elements

**White Border + Black Outline**: Achieved via box-shadow, not separate borders

**Yellow Glow**: Via second box-shadow layer with yellow color

---

## 5. Button Row

**Code** (lines 59-94):
```html
<div class="flex space-x-2">
  <!-- Preview/Play Button -->
  <button
    v-if="!isPlaying"
    class="px-4 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
    type="button"
  >
    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
    Preview Selection
  </button>
  
  <!-- Stop Button -->
  <button
    v-if="isPlaying"
    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
    type="button"
  >
    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
    </svg>
    Stop
  </button>
  
  <!-- Reset Button -->
  <button
    v-if="duration >= 30"
    class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    type="button"
  >
    Reset to Start
  </button>
</div>
```

### Button Row Layout

```css
flex space-x-2
```

| Property | Value | Pixels |
|----------|-------|--------|
| **Display** | Flex | - |
| **Gap** | 2 | 8px |

### Preview Button (Yellow)

**Classes**:
```css
px-4 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed
```

| Property | Value | Class |
|----------|-------|-------|
| **Padding** | 16px × 8px | `px-4 py-2` |
| **Background** | Yellow #ffd200 | `bg-[#ffd200]` |
| **Hover Background** | Darker yellow #e6bd00 | `hover:bg-[#e6bd00]` |
| **Text Color** | Black | `text-black` |
| **Border Radius** | 8px | `rounded-lg` |
| **Transition** | Colors | `transition-colors` |
| **Font Size** | 14px | `text-sm` |
| **Font Weight** | Medium 500 | `font-medium` |
| **Layout** | Flex center | `flex items-center` |
| **Disabled Opacity** | 50% | `disabled:opacity-50` |
| **Disabled Cursor** | Not allowed | `disabled:cursor-not-allowed` |

**Play Icon**:
```html
<svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
  <path d="M8 5v14l11-7z"/>
</svg>
```
- Size: 16px × 16px
- Right margin: 8px
- Filled triangle (play symbol)

### Stop Button (Red)

**Classes**:
```css
px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Red 600 | `bg-red-600` |
| **Hover Background** | Red 700 | `hover:bg-red-700` |
| **Text Color** | White | `text-white` |

**Stop Icon**:
```html
<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
</svg>
```
- Size: 16px × 16px
- Right margin: 4px (`mr-1`)
- Filled rectangles (pause symbol)

### Reset Button (Gray)

**Classes**:
```css
px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed
```

| Property | Value | Class |
|----------|-------|-------|
| **Background** | Gray 700 | `bg-gray-700` |
| **Hover Background** | Gray 600 | `hover:bg-gray-600` |
| **Text Color** | White | `text-white` |

**No Icon**: Text only button

---

## 6. Tip Block

**Code** (lines 97-106):
```html
<div class="mt-3 text-xs text-gray-400 bg-gray-900 rounded p-2">
  <span v-if="duration >= 30">
    💡 <strong>Tip:</strong> Drag the golden frame across the waveform to select your best 30-second clip. 
    The yellow waveform bars show exactly what will be used in battles!
  </span>
  <span v-else>
    ✅ <strong>Perfect!</strong> Your song is under 30 seconds, so the entire track will be used in battles. 
    The yellow waveform shows your full song!
  </span>
</div>
```

### Tip Block Styling

| Property | Value | Pixels | Class |
|----------|-------|--------|-------|
| **Top Margin** | 3 | 12px | `mt-3` |
| **Font Size** | Extra small | 12px | `text-xs` |
| **Text Color** | Gray 400 | - | `text-gray-400` |
| **Background** | Gray 900 | - | `bg-gray-900` |
| **Border Radius** | Default | 4px | `rounded` |
| **Padding** | 2 | 8px | `p-2` |

### Text Content

**Long Song (≥30s)**:
```
💡 Tip: Drag the golden frame across the waveform to select your best 30-second clip. 
The yellow waveform bars show exactly what will be used in battles!
```

**Short Song (<30s)**:
```
✅ Perfect! Your song is under 30 seconds, so the entire track will be used in battles. 
The yellow waveform shows your full song!
```

**Bold Words**: "Tip:" and "Perfect!" wrapped in `<strong>` tags

---

## 7. Responsive Behavior

### No Explicit Breakpoints

**Component uses fixed sizing**:
- Height: 80px (fixed via `h-20`)
- No md: or lg: modifiers
- Works same on all screen sizes

**Potential Mobile Issues**:
- Buttons may wrap if container too narrow
- Waveform stays 80px tall
- Frame drag may be harder on small screens

**Recommendations for Mobile**:
- Consider larger hit area for selection frame
- May need touch-specific drag handling (already implemented)
- Button row may need flex-wrap on very small screens

---

## 8. Tailwind Classes Reference

### Complete Class List with Pixel Values

**Container Classes**:
```
bg-black           → #000000
rounded-lg         → 8px border radius
p-4                → 16px padding (all sides)
```

**Waveform Container**:
```
bg-gray-900        → Tailwind gray-900 (#111827)
rounded-lg         → 8px border radius
mb-4               → 16px bottom margin
h-20               → 80px height
relative           → position: relative
overflow-hidden    → overflow: hidden
```

**Layer Classes**:
```
absolute           → position: absolute
inset-0            → top:0 right:0 bottom:0 left:0
z-0                → z-index: 0
z-10               → z-index: 10
z-20               → z-index: 20
z-30               → z-index: 30
```

**Typography**:
```
text-white         → #ffffff
text-gray-300      → Tailwind gray-300 (#d1d5db)
text-gray-400      → Tailwind gray-400 (#9ca3af)
text-green-400     → Tailwind green-400 (#4ade80)
text-[#ffd200]     → #ffd200 (custom yellow)
text-sm            → 14px
text-xs            → 12px
font-medium        → 500 weight
```

**Spacing**:
```
mb-4               → 16px bottom margin
mt-3               → 12px top margin
mr-1               → 4px right margin
mr-2               → 8px right margin
ml-2               → 8px left margin
space-x-2          → 8px horizontal gap
space-y-3          → 12px vertical gap (not used here)
```

**Layout**:
```
flex               → display: flex
items-center       → align-items: center
items-start        → align-items: flex-start
justify-between    → justify-content: space-between
justify-center     → justify-content: center
```

**Buttons**:
```
px-4               → 16px horizontal padding
py-2               → 8px vertical padding
rounded-lg         → 8px border radius
transition-colors  → color transition
```

**Colors**:
```
bg-[#ffd200]       → #ffd200 (yellow)
hover:bg-[#e6bd00] → #e6bd00 (darker yellow hover)
bg-red-600         → Tailwind red-600
hover:bg-red-700   → Tailwind red-700
bg-gray-700        → Tailwind gray-700
hover:bg-gray-600  → Tailwind gray-600
```

---

## 9. Custom CSS

### Complete Custom Styles

**From lines 663-708:**

```css
<style scoped>
/* Selection frame styling */
.selection-frame {
  border: 5px solid #ffffff;
  border-radius: 8px;
  background: transparent;
  cursor: grab;
  box-shadow: 0 0 0 2px #000000, 0 2px 12px rgba(255, 210, 0, 0.6);
  transition: all 0.2s ease;
  pointer-events: all;
}

.selection-frame:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 0 0 2px #000000, 0 4px 16px rgba(255, 210, 0, 0.8);
}

.selection-frame:hover {
  box-shadow: 0 0 0 2px #000000, 0 2px 16px rgba(255, 210, 0, 0.7);
}

/* Prevent text selection during drag */
.selection-frame {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Ensure proper layering */
:deep(.wavesurfer) {
  overflow: visible;
}

:deep(.wavesurfer canvas) {
  display: block;
}

/* Container styling */
.waveform-container {
  position: relative;
}
</style>
```

### CSS Variables and Dependencies

**No CSS Variables Used**: All values are hardcoded

**Color Values**:
- White: `#ffffff`
- Black: `#000000`
- Yellow: `#ffd200` (SongWars brand)
- Yellow glow: `rgba(255, 210, 0, 0.6)` → `rgba(255, 210, 0, 0.8)`

**WaveSurfer Deep Selectors**: Styles applied to WaveSurfer library elements

---

## Visual Specifications Summary

### Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| **Container** | Black | `#000000` |
| **Waveform BG** | Gray 900 | `#111827` |
| **Frame Border** | White | `#ffffff` |
| **Frame Outline** | Black | `#000000` |
| **Frame Glow** | Yellow | `rgba(255, 210, 0, 0.6-0.8)` |
| **Header Icon** | Yellow | `#ffd200` |
| **Selected Times** | Yellow | `#ffd200` |
| **Gray Text** | Gray 300/400 | `#d1d5db` / `#9ca3af` |
| **Green Text** | Green 400 | `#4ade80` |
| **Yellow Button** | Yellow | `#ffd200` |
| **Yellow Hover** | Darker Yellow | `#e6bd00` |

### Dimensions

| Element | Size | Pixels |
|---------|------|--------|
| **Container Padding** | - | 16px |
| **Waveform Height** | - | 80px (fixed) |
| **Frame Border** | - | 5px |
| **Frame Radius** | - | 8px |
| **Black Outline** | - | 2px (spread) |
| **Yellow Glow** | - | 12-16px (blur) |
| **Header Icon** | - | 16px × 16px |
| **Button Icon** | - | 16px × 16px |
| **Button Padding** | - | 16px × 8px |

### Typography

| Element | Size | Weight |
|---------|------|--------|
| **Header** | 16px | Medium (500) |
| **Selected Info** | 14px | Normal / Medium (yellow parts) |
| **Total Duration** | 12px | Normal |
| **Button Text** | 14px | Medium |
| **Tip Text** | 12px | Normal |

---

## Implementation Checklist

### HTML Structure
- [ ] Outer container: bg-black rounded-lg p-4
- [ ] Header h4 with video icon and text
- [ ] Waveform container: bg-gray-900 h-20 relative
- [ ] Three waveform layers (base, yellow, frame)
- [ ] Selection info with flex justify-between
- [ ] Button row with flex space-x-2
- [ ] Tip block at bottom

### Selection Frame CSS
- [ ] 5px white solid border
- [ ] 8px border radius
- [ ] Transparent background
- [ ] Box shadow: 2px black ring + 12px yellow glow
- [ ] Grab/grabbing cursors
- [ ] Hover/active states
- [ ] Scale 1.02 on active
- [ ] User-select prevention

### Colors
- [ ] Use exact yellow: #ffd200
- [ ] Yellow hover: #e6bd00
- [ ] Gray 900 for waveform background
- [ ] White frame border
- [ ] Black frame outline
- [ ] Yellow glow with opacity

### Buttons
- [ ] Preview: Yellow background, black text, play icon
- [ ] Stop: Red background, white text, pause icon
- [ ] Reset: Gray background, white text, no icon
- [ ] All 14px medium font, 8px vertical padding
- [ ] Icons 16px with appropriate margins

### Text Display
- [ ] Selected times in yellow (#ffd200) medium weight
- [ ] Total duration in gray-400, 12px
- [ ] Tip text in gray-400, 12px
- [ ] Bold "Tip:" and "Perfect!" labels

---

## Contact & Questions

For questions about styling, refer to:
- **Web App Source**: `components/WaveformSelectorDual.vue`

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

