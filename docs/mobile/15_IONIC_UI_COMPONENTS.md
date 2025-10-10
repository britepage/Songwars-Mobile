# Ionic UI Components Guide

## Overview
How to translate SongWars UI to Ionic components with consistent patterns.

## Core Components
- `ion-page`, `ion-header`, `ion-toolbar`, `ion-title`
- `ion-content` with safe areas and scroll
- `ion-tabs`, `ion-tab-bar`, `ion-tab-button`
- `ion-button`, `ion-icon`, `ion-badge`, `ion-chip`
- Lists: `ion-list`, `ion-item`, `ion-label`, `ion-note` + `ion-item-sliding`
- Inputs: `ion-input`, `ion-textarea`, `ion-select`, `ion-toggle`, `ion-checkbox`
- Feedback: `ion-spinner`, `ion-skeleton-text`, `ion-alert`, `ion-toast`
- Overlays: `ion-modal`, `ion-action-sheet`, `ion-popover`

## Layout Patterns

### Standard Page
```vue
<ion-page>
  <ion-header>
    <ion-toolbar>
      <ion-title>Title</ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content fullscreen>
    <div class="page-content">
      <slot />
    </div>
  </ion-content>
</ion-page>
```

### Tabs
Map SongWars sections to tabs: Home, Battle, My Songs, Leaderboard, Account.

### Cards for Song Rows
```vue
<ion-card v-for="song in songs" :key="song.id">
  <ion-card-content class="song-row">
    <div>
      <h4>{{ song.title }}</h4>
      <p>{{ song.genre }}</p>
    </div>
    <ion-button fill="clear" @click="play(song)">
      <ion-icon :icon="isPlaying(song) ? pause : play" />
    </ion-button>
  </ion-card-content>
</ion-card>
```

## Accessibility
- Minimum 44px tap targets
- Use `aria-label` for icon-only buttons
- High-contrast colors for dark mode

## Theming Hooks
- Use Ionic CSS variables (`--ion-color-primary`, etc.)
- Bridge Tailwind utilities where helpful (see Styling doc)

## Animation
- Prefer Ionic’s built-in transitions
- For custom micro-interactions, use CSS `transition` and `transform`

