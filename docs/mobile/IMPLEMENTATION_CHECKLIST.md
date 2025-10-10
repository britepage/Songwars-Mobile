# Mobile App Implementation Checklist

## Overview
This checklist provides numbered, sequential steps for implementing the SongWars mobile app with exact parity to the web app. Follow this in order.

---

## Phase 1: Critical Corrections

### 1. Fix Social Links References

**Files to Update**:
- `docs/mobile/05_COMPONENTS_CONVERSION.md` (lines 1037-1113)
- `docs/mobile/06_PAGES_CONVERSION.md` (lines 344-430)
- `docs/mobile/07_STATE_MANAGEMENT.md` (lines 809-818)

**Action**: Replace all references to `user_social_links` table with `profile.social_links` (JSONB array)

**Incorrect Pattern**:
```typescript
// DON'T USE - Table doesn't exist
const { data } = await supabase
  .from('user_social_links')
  .select('*')
```

**Correct Pattern**:
```typescript
// Correct - Read from profiles table
const socialLinks = computed(() => profileStore.profile?.social_links || [])
```

### 2. Copy Utility Files

**Action**: Copy `utils/socialPlatforms.ts` from web app to mobile project **without modifications**

```bash
cp utils/socialPlatforms.ts mobile-app/src/utils/socialPlatforms.ts
```

**Verify**: File contains 14 platform configurations and 6 exported functions

### 3. Verify RPC Function Names

**Action**: Ensure all RPC calls use canonical production names

**Correct Names**:
- `record_comparison_vote` (NOT `record_battle_vote`)
- `get_leaderboard_by_genre_and_week` (NOT `get_weekly_leaderboard`)
- `restore_song` (NOT `restore_song_from_trash`)
- `soft_delete_song`

---

## Phase 2: Style Implementation

### 4. Create Theme Variables File

**File**: `src/theme/variables.css`

**Action**: Copy entire CSS variable system from `COMPLETE_STYLE_GUIDE.md`

**Includes**:
- 19 CSS variables for light theme
- 19 CSS variables for dark theme
- Ionic color mappings
- Background, text, border colors

**Test**: Toggle between light/dark themes

### 5. Create Retro Button Styles

**File**: `src/theme/bigbutton.css`

**Action**: Copy exact bigbutton CSS from `COMPLETE_STYLE_GUIDE.md`

**Includes**:
- Base `.bigbutton` class
- `.bigbutton-small` (8px/16px padding, 0.875em font)
- `.bigbutton-medium` (12px/24px padding, 1.125em font)
- `.bigbutton-large` (20px/45px padding, 1.5em font)
- Hover states with shadow animations

**Test**: All 3 button sizes render with yellow background, black border, and shadow effect

### 6. Create Animations File

**File**: `src/theme/animations.css`

**Action**: Copy all keyframe animations from `COMPLETE_STYLE_GUIDE.md`

**Includes**:
- `@keyframes slideInUp`
- `@keyframes float`
- `@keyframes pulse-glow`
- `@keyframes spin`
- `@keyframes gradient-shift`

**Test**: Animations play smoothly at 60fps

### 7. Import All Theme Files

**File**: `src/main.ts` or `src/App.vue`

**Action**: Import all theme CSS files

```typescript
import './theme/variables.css'
import './theme/bigbutton.css'
import './theme/animations.css'
```

---

## Phase 3: Component Conversion

### 8. Convert Core Components (Priority Order)

**Order of Conversion**:
1. ✅ FooterNavigation
2. ✅ TapePlayer
3. ✅ BattleAnimation
4. ✅ WaveformSelectorDual
5. ✅ SocialLinksManager
6. ✅ SocialLinksDisplay
7. ✅ ConversionCTA
8. ✅ TrialCounter

**For Each Component, Verify**:
- [ ] Colors match (`#ffd200`, `#8b5cf6`, `#7c3aed`)
- [ ] Spacing matches (padding, margins, gaps)
- [ ] Typography matches (font sizes, font-family)
- [ ] Animations match (keyframes, durations, easings)
- [ ] Theme switching works (light/dark mode)
- [ ] Mobile gestures work (swipes, taps, long-press)
- [ ] Touch targets >= 44px
- [ ] Component renders on iOS simulator
- [ ] Component renders on Android emulator

### 9. Convert Dashboard Components

**Components**:
- `dashboard/songUploader.vue`
- `dashboard/songList.vue`

**Verify**:
- [ ] File upload uses native file picker
- [ ] Progress indicators work
- [ ] Song list scrolls smoothly
- [ ] Pull-to-refresh works

### 10. Convert Admin Components

**Components**:
- `admin/AdminDashboard.vue`
- `admin/AdminSongManager.vue`

**Verify**:
- [ ] Admin routes protected by middleware
- [ ] All admin functions work (approve, reject, delete)

### 11. Convert Authentication Components

**Components**:
- `signIn/SignInForm.vue`
- `registration/RegistrationForm.vue`
- `resetPassword/ResetPasswordForm.vue`
- `resetPasswordEmail/ResetPasswordEmailForm.vue`

