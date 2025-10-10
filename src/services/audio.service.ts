import { Howl, Howler } from 'howler'

class AudioService {
  private sounds: Map<string, Howl> = new Map()
  private currentSongId: string | null = null

  async loadSound(songId: string, url: string): Promise<Howl> {
    // Check if already loaded
    if (this.sounds.has(songId)) {
      return this.sounds.get(songId)!
    }

    // Create new sound
    const sound = new Howl({
      src: [url],
      html5: true,
      preload: true
    })

    this.sounds.set(songId, sound)
    return sound
  }

  async play(songId: string, url: string, startTime: number = 0): Promise<void> {
    try {
      // Stop current sound if different
      if (this.currentSongId && this.currentSongId !== songId) {
        this.stop(this.currentSongId)
      }

      const sound = await this.loadSound(songId, url)
      
      if (startTime > 0) {
        sound.seek(startTime)
      }
      
      sound.play()
      this.currentSongId = songId
    } catch (error) {
      console.error('Failed to play audio:', error)
      throw error
    }
  }

  pause(songId: string): void {
    const sound = this.sounds.get(songId)
    if (sound) {
      sound.pause()
    }
  }

  stop(songId: string): void {
    const sound = this.sounds.get(songId)
    if (sound) {
      sound.stop()
    }
    
    if (this.currentSongId === songId) {
      this.currentSongId = null
    }
  }

  stopAll(): void {
    this.sounds.forEach(sound => sound.stop())
    this.currentSongId = null
  }

  unload(songId: string): void {
    const sound = this.sounds.get(songId)
    if (sound) {
      sound.unload()
      this.sounds.delete(songId)
    }
  }

  unloadAll(): void {
    this.sounds.forEach(sound => sound.unload())
    this.sounds.clear()
    this.currentSongId = null
  }

  setVolume(volume: number): void {
    Howler.volume(volume)
  }

  getVolume(): number {
    return Howler.volume()
  }

  mute(): void {
    Howler.mute(true)
  }

  unmute(): void {
    Howler.mute(false)
  }

  isPlaying(songId: string): boolean {
    const sound = this.sounds.get(songId)
    return sound ? sound.playing() : false
  }

  getCurrentTime(songId: string): number {
    const sound = this.sounds.get(songId)
    return sound ? (sound.seek() as number) : 0
  }

  getDuration(songId: string): number {
    const sound = this.sounds.get(songId)
    return sound ? sound.duration() : 0
  }

  seek(songId: string, time: number): void {
    const sound = this.sounds.get(songId)
    if (sound) {
      sound.seek(time)
    }
  }
}

export const audioService = new AudioService()

