<template>
  <v-overlay
    :model-value="show"
    persistent
    class="excel-loading-overlay d-flex align-center justify-center"
    style="z-index: 9999;"
    content-class="d-flex align-center justify-center w-100 h-100"
  >
    <div class="loading-container">
      <!-- Baklava Layers Animation -->
      <div class="baklava-layers">
        <div v-for="n in 5" :key="n" class="layer" :class="`layer-${n}`"></div>
      </div>

      <!-- Main Loading Content -->
      <div class="loading-content">
        <!-- Excel Icon Animation -->
        <div class="excel-icon-container">
          <v-icon 
            size="60" 
            color="primary" 
            class="excel-icon"
          >
            mdi-file-excel
          </v-icon>
          <div class="upload-arrows">
            <v-icon 
              v-for="n in 3" 
              :key="n"
              size="20" 
              color="success" 
              class="arrow"
              :class="`arrow-${n}`"
            >
              mdi-arrow-up
            </v-icon>
          </div>
        </div>

        <!-- Progress Circle -->
        <div class="progress-container">
          <v-progress-circular
            :model-value="progress"
            size="120"
            width="6"
            color="primary"
            class="main-progress"
          >
            <div class="progress-content">
              <div class="progress-text">{{ Math.round(progress) }}%</div>
              <div class="progress-subtitle">{{ currentStage }}</div>
            </div>
          </v-progress-circular>
        </div>

        <!-- Loading Text -->
        <div class="loading-text">
          <h2 class="main-title">{{ title }}</h2>
          <p class="subtitle">{{ subtitle }}</p>
        </div>

        <!-- Animation Dots -->
        <div class="loading-dots">
          <div v-for="n in 3" :key="n" class="dot" :class="`dot-${n}`"></div>
        </div>

        <!-- Stats Display -->
        <div v-if="stats" class="stats-container">
          <div class="stat-item">
            <v-icon color="success" size="20">mdi-check-circle</v-icon>
            <span>{{ stats.success || 0 }} Başarılı</span>
          </div>
          <div class="stat-item">
            <v-icon color="warning" size="20">mdi-alert-circle</v-icon>
            <span>{{ stats.skipped || 0 }} Atlandı</span>
          </div>
          <div class="stat-item">
            <v-icon color="error" size="20">mdi-close-circle</v-icon>
            <span>{{ stats.errors || 0 }} Hata</span>
          </div>
        </div>
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Excel Yükleniyor'
  },
  subtitle: {
    type: String,
    default: 'Lütfen bekleyiniz, veriler işleniyor...'
  },
  stats: {
    type: Object,
    default: null
  }
})

const progress = ref(0)
const currentStage = ref('Başlatılıyor')

const stages = [
  'Dosya okunuyor',
  'Veriler ayrıştırılıyor',
  'Doğrulama yapılıyor',
  'Veritabanı güncelleniyor',
  'Tamamlanıyor'
]

// Progress simulation
let progressInterval = null
let stageInterval = null

const startProgress = () => {
  progress.value = 0
  currentStage.value = stages[0]
  
  // Progress animation
  progressInterval = setInterval(() => {
    if (progress.value < 95) {
      progress.value += Math.random() * 15 + 5
    }
  }, 400)
  
  // Stage updates
  let stageIndex = 0
  stageInterval = setInterval(() => {
    stageIndex = (stageIndex + 1) % stages.length
    currentStage.value = stages[stageIndex]
  }, 800)
}

const completeProgress = () => {
  progress.value = 100
  currentStage.value = 'Tamamlandı'
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (stageInterval) {
    clearInterval(stageInterval)
    stageInterval = null
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    startProgress()
  } else {
    completeProgress()
  }
})

onMounted(() => {
  if (props.show) {
    startProgress()
  }
})
</script>

<style scoped>
.excel-loading-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* Baklava Layers Background Animation */
.baklava-layers {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0.1;
}

.layer {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 2px solid #D4A574;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 2s ease-in-out infinite;
}

.layer-1 { animation-delay: 0s; }
.layer-2 { animation-delay: 0.2s; width: 240px; height: 240px; }
.layer-3 { animation-delay: 0.4s; width: 180px; height: 180px; }
.layer-4 { animation-delay: 0.6s; width: 120px; height: 120px; }
.layer-5 { animation-delay: 0.8s; width: 60px; height: 60px; }

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
}

/* Main Content */
.loading-content {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(212, 165, 116, 0.2);
  border: 1px solid rgba(212, 165, 116, 0.3);
  min-width: 400px;
}

/* Excel Icon Animation */
.excel-icon-container {
  position: relative;
  margin-bottom: 2rem;
  display: inline-block;
}

.excel-icon {
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.upload-arrows {
  position: absolute;
  top: -10px;
  right: -10px;
}

.arrow {
  position: absolute;
  animation: float-up 1.2s ease-in-out infinite;
}

.arrow-1 { animation-delay: 0s; }
.arrow-2 { animation-delay: 0.3s; left: 10px; }
.arrow-3 { animation-delay: 0.6s; left: 20px; }

@keyframes float-up {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

/* Progress Circle */
.progress-container {
  margin: 2rem 0;
}

.main-progress {
  position: relative;
}

.progress-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-text {
  font-size: 1.8rem;
  font-weight: 700;
  color: #D4A574;
  margin-bottom: 0.25rem;
}

.progress-subtitle {
  font-size: 0.75rem;
  color: #8B4513;
  font-weight: 500;
}

/* Loading Text */
.main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5D4037;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #8D6E63;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

/* Loading Dots */
.loading-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 1.5rem 0;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #D4A574;
  animation: loading-dots 1.4s ease-in-out infinite;
}

.dot-1 { animation-delay: 0s; }
.dot-2 { animation-delay: 0.2s; }
.dot-3 { animation-delay: 0.4s; }

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Stats Display */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(212, 165, 116, 0.3);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #5D4037;
}

/* Responsive */
@media (max-width: 600px) {
  .loading-content {
    min-width: 300px;
    padding: 2rem;
  }
  
  .stats-container {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .main-title {
    font-size: 1.5rem;
  }
}

/* Smooth entrance */
.loading-content {
  animation: fadeInScale 0.4s ease-out;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 