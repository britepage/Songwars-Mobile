import { Haptics, ImpactStyle } from '@capacitor/haptics'

export function useHaptics() {
  const impact = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      const styleMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }
      
      await Haptics.impact({ style: styleMap[style] })
    } catch (error) {
      // Haptics not available on this device
      console.debug('Haptics not available:', error)
    }
  }

  const notification = async (type: 'success' | 'warning' | 'error' = 'success') => {
    try {
      await Haptics.notification({ type: type.toUpperCase() as any })
    } catch (error) {
      console.debug('Haptics not available:', error)
    }
  }

  const vibrate = async (duration: number = 300) => {
    try {
      await Haptics.vibrate({ duration })
    } catch (error) {
      console.debug('Haptics not available:', error)
    }
  }

  const selectionStart = async () => {
    try {
      await Haptics.selectionStart()
    } catch (error) {
      console.debug('Haptics not available:', error)
    }
  }

  const selectionChanged = async () => {
    try {
      await Haptics.selectionChanged()
    } catch (error) {
      console.debug('Haptics not available:', error)
    }
  }

  const selectionEnd = async () => {
    try {
      await Haptics.selectionEnd()
    } catch (error) {
      console.debug('Haptics not available:', error)
    }
  }

  return {
    impact,
    notification,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd
  }
}

