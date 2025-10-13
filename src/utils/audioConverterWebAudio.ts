/**
 * WAV to MP3 conversion using Web Audio API
 * LameJS integration for MP3 encoding
 * Progress tracking during conversion
 * Estimated compression ratio calculation
 */

// Use fixed build that preserves internal constants (e.g., MPEGMode)
import lamejs from 'lamejs-fixed'

export interface ConversionProgress {
  stage: 'decoding' | 'encoding' | 'complete'
  progress: number // 0-100
  message: string
}

export interface ConversionResult {
  success: boolean
  mp3Blob?: Blob
  originalSize: number
  compressedSize?: number
  compressionRatio?: number
  error?: string
}

/**
 * Convert WAV file to MP3 using Web Audio API and LameJS
 */
export async function convertWavToMp3(
  wavFile: File,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConversionResult> {
  try {
    // Report initial progress
    onProgress?.({
      stage: 'decoding',
      progress: 0,
      message: 'Loading audio file...'
    })

    // Load and decode WAV file
    const arrayBuffer = await wavFile.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    onProgress?.({
      stage: 'decoding',
      progress: 50,
      message: 'Audio decoded, preparing for conversion...'
    })

    // Prepare 16-bit PCM data per channel
    const channels = Math.min(audioBuffer.numberOfChannels, 2) // support mono/stereo
    const length = audioBuffer.length
    const leftF32 = audioBuffer.getChannelData(0)
    const rightF32 = channels === 2 ? audioBuffer.getChannelData(1) : null

    // Convert Float32 [-1,1] to 16-bit PCM per channel
    const leftPCM = new Int16Array(length)
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, leftF32[i]))
      leftPCM[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }

    let rightPCM: Int16Array | null = null
    if (rightF32) {
      rightPCM = new Int16Array(length)
      for (let i = 0; i < length; i++) {
        const s = Math.max(-1, Math.min(1, rightF32[i]))
        rightPCM[i] = s < 0 ? s * 0x8000 : s * 0x7fff
      }
    }
    
    onProgress?.({
      stage: 'encoding',
      progress: 60,
      message: 'Converting to MP3...'
    })

    // Encode to MP3 using LameJS (mono or stereo)
    const mp3Blob = await encodeToMp3({
      leftPCM,
      rightPCM,
      channels,
      sampleRate: audioBuffer.sampleRate,
      onProgress
    })
    
    const originalSize = wavFile.size
    const compressedSize = mp3Blob.size
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Conversion complete!'
    })

    return {
      success: true,
      mp3Blob,
      originalSize,
      compressedSize,
      compressionRatio
    }

  } catch (error) {
    console.error('WAV to MP3 conversion failed:', error)
    return {
      success: false,
      originalSize: wavFile.size,
      error: error instanceof Error ? error.message : 'Unknown conversion error'
    }
  }
}

/**
 * Encode PCM data to MP3 using LameJS
 */
async function encodeToMp3({
  leftPCM,
  rightPCM,
  channels,
  sampleRate,
  onProgress
}: {
  leftPCM: Int16Array
  rightPCM: Int16Array | null
  channels: number
  sampleRate: number
  onProgress?: (progress: ConversionProgress) => void
}): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Initialize MP3 encoder (mono/stereo, sample rate, 128 kbps)
      const bitrateKbps = 128
      const mp3encoder = new (lamejs as any).Mp3Encoder(channels, sampleRate, bitrateKbps)
      const mp3Data: Int8Array[] = []
      
      const samplesPerFrame = 1152
      const totalFrames = Math.ceil(leftPCM.length / samplesPerFrame)
      
      // Process audio in chunks
      for (let i = 0; i < leftPCM.length; i += samplesPerFrame) {
        const currentFrame = Math.floor(i / samplesPerFrame)
        const leftChunk = leftPCM.subarray(i, i + samplesPerFrame)
        let mp3buf: Int8Array
        if (channels === 2 && rightPCM) {
          const rightChunk = rightPCM.subarray(i, i + samplesPerFrame)
          mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk)
        } else {
          mp3buf = mp3encoder.encodeBuffer(leftChunk)
        }
        
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf)
        }
        
        // Report progress every 10 frames
        if (currentFrame % 10 === 0) {
          const progress = 60 + ((currentFrame / totalFrames) * 30)
          onProgress?.({
            stage: 'encoding',
            progress,
            message: `Encoding MP3... ${Math.round(progress)}%`
          })
        }
      }
      
      // Flush encoder
      const mp3buf = mp3encoder.flush()
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf)
      }
      
      onProgress?.({
        stage: 'encoding',
        progress: 90,
        message: 'Finalizing MP3...'
      })
      
      // Convert to Blob
      const blob = new Blob(mp3Data, { type: 'audio/mpeg' })
      resolve(blob)
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Check if file needs conversion (WAV files)
 */
export function needsConversion(file: File): boolean {
  const wavMimeTypes = ['audio/wav', 'audio/wave', 'audio/x-wav']
  return wavMimeTypes.includes(file.type)
}

/**
 * Get estimated compression ratio for WAV to MP3
 */
export function getEstimatedCompressionRatio(fileSizeBytes: number): number {
  // Typical WAV to MP3 compression ratio is 80-90%
  // WAV files are typically 10x larger than MP3
  const sizeInMB = fileSizeBytes / (1024 * 1024)
  
  // Rough estimate: MP3 is about 1/10th the size of WAV
  return Math.round((fileSizeBytes / 10) / (1024 * 1024) * 100) / 100
}

/**
 * Create a new File object with MP3 MIME type
 */
export function createMp3File(mp3Blob: Blob, originalFileName: string): File {
  const mp3FileName = originalFileName.replace(/\.(wav|wave)$/i, '.mp3')
  return new File([mp3Blob], mp3FileName, { type: 'audio/mpeg' })
}
