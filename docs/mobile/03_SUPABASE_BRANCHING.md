# 03: Supabase Branching for Mobile Development

## Overview
This guide explains how to set up a separate Supabase environment for mobile app development, allowing you to test and iterate without affecting your production web app.

> **📝 Updated Information**: This guide reflects current Supabase branching capabilities as of January 2025. Branching is available on all Supabase plans and creates completely isolated database instances for safe development.

## Your Use Case: Testing Mobile App (No Database Changes)

💡 **Perfect for your scenario:**

You want to develop and test your mobile app against a safe environment, then switch it to production when ready. You're **NOT making database schema changes** - just building a mobile interface for your existing backend.

### ✅ Is This Safe for Production?

**Absolutely YES!** Here's why:

🔒 **Complete Isolation:**
- Branch is a **separate Postgres instance** (different server)
- Has its own unique URL and API keys
- **Cannot affect production** in any way
- Production and branch cannot "see" each other

🔒 **Copying Schema/Data is Safe:**
- You **READ** from production (doesn't modify anything)
- You **WRITE** to branch (separate database)
- It's like exporting to a file and importing elsewhere
- Production continues running normally during copy

🔒 **No Accidental Changes:**
- Branch URL is different: `https://[ref]-mobile-development.supabase.co`
- Production URL stays: `https://[ref].supabase.co`
- Mobile app explicitly configured to use branch URL
- Impossible to accidentally hit production during development

🔒 **What CAN'T Happen:**
- ❌ Branch cannot modify production data
- ❌ Branch cannot delete production data
- ❌ Branch cannot affect production users
- ❌ Branch cannot slow down production
- ❌ Branch tests cannot affect web app

🔒 **Web App Continues Normally:**
- Your web app keeps using production
- Users see no difference
- No downtime
- No performance impact

**Your Simple Workflow:**
1. ✅ Create a Supabase branch for mobile testing
2. ✅ Copy production schema to branch (one-time setup)
3. ✅ Add test user accounts and data
4. ✅ Develop and test mobile app against branch
5. ✅ When working perfectly, update mobile app to use production URLs
6. ✅ Deploy mobile app - **No database merge needed!**

**Why This Works:**
- Production already has all tables, RPC functions, and logic
- Mobile app just needs different API endpoints during dev
- When ready, you simply change the URLs in your mobile app config
- Your web app continues running on production unaffected
- You can keep the branch for future mobile updates/testing

## Key Points About Supabase Branching

🔑 **Important to Know:**

1. **Available on All Plans**: Branching is not limited to Pro plans - it's available on Free, Pro, Team, and Enterprise plans
2. **Empty Database**: Branches start with an **empty database** (no production data) for security
3. **Complete Isolation**: Each branch is a separate Postgres instance with unique API credentials
4. **Dashboard or CLI**: You can create and manage branches via the Supabase Dashboard or CLI
5. **Persistent or Preview**: Choose between long-lived persistent branches or temporary preview branches
6. **Seed Files**: Use `supabase/seed.sql` to populate test data in your branch
7. **Schema Copy**: You need to manually copy or migrate your schema from production to the branch
8. **No Merge Needed**: For mobile-only development, you just switch URLs when ready (no database merge!)

## Why Use Separate Environments?

### Benefits
- ✅ Test mobile app without affecting production web app
- ✅ Experiment with mobile-specific features safely
- ✅ Separate test user accounts and data
- ✅ Independent deployment cycles
- ✅ No risk to production during development
- ✅ Easy switch to production when ready (just change URLs)

### Workflow Overview

**The Simple Approach** (No Database Changes):

1. **Create branch** → Copy production schema → Add test data
2. **Develop mobile app** → Point to branch URL and credentials
3. **Test thoroughly** → Use branch for all mobile testing
4. **Switch to production** → Update mobile app to production URL (no merge needed!)

This is perfect when:
- ✅ You're NOT making database schema changes
- ✅ All RPC functions already exist in production
- ✅ You just want to test the mobile app safely
- ✅ You'll simply switch URLs when ready for launch

---

## Option 1: Supabase Branching (Recommended)

### Requirements
- **Supabase Plan**: Available on all plans (Free, Pro, Team, Enterprise)
- **Supabase CLI**: Optional (can use Dashboard)
- **Git**: Optional (helpful for tracking changes)

### What is Supabase Branching?

Supabase branching creates an **isolated environment** that:
- Creates a completely separate Postgres instance
- Has its own unique API credentials (URL, anon key, service key)
- Starts with empty database (no production data for security)
- Can optionally use seed files to populate initial data
- Can be merged back to production when ready

### Branch Types
- **Preview Branches**: Temporary, ideal for short-term testing
- **Persistent Branches**: Long-lived, suitable for ongoing development (like mobile app development)

### Step 1: Create a Branch

You can create a branch using either the **Dashboard** (recommended for simplicity) or **CLI**.

#### Option A: Via Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your SongWars project
3. Navigate to **Branches** section in the sidebar
4. Click **Create Branch**
5. Configure:
   - **Name**: `mobile-development`
   - **Branch type**: Persistent branch
   - **Include data**: No (starts empty for security)
   - **Seed file**: Optional (can add `supabase/seed.sql` later)
6. Click **Create**

The branch will be created in a few moments with:
- New isolated Postgres database
- Unique API URL
- New anon key and service role key
- Separate storage buckets

#### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Navigate to your project
cd ~/Desktop/Project-Folders/songwars

# Login to Supabase
supabase login

# Link to your existing project
supabase link --project-ref your-project-ref
# Your project ref is in your Supabase URL: https://[project-ref].supabase.co

# Create a persistent branch for mobile development
supabase branches create mobile-development --persistent

# List all branches
supabase branches list

# Get branch credentials
supabase branches get mobile-development
```

### Step 2: Get Branch Credentials

#### Via Dashboard:
1. Go to **Branches** section
2. Select `mobile-development` branch
3. Click **Settings** or **API Keys**
4. Copy the credentials:
   - **Project URL**: `https://[project-ref]-mobile-development.supabase.co`
   - **Anon Key**: Your branch's anonymous key
   - **Service Role Key**: Your branch's service key

#### Via CLI:
```bash
supabase branches get mobile-development
```

### Step 5: Configure Mobile App

Create a separate environment file for the mobile branch:

**`.env.mobile-dev`**:
```env
# Supabase Mobile Development Branch
VITE_SUPABASE_URL=https://your-project-ref-mobile-development.supabase.co
VITE_SUPABASE_ANON_KEY=your_mobile_branch_anon_key
VITE_SUPABASE_SERVICE_KEY=your_mobile_branch_service_key

# Environment identifier
VITE_ENV=mobile-development
VITE_BRANCH=mobile-development

# App Configuration
VITE_APP_NAME=SongWars (Dev)
VITE_APP_VERSION=1.0.0-dev
```

### Step 6: Update Build Scripts

Update `package.json` to support different environments:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:mobile": "vite --mode mobile-dev",
    "build": "vite build",
    "build:mobile-dev": "vite build --mode mobile-dev",
    "build:production": "vite build --mode production"
  }
}
```

### Step 7: Populate Branch Database

**Important**: Branches start with an **empty database** (no schema, no data) for security.

## What Can You Copy?

### ✅ CAN Copy (Database Tables)

**Yes, you can copy ALL these:**
- ✅ **Schema**: All tables, columns, constraints
- ✅ **RPC Functions**: All 67 functions
- ✅ **Triggers**: All 3 triggers
- ✅ **Indexes**: All performance indexes
- ✅ **RLS Policies**: All 44 security policies
- ✅ **Table Data**:
  - profiles (users)
  - songs (metadata only - see note below)
  - battles
  - votes
  - leaderboard data
  - golden_ears awards
  - user_tags
  - flagged_songs
  - audit_log
  - All other tables

### ❌ CANNOT Copy Automatically

**These require separate handling:**

1. **🚫 Supabase Storage Files** (Audio & Images)
   - Song audio files (`song-audio` bucket)
   - User avatars (`avatars` bucket)
   - These are **NOT** in the database (they're in storage buckets)
   - Must be copied separately OR use test files

2. **🚫 Supabase Auth Users**
   - Auth users are managed by Supabase Auth (separate system)
   - Not stored in your database tables
   - Must create new test users in branch

3. **🚫 Edge Function Schedules**
   - Cron jobs for weekly churn and golden ears
   - Would need to be set up separately in branch (optional for testing)

### 📦 What About Storage Files?

Your `songs` table has URLs like:
```
https://[project-ref].supabase.co/storage/v1/object/public/song-audio/user123/song.mp3
```

**Options:**

**Option 1: Use Test Files (Recommended for Mobile Dev)**
```sql
-- Create test songs with placeholder audio
INSERT INTO songs (user_id, title, artist_name, genre, url)
VALUES (
  'test-user-1', 
  'Test Song', 
  'Test Artist', 
  'Rock',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' -- Public test file
);
```

**Option 2: Copy Storage Files (If Needed)**
```bash
# Download from production storage
supabase storage download song-audio/user123/song.mp3 --project-ref production-ref