**Verify**:
- [ ] OAuth deep linking configured
- [ ] Email/password auth works
- [ ] Password reset emails send
- [ ] Form validation matches web app

### 12. Convert Golden Ears Components

**Components**:
- `goldenEars/GoldenEarsProgress.vue`
- `goldenEars/GoldenEarsHistory.vue`

**Verify**:
- [ ] Progress animations smooth
- [ ] History loads correctly
- [ ] Badges display properly

### 13. Convert Utility Components

**Components**:
- `HamburgerMenu.vue`
- `AuthDebug.vue`
- `AccountDeletionModal.vue`

**Verify**:
- [ ] Menu slides in/out smoothly
- [ ] Debug panel toggleable (Ctrl+D)
- [ ] Modal backdrop blur works

---

## Phase 4: Page Conversion

### 14. Convert Public Pages

**Pages** (in order):
1. `index.vue` (landing page)
2. `preview.vue` (trial page - NOT shareable by ID)
3. `sign-in.vue`
4. `registration.vue`

**Verify Each Page**:
- [ ] Layout matches web app
- [ ] All links work
- [ ] Forms validate correctly
- [ ] CTA buttons styled correctly
- [ ] Theme toggle works

### 15. Convert Authenticated Pages

**Pages** (in order):
1. `dashboard.vue` (battle + upload sections)
2. `leaderboard.vue`
3. `my-songs.vue`
4. `account.vue`
5. `user/[username].vue` (public profile)

**Verify Each Page**:
- [ ] Requires authentication
- [ ] Navigation works
- [ ] Data loads from Supabase
- [ ] All interactions work
- [ ] Responsive on all screen sizes

### 16. Convert Admin Page

**Page**: `admin/index.vue`

**Verify**:
- [ ] Requires admin role
- [ ] All admin functions work
- [ ] Song management works
- [ ] User moderation works

### 17. Convert Password Reset Pages

**Pages**:
- `reset-password.vue`
- `reset-password-email.vue`

**Verify**:
- [ ] Email sends correctly
- [ ] Deep links work
- [ ] Password updates successfully

---

## Phase 5: State Management

### 18. Convert Auth Store

**File**: `stores/authStore.ts`

**Verify**:
- [ ] Supabase client configured
- [ ] Session persistence works
- [ ] Sign in/out works
- [ ] OAuth providers work
- [ ] Deep link handling works

### 19. Convert Profile Store

**File**: `stores/profileStore.ts`

**Critical**: Social links as computed property

```typescript
const socialLinks = computed(() => profile.value?.social_links || [])
```

**Verify**:
- [ ] Profile fetch works
- [ ] Profile update works
- [ ] Avatar upload (native camera)
- [ ] Social links CRUD works
- [ ] NO queries to `user_social_links` table

### 20. Convert Song Store

**File**: `stores/songStore.ts`

**Verify**:
- [ ] Song upload works
- [ ] Song fetch works
- [ ] Song delete works
- [ ] Storage integration works

### 21. Convert Comparison Store

**File**: `stores/songComparisonStore.ts`

**Verify**:
- [ ] Battle initialization works
- [ ] Vote recording uses `record_comparison_vote`
- [ ] Genre selection works
- [ ] Audio playback works

### 22. Convert Leaderboard Store

**File**: `stores/leaderboardStore.ts`

**Verify**:
- [ ] Uses `get_leaderboard_by_genre_and_week` RPC
- [ ] Filters work (genre, week)
- [ ] Sorting works
- [ ] Infinite scroll works

### 23. Convert Golden Ears Store

**File**: `stores/goldenEarsStore.ts`

**Verify**:
- [ ] Progress tracking works
- [ ] Level calculations correct
- [ ] Badge awards work
- [ ] History loads correctly

### 24. Convert Upload Store

**File**: `stores/uploadStore.ts`

**Verify**:
- [ ] Native file picker works
- [ ] Upload progress tracking works
- [ ] File validation works
- [ ] Error handling works

### 25. Convert Theme Store

**File**: `stores/themeStore.ts`

**Verify**:
- [ ] Theme toggle works
- [ ] Preference saved to Capacitor Storage
- [ ] System preference detection works
- [ ] All pages respect theme

---

## Phase 6: Native Features

### 26. Implement Native Audio

**Reference**: `docs/mobile/11_AUDIO_SYSTEM.md`

**Verify**:
- [ ] 30-second clips play correctly
- [ ] Background playback works
- [ ] Audio controls work
- [ ] Cassette gear animations sync with audio

### 27. Implement Camera Access

**Reference**: `docs/mobile/12_NATIVE_FEATURES.md`

**Verify**:
- [ ] Camera permission requested
- [ ] Photo capture works
- [ ] Gallery selection works
- [ ] Image upload to Supabase works

### 28. Implement File System

**Verify**:
- [ ] File picker works
- [ ] Audio file validation works
- [ ] File size limits enforced

### 29. Implement Biometric Auth (Optional)

**Verify**:
- [ ] Face ID/Touch ID prompt works
- [ ] Fallback to password works
- [ ] Biometric login saves token

