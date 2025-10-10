# Push Notifications Guide

## Overview
Implement push notifications with Capacitor for both local and remote use-cases. This document complements `12_NATIVE_FEATURES.md` and the `useNotifications` composable.

## Requirements
- iOS APNS keys configured in Apple Developer Portal
- Android Firebase FCM project and `google-services.json`

## Installation
```bash
npm i @capacitor/push-notifications @capacitor/local-notifications
```

## iOS Setup
- In Xcode, enable Push Notifications capability
- Upload APNS key to your server if sending remote pushes

## Android Setup
- Add `google-services.json` to `android/app/`
- Apply Google services plugin in `android/build.gradle`

## App Code

Initialize at app start:
```ts
// src/main.ts (excerpt)
import { useNotifications } from '@/composables/useNotifications'

const notifications = useNotifications()
await notifications.initialize()
```

Register handlers:
```ts
notifications.registerHandler('battle', (data) => router.push('/tabs/dashboard'))
notifications.registerHandler('golden_ears', () => router.push('/tabs/account'))
```

Send local tests:
```ts
await notifications.sendNotification({
  title: 'Battle Ready',
  body: 'New battle is waiting for you!',
  data: { type: 'battle' }
})
```

## Server-Side Tokens (optional)
If your backend stores device tokens, save them to a server-side table (for example, `user_push_tokens`). This table is not required by the mobile app and is only needed if your backend will send remote pushes.

## Best Practices
- Ask permission contextually (after onboarding)
- Respect platform notification settings
- Use concise titles, actionable bodies
- Deep-link users to the right screen
