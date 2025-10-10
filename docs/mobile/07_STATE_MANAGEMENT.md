# State Management Conversion Guide

## Overview
This guide covers the complete conversion of all 8 Pinia stores from the SongWars web application to mobile-optimized stores with offline support, native features integration, and mobile-specific state management patterns.

## Table of Contents
1. [Store Conversion Overview](#store-conversion-overview)
2. [Core Stores](#core-stores)
3. [Feature Stores](#feature-stores)
4. [Mobile-Specific Adaptations](#mobile-specific-adaptations)
5. [Offline Support](#offline-support)
6. [Native Features Integration](#native-features-integration)
7. [Performance Optimizations](#performance-optimizations)
8. [Code Examples](#code-examples)

## Store Conversion Overview

### Current Web Stores (8 total)
Based on the SongWars web app structure:

```typescript
const webStores = [
  'authStore.ts',           // Authentication and user management
  'songStore.ts',           // Song management and CRUD operations
  'profileStore.ts',        // User profile management
  'songComparisonStore.ts', // Battle and voting logic
  'leaderboardStore.ts',    // Rankings and statistics
  'goldenEarsStore.ts',     // Golden Ears award system
  'uploadStore.ts',         // File upload management
  'themeStore.ts',          // Theme and UI preferences
];
```

### Mobile Store Structure
Convert to mobile-optimized stores with additional features:

```typescript
const mobileStores = [
  'authStore.ts',           // + Offline auth, biometric support
  'songStore.ts',           // + Offline caching, native audio
  'profileStore.ts',        // + Native image picker, offline sync
  'songComparisonStore.ts', // + Native audio, offline battles
  'leaderboardStore.ts',    // + Offline caching, push notifications
  'goldenEarsStore.ts',     // + Push notifications, offline sync
  'uploadStore.ts',         // + Native file picker, camera integration
  'themeStore.ts',          // + System theme detection, native preferences
  'offlineStore.ts',        // NEW - Offline data management
  'notificationStore.ts',   // NEW - Push notification management
];
```

## Core Stores

### 1. Auth Store (Mobile Enhanced)
Convert the authentication store for mobile:

```typescript
// src/store/authStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { BiometricAuth } from '@capacitor-community/biometric-auth';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('authStore', () => {
  const { client: supabase, user } = useSupabaseService();
  const router = useRouter();

  // State
  const authenticatedUser = ref(null);
  const accessToken = ref(null);
  const refreshToken = ref(null);
  const signInError = ref(null);
  const isOffline = ref(false);
  const biometricEnabled = ref(false);
  const lastSyncTime = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!authenticatedUser.value);
  const isAdmin = computed(() => authenticatedUser.value?.role === 'admin');
  const canUseBiometric = computed(() => 
    Capacitor.isNativePlatform() && biometricEnabled.value
  );

  // Actions
  const initializeAuth = async () => {
    try {
      // Check for stored credentials
      const storedToken = await Preferences.get({ key: 'auth_token' });
      const storedUser = await Preferences.get({ key: 'user_data' });
      
      if (storedToken.value && storedUser.value) {
        authenticatedUser.value = JSON.parse(storedUser.value);
        accessToken.value = storedToken.value;
        
        // Verify token is still valid
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          await clearStoredAuth();
        }
      }
      
      // Check biometric preference
      const biometricPref = await Preferences.get({ key: 'biometric_enabled' });
      biometricEnabled.value = biometricPref.value === 'true';
      
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      authenticatedUser.value = data.user;
      accessToken.value = data.session.access_token;
      refreshToken.value = data.session.refresh_token;

      // Store credentials
      await storeAuthData(data);
      
      // Load user profile
      await loadUserProfile();
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signInWithBiometric = async () => {
    if (!canUseBiometric.value) {
      throw new Error('Biometric authentication not available');
    }

    try {
      // Check biometric availability
      const result = await BiometricAuth.checkBiometry();
      if (!result.isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      // Authenticate with biometric
      const authResult = await BiometricAuth.authenticate({
        reason: 'Sign in to SongWars',
        title: 'Biometric Authentication',
        subtitle: 'Use your biometric to sign in',
        description: 'Authenticate to access your account'
      });

      if (authResult.biometryType) {
        // Retrieve stored credentials
        const storedToken = await Preferences.get({ key: 'auth_token' });
        const storedUser = await Preferences.get({ key: 'user_data' });
        
        if (storedToken.value && storedUser.value) {
          authenticatedUser.value = JSON.parse(storedUser.value);
          accessToken.value = storedToken.value;
          
          // Load user profile
          await loadUserProfile();
          
          return { success: true };
        }
      }
      
      throw new Error('Biometric authentication failed');
    } catch (error) {
      console.error('Biometric sign in error:', error);
      throw error;
    }
  };

  const enableBiometric = async () => {
    if (!Capacitor.isNativePlatform()) {
      throw new Error('Biometric authentication only available on native platforms');
    }

    try {
      const result = await BiometricAuth.checkBiometry();
      if (!result.isAvailable) {
        throw new Error('Biometric authentication not available on this device');
      }

      // Test biometric authentication
      await BiometricAuth.authenticate({
        reason: 'Enable biometric authentication',
        title: 'Enable Biometric Login',
        subtitle: 'Use your biometric to secure your account'
      });

      biometricEnabled.value = true;
      await Preferences.set({ key: 'biometric_enabled', value: 'true' });
      
      return { success: true };
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  };

  const disableBiometric = async () => {
    biometricEnabled.value = false;
    await Preferences.set({ key: 'biometric_enabled', value: 'false' });
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      authenticatedUser.value = null;
      accessToken.value = null;
      refreshToken.value = null;
      
      // Clear stored credentials
      await clearStoredAuth();
      
      // Navigate to sign in
      router.push('/sign-in');
      
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const deleteUserAccount = async () => {
    if (!authenticatedUser.value) {
      throw new Error('No authenticated user found');
    }

    try {
      // Delete server-side data
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;

      // Clear local data
      await clearStoredAuth();
      
      // Sign out
      await signOut();
      
      return { success: true };
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  };

  // Helper functions
  const storeAuthData = async (data: any) => {
    try {
      await Preferences.set({
        key: 'auth_token',
        value: data.session.access_token
      });
      await Preferences.set({
        key: 'user_data',
        value: JSON.stringify(data.user)
      });
      await Preferences.set({
        key: 'refresh_token',
        value: data.session.refresh_token
      });
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await Preferences.remove({ key: 'auth_token' });
      await Preferences.remove({ key: 'user_data' });
      await Preferences.remove({ key: 'refresh_token' });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const loadUserProfile = async () => {
    if (!authenticatedUser.value) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.value.id)
        .single();

      if (!error && data) {
        authenticatedUser.value = { ...authenticatedUser.value, ...data };
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isAuthenticated.value || !isOffline.value) return;

    try {
      // Sync any offline changes when back online
      lastSyncTime.value = new Date().toISOString();
      
      // Implement offline sync logic here
      // This would sync any cached data, pending uploads, etc.
      
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  return {
    // State
    authenticatedUser,
    accessToken,
    refreshToken,
    signInError,
    isOffline,
    biometricEnabled,
    lastSyncTime,
    
    // Computed
    isAuthenticated,
    isAdmin,
    canUseBiometric,
    
    // Actions
    initializeAuth,
    signInWithEmail,
    signInWithBiometric,
    enableBiometric,
    disableBiometric,
    signOut,
    deleteUserAccount,
    syncOfflineData
  };
});
```

### 2. Song Store (Mobile Enhanced)
Convert the song store for mobile with offline support:

```typescript
// src/store/songStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useOfflineStore } from './offlineStore';

export const useSongStore = defineStore('songStore', () => {
  const { client: supabase, user } = useSupabaseService();
  const offlineStore = useOfflineStore();

  // State
  const songs = ref([]);
  const loadingSongs = ref(false);
  const trashedSongs = ref([]);
  const loadingTrashedSongs = ref(false);
  const hasMoreSongs = ref(true);
  const lastLoadedIndex = ref(0);
  const pageSize = ref(20);
  const totalSongs = ref(0);
  const selectedGenre = ref('');
  const searchQuery = ref('');
  const loadingMore = ref(false);
  const offlineSongs = ref([]);
  const pendingUploads = ref([]);

  // Composables
  const isOffline = computed(() => offlineStore.isOffline);
  const hasOfflineSongs = computed(() => offlineSongs.value.length > 0);
  const hasPendingUploads = computed(() => pendingUploads.value.length > 0);

  // Actions
  const fetchSongs = async () => {
    if (isOffline.value) {
      await loadOfflineSongs();
      return;
    }

    loadingSongs.value = true;
    songs.value = [];
    lastLoadedIndex.value = 0;
    hasMoreSongs.value = true;

    if (!user.value) {
      loadingSongs.value = false;
      return;
    }

    try {
      // Get total count
      const { count, error: countError } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.value.id)
        .is('deleted_at', null);

      if (!countError) {
        totalSongs.value = count || 0;
      }

      // Fetch first batch
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.value.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(pageSize.value);

      if (!error) {
        songs.value = data || [];
        lastLoadedIndex.value = data?.length || 0;
        hasMoreSongs.value = (data?.length || 0) === pageSize.value;
        
        // Cache songs for offline use
        await cacheSongs(data || []);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      // Fallback to offline songs
      await loadOfflineSongs();
    } finally {
      loadingSongs.value = false;
    }
  };

  const loadMoreSongs = async () => {
    if (loadingMore.value || !hasMoreSongs.value || isOffline.value) return;

    loadingMore.value = true;

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.value.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(lastLoadedIndex.value, lastLoadedIndex.value + pageSize.value - 1);

      if (!error && data) {
        songs.value.push(...data);
        lastLoadedIndex.value += data.length;
        hasMoreSongs.value = data.length === pageSize.value;
        
        // Cache new songs
        await cacheSongs(data);
      }
    } catch (error) {
      console.error('Error loading more songs:', error);
    } finally {
      loadingMore.value = false;
    }
  };

  const uploadSong = async (songData: any, audioFile: File) => {
    if (isOffline.value) {
      return await queueOfflineUpload(songData, audioFile);
    }

    try {
      // Upload audio file to Supabase storage
      const fileName = `${Date.now()}-${audioFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('song-audio')
        .upload(fileName, audioFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('song-audio')
        .getPublicUrl(fileName);

      // Create song record
      const { data, error } = await supabase
        .from('songs')
        .insert({
          ...songData,
          url: urlData.publicUrl,
          filename: fileName,
          user_id: user.value.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      songs.value.unshift(data);
      totalSongs.value += 1;

      // Cache the new song
      await cacheSongs([data]);

      return { data, error: null };
    } catch (error) {
      console.error('Upload error:', error);
      // Queue for offline upload
      await queueOfflineUpload(songData, audioFile);
      return { data: null, error };
    }
  };

  const softDeleteSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', songId);

      if (error) throw error;

      // Remove from local state
      songs.value = songs.value.filter(song => song.id !== songId);
      totalSongs.value -= 1;

      // Update cache
      await updateCachedSong(songId, { deleted_at: new Date().toISOString() });

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      // Queue for offline deletion
      await queueOfflineAction('delete', songId);
      return { success: false, error };
    }
  };

  const restoreSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ deleted_at: null })
        .eq('id', songId);

      if (error) throw error;

      // Add back to local state
      const trashedSong = trashedSongs.value.find(song => song.id === songId);
      if (trashedSong) {
        trashedSong.deleted_at = null;
        songs.value.unshift(trashedSong);
        trashedSongs.value = trashedSongs.value.filter(song => song.id !== songId);
      }

      return { success: true };
    } catch (error) {
      console.error('Restore error:', error);
      return { success: false, error };
    }
  };

  // Offline support functions
  const loadOfflineSongs = async () => {
    try {
      const cachedSongs = await Preferences.get({ key: 'cached_songs' });
      if (cachedSongs.value) {
        offlineSongs.value = JSON.parse(cachedSongs.value);
        songs.value = offlineSongs.value.filter(song => !song.deleted_at);
      }
    } catch (error) {
      console.error('Error loading offline songs:', error);
    }
  };

  const cacheSongs = async (songsToCache: any[]) => {
    try {
      const existingSongs = offlineSongs.value || [];
      const updatedSongs = [...existingSongs];
      
      songsToCache.forEach(song => {
        const existingIndex = updatedSongs.findIndex(s => s.id === song.id);
        if (existingIndex >= 0) {
          updatedSongs[existingIndex] = song;
        } else {
          updatedSongs.push(song);
        }
      });

      offlineSongs.value = updatedSongs;
      await Preferences.set({
        key: 'cached_songs',
        value: JSON.stringify(updatedSongs)
      });
    } catch (error) {
      console.error('Error caching songs:', error);
    }
  };

  const queueOfflineUpload = async (songData: any, audioFile: File) => {
    const uploadId = Date.now().toString();
    const pendingUpload = {
      id: uploadId,
      songData,
      audioFile: {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type,
        // Store file data as base64 for offline storage
        data: await fileToBase64(audioFile)
      },
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    pendingUploads.value.push(pendingUpload);
    await Preferences.set({
      key: 'pending_uploads',
      value: JSON.stringify(pendingUploads.value)
    });

    return { data: { id: uploadId }, error: null };
  };

  const processPendingUploads = async () => {
    if (!hasPendingUploads.value || isOffline.value) return;

    for (const upload of pendingUploads.value) {
      try {
        // Convert base64 back to file
        const audioFile = await base64ToFile(
          upload.audioFile.data,
          upload.audioFile.name,
          upload.audioFile.type
        );

        // Upload the song
        const result = await uploadSong(upload.songData, audioFile);
        
        if (result.data) {
          // Remove from pending uploads
          pendingUploads.value = pendingUploads.value.filter(u => u.id !== upload.id);
        }
      } catch (error) {
        console.error('Error processing pending upload:', error);
      }
    }

    // Update stored pending uploads
    await Preferences.set({
      key: 'pending_uploads',
      value: JSON.stringify(pendingUploads.value)
    });
  };

  const queueOfflineAction = async (action: string, songId: string, data?: any) => {
    const actionId = Date.now().toString();
    const offlineAction = {
      id: actionId,
      action,
      songId,
      data,
      timestamp: new Date().toISOString()
    };

    const existingActions = await Preferences.get({ key: 'offline_actions' });
    const actions = existingActions.value ? JSON.parse(existingActions.value) : [];
    actions.push(offlineAction);

    await Preferences.set({
      key: 'offline_actions',
      value: JSON.stringify(actions)
    });
  };

  const processOfflineActions = async () => {
    if (isOffline.value) return;

    try {
      const storedActions = await Preferences.get({ key: 'offline_actions' });
      if (!storedActions.value) return;

      const actions = JSON.parse(storedActions.value);
      
      for (const action of actions) {
        try {
          switch (action.action) {
            case 'delete':
              await softDeleteSong(action.songId);
              break;
            case 'update':
              // Implement update logic
              break;
            // Add other actions as needed
          }
        } catch (error) {
          console.error('Error processing offline action:', error);
        }
      }

      // Clear processed actions
      await Preferences.remove({ key: 'offline_actions' });
    } catch (error) {
      console.error('Error processing offline actions:', error);
    }
  };

  // Helper functions
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const base64ToFile = (base64: string, filename: string, mimeType: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      const arr = base64.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      resolve(new File([u8arr], filename, { type: mimeType || mime }));
    });
  };

  const updateCachedSong = async (songId: string, updates: any) => {
    const updatedSongs = offlineSongs.value.map(song => 
      song.id === songId ? { ...song, ...updates } : song
    );
    offlineSongs.value = updatedSongs;
    await Preferences.set({
      key: 'cached_songs',
      value: JSON.stringify(updatedSongs)
    });
  };

  // Initialize store
  const initializeStore = async () => {
    await loadOfflineSongs();
    
    const storedUploads = await Preferences.get({ key: 'pending_uploads' });
    if (storedUploads.value) {
      pendingUploads.value = JSON.parse(storedUploads.value);
    }
  };

  return {
    // State
    songs,
    loadingSongs,
    trashedSongs,
    loadingTrashedSongs,
    hasMoreSongs,
    lastLoadedIndex,
    pageSize,
    totalSongs,
    selectedGenre,
    searchQuery,
    loadingMore,
    offlineSongs,
    pendingUploads,
    
    // Computed
    isOffline,
    hasOfflineSongs,
    hasPendingUploads,
    
    // Actions
    fetchSongs,
    loadMoreSongs,
    uploadSong,
    softDeleteSong,
    restoreSong,
    processPendingUploads,
    processOfflineActions,
    initializeStore
  };
});
```

### 3. Profile Store (Mobile Enhanced)
Convert the profile store for mobile with native features:

```typescript
// src/store/profileStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useAuthStore } from './authStore';

export const useProfileStore = defineStore('profileStore', () => {
  const { client: supabase } = useSupabaseService();
  const authStore = useAuthStore();

  // State
  const profile = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const isEditing = ref(false);
  const pendingChanges = ref({});

  // Computed
  const hasProfile = computed(() => !!profile.value);
  // Social links are stored in profile.social_links JSONB field, not a separate table
  // See SOCIAL_LINKS_IMPLEMENTATION.md for details
  const socialLinks = computed(() => profile.value?.social_links || []);
  const hasSocialLinks = computed(() => socialLinks.value.length > 0);
  const hasPendingChanges = computed(() => Object.keys(pendingChanges.value).length > 0);

  // Actions
  const fetchProfile = async () => {
    if (!authStore.authenticatedUser) return;

    loading.value = true;
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authStore.authenticatedUser.id)
        .single();

      if (profileError) throw profileError;

      profile.value = data;

      // Load social links
      await fetchSocialLinks();
    } catch (error) {
      console.error('Error fetching profile:', error);
      this.error = error;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (updates: any) => {
    if (!profile.value) return;

    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.value.id)
        .select()
        .single();

      if (error) throw error;

      profile.value = { ...profile.value, ...data };
      pendingChanges.value = {};
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateAvatar = async (imageSource: 'camera' | 'gallery') => {
    try {
      // Take or select image
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: imageSource === 'camera' ? CameraSource.Camera : CameraSource.Photos
      });

      // Convert to blob
      const response = await fetch(image.webPath);
      const blob = await response.blob();

      // Upload to Supabase storage
      const fileName = `avatar-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: urlData.publicUrl });

      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  // Note: Social links are managed via updateProfile with social_links array
  // No separate add/remove/fetch functions needed
  // Example usage:
  //   const updatedLinks = [...profile.value.social_links, newLink]
  //   await updateProfile({ social_links: updatedLinks })

  const startEditing = () => {
    isEditing.value = true;
    pendingChanges.value = {};
  };

  const cancelEditing = () => {
    isEditing.value = false;
    pendingChanges.value = {};
  };

  const saveChanges = async () => {
    if (!hasPendingChanges.value) return;

    try {
      await updateProfile(pendingChanges.value);
      isEditing.value = false;
    } catch (error) {
      throw error;
    }
  };

  const updatePendingChange = (field: string, value: any) => {
    pendingChanges.value[field] = value;
  };

  return {
    // State
    profile,
    loading,
    error,
    isEditing,
    pendingChanges,
    
    // Computed
    hasProfile,
    socialLinks, // Computed from profile.social_links
    hasSocialLinks,
    hasPendingChanges,
    
    // Actions
    fetchProfile,
    updateProfile,
    updateAvatar,
    startEditing,
    cancelEditing,
    saveChanges,
    updatePendingChange
  };
});
```

## Feature Stores

### 4. Song Comparison Store (Battle Logic)
Convert the battle store for mobile:

```typescript
// src/store/songComparisonStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useAuthStore } from './authStore';
import { useAudioPlayer } from '@/composables/useAudioPlayer';

export const useSongComparisonStore = defineStore('songComparisonStore', () => {
  const { client: supabase } = useSupabaseService();
  const authStore = useAuthStore();
  const audioPlayer = useAudioPlayer();

  // State
  const currentBattle = ref(null);
  const battleSongs = ref([]);
  const battlePhase = ref('selection'); // 'selection', 'playing', 'voting', 'complete'
  const selectedGenre = ref('');
  const loading = ref(false);
  const error = ref(null);
  const voteSubmitted = ref(false);
  const battleHistory = ref([]);

  // Computed
  const hasBattle = computed(() => !!currentBattle.value);
  const canVote = computed(() => 
    battlePhase.value === 'voting' && !voteSubmitted.value && authStore.isAuthenticated
  );
  const battleComplete = computed(() => battlePhase.value === 'complete');

  // Actions
  const startBattle = async (genre?: string) => {
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required to start battle');
    }

    loading.value = true;
    try {
      // Fetch two random songs for battle
      const { data: songs, error } = await supabase
        .from('songs')
        .select(`
          *,
          profiles!inner(username, display_name, avatar_url)
        `)
        .eq('status', 'live')
        .eq(genre ? 'genre' : 'id', genre || 'id', { operator: 'gte' })
        .limit(2);

      if (error) throw error;

      if (songs.length < 2) {
        throw new Error('Not enough songs available for battle');
      }

      // Create battle record
      const { data: battle, error: battleError } = await supabase
        .from('battles')
        .insert({
          song_a_id: songs[0].id,
          song_b_id: songs[1].id,
          user_id: authStore.authenticatedUser.id
        })
        .select()
        .single();

      if (battleError) throw battleError;

      currentBattle.value = battle;
      battleSongs.value = songs;
      battlePhase.value = 'playing';
      selectedGenre.value = genre || '';
      voteSubmitted.value = false;

      // Start playing both songs
      await playBattleSongs();

    } catch (error) {
      console.error('Error starting battle:', error);
      this.error = error;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const playBattleSongs = async () => {
    if (battleSongs.value.length < 2) return;

    try {
      // Play both songs simultaneously with 30-second clips
      const songA = battleSongs.value[0];
      const songB = battleSongs.value[1];

      await Promise.all([
        audioPlayer.togglePlay({
          songId: `battle-a-${songA.id}`,
          audioUrl: songA.url,
          clipStartTime: songA.clip_start_time || 0,
          autoStopAfter: 30000,
          onEnded: () => {
            // Song A ended
            console.log('Song A ended');
          }
        }),
        audioPlayer.togglePlay({
          songId: `battle-b-${songB.id}`,
          audioUrl: songB.url,
          clipStartTime: songB.clip_start_time || 0,
          autoStopAfter: 30000,
          onEnded: () => {
            // Song B ended
            console.log('Song B ended');
          }
        })
      ]);

      // After 30 seconds, move to voting phase
      setTimeout(() => {
        battlePhase.value = 'voting';
      }, 30000);

    } catch (error) {
      console.error('Error playing battle songs:', error);
    }
  };

  const submitVote = async (chosenSongId: string) => {
    if (!canVote.value) return;

    try {
      const chosenSong = battleSongs.value.find(song => song.id === chosenSongId);
      const unchosenSong = battleSongs.value.find(song => song.id !== chosenSongId);

      if (!chosenSong || !unchosenSong) {
        throw new Error('Invalid song selection');
      }

      // Record vote using RPC function
      const { error } = await supabase.rpc('record_comparison_vote', {
        chosen_song_id: chosenSongId,
        unchosen_song_id: unchosenSong.id,
        user_id: authStore.authenticatedUser.id
      });

      if (error) throw error;

      voteSubmitted.value = true;
      battlePhase.value = 'complete';

      // Add to battle history
      battleHistory.value.unshift({
        id: currentBattle.value.id,
        chosen_song: chosenSong,
        unchosen_song: unchosenSong,
        timestamp: new Date().toISOString()
      });

      // Stop all audio
      audioPlayer.stopAllPlayers();

    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  };

  const resetBattle = () => {
    currentBattle.value = null;
    battleSongs.value = [];
    battlePhase.value = 'selection';
    selectedGenre.value = '';
    voteSubmitted.value = false;
    error.value = null;
    audioPlayer.stopAllPlayers();
  };

  const loadBattleHistory = async () => {
    if (!authStore.isAuthenticated) return;

    try {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          battles!inner(song_a_id, song_b_id),
          songs!inner(title, genre, url)
        `)
        .eq('user_id', authStore.authenticatedUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error) {
        battleHistory.value = data || [];
      }
    } catch (error) {
      console.error('Error loading battle history:', error);
    }
  };

  return {
    // State
    currentBattle,
    battleSongs,
    battlePhase,
    selectedGenre,
    loading,
    error,
    voteSubmitted,
    battleHistory,
    
    // Computed
    hasBattle,
    canVote,
    battleComplete,
    
    // Actions
    startBattle,
    playBattleSongs,
    submitVote,
    resetBattle,
    loadBattleHistory
  };
});
```

## Mobile-Specific Adaptations

### 5. Offline Store (New)
Create a dedicated offline management store:

```typescript
// src/store/offlineStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

