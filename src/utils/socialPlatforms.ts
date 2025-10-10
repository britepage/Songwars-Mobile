// Social media platform detection and configuration
export interface SocialLink {
  platform: string
  url: string
  label: string
}

export interface PlatformConfig {
  name: string
  icon: string
  color: string
  domains: string[]
  urlPattern?: RegExp
}

// Supported social media platforms
export const SUPPORTED_PLATFORMS: Record<string, PlatformConfig> = {
  spotify: {
    name: 'Spotify',
    icon: `<img src="https://cdn.simpleicons.org/spotify/1DB954" alt="Spotify" width="24" height="24" />`,
    color: '#1DB954',
    domains: ['spotify.com', 'open.spotify.com'],
    urlPattern: /^https?:\/\/(open\.)?spotify\.com\/(artist|album|track|playlist)\//
  },
  apple_music: {
    name: 'Apple Music',
    icon: `<img src="https://cdn.simpleicons.org/applemusic/FA243C" alt="Apple Music" width="24" height="24" />`,
    color: '#FA243C',
    domains: ['music.apple.com', 'itunes.apple.com'],
    urlPattern: /^https?:\/\/(music\.)?apple\.com\//
  },
  youtube: {
    name: 'YouTube',
    icon: `<img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width="24" height="24" />`,
    color: '#FF0000',
    domains: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    urlPattern: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//
  },
  instagram: {
    name: 'Instagram',
    icon: `<img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" />`,
    color: '#E4405F',
    domains: ['instagram.com', 'www.instagram.com'],
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\//
  },
  twitter: {
    name: 'X',
    icon: `<img src="https://cdn.simpleicons.org/x/000000" alt="X" width="24" height="24" />`,
    color: '#000000',
    domains: ['twitter.com', 'x.com', 'www.twitter.com', 'www.x.com'],
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\//
  },
  tiktok: {
    name: 'TikTok',
    icon: `<img src="https://cdn.simpleicons.org/tiktok/000000" alt="TikTok" width="24" height="24" />`,
    color: '#000000',
    domains: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com'],
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\//
  },
  soundcloud: {
    name: 'SoundCloud',
    icon: `<img src="https://cdn.simpleicons.org/soundcloud/FF3300" alt="SoundCloud" width="24" height="24" />`,
    color: '#FF3300',
    domains: ['soundcloud.com', 'www.soundcloud.com'],
    urlPattern: /^https?:\/\/(www\.)?soundcloud\.com\//
  },
  bandcamp: {
    name: 'Bandcamp',
    icon: `<img src="https://cdn.simpleicons.org/bandcamp/629aa0" alt="Bandcamp" width="24" height="24" />`,
    color: '#629aa0',
    domains: ['bandcamp.com', 'www.bandcamp.com'],
    urlPattern: /^https?:\/\/(www\.)?bandcamp\.com\//
  },
  amazon: {
    name: 'Amazon Music',
    icon: `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazon.svg" alt="Amazon Music" width="24" height="24" />`,
    color: '#FF9900',
    domains: ['music.amazon.com', 'www.music.amazon.com', 'amazon.com/music'],
    urlPattern: /^https?:\/\/(www\.)?(music\.)?amazon\.com\/(music\/)?/
  },
  facebook: {
    name: 'Facebook',
    icon: `<img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" />`,
    color: '#1877F2',
    domains: ['facebook.com', 'www.facebook.com', 'fb.com'],
    urlPattern: /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\//
  },
  linkedin: {
    name: 'LinkedIn',
    icon: `<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" />`,
    color: '#0A66C2',
    domains: ['linkedin.com', 'www.linkedin.com'],
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\//
  },
  twitch: {
    name: 'Twitch',
    icon: `<img src="https://cdn.simpleicons.org/twitch/9146FF" alt="Twitch" width="24" height="24" />`,
    color: '#9146FF',
    domains: ['twitch.tv', 'www.twitch.tv'],
    urlPattern: /^https?:\/\/(www\.)?twitch\.tv\//
  },
  patreon: {
    name: 'Patreon',
    icon: `<img src="https://cdn.simpleicons.org/patreon/FF424D" alt="Patreon" width="24" height="24" />`,
    color: '#FF424D',
    domains: ['patreon.com', 'www.patreon.com'],
    urlPattern: /^https?:\/\/(www\.)?patreon\.com\//
  },
  website: {
    name: 'Website',
    icon: `<img src="https://api.iconify.design/mdi:globe.svg" alt="Website" width="24" height="24" />`,
    color: '#6B7280',
    domains: [],
    urlPattern: /^https?:\/\//
  }
}

/**
 * Detects the social media platform from a URL
 * @param url - The URL to analyze
 * @returns Platform configuration or null if not recognized
 */
export function detectPlatform(url: string): PlatformConfig | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  // Clean and normalize the URL
  let cleanUrl = url.trim()
  
  // Add https:// if no protocol is provided
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }

  // Validate URL format
  try {
    new URL(cleanUrl)
  } catch {
    return null
  }

  // Extract domain from URL
  const urlObj = new URL(cleanUrl)
  const hostname = urlObj.hostname.toLowerCase()
  
  // Remove www. prefix for comparison
  const domain = hostname.replace(/^www\./, '')

  // Check each platform
  for (const [, config] of Object.entries(SUPPORTED_PLATFORMS)) {
    // Check if domain matches
    if (config.domains.some(platformDomain => domain === platformDomain)) {
      // If there's a URL pattern, validate it
      if (config.urlPattern && !config.urlPattern.test(cleanUrl)) {
        continue
      }
      return config
    }
  }

  // If no specific platform matches, check if it's a valid website URL
  if (SUPPORTED_PLATFORMS.website.urlPattern!.test(cleanUrl)) {
    return SUPPORTED_PLATFORMS.website
  }

  return null
}

/**
 * Creates a social link object from a URL
 * @param url - The URL to process
 * @returns SocialLink object or null if invalid
 */
export function createSocialLink(url: string): SocialLink | null {
  const platform = detectPlatform(url)
  
  if (!platform) {
    return null
  }

  // Clean and normalize the URL
  let cleanUrl = url.trim()
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'https://' + cleanUrl
  }

  const platformKey = Object.keys(SUPPORTED_PLATFORMS).find(key => SUPPORTED_PLATFORMS[key] === platform) || 'website'
  
  return {
    platform: platformKey,
    url: cleanUrl,
    label: platform.name
  }
}

/**
 * Validates a social link URL
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function validateSocialLink(url: string): boolean {
  return detectPlatform(url) !== null
}

/**
 * Gets the platform configuration by key
 * @param platformKey - The platform key
 * @returns Platform configuration or null if not found
 */
export function getPlatformConfig(platformKey: string): PlatformConfig | null {
  return SUPPORTED_PLATFORMS[platformKey] || null
}

/**
 * Gets all supported platform keys
 * @returns Array of platform keys
 */
export function getSupportedPlatformKeys(): string[] {
  return Object.keys(SUPPORTED_PLATFORMS)
}

/**
 * Formats a social link for display
 * @param link - The social link object
 * @returns Formatted display string
 */
export function formatSocialLink(link: SocialLink): string {
  const config = getPlatformConfig(link.platform)
  return `${config?.icon || '🔗'} ${config?.name || 'Link'}: ${link.url}`
}
