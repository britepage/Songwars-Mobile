import { toastController } from '@ionic/vue'

export function useToast() {
  const showToast = async (
    message: string,
    duration: number = 2000,
    position: 'top' | 'bottom' | 'middle' = 'bottom',
    color?: string
  ) => {
    const toast = await toastController.create({
      message,
      duration,
      position,
      color
    })
    
    await toast.present()
    return toast
  }

  const showSuccess = async (message: string, duration: number = 2000) => {
    return showToast(message, duration, 'bottom', 'success')
  }

  const showError = async (message: string, duration: number = 3000) => {
    return showToast(message, duration, 'bottom', 'danger')
  }

  const showWarning = async (message: string, duration: number = 2500) => {
    return showToast(message, duration, 'bottom', 'warning')
  }

  const showInfo = async (message: string, duration: number = 2000) => {
    return showToast(message, duration, 'bottom', 'primary')
  }

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}