export const useOfflineStore = defineStore('offlineStore', () => {
  // State
  const isOffline = ref(false);
  const lastOnlineTime = ref(null);
  const pendingSync = ref([]);
  const syncInProgress = ref(false);

  // Computed
  const hasPendingSync = computed(() => pendingSync.value.length > 0);
  const timeOffline = computed(() => {
    if (!isOffline.value || !lastOnlineTime.value) return 0;
    return Date.now() - new Date(lastOnlineTime.value).getTime();
  });

  // Actions
  const initializeNetworkMonitoring = async () => {
    // Check initial network status
    const status = await Network.getStatus();
    isOffline.value = !status.connected;
    
    if (status.connected) {
      lastOnlineTime.value = new Date().toISOString();
    }

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      isOffline.value = !status.connected;
      
      if (status.connected) {
        lastOnlineTime.value = new Date().toISOString();
        // Trigger sync when back online
        syncPendingData();
      }
    });
  };

  const addPendingSync = (action: string, data: any) => {
    const syncItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    pendingSync.value.push(syncItem);
    storePendingSync();
  };

  const syncPendingData = async () => {
    if (isOffline.value || syncInProgress.value || !hasPendingSync.value) return;

    syncInProgress.value = true;

    try {
      for (const item of pendingSync.value) {
        try {
          await processSyncItem(item);
          // Remove successful sync item
          pendingSync.value = pendingSync.value.filter(s => s.id !== item.id);
        } catch (error) {
          console.error('Sync item failed:', error);
          item.retryCount += 1;
          
          // Remove items that have failed too many times
          if (item.retryCount >= 3) {
            pendingSync.value = pendingSync.value.filter(s => s.id !== item.id);
          }
        }
      }

      storePendingSync();
    } finally {
      syncInProgress.value = false;
    }
  };

  const processSyncItem = async (item: any) => {
    // Implement sync logic based on action type
    switch (item.action) {
      case 'upload_song':
        // Process song upload
        break;
      case 'update_profile':
        // Process profile update
        break;
      case 'delete_song':
        // Process song deletion
        break;
      // Add other sync actions
    }
  };

  const storePendingSync = async () => {
    try {
      await Preferences.set({
        key: 'pending_sync',
        value: JSON.stringify(pendingSync.value)
      });
    } catch (error) {
      console.error('Error storing pending sync:', error);
    }
  };

  const loadPendingSync = async () => {
    try {
      const stored = await Preferences.get({ key: 'pending_sync' });
      if (stored.value) {
        pendingSync.value = JSON.parse(stored.value);
      }
    } catch (error) {
      console.error('Error loading pending sync:', error);
    }
  };

  return {
    // State
    isOffline,
    lastOnlineTime,
    pendingSync,
    syncInProgress,
    
    // Computed
    hasPendingSync,
    timeOffline,
    
    // Actions
    initializeNetworkMonitoring,
    addPendingSync,
    syncPendingData,
    loadPendingSync
  };
});
```

### 6. Notification Store (New)
Create a notification management store:

```typescript
// src/store/notificationStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useRouter } from 'vue-router';