### 30. Implement Haptic Feedback

**Verify**:
- [ ] Button taps have haptic feedback
- [ ] Vote submissions have haptic feedback
- [ ] Success/error states have distinct haptics

---

## Phase 7: Testing

### 31. Visual Parity Testing

**Action**: Side-by-side screenshot comparison

**Test Each Screen**:
- [ ] Colors match exactly
- [ ] Spacing matches exactly
- [ ] Typography matches exactly
- [ ] Animations match exactly
- [ ] Dark mode matches exactly

**Tools**: Use screenshot comparison tools or manual review

### 32. Functional Parity Testing

**Reference**: `PARITY_GATE.md`

**Test All Features**:
- [ ] All web features work on mobile
- [ ] No extra features added
- [ ] No public song sharing routes
- [ ] No `/preview/:songId` route
- [ ] All RPCs use correct names
- [ ] Social links work correctly

### 33. Performance Testing

**Verify**:
- [ ] App launches < 3 seconds
- [ ] 60fps animations throughout
- [ ] Audio playback no lag
- [ ] Smooth scrolling everywhere
- [ ] No memory leaks

### 34. Platform-Specific Testing

**iOS**:
- [ ] Safe area insets correct
- [ ] Swipe back navigation works
- [ ] iOS design patterns followed
- [ ] TestFlight build works

**Android**:
- [ ] Back button behavior correct
- [ ] Material Design followed
- [ ] Runtime permissions work
- [ ] Play Store build works

### 35. Database Testing

**Critical**: Verify no schema changes

**Test**:
- [ ] Mobile app reads from production database
- [ ] No new tables created
- [ ] No schema modifications
- [ ] All queries use existing structure
- [ ] Social links use `profiles.social_links` JSONB

---

## Phase 8: Deployment

### 36. iOS Build Configuration

**Reference**: `docs/mobile/19_IOS_DEPLOYMENT.md`

**Complete**:
- [ ] Bundle ID configured
- [ ] Certificates installed
- [ ] Provisioning profiles set up
- [ ] App icons added (all sizes)
- [ ] Launch screens configured
- [ ] Info.plist permissions set

### 37. Android Build Configuration

**Reference**: `docs/mobile/20_ANDROID_DEPLOYMENT.md`

**Complete**:
- [ ] Package name configured
- [ ] Keystore created
- [ ] App icons added (all densities)
- [ ] Splash screens configured
- [ ] AndroidManifest.xml permissions set

### 38. Create Production Builds

**iOS**:
```bash
ionic build --prod
npx cap sync ios
npx cap open ios
# Archive in Xcode
```

**Android**:
```bash
ionic build --prod
npx cap sync android
npx cap open android
# Build signed APK/AAB in Android Studio
```

### 39. Update Environment Variables

**Action**: Switch from branch to production Supabase

**Update** `.env.production`:
```
VITE_SUPABASE_URL=https://[your-prod-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[your-prod-anon-key]
```

**Test**: Verify mobile app connects to production database

### 40. Final QA Pass

**Complete Checklist**:
- [ ] All features work on production database
- [ ] No references to branch/test database
- [ ] All environment variables correct
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All images load
- [ ] All links work
- [ ] Auth flow complete
- [ ] Payment/subscription works (if applicable)

---

## Success Criteria

### Functional Parity ✅
- [ ] Every web feature works on mobile
- [ ] No additional features added
- [ ] No public song sharing
- [ ] Same user experience

### Visual Parity ✅
- [ ] Colors identical (`#ffd200`, `#8b5cf6`)
- [ ] Spacing identical
- [ ] Typography identical (Inter font)
- [ ] Animations identical
- [ ] Theme switching identical

### Performance ✅
- [ ] App launch < 3 seconds
- [ ] 60fps animations
- [ ] Audio playback smooth
- [ ] No crashes
- [ ] Battery efficient

### Database Parity ✅
- [ ] No schema changes
- [ ] No new tables
- [ ] Works with production database
- [ ] Social links use JSONB field

---

## Common Issues & Solutions

### Issue: Social links not loading
**Solution**: Check using `profile.social_links`, not separate table query

### Issue: Retro buttons not styled correctly
**Solution**: Verify `bigbutton.css` imported and classes applied correctly

### Issue: Theme not switching
**Solution**: Check CSS variables defined in `variables.css`

### Issue: RPC functions failing
**Solution**: Verify using canonical function names (see step 3)

### Issue: Audio not playing
**Solution**: Check native audio plugin installed and configured

### Issue: Deep links not working
**Solution**: Verify URL schemes configured in `capacitor.config.ts`

---

## Final Steps

### 41. Submit to App Stores

**iOS**: Upload to App Store Connect via Xcode  
**Android**: Upload AAB to Google Play Console

### 42. Monitor Initial Release

**Track**:
- Crash reports
- User feedback
- Performance metrics
- API errors

### 43. Document Any Differences

**If ANY deviations from web app**:
- Document why
- Get user approval
- Update parity checklist

---

**Total Steps**: 43  
**Estimated Time**: 19-30 days  
**Required**: Strict adherence to web app patterns

