import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // State
  const theme = ref<ThemeMode>('system')
  const systemTheme = ref<'light' | 'dark'>('light')
  const isInitialized = ref(false)

  // Getters
  const currentTheme = computed(() => {
    if (theme.value === 'system') {
      return systemTheme.value
    }
    return theme.value
  })

  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')

  // Actions
  const initializeTheme = async () => {
    try {
      // Get stored theme preference
      const { value: storedTheme } = await Preferences.get({ key: 'theme' })
      
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        theme.value = storedTheme as ThemeMode
      }

      // Listen for system theme changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
        
        mediaQuery.addEventListener('change', (e) => {
          systemTheme.value = e.matches ? 'dark' : 'light'
          applyTheme()
        })
      }

      // Apply initial theme
      await applyTheme()
      isInitialized.value = true
    } catch (error) {
      console.error('Error initializing theme:', error)
      // Fallback to light theme
      theme.value = 'light'
      await applyTheme()
      isInitialized.value = true
    }
  }

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      theme.value = newTheme
      await Preferences.set({ key: 'theme', value: newTheme })
      await applyTheme()
    } catch (error) {
      console.error('Error setting theme:', error)
    }
  }

  const toggleTheme = async () => {
    const newTheme = isDark.value ? 'light' : 'dark'
    await setTheme(newTheme)
  }

  const applyTheme = async () => {
    try {
      const effectiveTheme = currentTheme.value
      
      // Apply theme to document
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }

      // Update Ionic theme (if available)
      const win = window as any
      if (win.Ionic && win.Ionic.config) {
        win.Ionic.config.theme = effectiveTheme
      }

      // Trigger theme change event
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme: effectiveTheme }
      }))
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  }

  const getThemeColor = (colorName: string) => {
    const root = document.documentElement
    return getComputedStyle(root).getPropertyValue(`--${colorName}`).trim()
  }

  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const resetTheme = async () => {
    try {
      await Preferences.remove({ key: 'theme' })
      theme.value = 'system'
      await applyTheme()
    } catch (error) {
      console.error('Error resetting theme:', error)
    }
  }

  const exportThemeSettings = () => {
    return {
      theme: theme.value,
      systemTheme: systemTheme.value,
      currentTheme: currentTheme.value,
      isDark: isDark.value,
      timestamp: new Date().toISOString()
    }
  }

  const importThemeSettings = async (settings: any) => {
    try {
      if (settings.theme && ['light', 'dark', 'system'].includes(settings.theme)) {
        await setTheme(settings.theme)
        return { success: true }
      }
      return { success: false, error: 'Invalid theme setting' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Import failed' }
    }
  }

  // CSS custom properties for dynamic theming
  const updateCSSVariables = (variables: Record<string, string>) => {
    const root = document.documentElement
    
    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value)
    })
  }

  const getCSSVariable = (property: string) => {
    const root = document.documentElement
    return getComputedStyle(root).getPropertyValue(`--${property}`).trim()
  }

  const setAccentColor = (color: string) => {
    updateCSSVariables({
      'accent-color': color,
      'accent-hover': color + 'dd' // Add opacity for hover state
    })
  }

  const setBackgroundColor = (color: string) => {
    updateCSSVariables({
      'bg-primary': color
    })
  }

  const setTextColor = (color: string) => {
    updateCSSVariables({
      'text-primary': color
    })
  }

  return {
    // State
    theme,
    systemTheme,
    isInitialized,
    
    // Getters
    currentTheme,
    isDark,
    isLight,
    
    // Actions
    initializeTheme,
    setTheme,
    toggleTheme,
    applyTheme,
    getThemeColor,
    getSystemTheme,
    resetTheme,
    exportThemeSettings,
    importThemeSettings,
    updateCSSVariables,
    getCSSVariable,
    setAccentColor,
    setBackgroundColor,
    setTextColor,
  }
})
