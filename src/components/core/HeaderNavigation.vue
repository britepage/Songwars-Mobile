<template>
  <header 
    v-if="isAuthenticatedRoute || isUserProfilePage" 
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm bg-white/95 border-b border-gray-200 header-custom"
  >
    <div class="flex items-center justify-between px-4 py-3 safe-area-top">
      <!-- Logo (Left) -->
      <div class="flex items-center">
        <a @click="goToDashboard" class="flex items-center cursor-pointer">
          <img :src="logoUrl" alt="SongWars" class="h-10 w-40" />
        </a>
      </div>
      
      <!-- Right Side Buttons -->
      <div class="flex items-center space-x-2">
        <!-- Theme Toggle Button -->
        <button
          @click="toggleTheme"
          class="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
          :title="isDarkMode ? 'Switch to Light' : 'Switch to Dark'"
          aria-label="Toggle theme"
        >
          <!-- Moon icon (for switching to dark mode) -->
          <svg v-if="!isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
          </svg>
          <!-- Sun icon (for switching to light mode) -->
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
          </svg>
        </button>
        
        <!-- Hamburger Menu Button - Hide on public profile pages -->
        <HamburgerMenu v-if="!isUserProfilePage" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Preferences } from '@capacitor/preferences';
import HamburgerMenu from './HamburgerMenu.vue';
import logoUrl from '/src/assets/images/tapey.svg';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Visibility computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isUserProfilePage = computed(() => route.path.startsWith('/user/'));
const isAuthenticatedRoute = computed(() => route.path.startsWith('/tabs/'));

// Theme state
const isDarkMode = ref(false);

// Navigation
const goToDashboard = () => {
  router.push('/tabs/dashboard');
};

// Theme toggle with Capacitor Storage
const toggleTheme = async () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Temporarily disable transitions
  document.documentElement.classList.add('no-transitions');

  // Update DOM
  document.documentElement.setAttribute('data-theme', newTheme);
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
  document.documentElement.classList.toggle('light', newTheme === 'light');
  isDarkMode.value = newTheme === 'dark';
  
  // Save to Capacitor Storage (instead of localStorage)
  await Preferences.set({ key: 'songwars-theme', value: newTheme });
  await Preferences.set({ key: 'songwars-theme-system', value: 'false' });

  // Re-enable transitions
  setTimeout(() => {
    document.documentElement.classList.remove('no-transitions');
  }, 60);
};

// Initialize theme state from DOM
onMounted(() => {
  if (typeof document !== 'undefined') {
    isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Observe theme changes
    const observer = new MutationObserver(() => {
      isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
    });
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    // Store for cleanup
    onUnmounted(() => {
      observer.disconnect();
    });
  }
});
</script>

<style scoped>
/* Custom header styling */
.header-custom {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Theme-aware styling */
.header-custom {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}

/* Keep white in both themes (matches web app) */
[data-theme="dark"] .header-custom {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}

/* Safe area handling */
.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}
</style>
