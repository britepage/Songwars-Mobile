import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import { extractMetadataFromFilename, formatFileSize, isValidAudioFile } from '@/utils/titleExtractor'
import { convertWavToMp3, needsConversion, createMp3File } from '@/utils/audioConverterWebAudio'
import { MASTER_GENRES } from '@/utils/genres'

export interface UploadProgress {
  stage: 'decoding' | 'encoding' | 'uploading' | 'complete'
  progress: number
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

export interface BattleReadyGenre {
  genre: string
  is_battle_ready: boolean
}

export const useUploadStore = defineStore('upload', () => {
  // State
  const uploading = ref(false)
  const uploadMessage = ref('')
  const isSuccess = ref(false)
  const fingerprintGenerated = ref(false)
  const isDuplicate = ref(false)
  const isGeneratingFingerprint = ref(false)
  const conversionStage = ref<'decoding' | 'encoding' | null>(null)
  
  // File and form state
  const selectedFile = ref<File | null>(null)
  const audioPreviewUrl = ref<string | null>(null)
  const songTitle = ref('')
  const artistName = ref('')
  const selectedGenre = ref('')
  const clipStartTime = ref(0)
  const rightsConfirmed = ref(false)
  const audioFingerprint = ref<string | null>(null)
  
  // Battle-ready genres
  const battleReadyGenres = ref<BattleReadyGenre[]>([])
  const isLoadingGenres = ref(false)
  
  // Error handling
  const uploadError = ref<string | null>(null)
  const conversionError = ref<string | null>(null)
  
  // Computed properties
  const canUpload = computed(() => {
    return selectedFile.value && 
           songTitle.value.trim() && 
           artistName.value.trim() && 
           selectedGenre.value &&
           rightsConfirmed.value &&
           !uploading.value &&
           !isGeneratingFingerprint.value &&
           !isDuplicate.value &&
           fingerprintGenerated.value
  })
  
  const hasValidFile = computed(() => {
    return selectedFile.value && isValidAudioFile(selectedFile.value)
  })
  
  const hasCompleteDetails = computed(() => {
    return songTitle.value.trim() && 
           artistName.value.trim() && 
           selectedGenre.value
  })
  
  const fileSizeFormatted = computed(() => {
    return selectedFile.value ? formatFileSize(selectedFile.value.size) : ''
  })
  
  const needsFileConversion = computed(() => {
    return selectedFile.value ? needsConversion(selectedFile.value) : false
  })
  
  const estimatedConversionTime = computed(() => {
    if (!selectedFile.value) return ''
    const sizeInMB = selectedFile.value.size / (1024 * 1024)
    const seconds = Math.ceil(sizeInMB)
    return seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} minute${Math.ceil(seconds / 60) > 1 ? 's' : ''}`
  })
  
  // Actions
  const handleFileSelection = async (file: File) => {
    try {
      clearUploadStatus()
      
      // Validate file
      if (!isValidAudioFile(file)) {
        throw new Error('Invalid audio file format. Please select MP3, WAV, M4A, AAC, or OGG files.')
      }
      
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB.')
      }
      
      selectedFile.value = file
      
      // Create preview URL
      if (audioPreviewUrl.value) {
        URL.revokeObjectURL(audioPreviewUrl.value)
      }
      audioPreviewUrl.value = URL.createObjectURL(file)
      
      // Extract metadata from filename
      const metadata = extractMetadataFromFilename(file.name)
      if (metadata.artist) {
        artistName.value = metadata.artist
      }
      if (metadata.title) {
        songTitle.value = metadata.title
      }
      
      // Generate fingerprint and check for duplicates
      await generateAudioFingerprint(file)
      
    } catch (error) {
      console.error('File selection error:', error)
      uploadError.value = error instanceof Error ? error.message : 'Failed to process file'
    }
  }
  
  const generateAudioFingerprint = async (file: File) => {
    try {
      isGeneratingFingerprint.value = true
      uploadMessage.value = 'Generating audio fingerprint...'
      
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Create SHA-256 hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      audioFingerprint.value = hashHex
      fingerprintGenerated.value = true
      
      // Check for duplicates
      await checkForDuplicates(hashHex)
      
    } catch (error) {
      console.error('Fingerprint generation error:', error)
      uploadError.value = 'Failed to generate audio fingerprint'
    } finally {
      isGeneratingFingerprint.value = false
    }
  }
  
  const checkForDuplicates = async (fingerprint: string) => {
    try {
      const { data, error } = await supabaseService.getClient()
        .rpc('check_audio_fingerprint', { p_fingerprint_hash: fingerprint })
      
      if (error) {
        console.error('Duplicate check error:', error)
        return
      }
      
      // Preferred production response: { allowed: boolean, message?: string }
      let duplicate = false
      if (data && typeof data === 'object' && 'allowed' in (data as any)) {
        duplicate = (data as any).allowed === false
      } else if (typeof data === 'number') {
        duplicate = data > 0
      } else if (data && typeof (data as any).count === 'number') {
        duplicate = (data as any).count > 0
      } else if (data && typeof (data as any).exists === 'boolean') {
        duplicate = (data as any).exists
      }
      
      isDuplicate.value = duplicate
      
      if (isDuplicate.value) {
        uploadError.value = 'This song has already been uploaded. Please select a different file.'
      }
      
    } catch (error) {
      console.error('Duplicate check error:', error)
    }
  }
  
  const uploadSong = async (file: File, title: string, artist: string, genre: string, clipStart: number, rightsConfirmed: boolean) => {
    try {
      if (!audioFingerprint.value) {
        throw new Error('Audio fingerprint not generated')
      }
      
      uploading.value = true
      uploadMessage.value = 'Preparing upload...'
      uploadError.value = null
      
      let fileToUpload = file
      
      // Convert WAV to MP3 if needed
      if (needsConversion(file)) {
        uploadMessage.value = 'Converting audio format...'
        conversionStage.value = 'decoding'
        
        const conversionResult = await convertWavToMp3(file, (progress) => {
          conversionStage.value = progress.stage === 'decoding' ? 'decoding' : 'encoding'
          uploadMessage.value = progress.message
        })
        
        if (!conversionResult.success || !conversionResult.mp3Blob) {
          throw new Error(conversionResult.error || 'Audio conversion failed')
        }
        
        fileToUpload = createMp3File(conversionResult.mp3Blob, file.name)
      }
      
      // Upload to Supabase Storage
      uploadMessage.value = 'Uploading to server...'
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileToUpload.name.split('.').pop()}`
      
      const { data: uploadData, error: storageError } = await supabaseService.getClient().storage
        .from('song-audio')
        .upload(fileName, fileToUpload, {
          upsert: true,
          contentType: fileToUpload.type
        })
      
      if (storageError) {
        throw storageError
      }
      
      // Create database record
      uploadMessage.value = 'Creating song record...'
      
      const { data: songData, error: songError } = await supabaseService.getClient()
        .from('songs')
        .insert({
          title: title.trim(),
          artist: artist.trim(),
          genre: genre,
          audio_url: uploadData.path,
          audio_fingerprint: audioFingerprint.value,
          clip_start_time: clipStart,
          file_size: fileToUpload.size,
          duration: 30, // 30-second clips
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (songError) {
        throw songError
      }
      
      // Success
      isSuccess.value = true
      uploadMessage.value = 'Upload completed successfully!'
      
      // Reset form after success
      setTimeout(() => {
        resetForm()
      }, 2000)
      
      return songData
      
    } catch (error) {
      console.error('Upload error:', error)
      uploadError.value = error instanceof Error ? error.message : 'Upload failed'
      throw error
    } finally {
      uploading.value = false
      conversionStage.value = null
    }
  }
  
  const convertToMp3 = async (file: File): Promise<ConversionResult> => {
    return convertWavToMp3(file)
  }
  
  const clearUploadStatus = () => {
    uploading.value = false
    uploadMessage.value = ''
    isSuccess.value = false
    uploadError.value = null
    conversionError.value = null
    conversionStage.value = null
  }
  
  const clearFingerprintState = () => {
    fingerprintGenerated.value = false
    isDuplicate.value = false
    isGeneratingFingerprint.value = false
    audioFingerprint.value = null
  }
  
  const resetForm = () => {
    // Clear file
    if (audioPreviewUrl.value) {
      URL.revokeObjectURL(audioPreviewUrl.value)
    }
    
    selectedFile.value = null
    audioPreviewUrl.value = null
    songTitle.value = ''
    artistName.value = ''
    selectedGenre.value = ''
    clipStartTime.value = 0
    rightsConfirmed.value = false
    
    // Clear fingerprint state
    clearFingerprintState()
    
    // Clear upload status
    clearUploadStatus()
  }
  
  const loadBattleReadyGenres = async () => {
    try {
      isLoadingGenres.value = true
      
      // Start with all master genres, marked as NOT battle-ready by default
      const allGenres = MASTER_GENRES.map(genre => ({
        genre,
        is_battle_ready: false
      }))
      
      // Try to fetch battle-ready status from backend
      const { data, error } = await supabaseService.getClient()
        .rpc('get_battle_available_genres')
      
      if (error) {
        console.error('Error loading battle-ready genres:', error)
        // Use all genres with no battle-ready indicators
        battleReadyGenres.value = allGenres
        return
      }
      
      // If we got data, merge it with master genres
      if (data && Array.isArray(data) && data.length > 0) {
        // Create a Set of battle-ready genre names for quick lookup
        const battleReadySet = new Set(
          data
            .filter((item: any) => item.is_battle_ready)
            .map((item: any) => item.genre)
        )
        
        // Map all master genres with correct battle-ready status
        battleReadyGenres.value = MASTER_GENRES.map(genre => ({
          genre,
          is_battle_ready: battleReadySet.has(genre)
        }))
      } else {
        // No data returned, use all genres with no battle-ready indicators
        console.warn('No battle-ready data returned, showing all genres without indicators')
        battleReadyGenres.value = allGenres
      }
      
    } catch (error) {
      console.error('Error loading battle-ready genres:', error)
      // Fallback to all master genres without battle-ready indicators
      battleReadyGenres.value = MASTER_GENRES.map(genre => ({
        genre,
        is_battle_ready: false
      }))
    } finally {
      isLoadingGenres.value = false
    }
  }
  
  const removeFile = () => {
    if (audioPreviewUrl.value) {
      URL.revokeObjectURL(audioPreviewUrl.value)
    }
    
    selectedFile.value = null
    audioPreviewUrl.value = null
    songTitle.value = ''
    artistName.value = ''
    
    clearFingerprintState()
    clearUploadStatus()
  }
  
  const setClipStartTime = (time: number) => {
    clipStartTime.value = time
  }
  
  const toggleRightsConfirmation = () => {
    rightsConfirmed.value = !rightsConfirmed.value
  }
  
  return {
    // State
    uploading,
    uploadMessage,
    isSuccess,
    fingerprintGenerated,
    isDuplicate,
    isGeneratingFingerprint,
    conversionStage,
    
    // File and form state
    selectedFile,
    audioPreviewUrl,
    songTitle,
    artistName,
    selectedGenre,
    clipStartTime,
    rightsConfirmed,
    audioFingerprint,
    
    // Battle-ready genres
    battleReadyGenres,
    isLoadingGenres,
    
    // Error handling
    uploadError,
    conversionError,
    
    // Computed properties
    canUpload,
    hasValidFile,
    hasCompleteDetails,
    fileSizeFormatted,
    needsFileConversion,
    estimatedConversionTime,
    
    // Actions
    handleFileSelection,
    generateAudioFingerprint,
    checkForDuplicates,
    uploadSong,
    convertToMp3,
    clearUploadStatus,
    clearFingerprintState,
    resetForm,
    loadBattleReadyGenres,
    removeFile,
    setClipStartTime,
    toggleRightsConfirmation
  }
})