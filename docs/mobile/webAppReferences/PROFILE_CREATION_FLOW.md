# Automatic Profile Creation Flow - Complete Guide

## Overview
This document explains **exactly** how the SongWars web app automatically creates user profiles when a new user signs in for the first time. The mobile app must replicate this behavior.

---

## 1. Complete fetchProfile() Function

### Location
**File**: `store/profileStore.ts` (Lines 11-48)

### Exact Code
```typescript
async function fetchProfile() {
  if (!user.value) {
    console.log('fetchProfile: No user found');
    return { data: null, error: 'No user' };
  }
  
  console.log('fetchProfile: Fetching profile for user ID:', user.value.id);
  loading.value = true;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .maybeSingle();
  
  console.log('fetchProfile: Supabase result:', { data, error });
  
  if (data) {
    profile.value = data;
    console.log('fetchProfile: Profile loaded into store:', profile.value);
  } else if (!error) {
    // No profile exists; create a minimal default
    console.log('fetchProfile: No profile found, creating minimal default profile');
    const minimalProfile = {
      id: user.value.id,
      display_name: 'New User',
      role: 'fan',
      is_public: true
    } as any;
    const created = await updateProfile(minimalProfile);
    if (created) {
      profile.value = created;
    }
  }
  
  loading.value = false;
  return { data, error };
}
```

### Line-by-Line Explanation

**Lines 12-15**: Early return if no user
```typescript
if (!user.value) {
  console.log('fetchProfile: No user found');
  return { data: null, error: 'No user' };
}
```
- Must have authenticated user before fetching
- Returns error object if no user

**Lines 17-18**: Debug logging and loading state
```typescript
console.log('fetchProfile: Fetching profile for user ID:', user.value.id);
loading.value = true;
```
- Logs user ID being fetched
- Sets loading flag for UI

**Lines 20-24**: Database query
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.value.id)
  .maybeSingle();
```
- **CRITICAL**: Uses `.maybeSingle()` not `.single()`
- `.maybeSingle()` returns `null` if no rows found (not an error)
- `.single()` would throw error if no rows found
- Queries by `id` (matches auth.users.id)

**Line 26**: Log query result
```typescript
console.log('fetchProfile: Supabase result:', { data, error });
```
- Shows what database returned
- Helps debug profile creation

**Lines 28-30**: Profile exists - load it
```typescript
if (data) {
  profile.value = data;
  console.log('fetchProfile: Profile loaded into store:', profile.value);
}
```
- If profile found, store it in reactive ref
- This is the normal case for returning users

**Lines 31-44**: **AUTOMATIC PROFILE CREATION** ⭐
```typescript
else if (!error) {
  // No profile exists; create a minimal default
  console.log('fetchProfile: No profile found, creating minimal default profile');
  const minimalProfile = {
    id: user.value.id,
    display_name: 'New User',
    role: 'fan',
    is_public: true
  } as any;
  const created = await updateProfile(minimalProfile);
  if (created) {
    profile.value = created;
  }
}
```
- **Key condition**: `!error` means no database error (just no rows)
- Creates minimal default profile object
- Calls `updateProfile()` which does UPSERT
- Stores created profile in reactive ref

**Lines 46-47**: Cleanup and return
```typescript
loading.value = false;
return { data, error };
```
- Reset loading state
- Return original query result (for components to check)

---

## 2. Profile Creation Logic

### Minimal Default Profile Structure

```typescript
const minimalProfile = {
  id: user.value.id,           // Required: FK to auth.users
  display_name: 'New User',    // Default display name
  role: 'fan',                 // Default role (not 'artist')
  is_public: true              // Profile visible to others
}
```

### Field Explanations

| Field | Type | Value | Required | Notes |
|-------|------|-------|----------|-------|
| `id` | UUID | `user.value.id` | ✅ Yes | Primary key, FK to auth.users |
| `display_name` | string | `'New User'` | ✅ Yes | User can change later |
| `role` | string | `'fan'` | ✅ Yes | Either 'fan' or 'artist' |
| `is_public` | boolean | `true` | ✅ Yes | Profile visibility |

### Database Schema Requirements

From `supabase/migrations/20240701_create_profiles_table.sql`:

```sql
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    display_name text,
    avatar_url text,
    bio text,
    region text,
    age_range text,
    musical_preferences text,
    role text NOT NULL DEFAULT 'fan',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);
