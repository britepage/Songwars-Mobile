# 19: iOS Deployment - SongWars Mobile App

## Overview
This guide provides step-by-step instructions for deploying the SongWars mobile app to the iOS App Store, from development builds to production release.

## Prerequisites

### Required Accounts
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect access
- [ ] macOS computer (required for iOS development)

### Required Software
- [ ] Xcode 15.x or later
- [ ] macOS Monterey (12.0) or later
- [ ] CocoaPods (dependency manager)
- [ ] Capacitor CLI

### Verification

```bash
# Check Xcode version
xcodebuild -version
# Should show: Xcode 15.x

# Check CocoaPods
pod --version
# Should show: 1.x.x

# Check Capacitor
npx cap --version
# Should show: 6.x.x
```

## Step 1: App Store Connect Setup

### 1.1 Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers**
4. Click **+** to create new identifier
5. Select **App IDs** and click **Continue**
6. Configure:
   - **Description**: SongWars
   - **Bundle ID**: `com.songwars.mobile` (explicit)
   - **Capabilities**: Enable the following:
     - ✅ Associated Domains
     - ✅ Push Notifications
     - ✅ Sign in with Apple (if using Apple OAuth)
     - ✅ iCloud (for backup)
7. Click **Continue** then **Register**

### 1.2 Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps**
3. Click **+** then **New App**
4. Configure:
   - **Platform**: iOS
   - **Name**: SongWars
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: com.songwars.mobile (select from dropdown)
   - **SKU**: SONGWARS-001
   - **User Access**: Full Access
5. Click **Create**

## Step 2: Xcode Project Configuration

### 2.1 Open Xcode Project

```bash
cd ~/Desktop/Project-Folders/songwars-mobile
npx cap sync ios
npx cap open ios
```

### 2.2 Configure Project Settings

In Xcode, select the project in the navigator:

1. **General Tab**:
   - **Display Name**: SongWars
   - **Bundle Identifier**: com.songwars.mobile
   - **Version**: 1.0.0
   - **Build**: 1
   - **Deployment Target**: iOS 14.0 minimum
   - **Device Orientation**: Portrait only (recommended for mobile)
   - **Status Bar Style**: Light Content

2. **Signing & Capabilities**:
   - **Team**: Select your Apple Developer team
   - **Automatically manage signing**: ✅ Enabled
   - **Provisioning Profile**: Xcode Managed Profile
   - **Signing Certificate**: Apple Development/Distribution

3. **Info Tab**:
   - Add **Privacy - Camera Usage Description**:
     > "SongWars needs camera access to take profile pictures and upload album artwork."
   - Add **Privacy - Microphone Usage Description**:
     > "SongWars needs microphone access to preview your music before uploading."
   - Add **Privacy - Photo Library Usage Description**:
     > "SongWars needs photo library access to select profile pictures and album artwork."
   - Add **Privacy - Photo Library Additions Usage Description**:
     > "SongWars saves profile pictures to your photo library."

### 2.3 Configure App Icons

1. In Xcode, open **Assets.xcassets**
2. Select **AppIcon**
3. Drag and drop icon images for all required sizes:
   - 20x20 (2x, 3x)
   - 29x29 (2x, 3x)
   - 40x40 (2x, 3x)
   - 60x60 (2x, 3x)
   - 76x76 (1x, 2x)
   - 83.5x83.5 (2x) - iPad Pro
   - 1024x1024 (1x) - App Store

**Icon Requirements:**
- PNG format
- No alpha channel
- No rounded corners (iOS adds them)
- Consistent design across all sizes

### 2.4 Configure Launch Screen

1. Open **LaunchScreen.storyboard**
2. Add SongWars logo and branding
3. Keep design simple and fast-loading
4. Use same background color as app

## Step 3: Build Configuration

### 3.1 Update Capacitor Config

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.songwars.mobile',
  appName: 'SongWars',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#000000',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      spinnerColor: '#ffd200',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
```

### 3.2 Build Production Web Assets

```bash
# Build optimized production bundle
npm run build

# Verify build output
ls -la dist/
```

### 3.3 Sync with Xcode

```bash
# Copy web assets to iOS project
npx cap sync ios

