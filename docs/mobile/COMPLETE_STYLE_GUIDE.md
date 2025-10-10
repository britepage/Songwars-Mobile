# Complete Visual Style Guide

## Overview
This document provides **exact, copy-paste ready** styling specifications extracted directly from the SongWars web app. Use this as your single source of truth for achieving pixel-perfect parity between web and mobile apps.

---

## Color System

### Primary Brand Colors
```css
/* Primary Yellow - Used 122 times across 19 files */
#ffd200

/* Primary Purple (Accent) */
#8b5cf6

/* Purple Hover State */
#7c3aed
```

### Complete CSS Variable System
Extract from `assets/css/main.css` - **Copy this exactly**:

```css
/* Theme CSS Variables */
:root {
  /* Light theme colors (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f8fafc;
  --text-primary: #000000;
  --text-secondary: #1f2937;
  --text-muted: #6b7280;
  --border-color: #d1d5db;
  --accent-color: #8b5cf6;
  --accent-hover: #7c3aed;
  --sidebar-bg: #ffffff;
  --card-bg: #ffffff;
  --card-border: #d1d5db;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] {
  /* Dark theme colors */
  --bg-primary: #000000;
  --bg-secondary: #0f0f0f;
  --bg-tertiary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-muted: #9ca3af;
  --border-color: #374151;
  --accent-color: #8b5cf6;
  --accent-hover: #7c3aed;
  --sidebar-bg: #000000;
  --card-bg: #1a1a1a;
  --card-border: #374151;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
}
```

### Ionic Equivalent
Map to Ionic variables in `src/theme/variables.css`:

```css
:root {
  /* Brand Colors */
  --ion-color-primary: #ffd200;
  --ion-color-primary-rgb: 255, 210, 0;
  --ion-color-primary-contrast: #000000;
  --ion-color-primary-contrast-rgb: 0, 0, 0;
  --ion-color-primary-shade: #e0b900;
  --ion-color-primary-tint: #ffd71a;

  --ion-color-secondary: #8b5cf6;
  --ion-color-secondary-rgb: 139, 92, 246;
  --ion-color-secondary-contrast: #ffffff;
  --ion-color-secondary-contrast-rgb: 255, 255, 255;
  --ion-color-secondary-shade: #7a51d8;
  --ion-color-secondary-tint: #9770f7;

  /* Background Colors */
  --ion-background-color: var(--bg-primary);
  --ion-text-color: var(--text-primary);
  --ion-card-background: var(--card-bg);
  --ion-item-background: var(--card-bg);
  
  /* Border Colors */
  --ion-border-color: var(--border-color);
}

[data-theme="dark"] {
  --ion-background-color: #000000;
  --ion-text-color: #ffffff;
  --ion-card-background: #1a1a1a;
  --ion-item-background: #1a1a1a;
  --ion-border-color: #374151;
}
```

---

## Retro Button System ("bigbutton")

### Complete CSS (Copy-Paste from app.vue lines 207-271)

```css
/* Retro button styling - Base */
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

/* Small size */
.bigbutton-small {
  line-height: 1.2em;
  padding: 8px 16px;
  font-size: 0.875em;
  box-shadow: 2px 2px 0 #000;
}

.bigbutton-small:hover {
  top: 2px;
  left: 2px;
  box-shadow: 1px 1px 0 #000 !important;
}

/* Medium size (default) */
.bigbutton-medium {
  line-height: 1.4em;
  padding: 12px 24px;
  font-size: 1.125em;
  box-shadow: 2px 2px 0 #000;
}

.bigbutton-medium:hover {
  top: 2px;
  left: 2px;
  box-shadow: 1px 1px 0 #000 !important;
}

/* Large size */
.bigbutton-large {
  line-height: 1.5em;
  padding: 20px 45px;
  font-size: 1.5em;
  box-shadow: 3px 3px 0 #000;
}

.bigbutton-large:hover {
  top: 4px;
  left: 4px;
  box-shadow: 1px 1px 0 #000 !important;
}

.bigbutton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  top: 0;
  left: 0;
  box-shadow: 3px 3px 0 #000;
}
```

