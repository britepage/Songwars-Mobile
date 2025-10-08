# SongWars Frontend Pages

## Overview
This document provides comprehensive documentation of all pages in the SongWars frontend application, detailing their functionality, components, and user interactions.

**Total Pages: 12** (Updated January 2025)

## Page Structure

### 1. Index/Entry Page (`pages/index.vue`)
**Purpose**: Application entry point and routing hub
**Access**: Public (no authentication required)
**Features**:
- Empty template (intentional design)
- Serves as routing entry point
- Redirects handled by middleware and app logic
- No UI elements (redirect-only page)

**Note**: This page is intentionally minimal as routing logic is handled elsewhere in the application

### 2. Dashboard (`pages/dashboard.vue`)
**Purpose**: Main application interface for authenticated users
**Access**: Authenticated users only (`middleware: ['auth']`)
**Key Features**:
- **Battle Interface**: Primary song comparison and voting system
- **Profile Section**: User profile display with avatar and stats
- **Dynamic Profile Button**: 
  - Shows "Profile" button linking to `/user/{username}` when username exists
  - Shows "Finish Profile" button linking to `/account` when no username
- **Upload Section**: Song upload functionality (accessible via URL parameter)
- **Navigation**: Seamless switching between battle and upload modes

**Components Used**:
- `BattleAnimation.vue` - Core battle functionality
- `SongUploader.vue` - File upload interface

**State Management**:
- `useSongStore` - Song data and churn management
- `useProfileStore` - User profile data
- `useLeaderboardStore` - Battle results and leaderboard
- `useThemeStore` - Theme management

**User Interactions**:
- Genre selection for battles
- Song voting and comparison
- Dynamic profile navigation based on username status
- Upload completion handling

### 3. My Songs (`pages/my-songs.vue`)
**Purpose**: Song management interface for artists
**Access**: Authenticated users only (`middleware: ['auth']`)
**Key Features**:
- **Active Songs Tab**: Manage currently active songs
- **Trash Tab**: View and restore soft-deleted songs
- **Song Actions**: Play, edit, delete, and restore songs
- **Upload Integration**: Direct access to song upload

**Components Used**:
- `SongList.vue` - Comprehensive song management interface

**State Management**:
- `useProfileStore` - User profile and permissions
- `useSongStore` - Song data and management

**User Interactions**:
- Song playback and management
- Soft delete and restore operations
- Tab navigation between active and trash
- Bulk operations on songs

### 4. Leaderboard (`pages/leaderboard.vue`)
**Purpose**: Weekly rankings and Hall of Fame display
**Access**: Authenticated users only (`middleware: ['auth']`)
**Key Features**:
- **Weekly Rankings**: Current week's top songs by genre
- **Hall of Fame**: All-time top performers from completed churns
- **Churn Week Filtering**: Filter Hall of Fame by specific churn weeks
- **Per-Genre Limiting**: Fair representation (top 10 songs per genre)
- **Genre Filtering**: Filter leaderboard by specific genres
- **Week Selection**: View different weeks or Hall of Fame
- **Audio Playback**: 30-second clips with user-chosen start times
- **Artist Links**: Clickable links to artist profiles
- **Song Tagging**: Tag/untag songs for personal collections

**Hall of Fame Enhancements**:
- **Churn Week Dropdown**: Select specific churn weeks or "All Churn Weeks"
- **Chronological Numbering**: Churn 1, Churn 2, etc. (oldest to newest)
- **Default to Recent**: Automatically selects most recent churn week
- **Fair Representation**: Each genre gets up to 10 songs (not global limit)
- **Accurate Scoring**: Wilson Score ranking within each genre

**Components Used**:
- Dynamic audio elements for song playback
- Progress indicators and play controls
- Responsive grid layout for songs
- Dropdown menus for filtering

**State Management**:
- `useLeaderboardStore` - Leaderboard data and filtering
- `useTaggedSongs` - Song tagging functionality
- Dynamic audio element management