# Verify sync
npx cap ls
```

## Step 4: Testing

### 4.1 Test on Simulator

```bash
# Run on iPhone 15 Pro simulator
npx cap run ios --target="iPhone 15 Pro"
```

Test all features:
- [ ] Sign in / Sign up
- [ ] Battle interface
- [ ] Audio playback
- [ ] Song upload
- [ ] Profile management
- [ ] Leaderboard
- [ ] Push notifications

### 4.2 Test on Physical Device

1. Connect iPhone to Mac via USB
2. In Xcode, select your device from the device dropdown
3. Click **Run** (▶️) button
4. App will install and launch on device

**Test on Device:**
- [ ] Camera for profile pictures
- [ ] File system access for audio
- [ ] Network connectivity
- [ ] Background audio playback
- [ ] Push notifications
- [ ] Deep linking
- [ ] Performance (smooth 60fps)

## Step 5: Create Archive

### 5.1 Prepare for Archive

1. In Xcode, select **Product** > **Scheme** > **Edit Scheme**
2. Select **Run** on the left
3. Change **Build Configuration** to **Release**
4. Click **Close**

### 5.2 Create Archive

1. In Xcode, select **Any iOS Device (arm64)** from device dropdown
2. Select **Product** > **Archive**
3. Wait for archive to complete (may take 5-10 minutes)
4. Archive will appear in **Organizer** window

### 5.3 Validate Archive

1. In Organizer, select your archive
2. Click **Validate App**
3. Select distribution method: **App Store Connect**
4. Select distribution options:
   - ✅ Upload app's symbols (for crash reports)
   - ✅ Manage version and build number
5. Select signing certificate: **Automatically manage signing**
6. Click **Validate**
7. Wait for validation to complete

**Fix any validation errors before proceeding**

## Step 6: Upload to App Store Connect

### 6.1 Distribute App

1. In Organizer, select validated archive
2. Click **Distribute App**
3. Select **App Store Connect**
4. Select **Upload**
5. Configure options:
   - ✅ Upload app's symbols
   - ✅ Manage version and build number
   - ✅ Strip Swift symbols
6. Select signing: **Automatically manage signing**
7. Review summary
8. Click **Upload**

Wait 10-30 minutes for processing.

### 6.2 Verify Upload

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **SongWars** app
3. Go to **TestFlight** tab
4. Wait for build to appear (may take 30-60 minutes)
5. Build status will show **Processing** then **Ready to Submit**

## Step 7: TestFlight Beta Testing

### 7.1 Create Beta Testing Group

1. In App Store Connect, go to **TestFlight**
2. Click **Create Group** under Internal Testing
3. Name: "Internal Testers"
4. Add testers:
   - Team members
   - Internal QA
   - Beta testers
5. Enable build for testing

### 7.2 Distribute to Testers

1. Select build
2. Add to test group
3. Testers receive email invitation
4. Testers install TestFlight app
5. Testers install SongWars beta

### 7.3 Collect Feedback

Monitor:
- Crash reports
- Beta feedback
- Analytics
- User reviews

**Fix critical bugs before production release**

## Step 8: App Store Submission

### 8.1 Prepare App Store Listing

1. In App Store Connect, select **SongWars**
2. Click **+ Version or Platform**
3. Select **iOS**
4. Enter version: **1.0.0**

### 8.2 App Information

**App Name:**
```
SongWars - Music Battle Platform
```

**Subtitle:**
```
Discover music through blind battles
```

**Description:**
```
SongWars is the ultimate music battle platform where songs compete in anonymous, head-to-head battles. Vote on your favorites, discover new music, and see your songs rise to the top of the leaderboard!

Features:
• Blind A/B Song Battles
• Weekly Competition System
• Genre-Specific Leaderboards
• Golden Ears Awards for Top Judges
• Upload Your Own Music
• Real-Time Rankings
• Social Music Discovery

How It Works:
1. Choose a genre
2. Listen to two anonymous 30-second clips
3. Vote for your favorite
4. Earn Golden Ears for accuracy
5. Watch your songs climb the ranks

Perfect for:
• Musicians looking for honest feedback
• Music fans discovering new artists
• Judges building their musical credibility
• Anyone who loves music battles!

Join thousands of music lovers in the most exciting way to discover and compete with music.
```

**Keywords:**
```
music, battle, voting, discovery, songs, artists, leaderboard, competition, audio, playlist
```

**Primary Category:** Music  
**Secondary Category:** Entertainment

### 8.3 App Preview and Screenshots

**iPhone Screenshots (Required):**
- 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 px
- 6.5" Display (iPhone 14 Plus): 1284 x 2778 px
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 px

**Screenshot Requirements:**
- Minimum 3 screenshots
- Maximum 10 screenshots
- PNG or JPG format
- RGB color space
- No alpha channels

**Recommended Screenshots:**
1. Battle interface with tape players
2. Genre selection screen
3. Leaderboard view
4. Golden Ears progress
5. Profile with uploaded songs
6. Song upload interface

**App Preview Video (Optional but Recommended):**
- 15-30 seconds
- Show core battle functionality
- Demonstrate voting
- Show leaderboard
- Portrait orientation

### 8.4 Age Rating

**Questionnaire Answers:**
- Unrestricted Web Access: No
- Gambling: No
- Contests: Yes (music voting)
- Made for Kids: No
- Mature/Suggestive Themes: No
- Violence: No
- Medical/Treatment: No

**Rating: 4+**

### 8.5 App Review Information

**Contact Information:**
- First Name: [Your name]
- Last Name: [Your name]
- Phone Number: [Your phone]
- Email: [Your support email]

**Demo Account:**
```
Username: reviewer@songwars.app
Password: ReviewAccount2024!
```

**Notes for Review:**
```
Thank you for reviewing SongWars!

