/**
 * Extract artist and title from filename patterns
 * Handles various delimiters (dash, underscore)
 * Cleans up extensions and special characters
 */

export interface ExtractedMetadata {
  artist: string
  title: string
}

/**
 * Extract artist and title from filename
 * Supports patterns like:
 * - "Artist - Title.mp3"
 * - "Artist_Title.mp3"
 * - "Artist - Title (feat. Other Artist).mp3"
 * - "Title by Artist.mp3"
 */
export function extractMetadataFromFilename(filename: string): ExtractedMetadata {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Common delimiters to try
  const delimiters = [' - ', ' – ', ' — ', '_', ' by ']
  
  for (const delimiter of delimiters) {
    const parts = nameWithoutExt.split(delimiter)
    
    if (parts.length === 2) {
      let artist = parts[0].trim()
      let title = parts[1].trim()
      
      // Handle "Title by Artist" pattern
      if (delimiter === ' by ') {
        [artist, title] = [title, artist]
      }
      
      // Clean up common additions
      title = cleanTitle(title)
      artist = cleanArtist(artist)
      
      return { artist, title }
    }
  }
  
  // If no delimiter found, treat entire filename as title
  return {
    artist: '',
    title: cleanTitle(nameWithoutExt)
  }
}

/**
 * Clean up title by removing common additions
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)\s*$/, '') // Remove trailing parenthetical
    .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove trailing brackets
    .replace(/\s*feat\.?\s+.*$/i, '') // Remove "feat." sections
    .replace(/\s*ft\.?\s+.*$/i, '') // Remove "ft." sections
    .trim()
}

/**
 * Clean up artist name
 */
function cleanArtist(artist: string): string {
  return artist
    .replace(/^Artist:\s*/i, '') // Remove "Artist:" prefix
    .trim()
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate audio file type
 */
export function isValidAudioFile(file: File): boolean {
  const validTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/vorbis'
  ]
  
  const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
  
  // Check MIME type
  if (validTypes.includes(file.type)) {
    return true
  }
  
  // Check file extension as fallback
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  return validExtensions.includes(extension)
}

/**
 * Get estimated conversion time for WAV files
 */
export function getEstimatedConversionTime(fileSizeBytes: number): string {
  const sizeInMB = fileSizeBytes / (1024 * 1024)
  
  // Rough estimate: 1MB per second of conversion
  const seconds = Math.ceil(sizeInMB)
  
  if (seconds < 60) {
    return `${seconds} seconds`
  } else {
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }
}