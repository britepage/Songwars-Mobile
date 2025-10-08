# 20: Android Deployment - SongWars Mobile App

## Overview
This guide provides comprehensive step-by-step instructions for deploying the SongWars mobile app to the Google Play Store.

## Prerequisites

### Required Accounts
- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] Google Play Console access
- [ ] Google Cloud project (for Play Store API)

### Required Software
- [ ] Android Studio (latest stable)
- [ ] JDK 11 or higher
- [ ] Android SDK (API 24+)
- [ ] Capacitor CLI

### Verification

```bash
# Check Android Studio
android-studio --version

# Check Java version
java -version
# Should show: version 11 or higher

# Check Android SDK
$ANDROID_HOME/tools/bin/sdkmanager --list

# Check Capacitor
npx cap --version
# Should show: 6.x.x
```

## Step 1: Google Play Console Setup

### 1.1 Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Accept terms and conditions
4. Pay $25 one-time registration fee
5. Complete account details

### 1.2 Create New App

1. In Play Console, click **Create app**
2. Configure:
   - **App name**: SongWars
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations:
   - ✅ App complies with Google Play policies
   - ✅ App complies with US export laws
4. Click **Create app**

## Step 2: Android Studio Configuration

### 2.1 Open Android Project

```bash
cd ~/Desktop/Project-Folders/songwars-mobile
npm run build
npx cap sync android
npx cap open android
```

### 2.2 Configure `build.gradle` (App Level)

Edit `android/app/build.gradle`:

```gradle
android {
    namespace "com.songwars.mobile"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.songwars.mobile"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    buildTypes {
        debug {
            minifyEnabled false
        }
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'
```

### 2.3 Configure `AndroidManifest.xml`

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.songwars.mobile">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="29" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Hardware features (optional) -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:requestLegacyExternalStorage="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" 
                      android:host="songwars.app" />
            </intent-filter>
        </activity>

        <!-- File Provider -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

### 2.4 Create App Icons

Generate icons for all densities:
- `mipmap-mdpi`: 48x48 px
- `mipmap-hdpi`: 72x72 px
- `mipmap-xhdpi`: 96x96 px
- `mipmap-xxhdpi`: 144x144 px
- `mipmap-xxxhdpi`: 192x192 px

Place in: `android/app/src/main/res/`

**Use icon generator:**
```bash
# Using Android Asset Studio
# https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
```

### 2.5 Configure Splash Screen

Edit `android/app/src/main/res/values/styles.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- App Theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:background">@drawable/splash</item>
        <item name="android:statusBarColor">@color/colorPrimaryDark</item>
    </style>
</resources>
```

Create `android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#000000</color>
    <color name="colorPrimaryDark">#000000</color>
    <color name="colorAccent">#FFD200</color>
    <color name="colorWhite">#FFFFFF</color>
</resources>
```

## Step 3: Code Signing

### 3.1 Generate Keystore

```bash
cd android/app

# Generate release keystore
keytool -genkey -v -keystore songwars-release.keystore \
  -alias songwars-mobile \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Answer prompts:
# Password: [Choose strong password]
# First and Last Name: SongWars
# Organizational Unit: Mobile
# Organization: SongWars
# City: [Your city]
# State: [Your state]
# Country Code: US
```

**IMPORTANT**: Store password and keystore securely! You cannot update app without it.

### 3.2 Configure Signing

Create `android/key.properties`:

```properties
storePassword=[YOUR_STORE_PASSWORD]
keyPassword=[YOUR_KEY_PASSWORD]
keyAlias=songwars-mobile
storeFile=songwars-release.keystore
```

**Add to `.gitignore`:**
```bash
echo "android/key.properties" >> .gitignore
echo "android/app/*.keystore" >> .gitignore
```

### 3.3 Update `build.gradle` for Signing

Edit `android/app/build.gradle`:

```gradle
// Load keystore properties
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Step 4: Build Release APK/AAB

### 4.1 Build Web Assets

```bash
cd ~/Desktop/Project-Folders/songwars-mobile
npm run build
npx cap sync android
```

### 4.2 Build AAB (Android App Bundle)

```bash
cd android

# Build release AAB
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 4.3 Build APK (Alternative)

