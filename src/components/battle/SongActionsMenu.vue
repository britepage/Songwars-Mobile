<template>
  <div class="inline-flex items-center">
    <ion-button 
      fill="clear" 
      class="p-0 m-0 min-w-0" 
      @click="handleClick" 
      aria-label="More actions"
    >
      <svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </ion-button>

    <ion-popover 
      :is-open="present" 
      :event="event"
      :arrow="false"
      @didDismiss="present = false"
    >
      <div class="bg-white dark:bg-gray-800 text-black dark:text-white border dark:border-gray-700 rounded-md shadow-md min-w-[180px]">
        <button 
          class="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': bothFlagsSet }"
          :disabled="bothFlagsSet"
          @click="emitFlag">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h2v18H3V3zm4 0l14 6-14 6V3z"/>
          </svg>
          Flag
        </button>
      </div>
    </ion-popover>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonPopover } from '@ionic/vue'
import { ref, computed } from 'vue'
import { useFlagStore } from '@/stores/flagStore'

const props = defineProps<{
  songId: string
  title?: string
  artist?: string
}>()

const emit = defineEmits<{
  (e: 'open-flag-modal', payload: { songId: string; title?: string; artist?: string }): void
}>()

const present = ref(false)
const event = ref<Event | undefined>(undefined)
const flagStore = useFlagStore()

const bothFlagsSet = computed(() => {
  if (!props.songId) return false
  return flagStore.hasUserFlagged(props.songId, 'hate_speech') && 
         flagStore.hasUserFlagged(props.songId, 'copyright')
})

const handleClick = (e: Event) => {
  event.value = e
  present.value = true
}

const emitFlag = () => {
  if (bothFlagsSet.value) return
  present.value = false
  emit('open-flag-modal', { songId: props.songId, title: props.title, artist: props.artist })
}
</script>

<style scoped>
.min-w-0 { min-width: 0; }
</style>