# Upload to branch storage
supabase storage upload song-audio/user123/song.mp3 --project-ref branch-ref
```

**Option 3: Point to Production Storage (Read-Only)**
- Keep song URLs pointing to production storage
- Branch reads audio from production buckets (safe, read-only)
- Good for testing playback without copying files

## Recommended Approach for Mobile Testing

### What to Copy:

**1. Copy Schema (100% - Required)**
```bash
# Via Supabase CLI
supabase db dump --project-ref your-production-ref > schema.sql

# Apply to branch
psql [branch-connection-string] < schema.sql
```

**2. Copy Minimal Data (Smart Approach)**

Instead of copying ALL production data, create targeted test data:

```sql
-- Create test users
INSERT INTO profiles (id, username, display_name, role, created_at)
VALUES 
  ('test-user-1', 'testartist', 'Test Artist', 'artist', NOW()),
  ('test-user-2', 'testjudge', 'Test Judge', 'judge', NOW()),
  ('test-user-3', 'reviewer', 'App Reviewer', 'artist', NOW());

-- Create test songs (with production storage URLs or test URLs)
INSERT INTO songs (id, user_id, title, artist_name, genre, url, clip_start_time, created_at, status)
VALUES 
  (gen_random_uuid(), 'test-user-1', 'Rock Test Song', 'Test Artist', 'Rock', 
   'https://production-url/song1.mp3', 0, NOW(), 'live'),
  (gen_random_uuid(), 'test-user-1', 'Pop Test Song', 'Test Artist', 'Pop',
   'https://production-url/song2.mp3', 0, NOW(), 'live'),
  -- Add 10-20 test songs across different genres
  ;