export const useNotificationStore = defineStore('notificationStore', () => {
  const { client: supabase, user } = useSupabaseService();
  const router = useRouter();

  // State
  const pushToken = ref(null);
  const notifications = ref([]);
  const unreadCount = ref(0);
  const permissionGranted = ref(false);

  // Computed
  const hasNotifications = computed(() => notifications.value.length > 0);
  const hasUnreadNotifications = computed(() => unreadCount.value > 0);

  // Actions
  const initializeNotifications = async () => {
    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      permissionGranted.value = permission.receive === 'granted';

      if (!permissionGranted.value) return;

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', async (token: Token) => {
        pushToken.value = token.value;
        await savePushToken(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Push registration error:', error);
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        handlePushNotification(notification);
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        handleNotificationAction(notification);
      });

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const savePushToken = async (token: string) => {
    // Optional: call your backend API to store the token if implemented.
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            data,
            sound: 'default'
          }
        ]
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  const handlePushNotification = (notification: PushNotificationSchema) => {
    // Add to local notifications list
    notifications.value.unshift({
      id: notification.id || Date.now().toString(),
      title: notification.title,
      body: notification.body,
      data: notification.data,
      timestamp: new Date().toISOString(),
      read: false
    });

    unreadCount.value += 1;
  };

  const handleNotificationAction = (notification: ActionPerformed) => {
    // Handle notification tap/action
    const notificationData = notification.notification.data;
    
    if (notificationData?.type === 'battle') {
      // Navigate to battle
      router.push('/tabs/dashboard');
    } else if (notificationData?.type === 'golden_ears') {
      // Navigate to golden ears
      router.push('/tabs/account');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  };

  const markAllAsRead = async () => {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    unreadCount.value = 0;
  };

  const clearNotifications = async () => {
    notifications.value = [];
    unreadCount.value = 0;
  };

  return {
    // State
    pushToken,
    notifications,
    unreadCount,
    permissionGranted,
    
    // Computed
    hasNotifications,
    hasUnreadNotifications,
    
    // Actions
    initializeNotifications,
    sendLocalNotification,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications
  };
});
```

## Performance Optimizations

### 7. Store Initialization
Create a centralized store initialization:

```typescript
// src/store/index.ts
import { useAuthStore } from './authStore';
import { useSongStore } from './songStore';
import { useProfileStore } from './profileStore';
import { useOfflineStore } from './offlineStore';
import { useNotificationStore } from './notificationStore';