```bash
# Build release APK
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### 4.4 Verify Build

```bash
# Check AAB info
bundletool build-apks \
  --bundle=app/build/outputs/bundle/release/app-release.aab \
  --output=app-release.apks

# Install on connected device
bundletool install-apks --apks=app-release.apks
```

## Step 5: Play Console Setup

### 5.1 App Content

**1. Privacy Policy**

1. Go to **Policy** > **App content**
2. Click **Privacy policy**
3. Enter URL: `https://songwars.app/privacy-policy`
4. Click **Save**

**2. App Access**

1. Click **App access**
2. Select: "All functionality is available without restrictions"
   - OR provide demo account if needed:
   ```
   Username: reviewer@songwars.app
   Password: ReviewAccount2024!
   ```
3. Click **Save**

**3. Ads**

1. Click **Ads**
2. Select: "No, my app does not contain ads"
3. Click **Save**

**4. Content Rating**

1. Click **Content rating**
2. Click **Start questionnaire**
3. Fill out questionnaire:
   - Category: Music & Audio
   - Does your app contain user-generated content? Yes
   - Is content moderated? Yes
   - Can users interact? Yes
4. Complete rating
5. Apply ratings to countries

**5. Target Audience**

1. Click **Target audience and content**
2. Select age groups: 13 and over
3. Click **Save**

**6. News App**

1. Click **News**
2. Select: "No, my app is not a news app"
3. Click **Save**

**7. COVID-19 Contact Tracing**

1. Click **COVID-19 contact tracing and status apps**
2. Select: "No"
3. Click **Save**

**8. Data Safety**

1. Click **Data safety**
2. Select data collection practices:
   - Personal Info: Email, Username
   - Photos and videos: Upload feature
   - Audio files: Upload feature
3. Explain data usage:
   ```
   User account creation and authentication
   Profile customization
   Music upload and sharing
   ```
4. Data security:
   - ✅ Data encrypted in transit
   - ✅ Data encrypted at rest
   - ✅ Users can request data deletion
5. Click **Save**

### 5.2 Store Listing

**1. App Details**

- **App name**: SongWars
- **Short description** (80 chars max):
  ```
  Music battle platform - Vote on songs, climb the leaderboard!
  ```
- **Full description** (4000 chars max):
  ```
  SongWars is the ultimate music battle platform where songs compete in anonymous, head-to-head battles. Vote on your favorites, discover new music, and see your songs rise to the top of the leaderboard!

  🎵 KEY FEATURES
  • Blind A/B Song Battles - Compare two songs without bias
  • Weekly Competition System - Fresh battles every week
  • Genre-Specific Leaderboards - Rock, Pop, Hip Hop, and more
  • Golden Ears Awards - Earn recognition for judging accuracy
  • Upload Your Music - Share your creations with the community
  • Real-Time Rankings - Watch songs climb the charts
  • Social Discovery - Find your next favorite artist

  ⚔️ HOW IT WORKS
  1. Choose your favorite music genre
  2. Listen to two anonymous 30-second clips
  3. Vote for the song you prefer
  4. Earn Golden Ears for accurate predictions
  5. Upload your own music to compete
  6. Watch your songs climb the weekly rankings

  🏆 COMPETITION SYSTEM
  Songs compete in a 4-week cycle with weekly rankings and a Hall of Fame for champions. The Wilson Score algorithm ensures fair ranking based on both popularity and vote count.

  🎯 PERFECT FOR
  • Musicians seeking honest feedback
  • Music enthusiasts discovering new artists
  • Judges building musical credibility
  • Anyone who loves competitive music discovery

  🌟 GOLDEN EARS AWARDS
  Prove your musical taste! Vote on 20+ battles weekly and maintain high accuracy to earn prestigious Golden Ears awards.

  📊 LEADERBOARDS
  Track your favorite songs and artists:
  • Weekly top performers by genre
  • Hall of Fame for all-time greats
  • Personal statistics and achievements
  • Genre-specific rankings

  🎤 FOR ARTISTS
  • Upload your best 30-second clips
  • Compete anonymously on merit
  • Get discovered by music lovers
  • Track your songs' performance
  • Build your fanbase organically

  Join thousands of music lovers in the most exciting way to discover and compete with music. Download SongWars now and start your musical journey!

  Follow us:
  Instagram: @songwarsapp
  Twitter: @songwarsapp
  Website: https://songwars.app
  ```

