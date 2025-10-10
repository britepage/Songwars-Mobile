import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

export interface CameraOptions {
  quality?: number
  allowEditing?: boolean
  source?: CameraSource
  saveToGallery?: boolean
}

export interface CameraResult {
  webPath?: string
  path?: string
  format?: string
  dataUrl?: string
}

class CameraService {
  private readonly defaultOptions: CameraOptions = {
    quality: 90,
    allowEditing: true,
    source: CameraSource.Camera,
    saveToGallery: false
  }

  async takePicture(options: CameraOptions = {}): Promise<CameraResult> {
    try {
      const config = { ...this.defaultOptions, ...options }
      
      const image = await Camera.getPhoto({
        quality: config.quality,
        allowEditing: config.allowEditing,
        resultType: CameraResultType.Uri,
        source: config.source,
        saveToGallery: config.saveToGallery
      })
      
      return {
        webPath: image.webPath,
        path: image.path,
        format: image.format
      }
    } catch (error) {
      console.error('Camera error:', error)
      throw new Error(`Failed to take picture: ${error}`)
    }
  }

  async selectFromGallery(options: CameraOptions = {}): Promise<CameraResult> {
    return this.takePicture({ 
      ...options, 
      source: CameraSource.Photos 
    })
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions()
      return permissions.camera === 'granted' && permissions.photos === 'granted'
    } catch (error) {
      console.error('Error checking camera permissions:', error)
      return false
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await Camera.requestPermissions()
      return permissions.camera === 'granted' && permissions.photos === 'granted'
    } catch (error) {
      console.error('Error requesting camera permissions:', error)
      return false
    }
  }

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform()
  }
}

export const cameraService = new CameraService()