export const initializeStores = async () => {
  const authStore = useAuthStore();
  const offlineStore = useOfflineStore();
  const notificationStore = useNotificationStore();

  // Initialize in order
  await authStore.initializeAuth();
  await offlineStore.initializeNetworkMonitoring();
  await notificationStore.initializeNotifications();

  // Load offline data
  await offlineStore.loadPendingSync();

  // Initialize other stores if authenticated
  if (authStore.isAuthenticated) {
    const songStore = useSongStore();
    const profileStore = useProfileStore();

    await songStore.initializeStore();
    await profileStore.fetchProfile();
  }
};
```

### 8. Store Persistence
Implement store persistence for offline support:

```typescript
// src/utils/storePersistence.ts
import { Preferences } from '@capacitor/preferences';

export const persistStore = async (storeName: string, data: any) => {
  try {
    await Preferences.set({
      key: `store_${storeName}`,
      value: JSON.stringify(data)
    });
  } catch (error) {
    console.error(`Error persisting store ${storeName}:`, error);
  }
};

export const restoreStore = async (storeName: string) => {
  try {
    const stored = await Preferences.get({ key: `store_${storeName}` });
    return stored.value ? JSON.parse(stored.value) : null;
  } catch (error) {
    console.error(`Error restoring store ${storeName}:`, error);
    return null;
  }
};