-- Create some test battles and votes
INSERT INTO battles (id, song_a_id, song_b_id, winner_id, user_id, created_at)
VALUES (gen_random_uuid(), [song-id-1], [song-id-2], [song-id-1], 'test-user-2', NOW());

-- Add test leaderboard data
-- Songs will get scores as you test battles
```

**3. Optional: Copy Sample Production Data**

If you want some real data for testing:

```sql
-- Copy a few real users (sanitize emails if needed)
INSERT INTO profiles SELECT * FROM profiles LIMIT 10;

-- Copy recent songs
INSERT INTO songs 
SELECT * FROM songs 
WHERE created_at > NOW() - INTERVAL '30 days'
LIMIT 50;

-- Copy recent battles
INSERT INTO battles
SELECT * FROM battles
WHERE created_at > NOW() - INTERVAL '7 days'
LIMIT 100;
```

### Quick Setup Script

Create `setup-branch.sql`:

```sql
-- 1. Schema is already copied via pg_dump

-- 2. Create test users for mobile testing
INSERT INTO profiles (id, username, display_name, role, email, created_at)
VALUES 
  ('a1b2c3d4-test-user-0001', 'testartist1', 'Mobile Test Artist', 'artist', 'test1@songwars.test', NOW()),
  ('a1b2c3d4-test-user-0002', 'testjudge1', 'Mobile Test Judge', 'judge', 'test2@songwars.test', NOW()),
  ('a1b2c3d4-test-user-0003', 'reviewer', 'App Store Reviewer', 'artist', 'reviewer@songwars.test', NOW());

-- 3. Create test songs (using production storage URLs for simplicity)
-- Copy a few real song records for testing
INSERT INTO songs (id, user_id, title, artist_name, genre, url, clip_start_time, likes, dislikes, wilson_score, created_at, status)
SELECT 
  gen_random_uuid() as id,
  'a1b2c3d4-test-user-0001' as user_id,
  title,
  artist_name,
  genre,
  url, -- Points to production storage (read-only, safe)
  clip_start_time,
  0 as likes,
  0 as dislikes,
  50.00 as wilson_score,
  NOW() as created_at,
  'live' as status
