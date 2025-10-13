export const MASTER_GENRES = [
  'Alternative', 'Blues', 'Christian', 'Classical', 'Country',
  'Dance', 'Electronic', 'Folk', 'Funk', 'Gospel',
  'Hip-Hop', 'Indie', 'Jazz', 'Latin', 'Metal',
  'Pop', 'Punk', 'R&B', 'Rap', 'Reggae', 'Rock',
  'Ska', 'Soul', 'World', 'Other'
] as const

export type Genre = typeof MASTER_GENRES[number]

export interface BattleReadyGenre {
  genre: string
  is_battle_ready: boolean
}