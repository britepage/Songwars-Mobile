# SongWars Mobile

An Ionic Vue 3 mobile application for the SongWars music battle platform.

## 🚀 Project Setup Complete

The SongWars mobile app has been successfully initialized with:

### ✅ Core Framework
- **Ionic Framework 8.x** - Hybrid mobile framework
- **Capacitor 7.x** - Native runtime for web apps
- **Vue 3.5.x** - Progressive JavaScript framework with TypeScript
- **Vite** - Fast build tool and dev server

### ✅ Backend & State Management
- **Supabase 2.50.x** - Backend-as-a-Service (same as web app)
- **Pinia 3.x** - Modern state management

### ✅ Mobile Features
- **Capacitor Plugins**: Camera, Filesystem, Storage, Push Notifications, Local Notifications, Status Bar, Splash Screen
- **Audio Libraries**: WaveSurfer.js for audio visualization
- **Utilities**: canvas-confetti, uuid, ionicons

### ✅ Native Platforms
- **iOS** - Xcode project initialized
- **Android** - Android Studio project initialized

### ✅ Configuration
- TypeScript with strict mode and path aliases
- Vite configured with Ionic optimizations
- Capacitor configured with splash screen and status bar
- Environment variables setup (.env)
- Project folder structure created

## 📁 Project Structure

```
src/
├── assets/          # Images, sounds, styles
├── components/      # Vue components (organized by feature)
│   ├── core/
│   ├── dashboard/
│   ├── admin/
│   ├── auth/
│   ├── goldenEars/
│   └── utility/
├── composables/     # Reusable composition functions
├── guards/          # Route guards
├── router/          # Vue Router configuration
├── services/        # Service layers (Supabase, etc.)
├── stores/          # Pinia stores
├── theme/           # Ionic theming
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── views/           # Page-level components
│   ├── auth/
│   ├── main/
│   └── admin/
├── App.vue          # Root component
└── main.ts          # App entry point
```

## 🛠️ Development

### Start Development Server
```bash
npm run dev
```
The app will be available at http://localhost:5173

### Build for Production
```bash
npm run build
```

### Sync with Native Platforms
```bash
npx cap sync
```

### Open in Native IDEs
```bash
# iOS (macOS only)
npx cap open ios

# Android
npx cap open android
```

### Run on Devices
```bash
# iOS
npx cap run ios

# Android
npx cap run android
```

## 📱 Platform Status

- ✅ **Web**: Development server running on port 5173
- ✅ **Android**: Platform initialized and synced
- ⚠️ **iOS**: Platform initialized (CocoaPods installation pending - requires UTF-8 encoding setup)

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:
- **Web App Docs**: Complete technical documentation from the web version
- **Easy Docs**: Stakeholder-friendly documentation
- **Mobile Docs**: Step-by-step mobile conversion guide

## 🔧 Environment Variables

Copy `.env.example` to `.env` and update with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Next Steps

1. **Review Documentation**: Familiarize yourself with the mobile conversion plan in `docs/mobile/`
2. **Set up Supabase Service**: Implement the Supabase integration for mobile (09_SUPABASE_INTEGRATION.md)
3. **Convert Components**: Begin converting the 21 components to Ionic (05_COMPONENTS_CONVERSION.md)
4. **Convert Pages**: Adapt the 12 pages for mobile UI (06_PAGES_CONVERSION.md)
5. **Add Native Features**: Implement camera, notifications, and offline support

## 🎯 Feature Parity Goal

The mobile app will include all features from the web version:
- Music battle system with 30-second clips
- Golden Ears award system
- Churn system (4-week competition)
- User profiles and authentication
- Song uploading and management
- Leaderboards and rankings
- Content moderation and flagging
- Tagged songs (favorites)

## 🤝 Contributing

This is a conversion of the SongWars web application to mobile. Refer to the web app repository for the original codebase and backend setup.

---

**Status**: Initial Setup Complete ✅  
**Version**: 1.0.0  
**Last Updated**: October 2025