FROM songs 
WHERE status = 'live'
ORDER BY RANDOM()
LIMIT 20; -- 20 test songs across genres

-- 4. Done! You now have a working branch for mobile testing
```

Apply it:
```bash
psql [your-branch-connection-string] < setup-branch.sql
```

### Summary

**For Mobile Testing, You Need:**
- ✅ Full schema (required)
- ✅ Test user accounts (10-20 users)
- ✅ Test songs (20-50 songs with real or test audio URLs)
- ✅ Minimal battle/vote data (will generate more as you test)
- ⚠️ Storage files: Use production URLs (read-only) or upload a few test files

**You DON'T Need:**
- ❌ All 10,000+ production users
- ❌ All production songs
- ❌ Complete battle history
- ❌ All storage files

**This gives you:**
- Fast setup (minutes, not hours)
- Enough data to test all features
- No sensitive production user data
- Easy to reset and recreate if needed

### Step 8: Develop and Test

Now your branch has:
- ✅ Isolated database with schema
- ✅ Test data (if seeded)
- ✅ Separate API credentials
- ✅ Independent storage buckets

You can safely develop without affecting production!

### Step 9: Testing Mobile App

Configure your mobile app to use the branch:

```typescript
// src/config/supabase.config.ts
const getSupabaseConfig = () => {
  const env = import.meta.env.VITE_ENV
  
  if (env === 'mobile-development') {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      isDevelopment: true,
    }
  }
  
  // Production config
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    isDevelopment: false,
  }
}

export const supabaseConfig = getSupabaseConfig()
```

### Step 10: Switch Mobile App to Production (No Merge Needed!)

Since you're not making database changes, there's **no merge required**. You simply update your mobile app configuration to use production credentials.

#### What You'll Do:

**Your branch was only for safe testing**. Now that mobile app works, just point it to production:

1. **Keep branch running** (optional, for ongoing testing)
2. **Update mobile app config** to production URLs
3. **Build and deploy** mobile app with production settings
4. **Done!** No database changes needed

Your production database already has:
- ✅ All tables and schema
- ✅ All 67 RPC functions
- ✅ All RLS policies
- ✅ All triggers and functions
- ✅ Real user data

The mobile app will work identically, just with production data now!

#### Optional: Delete Branch

Once mobile app is live and stable:

**Via Dashboard:**
1. Go to **Branches** section
2. Select `mobile-development` branch
3. Click **Delete Branch**
4. Confirm deletion

**Via CLI:**
```bash
supabase branches delete mobile-development
```

Or **keep the branch** for future mobile app updates and testing!

### Step 11: Switch Mobile App to Production

Update mobile app environment variables:

**`.env.production`**:
```env
# Production Supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Environment
VITE_ENV=production
VITE_BRANCH=main

# App Configuration
VITE_APP_NAME=SongWars
VITE_APP_VERSION=1.0.0
```

Build for production:

```bash
# Build mobile app with production config
npm run build:production

# Sync to native platforms
npx cap sync ios
npx cap sync android
```

---

## Option 2: Separate Supabase Project

### When to Use This Approach
- Don't have Supabase Pro plan
- Need completely isolated environment
- Want independent billing/limits
- Long-term mobile development (months)

### Step 1: Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Configure:
   - **Name**: SongWars Mobile Dev
   - **Database Password**: [Strong password]
   - **Region**: Same as production (for consistency)
   - **Pricing Plan**: Free or Pro

### Step 2: Export Production Schema

```bash
# Export production schema
supabase db dump --schema-only > songwars_schema.sql

# Export RPC functions
supabase db dump --data-only --table=pg_proc > functions.sql
```

### Step 3: Import to New Project

```bash
# Link to new project
supabase link --project-ref your-new-mobile-project-ref

# Import schema
psql postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres < songwars_schema.sql

# Or use Supabase CLI
supabase db push
```

### Step 4: Copy Storage Buckets

Manually recreate storage buckets in new project:

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `song-audio` (public)
   - `avatars` (public)
3. Copy bucket policies from production

### Step 5: Copy RLS Policies

Export and import RLS policies:

```sql
-- Export from production
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies;