### Usage Examples

**Small Button**:
```html
<button class="bigbutton bigbutton-small">Profile</button>
```

**Medium Button** (most common):
```html
<button class="bigbutton bigbutton-medium">Start Battle</button>
```

**Large Button**:
```html
<button class="bigbutton bigbutton-large">Let's Go!</button>
```

### Ionic Conversion
For Ionic, create custom CSS class and apply to `<ion-button>`:

```vue
<ion-button class="bigbutton bigbutton-medium" expand="block">
  Start Battle
</ion-button>
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Font Sizes (Common Patterns)
```css
/* From BattleAnimation.vue line 56 */
.title-large {
  font-size: 3.75rem; /* 60px - battle complete */
  font-weight: 700;
  color: #ffd200;
}

/* From dashboard.vue line 98 */
.title-medium {
  font-size: 1.875rem; /* 30px - section headers */
  font-weight: 700;
}

/* From FooterNavigation.vue line 13 */
.nav-label {
  font-size: 0.75rem; /* 12px - tab labels */
  font-weight: 500;
}
```

---

## Theme Utility Classes

### From main.css - Copy Exact Classes

```css
/* Theme-aware text colors */
.theme-text-primary {
  color: var(--text-primary);
}

.theme-text-secondary {
  color: var(--text-secondary);
}

.theme-text-muted {
  color: var(--text-muted);
}

/* Theme-aware backgrounds */
.theme-bg-primary {
  background-color: var(--bg-primary);
}

.theme-bg-secondary {
  background-color: var(--bg-secondary);
}

.theme-bg-card {
  background-color: var(--card-bg);
}

/* Card styling */
.theme-card {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Sub-cards (lighter/darker variations) */
.theme-bg-subcard {
  background-color: var(--card-bg);
}
[data-theme="light"] .theme-bg-subcard {
  background-color: #f3f4f6 !important; /* gray-100 */
}
[data-theme="dark"] .theme-bg-subcard {
  background-color: #374151 !important; /* gray-700 */
}

.theme-border-subcard {
  border-color: var(--card-border);
}
[data-theme="light"] .theme-border-subcard {
  border-color: #e5e7eb !important; /* gray-200 */
}
[data-theme="dark"] .theme-border-subcard {
  border-color: #4b5563 !important; /* gray-600 */
}

/* Input styling */
.theme-input {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  color: var(--text-primary);
}

.theme-input::placeholder {
  color: var(--text-muted);
}

[data-theme="dark"] .theme-input {
  background-color: #374151 !important; /* gray-700 */
  border-color: #4b5563 !important; /* gray-600 */
  color: #ffffff !important;
}

[data-theme="dark"] .theme-input::placeholder {
  color: #9ca3af !important; /* gray-400 */
}
```

---

## Component-Specific Styling

### 1. Mobile Header (app.vue lines 4-34)

```css
.theme-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid #e5e7eb; /* gray-200 */
}

/* Keep header white in both themes */
[data-theme="dark"] .theme-header {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}
```

### 2. Footer Navigation (FooterNavigation.vue)

```css
/* Footer styling */
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb; /* gray-200 */
}

/* Nav buttons */
.nav-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  transition: color 0.2s;
  background-color: transparent;
}

.nav-button.active {
  color: #ffd200;
}

.nav-button:not(.active) {
  color: #4b5563; /* gray-600 */
}

.nav-button:not(.active):hover {
  color: #1f2937; /* gray-800 */
}

/* Add Song button (center) */
.add-song-button {
  width: 3rem;
  height: 3rem;
  background-color: #ffd200;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 2px solid #000000;
  transform: scale(1);
  transition: transform 0.2s;
}

.add-song-button.active {
  transform: scale(1.1);
}