To test the full functionality:
1. Sign in with provided demo account
2. Navigate to Dashboard
3. Select a genre (Rock or Pop recommended)
4. Click "Start Battle"
5. Listen to both songs (30-second clips)
6. Vote for your preferred song
7. View leaderboard to see rankings
8. Check Golden Ears progress

The app requires internet connection for:
- Authentication
- Streaming audio
- Real-time leaderboards
- User-generated content

All music content is uploaded by users and subject to our moderation system. Flagged content is reviewed within 24 hours.

Contact [email] for any questions during review.
```

### 8.6 Version Information

**Version:** 1.0.0  
**Copyright:** © 2025 SongWars

**What's New in This Version:**
```
Welcome to SongWars 1.0!

• Anonymous music battles
• Weekly competition system
• Genre-specific leaderboards
• Golden Ears awards for top judges
• Upload and share your music
• Real-time rankings
• Social discovery features

Start your musical journey today!
```

## Step 9: Submit for Review

### 9.1 Final Checklist

Before submitting:
- [ ] All screenshots uploaded
- [ ] App description complete
- [ ] Keywords optimized
- [ ] Support URL active
- [ ] Privacy policy URL active
- [ ] Demo account working
- [ ] Age rating completed
- [ ] Pricing set (Free)
- [ ] Build selected
- [ ] All required info filled

### 9.2 Submit

1. Review all information
2. Click **Add for Review**
3. Select build
4. Click **Submit for Review**

### 9.3 Review Timeline

- **Initial Review**: 1-3 days
- **In Review**: 24-48 hours
- **Approval**: Immediately after review
- **Rejection**: Resubmit after fixes

## Step 10: Post-Submission

### 10.1 Monitor Review Status

Check App Store Connect daily:
- **Waiting for Review**: In queue
- **In Review**: Being tested
- **Pending Developer Release**: Approved
- **Ready for Sale**: Live on App Store

### 10.2 If Rejected

Common rejection reasons:
1. **Guideline 2.1** - Crashes/bugs
   - Fix bugs and resubmit
2. **Guideline 4.0** - Design issues
   - Improve UI/UX
3. **Guideline 5.1.1** - Privacy policy
   - Update privacy policy URL
4. **Guideline 2.3** - Metadata issues
   - Fix descriptions/screenshots

**Response Process:**
1. Read rejection message carefully
2. Fix all issues mentioned
3. Update build if needed
4. Reply to reviewer
5. Resubmit for review

### 10.3 Release to App Store

Once approved:
1. Click **Release This Version**
2. App appears on App Store within 24 hours
3. Users can download

## Step 11: Post-Launch

### 11.1 Monitor Analytics

Track in App Store Connect:
- Downloads
- Crashes
- User retention
- Ratings and reviews
- Revenue (if applicable)

### 11.2 Respond to Reviews

- Reply to reviews within 24-48 hours
- Thank positive reviews
- Address negative feedback professionally
- Fix reported bugs in updates

### 11.3 Plan Updates

Schedule regular updates:
- Bug fixes every 2-4 weeks
- Feature updates every 1-2 months
- Always test thoroughly before submitting

## Troubleshooting

### Build Fails in Xcode

```bash
# Clean build folder
Product > Clean Build Folder (Cmd+Shift+K)

# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Update pods
cd ios/App
pod deintegrate
pod install
```

### Signing Issues

1. Go to **Preferences** > **Accounts**
2. Select Apple ID
3. Click **Download Manual Profiles**
4. Try archive again

### Upload Fails

- Check bundle ID matches App Store Connect
- Verify version number is higher than previous
- Ensure all required icons are provided
- Check internet connection

## Next Steps

After successful iOS deployment, proceed to:

**[20_ANDROID_DEPLOYMENT.md](20_ANDROID_DEPLOYMENT.md)** - Deploy to Google Play Store

---

**Document Status**: ✅ Complete  
**Next Guide**: [20_ANDROID_DEPLOYMENT.md](20_ANDROID_DEPLOYMENT.md)  
**Estimated Time**: 3-5 days (including review)


