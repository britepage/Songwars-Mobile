# Mobile UX Patterns

## Navigation
- Bottom tabs for primary areas; stack navigation inside each tab
- Back gesture on iOS; hardware back button on Android returns within tab stack

## Gestures
- Swipe to reveal actions in lists (edit/delete)
- Pull to refresh on data-heavy views

## Battle Flow
1. Genre picker as action sheet
2. Start battle → play dual 30s clips
3. Transition to “Vote” with two large buttons
4. Provide haptic on start, pause, vote

## Upload Flow
- FAB on My Songs page
- Modal for upload form (title, genre, clip selector)
- Show progress and allow backgrounding

## Account & Settings
- Use lists with toggles for theme, notifications, biometric
- Avatar change via action sheet (camera, gallery)

## Empty States
- Encourage action: “No songs yet — Upload your first track”
- Provide direct CTA buttons

## Loading & Errors
- Use skeletons for song lists
- Consolidated toast system for transient messages
- Retry button on network errors

## Touch Targets & Layout
- Minimum 44x44 tap areas
- Use larger spacing on primary actions
- Keep critical controls bottom-reachable

## Accessibility
- VoiceOver/ TalkBack labels on icon-only buttons
- Respect Dynamic Type where feasible

## Performance
- Lazy load long lists (infinite scroll)
- Defer heavy computations until idle

## Copy Text Styles
- Headings: `text-xl font-bold`
- Subhead: `text-base text-ion-color-medium`
- Body: `text-base leading-relaxed`

