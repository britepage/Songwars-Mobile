import { Device } from '@capacitor/device'
import { ref, onMounted } from 'vue'

export function useDevice() {
  const deviceInfo = ref<any>(null)
  const platform = ref<string>('web')
  const isNative = ref(false)
  const isIOS = ref(false)
  const isAndroid = ref(false)

  const loadDeviceInfo = async () => {
    try {
      const info = await Device.getInfo()
      deviceInfo.value = info
      platform.value = info.platform
      isNative.value = info.platform !== 'web'
      isIOS.value = info.platform === 'ios'
      isAndroid.value = info.platform === 'android'
    } catch (error) {
      console.error('Failed to get device info:', error)
    }
  }

  const getBatteryInfo = async () => {
    try {
      return await Device.getBatteryInfo()
    } catch (error) {
      console.error('Failed to get battery info:', error)
      return null
    }
  }

  const getLanguageCode = async () => {
    try {
      const info = await Device.getLanguageCode()
      return info.value
    } catch (error) {
      console.error('Failed to get language code:', error)
      return 'en'
    }
  }

  onMounted(() => {
    loadDeviceInfo()
  })

  return {
    deviceInfo,
    platform,
    isNative,
    isIOS,
    isAndroid,
    loadDeviceInfo,
    getBatteryInfo,
    getLanguageCode
  }
}

