# SongWars Frontend Styling and UI Framework

## Overview
SongWars uses **Tailwind CSS 4.1.8** as the primary styling framework, combined with custom CSS and a retro-themed design system. The application follows a mobile-first responsive design approach with comprehensive theming support.

## Styling Architecture

### Core Framework
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Custom CSS** - Component-specific styles
- **CSS Variables** - Theme customization
- **Responsive Design** - Mobile-first approach

### Design System
- **Retro Theme** - 80s/90s inspired design
- **SongWars Branding** - Consistent brand colors and typography
- **Component Library** - Reusable styled components
- **Theme Support** - Light and dark mode variants

## Tailwind CSS Configuration

### 1. Core Setup
```typescript
// nuxt.config.ts
modules: [
  '@nuxtjs/tailwindcss',
  '@tailwindcss/vite'
]
```

### 2. Custom Configuration
- **Custom Colors**: SongWars brand colors
- **Typography**: Custom font families
- **Spacing**: Consistent spacing scale
- **Breakpoints**: Mobile-first responsive breakpoints

### 3. Utility Classes
- **Layout**: Flexbox and Grid utilities
- **Spacing**: Margin and padding utilities
- **Typography**: Text styling utilities
- **Colors**: Brand and theme colors
- **Responsive**: Mobile-first responsive utilities

## Brand Colors and Theme

### 1. Primary Colors
- **SongWars Yellow**: `#ffd200` - Primary brand color
- **Black**: `#000000` - Text and borders
- **White**: `#ffffff` - Backgrounds and text
- **Gray Scale**: Various gray shades for UI elements

### 2. Theme Colors
```css
:root {
  --primary-yellow: #ffd200;
  --primary-black: #000000;
  --primary-white: #ffffff;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

### 3. Dark Mode Colors
```css
[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #111827;
  --text-primary: #ffffff;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}
```

## Component Styling Patterns

### 1. Retro Button System
**Base Button Classes**:
```css
.bigbutton {
  border: 2px solid #000;
  border-radius: 5px;
  background: #ffd200;
  color: #000;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  top: 0;
  left: 0;
  transition-property: box-shadow, top, left;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
}
```

**Button Sizes**:
- `.bigbutton-small` - Compact buttons
- `.bigbutton-medium` - Standard buttons
- `.bigbutton-large` - Prominent buttons

**Button States**:
- Hover effects with shadow and position changes
- Disabled state with opacity reduction
- Loading state with color changes

### 2. Card Components
**Card Base**:
```css
.card {
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
}
```

**Card Variants**:
- `.card-dark` - Dark theme cards
- `.card-elevated` - Elevated shadow cards
- `.card-interactive` - Hover effects

### 3. Form Elements
**Input Styling**:
```css
.form-input {
  border: 2px solid #d1d5db;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #ffd200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}
```

**Form States**:
- Focus states with yellow accent
- Error states with red borders
- Success states with green accents
- Disabled states with gray styling

## Responsive Design System

### 1. Breakpoint System
```css
/* Mobile First Approach */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */
```

### 2. Mobile-First Utilities
- **Grid System**: Responsive grid layouts
- **Flexbox**: Flexible layouts
- **Spacing**: Responsive spacing
- **Typography**: Responsive text sizes

### 3. Mobile Optimizations
- **Touch Targets**: Minimum 44px touch targets
- **Readable Text**: Appropriate font sizes
- **Thumb-Friendly**: Easy thumb navigation
- **Performance**: Optimized for mobile networks

## Theme System

### 1. Theme Toggle
**Theme Store Integration**:
```typescript
// store/themeStore.ts
const theme = ref<'light' | 'dark'>('light')
const isDarkMode = computed(() => theme.value === 'dark')
```

**Theme Application**:
```css
.theme-bg-primary {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 2. CSS Variables
**Dynamic Theme Variables**:
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --border-color: #e5e7eb;
}

[data-theme="dark"] {
  --bg-primary: #000000;
  --text-primary: #ffffff;
  --border-color: #374151;
}
```

### 3. Component Theme Support
- **Conditional Classes**: Theme-based class application
- **CSS Variables**: Dynamic color values
- **Smooth Transitions**: Theme change animations
- **System Theme Detection**: Automatic theme detection

## Animation and Transitions

### 1. CSS Transitions
**Button Animations**:
```css
.bigbutton:hover {
  top: 2px;
  left: 2px;
  box-shadow: 1px 1px 0 #000 !important;
}
```

**Theme Transitions**:
```css
.theme-transition {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 2. Vue Transitions
**Page Transitions**:
```vue
<transition name="page" mode="out-in">
  <NuxtPage />
</transition>
```

**Component Transitions**:
```vue
<transition name="fade" appear>
  <div v-if="show">Content</div>
</transition>
```

### 3. Custom Animations
**Roulette Wheel**:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.roulette-spin {
  animation: spin 3s ease-in-out;
}
```

**Loading States**:
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-pulse {
  animation: pulse 2s infinite;
}
```

## Typography System

### 1. Font Families
- **Primary**: System font stack
- **Headings**: Bold system fonts
- **Code**: Monospace font stack
- **Icons**: SVG icon system

### 2. Typography Scale
```css
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; }
```

### 3. Text Utilities
- **Font Weights**: Light to bold
- **Line Heights**: Consistent line spacing
- **Letter Spacing**: Character spacing
- **Text Colors**: Theme-aware colors

## Layout System

### 1. Grid System
**CSS Grid Layouts**:
```css
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

**Responsive Grids**:
```css
.grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### 2. Flexbox Layouts
**Flex Utilities**:
```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
```

### 3. Spacing System
**Consistent Spacing**:
```css
.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
```

## Component-Specific Styling

### 1. Battle Interface
**Battle Container**:
```css
.battle-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

**Song Cards**:
```css
.song-card {
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  box-shadow: 4px 4px 0 #000;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: translateY(-2px);
}
```

### 2. Audio Players
**Tape Player**:
```css
.tape-player {
  background: #f3f4f6;
  border: 3px solid #000;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
}

.tape-player::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #000;
  border-radius: 50%;
}
```

**Record Player**:
```css
.record-player {
  background: #1f2937;
  border: 4px solid #000;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  position: relative;
}

.record-player::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #ffd200;
  border-radius: 50%;
}
```

### 3. Admin Interface
**Admin Cards**:
```css
.admin-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1.5rem;
  color: white;
}