-- Apply to new project via SQL Editor
```

### Step 6: Set Up Edge Functions

Copy edge functions to new project:

```bash
# In production project directory
cd supabase/functions

# Deploy to new project
supabase functions deploy golden-ears-processor --project-ref your-new-mobile-project-ref
supabase functions deploy weekly-churn --project-ref your-new-mobile-project-ref
```

### Step 7: Configure Mobile App

**`.env.mobile-dev`**:
```env
# Mobile Development Project
VITE_SUPABASE_URL=https://your-new-mobile-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_project_anon_key

VITE_ENV=mobile-development
VITE_APP_NAME=SongWars (Mobile Dev)
```

### Step 8: Sync Changes

Keep development project in sync with production changes:

```bash
# Create a sync script
cat > sync-to-mobile-dev.sh << 'EOF'
#!/bin/bash

# Export production schema
supabase link --project-ref production-ref
supabase db dump > production_dump.sql

# Import to mobile dev
supabase link --project-ref mobile-dev-ref
supabase db reset
psql postgres://... < production_dump.sql

echo "Sync complete!"
EOF

chmod +x sync-to-mobile-dev.sh
```

### Step 9: Migration Path

When ready to use production:

1. **Test extensively** in mobile dev project
2. **Document all changes** made for mobile
3. **Update mobile app** to use production credentials
4. **Deploy** mobile app with production config

**No database migration needed** - mobile app just switches API endpoints!

---

## Comparison: Branching vs Separate Project

| Feature | Supabase Branching | Separate Project |
|---------|-------------------|------------------|
| **Cost** | Available on all plans (Free, Pro, etc.) | Free tier available |
| **Setup Time** | 5-10 minutes | 30-60 minutes |
| **Initial Data** | Empty (use seed files) | Empty or copy manually |
| **Schema Sync** | Via migrations or manual | Manual copy |
| **Merge Process** | Dashboard merge or migrations | Manual config switch only |
| **Isolation** | Complete (separate instance) | Complete isolation |
| **API Credentials** | Unique per branch | Unique per project |
| **Best For** | Any duration, cleaner workflow | Long-term or no branching access |
| **Data Protection** | Production data never copied | Production data never copied |

---

## Recommended Workflow

### Development Phase (Mobile Branch/Project)

```bash
# 1. Develop mobile app features
npm run dev:mobile

# 2. Test on iOS simulator
npx cap run ios --configuration=development

# 3. Test on Android emulator
npx cap run android --configuration=debug

# 4. Iterate and test
```

### Testing Phase

```bash
# 1. Build mobile app with dev config
npm run build:mobile-dev

# 2. Test on real devices
npx cap copy ios
npx cap copy android

# 3. Run TestFlight beta (iOS)
# 4. Run internal testing (Android)
```

### Production Switch

```bash
# 1. Update environment to production
cp .env.production .env

# 2. Build for production
npm run build:production

# 3. Sync to platforms
npx cap sync

# 4. Create production builds
# iOS: Archive in Xcode
# Android: ./gradlew bundleRelease

# 5. Submit to stores
```

---

## Environment Management Best Practices

### 1. Use Environment-Specific Configs

Create multiple config files:

```
.env                    # Local development
.env.mobile-dev        # Mobile dev branch
.env.staging           # Staging (optional)
.env.production        # Production
```

### 2. Visual Indicators

Add visual indicators for non-production environments:

```typescript
// src/App.vue
const isDevelopment = import.meta.env.VITE_ENV !== 'production'

// Show banner in development
if (isDevelopment) {
  console.log('🚧 Development Environment')
}
```

```vue
<template>
  <ion-app>
    <!-- Development banner -->
    <div v-if="isDevelopment" class="dev-banner">
      🚧 DEVELOPMENT ENVIRONMENT 🚧
    </div>
    
    <ion-router-outlet />
  </ion-app>
</template>

