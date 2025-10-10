# Performance Optimization Guide

## Startup Time
- Use route-level code splitting
- Preload critical icons/assets only
- Avoid synchronous heavy work before first paint

## Bundle Size
- Split vendor chunks (`vue`, `@ionic/vue`, `@supabase/supabase-js`)
- Prefer dynamic imports for admin-only pages
- Remove console logs in production (terser)

## Lists & Scrolling
- Use `ion-infinite-scroll` for large lists
- Prefer lightweight list rows (avoid heavy nested components)
- Memoize derived data with computed props

## Audio
- Preload only when needed
- Stop all players on route leave
- Use a memory manager to evict LRU cached tracks
- Limit concurrent decodes (never >2)

## Network
- Cache GETs with `Preferences` plus `lastUpdated`
- Debounce search queries (>=300ms)

## Rendering
- Avoid unnecessary reactivity on large arrays
- Use `key`ed loops and stable component trees

## Build Settings (Vite)
```ts
build: {
  target: 'es2019',
  minify: 'terser',
  terserOptions: {
    compress: { drop_console: true, drop_debugger: true }
  },
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', '@ionic/vue'],
        supabase: ['@supabase/supabase-js']
      }
    }
  }
}
```

## Telemetry (Optional)
- Track time-to-audio-play, battle clip drift, cache hit ratio
- Use a lightweight logger that can be disabled in prod