.add-song-button:hover {
  transform: scale(1.1);
}
```

### 3. TapePlayer Component (TapePlayer.vue)

```css
/* Cassette tape container */
.tape-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Gear rotation animation */
@keyframes spin-gear {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Gear positioning (exact from TapePlayer.vue) */
.left-gear {
  position: absolute;
  left: 21.4%;
  top: 40.5%;
  width: 28px;
  height: 28px;
  animation: spin-gear 2s linear infinite;
}

.right-gear {
  position: absolute;
  left: 65.0%;
  top: 40.5%;
  width: 28px;
  height: 28px;
  animation: spin-gear 2s linear infinite;
}
```

### 4. Social Links Cards

```css
/* Social card styling (from main.css lines 344-360) */
.social-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
}

[data-theme="light"] .social-card {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important; /* gray-200 */
}

[data-theme="dark"] .social-card {
  background-color: #1f2937 !important; /* gray-800 */
  border-color: #4b5563 !important; /* gray-600 */
}

[data-theme="dark"] .social-card:hover {
  background-color: #374151 !important; /* gray-700 */
}
```

---

## Animations

### From main.css (lines 495-522) - Copy Exact

```css
/* Slide In Up Animation */
@keyframes slideInUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Float Animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Pulse Glow Animation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
  }
}

/* Spin Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Gradient Shift Animation */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Animated Gradient Text */
.gradient-text {
  background: linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b);
  background-size: 300% 300%;
  animation: gradient-shift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button Glow on Hover */
.btn-glow:hover {
  animation: pulse-glow 1.5s infinite;
}
```

---

## Spacing & Layout

### Mobile Touch Targets
```css
/* From main.css lines 656-661 */
@media (max-width: 768px) {
  button, .clickable {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Common Padding Values
```css
/* Dashboard header */
.section-header {
  padding: 1rem 1.5rem; /* 16px 24px */
}

/* Card content */
.card-content {
  padding: 1.5rem; /* 24px */
}

/* Mobile page content */
.page-content-mobile {
  padding: 1rem; /* 16px on mobile */
}

/* Desktop page content */
.page-content-desktop {
  padding: 1.5rem 2rem; /* 24px 32px on desktop */
}
```

---

## Glassmorphism Effects

### From main.css (lines 663-668)

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Modal backdrop */
.modal-backdrop {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

---

## Scrollbar Styling

### From main.css (lines 524-540)

```css
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--text-muted);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
```

---

## Accessibility

### Focus States (main.css lines 602-608)

```css
button:focus,
select:focus,
audio:focus {
  outline: 2px solid #8b5cf6;
  outline-offset: 2px;
}
```

### Screen Reader Only Content (main.css lines 687-697)

```css
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

---

## Mobile-Specific CSS

### Page Transitions (main.css lines 670-684)

```css
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
```

### Safe Area Handling

```css
@media (max-width: 768px) {
  .safe-area-bottom {
    height: env(safe-area-inset-bottom, 0.5rem);
  }
  
  .safe-area-top {
    height: env(safe-area-inset-top, 0);
  }
}
```

---

## Implementation Checklist

For each component/page, verify:

- [ ] Colors match exactly (`#ffd200`, `#8b5cf6`, `#7c3aed`)
- [ ] Retro buttons use exact CSS from above
- [ ] Theme variables work in light and dark modes
- [ ] Spacing matches (padding, margins, gaps)
- [ ] Typography uses Inter font family
- [ ] Animations use exact keyframes
- [ ] Touch targets are minimum 44px
- [ ] Glassmorphism effects match
- [ ] Scrollbars styled consistently
- [ ] Focus states for accessibility
- [ ] Safe area insets on mobile devices

---

## Quick Reference: Most Common Styles

```css
/* Primary button */
.bigbutton.bigbutton-medium

/* Primary yellow */
#ffd200

/* Primary purple */
#8b5cf6

/* Card background */
.theme-bg-card

/* Text color */
.theme-text-primary

/* Input styling */
.theme-input

/* Mobile header */
.theme-header

/* Footer nav active state */
color: #ffd200
```

---

**Use this guide as your single source of truth. All values are extracted directly from the production web app code.**

