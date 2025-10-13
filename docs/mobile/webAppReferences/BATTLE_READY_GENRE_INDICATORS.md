# Battle-Ready Genre Indicators - Web App Implementation Reference

**Document Purpose**: This document provides exact implementation details of the battle-ready genre indicators (●/○) from the production web app, enabling mobile app troubleshooting and achieving display parity.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `components/dashboard/songUploader.vue` (lines 105-124, 413-440)
- `supabase/migrations/20250818_add_flagging_system.sql` (lines 131-147)

---

## Table of Contents

1. [Overview](#overview)
2. [Mobile Issue Diagnosis](#mobile-issue-diagnosis)
3. [RPC Function Specification](#rpc-function-specification)
4. [Frontend Data Processing](#frontend-data-processing)
5. [Battle-Ready Check Function](#battle-ready-check-function)
6. [UI Implementation](#ui-implementation)
7. [Complete Data Flow](#complete-data-flow)
8. [State Management](#state-management)
9. [Complete Code References](#complete-code-references)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Implementation Checklist](#implementation-checklist)

---

## Overview

The web app displays **battle-ready indicators** in the genre dropdown to show users which genres have enough songs for battles. This helps users choose genres that will get them into battles quickly.

**Visual Indicators**:
- `●` (filled circle) - Genre has ≥2 live songs (battle-ready)
- `○` (empty circle) - Genre has <2 live songs (not ready)

**How It Works**:
1. RPC returns genres with enough songs
2. Frontend extracts genre names into string array
3. Dropdown checks each genre against array
4. Appends appropriate indicator

**Example**:
```
Rock ●
Pop ●
Jazz ○
Classical ○
```

---

## Mobile Issue Diagnosis

### Your Reported Issue

**Symptoms**:
- ✅ RPC call works and returns data: `[{genre: "Funk"}, {genre: "Rock"}]`
- ❌ All genres show `○` instead of `●`
- ❌ Even confirmed battle-ready genres show as not ready

### Root Cause: Object vs String Storage

**The Problem**: Your mobile app is likely storing the **entire objects** instead of extracting the genre strings.

#### Wrong Implementation ❌

```typescript
const { data } = await supabase.rpc('get_battle_available_genres')
battleReadyGenres.value = data  // Stores objects!
```

**Result**:
```typescript
battleReadyGenres = [
  { genre: "Funk" },
  { genre: "Rock" }
]
```

**Then checking**:
```typescript
battleReadyGenres.includes("Funk")  // false! ❌
```

**Why False**: You're comparing string `"Funk"` against objects `{ genre: "Funk" }`. They're not equal!

#### Correct Implementation ✅

```typescript
const { data } = await supabase.rpc('get_battle_available_genres')
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

**Result**:
```typescript
battleReadyGenres = ["Funk", "Rock"]
```

**Then checking**:
```typescript
battleReadyGenres.includes("Funk")  // true! ✅
```

**Why True**: Comparing string to string works correctly!

### The Fix

**Add this single line** to extract genre strings:

```typescript
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

**Critical**: The `.map((item: any) => item.genre)` extracts the genre property from each object.

---

## RPC Function Specification

### Function Definition

**Location**: `supabase/migrations/20250818_add_flagging_system.sql` (lines 131-147)

```sql
CREATE OR REPLACE FUNCTION public.get_battle_available_genres()
RETURNS TABLE(genre text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT s.genre
  FROM public.songs s
  WHERE s.status = 'live' 
    AND s.genre IS NOT NULL 
    AND s.genre != ''
  GROUP BY s.genre
  HAVING COUNT(*) >= 2
  ORDER BY s.genre;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_battle_available_genres() TO authenticated;
```

### Function Details

| Property | Value |
|----------|-------|
| **Function Name** | `get_battle_available_genres` |
| **Return Type** | `TABLE(genre text)` |
| **Security** | `SECURITY DEFINER` |
| **Permissions** | Granted to `authenticated` |

### SQL Logic

**Filters**:
1. `s.status = 'live'` - Only live songs
2. `s.genre IS NOT NULL` - Genre must exist
3. `s.genre != ''` - Genre must not be empty string

**Grouping**: `GROUP BY s.genre`

**Minimum Songs**: `HAVING COUNT(*) >= 2`

**Purpose**: A genre needs at least 2 live songs to be battle-ready (can create battles)

**Sorting**: `ORDER BY s.genre` (alphabetical)

### Response Format

**Return Type**: PostgreSQL returns `TABLE(genre text)` which JavaScript receives as:

```typescript
[
  { genre: "Alternative" },
  { genre: "Electronic" },
  { genre: "Funk" },
  { genre: "Rock" }
]
```

**NOT These Formats**:
- ❌ Array of strings: `["Funk", "Rock"]`
- ❌ Objects with flags: `[{ genre: "Funk", is_battle_ready: true }]`
- ❌ Flat structure: `{ genres: ["Funk"] }`

**Why Objects**: PostgreSQL `TABLE` return type is serialized as array of objects with column names as properties.

---

## Frontend Data Processing

### Complete Function

**Location**: `components/dashboard/songUploader.vue` (lines 419-435)

```typescript
// Battle-ready genres for status indicators
const battleReadyGenres = ref<string[]>([])

// Fetch battle-ready genres
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}
```

### Step-by-Step Processing

#### Step 1: Call RPC

```typescript
const { data, error } = await supabase.rpc('get_battle_available_genres')
```

**Returns**:
- `data`: Array of objects or `null`
- `error`: Error object or `null`

#### Step 2: Handle Errors

```typescript
if (error) {
  console.error('Error fetching battle-ready genres:', error)
  battleReadyGenres.value = []
  return
}
```

**Action**: Set empty array and return early if error

#### Step 3: Extract Genre Strings

```typescript
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

**Critical Line**: This is where the transformation happens!

**Breakdown**:
- `data?` - Optional chaining (handles null/undefined)
- `.map((item: any) => item.genre)` - Extract `genre` property from each object
- `|| []` - Fallback to empty array if data is null/undefined

**Example Transformation**:

**Input** (from RPC):
```typescript
[
  { genre: "Funk" },
  { genre: "Rock" },
  { genre: "Electronic" }
]
```

**Output** (stored in state):
```typescript
["Funk", "Rock", "Electronic"]
```

#### Step 4: Exception Handling

```typescript
} catch (error) {
  console.error('Error fetching battle-ready genres:', error)
  battleReadyGenres.value = []
}
```

**Action**: Set empty array on any exception

### Data Type

**State Declaration** (line 416):
```typescript
const battleReadyGenres = ref<string[]>([])
```

**Type**: `string[]` (array of strings)

**Why Strings**: Enables fast `includes()` lookup for indicator rendering

---

## Battle-Ready Check Function

### Complete Function

**Location**: `components/dashboard/songUploader.vue` (lines 438-440)

```typescript
// Check if genre is battle-ready
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

### Function Details

**Input**: `genre: string` - Genre name to check

**Output**: `boolean` - True if battle-ready, false otherwise

**Logic**: Simple array lookup using `includes()`

### Examples

**Scenario 1**: Battle-ready genre

```typescript
battleReadyGenres.value = ["Funk", "Rock", "Electronic"]

isBattleReady("Funk")       // true ✅
isBattleReady("Rock")       // true ✅
isBattleReady("Electronic") // true ✅
```

**Scenario 2**: Not battle-ready

```typescript
battleReadyGenres.value = ["Funk", "Rock"]

isBattleReady("Jazz")       // false ❌
isBattleReady("Classical")  // false ❌
isBattleReady("Country")    // false ❌
```

**Scenario 3**: Case sensitivity

```typescript
battleReadyGenres.value = ["Funk", "Rock"]

isBattleReady("funk")       // false ❌ (case matters!)
isBattleReady("Funk")       // true ✅
```

**Important**: The check is **case-sensitive**. Genre names must match exactly.

### Why includes()?

**Performance**: `O(n)` lookup, acceptable for small arrays (~10-20 genres)

**Simplicity**: Clear, readable code

**Alternative NOT Used**: Set data structure (faster lookup but unnecessary complexity)

---

## UI Implementation

### Genre Dropdown

**Location**: `components/dashboard/songUploader.vue` (lines 105-124)

```vue
<!-- Genre -->
<div>
  <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
  <select
    v-model="songGenre"
    class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
  >
    <option value="" disabled class="theme-bg-card">Select Genre</option>
    <option 
      v-for="genre in genres" 
      :key="genre" 
      :value="genre" 
      class="theme-bg-card theme-text-primary"
    >
      {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
    </option>
  </select>
</div>
```

### Indicator Rendering

**Code** (line 119):
```vue
{{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
```

**Breakdown**:
1. `{{ genre }}` - Genre name (e.g., "Funk")
2. `{{ ... }}` - Expression interpolation
3. `isBattleReady(genre)` - Function call returning boolean
4. `? ' ●'` - If true, append space + filled circle
5. `: ' ○'` - If false, append space + empty circle

**Important**: Space before indicator for visual separation

### Visual Output

**Battle-Ready Genres**:
```
Funk ●
Rock ●
Electronic ●
```

**Not Battle-Ready**:
```
Jazz ○
Classical ○
Country ○
```

### Unicode Characters

| Character | Unicode | HTML Entity | Description |
|-----------|---------|-------------|-------------|
| ● | U+25CF | `&#9679;` | Black Circle (filled) |
| ○ | U+25CB | `&#9675;` | White Circle (empty) |

**Usage in Code**: Literal Unicode characters (not HTML entities or emojis)

### Genre Source

**Code** (line 413):
```typescript
const genres = MASTER_GENRES
```

**File**: `utils/genres.ts`

**Purpose**: Complete list of all genres (battle-ready or not)

**All genres are shown**, indicators differentiate which are battle-ready.

---

## Complete Data Flow

### Visual Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│              COMPONENT MOUNTED                             │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│        fetchBattleReadyGenres() Called                     │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│   supabase.rpc('get_battle_available_genres')             │
│                                                            │
│   Query: SELECT DISTINCT genre                            │
│          WHERE status='live' AND genre NOT NULL           │
│          GROUP BY genre HAVING COUNT(*) >= 2              │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│   RPC RESPONSE (PostgreSQL TABLE format)                  │
│                                                            │
│   [                                                        │
│     { genre: "Funk" },                                     │
│     { genre: "Rock" },                                     │
│     { genre: "Electronic" }                                │
│   ]                                                        │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│   EXTRACT GENRE STRINGS                                    │
│                                                            │
│   data?.map((item: any) => item.genre)                    │
│                                                            │
│   Transform:                                               │
│   [{ genre: "Funk" }]  →  ["Funk"]                        │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│   STORE IN STATE                                           │
│                                                            │
│   battleReadyGenres.value = ["Funk", "Rock", ...]        │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────────┐
│   RENDER GENRE DROPDOWN                                    │
│                                                            │
│   v-for="genre in MASTER_GENRES"                          │
│       ↓                                                    │
│   For each genre:                                          │
│       isBattleReady(genre)                                │
│           ↓                                                │
│       battleReadyGenres.includes(genre)                   │
│           ↓                                                │
│       true → append ' ●'                                   │
│       false → append ' ○'                                  │
└────────────────────────────────────────────────────────────┘
```

### Comparison: Mobile vs Web

| Step | Web App | Mobile App (Broken) | Mobile App (Fixed) |
|------|---------|---------------------|-------------------|
| **RPC Returns** | `[{genre: "Funk"}]` | `[{genre: "Funk"}]` | `[{genre: "Funk"}]` |
| **Processing** | `data.map(i => i.genre)` | ❌ `data` (no map) | ✅ `data.map(i => i.genre)` |
| **Stored As** | `["Funk"]` | ❌ `[{genre: "Funk"}]` | ✅ `["Funk"]` |
| **includes("Funk")** | ✅ `true` | ❌ `false` | ✅ `true` |
| **UI Shows** | ✅ `Funk ●` | ❌ `Funk ○` | ✅ `Funk ●` |

### The One-Line Fix

**Change this**:
```typescript
battleReadyGenres.value = data
```

**To this**:
```typescript
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

---

## RPC Function Specification

### Function Signature

```sql
get_battle_available_genres() RETURNS TABLE(genre text)
```

**No Parameters**: Function takes no arguments

**Return Type**: `TABLE(genre text)` - Single column table

### SQL Query Logic

```sql
SELECT DISTINCT s.genre
FROM public.songs s
WHERE s.status = 'live' 
  AND s.genre IS NOT NULL 
  AND s.genre != ''
GROUP BY s.genre
HAVING COUNT(*) >= 2
ORDER BY s.genre;
```

**Filters**:
1. `status = 'live'` - Only active songs in battle rotation
2. `genre IS NOT NULL` - Must have genre
3. `genre != ''` - Must not be empty string

**Grouping**: `GROUP BY s.genre`

**Threshold**: `HAVING COUNT(*) >= 2` - At least 2 songs required

**Why 2 Songs**: Need minimum 2 songs to create a battle matchup

**Sorting**: Alphabetical by genre name

### Response Format

**JavaScript Receives**:
```typescript
[
  { genre: "Alternative" },
  { genre: "Electronic" },
  { genre: "Funk" },
  { genre: "Hip-Hop" },
  { genre: "Rock" }
]
```

**Type**: `Array<{ genre: string }>`

**Important**: Even though SQL returns `TABLE(genre text)`, Supabase client converts it to array of objects.

---

## Frontend Data Processing

### State Declaration

**Location**: `songUploader.vue` (line 416)

```typescript
const battleReadyGenres = ref<string[]>([])
```

**Type**: `Ref<string[]>` - Array of genre strings

**Initial Value**: Empty array `[]`

**Purpose**: Store list of battle-ready genre names for fast lookup

### Fetch Function (Complete)

**Location**: `songUploader.vue` (lines 419-435)

```typescript
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}
```

### Processing Breakdown

#### Input from RPC

```typescript
data = [
  { genre: "Funk" },
  { genre: "Rock" },
  { genre: "Electronic" }
]
```

#### Critical Transformation

```typescript
data?.map((item: any) => item.genre)
```

**What It Does**:
- Iterates over each object in array
- Extracts the `genre` property
- Returns new array of just the strings

**Step by Step**:
```typescript
{ genre: "Funk" }       → "Funk"
{ genre: "Rock" }       → "Rock"
{ genre: "Electronic" } → "Electronic"
```

#### Fallback Handling

```typescript
|| []
```

**Purpose**: If `data` is `null` or `undefined`, use empty array

#### Output Stored

```typescript
battleReadyGenres.value = ["Funk", "Rock", "Electronic"]
```

**Type**: Simple string array (NOT objects)

### Error Handling

**Two error paths**:

1. **RPC Error** (database/network error):
```typescript
if (error) {
  console.error('Error fetching battle-ready genres:', error)
  battleReadyGenres.value = []
  return
}
```

2. **Exception** (unexpected error):
```typescript
} catch (error) {
  console.error('Error fetching battle-ready genres:', error)
  battleReadyGenres.value = []
}
```

**Both cases**: Set empty array (all genres show as not ready)

---

## Battle-Ready Check Function

### Complete Function

**Location**: `songUploader.vue` (lines 438-440)

```typescript
// Check if genre is battle-ready
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

### Function Details

**Input**: `genre: string` - Genre name to check (e.g., "Funk")

**Output**: `boolean` - True if battle-ready, false otherwise

**Logic**: Uses JavaScript `Array.includes()` method

**Complexity**: O(n) where n = number of battle-ready genres (~5-15 typically)

### Usage in Template

**Code** (line 119):
```vue
{{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
```

**Called for**: Every genre in `MASTER_GENRES` during dropdown render

**Frequency**: Once per genre when dropdown is displayed

### Test Cases

**Setup**:
```typescript
battleReadyGenres.value = ["Funk", "Rock", "Electronic"]
```

**Tests**:
```typescript
isBattleReady("Funk")         // true ✅
isBattleReady("Rock")         // true ✅
isBattleReady("Electronic")   // true ✅
isBattleReady("Jazz")         // false ❌
isBattleReady("Classical")    // false ❌
isBattleReady("")             // false ❌
isBattleReady("rock")         // false ❌ (case-sensitive!)
```

### Case Sensitivity

**Important**: The check is **case-sensitive**.

**Why**: Database stores genres with specific capitalization (e.g., "Rock" not "rock")

**Implication**: Mobile app must use exact same genre strings as web app

---

## UI Implementation

### Genre Dropdown Structure

**Location**: `songUploader.vue` (lines 106-122)

```vue
<div>
  <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
  <select
    v-model="songGenre"
    class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
  >
    <option value="" disabled class="theme-bg-card">Select Genre</option>
    <option 
      v-for="genre in genres" 
      :key="genre" 
      :value="genre" 
      class="theme-bg-card theme-text-primary"
    >
      {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
    </option>
  </select>
</div>
```

### Option Rendering

**Loop**: `v-for="genre in genres"`

**Source**: `genres` = `MASTER_GENRES` (all genres)

**Value**: `genre` string

**Display Text**: Genre name + indicator

### Indicator Logic

**Expression**:
```vue
{{ isBattleReady(genre) ? ' ●' : ' ○' }}
```

**Ternary Operator**:
- Condition: `isBattleReady(genre)`
- True: `' ●'` (space + filled circle)
- False: `' ○'` (space + empty circle)

**Why Space**: Visual separation between genre name and indicator

### Visual Output Examples

**Mixed Ready/Not Ready**:
```
Select Genre
Alternative ●
Blues ○
Classical ○
Country ○
Electronic ●
Folk ○
Funk ●
Hip-Hop ●
Jazz ○
Pop ●
R&B ○
Rock ●
```

**All Ready** (unlikely):
```
Rock ●
Pop ●
Hip-Hop ●
Electronic ●
```

**None Ready** (early platform state):
```
Rock ○
Pop ○
Hip-Hop ○
Electronic ○
```

---

## State Management

### State Lifecycle

#### Initial State (Component Created)

```typescript
battleReadyGenres = []  // Empty array
```

**Visual**: All genres show `○`

#### Loading State (RPC in Progress)

```typescript
battleReadyGenres = []  // Still empty during fetch
```

**Visual**: All genres show `○` (temporary)

#### Loaded State (RPC Success)

```typescript
battleReadyGenres = ["Funk", "Rock", "Electronic"]
```

**Visual**: Battle-ready genres show `●`, others show `○`

#### Error State (RPC Failed)

```typescript
battleReadyGenres = []  // Reset to empty
```

**Visual**: All genres show `○`

### State Updates

**When Populated**: On component mount via `onMounted()` hook

**When Cleared**: On errors (RPC error or exception)

**When Re-fetched**: Not automatically - only on mount

**Persistence**: Lost on component unmount (not persisted)

---

## Complete Code References

### Component: songUploader.vue

**State Declaration** (line 416):
```typescript
const battleReadyGenres = ref<string[]>([])
```

**Fetch Function** (lines 419-435):
```typescript
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}
```

**Check Function** (lines 438-440):
```typescript
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

**onMounted Hook** (lines 636-638):
```typescript
onMounted(() => {
  fetchBattleReadyGenres();
});
```

**Dropdown Rendering** (lines 113-120):
```vue
<option 
  v-for="genre in genres" 
  :key="genre" 
  :value="genre" 
  class="theme-bg-card theme-text-primary"
>
  {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
</option>
```

### RPC Function: get_battle_available_genres

**Location**: `supabase/migrations/20250818_add_flagging_system.sql` (lines 131-147)

```sql
CREATE OR REPLACE FUNCTION public.get_battle_available_genres()
RETURNS TABLE(genre text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT s.genre
  FROM public.songs s
  WHERE s.status = 'live' 
    AND s.genre IS NOT NULL 
    AND s.genre != ''
  GROUP BY s.genre
  HAVING COUNT(*) >= 2
  ORDER BY s.genre;
$$;

GRANT EXECUTE ON FUNCTION public.get_battle_available_genres() TO authenticated;
```

---

## Troubleshooting Guide

### Issue 1: All Genres Show ○ (Most Common)

**Symptom**: All genres display empty circle, even those with many songs

**Root Cause**: Storing objects instead of strings

**Check Your Code**:
```typescript
// WRONG ❌
battleReadyGenres.value = data

// RIGHT ✅
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

**Verification**:
```typescript
console.log('Type check:', battleReadyGenres.value[0])
// Should log: "Funk" (string)
// NOT: { genre: "Funk" } (object)
```

**Fix**: Add `.map((item: any) => item.genre)` to extract strings

---

### Issue 2: RPC Not Called

**Symptom**: `battleReadyGenres` remains empty array

**Root Cause**: `fetchBattleReadyGenres()` not called on mount

**Check Your Code**:
```typescript
// Make sure you have this:
onMounted(() => {
  fetchBattleReadyGenres()
})
```

**Verification**:
```typescript
console.log('Fetching genres...')
const { data } = await supabase.rpc('get_battle_available_genres')
console.log('Got genres:', data)
```

**Fix**: Ensure function is called in `onMounted` hook

---

### Issue 3: Wrong Property Name

**Symptom**: Array is empty even though RPC returns data

**Root Cause**: Extracting wrong property from objects

**Check Your Code**:
```typescript
// WRONG ❌
data?.map((item: any) => item.name)      // Wrong property
data?.map((item: any) => item.genre_name) // Wrong property

// RIGHT ✅
data?.map((item: any) => item.genre)     // Correct property
```

**Verification**:
```typescript
console.log('Raw data:', data)
console.log('First item:', data[0])
console.log('Property:', data[0].genre)  // Should not be undefined
```

**Fix**: Use exact property name `item.genre`

---

### Issue 4: Empty Array from Error

**Symptom**: RPC call succeeds but array is empty

**Root Cause**: Error handler setting empty array

**Check Your Code**:
```typescript
if (error) {
  console.error('Error:', error)  // Is this logging?
  battleReadyGenres.value = []    // This empties the array
  return
}
```

**Verification**:
```typescript
console.log('RPC error:', error)
console.log('RPC data:', data)
```

**Fix**: Ensure no error in RPC response

---

### Issue 5: Case Sensitivity

**Symptom**: Some genres show incorrectly

**Root Cause**: Genre names don't match exactly (case)

**Check Your Code**:
```typescript
// Database has: "Rock"
// Check with: "rock" → false ❌

// Must match exactly: "Rock" → true ✅
```

**Verification**:
```typescript
console.log('Battle-ready:', battleReadyGenres.value)
console.log('Checking:', genre)
console.log('Match:', battleReadyGenres.value.includes(genre))
```

**Fix**: Ensure MASTER_GENRES uses exact same strings as database

---

### Debugging Steps

#### Step 1: Log RPC Response

```typescript
const { data, error } = await supabase.rpc('get_battle_available_genres')
console.log('RPC Response:', { data, error })
```

**Expected**:
```
RPC Response: {
  data: [{ genre: "Funk" }, { genre: "Rock" }],
  error: null
}
```

#### Step 2: Log Extraction

```typescript
const extracted = data?.map((item: any) => item.genre) || []
console.log('Extracted genres:', extracted)
```

**Expected**:
```
Extracted genres: ["Funk", "Rock"]
```

#### Step 3: Log State

```typescript
battleReadyGenres.value = extracted
console.log('Battle-ready state:', battleReadyGenres.value)
console.log('Type of first item:', typeof battleReadyGenres.value[0])
```

**Expected**:
```
Battle-ready state: ["Funk", "Rock"]
Type of first item: string
```

#### Step 4: Log Check Results

```typescript
const isBattleReady = (genre: string) => {
  const result = battleReadyGenres.value.includes(genre)
  console.log(`isBattleReady("${genre}"):`, result)
  return result
}
```

**Expected for Funk**:
```
isBattleReady("Funk"): true
```

#### Step 5: Log UI Rendering

```typescript
// In template
{{ genre }} {{ isBattleReady(genre) ? '●' : '○' }}
// Add console.log before return in isBattleReady to see all checks
```

---

## Implementation Checklist for Mobile

### RPC Integration

- [ ] Import Supabase client
- [ ] Create `fetchBattleReadyGenres` async function
- [ ] Call `supabase.rpc('get_battle_available_genres')`
- [ ] No parameters needed for RPC call
- [ ] Handle `{ data, error }` response

### Data Processing

- [ ] Check for RPC error and handle
- [ ] **CRITICAL**: Use `.map((item: any) => item.genre)` to extract strings
- [ ] Do NOT store raw `data` (objects)
- [ ] Store as string array: `string[]`
- [ ] Add fallback: `|| []` for null/undefined
- [ ] Log extracted array to verify

### State Management

- [ ] Declare state: `const battleReadyGenres = ref<string[]>([])`
- [ ] Initialize as empty array
- [ ] Populate in fetch function
- [ ] Reset to empty array on errors

### Check Function

- [ ] Create `isBattleReady(genre: string)` function
- [ ] Use `battleReadyGenres.value.includes(genre)`
- [ ] Return boolean
- [ ] Ensure case-sensitive matching

### UI Integration

- [ ] Call `fetchBattleReadyGenres()` in `onMounted` hook
- [ ] Loop through all genres in dropdown
- [ ] Call `isBattleReady(genre)` for each
- [ ] Append `' ●'` if true (space + filled circle)
- [ ] Append `' ○'` if false (space + empty circle)
- [ ] Use Unicode characters (not emojis)

### Testing

- [ ] Test RPC returns data
- [ ] Test extraction creates string array
- [ ] Test `includes()` check returns true for known genres
- [ ] Test `includes()` check returns false for unknown genres
- [ ] Test UI shows ● for battle-ready genres
- [ ] Test UI shows ○ for not-ready genres
- [ ] Test error handling (empty array on error)

### Debugging

- [ ] Log RPC response format
- [ ] Log extracted array
- [ ] Log type of array items (should be "string")
- [ ] Log each `isBattleReady()` call result
- [ ] Verify onMounted executes
- [ ] Check console for errors

---

## Mobile-Specific Considerations

### Platform Differences

**Web App**: Native HTML `<select>` with `<option>` elements

**Mobile**: Likely using Ionic `<ion-select>` with `<ion-select-option>`

**Indicators**: Should work the same - just text appended to option label

### Unicode Character Support

**Characters**: `●` (U+25CF) and `○` (U+25CB)

**Support**: Universal Unicode support on iOS and Android

**Alternative**: If Unicode doesn't render, could use:
- Emojis: 🟢 (green circle) and ⚪ (white circle)
- Text: "(Ready)" and "(Not Ready)"
- Icons: Platform-specific checkmarks

### Async Loading

**Web App**: Fetches on mount, dropdown renders immediately

**Mobile**: Consider:
- Loading state while fetching
- Skeleton UI for dropdown
- Retry mechanism if fetch fails

---

## Quick Reference

### Critical Code Snippets

**State**:
```typescript
const battleReadyGenres = ref<string[]>([])
```

**Fetch**:
```typescript
const { data, error } = await supabase.rpc('get_battle_available_genres')
battleReadyGenres.value = data?.map((item: any) => item.genre) || []
```

**Check**:
```typescript
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

**Render**:
```vue
{{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
```

### Data Transformation

**RPC Returns**:
```typescript
[{ genre: "Funk" }, { genre: "Rock" }]
```

**Extract With**:
```typescript
data?.map((item: any) => item.genre)
```

**Results In**:
```typescript
["Funk", "Rock"]
```

**Then Check**:
```typescript
array.includes("Funk")  // true ✅
```

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue` (lines 413-440)
- **RPC Function**: `supabase/migrations/20250818_add_flagging_system.sql`
- **Genre List**: `utils/genres.ts` (MASTER_GENRES)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

