// Utility to extract song title and artist from filename

export interface ExtractedInfo {
  title: string
  artist: string
}

export function extractTitleAndArtist(filename: string): ExtractedInfo {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Common patterns:
  // "Artist - Title"
  // "Artist-Title"
  // "Title by Artist"
  // "Title (Artist)"
  
  // Try "Artist - Title" pattern
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ')
    return {
      artist: parts[0].trim(),
      title: parts[1].trim()
    }
  }
  
  // Try "Artist-Title" pattern (without spaces)
  if (nameWithoutExt.includes('-') && !nameWithoutExt.includes(' ')) {
    const parts = nameWithoutExt.split('-')
    return {
      artist: parts[0].trim(),
      title: parts[1].trim()
    }
  }
  
  // Try "Title by Artist" pattern
  if (nameWithoutExt.toLowerCase().includes(' by ')) {
    const parts = nameWithoutExt.split(/ by /i)
    return {
      title: parts[0].trim(),
      artist: parts[1].trim()
    }
  }
  
  // Try "Title (Artist)" pattern
  const parenthesesMatch = nameWithoutExt.match(/^(.+?)\s*\((.+?)\)$/)
  if (parenthesesMatch) {
    return {
      title: parenthesesMatch[1].trim(),
      artist: parenthesesMatch[2].trim()
    }
  }
  
  // Default: use filename as title, artist unknown
  return {
    title: nameWithoutExt.trim(),
    artist: 'Unknown Artist'
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove or replace invalid characters
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

export function formatSongTitle(title: string): string {
  // Capitalize first letter of each word
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