export const clearStore = async (storeName: string) => {
  try {
    await Preferences.remove({ key: `store_${storeName}` });
  } catch (error) {
    console.error(`Error clearing store ${storeName}:`, error);
  }
};
```

## Code Examples

### 1. Complete Store Usage Example
Example of using stores in a component:

```vue
<!-- src/views/ExamplePage.vue -->
<template>
  <ion-page>
    <ion-content>
      <div v-if="authStore.loading">Loading...</div>
      <div v-else-if="!authStore.isAuthenticated">
        <ion-button @click="signIn">Sign In</ion-button>
      </div>
      <div v-else>
        <h1>Welcome, {{ authStore.authenticatedUser.display_name }}</h1>
        
        <div v-if="songStore.hasPendingUploads" class="pending-uploads">
          <ion-chip color="warning">
            {{ songStore.pendingUploads.length }} uploads pending
          </ion-chip>
        </div>
        
        <div v-if="offlineStore.isOffline" class="offline-indicator">
          <ion-chip color="danger">Offline</ion-chip>
        </div>
        
        <ion-button @click="startBattle">Start Battle</ion-button>
        <ion-button @click="uploadSong">Upload Song</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonChip } from '@ionic/vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { useSongStore } from '@/store/songStore';
import { useOfflineStore } from '@/store/offlineStore';
import { useSongComparisonStore } from '@/store/songComparisonStore';