<style>
.dev-banner {
  background: #ff6b6b;
  color: white;
  text-align: center;
  padding: 8px;
  font-weight: bold;
}
</style>
```

### 3. API Request Logging

Log API requests in development:

```typescript
// src/services/supabase.service.ts
const supabase = createClient(url, key, {
  global: {
    headers: {
      'X-Environment': import.meta.env.VITE_ENV,
    },
  },
  // Log requests in development
  ...(import.meta.env.VITE_ENV !== 'production' && {
    auth: {
      debug: true,
    },
  }),
})
```

### 4. Prevent Accidental Production Use

Add safeguards:

```typescript
// src/config/environment.guard.ts
export function verifyEnvironment() {
  const env = import.meta.env.VITE_ENV
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  
  if (env === 'production' && supabaseUrl.includes('mobile-dev')) {
    throw new Error(
      'CONFIGURATION ERROR: Production build with development Supabase URL!'
    )
  }
  
  if (env === 'mobile-development' && !supabaseUrl.includes('mobile-dev')) {
    console.warn('Warning: Development build with production-like URL')
  }
}

// Call in main.ts
verifyEnvironment()
```

---

## Testing Checklist

Before switching to production, verify:

### Functional Testing
- [ ] All authentication flows work
- [ ] Battle system functions correctly
- [ ] Song upload and playback work
- [ ] Leaderboard loads and updates
- [ ] Profile management works
- [ ] Admin features accessible
- [ ] Push notifications deliver
- [ ] Offline mode functions

### Performance Testing
- [ ] App launches in < 3 seconds
- [ ] Audio playback smooth (no lag)
- [ ] UI animations at 60fps
- [ ] Network requests complete quickly
- [ ] Battery usage acceptable

### Security Testing
- [ ] RLS policies enforced
- [ ] Auth tokens properly stored
- [ ] Sensitive data encrypted
- [ ] API keys not exposed

### Data Testing
- [ ] User data persists correctly
- [ ] Songs sync properly
- [ ] Votes recorded accurately
- [ ] Leaderboard calculations correct

---

## Troubleshooting

### Branch Creation Fails

```bash
# Check Supabase plan
supabase projects list

# Verify CLI version
supabase --version

# Update CLI
npm update -g supabase
```

### Wrong API Keys

```bash
# Verify current project
supabase status

# Get correct keys
supabase projects api-keys
```

### Schema Sync Issues

```bash
# Reset branch to match production
supabase db reset --branch mobile-development

# Reapply migrations
supabase db push
```

---

## Next Steps

After setting up your branch/environment:

1. **Update mobile app** to use dev credentials
2. **Test thoroughly** in development
3. **Document changes** for production migration
4. **Follow deployment guides**: `19_IOS_DEPLOYMENT.md` and `20_ANDROID_DEPLOYMENT.md`

---

## Summary: Your Workflow

### For Mobile Development (No Database Changes)

**🎯 Your Exact Path:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE BRANCH                                            │
│    - Dashboard: Click "Create Branch"                       │
│    - Name: "mobile-development"                             │
│    - Type: Persistent                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. COPY PRODUCTION SCHEMA (one-time)                        │
│    - Export schema from production                          │
│    - Import to branch via SQL Editor                        │
│    - All 67 RPC functions copied                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ADD TEST DATA                                            │
│    - Create test user accounts                              │
│    - Add sample songs for testing                           │
│    - Use seed.sql or manual inserts                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DEVELOP MOBILE APP                                       │
│    - Mobile app uses branch URL/keys                        │
│    - Test all features safely                               │
│    - Iterate without affecting production                   │
│    - Web app still uses production                          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SWITCH TO PRODUCTION (when ready)                        │
│    - Update .env.production in mobile app                   │
│    - Change VITE_SUPABASE_URL to production URL             │
│    - Change VITE_SUPABASE_ANON_KEY to production key        │
│    - Build and deploy mobile app                            │
│    - NO DATABASE MERGE NEEDED! ✅                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. OPTIONAL: KEEP OR DELETE BRANCH                          │
│    - Keep: Use for future mobile updates                    │
│    - Delete: Save resources if done testing                 │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: You're just changing **which Supabase instance** your mobile app talks to. The database structure stays the same!

### Recommended Approach

**For Your Use Case**: 
- ✅ Use Supabase Branching (Option 1) - Clean and simple
- ✅ Available on all plans (even Free)
- ✅ No database merge needed
- ✅ Just switch URLs when mobile app is ready

**Alternative**: 
- Use Separate Project (Option 2) if you prefer complete independence
- Same concept, just different Supabase project entirely

---

**Document Status**: ✅ Complete  
**Next Guide**: [04_ROUTING_NAVIGATION.md](04_ROUTING_NAVIGATION.md)  
**Estimated Setup Time**: 30-60 minutes
