# Offline Support Guide

## Overview
Robust offline behavior using Capacitor `Preferences` for lightweight caches and an offline queue for writes. This complements the mobile stores in `07_STATE_MANAGEMENT.md`.

## Goals
- Read core data while offline
- Queue writes (uploads/edits/deletes) and replay when online
- Avoid data loss and resolve conflicts sanely

## Building Blocks
- Storage: Capacitor `Preferences` for small JSON caches
- Network: Capacitor `Network` to detect connectivity changes
- Queue: `offlineStore` (see `07_STATE_MANAGEMENT.md`) for pending actions

## What to Cache
- Current user profile
- User’s song list (metadata)
- Recent battles (lightweight)
- Leaderboard pages (top N only)

## What NOT to Cache
- Auth tokens in plain storage (Supabase handles securely)
- Large audio files (stream when online, consider background downloads later)

## Write Queue Schema
```ts
interface OfflineAction {
  id: string
  action: 'upload_song' | 'update_song' | 'delete_song' | 'update_profile'
  payload: any
  timestamp: string
  retryCount: number
}
```

Actions are pushed into `pending_sync` and processed after reconnect.

## Sync Strategy
1. On app start, load caches
2. Listen to `Network.networkStatusChange`
3. When `connected === true`:
   - Process `pending_sync` items FIFO
   - Exponential backoff on failures (1s, 2s, 4s)
   - Drop after 3 retries and surface to UI

## Conflict Handling
- Prefer “last-write-wins” for profile fields
- For songs, use server timestamps and avoid destructive updates offline
- For deletes, mark locally as `deleted` then confirm server success before fully removing

## Example: Song Upload Queue
```ts
// enqueue
pending_sync.push({
  id: Date.now().toString(),
  action: 'upload_song',
  payload: { songData, audioFileBase64 },
  timestamp: new Date().toISOString(),
  retryCount: 0
})

// process
switch (item.action) {
  case 'upload_song':
    // 1) Rebuild File from base64
    // 2) Upload to storage
    // 3) Insert DB row
    break
}
```

## UI Considerations
- Show a chip/badge with number of queued actions
- Provide a “Retry Now” button
- Provide a “Clear queue” (with confirmation)

## Testing Offline
- Toggle airplane mode
- Use DevTools to simulate offline
- Kill app, relaunch, verify cache restores

## Future Enhancements
- Background downloads of frequently played tracks
- SQLite/IndexedDB for larger caches
- Delta sync with a “lastModified” watermark per table

