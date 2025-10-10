# Troubleshooting Guide (Mobile)

## OAuth callback doesn’t return to app
- Verify `VITE_OAUTH_CALLBACK` (e.g., `songwars://auth/callback`)
- iOS: URL Type and Associated Domains configured
- Android: Intent filter present and matches scheme/host/path

## Audio doesn’t play or stops early
- Ensure storage URLs are valid and public
- Check egress limits on Supabase project (common failure)
- Confirm `autoStopAfter` is set to 30000 for clips
- Always stop previous players before starting new audio

## Performance stutters during battle
- Avoid re-rendering the entire page on progress updates
- Use lightweight progress UI; throttle progress to 100ms updates
- Preload assets (wheel, arrow) on view enter

## Push notifications not received
- iOS: App capability enabled; APNS keys
- Android: Valid `google-services.json`
- Permission granted at runtime
- Token saved (if your backend supports storing device tokens)

## Offline queue never flushes
- Confirm `Network` listener fires (test with airplane mode)
- Check pending items in `pending_sync` storage key
- Ensure exponential backoff doesn’t exceed app session time

## Biometric login fails
- Confirm device supports biometry
- Ensure credentials are stored only after a successful login
- Allow fallback to email/password

## Build errors (iOS)
- Run `pod install` in `ios/App`
- Clean build folder in Xcode
- Ensure minimum iOS version is supported by plugins

## Build errors (Android)
- Sync Gradle, check JDK 11+
- Match `compileSdkVersion` and plugin versions

## Deep link opens wrong route
- Log incoming URL in `appUrlOpen`
- Normalize and route explicitly (`router.replace`)

## Still stuck?
- Temporarily enable verbose logs in audio/auth services
- Test in web (Capacitor web) to isolate plugin issues
- File a minimal repro using only Supabase auth + one page
