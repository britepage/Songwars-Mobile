# Audio System Conversion Guide

## Overview
This guide covers the complete conversion of the SongWars audio system from web-based HTML5 Audio to mobile-optimized native audio playback, including 30-second clips, timeout management, background playback, and memory optimization.

## Table of Contents
1. [Audio System Overview](#audio-system-overview)
2. [Native Audio Integration](#native-audio-integration)
3. [30-Second Clip System](#30-second-clip-system)
4. [Background Playback](#background-playback)
5. [Memory Management](#memory-management)
6. [Audio Composables](#audio-composables)
7. [Battle Audio System](#battle-audio-system)
8. [Performance Optimization](#performance-optimization)
9. [Code Examples](#code-examples)

## Audio System Overview

### Current Web Audio System
The SongWars web app uses sophisticated audio management with:
- HTML5 Audio API with dynamic element creation
- 30-second clip playback with auto-stop
- Timeout management and memory cleanup
- Simultaneous dual audio playback for battles
- Audio progress tracking and visual feedback

### Mobile Audio System
Convert to native mobile audio with:
- Native audio plugins for better performance
- Background playback support
- Memory-efficient audio management
- Touch-optimized controls
- Battery optimization

## Native Audio Integration

### 1. Install Required Plugins
```bash
# Core audio plugins
npm install @capacitor-community/native-audio
npm install @capacitor-community/media

# Background audio support
npm install @capacitor/app
npm install @capacitor/haptics
```

### 2. Audio Service Setup
Create a centralized audio service:

```typescript
// src/services/audioService.ts
import { NativeAudio } from '@capacitor-community/native-audio';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export interface AudioConfig {
  songId: string;
  audioUrl: string;
  clipStartTime?: number;
  autoStopAfter?: number;
  volume?: number;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  isLoading: boolean;
  error: Error | null;
}

class AudioService {
  private audioInstances = new Map<string, any>();
  private audioStates = new Map<string, AudioState>();
  private progressIntervals = new Map<string, NodeJS.Timeout>();
  private timeoutHandlers = new Map<string, NodeJS.Timeout>();
  private currentSongId: string | null = null;

  async initialize() {
    // Initialize native audio on mobile
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeAudio.preloadComplex({
          assetId: 'silence',
          assetPath: 'silence.mp3',
          volume: 0,
          audioChannelNum: 1
        });
      } catch (error) {
        console.warn('Could not preload silence audio:', error);
      }
    }
  }

  async preloadAudio(songId: string, audioUrl: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await NativeAudio.preloadComplex({
          assetId: songId,
          assetPath: audioUrl,
          volume: 0.7,
          audioChannelNum: 1,
          isUrl: true
        });
        console.log(`Audio preloaded: ${songId}`);
      } catch (error) {
        console.error(`Error preloading audio ${songId}:`, error);
        throw error;
      }
    }
  }

  async playAudio(config: AudioConfig): Promise<void> {
    const { songId, audioUrl, clipStartTime = 0, autoStopAfter, volume = 0.7 } = config;

    try {
      // Stop any currently playing audio
      await this.stopAllAudio();

      // Set current song
      this.currentSongId = songId;

      // Initialize audio state
      this.audioStates.set(songId, {
        isPlaying: false,
        currentTime: clipStartTime,
        duration: autoStopAfter || 30000,
        progress: 0,
        isLoading: true,
        error: null
      });

      config.onLoadingChange?.(true);

      if (Capacitor.isNativePlatform()) {
        await this.playNativeAudio(config);
      } else {
        await this.playWebAudio(config);
      }

      // Start progress tracking
      this.startProgressTracking(songId, config);

      // Set auto-stop timeout if specified
      if (autoStopAfter) {
        this.setAutoStopTimeout(songId, autoStopAfter, config.onEnded);
      }

      // Haptic feedback
      await Haptics.impact({ style: ImpactStyle.Light });

    } catch (error) {
      console.error(`Error playing audio ${songId}:`, error);
      this.audioStates.set(songId, {
        ...this.audioStates.get(songId)!,
        error: error as Error,
        isLoading: false
      });
      config.onError?.(error as Error);
      config.onLoadingChange?.(false);
    }
  }

  private async playNativeAudio(config: AudioConfig): Promise<void> {
    const { songId, audioUrl, clipStartTime = 0, volume = 0.7 } = config;

    try {
      // Preload if not already loaded
      if (!this.audioInstances.has(songId)) {
        await this.preloadAudio(songId, audioUrl);
      }

      // Play the audio
      await NativeAudio.play({
        assetId: songId,
        time: clipStartTime / 1000 // Convert to seconds
      });

      // Update state
      const state = this.audioStates.get(songId)!;
      this.audioStates.set(songId, {
        ...state,
        isPlaying: true,
        isLoading: false
      });

      config.onLoadingChange?.(false);

    } catch (error) {
      throw new Error(`Native audio playback failed: ${error}`);
    }
  }

  private async playWebAudio(config: AudioConfig): Promise<void> {
    const { songId, audioUrl, clipStartTime = 0, volume = 0.7 } = config;

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      audio.currentTime = clipStartTime / 1000; // Convert to seconds

      // Store audio instance
      this.audioInstances.set(songId, audio);

      // Event handlers
      audio.onloadstart = () => {
        const state = this.audioStates.get(songId)!;
        this.audioStates.set(songId, {
          ...state,
          isLoading: true
        });
        config.onLoadingChange?.(true);
      };

      audio.oncanplay = () => {
        const state = this.audioStates.get(songId)!;
        this.audioStates.set(songId, {
          ...state,
          isLoading: false
        });
        config.onLoadingChange?.(false);
      };

      audio.onplay = () => {
        const state = this.audioStates.get(songId)!;
        this.audioStates.set(songId, {
          ...state,
          isPlaying: true,
          isLoading: false
        });
      };

      audio.onpause = () => {
        const state = this.audioStates.get(songId)!;
        this.audioStates.set(songId, {
          ...state,
          isPlaying: false
        });
      };

      audio.onended = () => {
        this.handleAudioEnded(songId, config.onEnded);
      };

      audio.onerror = (error) => {
        this.handleAudioError(songId, error, config.onError);
        reject(error);
      };

      // Start playback
      audio.play()
        .then(() => resolve())
        .catch(reject);
    });
  }

  async pauseAudio(songId: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await NativeAudio.stop({ assetId: songId });
      } else {
        const audio = this.audioInstances.get(songId);
        if (audio) {
          audio.pause();
        }
      }

      // Update state
      const state = this.audioStates.get(songId);
      if (state) {
        this.audioStates.set(songId, {
          ...state,
          isPlaying: false
        });
      }

      // Clear timeout
      this.clearAutoStopTimeout(songId);

    } catch (error) {
      console.error(`Error pausing audio ${songId}:`, error);
    }
  }

  async stopAudio(songId: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await NativeAudio.stop({ assetId: songId });
      } else {
        const audio = this.audioInstances.get(songId);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }

      // Update state
      const state = this.audioStates.get(songId);
      if (state) {
        this.audioStates.set(songId, {
          ...state,
          isPlaying: false,
          currentTime: 0,
          progress: 0
        });
      }

      // Clear timeout and progress tracking
      this.clearAutoStopTimeout(songId);
      this.stopProgressTracking(songId);

      // Clear current song if it matches
      if (this.currentSongId === songId) {
        this.currentSongId = null;
      }

    } catch (error) {
      console.error(`Error stopping audio ${songId}:`, error);
    }
  }

  async stopAllAudio(): Promise<void> {
    const promises = Array.from(this.audioInstances.keys()).map(songId => 
      this.stopAudio(songId)
    );
    await Promise.all(promises);
  }

  async setVolume(songId: string, volume: number): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native audio volume control
        await NativeAudio.setVolume({ assetId: songId, volume });
      } else {
        const audio = this.audioInstances.get(songId);
        if (audio) {
          audio.volume = Math.max(0, Math.min(1, volume));
        }
      }
    } catch (error) {
      console.error(`Error setting volume for ${songId}:`, error);
    }
  }

  async seekTo(songId: string, time: number): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await NativeAudio.stop({ assetId: songId });
        await NativeAudio.play({ assetId: songId, time: time / 1000 });
      } else {
        const audio = this.audioInstances.get(songId);
        if (audio) {
          audio.currentTime = time / 1000;
        }
      }

      // Update state
      const state = this.audioStates.get(songId);
      if (state) {
        this.audioStates.set(songId, {
          ...state,
          currentTime: time
        });
      }
    } catch (error) {
      console.error(`Error seeking audio ${songId}:`, error);
    }
  }

  // Progress tracking
  private startProgressTracking(songId: string, config: AudioConfig): void {
    const interval = setInterval(() => {
      const state = this.audioStates.get(songId);
      if (!state || !state.isPlaying) return;

      const currentTime = state.currentTime + 100; // Update every 100ms
      const progress = (currentTime / state.duration) * 100;

      this.audioStates.set(songId, {
        ...state,
        currentTime,
        progress: Math.min(100, progress)
      });

      config.onProgress?.(progress);

      // Check if reached end
      if (currentTime >= state.duration) {
        this.handleAudioEnded(songId, config.onEnded);
      }
    }, 100);

    this.progressIntervals.set(songId, interval);
  }

  private stopProgressTracking(songId: string): void {
    const interval = this.progressIntervals.get(songId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(songId);
    }
  }

  // Auto-stop timeout
  private setAutoStopTimeout(songId: string, duration: number, onEnded?: () => void): void {
    const timeout = setTimeout(() => {
      this.handleAudioEnded(songId, onEnded);
    }, duration);

    this.timeoutHandlers.set(songId, timeout);
  }

  private clearAutoStopTimeout(songId: string): void {
    const timeout = this.timeoutHandlers.get(songId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeoutHandlers.delete(songId);
    }
  }

  private handleAudioEnded(songId: string, onEnded?: () => void): void {
    this.stopAudio(songId);
    onEnded?.();
  }

  private handleAudioError(songId: string, error: any, onError?: (error: Error) => void): void {
    const state = this.audioStates.get(songId);
    if (state) {
      this.audioStates.set(songId, {
        ...state,
        error: error as Error,
        isLoading: false,
        isPlaying: false
      });
    }
    onError?.(error as Error);
  }

  // State getters
  getAudioState(songId: string): AudioState | undefined {
    return this.audioStates.get(songId);
  }

  isPlaying(songId: string): boolean {
    return this.audioStates.get(songId)?.isPlaying || false;
  }

  getCurrentSongId(): string | null {
    return this.currentSongId;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.stopAllAudio();
    
    // Clear all intervals and timeouts
    this.progressIntervals.forEach(interval => clearInterval(interval));
    this.timeoutHandlers.forEach(timeout => clearTimeout(timeout));
    
    this.progressIntervals.clear();
    this.timeoutHandlers.clear();
    this.audioInstances.clear();
    this.audioStates.clear();
  }
}

export const audioService = new AudioService();
```

## 30-Second Clip System

### 1. Clip Management
Create a clip management system:

```typescript
// src/services/clipService.ts
export interface ClipConfig {
  songId: string;
  audioUrl: string;
  clipStartTime: number;
  clipDuration: number;
  onClipEnd?: () => void;
  onProgress?: (progress: number) => void;
}

class ClipService {
  private activeClips = new Map<string, ClipConfig>();
  private clipTimeouts = new Map<string, NodeJS.Timeout>();
  private progressIntervals = new Map<string, NodeJS.Timeout>();

  async playClip(config: ClipConfig): Promise<void> {
    const { songId, clipStartTime, clipDuration, onClipEnd, onProgress } = config;

    try {
      // Stop any existing clip for this song
      await this.stopClip(songId);

      // Store clip config
      this.activeClips.set(songId, config);

      // Start audio at clip start time
      await audioService.playAudio({
        songId,
        audioUrl: config.audioUrl,
        clipStartTime,
        autoStopAfter: clipDuration,
        onEnded: onClipEnd
      });

      // Start progress tracking for clip
      this.startClipProgressTracking(songId, clipDuration, onProgress);

      // Set clip timeout
      const timeout = setTimeout(() => {
        this.handleClipEnd(songId);
      }, clipDuration);

      this.clipTimeouts.set(songId, timeout);

    } catch (error) {
      console.error(`Error playing clip ${songId}:`, error);
      throw error;
    }
  }

  async stopClip(songId: string): Promise<void> {
    await audioService.stopAudio(songId);
    this.clearClipTimeout(songId);
    this.stopClipProgressTracking(songId);
    this.activeClips.delete(songId);
  }

  async pauseClip(songId: string): Promise<void> {
    await audioService.pauseAudio(songId);
    this.clearClipTimeout(songId);
    this.stopClipProgressTracking(songId);
  }

  async resumeClip(songId: string): Promise<void> {
    const clipConfig = this.activeClips.get(songId);
    if (!clipConfig) return;

    // Calculate remaining time
    const audioState = audioService.getAudioState(songId);
    const remainingTime = clipConfig.clipDuration - (audioState?.currentTime || 0);

    if (remainingTime > 0) {
      await audioService.playAudio({
        songId,
        audioUrl: clipConfig.audioUrl,
        clipStartTime: audioState?.currentTime || 0,
        autoStopAfter: remainingTime,
        onEnded: clipConfig.onClipEnd
      });

      // Restart progress tracking
      this.startClipProgressTracking(songId, remainingTime, clipConfig.onProgress);

      // Set new timeout
      const timeout = setTimeout(() => {
        this.handleClipEnd(songId);
      }, remainingTime);

      this.clipTimeouts.set(songId, timeout);
    }
  }

  private startClipProgressTracking(songId: string, duration: number, onProgress?: (progress: number) => void): void {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / duration) * 100;
      
      onProgress?.(progress);
      
      if (progress >= 100) {
        this.stopClipProgressTracking(songId);
      }
    }, 100);

    this.progressIntervals.set(songId, interval);
  }

  private stopClipProgressTracking(songId: string): void {
    const interval = this.progressIntervals.get(songId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(songId);
    }
  }

  private clearClipTimeout(songId: string): void {
    const timeout = this.clipTimeouts.get(songId);
    if (timeout) {
      clearTimeout(timeout);
      this.clipTimeouts.delete(songId);
    }
  }

  private handleClipEnd(songId: string): void {
    const clipConfig = this.activeClips.get(songId);
    if (clipConfig?.onClipEnd) {
      clipConfig.onClipEnd();
    }
    this.stopClip(songId);
  }

  getActiveClip(songId: string): ClipConfig | undefined {
    return this.activeClips.get(songId);
  }

  hasActiveClip(songId: string): boolean {
    return this.activeClips.has(songId);
  }

  getAllActiveClips(): Map<string, ClipConfig> {
    return new Map(this.activeClips);
  }

  async cleanup(): Promise<void> {
    // Stop all clips
    const stopPromises = Array.from(this.activeClips.keys()).map(songId => 
      this.stopClip(songId)
    );
    await Promise.all(stopPromises);

    // Clear all timeouts and intervals
    this.clipTimeouts.forEach(timeout => clearTimeout(timeout));
    this.progressIntervals.forEach(interval => clearInterval(interval));
    
    this.clipTimeouts.clear();
    this.progressIntervals.clear();
    this.activeClips.clear();
  }
}

export const clipService = new ClipService();
```

## Background Playback

### 1. Background Audio Service
Create background audio support:

```typescript
// src/services/backgroundAudioService.ts
import { App } from '@capacitor/app';
import { audioService } from './audioService';
import { clipService } from './clipService';

interface BackgroundAudioConfig {
  songId: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration: number;
}

class BackgroundAudioService {
  private isBackgroundMode = false;
  private currentTrack: BackgroundAudioConfig | null = null;
  private backgroundTaskId: number | null = null;

  async initialize(): Promise<void> {
    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      this.handleAppStateChange(isActive);
    });

    // Listen for app resume
    App.addListener('resume', () => {
      this.handleAppResume();
    });

    // Listen for app pause
    App.addListener('pause', () => {
      this.handleAppPause();
    });
  }

  async setBackgroundTrack(config: BackgroundAudioConfig): Promise<void> {
    this.currentTrack = config;

    if (Capacitor.isNativePlatform()) {
      // Set up background audio session on native platforms
      await this.setupNativeBackgroundAudio(config);
    }
  }

  private async setupNativeBackgroundAudio(config: BackgroundAudioConfig): Promise<void> {
    try {
      // Configure background audio session
      // This would use native plugins to set up background audio
      console.log('Setting up background audio for:', config.title);
      
      // Set media session metadata
      await this.setMediaSessionMetadata(config);
      
    } catch (error) {
      console.error('Error setting up background audio:', error);
    }
  }

  private async setMediaSessionMetadata(config: BackgroundAudioConfig): Promise<void> {
    // Set media session metadata for lock screen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: config.title,
        artist: config.artist,
        album: config.album || '',
        artwork: config.artwork ? [{ src: config.artwork }] : []
      });

      // Set media session actions
      navigator.mediaSession.setActionHandler('play', () => {
        this.handleMediaSessionPlay();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.handleMediaSessionPause();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        this.handleMediaSessionStop();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.handleMediaSessionSeekBackward(details.seekOffset || 10);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.handleMediaSessionSeekForward(details.seekOffset || 10);
      });
    }
  }

  private handleAppStateChange(isActive: boolean): void {
    this.isBackgroundMode = !isActive;
    
    if (isActive) {
      this.handleAppResume();
    } else {
      this.handleAppPause();
    }
  }

  private handleAppResume(): void {
    // App became active
    if (this.currentTrack) {
      // Resume audio if it was playing
      const audioState = audioService.getAudioState(this.currentTrack.songId);
      if (audioState?.isPlaying) {
        // Audio should continue playing
        console.log('Resuming background audio');
      }
    }
  }

  private handleAppPause(): void {
    // App went to background
    if (this.currentTrack) {
      // Continue audio playback in background
      console.log('Continuing audio in background');
    }
  }

  private async handleMediaSessionPlay(): Promise<void> {
    if (this.currentTrack) {
      await audioService.playAudio({
        songId: this.currentTrack.songId,
        audioUrl: '', // Would need to store audio URL
        autoStopAfter: this.currentTrack.duration
      });
    }
  }

  private async handleMediaSessionPause(): Promise<void> {
    if (this.currentTrack) {
      await audioService.pauseAudio(this.currentTrack.songId);
    }
  }

  private async handleMediaSessionStop(): Promise<void> {
    if (this.currentTrack) {
      await audioService.stopAudio(this.currentTrack.songId);
      this.currentTrack = null;
    }
  }

  private async handleMediaSessionSeekBackward(offset: number): Promise<void> {
    if (this.currentTrack) {
      const audioState = audioService.getAudioState(this.currentTrack.songId);
      if (audioState) {
        const newTime = Math.max(0, audioState.currentTime - offset);
        await audioService.seekTo(this.currentTrack.songId, newTime);
      }
    }
  }

  private async handleMediaSessionSeekForward(offset: number): Promise<void> {
    if (this.currentTrack) {
      const audioState = audioService.getAudioState(this.currentTrack.songId);
      if (audioState) {
        const newTime = Math.min(audioState.duration, audioState.currentTime + offset);
        await audioService.seekTo(this.currentTrack.songId, newTime);
      }
    }
  }

  updatePlaybackState(isPlaying: boolean): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }

  getCurrentTrack(): BackgroundAudioConfig | null {
    return this.currentTrack;
  }

  isInBackgroundMode(): boolean {
    return this.isBackgroundMode;
  }

  async cleanup(): Promise<void> {
    this.currentTrack = null;
    this.isBackgroundMode = false;
  }
}

export const backgroundAudioService = new BackgroundAudioService();
```

## Memory Management

### 1. Audio Memory Manager
Create memory management for audio:

```typescript
// src/services/audioMemoryManager.ts
interface AudioCache {
  songId: string;
  audioUrl: string;
  lastAccessed: number;
  accessCount: number;
  size: number;
}

class AudioMemoryManager {
  private cache = new Map<string, AudioCache>();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private maxCacheItems = 10;
  private currentCacheSize = 0;

  addToCache(songId: string, audioUrl: string, size: number): void {
    // Remove existing entry if present
    this.removeFromCache(songId);

    // Check if we need to make room
    this.ensureCacheSpace(size);

    // Add to cache
    const cacheEntry: AudioCache = {
      songId,
      audioUrl,
      lastAccessed: Date.now(),
      accessCount: 1,
      size
    };

    this.cache.set(songId, cacheEntry);
    this.currentCacheSize += size;

    console.log(`Added ${songId} to audio cache. Cache size: ${this.currentCacheSize / 1024 / 1024}MB`);
  }

  getFromCache(songId: string): AudioCache | undefined {
    const entry = this.cache.get(songId);
    if (entry) {
      entry.lastAccessed = Date.now();
      entry.accessCount++;
      return entry;
    }
    return undefined;
  }

  removeFromCache(songId: string): void {
    const entry = this.cache.get(songId);
    if (entry) {
      this.cache.delete(songId);
      this.currentCacheSize -= entry.size;
    }
  }

  private ensureCacheSpace(requiredSize: number): void {
    // Remove least recently used items until we have enough space
    while (
      (this.currentCacheSize + requiredSize > this.maxCacheSize || 
       this.cache.size >= this.maxCacheItems) &&
      this.cache.size > 0
    ) {
      this.removeLRUItem();
    }
  }

  private removeLRUItem(): void {
    let lruKey = '';
    let lruTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.removeFromCache(lruKey);
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  getCacheStats(): {
    size: number;
    itemCount: number;
    maxSize: number;
    maxItems: number;
  } {
    return {
      size: this.currentCacheSize,
      itemCount: this.cache.size,
      maxSize: this.maxCacheSize,
      maxItems: this.maxCacheItems
    };
  }

  // Cleanup unused audio resources
  async cleanupUnusedAudio(): Promise<void> {
    const unusedThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    for (const [songId, entry] of this.cache) {
      if (now - entry.lastAccessed > unusedThreshold) {
        // Remove from native audio cache
        if (Capacitor.isNativePlatform()) {
          try {
            await NativeAudio.unload({ assetId: songId });
          } catch (error) {
            console.warn(`Could not unload audio ${songId}:`, error);
          }
        }
        
        this.removeFromCache(songId);
      }
    }
  }
}

export const audioMemoryManager = new AudioMemoryManager();
```

## Audio Composables

### 1. Enhanced Audio Player Composable
Convert the existing audio player composable:

```typescript
// src/composables/useAudioPlayer.ts
import { ref, computed, onUnmounted } from 'vue';
import { audioService } from '@/services/audioService';
import { clipService } from '@/services/clipService';
import { backgroundAudioService } from '@/services/backgroundAudioService';
import { audioMemoryManager } from '@/services/audioMemoryManager';

export interface AudioPlayerConfig {
  songId: string;
  audioUrl: string;
  clipStartTime?: number;
  autoStopAfter?: number;
  volume?: number;
  preservePositionOnPause?: boolean;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function useAudioPlayer() {
  const currentSongId = ref<string | null>(null);
  const isPlaying = ref(false);
  const isLoading = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const progress = ref(0);
  const error = ref<Error | null>(null);

  // Computed
  const hasCurrentSong = computed(() => !!currentSongId.value);
  const canPlay = computed(() => !isLoading.value && !error.value);
  const progressPercentage = computed(() => Math.round(progress.value));

  // Initialize services
  const initializeServices = async () => {
    await audioService.initialize();
    await backgroundAudioService.initialize();
  };

  // Main playback function
  const togglePlay = async (config: AudioPlayerConfig): Promise<void> => {
    try {
      // Initialize services if needed
      await initializeServices();

      const { songId, audioUrl, preservePositionOnPause = false } = config;

      // If same song is already playing, toggle pause/play
      if (currentSongId.value === songId && isPlaying.value) {
        await pause();
        return;
      }

      // If same song is paused, resume
      if (currentSongId.value === songId && !isPlaying.value && preservePositionOnPause) {
        await resume();
        return;
      }

      // Stop current song if different
      if (currentSongId.value && currentSongId.value !== songId) {
        await stopAllPlayers();
      }

      // Update state
      currentSongId.value = songId;
      isLoading.value = true;
      error.value = null;

      // Set up background audio if needed
      if (config.autoStopAfter) {
        await backgroundAudioService.setBackgroundTrack({
          songId,
          title: 'Battle Song', // Would get from song data
          artist: 'Unknown Artist',
          duration: config.autoStopAfter
        });
      }

      // Play audio
      await audioService.playAudio({
        ...config,
        onEnded: () => {
          handleAudioEnded(config.onEnded);
        },
        onProgress: (progressValue) => {
          progress.value = progressValue;
          config.onProgress?.(progressValue);
        },
        onError: (err) => {
          error.value = err;
          isLoading.value = false;
          config.onError?.(err);
        },
        onLoadingChange: (loading) => {
          isLoading.value = loading;
          config.onLoadingChange?.(loading);
        }
      });

      // Update playing state
      isPlaying.value = true;
      backgroundAudioService.updatePlaybackState(true);

    } catch (err) {
      console.error('Audio playback error:', err);
      error.value = err as Error;
      isLoading.value = false;
      throw err;
    }
  };

  const pause = async (): Promise<void> => {
    if (!currentSongId.value) return;

    try {
      await audioService.pauseAudio(currentSongId.value);
      isPlaying.value = false;
      backgroundAudioService.updatePlaybackState(false);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resume = async (): Promise<void> => {
    if (!currentSongId.value) return;

    try {
      const audioState = audioService.getAudioState(currentSongId.value);
      if (audioState) {
        await audioService.playAudio({
          songId: currentSongId.value,
          audioUrl: '', // Would need to store audio URL
          autoStopAfter: audioState.duration - audioState.currentTime
        });
        isPlaying.value = true;
        backgroundAudioService.updatePlaybackState(true);
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const stop = async (): Promise<void> => {
    if (!currentSongId.value) return;

    try {
      await audioService.stopAudio(currentSongId.value);
      currentSongId.value = null;
      isPlaying.value = false;
      currentTime.value = 0;
      duration.value = 0;
      progress.value = 0;
      backgroundAudioService.updatePlaybackState(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const stopAllPlayers = async (): Promise<void> => {
    try {
      await audioService.stopAllAudio();
      await clipService.cleanup();
      currentSongId.value = null;
      isPlaying.value = false;
      currentTime.value = 0;
      duration.value = 0;
      progress.value = 0;
    } catch (error) {
      console.error('Error stopping all players:', error);
    }
  };

  const setVolume = async (volume: number): Promise<void> => {
    if (!currentSongId.value) return;

    try {
      await audioService.setVolume(currentSongId.value, volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const seekTo = async (time: number): Promise<void> => {
    if (!currentSongId.value) return;

    try {
      await audioService.seekTo(currentSongId.value, time);
      currentTime.value = time;
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  // Clip-specific functions
  const playClip = async (config: AudioPlayerConfig): Promise<void> => {
    const { songId, audioUrl, clipStartTime = 0, autoStopAfter = 30000 } = config;

    try {
      await clipService.playClip({
        songId,
        audioUrl,
        clipStartTime,
        clipDuration: autoStopAfter,
        onClipEnd: config.onEnded,
        onProgress: config.onProgress
      });

      currentSongId.value = songId;
      isPlaying.value = true;
    } catch (error) {
      console.error('Error playing clip:', error);
      throw error;
    }
  };

  const pauseClip = async (songId: string): Promise<void> => {
    try {
      await clipService.pauseClip(songId);
      isPlaying.value = false;
    } catch (error) {
      console.error('Error pausing clip:', error);
    }
  };

  const resumeClip = async (songId: string): Promise<void> => {
    try {
      await clipService.resumeClip(songId);
      isPlaying.value = true;
    } catch (error) {
      console.error('Error resuming clip:', error);
    }
  };

  const stopClip = async (songId: string): Promise<void> => {
    try {
      await clipService.stopClip(songId);
      if (currentSongId.value === songId) {
        currentSongId.value = null;
        isPlaying.value = false;
      }
    } catch (error) {
      console.error('Error stopping clip:', error);
    }
  };

  // Helper functions
  const handleAudioEnded = (onEnded?: () => void): void => {
    currentSongId.value = null;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    progress.value = 0;
    backgroundAudioService.updatePlaybackState(false);
    onEnded?.();
  };

  const preloadAudio = async (songId: string, audioUrl: string): Promise<void> => {
    try {
      await audioService.preloadAudio(songId, audioUrl);
      
      // Add to memory cache
      audioMemoryManager.addToCache(songId, audioUrl, 0); // Size would be calculated
    } catch (error) {
      console.error('Error preloading audio:', error);
    }
  };

  const getAudioState = (songId: string) => {
    return audioService.getAudioState(songId);
  };

  // Cleanup on unmount
  onUnmounted(async () => {
    await stopAllPlayers();
    await audioService.cleanup();
    await clipService.cleanup();
    await backgroundAudioService.cleanup();
  });

  return {
    // State
    currentSongId,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    error,
    
    // Computed
    hasCurrentSong,
    canPlay,
    progressPercentage,
    
    // Actions
    togglePlay,
    pause,
    resume,
    stop,
    stopAllPlayers,
    setVolume,
    seekTo,
    playClip,
    pauseClip,
    resumeClip,
    stopClip,
    preloadAudio,
    getAudioState
  };
}
```

## Battle Audio System

### 1. Dual Audio Player
Create a system for playing two songs simultaneously:

```typescript
// src/composables/useBattleAudio.ts
import { ref, computed } from 'vue';
import { useAudioPlayer } from './useAudioPlayer';

export interface BattleSong {
  id: string;
  title: string;
  artist: string;
  url: string;
  clipStartTime?: number;
}

export interface BattleAudioConfig {
  songA: BattleSong;
  songB: BattleSong;
  onSongAEnded?: () => void;
  onSongBEnded?: () => void;
  onBothSongsEnded?: () => void;
}

export function useBattleAudio() {
  const audioPlayerA = useAudioPlayer();
  const audioPlayerB = useAudioPlayer();
  
  const battleStarted = ref(false);
  const battlePhase = ref<'playing' | 'voting' | 'complete'>('playing');
  const songsEnded = ref({ songA: false, songB: false });

  // Computed
  const isPlaying = computed(() => 
    audioPlayerA.isPlaying.value || audioPlayerB.isPlaying.value
  );
  
  const bothSongsEnded = computed(() => 
    songsEnded.value.songA && songsEnded.value.songB
  );

  const canVote = computed(() => 
    battlePhase.value === 'voting' && !bothSongsEnded.value
  );

  // Actions
  const startBattle = async (config: BattleAudioConfig): Promise<void> => {
    try {
      battleStarted.value = true;
      battlePhase.value = 'playing';
      songsEnded.value = { songA: false, songB: false };

      // Start both songs simultaneously
      await Promise.all([
        audioPlayerA.togglePlay({
          songId: config.songA.id,
          audioUrl: config.songA.url,
          clipStartTime: config.songA.clipStartTime,
          autoStopAfter: 30000,
          onEnded: () => handleSongAEnded(config.onSongAEnded)
        }),
        audioPlayerB.togglePlay({
          songId: config.songB.id,
          audioUrl: config.songB.url,
          clipStartTime: config.songB.clipStartTime,
          autoStopAfter: 30000,
          onEnded: () => handleSongBEnded(config.onSongBEnded)
        })
      ]);

      // Set voting phase after 30 seconds
      setTimeout(() => {
        if (battlePhase.value === 'playing') {
          battlePhase.value = 'voting';
        }
      }, 30000);

    } catch (error) {
      console.error('Error starting battle:', error);
      throw error;
    }
  };

  const pauseBattle = async (): Promise<void> => {
    await Promise.all([
      audioPlayerA.pause(),
      audioPlayerB.pause()
    ]);
  };

  const resumeBattle = async (): Promise<void> => {
    await Promise.all([
      audioPlayerA.resume(),
      audioPlayerB.resume()
    ]);
  };

  const stopBattle = async (): Promise<void> => {
    await Promise.all([
      audioPlayerA.stop(),
      audioPlayerB.stop()
    ]);
    
    battleStarted.value = false;
    battlePhase.value = 'playing';
    songsEnded.value = { songA: false, songB: false };
  };

  const toggleSongA = async (): Promise<void> => {
    if (audioPlayerA.isPlaying.value) {
      await audioPlayerA.pause();
    } else {
      await audioPlayerA.resume();
    }
  };

  const toggleSongB = async (): Promise<void> => {
    if (audioPlayerB.isPlaying.value) {
      await audioPlayerB.pause();
    } else {
      await audioPlayerB.resume();
    }
  };

  const setVolumeA = async (volume: number): Promise<void> => {
    await audioPlayerA.setVolume(volume);
  };

  const setVolumeB = async (volume: number): Promise<void> => {
    await audioPlayerB.setVolume(volume);
  };

  // Helper functions
  const handleSongAEnded = (onEnded?: () => void): void => {
    songsEnded.value.songA = true;
    onEnded?.();
    
    if (bothSongsEnded.value) {
      handleBothSongsEnded();
    }
  };

  const handleSongBEnded = (onEnded?: () => void): void => {
    songsEnded.value.songB = true;
    onEnded?.();
    
    if (bothSongsEnded.value) {
      handleBothSongsEnded();
    }
  };

  const handleBothSongsEnded = (): void => {
    battlePhase.value = 'complete';
    battleStarted.value = false;
  };

  return {
    // State
    battleStarted,
    battlePhase,
    songsEnded,
    
    // Computed
    isPlaying,
    bothSongsEnded,
    canVote,
    
    // Audio players
    audioPlayerA,
    audioPlayerB,
    
    // Actions
    startBattle,
    pauseBattle,
    resumeBattle,
    stopBattle,
    toggleSongA,
    toggleSongB,
    setVolumeA,
    setVolumeB
  };
}
```

## Performance Optimization

### 1. Audio Performance Monitor
Create performance monitoring:

```typescript
// src/services/audioPerformanceMonitor.ts
interface PerformanceMetrics {
  loadTime: number;
  playTime: number;
  memoryUsage: number;
  errorRate: number;
  batteryImpact: 'low' | 'medium' | 'high';
}

class AudioPerformanceMonitor {
  private metrics = new Map<string, PerformanceMetrics>();
  private startTimes = new Map<string, number>();

  startTiming(songId: string, operation: 'load' | 'play'): void {
    this.startTimes.set(`${songId}-${operation}`, Date.now());
  }

  endTiming(songId: string, operation: 'load' | 'play'): number {
    const key = `${songId}-${operation}`;
    const startTime = this.startTimes.get(key);
    
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(key);
    
    // Update metrics
    const existing = this.metrics.get(songId) || {
      loadTime: 0,
      playTime: 0,
      memoryUsage: 0,
      errorRate: 0,
      batteryImpact: 'low'
    };
    
    if (operation === 'load') {
      existing.loadTime = duration;
    } else {
      existing.playTime = duration;
    }
    
    this.metrics.set(songId, existing);
    
    return duration;
  }

  recordError(songId: string): void {
    const existing = this.metrics.get(songId) || {
      loadTime: 0,
      playTime: 0,
      memoryUsage: 0,
      errorRate: 0,
      batteryImpact: 'low'
    };
    
    existing.errorRate += 1;
    this.metrics.set(songId, existing);
  }

  recordMemoryUsage(songId: string, usage: number): void {
    const existing = this.metrics.get(songId) || {
      loadTime: 0,
      playTime: 0,
      memoryUsage: 0,
      errorRate: 0,
      batteryImpact: 'low'
    };
    
    existing.memoryUsage = usage;
    
    // Determine battery impact based on memory usage
    if (usage > 50 * 1024 * 1024) { // 50MB
      existing.batteryImpact = 'high';
    } else if (usage > 20 * 1024 * 1024) { // 20MB
      existing.batteryImpact = 'medium';
    } else {
      existing.batteryImpact = 'low';
    }
    
    this.metrics.set(songId, existing);
  }

  getMetrics(songId: string): PerformanceMetrics | undefined {
    return this.metrics.get(songId);
  }

  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  getAverageLoadTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.loadTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getAveragePlayTime(): number {
    const times = Array.from(this.metrics.values()).map(m => m.playTime);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  getErrorRate(): number {
    const errors = Array.from(this.metrics.values()).map(m => m.errorRate);
    const total = errors.reduce((a, b) => a + b, 0);
    return this.metrics.size > 0 ? total / this.metrics.size : 0;
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

export const audioPerformanceMonitor = new AudioPerformanceMonitor();
```

## Code Examples

### 1. Complete Audio Component
Example of using the audio system in a component:

```vue
<!-- src/components/MobileAudioPlayer.vue -->
<template>
  <div class="audio-player">
    <!-- Song Info -->
    <div class="song-info">
      <h3>{{ song.title }}</h3>
      <p>{{ song.artist }}</p>
    </div>
    
    <!-- Progress Bar -->
    <div class="progress-container">
      <ion-progress-bar 
        :value="progress / 100"
        :buffer="0"
        color="primary"
      />
      <div class="time-display">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
    
    <!-- Controls -->
    <div class="controls">
      <ion-button 
        @click="seekTo(currentTime - 10000)"
        fill="clear"
        :disabled="!canSeek"
      >
        <ion-icon :icon="playSkipBack" />
      </ion-button>
      
      <ion-button 
        @click="togglePlay"
        fill="solid"
        size="large"
        :disabled="isLoading"
      >
        <ion-spinner v-if="isLoading" name="crescent" />
        <ion-icon v-else :icon="isPlaying ? pause : play" />
      </ion-button>
      
      <ion-button 
        @click="seekTo(currentTime + 10000)"
        fill="clear"
        :disabled="!canSeek"
      >
        <ion-icon :icon="playSkipForward" />
      </ion-button>
    </div>
    
    <!-- Volume Control -->
    <div class="volume-control">
      <ion-icon :icon="volumeLow" />
      <ion-range 
        v-model="volume"
        min="0"
        max="100"
        @ion-input="updateVolume"
      />
      <ion-icon :icon="volumeHigh" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonSpinner, IonProgressBar, IonRange } from '@ionic/vue';
import { play, pause, playSkipBack, playSkipForward, volumeLow, volumeHigh } from 'ionicons/icons';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAudioPlayer } from '@/composables/useAudioPlayer';

interface Props {
  song: {
    id: string;
    title: string;
    artist: string;
    url: string;
    clipStartTime?: number;
    duration?: number;
  };
  autoPlay?: boolean;
  showClipIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false,
  showClipIndicator: false
});

const emit = defineEmits<{
  play: [songId: string];
  pause: [songId: string];
  ended: [songId: string];
  error: [error: Error];
}>();

const audioPlayer = useAudioPlayer();
const volume = ref(70);

// Computed
const isPlaying = computed(() => 
  audioPlayer.currentSongId.value === props.song.id && audioPlayer.isPlaying.value
);

const isLoading = computed(() => 
  audioPlayer.currentSongId.value === props.song.id && audioPlayer.isLoading.value
);

const currentTime = computed(() => {
  if (audioPlayer.currentSongId.value === props.song.id) {
    return audioPlayer.currentTime.value;
  }
  return 0;
});

const duration = computed(() => props.song.duration || 30000);

const progress = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const canSeek = computed(() => 
  audioPlayer.currentSongId.value === props.song.id && !isLoading.value
);

// Methods
const togglePlay = async () => {
  try {
    if (isPlaying.value) {
      await audioPlayer.pause();
      emit('pause', props.song.id);
    } else {
      await audioPlayer.togglePlay({
        songId: props.song.id,
        audioUrl: props.song.url,
        clipStartTime: props.song.clipStartTime,
        autoStopAfter: duration.value,
        volume: volume.value / 100,
        onEnded: () => emit('ended', props.song.id),
        onError: (error) => emit('error', error),
        onProgress: () => {
          // Progress is handled by computed properties
        }
      });
      emit('play', props.song.id);
    }
  } catch (error) {
    console.error('Audio playback error:', error);
    emit('error', error as Error);
  }
};

const seekTo = async (time: number) => {
  if (!canSeek.value) return;
  
  try {
    await audioPlayer.seekTo(Math.max(0, Math.min(time, duration.value)));
  } catch (error) {
    console.error('Seek error:', error);
  }
};

const updateVolume = async () => {
  try {
    await audioPlayer.setVolume(volume.value / 100);
  } catch (error) {
    console.error('Volume error:', error);
  }
};

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Auto-play if enabled
onMounted(async () => {
  if (props.autoPlay) {
    await togglePlay();
  }
});

// Cleanup on unmount
onUnmounted(async () => {
  if (isPlaying.value) {
    await audioPlayer.stop();
  }
});
</script>

<style scoped>
.audio-player {
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 12px;
  margin: 1rem 0;
}

.song-info {
  text-align: center;
  margin-bottom: 1rem;
}

.song-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.song-info p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.progress-container {
  margin-bottom: 1rem;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin-top: 0.5rem;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-control ion-range {
  flex: 1;
}
</style>
```

### 2. Battle Audio Component
Example of using the battle audio system:

```vue
<!-- src/components/BattleAudioPlayer.vue -->
<template>
  <div class="battle-audio">
    <div class="battle-header">
      <h2>Battle Mode</h2>
      <div class="battle-phase">
        <ion-chip :color="phaseColor">
          {{ phaseText }}
        </ion-chip>
      </div>
    </div>
    
    <div class="songs-container">
      <!-- Song A -->
      <div class="song-player" :class="{ active: isPlayingA }">
        <h3>Song A</h3>
        <MobileAudioPlayer 
          :song="songA"
          :auto-play="false"
          @play="handleSongAPlay"
          @pause="handleSongAPause"
          @ended="handleSongAEnded"
        />
        <div class="song-controls">
          <ion-button 
            @click="toggleSongA"
            :color="isPlayingA ? 'primary' : 'medium'"
          >
            <ion-icon :icon="isPlayingA ? pause : play" />
            {{ isPlayingA ? 'Pause A' : 'Play A' }}
          </ion-button>
        </div>
      </div>
      
      <!-- VS Divider -->
      <div class="vs-divider">
        <ion-icon :icon="musicalNotes" />
        <span>VS</span>
      </div>
      
      <!-- Song B -->
      <div class="song-player" :class="{ active: isPlayingB }">
        <h3>Song B</h3>
        <MobileAudioPlayer 
          :song="songB"
          :auto-play="false"
          @play="handleSongBPlay"
          @pause="handleSongBPause"
          @ended="handleSongBEnded"
        />
        <div class="song-controls">
          <ion-button 
            @click="toggleSongB"
            :color="isPlayingB ? 'primary' : 'medium'"
          >
            <ion-icon :icon="isPlayingB ? pause : play" />
            {{ isPlayingB ? 'Pause B' : 'Play B' }}
          </ion-button>
        </div>
      </div>
    </div>
    
    <!-- Battle Controls -->
    <div class="battle-controls">
      <ion-button 
        v-if="!battleStarted"
        @click="startBattle"
        size="large"
        :disabled="!canStartBattle"
      >
        Start Battle
      </ion-button>
      
      <div v-else class="battle-actions">
        <ion-button 
          @click="pauseBattle"
          fill="outline"
          :disabled="!isPlaying"
        >
          Pause Battle
        </ion-button>
        
        <ion-button 
          @click="stopBattle"
          color="danger"
          fill="outline"
        >
          Stop Battle
        </ion-button>
      </div>
    </div>
    
    <!-- Voting Section -->
    <div v-if="canVote" class="voting-section">
      <h3>Choose Your Winner</h3>
      <div class="vote-buttons">
        <ion-button 
          @click="voteForSongA"
          size="large"
          color="success"
        >
          Vote for Song A
        </ion-button>
        <ion-button 
          @click="voteForSongB"
          size="large"
          color="success"
        >
          Vote for Song B
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonChip } from '@ionic/vue';
import { play, pause, musicalNotes } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useBattleAudio } from '@/composables/useBattleAudio';
import MobileAudioPlayer from '@/components/MobileAudioPlayer.vue';

interface Props {
  songA: {
    id: string;
    title: string;
    artist: string;
    url: string;
    clipStartTime?: number;
  };
  songB: {
    id: string;
    title: string;
    artist: string;
    url: string;
    clipStartTime?: number;
  };
}

const props = defineProps<Props>();

const emit = defineEmits<{
  battleStarted: [];
  battleEnded: [];
  voteSubmitted: [songId: string];
}>();

const battleAudio = useBattleAudio();

// Computed
const battleStarted = computed(() => battleAudio.battleStarted.value);
const battlePhase = computed(() => battleAudio.battlePhase.value);
const isPlaying = computed(() => battleAudio.isPlaying.value);
const canVote = computed(() => battleAudio.canVote.value);

const isPlayingA = computed(() => 
  battleAudio.audioPlayerA.isPlaying.value && 
  battleAudio.audioPlayerA.currentSongId.value === props.songA.id
);

const isPlayingB = computed(() => 
  battleAudio.audioPlayerB.isPlaying.value && 
  battleAudio.audioPlayerB.currentSongId.value === props.songB.id
);

const canStartBattle = computed(() => 
  props.songA.url && props.songB.url && !battleStarted.value
);

const phaseColor = computed(() => {
  switch (battlePhase.value) {
    case 'playing': return 'primary';
    case 'voting': return 'warning';
    case 'complete': return 'success';
    default: return 'medium';
  }
});

const phaseText = computed(() => {
  switch (battlePhase.value) {
    case 'playing': return 'Playing';
    case 'voting': return 'Vote Now';
    case 'complete': return 'Complete';
    default: return 'Ready';
  }
});

// Methods
const startBattle = async () => {
  try {
    await battleAudio.startBattle({
      songA: props.songA,
      songB: props.songB,
      onBothSongsEnded: () => emit('battleEnded')
    });
    emit('battleStarted');
  } catch (error) {
    console.error('Error starting battle:', error);
  }
};

const pauseBattle = async () => {
  await battleAudio.pauseBattle();
};

const stopBattle = async () => {
  await battleAudio.stopBattle();
  emit('battleEnded');
};

const toggleSongA = async () => {
  await battleAudio.toggleSongA();
};

const toggleSongB = async () => {
  await battleAudio.toggleSongB();
};

const voteForSongA = async () => {
  await battleAudio.stopBattle();
  emit('voteSubmitted', props.songA.id);
};

const voteForSongB = async () => {
  await battleAudio.stopBattle();
  emit('voteSubmitted', props.songB.id);
};

// Event handlers
const handleSongAPlay = () => {
  console.log('Song A started playing');
};

const handleSongAPause = () => {
  console.log('Song A paused');
};

const handleSongAEnded = () => {
  console.log('Song A ended');
};

const handleSongBPlay = () => {
  console.log('Song B started playing');
};

const handleSongBPause = () => {
  console.log('Song B paused');
};

const handleSongBEnded = () => {
  console.log('Song B ended');
};
</script>

<style scoped>
.battle-audio {
  padding: 1rem;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.battle-header h2 {
  margin: 0;
}

.songs-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.song-player {
  padding: 1rem;
  border: 2px solid var(--ion-color-light);
  border-radius: 12px;
  text-align: center;
}

.song-player.active {
  border-color: var(--ion-color-primary);
  background: var(--ion-color-primary-tint);
}

.song-player h3 {
  margin: 0 0 1rem 0;
}

.song-controls {
  margin-top: 1rem;
}

.vs-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-weight: bold;
  color: var(--ion-color-medium);
}

.vs-divider ion-icon {
  font-size: 2rem;
}

.battle-controls {
  text-align: center;
  margin-bottom: 2rem;
}

.battle-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.voting-section {
  text-align: center;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.voting-section h3 {
  margin: 0 0 1rem 0;
}

.vote-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .songs-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .vs-divider {
    order: -1;
    flex-direction: row;
  }
  
  .vote-buttons {
    flex-direction: column;
  }
}
</style>
```

---

This completes the audio system conversion guide. The mobile audio system provides native performance, background playback, and optimized memory management while maintaining the sophisticated 30-second clip functionality of the web version.

