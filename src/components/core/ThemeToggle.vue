<template>
  <div class="theme-toggle">
    <ion-button 
      fill="clear" 
      @click="toggleTheme"
      class="theme-button"
      :aria-label="`Switch to ${isDark ? 'light' : 'dark'} theme`"
    >
      <ion-icon 
        :icon="isDark ? sunny : moon" 
        class="theme-icon"
      />
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { moon, sunny } from 'ionicons/icons'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.theme === 'dark')

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-button {
  --color: var(--text-primary);
  --background: transparent;
  --border-radius: 50%;
  width: 44px;
  height: 44px;
  margin: 0;
}

.theme-icon {
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.theme-button:hover .theme-icon {
  transform: scale(1.1);
}

.theme-button:active .theme-icon {
  transform: scale(0.95);
}

/* Smooth transition for theme icon */
.theme-icon {
  animation: themeSwitch 0.3s ease-in-out;
}

@keyframes themeSwitch {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

/* Focus styles for accessibility */
.theme-button:focus {
  --background: rgba(139, 92, 246, 0.1);
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

/* Dark theme specific adjustments */
[data-theme="dark"] .theme-button {
  --color: #ffffff;
}

[data-theme="dark"] .theme-button:hover {
  --background: rgba(255, 255, 255, 0.1);
}
</style>
