# WAV to MP3 Conversion - Web App Implementation Reference

**Document Purpose**: This document provides exact implementation details of the WAV→MP3 conversion from the production web app, enabling 1:1 parity in mobile apps with identical MP3 output quality, size, and behavior.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `utils/audioConverterWebAudio.ts` (complete file, 211 lines)
- `package.json` (dependency configuration)

---

## Table of Contents

1. [Overview](#overview)
2. [LameJS Integration](#lamejs-integration)
3. [Encoder Configuration](#encoder-configuration)
4. [Audio Decoding Pipeline](#audio-decoding-pipeline)
5. [PCM Conversion](#pcm-conversion)
6. [Channel Handling](#channel-handling)
7. [Encoding Loop](#encoding-loop)
8. [Finalization](#finalization)
9. [Progress Reporting](#progress-reporting)
10. [Cross-Browser Support](#cross-browser-support)
11. [Error Handling](#error-handling)
12. [Performance Characteristics](#performance-characteristics)
13. [Complete Code Reference](#complete-code-reference)
14. [Implementation Checklist](#implementation-checklist)

---

## Overview

The web app uses **client-side audio conversion** to convert WAV files to MP3 format before upload. This is critical for reducing storage costs, as WAV files are typically 10x larger than MP3 files.

**Key Characteristics:**
- **Library**: LameJS (lamejs-fixed package)
- **Execution**: Main thread (no Web Workers)
- **Bitrate**: 128 kbps constant
- **Sample Rate**: Preserved from original (no resampling)
- **Channels**: Preserved (mono stays mono, stereo stays stereo)
- **Compression**: ~10:1 for WAV files
- **Duration**: 30-60 seconds for large files

**Why This Matters:**
WAV files can be 50-100MB for a 3-minute song. Converting to MP3 at 128kbps reduces this to 5-10MB, saving significant storage costs while maintaining good audio quality.

---

## LameJS Integration

### Package Information

**Package Name**: `lamejs-fixed`  
**Version**: `1.2.2`  
**Why "fixed"**: The original `lamejs` package has compatibility issues. The `lamejs-fixed` fork resolves these.

**Location**: `package.json` (line 20)

```json
{
  "dependencies": {
    "lamejs-fixed": "^1.2.2"
  }
}
```

### Import Statement

**Location**: `utils/audioConverterWebAudio.ts` (line 2)

```typescript
import * as lamejs from 'lamejs-fixed';
```

**Critical Details**:
- Use `import *` namespace import
- NOT `import lamejs` (default import)
- NOT `import { Mp3Encoder }` (named import)

### Initialization and Testing

**Location**: `utils/audioConverterWebAudio.ts` (lines 20-37)

```typescript
async initialize(): Promise<boolean> {
  // Server-side guard
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
    console.log('WebAudioMP3Converter: Web Audio API not available');
    return false;
  }

  try {
    // Test if lamejs is working
    const testEncoder = new lamejs.Mp3Encoder(1, 44100, 128);
    this.initialized = true;
    console.log('WebAudioMP3Converter: Initialization successful! 🎉');
    return true;
  } catch (error) {
    console.error('WebAudioMP3Converter: Initialization failed:', error);
    return false;
  }
}
```

**Test Parameters**:
- `1` - Mono (1 channel)
- `44100` - Standard sample rate (44.1kHz)
- `128` - Bitrate in kbps

**Purpose**: Verifies LameJS loads correctly before attempting conversion.

---

## Encoder Configuration

### Encoder Instantiation

**Location**: `utils/audioConverterWebAudio.ts` (lines 87-89)

```typescript
// Initialize MP3 encoder
// Using 128kbps bitrate, same as our FFmpeg config
const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
```

### Parameters Explained

#### Parameter 1: Channels

**Type**: `number`  
**Value**: Dynamic (1 or 2)  
**Source**: `audioBuffer.numberOfChannels`

```typescript
const channels = audioBuffer.numberOfChannels;
```

**Behavior**:
- `1` = Mono audio
- `2` = Stereo audio
- Preserves original channel configuration

#### Parameter 2: Sample Rate

**Type**: `number`  
**Value**: Dynamic (typically 44100 or 48000)  
**Source**: `audioBuffer.sampleRate`

```typescript
const sampleRate = audioBuffer.sampleRate;
```

**Behavior**:
- **No resampling** - uses original sample rate
- Common values: 44100 Hz, 48000 Hz, 22050 Hz
- Input rate = Output rate

#### Parameter 3: Bitrate

**Type**: `number`  
**Value**: `128` (constant)  
**Unit**: kbps (kilobits per second)

**Rationale**:
- 128 kbps provides good quality while minimizing file size
- Matches backend FFmpeg configuration
- Standard for music distribution

### Complete Constructor Call

```typescript
new lamejs.Mp3Encoder(
  channels,    // 1 for mono, 2 for stereo
  sampleRate,  // Original sample rate (no resampling)
  128          // 128 kbps constant bitrate
)
```

---

## Audio Decoding Pipeline

### Step 1: Create AudioContext

**Location**: `utils/audioConverterWebAudio.ts` (line 58)

```typescript
// Create audio context
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
```

**Cross-Browser Support**:
- Primary: `window.AudioContext` (modern browsers)
- Fallback: `window.webkitAudioContext` (Safari, older browsers)

### Step 2: Read File as ArrayBuffer

**Location**: `utils/audioConverterWebAudio.ts` (line 61)

```typescript
// Read file as array buffer
const arrayBuffer = await file.arrayBuffer();
```

**What This Does**: Converts the File object to raw binary data (ArrayBuffer).

### Step 3: Decode Audio Data

**Location**: `utils/audioConverterWebAudio.ts` (lines 63-66)

```typescript
progressCallback?.(10, 'Decoding audio...');

// Decode audio data
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
```

**What This Does**: 
- Decodes WAV/audio file into raw PCM audio samples
- Returns `AudioBuffer` with decoded audio data
- Automatically handles different audio formats

### Step 4: Extract Audio Information

**Location**: `utils/audioConverterWebAudio.ts` (lines 71-75)

```typescript
// Get audio data (convert to mono for simplicity, but keep stereo if needed)
const channels = audioBuffer.numberOfChannels;
const sampleRate = audioBuffer.sampleRate;
const samples = audioBuffer.length;

console.log(`WebAudioMP3Converter: Input - ${channels} channels, ${sampleRate}Hz, ${samples} samples`);
```

**Information Extracted**:
- **channels**: Number of audio channels (1 or 2)
- **sampleRate**: Samples per second (Hz)
- **samples**: Total number of samples in audio

**Example Log Output**:
```
WebAudioMP3Converter: Input - 2 channels, 44100Hz, 7938000 samples
```

### Step 5: Extract Channel Data

**Location**: `utils/audioConverterWebAudio.ts` (lines 78-79)

```typescript
// Convert to the format expected by lamejs
let leftChannel = audioBuffer.getChannelData(0);
let rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
```

**Channel Extraction**:
- `leftChannel`: Always extracted (index 0)
- `rightChannel`: 
  - If stereo (channels > 1): Extract separate right channel (index 1)
  - If mono: Use same data as left channel (duplicate)

**Data Type**: `Float32Array` (floating-point samples, range -1.0 to 1.0)

---

## PCM Conversion

### Why Conversion is Needed

LameJS encoder expects **16-bit signed integers** (Int16), but AudioBuffer provides **32-bit floating-point** (Float32). We must convert between formats.

### Conversion Algorithm

**Location**: `utils/audioConverterWebAudio.ts` (lines 196-203)

```typescript
// Convert float32 samples to 16-bit PCM
private floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
  }
  return output;
}
```

### Step-by-Step Breakdown

#### Step 1: Clamping

```typescript
const sample = Math.max(-1, Math.min(1, input[i]));
```

**Purpose**: Ensures sample is within valid range [-1.0, 1.0]

**Why**: Prevents clipping and distortion from out-of-range values

**Examples**:
- Input: `1.5` → Clamped: `1.0`
- Input: `-1.2` → Clamped: `-1.0`
- Input: `0.5` → Clamped: `0.5`

#### Step 2: Scaling

```typescript
output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
```

**Negative Samples** (sample < 0):
- Multiply by `0x8000` (32768 in decimal)
- Range: -1.0 to 0.0 → -32768 to 0

**Positive Samples** (sample >= 0):
- Multiply by `0x7FFF` (32767 in decimal)
- Range: 0.0 to 1.0 → 0 to 32767

**Why Different Values**:
- Int16 range: -32768 to 32767 (asymmetric)
- Prevents overflow on negative side
- Maximizes precision on positive side

### Example Conversions

| Float32 Input | Clamped | Calculation | Int16 Output |
|---------------|---------|-------------|--------------|
| -1.0 | -1.0 | -1.0 × 32768 | -32768 |
| -0.5 | -0.5 | -0.5 × 32768 | -16384 |
| 0.0 | 0.0 | 0.0 × 32767 | 0 |
| 0.5 | 0.5 | 0.5 × 32767 | 16383 |
| 1.0 | 1.0 | 1.0 × 32767 | 32767 |
| 1.5 | 1.0 | 1.0 × 32767 | 32767 |

### Usage in Pipeline

**Location**: `utils/audioConverterWebAudio.ts` (lines 82-83)

```typescript
// Convert float32 samples to 16-bit integers
const leftInt16 = this.floatTo16BitPCM(leftChannel);
const rightInt16 = this.floatTo16BitPCM(rightChannel);
```

Both channels are converted independently.

---

## Channel Handling

### Channel Detection

**Location**: `utils/audioConverterWebAudio.ts` (lines 71, 78-79)

```typescript
const channels = audioBuffer.numberOfChannels;

let leftChannel = audioBuffer.getChannelData(0);
let rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
```

### Mono Audio (1 Channel)

**Detection**: `channels === 1`

**Handling**:
```typescript
leftChannel = audioBuffer.getChannelData(0);  // Extract single channel
rightChannel = leftChannel;                   // Duplicate for encoder
```

**Encoder Call**:
```typescript
mp3buf = mp3encoder.encodeBuffer(leftChunk);  // Single channel
```

**Result**: Mono MP3 file

### Stereo Audio (2 Channels)

**Detection**: `channels === 2` (or `channels > 1`)

**Handling**:
```typescript
leftChannel = audioBuffer.getChannelData(0);   // Left channel
rightChannel = audioBuffer.getChannelData(1);  // Right channel (separate)
```

**Encoder Call**:
```typescript
mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);  // Both channels
```

**Result**: Stereo MP3 file

### No Downmixing

**Critical**: The web app does **NOT** downmix stereo to mono.

**Behavior**:
- Mono input → Mono output
- Stereo input → Stereo output
- Channel configuration is preserved

**Why This Matters**: Downmixing would reduce file size but lose stereo imaging, which is undesirable for music.

---

## Encoding Loop

### Block Size

**Location**: `utils/audioConverterWebAudio.ts` (line 92)

```typescript
const blockSize = 1152; // Standard MP3 frame size
```

**Why 1152**: This is the standard MP3 frame size. LameJS expects chunks of this size for optimal encoding.

### Loop Structure

**Location**: `utils/audioConverterWebAudio.ts` (lines 92-112)

```typescript
// Encode in chunks
const blockSize = 1152; // Standard MP3 frame size
const mp3Data: Uint8Array[] = [];

for (let i = 0; i < samples; i += blockSize) {
  const progress = 50 + (i / samples) * 40; // 50% to 90%
  progressCallback?.(Math.round(progress), 'Encoding to MP3...');
  
  const leftChunk = leftInt16.subarray(i, i + blockSize);
  const rightChunk = rightInt16.subarray(i, i + blockSize);
  
  let mp3buf;
  if (channels === 1) {
    mp3buf = mp3encoder.encodeBuffer(leftChunk);
  } else {
    mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
  }
  
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }
}
```

### Step-by-Step Breakdown

#### Step 1: Initialize Storage

```typescript
const mp3Data: Uint8Array[] = [];
```

**Purpose**: Array to collect all encoded MP3 chunks

#### Step 2: Loop Through Samples

```typescript
for (let i = 0; i < samples; i += blockSize)
```

**Iteration**:
- Start: `i = 0`
- Increment: `i += 1152` each iteration
- End: When `i >= samples`

#### Step 3: Report Progress

```typescript
const progress = 50 + (i / samples) * 40; // 50% to 90%
progressCallback?.(Math.round(progress), 'Encoding to MP3...');
```

**Calculation**:
- Base: 50% (decoding/preparation already done)
- Range: 40% (encoding takes 50% to 90%)
- Formula: `50 + (current / total) * 40`

**Example**:
- 0% through samples: 50% progress
- 50% through samples: 70% progress
- 100% through samples: 90% progress

#### Step 4: Extract Chunks

```typescript
const leftChunk = leftInt16.subarray(i, i + blockSize);
const rightChunk = rightInt16.subarray(i, i + blockSize);
```

**Method**: `subarray()` creates a view (no copying) of the specified range

**Range**: From index `i` to `i + blockSize` (1152 samples)

**Note**: Last chunk may be smaller if `samples` isn't evenly divisible by 1152

#### Step 5: Encode Chunk

```typescript
let mp3buf;
if (channels === 1) {
  mp3buf = mp3encoder.encodeBuffer(leftChunk);
} else {
  mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
}
```

**Mono Encoding**:
- Method: `encodeBuffer(leftChunk)`
- Single parameter

**Stereo Encoding**:
- Method: `encodeBuffer(leftChunk, rightChunk)`
- Two parameters (left and right channels)

**Return**: `Uint8Array` containing encoded MP3 data for this chunk

#### Step 6: Collect Non-Empty Buffers

```typescript
if (mp3buf.length > 0) {
  mp3Data.push(mp3buf);
}
```

**Check**: Only add if buffer has data (sometimes encoding produces empty buffers)

**Storage**: Append to `mp3Data` array

---

## Finalization

### Flush Remaining Data

**Location**: `utils/audioConverterWebAudio.ts` (lines 114-120)

```typescript
progressCallback?.(90, 'Finalizing MP3...');

// Flush remaining data
const mp3buf = mp3encoder.flush();
if (mp3buf.length > 0) {
  mp3Data.push(mp3buf);
}
```

**Purpose**: The encoder may buffer some data internally. `flush()` ensures all data is encoded.

**Critical**: Always call `flush()` after encoding loop completes.

### Combine All Chunks

**Location**: `utils/audioConverterWebAudio.ts` (lines 122-130)

```typescript
// Combine all MP3 data
const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
const mp3Buffer = new Uint8Array(totalLength);
let offset = 0;

for (const chunk of mp3Data) {
  mp3Buffer.set(chunk, offset);
  offset += chunk.length;
}
```

#### Step 1: Calculate Total Length

```typescript
const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
```

**Purpose**: Sum the lengths of all chunks to allocate correct buffer size

#### Step 2: Allocate Buffer

```typescript
const mp3Buffer = new Uint8Array(totalLength);
```

**Purpose**: Create single continuous buffer for entire MP3 file

#### Step 3: Copy Chunks

```typescript
let offset = 0;
for (const chunk of mp3Data) {
  mp3Buffer.set(chunk, offset);
  offset += chunk.length;
}
```

**Process**:
- Start at offset 0
- Copy each chunk into buffer
- Increment offset by chunk length
- Result: All chunks concatenated sequentially

### Create File Object

**Location**: `utils/audioConverterWebAudio.ts` (lines 132-135)

```typescript
// Create output file
const outputFile = new File([mp3Buffer], file.name.replace(/\.[^/.]+$/, '.mp3'), {
  type: 'audio/mpeg'
});
```

#### Parameters

**Parameter 1: Data**
```typescript
[mp3Buffer]
```
Array containing the Uint8Array buffer

**Parameter 2: Filename**
```typescript
file.name.replace(/\.[^/.]+$/, '.mp3')
```

**Regex Explanation**:
- `/\.[^/.]+$/` - Matches file extension
- `\.` - Literal dot
- `[^/.]+` - One or more characters that aren't dot or slash
- `$` - End of string

**Examples**:
- `song.wav` → `song.mp3`
- `my-track.wave` → `my-track.mp3`
- `audio.m4a` → `audio.mp3`

**Parameter 3: Options**
```typescript
{
  type: 'audio/mpeg'
}
```

**MIME Type**: `'audio/mpeg'` - Standard MIME type for MP3 files

**Critical**: Use exact string `'audio/mpeg'` (not `'audio/mp3'`)

### Cleanup

**Location**: `utils/audioConverterWebAudio.ts` (line 142)

```typescript
// Clean up
audioContext.close();
```

**Purpose**: Releases system resources used by AudioContext

**Important**: Always close AudioContext when done to prevent memory leaks

---

## Progress Reporting

### Progress Callback Interface

**Location**: `utils/audioConverterWebAudio.ts` (lines 13-15)

```typescript
export interface ProgressCallback {
  (percent: number, stage: string): void;
}
```

**Parameters**:
- `percent`: Number from 0 to 100
- `stage`: Descriptive string of current operation

### Progress Stages

#### Stage 1: Loading (0%)

**Location**: `utils/audioConverterWebAudio.ts` (line 55)

```typescript
progressCallback?.(0, 'Loading audio file...');
```

**When**: Beginning of conversion, before reading file

#### Stage 2: Decoding (10%)

**Location**: `utils/audioConverterWebAudio.ts` (line 63)

```typescript
progressCallback?.(10, 'Decoding audio...');
```

**When**: Before calling `decodeAudioData()`

#### Stage 3: Preparing (30%)

**Location**: `utils/audioConverterWebAudio.ts` (line 68)

```typescript
progressCallback?.(30, 'Preparing for MP3 encoding...');
```

**When**: After decoding, before encoding loop

#### Stage 4: Encoding (50% - 90%)

**Location**: `utils/audioConverterWebAudio.ts` (lines 96-97)

```typescript
const progress = 50 + (i / samples) * 40; // 50% to 90%
progressCallback?.(Math.round(progress), 'Encoding to MP3...');
```

**When**: During encoding loop (each chunk)

**Calculation**:
- Minimum: 50%
- Maximum: 90%
- Incremental based on samples processed

#### Stage 5: Finalizing (90%)

**Location**: `utils/audioConverterWebAudio.ts` (line 114)

```typescript
progressCallback?.(90, 'Finalizing MP3...');
```

**When**: After encoding loop, during flush and buffer concatenation

#### Stage 6: Complete (100%)

**Location**: `utils/audioConverterWebAudio.ts` (line 137)

```typescript
progressCallback?.(100, 'Conversion complete!');
```

**When**: After file creation, before returning

### Progress Timeline

```
0%   - Loading audio file...
10%  - Decoding audio...
30%  - Preparing for MP3 encoding...
50%  - Encoding to MP3... (start)
70%  - Encoding to MP3... (middle)
90%  - Finalizing MP3...
100% - Conversion complete!
```

### Usage Example

```typescript
const onProgress = (percent: number, stage: string) => {
  console.log(`${percent}% - ${stage}`);
  // Update UI progress bar
};

await converter.convertToMp3(wavFile, onProgress);
```

---

## Cross-Browser Support

### AudioContext Compatibility

**Location**: `utils/audioConverterWebAudio.ts` (line 58)

```typescript
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
```

**Strategy**: Try standard API first, fallback to vendor-prefixed version

**Browsers**:
- Chrome, Firefox, Edge: `window.AudioContext`
- Safari, older browsers: `window.webkitAudioContext`

**TypeScript Handling**: Cast to `any` to avoid type errors on `webkitAudioContext`

### Server-Side Rendering Guard

**Location**: `utils/audioConverterWebAudio.ts` (lines 22-25)

```typescript
// Server-side guard
if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
  console.log('WebAudioMP3Converter: Web Audio API not available');
  return false;
}
```

**Purpose**: Prevents crashes during server-side rendering (SSR) in Nuxt/Next.js

**Checks**:
1. `typeof window === 'undefined'` - No browser environment
2. `typeof AudioContext === 'undefined'` - No Web Audio API support

### Safari/iOS Specific Considerations

**No Special Handling Needed**: The webkitAudioContext fallback handles Safari automatically.

**iOS Limitations**:
- May have memory constraints for very large files
- Main thread execution may cause UI freezing
- Consider showing loading state during conversion

### Browser Support Matrix

| Browser | AudioContext | Support | Notes |
|---------|--------------|---------|-------|
| Chrome | ✅ Standard | Full | No issues |
| Firefox | ✅ Standard | Full | No issues |
| Safari | ⚠️ webkit prefixed | Full | Use fallback |
| Edge | ✅ Standard | Full | No issues |
| iOS Safari | ⚠️ webkit prefixed | Full | Memory constraints |
| Opera | ✅ Standard | Full | No issues |

---

## Error Handling

### Initialization Errors

**Location**: `utils/audioConverterWebAudio.ts` (lines 33-36)

```typescript
} catch (error) {
  console.error('WebAudioMP3Converter: Initialization failed:', error);
  return false;
}
```

**Possible Causes**:
- LameJS not loaded
- Browser doesn't support required APIs
- Memory allocation failure

**Handling**: Return `false` to indicate failure

### Conversion Errors

**Location**: `utils/audioConverterWebAudio.ts` (lines 146-149)

```typescript
} catch (error) {
  console.error('WebAudioMP3Converter: Conversion failed:', error);
  throw error;
}
```

**Possible Causes**:
- File read failure
- Unsupported audio format
- Decoding error (corrupt file)
- Out of memory
- Encoding failure

**Handling**: Log error and re-throw for caller to handle

### Pre-Conversion Validation

**Location**: `utils/audioConverterWebAudio.ts` (lines 50-52)

```typescript
if (!this.isReady()) {
  throw new Error('Converter not initialized. Call initialize() first.');
}
```

**Purpose**: Ensures converter is initialized before attempting conversion

### Cleanup on Error

**Location**: `utils/audioConverterWebAudio.ts` (line 142)

```typescript
// Clean up
audioContext.close();
```

**Important**: This happens in the success path. On error, AudioContext may leak.

**Recommendation**: Wrap in try-finally for guaranteed cleanup:

```typescript
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
try {
  // conversion logic
} finally {
  audioContext.close();
}
```

### Error Messages

**Common Errors**:
1. `"Converter not initialized"` - Call `initialize()` first
2. `"Web Audio API not available"` - Browser/environment not supported
3. Decoding errors - Invalid or corrupt audio file
4. Memory errors - File too large for available RAM

---

## Performance Characteristics

### Execution Environment

**Thread**: **Main thread** (UI thread)

**Important**: No Web Workers used. Conversion blocks the main thread.

**Implications**:
- UI may freeze during conversion
- Show loading indicator
- Avoid starting conversion during critical UI interactions

### Memory Usage

**Peak Memory**: Approximately 3-4× file size

**Breakdown**:
- Original file in memory
- Decoded audio buffer (Float32)
- PCM converted data (Int16)
- Encoded MP3 chunks

**Example**: 50MB WAV file → ~150-200MB peak memory usage

### Conversion Times

**Factors**:
- File size
- CPU speed
- Browser performance
- Audio length

**Typical Times**:
- Small file (5MB, 1 minute): 5-10 seconds
- Medium file (25MB, 3 minutes): 15-30 seconds
- Large file (50MB, 5 minutes): 30-60 seconds

### Compression Ratios

**WAV to MP3 (128kbps)**:
- Ratio: ~10:1 (90% reduction)
- Example: 50MB WAV → 5MB MP3

**M4A to MP3 (128kbps)**:
- Ratio: ~2:1 (50% reduction)
- Example: 10MB M4A → 5MB MP3

**Formula**:
```
Output size (bytes) = (bitrate × duration) / 8
                    = (128000 × seconds) / 8
```

**Example**:
- 3 minute song = 180 seconds
- Size = (128000 × 180) / 8 = 2,880,000 bytes ≈ 2.88 MB

### Optimization Notes

**Current Implementation**:
- ✅ Chunked encoding (memory efficient)
- ✅ Progress reporting (UX)
- ✅ No unnecessary copies (subarray views)
- ❌ Main thread (UI blocking)
- ❌ No worker support

**Potential Improvements** (not in current implementation):
- Move to Web Worker (non-blocking)
- Stream processing for very large files
- Early termination support

---

## Complete Code Reference

### File Structure

**File**: `utils/audioConverterWebAudio.ts`  
**Lines**: 211 total

**Sections**:
- Lines 1-11: Imports and interfaces
- Lines 13-15: ProgressCallback interface
- Lines 17-204: WebAudioMP3Converter class
- Lines 206-211: Singleton export

### Class: WebAudioMP3Converter

#### Properties

```typescript
private initialized = false;
```

#### Methods

**1. initialize()**  
Lines: 20-37  
Purpose: Initialize and test LameJS encoder

**2. initializeWithFallbacks()**  
Lines: 40-42  
Purpose: Compatibility method (calls initialize)

**3. isReady()**  
Lines: 45-47  
Purpose: Check if converter is initialized

**4. convertToMp3()**  
Lines: 49-150  
Purpose: Main conversion method (returns File)

**5. convertToMP3()**  
Lines: 153-171  
Purpose: Compatibility wrapper (returns ConversionResult)

**6. isConversionNeeded()**  
Lines: 174-181  
Purpose: Check if file needs conversion

**7. getEstimatedCompressionRatio()**  
Lines: 184-193  
Purpose: Estimate compression ratio for file type

**8. floatTo16BitPCM()**  
Lines: 196-203  
Purpose: Convert Float32Array to Int16Array

### Complete convertToMp3() Method

**Location**: `utils/audioConverterWebAudio.ts` (lines 49-150)

```typescript
async convertToMp3(file: File, progressCallback?: ProgressCallback): Promise<File> {
  if (!this.isReady()) {
    throw new Error('Converter not initialized. Call initialize() first.');
  }

  try {
    progressCallback?.(0, 'Loading audio file...');
    
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    progressCallback?.(10, 'Decoding audio...');
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    progressCallback?.(30, 'Preparing for MP3 encoding...');
    
    // Get audio data (convert to mono for simplicity, but keep stereo if needed)
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    
    console.log(`WebAudioMP3Converter: Input - ${channels} channels, ${sampleRate}Hz, ${samples} samples`);
    
    // Convert to the format expected by lamejs
    let leftChannel = audioBuffer.getChannelData(0);
    let rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
    
    // Convert float32 samples to 16-bit integers
    const leftInt16 = this.floatTo16BitPCM(leftChannel);
    const rightInt16 = this.floatTo16BitPCM(rightChannel);
    
    progressCallback?.(50, 'Encoding to MP3...');
    
    // Initialize MP3 encoder
    // Using 128kbps bitrate, same as our FFmpeg config
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    
    // Encode in chunks
    const blockSize = 1152; // Standard MP3 frame size
    const mp3Data: Uint8Array[] = [];
    
    for (let i = 0; i < samples; i += blockSize) {
      const progress = 50 + (i / samples) * 40; // 50% to 90%
      progressCallback?.(Math.round(progress), 'Encoding to MP3...');
      
      const leftChunk = leftInt16.subarray(i, i + blockSize);
      const rightChunk = rightInt16.subarray(i, i + blockSize);
      
      let mp3buf;
      if (channels === 1) {
        mp3buf = mp3encoder.encodeBuffer(leftChunk);
      } else {
        mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      }
      
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    progressCallback?.(90, 'Finalizing MP3...');
    
    // Flush remaining data
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    // Combine all MP3 data
    const totalLength = mp3Data.reduce((sum, chunk) => sum + chunk.length, 0);
    const mp3Buffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const chunk of mp3Data) {
      mp3Buffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Create output file
    const outputFile = new File([mp3Buffer], file.name.replace(/\.[^/.]+$/, '.mp3'), {
      type: 'audio/mpeg'
    });
    
    progressCallback?.(100, 'Conversion complete!');
    
    console.log(`WebAudioMP3Converter: Conversion successful! ${file.size} → ${outputFile.size} bytes (${Math.round((1 - outputFile.size / file.size) * 100)}% reduction)`);
    
    // Clean up
    audioContext.close();
    
    return outputFile;

  } catch (error) {
    console.error('WebAudioMP3Converter: Conversion failed:', error);
    throw error;
  }
}
```

### Singleton Pattern

**Location**: `utils/audioConverterWebAudio.ts` (lines 206-211)

```typescript
// Create singleton instance
const webAudioConverter = new WebAudioMP3Converter();

// Export both the class and default instance for compatibility
export { WebAudioMP3Converter };
export default webAudioConverter;
```

**Usage**:
```typescript
import webAudioConverter from '~/utils/audioConverterWebAudio';

// Initialize once
await webAudioConverter.initialize();

// Use multiple times
const mp3File = await webAudioConverter.convertToMp3(wavFile, onProgress);
```

---

## Implementation Checklist

### Package Installation

- [ ] Install `lamejs-fixed` package (version 1.2.2 or compatible)
- [ ] Verify package in dependencies (not devDependencies)
- [ ] Test import works: `import * as lamejs from 'lamejs-fixed';`

### Encoder Setup

- [ ] Create WebAudioMP3Converter class
- [ ] Implement `initialize()` method with test encoder
- [ ] Use exact constructor: `new lamejs.Mp3Encoder(channels, sampleRate, 128)`
- [ ] Add server-side rendering guard
- [ ] Return boolean from initialization

### Audio Decoding Pipeline

- [ ] Create AudioContext with webkit fallback
- [ ] Read file as ArrayBuffer using `file.arrayBuffer()`
- [ ] Decode with `audioContext.decodeAudioData(arrayBuffer)`
- [ ] Extract channels, sampleRate, samples from AudioBuffer
- [ ] Get left channel with `audioBuffer.getChannelData(0)`
- [ ] Get right channel (or duplicate left if mono)

### PCM Conversion

- [ ] Implement `floatTo16BitPCM()` method
- [ ] Clamp samples to [-1, 1] range
- [ ] Scale negative samples by 0x8000
- [ ] Scale positive samples by 0x7FFF
- [ ] Return Int16Array
- [ ] Convert both left and right channels

### Channel Handling

- [ ] Detect mono vs stereo from `numberOfChannels`
- [ ] For mono: use same data for both channels
- [ ] For stereo: use separate left and right channels
- [ ] No downmixing - preserve original configuration
- [ ] Pass correct channel count to encoder constructor

### Encoding Loop

- [ ] Set block size to 1152 samples
- [ ] Create empty array for MP3 chunks
- [ ] Loop from 0 to samples, incrementing by blockSize
- [ ] Extract chunks with `subarray(i, i + blockSize)`
- [ ] Encode mono: `encodeBuffer(leftChunk)`
- [ ] Encode stereo: `encodeBuffer(leftChunk, rightChunk)`
- [ ] Only push non-empty buffers
- [ ] Calculate and report progress (50%-90%)

### Finalization

- [ ] Call `encoder.flush()` after loop
- [ ] Push flush result if non-empty
- [ ] Calculate total length with reduce
- [ ] Create Uint8Array with total length
- [ ] Copy all chunks with offset tracking
- [ ] Create File with MP3 buffer
- [ ] Use MIME type: `'audio/mpeg'`
- [ ] Replace file extension to `.mp3`
- [ ] Close AudioContext

### Progress Reporting

- [ ] Define ProgressCallback interface
- [ ] Report 0% - "Loading audio file..."
- [ ] Report 10% - "Decoding audio..."
- [ ] Report 30% - "Preparing for MP3 encoding..."
- [ ] Report 50-90% - "Encoding to MP3..." (incremental)
- [ ] Report 90% - "Finalizing MP3..."
- [ ] Report 100% - "Conversion complete!"
- [ ] Use optional chaining: `progressCallback?.(percent, stage)`

### Error Handling

- [ ] Guard against uninitialized converter
- [ ] Check for Web Audio API availability
- [ ] Wrap conversion in try-catch
- [ ] Log errors with descriptive messages
- [ ] Re-throw errors for caller to handle
- [ ] Clean up AudioContext on completion

### Cross-Browser Support

- [ ] Use AudioContext || webkitAudioContext fallback
- [ ] Add TypeScript any casting for webkit
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on iOS Safari
- [ ] Verify SSR guard prevents crashes

### Testing

- [ ] Test with mono WAV file
- [ ] Test with stereo WAV file
- [ ] Test with different sample rates (44.1kHz, 48kHz)
- [ ] Verify output is ~10:1 compression ratio
- [ ] Verify output plays correctly
- [ ] Verify MIME type is 'audio/mpeg'
- [ ] Verify filename extension is '.mp3'
- [ ] Test progress callback receives updates
- [ ] Test error handling with corrupt files
- [ ] Verify memory cleanup (no leaks)

### Integration

- [ ] Import in upload store/service
- [ ] Call `initialize()` on app start
- [ ] Check `isReady()` before conversion
- [ ] Pass progress callback to update UI
- [ ] Handle conversion errors gracefully
- [ ] Show loading state during conversion
- [ ] Upload converted MP3 file (not original)

---

## Quick Reference

### Critical Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Package** | `lamejs-fixed` | NOT standard `lamejs` |
| **Version** | `1.2.2` | Or compatible |
| **Import** | `import * as lamejs` | Namespace import |
| **Bitrate** | `128` kbps | Constant |
| **Block Size** | `1152` samples | Standard MP3 frame |
| **MIME Type** | `'audio/mpeg'` | Exact string |
| **PCM Negative** | `× 0x8000` | 32768 decimal |
| **PCM Positive** | `× 0x7FFF` | 32767 decimal |

### Encoder Constructor

```typescript
new lamejs.Mp3Encoder(
  channels,    // 1 or 2 (from audioBuffer.numberOfChannels)
  sampleRate,  // Original rate (from audioBuffer.sampleRate)
  128          // Constant 128 kbps
)
```

### Encoding Methods

**Mono**:
```typescript
const mp3buf = encoder.encodeBuffer(leftChunk);
```

**Stereo**:
```typescript
const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
```

**Flush**:
```typescript
const mp3buf = encoder.flush();
```

### File Creation

```typescript
const outputFile = new File(
  [mp3Buffer],                                    // Data
  file.name.replace(/\.[^/.]+$/, '.mp3'),        // Filename
  { type: 'audio/mpeg' }                         // Options
);
```

---

## Troubleshooting

### "Converter not initialized" Error

**Cause**: Forgot to call `initialize()`

**Solution**:
```typescript
await webAudioConverter.initialize();
```

### "AudioContext is not defined" Error

**Cause**: Running in Node.js or SSR environment

**Solution**: Check for browser environment before importing:
```typescript
if (typeof window !== 'undefined') {
  const converter = await import('~/utils/audioConverterWebAudio');
}
```

### Output File is Empty

**Cause**: Forgot to call `flush()`

**Solution**: Always call `encoder.flush()` after encoding loop

### Output File is Huge

**Cause**: Not actually MP3, possibly concatenating PCM data

**Solution**: Verify using `lamejs.Mp3Encoder`, not raw buffer writing

### Distorted Audio

**Cause**: PCM conversion clamping or scaling incorrect

**Solution**: Use exact formula:
- Negative: `sample * 0x8000`
- Positive: `sample * 0x7FFF`

### Memory Errors

**Cause**: File too large for available memory

**Solution**: 
- Warn users about file size limits
- Consider compressing before upload on server

---

## Differences from Other Implementations

### vs. Standard LameJS

**Package**: Uses `lamejs-fixed` (not `lamejs`)

**Reason**: The original package has compatibility issues with modern build tools

### vs. FFmpeg

**Web App (LameJS)**:
- Client-side (browser)
- JavaScript/WebAssembly
- 128 kbps constant
- No resampling
- Main thread

**Backend (FFmpeg)**:
- Server-side
- Native binary
- 128 kbps constant
- May resample
- Multi-threaded

**Output**: Should be similar quality, both use LAME encoder

### vs. Web Workers Implementation

**Current Implementation**: Main thread

**Alternative**: Web Workers would:
- Not block UI
- Better UX for large files
- More complex setup
- Same output quality

**Note**: Current implementation does NOT use Web Workers

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `utils/audioConverterWebAudio.ts`
- **Package**: `lamejs-fixed` on npm
- **LameJS Docs**: https://github.com/zhuker/lamejs

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