**User Interactions**:
- Genre and week filtering
- Churn week selection (Hall of Fame only)
- Song playback with 30-second clips
- Song tagging and untagging
- Navigation to artist profiles
- Mobile-optimized touch controls

### 5. Preview/Trial Page (`pages/preview.vue`)
**Purpose**: Trial mode battle interface for unauthenticated users
**Access**: Public (no authentication required)
**Key Features**:
- **Trial Battle Interface**: Full battle functionality with limitations
- **Trial Counter**: Displays remaining battles (5 maximum)
- **Genre Selection**: Choose battle genre
- **Song Comparison**: Vote on song battles
- **Conversion CTA**: Encourages sign-up after trials exhausted
- **Theme Toggle**: Dark/light mode support
- **Progress Tracking**: SessionStorage-based trial tracking

**Components Used**:
- `TrialCounter.vue` - Shows remaining trials
- `BattleAnimation.vue` - Core battle interface
- `ConversionCTA.vue` - Sign-up call-to-action
- Header with sign-up/sign-in buttons

**Trial System**:
- Maximum 5 trial battles per session
- SessionStorage tracking (resets on browser close)
- Auto-redirect to preview page when trials exhausted
- Real-time counter updates

**State Management**:
- Trial state via sessionStorage
- Battle state via songComparisonStore
- Theme state via themeStore

**User Flow**:
1. Land on preview page as guest
2. Select genre for battle
3. Vote on songs (up to 5 battles)
4. See conversion CTA when trials exhausted
5. Sign up or sign in to continue

**Navigation**:
- Sign Up button (primary action)
- Sign In link
- Theme toggle

### 6. Account Settings (`pages/account.vue`)
**Purpose**: User profile configuration and account management
**Access**: Authenticated users only (`middleware: ['auth']`)
**Key Features**:
- **Profile Information**: Display name, username, bio editing
- **Username Management**: One-time username setting with duplicate prevention
- **Dynamic Profile Button**: Shows "Profile" button only when username is saved
- **Username Input Control**: Disabled when username exists, enabled when empty
- **Error Handling**: "That username is taken" message for duplicates
- **Avatar Management**: Profile picture upload and management
- **Privacy Settings**: Public/private profile toggle
- **Theme Settings**: Dark/light mode selection
- **Account Type**: Judge/Artist role switching
- **Account Deletion**: Complete account removal with confirmation

**Components Used**:
- `AccountDeletionModal.vue` - Account deletion confirmation

**State Management**:
- `useProfileStore` - Profile data and updates (with username duplicate handling)
- `useThemeStore` - Theme preferences
- `useAuthStore` - Authentication state

**User Interactions**:
- Profile form editing and saving
- Username setting (one-time only)
- Duplicate username error handling
- Avatar upload and management
- Privacy and theme toggles
- Account type switching
- Account deletion process

### 7. Public User Profile (`pages/user/[username].vue`)
**Purpose**: Public profile viewing for any user
**Access**: Public (with privacy controls)
**Key Features**:
- **Profile Display**: Public user information and stats
- **Golden Ears Section**: Awards and progress tracking (privacy-controlled)
- **Tagged Songs**: Private feature - only visible on user's own profile
- **Artist Profile Links**: Clickable links from tagged songs to artist profiles
- **Privacy Controls**: Golden Ears Progress private to owner, History public, Tagged Songs completely private
- **Clean UI**: No progress bars or "30s Clip" indicators for tagged songs

**Components Used**:
- `GoldenEarsProgress.vue` - Golden Ears progress display
- `GoldenEarsHistory.vue` - Golden Ears award history

**State Management**:
- `useTaggedSongs` - Tagged songs functionality
- `useProfileStore` - Profile data fetching
- `useThemeStore` - Theme management

**User Interactions**:
- Tagged song playback and management
- Profile sharing and link copying
- Song untagging with confirmation
- Audio progress control

