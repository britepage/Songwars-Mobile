# Styling & Theming - Exact Web App Parity

## Overview
This guide provides the **exact styling specifications** from the SongWars web app. All values, colors, and animations must match precisely for visual parity.

**Reference**: See `COMPLETE_STYLE_GUIDE.md` for comprehensive details.

---

## Primary Brand Colors

### Exact Hex Values
```css
/* Primary Yellow - Used throughout the app */
#ffd200

/* Primary Purple (Accent Color) */
#8b5cf6

/* Purple Hover State */
#7c3aed
```

---

## Theme Variables System

### Create `src/theme/variables.css`

Copy these **exact** CSS variables:

```css
/* Theme CSS Variables - Exact from web app */
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

/* Map to Ionic Variables */
:root {
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

  --ion-background-color: var(--bg-primary);
  --ion-text-color: var(--text-primary);
}

[data-theme="dark"] {
  --ion-background-color: #000000;
  --ion-text-color: #ffffff;
}
```

---

## Retro Button System

### Create `src/theme/bigbutton.css`

**Copy these exact button styles**:

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

### Usage with Ionic
```vue
<ion-button class="bigbutton bigbutton-medium" expand="block">
  Start Battle
</ion-button>
```

---

## Theme Utility Classes

### Create `src/theme/utilities.css`

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

.theme-bg-card {
  background-color: var(--card-bg);
}

.theme-bg-subcard {
  background-color: var(--card-bg);
}
[data-theme="light"] .theme-bg-subcard {
  background-color: #f3f4f6 !important; /* gray-100 */
}
[data-theme="dark"] .theme-bg-subcard {
  background-color: #374151 !important; /* gray-700 */
}

/* Card styling */
.theme-card {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  transition: background-color 0.3s ease, border-color 0.3s ease;
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

/* Header styling */
.theme-header {
  background-color: rgba(255, 255, 255, 0.95);
  border-color: #e5e7eb; /* gray-200 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Keep header white in both themes */
[data-theme="dark"] .theme-header {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}

/* Social cards */
.social-card {
  background-color: var(--card-bg);
}
[data-theme="light"] .social-card {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important;
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

### Create `src/theme/animations.css`

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

/* Utility Classes */
.gradient-text {
  background: linear-gradient(45deg, #8b5cf6, #ec4899, #f59e0b);
  background-size: 300% 300%;
  animation: gradient-shift 3s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-glow:hover {
  animation: pulse-glow 1.5s infinite;
}
```

---

## Typography

```css
/* Global Font Family */
body, ion-app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
```

---

## Component-Specific Styles

### Footer Navigation
```css
/* Footer styling */
ion-tab-bar {
  --background: #ffffff;
  --border: 1px solid #e5e7eb;
  position: fixed;
  bottom: 0;
  z-index: 50;
}

ion-tab-button {
  --color: #4b5563; /* gray-600 */
  --color-selected: #ffd200;
}

/* Add Song button (center) */
.add-song-button {
  width: 3rem;
  height: 3rem;
  background-color: #ffd200;
  border-radius: 50%;
  border: 2px solid #000000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### TapePlayer Component
```css
/* Cassette gear animation */
@keyframes spin-gear {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

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

---

## Mobile-Specific CSS

### Touch Targets
```css
@media (max-width: 768px) {
  button, .clickable, ion-button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Safe Area Handling
```css
/* iOS safe areas */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top);
}
```

### Page Transitions
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

---

## Dark Mode Implementation

### Toggle Function (Capacitor)
```typescript
import { Preferences } from '@capacitor/preferences'

export async function setTheme(mode: 'light' | 'dark' | 'system') {
  await Preferences.set({ key: 'theme', value: mode })
  document.documentElement.setAttribute('data-theme', mode)
}

export async function loadTheme() {
  const { value } = await Preferences.get({ key: 'theme' })
  const theme = value || 'system'
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
}
```

---

## Import Order

In your `main.ts` or `App.vue`:

```typescript
// Theme files must be imported in this order
import './theme/variables.css'
import './theme/utilities.css'
import './theme/bigbutton.css'
import './theme/animations.css'

// Then Ionic CSS
import '@ionic/vue/css/core.css'
```

---

## Testing Checklist

For each page/component, verify:

- [ ] Colors match exactly (`#ffd200`, `#8b5cf6`, `#7c3aed`)
- [ ] Retro buttons render with correct shadow effect
- [ ] Theme toggle switches all colors correctly
- [ ] Typography uses Inter font family
- [ ] Spacing matches web app (padding, margins)
- [ ] Animations run at correct speed (durations match)
- [ ] Touch targets minimum 44px
- [ ] Safe areas respected on iOS
- [ ] Dark mode backgrounds are true black (#000000)
- [ ] Light mode backgrounds are white (#ffffff)

---

## Common Mistakes

❌ **Using generic Ionic colors**
```css
/* Don't use default Ionic colors */
--ion-color-primary: #3880ff; /* WRONG */
```

✅ **Use exact brand colors**
```css
/* Use SongWars yellow */
--ion-color-primary: #ffd200; /* CORRECT */
```

❌ **Approximating spacing**
```css
padding: 10px 20px; /* WRONG - not exact */
```

✅ **Use exact spacing**
```css
padding: 12px 24px; /* CORRECT - matches bigbutton-medium */
```

---

## Resources

- **Complete Style Guide**: `COMPLETE_STYLE_GUIDE.md`
- **Web App Source**: `assets/css/main.css`
- **Button Styles**: `app.vue` lines 207-271
- **Theme Variables**: `main.css` lines 4-36

---

**Critical**: Every CSS value must match the web app exactly. Use `COMPLETE_STYLE_GUIDE.md` as your source of truth.