const authStore = useAuthStore();
const songStore = useSongStore();
const offlineStore = useOfflineStore();
const battleStore = useSongComparisonStore();

const signIn = async () => {
  try {
    await authStore.signInWithEmail('user@example.com', 'password');
  } catch (error) {
    console.error('Sign in failed:', error);
  }
};

const startBattle = async () => {
  try {
    await battleStore.startBattle('rock');
  } catch (error) {
    console.error('Battle failed:', error);
  }
};

const uploadSong = async () => {
  // Implementation for song upload
};

onMounted(async () => {
  // Initialize stores if needed
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth();
  }
});
</script>
```

### 2. Store Integration with Composables
Example of integrating stores with composables:

```typescript
// src/composables/useMobileFeatures.ts
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useOfflineStore } from '@/store/offlineStore';

export function useMobileFeatures() {
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const offlineStore = useOfflineStore();

  const initializeMobileFeatures = async () => {
    // Initialize all mobile features
    await Promise.all([
      authStore.initializeAuth(),
      notificationStore.initializeNotifications(),
      offlineStore.initializeNetworkMonitoring()
    ]);
  };

  const handleAppStateChange = (state: string) => {
    if (state === 'active') {
      // App became active - sync data
      if (!offlineStore.isOffline && authStore.isAuthenticated) {
        // Trigger data sync
      }
    }
  };

  return {
    initializeMobileFeatures,
    handleAppStateChange
  };
}
```

---

This completes the state management conversion guide. The next step is to convert the composables and utilities for mobile use.