```

**Note**: The web app doesn't include all these fields in the minimal profile. Only the essential ones are set. The database will use defaults for the rest.

---

## 3. updateProfile() Function (UPSERT Logic)

### Location
**File**: `store/profileStore.ts` (Lines 69-118)

### Exact Code
```typescript
async function updateProfile(newProfile: any) {
  if (!user.value) {
    console.log('updateProfile: No user found');
    return null;
  }
  
  console.log('updateProfile: Updating profile for user ID:', user.value.id);
  console.log('updateProfile: Profile data:', newProfile);
  
  loading.value = true;
  
  // Remove fields not present in schema to avoid errors
  const { website, ...sanitized } = newProfile || {} as any;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...sanitized, id: user.value.id }, { onConflict: 'id' })
    .select()
    .single();
  
  console.log('updateProfile: Supabase upsert result:', { data, error });
  
  if (error) {
    console.error('updateProfile: Error occurred:', error);
    // Map duplicate username to a friendly code
    if ((error as any).code === '23505' || 
        (error as any).code === '42501' || 
        `${error.message || ''}`.toLowerCase().includes('unique') && 
        `${error.message || ''}`.toLowerCase().includes('username') ||
        `${error.message || ''}`.toLowerCase().includes('row-level security policy')) {
      lastErrorCode.value = 'USERNAME_TAKEN';
    } else {
      lastErrorCode.value = 'UNKNOWN_ERROR';
    }
    loading.value = false;
    return null;
  }
  
  if (data) {
    profile.value = data;
    lastErrorCode.value = null;
    console.log('updateProfile: Profile updated in store:', profile.value);
    loading.value = false;
    return data;
  }
  
  console.log('updateProfile: No data returned from upsert');
  loading.value = false;
  return null;
}
```

### Key UPSERT Logic (Lines 83-87)

```typescript
const { data, error } = await supabase
  .from('profiles')
  .upsert({ ...sanitized, id: user.value.id }, { onConflict: 'id' })
  .select()
  .single();
