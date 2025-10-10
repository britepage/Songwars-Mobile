<template>
  <div class="golden-ears-badge" :class="{ 'earned': isEarned, 'animated': showAnimation }">
    <div class="badge-container">
      <!-- Ear icon -->
      <ion-icon :icon="ear" class="ear-icon" />
      
      <!-- Golden glow effect -->
      <div class="glow-effect" v-if="isEarned" />
      
      <!-- Achievement text -->
      <div class="achievement-text" v-if="showText">
        <span class="badge-title">Golden Ears</span>
        <span class="badge-subtitle" v-if="accuracy">{{ accuracy }}% accuracy</span>
      </div>
      
      <!-- Floating particles for animation -->
      <div class="particles" v-if="showAnimation">
        <div class="particle" v-for="i in 6" :key="i" :style="getParticleStyle(i)" />
      </div>
    </div>
    
    <!-- Tooltip on hover -->
    <div class="tooltip" v-if="showTooltip && isEarned">
      <p>Golden Ears Award</p>
      <p>Earned for exceptional voting accuracy</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { ear } from 'ionicons/icons'

interface Props {
  isEarned?: boolean
  accuracy?: number
  showText?: boolean
  showAnimation?: boolean
  showTooltip?: boolean
}

withDefaults(defineProps<Props>(), {
  isEarned: false,
  showText: true,
  showAnimation: false,
  showTooltip: true
})

const getParticleStyle = (index: number) => {
  const angle = (index * 60) + (Math.random() * 30 - 15)
  const distance = 30 + (Math.random() * 20)
  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance
  
  return {
    '--particle-x': `${x}px`,
    '--particle-y': `${y}px`,
    '--particle-delay': `${index * 0.1}s`
  }
}
</script>

<style scoped>
.golden-ears-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.badge-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
}

.golden-ears-badge.earned .badge-container {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-color: #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.ear-icon {
  font-size: 2rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.golden-ears-badge.earned .ear-icon {
  color: #000000;
  animation: goldenGlow 2s ease-in-out infinite;
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseGlow 2s ease-in-out infinite;
}

.achievement-text {
  text-align: center;
}

.badge-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.golden-ears-badge.earned .badge-title {
  color: #000000;
}

.badge-subtitle {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.golden-ears-badge.earned .badge-subtitle {
  color: rgba(0, 0, 0, 0.7);
}

.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: particleFloat 2s ease-out forwards;
  animation-delay: var(--particle-delay);
}

.particle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: inherit;
  border-radius: inherit;
  box-shadow: 0 0 10px #ffd700;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;
  min-width: 150px;
  text-align: center;
}

.tooltip p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.tooltip p:last-child {
  margin-bottom: 0;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.golden-ears-badge:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Animations */
@keyframes goldenGlow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes particleFloat {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(
      calc(-50% + var(--particle-x)), 
      calc(-50% + var(--particle-y))
    ) scale(0);
  }
}

.golden-ears-badge.animated .badge-container {
  animation: achievementPop 0.6s ease-out;
}

@keyframes achievementPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .badge-container {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}

[data-theme="dark"] .tooltip {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}
</style>
