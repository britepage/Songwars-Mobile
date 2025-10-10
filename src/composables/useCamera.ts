import { ref } from 'vue'
import { cameraService, CameraOptions, CameraResult } from '@/services/camera.service'
import { useToast } from './useToast'

export function useCamera() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastPhoto = ref<CameraResult | null>(null)
  
  const toast = useToast()

  const takePicture = async (options: CameraOptions = {}): Promise<CameraResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      // Check and request permissions
      const hasPermissions = await cameraService.checkPermissions()
      if (!hasPermissions) {
        const granted = await cameraService.requestPermissions()
        if (!granted) {
          throw new Error('Camera permissions denied')
        }
      }

      const result = await cameraService.takePicture(options)
      lastPhoto.value = result
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to take picture'
      await toast.showError(error.value)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const selectFromGallery = async (options: CameraOptions = {}): Promise<CameraResult | null> => {
    try {
      isLoading.value = true
      error.value = null

      const hasPermissions = await cameraService.checkPermissions()
      if (!hasPermissions) {
        const granted = await cameraService.requestPermissions()
        if (!granted) {
          throw new Error('Gallery access denied')
        }
      }

      const result = await cameraService.selectFromGallery(options)
      lastPhoto.value = result
      
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to select from gallery'
      await toast.showError(error.value)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const showPhotoOptions = async (): Promise<CameraResult | null> => {
    // This would typically show an action sheet
    // For now, default to gallery
    return selectFromGallery()
  }

  return {
    isLoading,
    error,
    lastPhoto,
    takePicture,
    selectFromGallery,
    showPhotoOptions
  }
}

