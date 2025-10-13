# Upload Payloads and Storage - Web App Implementation Reference

**Document Purpose**: This document provides exact database insert payloads, storage paths, and RLS policies from the production web app for song uploads, enabling 1:1 parity in mobile app implementation.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `store/uploadStore.ts` (lines 313-414)
- `supabase/migrations/20240622_create_songs_table.sql` (complete file)

---

## Table of Contents

1. [Overview](#overview)
2. [Upload Flow Sequence](#upload-flow-sequence)
3. [Song ID Generation](#song-id-generation)
4. [Songs Table Insert](#songs-table-insert)
5. [Audio Fingerprints Insert](#audio-fingerprints-insert)
6. [Storage Configuration](#storage-configuration)
7. [RLS Policies](#rls-policies)
8. [Complete Code References](#complete-code-references)
9. [Payload Examples](#payload-examples)
10. [Implementation Checklist](#implementation-checklist)

---

## Overview

The song upload process involves multiple steps with specific database inserts and storage operations. Understanding the exact payloads and sequences is critical for mobile app parity.

**Key Characteristics:**
- **Song ID**: Client-generated UUID (not database-generated)
- **Dual Inserts**: Songs table first, then audio_fingerprints
- **Storage Path**: Convention-based (`songs/{uuid}.{ext}`)
- **Public Access**: All audio files are publicly readable
- **Non-blocking Fingerprint**: Fingerprint insert can fail without failing upload

**Upload Success Criteria**:
1. ✅ File uploaded to storage
2. ✅ Songs record inserted
3. ⚠️ Audio fingerprint inserted (optional, non-fatal)

---

## Upload Flow Sequence

### Complete Flow

```
1. Generate Song ID
   ↓
   const songDbId = uuidv4()
   
2. Generate Audio Fingerprint
   ↓
   SHA-256 hash of audio file
   
3. Check for Duplicates
   ↓
   supabase.rpc('check_audio_fingerprint', { p_fingerprint_hash })
   
4. Convert File (if needed)
   ↓
   WAV → MP3 conversion (client-side)
   
5. Upload to Storage
   ↓
   Bucket: 'song-audio'
   Path: songs/{songDbId}.mp3
   
6. Get Public URL
   ↓
   supabase.storage.from('song-audio').getPublicUrl(storagePath)
   
7. Insert Songs Record
   ↓
   All fields including client-generated ID
   
8. Insert Audio Fingerprint (non-blocking)
   ↓
   fingerprint_hash + song_id
```

### Timing and Dependencies

| Step | Depends On | Blocking | Can Fail Upload |
|------|-----------|----------|-----------------|
| Generate ID | None | No | N/A |
| Generate Fingerprint | File selected | No | Yes (blocks early) |
| Check Duplicates | Fingerprint | Yes | Yes (duplicate found) |
| Convert File | File selected | Yes | Yes (WAV conversion required) |
| Upload Storage | Converted file | Yes | Yes (storage error) |
| Get Public URL | Storage upload | Yes | Yes (URL needed for DB) |
| Insert Songs | Public URL | Yes | Yes (main record) |
| Insert Fingerprint | Songs insert | No | **No** (non-fatal) |

---

## Song ID Generation

### Client-Side UUID Generation

**Location**: `store/uploadStore.ts` (line 316)

```typescript
const songDbId = uuidv4();
```

**Package**: `uuid` package (imported as `uuidv4` from 'uuid')

**When**: Generated **before** storage upload

**Used For**:
1. Songs table `id` field
2. Storage path: `songs/{songDbId}.mp3`
3. Audio fingerprints `song_id` field

### Why Client-Generated?

**Reason**: The ID is needed to construct the storage path **before** the database insert. Since the file must be uploaded first (to get the URL), we need the ID upfront.

**Alternative Approaches NOT Used**:
- ❌ Database-generated UUID (would require insert before upload)
- ❌ Temporary filename then rename (unnecessary complexity)
- ❌ Separate ID for storage vs database (data inconsistency)

### Example IDs

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890
f8e7d6c5-b4a3-2109-8765-43210fedcba9
12345678-90ab-cdef-1234-567890abcdef
```

**Format**: Standard UUID v4 (RFC 4122)

---

## Songs Table Insert

### Complete Payload

**Location**: `store/uploadStore.ts` (lines 355-379)

```typescript
{
  id: songDbId,                    // uuid - CLIENT-GENERATED
  user_id: user.value.id,          // uuid - from auth.uid()
  title: title,                    // text - user input
  artist: artist,                  // text - user input
  filename: processedFile.name,    // text - processed filename
  url: publicFileUrl,              // text - full public URL
  genre: genre,                    // text - user selection
  is_active: true,                 // boolean - hardcoded
  churn_start_date: getNextMonday(), // timestamptz - calculated
  likes: 0,                        // integer - hardcoded
  dislikes: 0,                     // integer - hardcoded
  churnState: {                    // jsonb - initial state
    week: 0,
    countdownStartDate: null,
    weeksInChurn: 0,
    finalScore: null
  },
  clip_start_time: clipStart,      // numeric - user selection
  rights_confirmed: true           // boolean - hardcoded
  // created_at: NOT SENT (DB default)
  // last_score_update: NOT SENT (DB default)
}
```

### Field-by-Field Breakdown

#### 1. id (uuid)

| Property | Value |
|----------|-------|
| **Type** | uuid |
| **Source** | Client-generated via `uuidv4()` |
| **When** | Before storage upload (line 316) |
| **Required** | Yes |
| **Example** | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |

**Code**:
```typescript
const songDbId = uuidv4();
```

#### 2. user_id (uuid)

| Property | Value |
|----------|-------|
| **Type** | uuid |
| **Source** | `user.value.id` from Supabase auth |
| **When** | From authenticated session |
| **Required** | Yes (enforced by RLS) |
| **Example** | `"b2c3d4e5-f6a7-8901-bcde-f123456789ab"` |

**Code**:
```typescript
user_id: user.value.id
```

**Validation**: Must match `auth.uid()` (enforced by RLS policy)

#### 3. title (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | User input (required field) |
| **Validation** | `title.trim()` must be non-empty |
| **Max Length** | No explicit limit in schema |
| **Example** | `"Rabbit Hole"` |

**Code**:
```typescript
title: title
```

#### 4. artist (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | User input (required field) |
| **Validation** | `artist.trim()` must be non-empty |
| **Max Length** | No explicit limit in schema |
| **Example** | `"The Artist Name"` |

**Code**:
```typescript
artist: artist
```

#### 5. filename (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | `processedFile.name` |
| **Format** | Display filename after conversion |
| **Extension** | `.mp3` if converted from WAV |
| **Example** | `"Rabbit-Hole.mp3"` |

**Code**:
```typescript
filename: processedFile.name
```

**Important**: This is the **processed** filename (after WAV→MP3 conversion), not the original upload filename.

#### 6. url (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | `supabase.storage.from('song-audio').getPublicUrl(storagePath)` |
| **Format** | Full public HTTPS URL |
| **Example** | `"https://xyz.supabase.co/storage/v1/object/public/song-audio/songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3"` |

**Code**:
```typescript
const publicFileUrl = supabase.storage
  .from('song-audio')
  .getPublicUrl(storagePath).data.publicUrl;

// Then in insert:
url: publicFileUrl
```

#### 7. genre (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | User selection from dropdown |
| **Options** | From MASTER_GENRES list |
| **Validation** | Must be non-empty |
| **Example** | `"Rock"`, `"Pop"`, `"Hip-Hop"` |

**Code**:
```typescript
genre: genre
```

#### 8. is_active (boolean)

| Property | Value |
|----------|-------|
| **Type** | boolean |
| **Source** | Hardcoded |
| **Value** | Always `true` |
| **Purpose** | Marks song as active for battles |

**Code**:
```typescript
is_active: true
```

#### 9. churn_start_date (timestamptz)

| Property | Value |
|----------|-------|
| **Type** | timestamp with time zone |
| **Source** | Calculated - next Monday at midnight |
| **Format** | ISO 8601 string |
| **Example** | `"2025-01-20T00:00:00.000Z"` |

**Code** (lines 344-352):
```typescript
const getNextMonday = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1
  const daysUntilMonday = (8 - dayOfWeek) % 7; // Days until next Monday
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // Set to midnight
  return nextMonday.toISOString();
};

// Then in insert:
churn_start_date: getNextMonday()
```

**Algorithm**:
1. Get current day of week (0 = Sunday, 1 = Monday, etc.)
2. Calculate days until next Monday: `(8 - dayOfWeek) % 7`
3. Add days to current date
4. Set time to 00:00:00.000
5. Convert to ISO string

**Examples**:
- Upload on Monday → Next Monday (7 days later)
- Upload on Tuesday → Next Monday (6 days later)
- Upload on Sunday → Next Monday (1 day later)

#### 10. likes (integer)

| Property | Value |
|----------|-------|
| **Type** | integer |
| **Source** | Hardcoded |
| **Value** | Always `0` |
| **Purpose** | Initial like count |

**Code**:
```typescript
likes: 0
```

#### 11. dislikes (integer)

| Property | Value |
|----------|-------|
| **Type** | integer |
| **Source** | Hardcoded |
| **Value** | Always `0` |
| **Purpose** | Initial dislike count |

**Code**:
```typescript
dislikes: 0
```

#### 12. churnState (jsonb)

| Property | Value |
|----------|-------|
| **Type** | jsonb |
| **Source** | Hardcoded object structure |
| **Format** | JSON object with specific fields |

**Code**:
```typescript
churnState: {
  week: 0,
  countdownStartDate: null,
  weeksInChurn: 0,
  finalScore: null
}
```

**Field Details**:
- `week`: `0` (starting week)
- `countdownStartDate`: `null` (no countdown yet)
- `weeksInChurn`: `0` (hasn't been in churn)
- `finalScore`: `null` (no final score yet)

**Note**: This differs from the DB default in the schema (which has `week: 4`). The client **overrides** the default.

#### 13. clip_start_time (numeric)

| Property | Value |
|----------|-------|
| **Type** | numeric (can store decimals) |
| **Source** | User selection via waveform selector |
| **Unit** | Seconds |
| **Default** | `0` if not selected |
| **Range** | Typically 0 to (song_length - 30) |
| **Example** | `0`, `15.5`, `30` |

**Code**:
```typescript
clip_start_time: clipStart
```

**Purpose**: Marks where the 30-second battle clip starts in the song.

#### 14. rights_confirmed (boolean)

| Property | Value |
|----------|-------|
| **Type** | boolean |
| **Source** | Hardcoded (validated before upload) |
| **Value** | Always `true` |
| **Validation** | Checked pre-upload (lines 186-190) |

**Code**:
```typescript
rights_confirmed: true
```

**Pre-upload Validation**:
```typescript
if (!rightsConfirmed) {
  uploadMessage.value = 'You must confirm you have the rights to upload this song.';
  isSuccess.value = false;
  return false;
}
```

#### 15. created_at (timestamptz) - NOT SENT

| Property | Value |
|----------|-------|
| **Type** | timestamp with time zone |
| **Source** | Database default |
| **Value** | `now()` |
| **Sent in Insert?** | **NO** |

**Reason**: Uses DB default, no need to send from client.

#### 16. last_score_update (timestamptz) - NOT SENT

| Property | Value |
|----------|-------|
| **Type** | timestamp with time zone |
| **Source** | Database default |
| **Value** | `now()` |
| **Sent in Insert?** | **NO** |

**Reason**: Uses DB default, no need to send from client.

### Fields Summary Table

| Field | Type | Source | Value | Sent? |
|-------|------|--------|-------|-------|
| `id` | uuid | Client | `uuidv4()` | ✅ Yes |
| `user_id` | uuid | Auth | `user.value.id` | ✅ Yes |
| `title` | text | User Input | e.g., "Song Title" | ✅ Yes |
| `artist` | text | User Input | e.g., "Artist Name" | ✅ Yes |
| `filename` | text | File | `processedFile.name` | ✅ Yes |
| `url` | text | Storage | Public URL | ✅ Yes |
| `genre` | text | User Input | e.g., "Rock" | ✅ Yes |
| `is_active` | boolean | Hardcoded | `true` | ✅ Yes |
| `churn_start_date` | timestamptz | Calculated | Next Monday | ✅ Yes |
| `likes` | integer | Hardcoded | `0` | ✅ Yes |
| `dislikes` | integer | Hardcoded | `0` | ✅ Yes |
| `churnState` | jsonb | Hardcoded | `{week: 0, ...}` | ✅ Yes |
| `clip_start_time` | numeric | User Input | e.g., `0`, `15` | ✅ Yes |
| `rights_confirmed` | boolean | Hardcoded | `true` | ✅ Yes |
| `created_at` | timestamptz | DB Default | `now()` | ❌ No |
| `last_score_update` | timestamptz | DB Default | `now()` | ❌ No |

---

## Audio Fingerprints Insert

### Complete Payload

**Location**: `store/uploadStore.ts` (lines 399-404)

```typescript
{
  fingerprint_hash: fingerprint.value,  // text - SHA-256 hash
  song_id: songDbId                     // uuid - same as songs.id
}
```

### Field Details

#### 1. fingerprint_hash (text)

| Property | Value |
|----------|-------|
| **Type** | text |
| **Source** | SHA-256 hash of audio file |
| **Format** | Hex string (64 characters) |
| **Generated** | Before upload, during file selection |
| **Example** | `"a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890"` |

**Purpose**: Unique identifier for audio content (duplicate detection)

#### 2. song_id (uuid)

| Property | Value |
|----------|-------|
| **Type** | uuid |
| **Source** | Same ID generated for songs table |
| **References** | `songs.id` |
| **Example** | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |

**Purpose**: Links fingerprint to song record

### Fields NOT Sent (DB Defaults)

#### 3. id (uuid)

| Property | Value |
|----------|-------|
| **Type** | uuid |
| **Source** | Database default |
| **Value** | `gen_random_uuid()` |
| **Sent?** | **NO** |

#### 4. created_at (timestamptz)

| Property | Value |
|----------|-------|
| **Type** | timestamp with time zone |
| **Source** | Database default |
| **Value** | `now()` |
| **Sent?** | **NO** |

### Table Schema

**From**: `docs/SUPABASE_DATABASE_SCHEMA.md`

```sql
CREATE TABLE audio_fingerprints (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint_hash text NOT NULL UNIQUE,
  song_id uuid NULLABLE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
```

**Constraints**:
- `fingerprint_hash` is UNIQUE (prevents duplicate audio)
- `song_id` is NULLABLE (fingerprint can exist without song)

### Timing and Error Handling

**When**: **AFTER** songs insert succeeds (lines 396-411)

**Error Handling**:
```typescript
if (fingerprintError) {
  console.error('Failed to store audio fingerprint:', fingerprintError);
  // Don't fail the upload for this, just log it
} else {
  console.log('Audio fingerprint stored successfully');
}
```

**Important**: Fingerprint insert failure does **NOT** fail the upload. Song upload is considered successful even if fingerprint insert fails.

**Why Non-Fatal**: 
- Fingerprint is for duplicate detection
- Song is already uploaded and playable
- Fingerprint can be regenerated later if needed

---

## Storage Configuration

### Bucket Name

**Exact String**: `'song-audio'`

**Code** (line 321):
```typescript
.from('song-audio')
```

**Important**: Case-sensitive, no variations

### Storage Path Format

**Pattern**: `songs/{uuid}.{extension}`

**Code** (lines 315-317):
```typescript
const fileExtension = processedFile.name.split('.').pop();
const songDbId = uuidv4();
const storagePath = `songs/${songDbId}.${fileExtension}`;
```

**Components**:
1. **Directory**: Always `songs/` (lowercase, with trailing slash)
2. **UUID**: Client-generated song ID
3. **Dot**: Literal `.`
4. **Extension**: From processed filename (typically `mp3`)

**Examples**:
```
songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3
songs/f8e7d6c5-b4a3-2109-8765-43210fedcba9.mp3
songs/12345678-90ab-cdef-1234-567890abcdef.mp3
```

### File Extension Handling

**Source**: `processedFile.name.split('.').pop()`

**After WAV Conversion**: Extension is `.mp3` (from converted file)

**Other Formats**: Uses original extension (`.m4a`, `.aac`, etc.)

### Upload Options

**Location**: `store/uploadStore.ts` (lines 320-326)

```typescript
const { data: storageData, error: storageError } = await supabase.storage
  .from('song-audio')
  .upload(storagePath, processedFile, {
    cacheControl: '3600',
    upsert: false,
    contentType: processedFile.type || 'application/octet-stream',
  });
```

#### Upload Options Table

| Option | Value | Purpose |
|--------|-------|---------|
| `cacheControl` | `'3600'` | Cache for 1 hour (3600 seconds) |
| `upsert` | `false` | Fail if file already exists (no overwrite) |
| `contentType` | `processedFile.type` or `'application/octet-stream'` | MIME type for HTTP headers |

**Content Type Examples**:
- MP3: `'audio/mpeg'`
- M4A: `'audio/mp4'` or `'audio/x-m4a'`
- Fallback: `'application/octet-stream'`

### Public URL Format

**Code** (lines 336-338):
```typescript
const publicFileUrl = supabase.storage
  .from('song-audio')
  .getPublicUrl(storagePath).data.publicUrl;
```

**Format**:
```
https://{project_ref}.supabase.co/storage/v1/object/public/song-audio/songs/{uuid}.{ext}
```

**Example**:
```
https://abcdefghijklmnop.supabase.co/storage/v1/object/public/song-audio/songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3
```

**Components**:
- Protocol: `https://`
- Domain: `{project_ref}.supabase.co`
- Path: `/storage/v1/object/public/{bucket}/{path}`

**Usage**: This URL is stored in `songs.url` field and used for playback.

---

## RLS Policies

### Songs Table Policies

**Location**: `supabase/migrations/20240622_create_songs_table.sql` (lines 26-39)

#### INSERT Policy

```sql
CREATE POLICY "Allow authenticated users to insert own song"
ON public.songs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Allows**:
- Authenticated users only
- `user_id` must match `auth.uid()`

**Enforces**: Users can only upload songs under their own user ID

#### SELECT Policy

```sql
CREATE POLICY "Allow authenticated read access to all songs"
ON public.songs FOR SELECT
TO authenticated
USING (true);
```

**Allows**:
- All authenticated users
- Can view all songs (no user restrictions)

**Purpose**: Battle system needs access to all songs

### Storage Policies

**Location**: `supabase/migrations/20240622_create_songs_table.sql` (lines 41-56)

#### INSERT Policy (Upload)

```sql
CREATE POLICY "Allow authenticated uploads to song-audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'song-audio' AND auth.uid() IS NOT NULL
);
```

**Allows**:
- Authenticated users only
- Uploads to `song-audio` bucket only

**Does NOT Enforce**:
- ❌ Path restrictions (e.g., must be under `songs/*`)
- ❌ User-specific paths
- ❌ File naming conventions

**Important**: The `songs/` path is **convention-based**, not enforced by policy.

#### SELECT Policy (Download)

```sql
CREATE POLICY "Allow public read access to song-audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'song-audio'
);
```

**Allows**:
- **Public access** (no authentication required)
- All files in `song-audio` bucket

**Purpose**: Battle system and anonymous users can play songs without login.

### Policy Summary Table

| Table/Bucket | Operation | Who | Restrictions |
|--------------|-----------|-----|--------------|
| `songs` | INSERT | Authenticated | `user_id = auth.uid()` |
| `songs` | SELECT | Authenticated | None (all songs) |
| `storage.objects` | INSERT | Authenticated | `bucket_id = 'song-audio'` |
| `storage.objects` | SELECT | **Public** | `bucket_id = 'song-audio'` |

---

## Complete Code References

### Primary File: store/uploadStore.ts

#### Song ID Generation (line 316)

```typescript
const songDbId = uuidv4();
```

#### Storage Path Generation (lines 315-317)

```typescript
const fileExtension = processedFile.name.split('.').pop();
const songDbId = uuidv4();
const storagePath = `songs/${songDbId}.${fileExtension}`;
```

#### Storage Upload (lines 320-326)

```typescript
const { data: storageData, error: storageError } = await supabase.storage
  .from('song-audio')
  .upload(storagePath, processedFile, {
    cacheControl: '3600',
    upsert: false,
    contentType: processedFile.type || 'application/octet-stream',
  });
```

#### Public URL Retrieval (lines 336-338)

```typescript
const publicFileUrl = supabase.storage
  .from('song-audio')
  .getPublicUrl(storagePath).data.publicUrl;
```

#### Next Monday Calculation (lines 344-352)

```typescript
const getNextMonday = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // Sunday = 0, Monday = 1
  const daysUntilMonday = (8 - dayOfWeek) % 7; // Days until next Monday
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // Set to midnight
  return nextMonday.toISOString();
};
```

#### Songs Insert (lines 355-379)

```typescript
const { data: dbData, error: dbError } = await supabase
  .from('songs').insert(
    {
      id: songDbId, 
      user_id: user.value.id, 
      title: title,
      artist: artist,
      filename: processedFile.name,
      url: publicFileUrl,
      genre: genre,
      is_active: true,
      churn_start_date: getNextMonday(),
      likes: 0,
      dislikes: 0,
      churnState: {
        week: 0,
        countdownStartDate: null,
        weeksInChurn: 0,
        finalScore: null,
      },
      clip_start_time: clipStart,
      rights_confirmed: true,
    }
  )
```

#### Audio Fingerprints Insert (lines 399-404)

```typescript
const { error: fingerprintError } = await supabase
  .from('audio_fingerprints')
  .insert({
    fingerprint_hash: fingerprint.value,
    song_id: songDbId
  });
```

### Migration File: 20240622_create_songs_table.sql

#### Songs Table Schema (lines 4-22)

```sql
CREATE TABLE public.songs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    title text NOT NULL,
    artist text NOT NULL,
    filename text,
    url text,
    likes integer NOT NULL DEFAULT 0,
    dislikes integer NOT NULL DEFAULT 0,
    "churnState" jsonb DEFAULT '{
        "week": 4,
        "countdownStartDate": null,
        "weeksInChurn": 0,
        "finalScore": null
    }'::jsonb,
    CONSTRAINT songs_pkey PRIMARY KEY (id),
    CONSTRAINT songs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);
```

#### Songs RLS Policies (lines 30-39)

```sql
CREATE POLICY "Allow authenticated users to insert own song"
ON public.songs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated read access to all songs"
ON public.songs FOR SELECT
TO authenticated
USING (true);
```

#### Storage RLS Policies (lines 44-56)

```sql
CREATE POLICY "Allow authenticated uploads to song-audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'song-audio' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Allow public read access to song-audio"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'song-audio'
);
```

---

## Payload Examples

### Example 1: Complete Song Upload

#### Input Data

```typescript
// User selections
const title = "Rabbit Hole"
const artist = "The Wanderer"
const genre = "Rock"
const clipStart = 15  // seconds
const processedFile = {
  name: "Rabbit-Hole.mp3",
  size: 5242880,
  type: "audio/mpeg"
}
```

#### Generated Values

```typescript
// Client-generated
const songDbId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
const fingerprint = "abc123def456789...64char hash..."

// Calculated
const storagePath = "songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3"
const publicFileUrl = "https://xyz.supabase.co/storage/v1/object/public/song-audio/songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3"
const churnStartDate = "2025-01-20T00:00:00.000Z"  // Next Monday

// From auth
const userId = "b2c3d4e5-f6a7-8901-bcde-f123456789ab"
```

#### Songs Table Insert

```typescript
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  user_id: "b2c3d4e5-f6a7-8901-bcde-f123456789ab",
  title: "Rabbit Hole",
  artist: "The Wanderer",
  filename: "Rabbit-Hole.mp3",
  url: "https://xyz.supabase.co/storage/v1/object/public/song-audio/songs/a1b2c3d4-e5f6-7890-abcd-ef1234567890.mp3",
  genre: "Rock",
  is_active: true,
  churn_start_date: "2025-01-20T00:00:00.000Z",
  likes: 0,
  dislikes: 0,
  churnState: {
    week: 0,
    countdownStartDate: null,
    weeksInChurn: 0,
    finalScore: null
  },
  clip_start_time: 15,
  rights_confirmed: true
}
```

#### Audio Fingerprints Insert

```typescript
{
  fingerprint_hash: "abc123def456789abc123def456789abc123def456789abc123def456789abcd",
  song_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Example 2: WAV Conversion Case

#### Original File

```
Filename: "awesome-track.wav"
Size: 52,428,800 bytes (50 MB)
Type: "audio/wav"
```

#### After Conversion

```
Filename: "awesome-track.mp3"
Size: 5,242,880 bytes (5 MB)
Type: "audio/mpeg"
```

#### Storage Path

```
songs/f8e7d6c5-b4a3-2109-8765-43210fedcba9.mp3
```

**Note**: Extension is `.mp3` (from converted file), not `.wav`

#### Database Record

```typescript
{
  filename: "awesome-track.mp3",  // ← Converted filename
  url: "https://xyz.supabase.co/storage/v1/object/public/song-audio/songs/f8e7d6c5-b4a3-2109-8765-43210fedcba9.mp3",
  // ... other fields
}
```

---

## Implementation Checklist

### Pre-Upload

- [ ] Import uuid package: `import { v4 as uuidv4 } from 'uuid'`
- [ ] Validate user is authenticated
- [ ] Validate title, artist, genre are non-empty
- [ ] Validate rights confirmation checkbox is checked
- [ ] Generate audio fingerprint (SHA-256 of file)
- [ ] Check for duplicates via RPC: `check_audio_fingerprint`

### Song ID Generation

- [ ] Generate UUID: `const songDbId = uuidv4()`
- [ ] Use same ID for songs.id and storage path
- [ ] Use same ID for audio_fingerprints.song_id

### File Processing

- [ ] Check if conversion needed (WAV files)
- [ ] Convert WAV to MP3 if needed
- [ ] Extract file extension from processed file
- [ ] Use processed filename (not original)

### Storage Upload

- [ ] Construct path: `songs/${songDbId}.${extension}`
- [ ] Upload to bucket: `'song-audio'`
- [ ] Set options: `cacheControl: '3600'`, `upsert: false`
- [ ] Set contentType from file or default
- [ ] Handle storage errors

### Public URL

- [ ] Get public URL from storage
- [ ] Use exact format returned by `getPublicUrl()`
- [ ] Store full URL in database

### Next Monday Calculation

- [ ] Get current day of week
- [ ] Calculate days until next Monday: `(8 - dayOfWeek) % 7`
- [ ] Set date to next Monday
- [ ] Set time to 00:00:00.000
- [ ] Convert to ISO string

### Songs Insert

- [ ] Include all 14 sent fields
- [ ] Use client-generated `id`
- [ ] Use authenticated `user_id`
- [ ] Set `is_active: true`
- [ ] Set `likes: 0` and `dislikes: 0`
- [ ] Include churnState object (week: 0, etc.)
- [ ] Include `clip_start_time`
- [ ] Set `rights_confirmed: true`
- [ ] Do NOT send `created_at` or `last_score_update`
- [ ] Handle database errors

### Audio Fingerprints Insert

- [ ] Insert AFTER songs insert succeeds
- [ ] Include `fingerprint_hash` and `song_id`
- [ ] Do NOT send `id` or `created_at`
- [ ] Log errors but don't fail upload
- [ ] Treat as non-blocking operation

### Error Handling

- [ ] Check storage upload errors
- [ ] Check songs insert errors
- [ ] Log fingerprint errors (non-fatal)
- [ ] Provide user feedback for all errors
- [ ] Clean up storage on database failure (optional)

### Post-Upload

- [ ] Clear form fields
- [ ] Reset upload state
- [ ] Show success message
- [ ] Redirect to My Songs page
- [ ] Clear audio fingerprint state

---

## Important Notes

### Client-Generated ID

**Critical**: The song ID is generated on the client BEFORE upload. This is necessary because the ID is used in the storage path, and the file must be uploaded before the database insert (to get the public URL).

### Filename After Conversion

**Important**: The `filename` field stores the **processed** filename, which will be `.mp3` if the file was converted from WAV. This is the filename that matches the storage file.

### Public Storage Access

**Security Note**: All audio files in the `song-audio` bucket are publicly accessible without authentication. This is intentional to allow battle playback without login.

### Non-Fatal Fingerprint Insert

**Design Choice**: The audio fingerprint insert can fail without failing the upload. The song is still uploaded and playable. The fingerprint is only used for duplicate detection during upload.

### No Path Restrictions

**Important**: The storage policy does NOT enforce the `songs/` path convention. Any authenticated user can upload to any path in the `song-audio` bucket. The `songs/` directory is a convention followed by the client code.

### churnState Override

**Note**: The client sends `churnState: { week: 0, ... }` which overrides the database default of `{ week: 4, ... }`. This is intentional - new songs start at week 0.

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `store/uploadStore.ts`
- **Migration File**: `supabase/migrations/20240622_create_songs_table.sql`
- **Database Schema**: `docs/SUPABASE_DATABASE_SCHEMA.md`

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