**2. Graphics**

**App Icon** (512 x 512 px):
- PNG format
- 32-bit PNG with alpha
- No rounded corners

**Feature Graphic** (1024 x 500 px):
- Showcase app name and key feature
- No text smaller than 40px

**Phone Screenshots** (Minimum 2, Maximum 8):
- Resolution: 1080 x 1920 px minimum
- PNG or JPG
- Recommended: 5-7 screenshots

Screenshot ideas:
1. Battle interface with tape players
2. Genre selection screen
3. Leaderboard view
4. Golden Ears progress
5. Profile with uploaded songs
6. Song upload interface
7. Hall of Fame

**7-inch Tablet Screenshots** (Optional):
- Resolution: 1200 x 1920 px minimum

**10-inch Tablet Screenshots** (Optional):
- Resolution: 1600 x 2560 px minimum

**Video** (Optional but recommended):
- YouTube URL
- 30 seconds to 2 minutes
- Show core functionality

**3. Categorization**

- **App category**: Music & Audio
- **Tags**: music, battle, voting, discovery, competition

**4. Contact Details**

- **Email**: support@songwars.app
- **Phone**: [Optional]
- **Website**: https://songwars.app

**5. External Marketing (Optional)**

- **Promo video**: [YouTube URL]
- **Marketing opt-out**: No

## Step 6: Release Management

### 6.1 Create Production Release

1. Go to **Production** > **Releases**
2. Click **Create new release**
3. Upload AAB: **app-release.aab**
4. Enter release name: **1.0.0**
5. Add release notes:
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
6. Click **Save**

### 6.2 Countries and Regions

1. Select **Countries/regions**
2. Choose: **All countries** or specific regions
3. Click **Save**

### 6.3 Review and Rollout

1. Review all settings
2. Click **Review release**
3. Fix any warnings or errors
4. Click **Start rollout to Production**

## Step 7: Review Process

### 7.1 Timeline

- **Initial Review**: 1-7 days
- **Typical**: 2-3 days
- **Complex Apps**: Up to 7 days

### 7.2 Review Status

Monitor in Play Console:
- **Draft**: Not yet submitted
- **In review**: Being tested by Google
- **Approved**: Ready to publish
- **Rejected**: Needs fixes

### 7.3 Common Rejection Reasons

1. **Policy Violation**
   - Fix content that violates policies
   - Update description/screenshots

2. **Technical Issues**
   - Fix crashes
   - Improve performance
   - Test on various devices

3. **Metadata Issues**
   - Update screenshots
   - Fix description
   - Correct categorization

**Response:**
1. Fix all issues
2. Upload new AAB
3. Reply to review team
4. Resubmit

## Step 8: Post-Launch

### 8.1 Monitor Analytics

Track in Play Console:
- Installs and uninstalls
- Crashes and ANRs
- User ratings and reviews
- User acquisition
- Retention metrics

### 8.2 Respond to Reviews

- Reply within 24-48 hours
- Thank positive reviews
- Address concerns professionally
- Fix reported bugs

### 8.3 Regular Updates

Schedule updates:
- Bug fixes: Every 2-4 weeks
- Features: Every 1-2 months
- Security patches: As needed

## Troubleshooting

### Build Fails

```bash
# Clean project
cd android
./gradlew clean

# Invalidate caches (Android Studio)
File > Invalidate Caches / Restart

# Delete build folder
rm -rf app/build
./gradlew build
```

### Signing Issues

```bash
# Verify keystore
keytool -list -v -keystore android/app/songwars-release.keystore

# Check key.properties path
cat android/key.properties
```

### Upload Fails

- Verify version code is higher than previous
- Check AAB size (max 150MB)
- Ensure proper signing
- Verify package name matches

## Next Steps

Congratulations! Your app is now on Google Play Store.

For ongoing maintenance, see:
**[21_PERFORMANCE_OPTIMIZATION.md](21_PERFORMANCE_OPTIMIZATION.md)** - Optimize mobile performance

---

**Document Status**: ✅ Complete  
**Next Guide**: [21_PERFORMANCE_OPTIMIZATION.md](21_PERFORMANCE_OPTIMIZATION.md)  
**Estimated Time**: 2-4 days (including review)

