<template>
  <div class="tape-player">
    <!-- Cassette tape background -->
    <div class="tape-container" :class="{ 'playing': isPlaying }">
      <div class="tape-background">
        <!-- Placeholder for tape image -->
        <div class="tape-placeholder"></div>
      </div>
      
      <!-- Left gear -->
      <div 
        class="left-gear gear-placeholder"
        :class="{ 'spinning': isPlaying }"
      />
      
      <!-- Right gear -->
      <div 
        class="right-gear gear-placeholder"
        :class="{ 'spinning': isPlaying }"
      />
    </div>
    
    <!-- Play/Pause button -->
    <ion-button 
      :fill="isPlaying ? 'solid' : 'outline'"
      @click="togglePlay"
      class="play-button"
    >
      <ion-icon :icon="isPlaying ? pause : play" slot="icon-only" />
    </ion-button>
    
    <!-- Song info -->
    <div class="song-info" v-if="song">
      <h3 class="song-title">{{ song.title }}</h3>
      <p class="song-artist">{{ song.artist }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { play, pause } from 'ionicons/icons'

interface Song {
  id: string
  title: string
  artist: string
  url?: string | null
  genre?: string | null
}

interface Props {
  song?: Song | null
  isPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false
})

const emit = defineEmits<{
  play: [song: Song]
}>()

const togglePlay = () => {
  if (props.song) {
    emit('play', props.song)
  }
}
</script>

<style scoped>
/* Cassette tape container from COMPLETE_STYLE_GUIDE.md */
.tape-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tape-container {
  position: relative;
  width: 200px;
  height: 120px;
}

.tape-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tape-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  border: 2px solid var(--border-color);
}

.gear-placeholder {
  width: 28px;
  height: 28px;
  background: radial-gradient(circle, #ffd200 0%, #e0b900 100%);
  border-radius: 50%;
  border: 2px solid #000;
}

/* Gear positioning (exact from TapePlayer.vue) */
.left-gear {
  position: absolute;
  left: 21.4%;
  top: 40.5%;
  width: 28px;
  height: 28px;
}

.right-gear {
  position: absolute;
  left: 65.0%;
  top: 40.5%;
  width: 28px;
  height: 28px;
}

/* Gear rotation animation */
@keyframes spin-gear {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.left-gear.spinning,
.right-gear.spinning {
  animation: spin-gear 2s linear infinite;
}

.play-button {
  margin-top: 1rem;
  --color: #ffd200;
  --border-color: #ffd200;
  --background: transparent;
}

.play-button[fill="solid"] {
  --background: #ffd200;
  --color: #000000;
}

.song-info {
  text-align: center;
  margin-top: 1rem;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.song-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}
</style>