```

**How UPSERT Works**:
1. **If profile exists** (matching `id`): Updates the row
2. **If profile doesn't exist**: Inserts a new row
3. `{ onConflict: 'id' }` - Uses `id` column as conflict resolution
4. `.select()` - Returns the upserted row
5. `.single()` - Expects exactly one row back

**This is why automatic creation works**: The first time `updateProfile()` is called with a new user ID, it INSERT a new profile row.

### Field Sanitization (Line 81)

```typescript
const { website, ...sanitized } = newProfile || {} as any;
```

- Removes `website` field (not in schema)
- Prevents database errors from extra fields
- Use destructuring to extract unwanted fields

---

## 4. When fetchProfile() is Called

### NOT in Auth Store Watcher ❌

The web app's `authStore.ts` watcher (lines 29-61) does **NOT** call `fetchProfile()`. 

**From Auth Store Analysis**:
```typescript
watch(user, async (newUser, oldUser) => {
  // ... authentication logic
  // No profileStore.fetchProfile() call here
}, { immediate: true });
```

**Comments in authStore.ts (line 12)**:
```typescript
// Removed profile watcher responsibilities. Components fetch profile on demand.
```

### Component-Based Fetching ✅

Components call `fetchProfile()` in their `onMounted()` hooks:

#### 1. Dashboard Page
**File**: `pages/dashboard.vue` (Lines 214-219)
```typescript
onMounted(async () => {
  if (user.value) {
    const { data } = await profileStore.fetchProfile();
    profile.value = data;
  }
  // Reset battle completion state on mount
  isBattleComplete.value = false;
});
```

#### 2. Account Page
**File**: `pages/account.vue` (Lines 724-731)
```typescript
if (user.value) {
  console.log('User authenticated, fetching profile for ID:', user.value.id)
  const { data: profile, error } = await profileStore.fetchProfile()
  console.log('Profile fetch result:', { profile, error })
  
  if (profile) {
    // Profile exists, load it
    console.log('Profile found, loading data:', profile)
    // ... load into form
  }
}
```

#### 3. My Songs Page
**File**: `pages/my-songs.vue` (Lines 37-39)
```typescript
onMounted(async () => {
  await profileStore.fetchProfile();
});
```

#### 4. Footer Navigation
**File**: `components/FooterNavigation.vue` (Lines 88-91)
```typescript
// Fetch profile on mount to ensure footer has role data for conditional rendering
onMounted(async () => {
  if (authStore.authenticatedUser) {
    await profileStore.fetchProfile()
  }
})
```

#### 5. User Profile Page
**File**: `pages/user/[username].vue` (Lines 468-472)
```typescript
if (user.value) {
  // Fetch the current user's profile by ID
  const myProfileResult = await profileStore.fetchProfile()
  const myProfile = myProfileResult && myProfileResult.data ? myProfileResult.data : null
  // ... compare with requested username
}
```

---

## 5. Complete Sign-In to Profile Flow

### Detailed Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER SIGNS IN                                            │
├─────────────────────────────────────────────────────────────┤
│ • User submits email/password                               │
│ • authStore.signInWithEmail() called                        │
│ • Supabase auth.signInWithPassword() API request            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION SUCCESS                                    │
├─────────────────────────────────────────────────────────────┤
│ • Supabase session created                                  │
│ • @nuxtjs/supabase module detects session                   │
│ • user ref updated with user data                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AUTH STORE WATCHER FIRES                                 │
├─────────────────────────────────────────────────────────────┤
│ • watch(user, ...) callback executes                        │
│ • authenticatedUser.value = true                            │
│ • Checks current route                                      │
│ • Redirects to /dashboard                                   │
│ • ⚠️ NO profileStore.fetchProfile() call                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. DASHBOARD PAGE LOADS                                     │
├─────────────────────────────────────────────────────────────┤
│ • Dashboard component mounts                                │
│ • onMounted() hook executes                                 │
│ • 🔑 profileStore.fetchProfile() called                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FETCH PROFILE FROM DATABASE                              │
├─────────────────────────────────────────────────────────────┤
│ • Query: SELECT * FROM profiles WHERE id = user.id          │
│ • Uses .maybeSingle() (returns null if not found)           │
│                                                              │
│ Two possible outcomes:                                      │
│   A) Profile exists → Load into store                       │
│   B) Profile missing → Create automatically                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│ A: PROFILE EXISTS │              │ B: PROFILE MISSING│
├──────────────────┤              ├──────────────────┤
│ • data = {...}   │              │ • data = null    │
│ • error = null   │              │ • error = null   │
│                  │              │                  │
│ profile.value =  │              │ else if (!error) │
│   data           │              │   triggered      │
└──────────────────┘              └──────────────────┘
                                           ↓
                         ┌─────────────────────────────────┐
                         │ 6. CREATE MINIMAL PROFILE       │
                         ├─────────────────────────────────┤
                         │ const minimalProfile = {        │
                         │   id: user.value.id,            │
                         │   display_name: 'New User',     │
                         │   role: 'fan',                  │
                         │   is_public: true               │
                         │ }                               │
                         └─────────────────────────────────┘
                                        ↓
                         ┌─────────────────────────────────┐
                         │ 7. UPSERT TO DATABASE           │
                         ├─────────────────────────────────┤
                         │ updateProfile(minimalProfile)   │
                         │   ↓                             │
                         │ supabase.from('profiles')       │
                         │   .upsert(...)                  │
                         │   ↓                             │
                         │ INSERT new row (id doesn't      │
                         │ exist yet)                      │
                         └─────────────────────────────────┘
                                        ↓
                         ┌─────────────────────────────────┐
                         │ 8. PROFILE CREATED & LOADED     │
                         ├─────────────────────────────────┤
                         │ • Database returns inserted row │
                         │ • profile.value = created       │
                         │ • User now has a profile!       │
                         └─────────────────────────────────┘
                                        ↓
                                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. DASHBOARD RENDERS                                         │
├─────────────────────────────────────────────────────────────┤
│ • Profile available in profileStore.profile                 │
│ • Can display user info, role-based features                │
│ • Footer shows appropriate navigation (based on role)       │
└─────────────────────────────────────────────────────────────┘
```