### 8. Admin Dashboard (`pages/admin/flags.vue`)
**Purpose**: Administrative interface for content moderation
**Access**: Admin users only (`middleware: ['admin']`)
**Key Features**:
- **Flag Review Tab**: Content moderation interface
- **Audit Log Tab**: System activity monitoring
- **Metrics Tab**: Real-time system statistics
- **Song Management**: Approve, remove, or re-enable songs

**Components Used**:
- `AuditLogFeed.vue` - Audit log display and filtering
- `SystemMetrics.vue` - System statistics dashboard

**State Management**:
- Direct Supabase client usage for admin operations

**User Interactions**:
- Flag review and moderation actions
- Audit log filtering and navigation
- Metrics monitoring and analysis
- Song status management

## Authentication Pages

### 9. Sign In (`pages/sign-in.vue`)
**Purpose**: User authentication interface
**Access**: Public (redirects if authenticated)
**Features**:
- Email/password authentication
- OAuth integration (Google, Facebook)
- Password reset functionality
- Registration redirection

### 10. Registration (`pages/registration.vue`)
**Purpose**: New user account creation
**Access**: Public (redirects if authenticated)
**Features**:
- Account creation form
- Email verification
- Profile setup initiation
- Terms and conditions

### 11. Password Reset (`pages/reset-password.vue`)
**Purpose**: Password reset functionality
**Access**: Public (with valid reset token)
**Features**:
- New password entry
- Token validation
- Password strength requirements
- Success/error handling

### 12. Password Reset Email (`pages/reset-password-email.vue`)
**Purpose**: Password reset email request
**Access**: Public
**Features**:
- Email input for reset request
- Email sending confirmation
- Instructions and guidance

## Page Navigation Flow

### 1. Unauthenticated User Flow
```
index.vue → sign-in.vue → registration.vue → account.vue → dashboard.vue
```

### 2. Authenticated User Flow
```
dashboard.vue ↔ my-songs.vue ↔ account.vue ↔ user/[username].vue
```

### 3. Admin User Flow
```
dashboard.vue → admin/flags.vue (with additional admin features)
```

## Responsive Design

### Mobile-First Approach
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Interactions**: Optimized for mobile devices
- **Navigation**: Mobile-friendly navigation patterns
- **Performance**: Optimized for mobile networks

### Desktop Enhancements
- **Larger Layouts**: Expanded interfaces for desktop
- **Keyboard Navigation**: Full keyboard accessibility
- **Hover States**: Enhanced hover interactions
- **Multi-Column Layouts**: Efficient space utilization

## Error Handling

### 1. Page-Level Error Handling
- **404 Errors**: Custom not found pages
- **Authentication Errors**: Redirect to sign-in
- **Permission Errors**: Access denied messages
- **Network Errors**: Retry mechanisms

### 2. User Feedback
- **Loading States**: Comprehensive loading indicators
- **Success Messages**: Confirmation of actions
- **Error Messages**: Clear error communication
- **Validation Feedback**: Real-time form validation

## Performance Considerations

### 1. Page Loading
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Route-based code splitting
- **Preloading**: Critical resources preloaded
- **Caching**: Browser and API caching

### 2. User Experience
- **Smooth Transitions**: Page transition animations
- **Instant Feedback**: Immediate user feedback
- **Progressive Enhancement**: Graceful degradation
- **Accessibility**: Full accessibility support

## Security Features

### 1. Route Protection
- **Authentication Middleware**: Protects authenticated routes
- **Admin Middleware**: Restricts admin-only pages
- **Role-Based Access**: User role validation
- **Session Management**: Secure session handling

### 2. Data Protection
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Headers**: Security headers implementation
- **Content Security Policy**: CSP implementation

This comprehensive page documentation provides a complete overview of the SongWars frontend application structure, ensuring developers understand the purpose, functionality, and relationships between all pages in the system.
