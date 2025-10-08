# 🗄️ SongWars Supabase Project Setup Specification

**Version:** 1.0  
**Last Updated:** January 27, 2025  
**Purpose:** Complete setup guide for SongWars Supabase project configuration

---

## 📋 Table of Contents

1. [Project Creation](#project-creation)
2. [Database Schema](#database-schema)
3. [Storage Configuration](#storage-configuration)
4. [Authentication Setup](#authentication-setup)
5. [Edge Functions](#edge-functions)
6. [Environment Variables](#environment-variables)
7. [Row Level Security (RLS)](#row-level-security-rls)
8. [Testing & Validation](#testing--validation)
9. [Troubleshooting](#troubleshooting)

---

## 🚀 Project Creation

### **Step 1: Create New Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization
4. Enter project details:
   - **Name**: `songwars-[environment]` (e.g., `songwars-dev`, `songwars-prod`)
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to target users
5. Click "Create new project"

### **Step 2: Wait for Setup**
- Database provisioning: ~2-3 minutes
- Initial setup: ~5 minutes total

---

## 🗄️ Database Schema

### **Step 1: Run Core Migrations**

#### **Migration 1: Create Songs Table**
```sql
-- File: supabase/migrations/20240622_create_songs_table.sql
-- Run this first to create the base songs table
```

#### **Migration 2: Add Voting Function**
```sql
-- File: supabase/migrations/20240615_increment_song_scores.sql
-- Run this to add the atomic voting function
```

#### **Migration 3: Enhance Churn System**
```sql
-- File: supabase/migrations/20240625_enhance_churn_system.sql
-- Run this to add churn system enhancements
```

#### **Migration 4: Add Soft Delete Functionality**
```sql
-- File: supabase/migrations/20250101_add_soft_delete_functionality.sql
-- Run this to add soft delete system with trash management
```

### **Step 2: Verify Schema**
After running migrations, verify these tables exist:
- ✅ `public.songs` (includes soft delete columns)
- ✅ `public.churn_events`
- ✅ `public.weekly_scores`

### **Step 3: Verify Functions**
Check these functions are created:
- ✅ `increment_song_scores(uuid, uuid)`
- ✅ `process_weekly_churn()`
- ✅ `calculate_song_score(integer, integer)`
- ✅ `get_top_songs_by_genre(text)`
- ✅ `soft_delete_song(uuid)`
- ✅ `restore_song(uuid)`
- ✅ `hard_delete_song(uuid)`
- ✅ `get_my_trashed_songs()`
- ✅ `purge_expired_trash()`

---

## 📁 Storage Configuration

### **Step 1: Create Storage Bucket**
1. Go to Storage in Supabase Dashboard
2. Click "Create a new bucket"
3. Configure bucket:
   - **Name**: `song-audio`
   - **Public bucket**: ✅ **ENABLED** (for public audio access)
   - **File size limit**: 50MB (adjust as needed)
   - **Allowed MIME types**: `audio/*`

### **Step 2: Storage Policies**
The migration should create these policies automatically:
- ✅ `Allow authenticated uploads to song-audio`
- ✅ `Allow public read access to song-audio`

### **Step 3: Verify Storage Setup**
```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'song-audio';

-- Check policies exist
SELECT * FROM storage.policies WHERE bucket_id = 'song-audio';
```

---

## 🔐 Authentication Setup

### **Step 1: Configure Auth Settings**
1. Go to Authentication → Settings
2. Configure the following:

#### **Site URL**
```
Development: http://localhost:3000
Production: https://your-domain.com
```

#### **Redirect URLs**
```
Development:
- http://localhost:3000/confirm
- http://localhost:3000/dashboard

Production:
- https://your-domain.com/confirm
- https://your-domain.com/dashboard
```

#### **Email Templates**
- Customize sign-up confirmation email
- Customize password reset email
- Add SongWars branding

### **Step 2: Enable Auth Providers**
- ✅ **Email**: Enabled by default
- ❌ **Google**: Disabled (can enable later)
- ❌ **GitHub**: Disabled (can enable later)

### **Step 3: Configure Auth Policies**
The migrations should create these automatically:
- ✅ `Allow authenticated users to insert own song`
- ✅ `Allow authenticated read access to all songs`

---

## ⚡ Edge Functions

### **Step 1: Deploy Weekly Churn Function**
1. Navigate to Edge Functions in Supabase Dashboard
2. Click "Create a new function"
3. Function details:
   - **Name**: `weekly-churn`
   - **Import method**: Upload files

### **Step 2: Upload Function Files**
Upload these files to the function:
- `supabase/functions/weekly-churn/index.ts`
- `supabase/functions/weekly-churn/cron.json`

### **Step 3: Configure Function Environment**
Set these environment variables in the function:
```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 4: Set Up Cron Schedule**
1. Go to Database → Functions
2. Find `weekly-churn` function
3. Set cron schedule: `0 0 * * 1` (every Monday at midnight)

---

## 🔧 Environment Variables

### **Step 1: Project API Keys**
Get these from Supabase Dashboard → Settings → API:

#### **Required Variables**
```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
NUXT_PUBLIC_BASE_URL=http://localhost:3000
NUXT_APP_BASE_URL=/
```

#### **Optional Variables**
```bash
# For production deployments
NUXT_PUBLIC_BASE_URL=https://your-domain.com
NUXT_APP_BASE_URL=/songwars/
```

### **Step 2: Create .env File**
Create `.env` file in project root:
```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your_anon_public_key

# Application Configuration
NUXT_PUBLIC_BASE_URL=http://localhost:3000
NUXT_APP_BASE_URL=/
```

### **Step 3: Environment-Specific Files**
Create these files for different environments:
- `.env.development`
- `.env.production`
- `.env.local` (for local overrides)

---

## 🛡️ Row Level Security (RLS)

### **Step 1: Verify RLS Policies**
The migrations should create these policies automatically. Verify they exist:

#### **Songs Table Policies**
```sql
-- Check songs policies
SELECT * FROM pg_policies WHERE tablename = 'songs';
```

Expected policies:
- ✅ `Allow authenticated users to insert own song`
- ✅ `Allow authenticated read access to all songs`

#### **Storage Policies**
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'song-audio';
```

Expected policies:
- ✅ `Allow authenticated uploads to song-audio`
- ✅ `Allow public read access to song-audio`

### **Step 2: Test RLS**
```sql
-- Test as authenticated user
-- Test as anonymous user
-- Verify policies work correctly
```

---

## 🧪 Testing & Validation

### **Step 1: Database Connection Test**
```bash
# Test connection with Supabase CLI
supabase status
supabase db reset
```

### **Step 2: Function Testing**
```sql
-- Test voting function
SELECT increment_song_scores('song-id-1'::uuid, 'song-id-2'::uuid);

-- Test score calculation
SELECT calculate_song_score(8, 2);

-- Test weekly churn (manual trigger)
SELECT process_weekly_churn();
```

### **Step 3: Storage Testing**
```bash
# Test file upload
# Test file access
# Verify public URLs work
```

### **Step 4: Authentication Testing**
```bash
# Test user registration
# Test user login
# Test password reset
# Test protected routes
```

---

## 🔍 Troubleshooting

### **Common Issues**

#### **Issue: "Your project's URL and Key are required"**
**Solution:**
1. Check `.env` file exists
2. Verify `NUXT_PUBLIC_SUPABASE_URL` and `NUXT_PUBLIC_SUPABASE_KEY` are set
3. Restart development server
4. Check Supabase Dashboard for correct keys

#### **Issue: "Function not found"**
**Solution:**
1. Verify Edge Function is deployed
2. Check function name matches exactly
3. Verify environment variables in function
4. Check function logs in Supabase Dashboard

#### **Issue: "Permission denied"**
**Solution:**
1. Check RLS policies are enabled
2. Verify user is authenticated
3. Check policy conditions
4. Test with service role key

#### **Issue: "Storage bucket not found"**
**Solution:**
1. Verify bucket name is exactly `song-audio`
2. Check bucket is public
3. Verify storage policies exist
4. Check bucket permissions

### **Debug Commands**
```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

---

## 📊 Monitoring & Maintenance

### **Step 1: Set Up Monitoring**
1. Enable Supabase Analytics
2. Set up error tracking
3. Monitor function execution logs
4. Track database performance

### **Step 2: Regular Maintenance**
- Weekly: Check function execution logs
- Monthly: Review and clean up old data
- Quarterly: Update dependencies and security patches

### **Step 3: Backup Strategy**
- Enable point-in-time recovery
- Set up automated backups
- Test restore procedures

---

## 📝 Checklist

### **Project Setup**
- [ ] Create Supabase project
- [ ] Set database password
- [ ] Choose region
- [ ] Wait for provisioning

### **Database**
- [ ] Run migration 1 (songs table)
- [ ] Run migration 2 (voting function)
- [ ] Run migration 3 (churn system)
- [ ] Run migration 4 (soft delete system)
- [ ] Verify all tables exist
- [ ] Verify all functions exist

### **Storage**
- [ ] Create song-audio bucket
- [ ] Set bucket to public
- [ ] Verify storage policies
- [ ] Test file upload

### **Authentication**
- [ ] Configure site URL
- [ ] Set redirect URLs
- [ ] Customize email templates
- [ ] Test user registration

### **Edge Functions**
- [ ] Deploy weekly-churn function
- [ ] Set environment variables
- [ ] Configure cron schedule
- [ ] Test function manually

### **Environment**
- [ ] Create .env file
- [ ] Set all required variables
- [ ] Test connection
- [ ] Verify authentication works

### **Security**
- [ ] Verify RLS policies
- [ ] Test authenticated access
- [ ] Test anonymous access
- [ ] Verify storage permissions

### **Testing**
- [ ] Test database functions
- [ ] Test file upload/download
- [ ] Test user authentication
- [ ] Test protected routes
- [ ] Test soft delete functionality
- [ ] Test trash restoration
- [ ] Test hard delete with confirmation

---

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Note:** This specification should be updated whenever the project structure or requirements change. Keep it synchronized with the actual implementation. 