### Timing Breakdown

| Step | Event | Time | Notes |
|------|-------|------|-------|
| 1 | Sign-in API call | 0ms | Network request starts |
| 2 | Session created | ~500ms | Varies by network |
| 3 | Watcher fires | ~510ms | Immediate after user ref update |
| 4 | Redirect to /dashboard | ~515ms | Router navigation |
| 5 | Dashboard mounted | ~600ms | Component lifecycle |
| 6 | fetchProfile() called | ~605ms | onMounted hook |
| 7 | Profile query | ~650ms | SELECT query |
| 8 | Profile creation (if needed) | ~750ms | UPSERT if missing |
| 9 | Dashboard renders with profile | ~800ms | Complete |

**Key Insight**: Profile creation happens **after** navigation to dashboard, not during sign-in.

---

## 6. Error Handling

### Scenario 1: Profile Doesn't Exist (First Sign-In)

**Database Result**:
```javascript
{ data: null, error: null }
```

**fetchProfile() Response**:
```typescript
else if (!error) {
  // Automatic creation triggered
}
```

**Outcome**: ✅ Profile automatically created

### Scenario 2: Profile Exists (Returning User)

**Database Result**:
```javascript
{ 
  data: {
    id: '...',
    display_name: 'John Doe',
    role: 'artist',
    // ... other fields
  },
  error: null 
}
```

**fetchProfile() Response**:
```typescript
if (data) {
  profile.value = data;
}
```

**Outcome**: ✅ Profile loaded into store

### Scenario 3: Database Error

**Database Result**:
```javascript
{ data: null, error: { message: '...' } }
```

**fetchProfile() Response**:
```typescript
// Neither if (data) nor else if (!error) triggers
// Profile remains null
```

**Outcome**: ⚠️ Profile not loaded, error returned to component

### Scenario 4: RLS Policy Violation

**updateProfile() Response**:
```typescript
if (error) {
  if ((error as any).code === '42501' || 
      `${error.message}`.includes('row-level security policy')) {
    lastErrorCode.value = 'USERNAME_TAKEN';
  }
}
```

**Outcome**: ⚠️ Error code set, profile creation failed

### RLS Policies

From `supabase/migrations/20240701_create_profiles_table.sql`:

```sql
-- Policy: Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

**Why automatic creation works**: 
- The INSERT policy allows `auth.uid() = id`
- When creating minimal profile, we set `id: user.value.id`
- This matches the authenticated user, so INSERT is allowed

---

## 7. Mobile Implementation Guide

### Exact Code to Replicate

#### Step 1: Create ProfileStore

```typescript
// stores/profileStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useSupabaseService } from '@/composables/useSupabaseService';

