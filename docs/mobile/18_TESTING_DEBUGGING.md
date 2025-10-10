# Testing & Debugging Guide

## Device & Simulator
- iOS: Xcode → run on Simulator or device (enable developer mode)
- Android: Android Studio → AVD or USB device with USB debugging

## Live Reload
```bash
npm run dev
npx cap open ios   # or android
# In Xcode/AS, enable live reload with localhost build if desired
```

## Logs & Inspectors
- iOS: Xcode console, `Console.app`
- Android: Logcat
- WebView Inspector: Safari (iOS) / Chrome (Android) remote debugging

## Unit Testing (Vitest)
```bash
npm i -D vitest @vue/test-utils jsdom
npm run test
```

## E2E (Playwright)
```bash
npm i -D @playwright/test
npx playwright test
```

## Network & Auth Debug
- Add an “Auth Debug” page gated to dev builds (show session, user, RLS claims)
- Toggle test mode and stubbed data via `.env`

## Audio Debugging
- Log start/stop events, timeouts, clip boundaries
- Add a visual progress bar for each playing song

## Push Notifications
- iOS: Use Xcode push simulator (requires APNS certs)
- Android: Use FCM console test messages

## Common Checks
- Back button behavior on Android matches expectations
- Deep link routes from OAuth callbacks open correct tabs
- Offline queue persists across app restarts
- Large lists remain 60fps when scrolling
- Audio never overlaps incorrectly on battle transitions

## CI Suggestions
- Build iOS/Android in CI to catch gradle/cocoapods drift
- Run unit tests and lint on PRs

