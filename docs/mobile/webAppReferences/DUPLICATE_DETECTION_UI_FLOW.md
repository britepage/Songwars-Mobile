# Duplicate Detection UI Flow - Web App Implementation Reference

**Document Purpose**: This document provides exact implementation details of the duplicate detection UI flow, state management, and error handling from the production web app, answering specific questions for mobile app implementation.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `store/uploadStore.ts` (lines 512-569)
- `components/dashboard/songUploader.vue` (lines 443-558)

---

## Table of Contents

1. [Overview](#overview)
2. [Questions Answered](#questions-answered)
3. [Complete Flow Sequence](#complete-flow-sequence)
4. [handleFileSelection Function](#handlefileselection-function)
5. [File Selection Integration](#file-selection-integration)
6. [State Management](#state-management)
7. [UI Feedback Elements](#ui-feedback-elements)
8. [Error Display](#error-display)
9. [Upload Button Behavior](#upload-button-behavior)
10. [State Clearing](#state-clearing)
11. [Complete Code References](#complete-code-references)
12. [Implementation Checklist](#implementation-checklist)

---

## Overview

The web app implements **proactive duplicate detection** that **blocks** files from loading into the form if they're duplicates. This prevents user confusion and clearly indicates files cannot be uploaded.

**Key Characteristics:**
- Duplicate check happens **before** file loads into form
- File is **rejected** and never enters the UI if duplicate
- Uses **browser alert** for error display (not custom modal)
- Upload button is **disabled** when duplicate detected
- Status indicator shows **real-time** duplicate status
- State management split between **store** and **component**

**Critical Insight**: If duplicate is detected, the file **never loads** - `selectedFile` remains `null` and form stays empty.

---

## Questions Answered

### Q1: How should duplicate check be integrated into file selection flow?

**Answer**: Call `uploadStore.handleFileSelection(file)` **immediately after file type validation** and **before** loading file into form.

**Code**: `songUploader.vue` (line 458)
```typescript
const result = await uploadStore.handleFileSelection(file);
```

**Integration Point**: After validation, before setting `selectedFile.value`.

---

### Q2: What's the proper sequence?

**Answer**: **Generate fingerprint → Check duplicates → THEN load file** (conditionally)

**Sequence**:
```
1. User selects file
2. Validate file type
3. Clear states
4. Generate fingerprint (inside handleFileSelection)
5. Check duplicates via RPC (inside handleFileSelection)
6. Return result { success: boolean, message: string }
7a. If success: Load file, create preview, extract metadata
7b. If failure: Show alert, clear input, DON'T load file
```

**Important**: File loading is **conditional** on success result.

---

### Q3: Should duplicate detection happen in handleFileSelection or separately?

**Answer**: **In `handleFileSelection`** - it's an all-in-one function.

**Location**: `store/uploadStore.ts` (lines 512-559)

**What It Does**:
1. Validates file exists
2. Sets `isGeneratingFingerprint = true`
3. Generates SHA-256 fingerprint
4. Calls `check_audio_fingerprint` RPC
5. Updates state flags
6. Returns `{ success: boolean, message: string }`

**Benefits of All-in-One**:
- Single async call for component
- Atomic operation
- Consistent state updates
- Clean error handling

---

### Q4: How should duplicate errors be displayed?

**Answer**: **Browser `alert()`** with message from `handleFileSelection` result.

**Code**: `songUploader.vue` (line 478, 531)
```typescript
alert(result.message);
```

**Messages**:
- Duplicate: From RPC (e.g., "This audio file has already been uploaded")
- RPC Error: "Failed to check for duplicates. Please try again."
- Processing Error: "Failed to process file. Please try again."

**Why alert()**:
- Simple and functional
- Blocks user interaction until acknowledged
- No custom modal needed
- Cross-platform compatible

**Alternative (Not Used)**:
- ❌ Custom modal
- ❌ Inline error message
- ❌ Toast notification

---

### Q5: What state should be cleared when duplicate detected?

**Answer**: Clear file-related state, but **NOT** form fields.

**State Cleared** (lines 479-482):
```typescript
target.value = '';              // File input element
selectedFile.value = null;      // Component selected file
audioPreviewUrl.value = null;   // Audio preview URL
```

**State NOT Cleared**:
- `songTitle` - Remains unchanged
- `songArtist` - Remains unchanged
- `songGenre` - Remains unchanged
- `clipStart` - Remains unchanged
- `rightsConfirmed` - Remains unchanged

**Store State Set**:
- `isDuplicate.value = true`
- `fingerprintGenerated.value = false`
- `fingerprint.value` - Keeps hash (for reference)

**Why Form Fields Persist**: Allows user to select a different file without re-entering metadata.

---

### Q6: Should upload button be disabled when isDuplicate is true?

**Answer**: **YES** - Upload button is explicitly disabled when `isDuplicate` is true.

**Code**: `songUploader.vue` (lines 368-377)
```typescript
const canUpload = computed(() => {
  return selectedFile.value && 
         songTitle.value && 
         songArtist.value && 
         songGenre.value && 
         rightsConfirmed.value && 
         !uploadStore.uploading &&
         uploadStore.fingerprintGenerated &&
         !uploadStore.isDuplicate;  // ← Must NOT be duplicate
});
```

**Button Visual** (lines 245-250):
```typescript
<div v-else-if="uploadStore.isDuplicate" class="flex items-center justify-center">
  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
  Duplicate Detected
</div>
```

**Button State**: Shows warning icon + "Duplicate Detected" text, disabled (gray background).

---

## Complete Flow Sequence

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SELECTS FILE                        │
│              (Click or Drag & Drop)                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               VALIDATE FILE TYPE                            │
│   Check: audio/* MIME or .mp3/.wav/.m4a/.aac/.ogg          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
              Valid? ────No──→ Alert + Clear Input → END
                     │
                    Yes
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 CLEAR PREVIOUS STATES                       │
│   uploadStore.clearUploadStatus()                          │
│   uploadStore.clearFingerprintState()                      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│          CALL uploadStore.handleFileSelection(file)         │
│                                                             │
│   1. Set isGeneratingFingerprint = true                    │
│   2. Generate SHA-256 fingerprint                          │
│   3. Call check_audio_fingerprint RPC                      │
│   4. Update state flags                                    │
│   5. Return { success, message }                           │
└────────────────────┬────────────────────────────────────────┘
                     ↓
               Success? ───No──→ ┌──────────────────────────┐
                     │            │  DUPLICATE/ERROR PATH    │
                    Yes           │  - alert(result.message) │
                     ↓            │  - Clear file input      │
┌─────────────────────────────┐  │  - selectedFile = null   │
│      SUCCESS PATH           │  │  - audioPreviewUrl=null  │
│                             │  │  - isDuplicate = true    │
│  - selectedFile = file      │  │  - Form fields persist   │
│  - Create audio preview     │  └──────────┬───────────────┘
│  - clipStart = 0            │             │
│  - Extract metadata         │             │
│  - Auto-fill title/artist   │             │
│  - isDuplicate = false      │             │
│  - fingerprintGen = true    │             │
└────────────────────┬────────┘             │
                     │                       │
                     ↓                       ↓
                  [FORM READY]           [BLOCKED]
                  Can upload             Cannot upload
```

### Step-by-Step Sequence

#### Step 1: User Selects File

**Methods**:
- Click upload zone → File browser dialog
- Drag and drop file onto upload zone

**Trigger**: `handleFileChange` or `handleDrop` functions

#### Step 2: Validate File Type

**Check 1**: MIME type starts with `'audio/'`
**Check 2**: File extension matches: `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`

**Code**:
```typescript
const isAudioFile = file.type.startsWith('audio/') || 
                   /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);
```

**If Invalid**:
- Show alert: "Please select a valid audio file..."
- Clear file input
- Return early (no further processing)

#### Step 3: Clear Previous States

**Code**: (lines 454-455)
```typescript
uploadStore.clearUploadStatus();
uploadStore.clearFingerprintState();
```

**Purpose**: Reset any previous upload or fingerprint data

#### Step 4: Call handleFileSelection

**Code**: (line 458)
```typescript
const result = await uploadStore.handleFileSelection(file);
```

**What Happens Inside** (store/uploadStore.ts):
1. Set `isGeneratingFingerprint = true`
2. Generate fingerprint: `await generateAudioFingerprintWithRetry(file)`
3. Store fingerprint: `fingerprint.value = generatedFingerprint`
4. RPC call: `supabase.rpc('check_audio_fingerprint', { p_fingerprint_hash })`
5. Check response: `duplicateCheck.allowed`
6. Update flags and return result

**Returns**: Object with `success` and `message` properties

#### Step 5a: Success Path

**Code**: (lines 460-475)
```typescript
if (result.success) {
  selectedFile.value = file;
  audioPreviewUrl.value = URL.createObjectURL(file);
  clipStart.value = 0;
  
  // Auto-extract title and artist from filename
  const extracted = extractArtistAndTitle(file.name);
  
  if (extracted.title) {
    songTitle.value = extracted.title;
  }
  if (extracted.artist) {
    songArtist.value = extracted.artist;
  }
}
```

**Actions**:
1. Load file into component: `selectedFile.value = file`
2. Create audio preview: `URL.createObjectURL(file)`
3. Reset clip start: `clipStart.value = 0`
4. Extract metadata from filename
5. Auto-fill title and artist fields

**Result**: File is loaded, form is ready for user to complete details

#### Step 5b: Failure Path (Duplicate)

**Code**: (lines 476-482)
```typescript
} else {
  // Show duplicate error
  alert(result.message);
  // Clear the file input
  target.value = '';
  selectedFile.value = null;
  audioPreviewUrl.value = null;
}
```

**Actions**:
1. Show browser alert with error message
2. Clear file input element
3. Keep `selectedFile` as `null` (file never loads)
4. Keep `audioPreviewUrl` as `null` (no preview)
5. Form fields remain unchanged

**Result**: File is rejected, form shows empty file selection area

---

## handleFileSelection Function

### Complete Function

**Location**: `store/uploadStore.ts` (lines 512-559)

```typescript
/**
 * Handle file selection and generate audio fingerprint for duplicate detection
 */
const handleFileSelection = async (file: File): Promise<{ success: boolean; message: string }> => {
  if (!file) {
    fingerprint.value = null;
    fingerprintGenerated.value = false;
    isDuplicate.value = false;
    return { success: false, message: 'No file selected' };
  }

  isGeneratingFingerprint.value = true;
  fingerprintGenerated.value = false;
  isDuplicate.value = false;

  try {
    // Generate fingerprint with retry logic
    const generatedFingerprint = await generateAudioFingerprintWithRetry(file);
    fingerprint.value = generatedFingerprint;

    // Check for duplicates
    const { data: duplicateCheck, error } = await supabase.rpc('check_audio_fingerprint', {
      p_fingerprint_hash: generatedFingerprint
    });

    if (error) {
      console.error('Duplicate check failed:', error);
      fingerprintGenerated.value = false;
      return { success: false, message: 'Failed to check for duplicates. Please try again.' };
    }

    if (duplicateCheck.allowed) {
      fingerprintGenerated.value = true;
      isDuplicate.value = false;
      return { success: true, message: 'File ready for upload' };
    } else {
      fingerprintGenerated.value = false;
      isDuplicate.value = true;
      return { success: false, message: duplicateCheck.message };
    }

  } catch (error) {
    console.error('File selection processing failed:', error);
    fingerprint.value = null;
    fingerprintGenerated.value = false;
    isDuplicate.value = false;
    return { success: false, message: 'Failed to process file. Please try again.' };
  } finally {
    isGeneratingFingerprint.value = false;
  }
};
```

### Function Signature

**Input**:
- `file: File` - The audio file to check

**Output**:
```typescript
{
  success: boolean,  // true if file can be uploaded, false if duplicate/error
  message: string    // Success message or error description
}
```

### Internal Steps

#### Step 1: Validate Input

```typescript
if (!file) {
  fingerprint.value = null;
  fingerprintGenerated.value = false;
  isDuplicate.value = false;
  return { success: false, message: 'No file selected' };
}
```

**Purpose**: Guard against null/undefined file

#### Step 2: Initialize States

```typescript
isGeneratingFingerprint.value = true;
fingerprintGenerated.value = false;
isDuplicate.value = false;
```

**Purpose**: Reset flags and indicate processing has started

#### Step 3: Generate Fingerprint

```typescript
const generatedFingerprint = await generateAudioFingerprintWithRetry(file);
fingerprint.value = generatedFingerprint;
```

**Function**: `generateAudioFingerprintWithRetry()` with 3 retry attempts

**What It Does**: Creates SHA-256 hash of audio file content

**Output**: 64-character hex string

#### Step 4: Check Duplicates

```typescript
const { data: duplicateCheck, error } = await supabase.rpc('check_audio_fingerprint', {
  p_fingerprint_hash: generatedFingerprint
});
```

**RPC Function**: `check_audio_fingerprint`

**Parameter**: `p_fingerprint_hash` (the SHA-256 hash)

**Response Structure**:
```typescript
{
  allowed: boolean,     // true if can upload, false if duplicate
  message: string,      // Error message if duplicate
  existing_song?: {...} // Details of existing song (if duplicate)
}
```

#### Step 5: Handle RPC Error

```typescript
if (error) {
  console.error('Duplicate check failed:', error);
  fingerprintGenerated.value = false;
  return { success: false, message: 'Failed to check for duplicates. Please try again.' };
}
```

**Scenario**: Network error, database error, or RPC failure

**Action**: Treat as failure, don't allow upload

#### Step 6: Process Result - Allowed

```typescript
if (duplicateCheck.allowed) {
  fingerprintGenerated.value = true;
  isDuplicate.value = false;
  return { success: true, message: 'File ready for upload' };
}
```

**State Updates**:
- ✅ `fingerprintGenerated = true` (check completed)
- ✅ `isDuplicate = false` (not a duplicate)

**Return**: `{ success: true, ... }`

**Result**: Component will load file into form

#### Step 7: Process Result - Duplicate

```typescript
} else {
  fingerprintGenerated.value = false;
  isDuplicate.value = true;
  return { success: false, message: duplicateCheck.message };
}
```

**State Updates**:
- ❌ `fingerprintGenerated = false` (invalid for upload)
- ❌ `isDuplicate = true` (duplicate detected)

**Return**: `{ success: false, message: '...' }`

**Result**: Component will reject file and show alert

#### Step 8: Handle Exceptions

```typescript
} catch (error) {
  console.error('File selection processing failed:', error);
  fingerprint.value = null;
  fingerprintGenerated.value = false;
  isDuplicate.value = false;
  return { success: false, message: 'Failed to process file. Please try again.' };
}
```

**Scenarios**: Fingerprint generation error, unexpected exceptions

**Action**: Reset all states and return failure

#### Step 9: Cleanup

```typescript
} finally {
  isGeneratingFingerprint.value = false;
}
```

**Purpose**: Always reset processing flag, regardless of success/failure

---

## File Selection Integration

### handleFileChange Function

**Location**: `songUploader.vue` (lines 443-495)

```typescript
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  
  if (file) {
    // Check if it's an audio file by MIME type or extension
    const isAudioFile = file.type.startsWith('audio/') || 
                       /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);
    
    if (isAudioFile) {
      // Clear any previous upload status and fingerprint state
      uploadStore.clearUploadStatus();
      uploadStore.clearFingerprintState();
      
      // Process file for duplicate detection
      const result = await uploadStore.handleFileSelection(file);
      
      if (result.success) {
        selectedFile.value = file;
        audioPreviewUrl.value = URL.createObjectURL(file);
        clipStart.value = 0;
        
        // Auto-extract title and artist from filename
        const extracted = extractArtistAndTitle(file.name);
        
        if (extracted.title) {
          songTitle.value = extracted.title;
        }
        if (extracted.artist) {
          songArtist.value = extracted.artist;
        }
      } else {
        // Show duplicate error
        alert(result.message);
        // Clear the file input
        target.value = '';
        selectedFile.value = null;
        audioPreviewUrl.value = null;
      }
    } else {
      console.error('[SongUploader] Invalid file type:', file.type, file.name);
      alert('Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)');
      // Clear the invalid file
      target.value = '';
    }
  } else {
    selectedFile.value = null;
    audioPreviewUrl.value = null;
    uploadStore.clearFingerprintState();
  }
};
```

### handleDrop Function

**Location**: `songUploader.vue` (lines 497-540)

```typescript
const handleDrop = async (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const file = files[0];
    // Check if it's an audio file by MIME type or extension
    const isAudioFile = file.type.startsWith('audio/') || 
                       /\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name);
    
    if (isAudioFile) {
      // Clear any previous upload status and fingerprint state
      uploadStore.clearUploadStatus();
      uploadStore.clearFingerprintState();
      
      // Process file for duplicate detection
      const result = await uploadStore.handleFileSelection(file);
      
      if (result.success) {
        selectedFile.value = file;
        audioPreviewUrl.value = URL.createObjectURL(file);
        clipStart.value = 0;
        
        // Auto-extract title and artist from filename
        const extracted = extractArtistAndTitle(file.name);
        
        if (extracted.title) {
          songTitle.value = extracted.title;
        }
        if (extracted.artist) {
          songArtist.value = extracted.artist;
        }
      } else {
        // Show duplicate error
        alert(result.message);
        selectedFile.value = null;
        audioPreviewUrl.value = null;
      }
    } else {
      console.error('[SongUploader] Invalid file type dropped:', file.type, file.name);
      alert('Please drop a valid audio file (MP3, WAV, M4A, AAC, or OGG)');
    }
  }
};
```

### Key Integration Points

**Both handlers follow identical pattern**:

1. **Extract file** from event
2. **Validate type** (MIME + extension)
3. **Clear states** (upload status + fingerprint state)
4. **Call** `uploadStore.handleFileSelection(file)`
5. **Check result**:
   - `if (result.success)` → Load file into form
   - `else` → Show alert, clear input, block load

**Critical Pattern**: File loading is **gated** by success result. Duplicate files never enter the form.

---

## State Management

### Store State (uploadStore)

**Location**: `store/uploadStore.ts`

#### State Properties

```typescript
// Audio fingerprinting state
const fingerprint = ref<string | null>(null)
const fingerprintGenerated = ref(false)
const isDuplicate = ref(false)
const isGeneratingFingerprint = ref(false)
```

#### State Descriptions

| State | Type | Purpose | When True |
|-------|------|---------|-----------|
| `fingerprint` | string \| null | SHA-256 hash of audio file | After successful generation |
| `fingerprintGenerated` | boolean | Fingerprint check completed successfully | File verified, not duplicate |
| `isDuplicate` | boolean | Duplicate file detected | File already uploaded |
| `isGeneratingFingerprint` | boolean | Processing in progress | During fingerprint generation + RPC |

#### State Transitions

**Initial State** (no file):
```typescript
fingerprint: null
fingerprintGenerated: false
isDuplicate: false
isGeneratingFingerprint: false
```

**During Processing**:
```typescript
fingerprint: null
fingerprintGenerated: false
isDuplicate: false
isGeneratingFingerprint: true  ← Processing
```

**Success (Not Duplicate)**:
```typescript
fingerprint: "abc123...def"
fingerprintGenerated: true     ← Verified
isDuplicate: false
isGeneratingFingerprint: false
```

**Failure (Duplicate Detected)**:
```typescript
fingerprint: "abc123...def"    ← Hash stored
fingerprintGenerated: false    ← Invalid for upload
isDuplicate: true              ← Duplicate!
isGeneratingFingerprint: false
```

**Error During Check**:
```typescript
fingerprint: null
fingerprintGenerated: false
isDuplicate: false
isGeneratingFingerprint: false
```

### Component State (songUploader.vue)

**Location**: `components/dashboard/songUploader.vue` (lines 356-365)

```typescript
const selectedFile = ref<File | null>(null)
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const clipStart = ref(0)
const audioPreviewUrl = ref<string | null>(null)
const rightsConfirmed = ref(false)
```

#### State After Duplicate Detection

| State | Value | Reason |
|-------|-------|--------|
| `selectedFile` | `null` | File rejected |
| `audioPreviewUrl` | `null` | No preview created |
| `fileInput.value` | `''` | Input cleared |
| `songTitle` | Previous value | NOT cleared |
| `songArtist` | Previous value | NOT cleared |
| `songGenre` | Previous value | NOT cleared |
| `clipStart` | Previous value | NOT cleared |
| `rightsConfirmed` | Previous value | NOT cleared |

**Why Form Fields Persist**: Allows user to select a different file without re-entering all metadata.

---

## UI Feedback Elements

### 1. Status Indicator

**Location**: `songUploader.vue` (lines 169-191)

```vue
<div class="flex items-center justify-between">
  <span class="theme-text-secondary">File Verified</span>
  <div class="flex items-center">
    <div class="w-2 h-2 rounded-full mr-2" 
         :class="{
           'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
           'bg-red-400': uploadStore.isDuplicate,
           'bg-yellow-400': uploadStore.isGeneratingFingerprint,
           'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
         }"></div>
    <span class="text-sm" 
          :class="{
            'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
            'text-red-400': uploadStore.isDuplicate,
            'text-yellow-400': uploadStore.isGeneratingFingerprint,
            'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint && !uploadStore.isDuplicate
          }">
      {{ uploadStore.isGeneratingFingerprint ? 'Processing...' : 
         uploadStore.isDuplicate ? 'Duplicate' :
         uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}
    </span>
  </div>
</div>
```

#### Visual States

| State | Dot Color | Text | Text Color |
|-------|-----------|------|------------|
| **Pending** | Gray (`bg-gray-600`) | "Pending" | Muted |
| **Processing** | Yellow (`bg-yellow-400`) | "Processing..." | Yellow (`text-yellow-400`) |
| **Verified** | Green (`bg-green-400`) | "Verified" | Green (`text-green-400`) |
| **Duplicate** | Red (`bg-red-400`) | "Duplicate" | Red (`text-red-400`) |

#### State Conditions

**Pending**:
```typescript
!fingerprintGenerated && !isGeneratingFingerprint && !isDuplicate
```

**Processing**:
```typescript
isGeneratingFingerprint === true
```

**Verified**:
```typescript
fingerprintGenerated === true && isDuplicate === false
```

**Duplicate**:
```typescript
isDuplicate === true
```

### 2. Upload Button Display

**Location**: `songUploader.vue` (lines 245-250)

```vue
<div v-else-if="uploadStore.isDuplicate" class="flex items-center justify-center">
  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
  Duplicate Detected
</div>
```

**Visual**:
- Warning/info icon (circle with exclamation)
- Text: "Duplicate Detected"
- Button disabled (gray background)
- Icon: 20px × 20px, 8px right margin

**Condition**: `uploadStore.isDuplicate === true`

### 3. Browser Alert

**Display Method**: Standard browser `alert()`

**Code**: (line 478, 531)
```typescript
alert(result.message);
```

**When Shown**: Immediately after `handleFileSelection` returns `success: false`

**Messages**:
- Duplicate: Message from RPC (e.g., "This audio file has already been uploaded by you on...")
- RPC Error: "Failed to check for duplicates. Please try again."
- Processing Error: "Failed to process file. Please try again."

---

## Upload Button Behavior

### canUpload Computed Property

**Location**: `songUploader.vue` (lines 368-377)

```typescript
const canUpload = computed(() => {
  return selectedFile.value && 
         songTitle.value && 
         songArtist.value && 
         songGenre.value && 
         rightsConfirmed.value && 
         !uploadStore.uploading &&
         uploadStore.fingerprintGenerated &&
         !uploadStore.isDuplicate;
});
```

### Required Conditions

**All must be true**:

1. ✅ `selectedFile.value` - File is loaded
2. ✅ `songTitle.value` - Title entered
3. ✅ `songArtist.value` - Artist entered
4. ✅ `songGenre.value` - Genre selected
5. ✅ `rightsConfirmed.value` - Checkbox checked
6. ✅ `!uploadStore.uploading` - Not currently uploading
7. ✅ `uploadStore.fingerprintGenerated` - Fingerprint verified
8. ✅ `!uploadStore.isDuplicate` - NOT a duplicate

### Duplicate Impact

**If `isDuplicate = true`**:
- Condition 7 fails: `fingerprintGenerated = false`
- Condition 8 fails: `!isDuplicate = false`
- **Result**: `canUpload = false`

**Button State**:
- Disabled (gray background)
- Shows "Duplicate Detected" text
- No hover effects
- Cannot be clicked

### Button Priority States

**Priority Order** (first matching condition):

1. `isDuplicate` → "Duplicate Detected" (warning icon)
2. `isGeneratingFingerprint` → "Verifying File..." (spinner)
3. `isSuccess` → "Success!" (checkmark)
4. `uploading` → "Uploading..." / "Converting..." (spinner)
5. `!canUpload` → "Upload Song" (disabled)
6. Default → "Upload Song" (enabled, yellow)

---

## State Clearing

### clearFingerprintState Function

**Location**: `store/uploadStore.ts` (lines 564-569)

```typescript
/**
 * Clear fingerprint state (useful when changing files)
 */
const clearFingerprintState = () => {
  fingerprint.value = null;
  fingerprintGenerated.value = false;
  isDuplicate.value = false;
  isGeneratingFingerprint.value = false;
};
```

**When Called**:
1. Before selecting new file (lines 455, 508)
2. When clearing/removing file (line 552)
3. When file input is empty (line 493)

**Purpose**: Reset all fingerprint-related flags for fresh state

### clearUploadStatus Function

**Location**: `store/uploadStore.ts` (lines 489-495)

```typescript
const clearUploadStatus = () => {
  uploading.value = false
  uploadMessage.value = ''
  isSuccess.value = false
  uploadedSongDetails.value = null
  conversionStage.value = null
};
```

**When Called**:
1. Before selecting new file (lines 454, 507)
2. After successful upload (with delay)

**Purpose**: Reset upload-related state (not fingerprint state)

### clearFile Function

**Location**: `songUploader.vue` (lines 542-558)

```typescript
const clearFile = () => {
  selectedFile.value = null;
  audioPreviewUrl.value = null;
  clipStart.value = 0;
  
  // Clear the file input and upload status
  if (fileInput.value) {
    (fileInput.value as HTMLInputElement).value = '';
  }
  uploadStore.clearUploadStatus();
  uploadStore.clearFingerprintState();
  
  // Clear auto-populated fields when file is removed
  songTitle.value = '';
  songArtist.value = '';
};
```

**When Called**: User clicks "Remove file" button

**Purpose**: Complete reset - clears file, preview, states, AND form fields

---

## Error Display

### Browser Alert Implementation

**Method**: Standard JavaScript `alert()`

**Code Examples**:

```typescript
// Duplicate detected
alert(result.message);

// Invalid file type
alert('Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)');

// Duplicate in drag-drop
alert(result.message);

// Invalid file dropped
alert('Please drop a valid audio file (MP3, WAV, M4A, AAC, or OGG)');
```

### Alert Messages

#### Duplicate Detection

**From RPC** (`duplicateCheck.message`):
```
This audio file has already been uploaded
```

or with details:
```
This audio file has already been uploaded by you on 2025-01-15
```

**Source**: RPC function returns message from database

#### RPC/Network Error

```
Failed to check for duplicates. Please try again.
```

**When**: RPC call fails (network error, database error)

#### Processing Error

```
Failed to process file. Please try again.
```

**When**: Exception during fingerprint generation

#### Invalid File Type

```
Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)
```

**When**: File doesn't match audio MIME or extension

### Why Browser Alert?

**Advantages**:
- ✅ Simple implementation
- ✅ Blocks interaction until acknowledged
- ✅ Universal browser support
- ✅ Requires no custom modal component
- ✅ Clear and unmistakable

**Disadvantages**:
- ❌ Not customizable styling
- ❌ Looks "basic"
- ❌ Can't show rich content
- ❌ Interrupts user flow

**Web App Decision**: Simplicity and clarity over aesthetics

---

## Complete Code References

### Primary Files

**1. uploadStore.ts**

**Key Sections**:
- Lines 512-559: `handleFileSelection()` function
- Lines 564-569: `clearFingerprintState()` function
- Lines 489-495: `clearUploadStatus()` function
- Lines 36-62: `generateAudioFingerprint()` function
- Lines 64-78: `generateAudioFingerprintWithRetry()` function

**Store State Declarations** (estimated lines 100-120):
```typescript
const fingerprint = ref<string | null>(null)
const fingerprintGenerated = ref(false)
const isDuplicate = ref(false)
const isGeneratingFingerprint = ref(false)
```

**Exports** (lines 571-591):
```typescript
return {
  // ... other exports
  fingerprint,
  fingerprintGenerated,
  isDuplicate,
  isGeneratingFingerprint,
  handleFileSelection,
  clearFingerprintState,
}
```

**2. songUploader.vue**

**Key Sections**:
- Lines 443-495: `handleFileChange()` function
- Lines 497-540: `handleDrop()` function
- Lines 542-558: `clearFile()` function
- Lines 368-377: `canUpload` computed property
- Lines 169-191: Status indicator UI
- Lines 245-250: Upload button duplicate state

### Function Call Chain

```
User clicks/drops file
    ↓
handleFileChange() or handleDrop()
    ↓
Validate file type
    ↓
clearUploadStatus()
    ↓
clearFingerprintState()
    ↓
uploadStore.handleFileSelection(file)
    ↓
    ├─ generateAudioFingerprintWithRetry(file)
    │      ↓
    │  generateAudioFingerprint(file)
    │      ↓
    │  SHA-256 hash generation
    │
    ├─ supabase.rpc('check_audio_fingerprint', { p_fingerprint_hash })
    │      ↓
    │  Database lookup
    │
    └─ Return { success, message }
    ↓
Process result
    ↓
    ├─ Success → Load file into form
    └─ Failure → Alert + Block load
```

---

## Implementation Checklist for Mobile

### Store Setup

- [ ] Add fingerprint state properties to uploadStore
- [ ] `fingerprint: string | null`
- [ ] `fingerprintGenerated: boolean`
- [ ] `isDuplicate: boolean`
- [ ] `isGeneratingFingerprint: boolean`

### handleFileSelection Implementation

- [ ] Create `handleFileSelection(file)` function
- [ ] Return type: `Promise<{ success: boolean, message: string }>`
- [ ] Validate file is not null/undefined
- [ ] Set `isGeneratingFingerprint = true` at start
- [ ] Reset `fingerprintGenerated` and `isDuplicate` to false
- [ ] Generate SHA-256 fingerprint with retry logic
- [ ] Store fingerprint in state
- [ ] Call `check_audio_fingerprint` RPC with `p_fingerprint_hash`
- [ ] Handle RPC errors (return failure)
- [ ] Check `duplicateCheck.allowed` boolean
- [ ] If allowed: Set flags, return success
- [ ] If not allowed: Set `isDuplicate = true`, return failure
- [ ] Catch exceptions and return generic error
- [ ] Always set `isGeneratingFingerprint = false` in finally

### File Selection Integration

- [ ] Call `handleFileSelection` after file type validation
- [ ] Call BEFORE loading file into form
- [ ] Clear upload status before calling
- [ ] Clear fingerprint state before calling
- [ ] Await the result
- [ ] Check `result.success` boolean
- [ ] If success: Load file, create preview, extract metadata
- [ ] If failure: Show alert, clear input, don't load file

### UI Status Indicator

- [ ] Create "File Verified" status row
- [ ] Show 8px colored dot (red/yellow/green/gray)
- [ ] Show status text next to dot
- [ ] Pending: Gray dot, muted text
- [ ] Processing: Yellow dot, "Processing..." text
- [ ] Verified: Green dot, "Verified" text
- [ ] Duplicate: Red dot, "Duplicate" text
- [ ] Bind to uploadStore state

### Upload Button States

- [ ] Add duplicate detection to `canUpload` logic
- [ ] Check `uploadStore.fingerprintGenerated === true`
- [ ] Check `uploadStore.isDuplicate === false`
- [ ] Add `v-else-if="uploadStore.isDuplicate"` condition
- [ ] Show warning icon + "Duplicate Detected" text
- [ ] Keep button disabled when duplicate

### Error Display

- [ ] Use browser `alert()` for duplicate errors
- [ ] Show alert immediately when duplicate detected
- [ ] Use message from `handleFileSelection` result
- [ ] Alert BEFORE any file loading occurs

### State Clearing

- [ ] Clear file input value on duplicate
- [ ] Set `selectedFile = null` on duplicate
- [ ] Set `audioPreviewUrl = null` on duplicate
- [ ] DO NOT clear form fields (title, artist, genre)
- [ ] Call `clearFingerprintState()` before new file
- [ ] Call `clearUploadStatus()` before new file

### State Management

- [ ] Update `isGeneratingFingerprint` during processing
- [ ] Update `fingerprintGenerated` on success
- [ ] Update `isDuplicate` when duplicate found
- [ ] Store `fingerprint` hash for reference
- [ ] Export all state from uploadStore
- [ ] Access state in component via uploadStore

### Testing

- [ ] Test with non-duplicate file (should load normally)
- [ ] Test with duplicate file (should show alert + block)
- [ ] Test status indicator color changes
- [ ] Test upload button stays disabled for duplicates
- [ ] Test file input clears on duplicate
- [ ] Test form fields persist after duplicate
- [ ] Test clearing file resets all states
- [ ] Test selecting new file after duplicate works

---

## Important Implementation Notes

### File Never Loads If Duplicate

**Critical**: When a duplicate is detected, the file **never enters the component state**. The `selectedFile` remains `null` and the form shows empty.

**Why This Matters**: 
- Clear visual feedback (no file selected)
- Prevents user confusion
- Upload button stays disabled
- User must select different file

### Form Fields Persist

**Design Choice**: Title, artist, and genre fields are **NOT cleared** when duplicate is detected.

**Rationale**: User may want to upload a similar but different file with same metadata. Preserving fields saves time.

### Alert Before Load

**Timing**: Alert is shown **before** any file loading occurs.

**Sequence**:
1. Duplicate detected
2. Alert shown
3. User clicks OK
4. File input cleared
5. Form remains empty

**Not This**:
1. ~~File loads into form~~
2. ~~Then alert shown~~
3. ~~Then file removed~~

### No Custom Modal

**Current Implementation**: Uses browser `alert()`, not custom modal component.

**For Mobile**: You may want to use platform-native alert or custom modal for better UX.

### State Split

**Store State**: Fingerprint generation and duplicate detection flags

**Component State**: File selection, preview, and form fields

**Why Split**: Store manages reusable fingerprint logic, component manages UI state

---

## Troubleshooting

### Issue: File loads even when duplicate

**Cause**: Not checking `result.success` before loading file

**Solution**:
```typescript
const result = await uploadStore.handleFileSelection(file);
if (result.success) {  // ← Check this!
  selectedFile.value = file;
  // ...
}
```

### Issue: Alert not showing

**Cause**: Alert in wrong branch or missing

**Solution**: Alert should be in the `else` block:
```typescript
if (result.success) {
  // Load file
} else {
  alert(result.message);  // ← Here
}
```

### Issue: Upload button stays enabled for duplicates

**Cause**: Missing `!uploadStore.isDuplicate` in `canUpload`

**Solution**: Include in computed property:
```typescript
const canUpload = computed(() => {
  return /* ... */ && !uploadStore.isDuplicate;
});
```

### Issue: State not clearing between files

**Cause**: Not calling `clearFingerprintState()` before new selection

**Solution**: Call before `handleFileSelection`:
```typescript
uploadStore.clearFingerprintState();
const result = await uploadStore.handleFileSelection(file);
```

### Issue: Processing spinner never appears

**Cause**: Not showing UI based on `isGeneratingFingerprint` state

**Solution**: Add UI condition:
```vue
<span v-if="uploadStore.isGeneratingFingerprint">Processing...</span>
```

---

## Mobile App Recommendations

### Consider Custom UI Instead of Alert

**Web App**: Uses browser `alert()`

**Mobile Consideration**: Platform-native dialogs or custom modals may provide better UX

**Options**:
1. **iOS**: `UIAlertController` (native)
2. **Android**: `AlertDialog` (native)
3. **Ionic**: `ion-alert` component
4. **Custom**: In-app modal component

### Visual Feedback Enhancements

**Web App**: Simple status indicator + button state

**Mobile Opportunities**:
- Haptic feedback on duplicate detection
- Animated transitions for state changes
- Toast notification for quick feedback
- Inline error message below file selector

### State Persistence

**Web App**: Form fields persist (title, artist, genre)

**Mobile**: Consider saving draft state across app restarts for better UX

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `store/uploadStore.ts` (handleFileSelection)
- **Component Integration**: `components/dashboard/songUploader.vue`
- **RPC Function**: `check_audio_fingerprint` in database

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

---

## Quick Reference

### Key Function Signature

```typescript
handleFileSelection(file: File): Promise<{ success: boolean; message: string }>
```

### Success Response

```typescript
{
  success: true,
  message: 'File ready for upload'
}
```

### Failure Response (Duplicate)

```typescript
{
  success: false,
  message: 'This audio file has already been uploaded'
}
```

### State Checks

```typescript
// Can upload?
uploadStore.fingerprintGenerated && !uploadStore.isDuplicate

// Is processing?
uploadStore.isGeneratingFingerprint

// Is duplicate?
uploadStore.isDuplicate
```

### Integration Pattern

```typescript
// 1. Clear states
uploadStore.clearUploadStatus()
uploadStore.clearFingerprintState()

// 2. Check file
const result = await uploadStore.handleFileSelection(file)

// 3. Handle result
if (result.success) {
  // Load file into form
} else {
  // Show alert and block
  alert(result.message)
}
```