export const useProfileStore = defineStore('profileStore', () => {
  const { client: supabase, user } = useSupabaseService();
  const profile = ref<any>(null);
  const loading = ref(false);
  const lastErrorCode = ref<string | null>(null);

  async function fetchProfile() {
    if (!user.value) {
      console.log('fetchProfile: No user found');
      return { data: null, error: 'No user' };
    }
    
    console.log('fetchProfile: Fetching profile for user ID:', user.value.id);
    loading.value = true;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .maybeSingle(); // CRITICAL: Use maybeSingle, not single
    
    console.log('fetchProfile: Supabase result:', { data, error });
    
    if (data) {
      profile.value = data;
      console.log('fetchProfile: Profile loaded into store:', profile.value);
    } else if (!error) {
      // No profile exists; create a minimal default
      console.log('fetchProfile: No profile found, creating minimal default profile');
      const minimalProfile = {
        id: user.value.id,
        display_name: 'New User',
        role: 'fan',
        is_public: true
      } as any;
      const created = await updateProfile(minimalProfile);
      if (created) {
        profile.value = created;
      }
    }
    
    loading.value = false;
    return { data, error };
  }

  async function updateProfile(newProfile: any) {
    if (!user.value) {
      console.log('updateProfile: No user found');
      return null;
    }
    
    console.log('updateProfile: Updating profile for user ID:', user.value.id);
    console.log('updateProfile: Profile data:', newProfile);
    
    loading.value = true;
    
    // Remove fields not present in schema to avoid errors
    const { website, ...sanitized } = newProfile || {} as any;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...sanitized, id: user.value.id }, { onConflict: 'id' })
      .select()
      .single();
    
    console.log('updateProfile: Supabase upsert result:', { data, error });
    
    if (error) {
      console.error('updateProfile: Error occurred:', error);
      if ((error as any).code === '23505' || 
          (error as any).code === '42501' || 
          `${error.message || ''}`.toLowerCase().includes('unique') && 
          `${error.message || ''}`.toLowerCase().includes('username') ||
          `${error.message || ''}`.toLowerCase().includes('row-level security policy')) {
        lastErrorCode.value = 'USERNAME_TAKEN';
      } else {
        lastErrorCode.value = 'UNKNOWN_ERROR';
      }
      loading.value = false;
      return null;
    }
    
    if (data) {
      profile.value = data;
      lastErrorCode.value = null;
      console.log('updateProfile: Profile updated in store:', profile.value);
      loading.value = false;
      return data;
    }
    
    console.log('updateProfile: No data returned from upsert');
    loading.value = false;
    return null;
  }

  function clearProfile() {
    profile.value = null;
    lastErrorCode.value = null;
  }

  return {
    profile,
    loading,
    lastErrorCode,
    fetchProfile,
    updateProfile,
    clearProfile,
  };
});
```

#### Step 2: Call in Page Components

**Dashboard Page** (`pages/Dashboard.vue`):
```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProfileStore } from '@/stores/profileStore';
import { useSupabaseService } from '@/composables/useSupabaseService';

const profileStore = useProfileStore();
const { user } = useSupabaseService();

onMounted(async () => {
  if (user.value) {
    await profileStore.fetchProfile();
  }
});
</script>
```

**Footer Navigation** (`components/FooterNavigation.vue`):
```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

const authStore = useAuthStore();
const profileStore = useProfileStore();

onMounted(async () => {
  if (authStore.authenticatedUser) {
    await profileStore.fetchProfile();
  }
});
</script>
```

### Ionic/Capacitor Considerations

#### Storage Timing
```typescript
// In Dashboard page
onIonViewWillEnter(async () => {
  // Ionic lifecycle hook - better for navigation
  if (user.value) {
    await profileStore.fetchProfile();
  }
});
```

#### Loading States
```vue
<ion-content>
  <ion-spinner v-if="profileStore.loading" />
  <div v-else-if="profileStore.profile">
    <!-- Profile loaded -->
  </div>
  <div v-else>
    <!-- Error or no profile -->
  </div>
</ion-content>
```

### Common Mistakes to Avoid

❌ **Don't use `.single()` instead of `.maybeSingle()`**
```typescript
// WRONG - throws error if profile doesn't exist
.single()

// CORRECT - returns null if profile doesn't exist
.maybeSingle()
```

❌ **Don't call fetchProfile() in auth watcher**
```typescript
// WRONG - creates timing issues
watch(user, async (newUser) => {
  if (newUser) {
    await profileStore.fetchProfile(); // Don't do this
  }
});
```

✅ **Do call fetchProfile() in component onMounted**
```typescript
// CORRECT - component-based fetching
onMounted(async () => {
  if (user.value) {
    await profileStore.fetchProfile();
  }
});
```

❌ **Don't forget to check user.value before fetching**
```typescript
// WRONG - might fetch before user is loaded
await profileStore.fetchProfile();

