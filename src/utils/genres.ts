// Genre constants and utilities

export const GENRES = [
  'pop',
  'rock',
  'hip-hop',
  'electronic',
  'country',
  'jazz',
  'classical',
  'other'
] as const

export type Genre = typeof GENRES[number]

export interface GenreInfo {
  value: string
  label: string
  color: string
  icon?: string
}

export const GENRE_INFO: Record<string, GenreInfo> = {
  pop: {
    value: 'pop',
    label: 'Pop',
    color: '#ec4899'
  },
  rock: {
    value: 'rock',
    label: 'Rock',
    color: '#ef4444'
  },
  'hip-hop': {
    value: 'hip-hop',
    label: 'Hip Hop',
    color: '#8b5cf6'
  },
  electronic: {
    value: 'electronic',
    label: 'Electronic',
    color: '#06b6d4'
  },
  country: {
    value: 'country',
    label: 'Country',
    color: '#f59e0b'
  },
  jazz: {
    value: 'jazz',
    label: 'Jazz',
    color: '#10b981'
  },
  classical: {
    value: 'classical',
    label: 'Classical',
    color: '#6366f1'
  },
  other: {
    value: 'other',
    label: 'Other',
    color: '#6b7280'
  }
}

export function getGenreInfo(genre: string): GenreInfo {
  return GENRE_INFO[genre] || GENRE_INFO.other
}

export function getGenreLabel(genre: string): string {
  return getGenreInfo(genre).label
}

export function getGenreColor(genre: string): string {
  return getGenreInfo(genre).color
}

export function isValidGenre(genre: string): genre is Genre {
  return GENRES.includes(genre as Genre)
}

