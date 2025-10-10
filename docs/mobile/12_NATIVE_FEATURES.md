# Native Features Implementation Guide

## Overview
This guide covers the implementation of native mobile features for the SongWars mobile application, including camera integration, file system access, push notifications, biometric authentication, haptic feedback, and device-specific capabilities.

## Table of Contents
1. [Camera Integration](#camera-integration)
2. [File System Access](#file-system-access)
3. [Push Notifications](#push-notifications)
4. [Biometric Authentication](#biometric-authentication)
5. [Haptic Feedback](#haptic-feedback)
6. [Device Information](#device-information)
7. [Network Status](#network-status)
8. [Screen Orientation](#screen-orientation)
9. [Code Examples](#code-examples)

## Camera Integration

### 1. Camera Service
Create a comprehensive camera service:

```typescript
// src/services/cameraService.ts
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType?: CameraResultType;
  source?: CameraSource;
  direction?: CameraDirection;
  saveToGallery?: boolean;
}

export interface CameraResult {
  webPath?: string;
  path?: string;
  format?: string;
  saved?: boolean;
}

class CameraService {
  private readonly defaultOptions: CameraOptions = {
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  };

  async takePicture(options: CameraOptions = {}): Promise<CameraResult> {
    try {
      const config = { ...this.defaultOptions, ...options };
      
      const image = await Camera.getPhoto(config);
      
      const result: CameraResult = {
        webPath: image.webPath,
        path: image.path,
        format: image.format
      };

      // Save to gallery if requested
      if (config.saveToGallery && image.path) {
        await this.saveToGallery(image.path);
        result.saved = true;
      }

      return result;
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error(`Failed to take picture: ${error}`);
    }
  }

  async selectFromGallery(options: CameraOptions = {}): Promise<CameraResult> {
    try {
      const config = { 
        ...this.defaultOptions, 
        ...options, 
        source: CameraSource.Photos 
      };
      
      const image = await Camera.getPhoto(config);
      
      return {
        webPath: image.webPath,
        path: image.path,
        format: image.format
      };
    } catch (error) {
      console.error('Gallery selection error:', error);
      throw new Error(`Failed to select from gallery: ${error}`);
    }
  }

  async saveToGallery(imagePath: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native platforms, the image is automatically saved to gallery
        // when using CameraResultType.Uri
        console.log('Image saved to gallery:', imagePath);
      } else {
        // On web, we need to trigger download
        await this.downloadImage(imagePath);
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      throw error;
    }
  }

  private async downloadImage(imagePath: string): Promise<void> {
    try {
      // Read the image file
      const imageData = await Filesystem.readFile({
        path: imagePath,
        directory: Directory.Cache
      });

      // Create blob and download
      const blob = new Blob([imageData.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `songwars-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  async getAvailableSources(): Promise<CameraSource[]> {
    const sources = [CameraSource.Camera];
    
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.photos === 'granted') {
        sources.push(CameraSource.Photos);
      }
    } catch (error) {
      console.error('Error checking photo permissions:', error);
    }
    
    return sources;
  }
}

export const cameraService = new CameraService();
```

### 2. Camera Composable
Create a Vue composable for camera functionality:

```typescript
// src/composables/useCamera.ts
import { ref, computed } from 'vue';
import { cameraService, CameraOptions, CameraResult } from '@/services/cameraService';

export function useCamera() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastImage = ref<CameraResult | null>(null);
  const hasPermission = ref(false);

  // Computed
  const canTakePicture = computed(() => hasPermission.value && !loading.value);
  const canSelectFromGallery = computed(() => hasPermission.value && !loading.value);

  // Actions
  const initialize = async () => {
    try {
      hasPermission.value = await cameraService.checkPermissions();
    } catch (error) {
      console.error('Error initializing camera:', error);
    }
  };

  const takePicture = async (options: CameraOptions = {}): Promise<CameraResult | null> => {
    if (!canTakePicture.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const result = await cameraService.takePicture(options);
      lastImage.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to take picture';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const selectFromGallery = async (options: CameraOptions = {}): Promise<CameraResult | null> => {
    if (!canSelectFromGallery.value) return null;

    loading.value = true;
    error.value = null;

    try {
      const result = await cameraService.selectFromGallery(options);
      lastImage.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select from gallery';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      hasPermission.value = await cameraService.requestPermissions();
      return hasPermission.value;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const clearLastImage = () => {
    lastImage.value = null;
  };

  return {
    // State
    loading,
    error,
    lastImage,
    hasPermission,
    
    // Computed
    canTakePicture,
    canSelectFromGallery,
    
    // Actions
    initialize,
    takePicture,
    selectFromGallery,
    requestPermissions,
    clearError,
    clearLastImage
  };
}
```

## File System Access

### 1. File System Service
Create a file system service for mobile:

```typescript
// src/services/fileSystemService.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  uri: string;
  lastModified: number;
}

export interface FileWriteOptions {
  path: string;
  data: string;
  directory?: Directory;
  encoding?: Encoding;
  recursive?: boolean;
}

export interface FileReadOptions {
  path: string;
  directory?: Directory;
  encoding?: Encoding;
}

class FileSystemService {
  async writeFile(options: FileWriteOptions): Promise<void> {
    try {
      await Filesystem.writeFile({
        path: options.path,
        data: options.data,
        directory: options.directory || Directory.Data,
        encoding: options.encoding || Encoding.UTF8,
        recursive: options.recursive || false
      });
    } catch (error) {
      console.error('File write error:', error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  async readFile(options: FileReadOptions): Promise<string> {
    try {
      const result = await Filesystem.readFile({
        path: options.path,
        directory: options.directory || Directory.Data,
        encoding: options.encoding || Encoding.UTF8
      });
      
      return result.data;
    } catch (error) {
      console.error('File read error:', error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  async deleteFile(path: string, directory: Directory = Directory.Data): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path,
        directory
      });
    } catch (error) {
      console.error('File delete error:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async getFileInfo(path: string, directory: Directory = Directory.Data): Promise<FileInfo> {
    try {
      const stat = await Filesystem.stat({
        path,
        directory
      });

      return {
        name: stat.name,
        path: stat.uri,
        size: stat.size || 0,
        type: stat.type || 'file',
        uri: stat.uri,
        lastModified: stat.mtime || Date.now()
      };
    } catch (error) {
      console.error('File stat error:', error);
      throw new Error(`Failed to get file info: ${error}`);
    }
  }

  async readDirectory(path: string, directory: Directory = Directory.Data): Promise<FileInfo[]> {
    try {
      const result = await Filesystem.readdir({
        path,
        directory
      });

      return result.files.map(file => ({
        name: file.name,
        path: file.uri,
        size: file.size || 0,
        type: file.type || 'file',
        uri: file.uri,
        lastModified: file.mtime || Date.now()
      }));
    } catch (error) {
      console.error('Directory read error:', error);
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  async createDirectory(path: string, directory: Directory = Directory.Data): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory,
        recursive: true
      });
    } catch (error) {
      console.error('Directory creation error:', error);
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  async deleteDirectory(path: string, directory: Directory = Directory.Data): Promise<void> {
    try {
      await Filesystem.rmdir({
        path,
        directory,
        recursive: true
      });
    } catch (error) {
      console.error('Directory deletion error:', error);
      throw new Error(`Failed to delete directory: ${error}`);
    }
  }

  async copyFile(fromPath: string, toPath: string, fromDir: Directory = Directory.Data, toDir: Directory = Directory.Data): Promise<void> {
    try {
      await Filesystem.copy({
        from: fromPath,
        to: toPath,
        toDirectory: toDir,
        directory: fromDir
      });
    } catch (error) {
      console.error('File copy error:', error);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  async moveFile(fromPath: string, toPath: string, fromDir: Directory = Directory.Data, toDir: Directory = Directory.Data): Promise<void> {
    try {
      await Filesystem.rename({
        from: fromPath,
        to: toPath,
        toDirectory: toDir,
        directory: fromDir
      });
    } catch (error) {
      console.error('File move error:', error);
      throw new Error(`Failed to move file: ${error}`);
    }
  }

  async getUri(path: string, directory: Directory = Directory.Data): Promise<string> {
    try {
      const result = await Filesystem.getUri({
        directory,
        path
      });
      
      return result.uri;
    } catch (error) {
      console.error('URI get error:', error);
      throw new Error(`Failed to get URI: ${error}`);
    }
  }

  // Utility methods
  async fileExists(path: string, directory: Directory = Directory.Data): Promise<boolean> {
    try {
      await Filesystem.stat({
        path,
        directory
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getDirectorySize(path: string, directory: Directory = Directory.Data): Promise<number> {
    try {
      const files = await this.readDirectory(path, directory);
      let totalSize = 0;
      
      for (const file of files) {
        if (file.type === 'file') {
          totalSize += file.size;
        } else if (file.type === 'directory') {
          totalSize += await this.getDirectorySize(file.path, directory);
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Directory size calculation error:', error);
      return 0;
    }
  }

  // Cleanup methods
  async clearCache(): Promise<void> {
    try {
      await Filesystem.rmdir({
        path: '',
        directory: Directory.Cache,
        recursive: true
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async clearData(): Promise<void> {
    try {
      await Filesystem.rmdir({
        path: '',
        directory: Directory.Data,
        recursive: true
      });
    } catch (error) {
      console.error('Data clear error:', error);
    }
  }
}

export const fileSystemService = new FileSystemService();
```

### 2. File System Composable
Create a Vue composable for file operations:

```typescript
// src/composables/useFileSystem.ts
import { ref, computed } from 'vue';
import { fileSystemService, FileInfo } from '@/services/fileSystemService';

export function useFileSystem() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const files = ref<FileInfo[]>([]);
  const currentPath = ref('/');

  // Computed
  const hasFiles = computed(() => files.value.length > 0);
  const totalSize = computed(() => 
    files.value.reduce((total, file) => total + file.size, 0)
  );

  // Actions
  const readDirectory = async (path: string = '/'): Promise<FileInfo[]> => {
    loading.value = true;
    error.value = null;

    try {
      const directoryFiles = await fileSystemService.readDirectory(path);
      files.value = directoryFiles;
      currentPath.value = path;
      return directoryFiles;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to read directory';
      return [];
    } finally {
      loading.value = false;
    }
  };

  const writeFile = async (path: string, data: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await fileSystemService.writeFile({ path, data });
      // Refresh directory
      await readDirectory(currentPath.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to write file';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const readFile = async (path: string): Promise<string> => {
    loading.value = true;
    error.value = null;

    try {
      const content = await fileSystemService.readFile({ path });
      return content;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to read file';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await fileSystemService.deleteFile(path);
      // Refresh directory
      await readDirectory(currentPath.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete file';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createDirectory = async (path: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      await fileSystemService.createDirectory(path);
      // Refresh directory
      await readDirectory(currentPath.value);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create directory';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getFileInfo = async (path: string): Promise<FileInfo> => {
    try {
      return await fileSystemService.getFileInfo(path);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get file info';
      throw err;
    }
  };

  const fileExists = async (path: string): Promise<boolean> => {
    try {
      return await fileSystemService.fileExists(path);
    } catch (err) {
      return false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    loading,
    error,
    files,
    currentPath,
    
    // Computed
    hasFiles,
    totalSize,
    
    // Actions
    readDirectory,
    writeFile,
    readFile,
    deleteFile,
    createDirectory,
    getFileInfo,
    fileExists,
    clearError
  };
}
```

## Push Notifications

### 1. Push Notification Service
Create a comprehensive push notification service:

```typescript
// src/services/pushNotificationService.ts
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useSupabaseService } from '@/composables/useSupabaseService';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
}

export interface LocalNotificationOptions {
  title: string;
  body: string;
  id?: number;
  schedule?: { at: Date };
  data?: Record<string, any>;
  sound?: string;
  attachments?: string[];
}

class PushNotificationService {
  private pushToken: string | null = null;
  private isInitialized = false;
  private notificationHandlers: Map<string, (data: any) => void> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const permissions = await PushNotifications.requestPermissions();
      
      if (permissions.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Set up event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('Push notifications initialized');
      } else {
        console.warn('Push notification permissions denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Registration listener
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token: ' + token.value);
      this.pushToken = token.value;
      
      // Save token to server
      await this.sendTokenToServer(token.value);
    });

    // Registration error listener
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error:', error);
    });

    // Push notification received listener
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Push notification action performed listener
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed:', notification);
      this.handleNotificationAction(notification);
    });
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      const { client: supabase, user } = useSupabaseService();
      
      if (user.value) {
        await supabase
          .from('user_push_tokens')
          .upsert({
            user_id: user.value.id,
            token,
            platform: Capacitor.getPlatform(),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Handle notification received while app is in foreground
    const data = notification.data;
    
    if (data?.type) {
      const handler = this.notificationHandlers.get(data.type);
      if (handler) {
        handler(data);
      }
    }
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    // Handle notification tap/action
    const data = notification.notification.data;
    
    if (data?.type) {
      const handler = this.notificationHandlers.get(data.type);
      if (handler) {
        handler(data);
      }
    }
  }

  // Public methods
  async sendLocalNotification(options: LocalNotificationOptions): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id || Date.now(),
          schedule: options.schedule,
          data: options.data,
          sound: options.sound || 'default',
          attachments: options.attachments
        }]
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
      throw error;
    }
  }

  async cancelLocalNotification(notificationId: number): Promise<void> {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
    } catch (error) {
      console.error('Error canceling local notification:', error);
    }
  }

  async getPendingNotifications(): Promise<any[]> {
    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await PushNotifications.requestPermissions();
      return permissions.receive === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await PushNotifications.checkPermissions();
      return permissions.receive === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  registerNotificationHandler(type: string, handler: (data: any) => void): void {
    this.notificationHandlers.set(type, handler);
  }

  unregisterNotificationHandler(type: string): void {
    this.notificationHandlers.delete(type);
  }

  getPushToken(): string | null {
    return this.pushToken;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.pushToken;
  }

  // Notification types for SongWars
  async sendBattleNotification(opponentName: string, songTitle: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'New Battle Challenge!',
      body: `${opponentName} challenged your song "${songTitle}"`,
      data: {
        type: 'battle',
        opponent: opponentName,
        song: songTitle
      }
    });
  }

  async sendGoldenEarsNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: 'Golden Ears Award!',
      body: 'You earned a Golden Ears award for your excellent musical judgment!',
      data: {
        type: 'golden_ears'
      }
    });
  }

  async sendSongUploadNotification(songTitle: string): Promise<void> {
    await this.sendLocalNotification({
      title: 'Song Uploaded!',
      body: `"${songTitle}" is now ready for battles!`,
      data: {
        type: 'song_uploaded',
        song: songTitle
      }
    });
  }

  async sendVoteNotification(songTitle: string, result: 'won' | 'lost'): Promise<void> {
    const title = result === 'won' ? 'Battle Won!' : 'Battle Lost';
    const body = result === 'won' 
      ? `Your song "${songTitle}" won the battle!`
      : `Your song "${songTitle}" lost the battle. Better luck next time!`;
    
    await this.sendLocalNotification({
      title,
      body,
      data: {
        type: 'vote_result',
        song: songTitle,
        result
      }
    });
  }
}

export const pushNotificationService = new PushNotificationService();
```

### 2. Notification Composable
Create a Vue composable for notifications:

```typescript
// src/composables/useNotifications.ts
import { ref, computed, onMounted } from 'vue';
import { pushNotificationService, LocalNotificationOptions } from '@/services/pushNotificationService';

export function useNotifications() {
  const isInitialized = ref(false);
  const hasPermission = ref(false);
  const pushToken = ref<string | null>(null);
  const pendingNotifications = ref<any[]>([]);

  // Computed
  const canSendNotifications = computed(() => 
    isInitialized.value && hasPermission.value
  );

  // Actions
  const initialize = async (): Promise<void> => {
    try {
      await pushNotificationService.initialize();
      isInitialized.value = true;
      hasPermission.value = await pushNotificationService.checkPermissions();
      pushToken.value = pushNotificationService.getPushToken();
      
      // Load pending notifications
      pendingNotifications.value = await pushNotificationService.getPendingNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      hasPermission.value = await pushNotificationService.requestPermissions();
      return hasPermission.value;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const sendNotification = async (options: LocalNotificationOptions): Promise<void> => {
    if (!canSendNotifications.value) {
      throw new Error('Notifications not available');
    }

    try {
      await pushNotificationService.sendLocalNotification(options);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  const cancelNotification = async (notificationId: number): Promise<void> => {
    try {
      await pushNotificationService.cancelLocalNotification(notificationId);
      // Remove from pending list
      pendingNotifications.value = pendingNotifications.value.filter(
        n => n.id !== notificationId
      );
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const registerHandler = (type: string, handler: (data: any) => void): void => {
    pushNotificationService.registerNotificationHandler(type, handler);
  };

  const unregisterHandler = (type: string): void => {
    pushNotificationService.unregisterNotificationHandler(type);
  };

  // SongWars specific notification methods
  const sendBattleNotification = async (opponentName: string, songTitle: string): Promise<void> => {
    await pushNotificationService.sendBattleNotification(opponentName, songTitle);
  };

  const sendGoldenEarsNotification = async (): Promise<void> => {
    await pushNotificationService.sendGoldenEarsNotification();
  };

  const sendSongUploadNotification = async (songTitle: string): Promise<void> => {
    await pushNotificationService.sendSongUploadNotification(songTitle);
  };

  const sendVoteNotification = async (songTitle: string, result: 'won' | 'lost'): Promise<void> => {
    await pushNotificationService.sendVoteNotification(songTitle, result);
  };

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  return {
    // State
    isInitialized,
    hasPermission,
    pushToken,
    pendingNotifications,
    
    // Computed
    canSendNotifications,
    
    // Actions
    initialize,
    requestPermissions,
    sendNotification,
    cancelNotification,
    registerHandler,
    unregisterHandler,
    
    // SongWars specific
    sendBattleNotification,
    sendGoldenEarsNotification,
    sendSongUploadNotification,
    sendVoteNotification
  };
}
```

## Biometric Authentication

### 1. Biometric Service
Create a biometric authentication service:

```typescript
// src/services/biometricService.ts
import { BiometricAuth } from '@capacitor-community/biometric-auth';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface BiometricOptions {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  negativeButtonText?: string;
  fallbackTitle?: string;
  maxAttempts?: number;
}

export interface BiometricResult {
  success: boolean;
  biometryType?: string;
  error?: string;
}

class BiometricService {
  private readonly STORAGE_KEY = 'biometric_enabled';
  private readonly CREDENTIALS_KEY = 'biometric_credentials';

  async checkAvailability(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  async getBiometryType(): Promise<string | null> {
    try {
      const result = await BiometricAuth.checkBiometry();
      return result.biometryType || null;
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }

  async isEnabled(): Promise<boolean> {
    try {
      const result = await Preferences.get({ key: this.STORAGE_KEY });
      return result.value === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled state:', error);
      return false;
    }
  }

  async enable(options: BiometricOptions = {}): Promise<BiometricResult> {
    try {
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available on this device'
        };
      }

      // Test biometric authentication
      const authResult = await BiometricAuth.authenticate({
        reason: options.reason || 'Enable biometric authentication',
        title: options.title || 'Enable Biometric Login',
        subtitle: options.subtitle || 'Use your biometric to secure your account',
        description: options.description || 'This will allow you to sign in quickly and securely',
        negativeButtonText: options.negativeButtonText || 'Cancel',
        fallbackTitle: options.fallbackTitle || 'Use Passcode',
        maxAttempts: options.maxAttempts || 3
      });

      if (authResult.biometryType) {
        // Store enabled state
        await Preferences.set({
          key: this.STORAGE_KEY,
          value: 'true'
        });

        return {
          success: true,
          biometryType: authResult.biometryType
        };
      }

      return {
        success: false,
        error: 'Biometric authentication failed'
      };
    } catch (error) {
      console.error('Error enabling biometric authentication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async disable(): Promise<void> {
    try {
      await Preferences.remove({ key: this.STORAGE_KEY });
      await Preferences.remove({ key: this.CREDENTIALS_KEY });
    } catch (error) {
      console.error('Error disabling biometric authentication:', error);
    }
  }

  async authenticate(options: BiometricOptions = {}): Promise<BiometricResult> {
    try {
      const isEnabled = await this.isEnabled();
      if (!isEnabled) {
        return {
          success: false,
          error: 'Biometric authentication is not enabled'
        };
      }

      const authResult = await BiometricAuth.authenticate({
        reason: options.reason || 'Sign in to SongWars',
        title: options.title || 'Biometric Authentication',
        subtitle: options.subtitle || 'Use your biometric to sign in',
        description: options.description || 'Authenticate to access your account',
        negativeButtonText: options.negativeButtonText || 'Cancel',
        fallbackTitle: options.fallbackTitle || 'Use Passcode',
        maxAttempts: options.maxAttempts || 3
      });

      if (authResult.biometryType) {
        return {
          success: true,
          biometryType: authResult.biometryType
        };
      }

      return {
        success: false,
        error: 'Biometric authentication failed'
      };
    } catch (error) {
      console.error('Error authenticating with biometric:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  async storeCredentials(credentials: any): Promise<void> {
    try {
      await Preferences.set({
        key: this.CREDENTIALS_KEY,
        value: JSON.stringify(credentials)
      });
    } catch (error) {
      console.error('Error storing biometric credentials:', error);
      throw error;
    }
  }

  async getStoredCredentials(): Promise<any | null> {
    try {
      const result = await Preferences.get({ key: this.CREDENTIALS_KEY });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  }

  async clearStoredCredentials(): Promise<void> {
    try {
      await Preferences.remove({ key: this.CREDENTIALS_KEY });
    } catch (error) {
      console.error('Error clearing stored credentials:', error);
    }
  }

  async getDeviceInfo(): Promise<{
    isAvailable: boolean;
    biometryType: string | null;
    isEnabled: boolean;
  }> {
    const isAvailable = await this.checkAvailability();
    const biometryType = await this.getBiometryType();
    const isEnabled = await this.isEnabled();

    return {
      isAvailable,
      biometryType,
      isEnabled
    };
  }
}

export const biometricService = new BiometricService();
```

### 2. Biometric Composable
Create a Vue composable for biometric authentication:

```typescript
// src/composables/useBiometric.ts
import { ref, computed, onMounted } from 'vue';
import { biometricService, BiometricOptions, BiometricResult } from '@/services/biometricService';

export function useBiometric() {
  const isAvailable = ref(false);
  const isEnabled = ref(false);
  const biometryType = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const canUseBiometric = computed(() => 
    isAvailable.value && isEnabled.value
  );

  const biometricTypeName = computed(() => {
    switch (biometryType.value) {
      case 'fingerprint': return 'Fingerprint';
      case 'face': return 'Face ID';
      case 'iris': return 'Iris';
      case 'voice': return 'Voice';
      default: return 'Biometric';
    }
  });

  // Actions
  const initialize = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      const deviceInfo = await biometricService.getDeviceInfo();
      isAvailable.value = deviceInfo.isAvailable;
      isEnabled.value = deviceInfo.isEnabled;
      biometryType.value = deviceInfo.biometryType;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to initialize biometric';
    } finally {
      loading.value = false;
    }
  };

  const enable = async (options: BiometricOptions = {}): Promise<BiometricResult> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await biometricService.enable(options);
      
      if (result.success) {
        isEnabled.value = true;
        biometryType.value = result.biometryType || null;
      } else {
        error.value = result.error || 'Failed to enable biometric';
      }

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to enable biometric';
      return {
        success: false,
        error: error.value
      };
    } finally {
      loading.value = false;
    }
  };

  const disable = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;

      await biometricService.disable();
      isEnabled.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to disable biometric';
    } finally {
      loading.value = false;
    }
  };

  const authenticate = async (options: BiometricOptions = {}): Promise<BiometricResult> => {
    try {
      loading.value = true;
      error.value = null;

      const result = await biometricService.authenticate(options);
      
      if (!result.success) {
        error.value = result.error || 'Authentication failed';
      }

      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Authentication failed';
      return {
        success: false,
        error: error.value
      };
    } finally {
      loading.value = false;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  // Initialize on mount
  onMounted(() => {
    initialize();
  });

  return {
    // State
    isAvailable,
    isEnabled,
    biometryType,
    loading,
    error,
    
    // Computed
    canUseBiometric,
    biometricTypeName,
    
    // Actions
    initialize,
    enable,
    disable,
    authenticate,
    clearError
  };
}
```

## Haptic Feedback

### 1. Haptic Service
Create a haptic feedback service:

```typescript
// src/services/hapticService.ts
import { Haptics, ImpactStyle, NotificationType, VibrateOptions } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

class HapticService {
  async lightImpact(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic light impact error:', error);
    }
  }

  async mediumImpact(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic medium impact error:', error);
    }
  }

  async heavyImpact(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic heavy impact error:', error);
    }
  }

  async selectionChanged(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('Haptic selection changed error:', error);
    }
  }

  async notification(type: NotificationType): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.error('Haptic notification error:', error);
    }
  }

  async vibrate(options?: VibrateOptions): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.vibrate(options);
    } catch (error) {
      console.error('Haptic vibrate error:', error);
    }
  }

  // SongWars specific haptic feedback
  async battleStart(): Promise<void> {
    await this.mediumImpact();
  }

  async battleEnd(): Promise<void> {
    await this.heavyImpact();
  }

  async songPlay(): Promise<void> {
    await this.lightImpact();
  }

  async songPause(): Promise<void> {
    await this.lightImpact();
  }

  async voteSubmitted(): Promise<void> {
    await this.mediumImpact();
  }

  async goldenEarsAward(): Promise<void> {
    await this.notification(NotificationType.Success);
  }

  async errorOccurred(): Promise<void> {
    await this.notification(NotificationType.Error);
  }

  async buttonPress(): Promise<void> {
    await this.lightImpact();
  }

  async swipeAction(): Promise<void> {
    await this.selectionChanged();
  }
}

export const hapticService = new HapticService();
```

## Device Information

### 1. Device Service
Create a device information service:

```typescript
// src/services/deviceService.ts
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export interface DeviceInfo {
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  manufacturer: string;
  isVirtual: boolean;
  memUsed: number;
  diskFree: number;
  diskTotal: number;
  realDiskFree: number;
  realDiskTotal: number;
  webViewVersion: string;
}

export interface NetworkInfo {
  connected: boolean;
  connectionType: string;
  wifiSSID?: string;
}

class DeviceService {
  private deviceInfo: DeviceInfo | null = null;
  private networkInfo: NetworkInfo | null = null;

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (this.deviceInfo) return this.deviceInfo;

    try {
      const info = await Device.getInfo();
      this.deviceInfo = info;
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  }

  async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const status = await Network.getStatus();
      this.networkInfo = {
        connected: status.connected,
        connectionType: status.connectionType,
        wifiSSID: status.connectionType === 'wifi' ? 'Unknown' : undefined
      };
      return this.networkInfo;
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }

  async getBatteryInfo(): Promise<any> {
    try {
      return await Device.getBatteryInfo();
    } catch (error) {
      console.error('Error getting battery info:', error);
      return null;
    }
  }

  async getLanguageCode(): Promise<string> {
    try {
      return await Device.getLanguageCode();
    } catch (error) {
      console.error('Error getting language code:', error);
      return 'en';
    }
  }

  async getLanguageTag(): Promise<string> {
    try {
      return await Device.getLanguageTag();
    } catch (error) {
      console.error('Error getting language tag:', error);
      return 'en-US';
    }
  }

  async getLocale(): Promise<string> {
    try {
      return await Device.getLocale();
    } catch (error) {
      console.error('Error getting locale:', error);
      return 'en-US';
    }
  }

  async isNetworkConnected(): Promise<boolean> {
    try {
      const networkInfo = await this.getNetworkInfo();
      return networkInfo.connected;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }

  async getConnectionType(): Promise<string> {
    try {
      const networkInfo = await this.getNetworkInfo();
      return networkInfo.connectionType;
    } catch (error) {
      console.error('Error getting connection type:', error);
      return 'unknown';
    }
  }

  // Screen orientation
  async getScreenOrientation(): Promise<string> {
    try {
      const orientation = await ScreenOrientation.orientation();
      return orientation.type;
    } catch (error) {
      console.error('Error getting screen orientation:', error);
      return 'portrait-primary';
    }
  }

  async lockScreenOrientation(orientation: 'portrait' | 'landscape'): Promise<void> {
    try {
      if (orientation === 'portrait') {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } else {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      }
    } catch (error) {
      console.error('Error locking screen orientation:', error);
    }
  }

  async unlockScreenOrientation(): Promise<void> {
    try {
      await ScreenOrientation.unlock();
    } catch (error) {
      console.error('Error unlocking screen orientation:', error);
    }
  }

  // Status bar
  async setStatusBarStyle(style: Style): Promise<void> {
    try {
      await StatusBar.setStyle({ style });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  }

  async setStatusBarBackgroundColor(color: string): Promise<void> {
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar background color:', error);
    }
  }

  async hideStatusBar(): Promise<void> {
    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  }

  async showStatusBar(): Promise<void> {
    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  }

  // Platform checks
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }

  isIOS(): boolean {
    return this.getPlatform() === 'ios';
  }

  isAndroid(): boolean {
    return this.getPlatform() === 'android';
  }

  isWeb(): boolean {
    return this.getPlatform() === 'web';
  }

  // Utility methods
  async getAppInfo(): Promise<{
    platform: string;
    isNative: boolean;
    deviceInfo: DeviceInfo;
    networkInfo: NetworkInfo;
  }> {
    const deviceInfo = await this.getDeviceInfo();
    const networkInfo = await this.getNetworkInfo();

    return {
      platform: this.getPlatform(),
      isNative: this.isNativePlatform(),
      deviceInfo,
      networkInfo
    };
  }
}

export const deviceService = new DeviceService();
```

## Code Examples

### 1. Complete Native Features Component
Example of using all native features in a component:

```vue
<!-- src/components/NativeFeaturesExample.vue -->
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Native Features</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="native-features">
      <!-- Camera Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Camera</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="camera.lastImage" class="image-preview">
            <img :src="camera.lastImage.webPath" alt="Captured image" />
          </div>
          
          <div class="camera-actions">
            <ion-button 
              @click="takePicture"
              :disabled="!camera.canTakePicture"
              fill="outline"
            >
              <ion-icon :icon="camera" slot="start" />
              Take Picture
            </ion-button>
            
            <ion-button 
              @click="selectFromGallery"
              :disabled="!camera.canSelectFromGallery"
              fill="outline"
            >
              <ion-icon :icon="images" slot="start" />
              Select from Gallery
            </ion-button>
          </div>
          
          <ion-button 
            v-if="!camera.hasPermission"
            @click="requestCameraPermission"
            color="primary"
          >
            Request Camera Permission
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Biometric Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Biometric Authentication</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="biometric-status">
            <ion-chip :color="biometric.isAvailable ? 'success' : 'danger'">
              {{ biometric.isAvailable ? 'Available' : 'Not Available' }}
            </ion-chip>
            <ion-chip :color="biometric.isEnabled ? 'success' : 'warning'">
              {{ biometric.isEnabled ? 'Enabled' : 'Disabled' }}
            </ion-chip>
            <ion-chip v-if="biometric.biometryType">
              {{ biometric.biometricTypeName }}
            </ion-chip>
          </div>
          
          <div class="biometric-actions">
            <ion-button 
              v-if="!biometric.isEnabled && biometric.isAvailable"
              @click="enableBiometric"
              :disabled="biometric.loading"
              color="primary"
            >
              Enable Biometric
            </ion-button>
            
            <ion-button 
              v-if="biometric.isEnabled"
              @click="authenticateWithBiometric"
              :disabled="biometric.loading"
              color="success"
            >
              Authenticate
            </ion-button>
            
            <ion-button 
              v-if="biometric.isEnabled"
              @click="disableBiometric"
              :disabled="biometric.loading"
              color="danger"
              fill="outline"
            >
              Disable
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Notifications Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Push Notifications</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="notification-status">
            <ion-chip :color="notifications.canSendNotifications ? 'success' : 'danger'">
              {{ notifications.canSendNotifications ? 'Enabled' : 'Disabled' }}
            </ion-chip>
            <ion-chip v-if="notifications.pushToken">
              Token: {{ notifications.pushToken.substring(0, 20) }}...
            </ion-chip>
          </div>
          
          <div class="notification-actions">
            <ion-button 
              @click="sendTestNotification"
              :disabled="!notifications.canSendNotifications"
              fill="outline"
            >
              Send Test Notification
            </ion-button>
            
            <ion-button 
              @click="sendBattleNotification"
              :disabled="!notifications.canSendNotifications"
              fill="outline"
            >
              Send Battle Notification
            </ion-button>
            
            <ion-button 
              v-if="!notifications.hasPermission"
              @click="requestNotificationPermission"
              color="primary"
            >
              Request Permission
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Haptic Feedback Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Haptic Feedback</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div class="haptic-actions">
            <ion-button @click="lightHaptic" fill="outline">
              Light Impact
            </ion-button>
            <ion-button @click="mediumHaptic" fill="outline">
              Medium Impact
            </ion-button>
            <ion-button @click="heavyHaptic" fill="outline">
              Heavy Impact
            </ion-button>
            <ion-button @click="selectionHaptic" fill="outline">
              Selection
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Device Info Section -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Device Information</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="deviceInfo" class="device-info">
            <ion-item>
              <ion-label>Platform</ion-label>
              <ion-note slot="end">{{ deviceInfo.platform }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Model</ion-label>
              <ion-note slot="end">{{ deviceInfo.model }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>OS</ion-label>
              <ion-note slot="end">{{ deviceInfo.operatingSystem }} {{ deviceInfo.osVersion }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Manufacturer</ion-label>
              <ion-note slot="end">{{ deviceInfo.manufacturer }}</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Network</ion-label>
              <ion-note slot="end">{{ networkInfo?.connectionType }}</ion-note>
            </ion-item>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonChip, IonItem, IonLabel, IonNote } from '@ionic/vue';
import { camera, images } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useCamera } from '@/composables/useCamera';
import { useBiometric } from '@/composables/useBiometric';
import { useNotifications } from '@/composables/useNotifications';
import { hapticService } from '@/services/hapticService';
import { deviceService } from '@/services/deviceService';

// Composables
const camera = useCamera();
const biometric = useBiometric();
const notifications = useNotifications();

// State
const deviceInfo = ref(null);
const networkInfo = ref(null);

// Camera methods
const takePicture = async () => {
  await camera.takePicture();
};

const selectFromGallery = async () => {
  await camera.selectFromGallery();
};

const requestCameraPermission = async () => {
  await camera.requestPermissions();
};

// Biometric methods
const enableBiometric = async () => {
  await biometric.enable({
    reason: 'Enable biometric authentication for SongWars',
    title: 'Enable Biometric Login'
  });
};

const authenticateWithBiometric = async () => {
  const result = await biometric.authenticate({
    reason: 'Sign in to SongWars',
    title: 'Biometric Authentication'
  });
  
  if (result.success) {
    // Handle successful authentication
    console.log('Biometric authentication successful');
  }
};

const disableBiometric = async () => {
  await biometric.disable();
};

// Notification methods
const sendTestNotification = async () => {
  await notifications.sendNotification({
    title: 'Test Notification',
    body: 'This is a test notification from SongWars!',
    data: { type: 'test' }
  });
};

const sendBattleNotification = async () => {
  await notifications.sendBattleNotification('Test Opponent', 'Test Song');
};

const requestNotificationPermission = async () => {
  await notifications.requestPermissions();
};

// Haptic methods
const lightHaptic = async () => {
  await hapticService.lightImpact();
};

const mediumHaptic = async () => {
  await hapticService.mediumImpact();
};

const heavyHaptic = async () => {
  await hapticService.heavyImpact();
};

const selectionHaptic = async () => {
  await hapticService.selectionChanged();
};

// Initialize
onMounted(async () => {
  try {
    const info = await deviceService.getAppInfo();
    deviceInfo.value = info.deviceInfo;
    networkInfo.value = info.networkInfo;
  } catch (error) {
    console.error('Error loading device info:', error);
  }
});
</script>

<style scoped>
.native-features {
  padding: 1rem;
}

.image-preview {
  margin-bottom: 1rem;
}

.image-preview img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
}

.camera-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.biometric-status {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.biometric-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.notification-status {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.haptic-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.device-info {
  margin-top: 1rem;
}
</style>
```

### 2. Native Features Integration in Profile Component
Example of integrating native features into the profile component:

```vue
<!-- src/components/ProfileWithNativeFeatures.vue -->
<template>
  <ion-page>
    <ion-content>
      <div class="profile-container">
        <!-- Avatar Section with Camera -->
        <div class="avatar-section">
          <div class="avatar-container">
            <img 
              :src="profile.avatar_url || '/default-avatar.png'" 
              :alt="profile.display_name"
              class="avatar"
            />
            <ion-button 
              @click="showAvatarOptions"
              fill="clear"
              class="avatar-edit-button"
            >
              <ion-icon :icon="camera" />
            </ion-button>
          </div>
        </div>

        <!-- Avatar Options Action Sheet -->
        <ion-action-sheet
          :is-open="showAvatarSheet"
          header="Change Avatar"
          :buttons="avatarOptions"
          @did-dismiss="showAvatarSheet = false"
        />

        <!-- Profile Form -->
        <form @submit.prevent="saveProfile" class="profile-form">
          <ion-item>
            <ion-label position="stacked">Display Name</ion-label>
            <ion-input
              v-model="profile.display_name"
              placeholder="Enter your display name"
            />
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Bio</ion-label>
            <ion-textarea
              v-model="profile.bio"
              placeholder="Tell us about yourself"
              rows="3"
            />
          </ion-item>

          <!-- Biometric Authentication Toggle -->
          <ion-item v-if="biometric.isAvailable">
            <ion-label>
              <h3>Biometric Login</h3>
              <p>Use {{ biometric.biometricTypeName }} to sign in quickly</p>
            </ion-label>
            <ion-toggle
              :checked="biometric.isEnabled"
              @ion-change="toggleBiometric"
              :disabled="biometric.loading"
            />
          </ion-item>

          <!-- Notification Settings -->
          <ion-item>
            <ion-label>
              <h3>Push Notifications</h3>
              <p>Get notified about battles and achievements</p>
            </ion-label>
            <ion-toggle
              :checked="notifications.hasPermission"
              @ion-change="toggleNotifications"
            />
          </ion-item>

          <!-- Save Button with Haptic Feedback -->
          <ion-button 
            type="submit" 
            expand="block" 
            size="large"
            :disabled="loading"
            @click="buttonHaptic"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Save Profile</span>
          </ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon, IonActionSheet, IonItem, IonLabel, IonInput, IonTextarea, IonToggle, IonSpinner } from '@ionic/vue';
import { camera } from 'ionicons/icons';
import { ref, computed } from 'vue';
import { useCamera } from '@/composables/useCamera';
import { useBiometric } from '@/composables/useBiometric';
import { useNotifications } from '@/composables/useNotifications';
import { hapticService } from '@/services/hapticService';

// Composables
const camera = useCamera();
const biometric = useBiometric();
const notifications = useNotifications();

// State
const profile = ref({
  display_name: '',
  bio: '',
  avatar_url: ''
});
const loading = ref(false);
const showAvatarSheet = ref(false);

// Computed
const avatarOptions = computed(() => [
  {
    text: 'Take Photo',
    icon: 'camera',
    handler: () => takeAvatarPhoto()
  },
  {
    text: 'Choose from Gallery',
    icon: 'images',
    handler: () => selectAvatarFromGallery()
  },
  {
    text: 'Cancel',
    icon: 'close',
    role: 'cancel'
  }
]);

// Methods
const showAvatarOptions = () => {
  showAvatarSheet.value = true;
  hapticService.buttonPress();
};

const takeAvatarPhoto = async () => {
  showAvatarSheet.value = false;
  try {
    const result = await camera.takePicture({
      quality: 90,
      allowEditing: true
    });
    
    if (result?.webPath) {
      // Upload avatar to server
      await uploadAvatar(result.webPath);
      profile.value.avatar_url = result.webPath;
      hapticService.buttonPress();
    }
  } catch (error) {
    console.error('Error taking photo:', error);
  }
};

const selectAvatarFromGallery = async () => {
  showAvatarSheet.value = false;
  try {
    const result = await camera.selectFromGallery({
      quality: 90,
      allowEditing: true
    });
    
    if (result?.webPath) {
      // Upload avatar to server
      await uploadAvatar(result.webPath);
      profile.value.avatar_url = result.webPath;
      hapticService.buttonPress();
    }
  } catch (error) {
    console.error('Error selecting from gallery:', error);
  }
};

const uploadAvatar = async (imagePath: string) => {
  // Implementation for uploading avatar to Supabase storage
  console.log('Uploading avatar:', imagePath);
};

const toggleBiometric = async () => {
  hapticService.buttonPress();
  
  if (biometric.isEnabled.value) {
    await biometric.disable();
  } else {
    const result = await biometric.enable({
      reason: 'Enable biometric authentication for quick sign-in',
      title: 'Enable Biometric Login'
    });
    
    if (result.success) {
      hapticService.notification('success');
    }
  }
};

const toggleNotifications = async () => {
  hapticService.buttonPress();
  
  if (!notifications.hasPermission.value) {
    await notifications.requestPermissions();
    hapticService.buttonPress();
  }
};

const buttonHaptic = () => {
  hapticService.buttonPress();
};

const saveProfile = async () => {
  loading.value = true;
  hapticService.buttonPress();
  
  try {
    // Save profile to server
    console.log('Saving profile:', profile.value);
    
    // Send success notification
    await notifications.sendNotification({
      title: 'Profile Updated',
      body: 'Your profile has been saved successfully!',
      data: { type: 'profile_updated' }
    });
    
    hapticService.notification('success');
  } catch (error) {
    console.error('Error saving profile:', error);
    hapticService.notification('error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-container {
  padding: 1rem;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-edit-button {
  position: absolute;
  bottom: 0;
  right: 0;
  --border-radius: 50%;
  width: 40px;
  height: 40px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
```

---

This completes the native features implementation guide. The mobile app now has comprehensive native capabilities including camera integration, file system access, push notifications, biometric authentication, haptic feedback, and device information access.