.admin-card:hover {
  border-color: #ffd200;
  box-shadow: 0 0 0 1px #ffd200;
}
```

## Accessibility Features

### 1. Focus Management
**Focus Indicators**:
```css
.focus-visible:focus {
  outline: 2px solid #ffd200;
  outline-offset: 2px;
}
```

**Skip Links**:
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #ffd200;
  color: #000;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

### 2. Screen Reader Support
**Visually Hidden**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 3. High Contrast Support
**High Contrast Mode**:
```css
@media (prefers-contrast: high) {
  .bigbutton {
    border-width: 3px;
    font-weight: bold;
  }
}
```

## Performance Optimizations

### 1. CSS Optimization
- **Utility-First**: Minimal custom CSS
- **Purge CSS**: Remove unused styles
- **Critical CSS**: Above-the-fold styles
- **CSS Variables**: Efficient theme switching

### 2. Animation Performance
- **GPU Acceleration**: Transform-based animations
- **Reduced Motion**: Respect user preferences
- **Efficient Transitions**: Hardware-accelerated properties
- **Animation Controls**: Pause/play animations

### 3. Mobile Performance
- **Touch Optimization**: Smooth touch interactions
- **Reduced Animations**: Simplified mobile animations
- **Efficient Rendering**: Optimized paint operations
- **Memory Management**: Proper cleanup

## Browser Support

### 1. Modern Browsers
- **Chrome 90+**: Full feature support
- **Firefox 88+**: Full feature support
- **Safari 14+**: Full feature support
- **Edge 90+**: Full feature support

### 2. Progressive Enhancement
- **Graceful Degradation**: Fallbacks for older browsers
- **Feature Detection**: Conditional feature loading
- **Polyfills**: Support for missing features
- **Compatibility**: Cross-browser consistency

This comprehensive styling and UI documentation provides developers with a complete understanding of the SongWars design system, enabling consistent and effective UI development throughout the application.