// CORRECT - check user first
if (user.value) {
  await profileStore.fetchProfile();
}
```

---

## 8. Testing Profile Creation

### Test Checklist

- [ ] **New user sign-in**: Profile automatically created
- [ ] **Returning user sign-in**: Profile loaded from database
- [ ] **Default values**: `display_name: 'New User'`, `role: 'fan'`, `is_public: true`
- [ ] **Profile ID matches**: `profile.id === user.id`
- [ ] **No duplicate profiles**: Multiple sign-ins don't create duplicates
- [ ] **RLS policies**: User can only create/read/update their own profile
- [ ] **Error handling**: Database errors don't crash app
- [ ] **Loading states**: UI shows loading during fetch
- [ ] **Dashboard render**: Profile data available after fetch
- [ ] **Footer navigation**: Role-based nav items show correctly

### Testing Scenarios

#### Scenario 1: Brand New User

```
1. Sign up with email/password
2. Sign in for first time
3. Navigate to dashboard
4. ✅ Check: Profile created automatically
5. ✅ Check: display_name = 'New User'
6. ✅ Check: role = 'fan'
```

#### Scenario 2: Existing User

```
1. Sign in with existing account
2. Navigate to dashboard
3. ✅ Check: Profile loaded from database
4. ✅ Check: Custom display_name preserved
5. ✅ Check: Role preserved ('artist' or 'fan')
```

#### Scenario 3: Profile Update

```
1. Sign in
2. Go to account page
3. Update display_name
4. ✅ Check: Profile updated in database
5. Sign out and back in
6. ✅ Check: Updated name persists
```

### Debug Logging

Enable console logs to trace profile creation:

```typescript
console.log('fetchProfile: Fetching profile for user ID:', user.value.id);
console.log('fetchProfile: Supabase result:', { data, error });
console.log('fetchProfile: No profile found, creating minimal default profile');
console.log('updateProfile: Supabase upsert result:', { data, error });
```

Look for this sequence in console:
```
fetchProfile: Fetching profile for user ID: abc-123-def
fetchProfile: Supabase result: { data: null, error: null }
fetchProfile: No profile found, creating minimal default profile
updateProfile: Updating profile for user ID: abc-123-def
updateProfile: Profile data: { id: 'abc-123-def', display_name: 'New User', role: 'fan', is_public: true }
updateProfile: Supabase upsert result: { data: {...}, error: null }
fetchProfile: Profile loaded into store: {...}
```

---

## 9. Summary

### How It Works

1. ✅ **Component calls** `fetchProfile()` on mount
2. ✅ **Query database** with `.maybeSingle()` (returns null if not found)
3. ✅ **Check result**:
   - If `data` exists → Load profile
   - If `data` is null AND no error → Create profile
4. ✅ **Create profile** by calling `updateProfile()` with minimal defaults
5. ✅ **UPSERT** inserts new row (since ID doesn't exist yet)
6. ✅ **Store profile** in reactive ref for app-wide access

### Key Differences: Web vs Mobile

| Aspect | Web App | Mobile App |
|--------|---------|------------|
| **When fetched** | Component `onMounted()` | Same - use Ionic lifecycle hooks |
| **Storage** | `localStorage` | Capacitor Storage (async) |
| **Profile creation** | Automatic on first fetch | Same - replicate exactly |
| **Timing** | Immediate after mount | May need delay for storage |

### Critical Points

⭐ **Use `.maybeSingle()` not `.single()`** - Allows null without error  
⭐ **Automatic creation in `fetchProfile()`** - No separate create function needed  
⭐ **UPSERT handles both cases** - Insert if new, update if exists  
⭐ **Component-based fetching** - Not in auth watcher  
⭐ **Minimal defaults** - Only essential fields initially

---

**Reference**: For auth flow timing, see `AUTH_WATCHER_IMPLEMENTATION.md`  
**Reference**: For complete sign-in code, see `SIGNIN_PAGE_COMPLETE_CODE.md`

