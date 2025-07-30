<template>
  <v-overlay
    :model-value="show"
    persistent
    class="excel-loading-overlay d-flex align-center justify-center"
    style="z-index: 9999;"
    content-class="d-flex align-center justify-center w-100 h-100"
  >
    <div class="loading-container">
      <!-- Main Loading Content -->
      <div class="loading-content">
        <!-- Excel Icon -->
        <div class="excel-icon-container">
          <v-icon 
            size="40" 
            color="primary" 
          >
            mdi-file-excel
          </v-icon>
        </div>

        <!-- Loading Text -->
        <div class="loading-text">
          <h2 class="main-title">{{ title }}</h2>
          <p class="subtitle">Beklerken mini oyun! 🎯</p>
        </div>

        <!-- Memory Game -->
        <div class="memory-game">
          <div class="game-info">
            <div class="score">
              <v-icon size="16" color="amber">mdi-star</v-icon>
              {{ score }}
            </div>
            <div class="moves">
              <v-icon size="16" color="blue">mdi-gesture-tap</v-icon>
              {{ moves }}
            </div>
            <div class="timer">
              <v-icon size="16" color="green">mdi-timer</v-icon>
              {{ formattedTime }}
            </div>
          </div>
          
          <div class="game-board">
            <div
              v-for="(card, index) in cards"
              :key="`card-${index}`"
              class="memory-card"
              :class="{
                'flipped': card.isFlipped || card.isMatched,
                'matched': card.isMatched
              }"
              @click="flipCard(index)"
            >
              <div class="card-inner">
                <div class="card-front">
                  <v-icon size="24" color="white">mdi-help</v-icon>
                </div>
                <div class="card-back" :style="{ background: card.color }">
                  <v-icon :size="24" color="white">{{ card.icon }}</v-icon>
                </div>
              </div>
            </div>
          </div>

          <transition name="fade">
            <div v-if="gameCompleted" class="game-completed">
              <v-icon size="24" color="success">mdi-trophy</v-icon>
              Bravo! {{ moves }} hamlede tamamladın!
            </div>
          </transition>

          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            @click="resetGame"
            class="mt-2"
          >
            <v-icon size="16" start>mdi-refresh</v-icon>
            Yenile
          </v-btn>
        </div>

        <!-- Stats Display -->
        <div v-if="stats" class="stats-container">
          <div class="stat-item">
            <v-icon color="success" size="16">mdi-check</v-icon>
            <span>{{ stats.success || 0 }}</span>
          </div>
          <div class="stat-item">
            <v-icon color="warning" size="16">mdi-skip-next</v-icon>
            <span>{{ stats.skipped || 0 }}</span>
          </div>
          <div class="stat-item">
            <v-icon color="error" size="16">mdi-close</v-icon>
            <span>{{ stats.errors || 0 }}</span>
          </div>
        </div>

        <!-- Loading Progress Bar -->
        <v-progress-linear
          :model-value="uploadProgress"
          color="primary"
          height="3"
          class="mt-3"
          rounded
          striped
        ></v-progress-linear>
      </div>
    </div>
  </v-overlay>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Cariler Yükleniyor'
  },
  subtitle: {
    type: String,
    default: 'Lütfen bekleyiniz...'
  },
  stats: {
    type: Object,
    default: null
  }
})

// Game state
const cards = ref([])
const flippedCards = ref([])
const score = ref(0)
const moves = ref(0)
const gameCompleted = ref(false)
const timer = ref(0)
const timerInterval = ref(null)
const uploadProgress = ref(0)
const isProcessing = ref(false)

// Card designs - Sadece 4 çift (8 kart + 1 boş = 9 kart için)
const cardDesigns = [
  { icon: 'mdi-food', color: '#FF6B6B' },      // Kırmızı
  { icon: 'mdi-bee', color: '#4ECDC4' },       // Turkuaz
  { icon: 'mdi-tree', color: '#45B7D1' },      // Mavi
  { icon: 'mdi-water', color: '#96CEB4' }      // Yeşil
]

// Formatted time
const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Initialize game
const initGame = () => {
  // 3x3 için 4 çift + 1 joker kart
  const gameCards = []
  
  // 4 çift kart ekle
  for (let i = 0; i < 4; i++) {
    const design = cardDesigns[i]
    gameCards.push({
      id: i,
      icon: design.icon,
      color: design.color,
      isFlipped: false,
      isMatched: false
    })
    gameCards.push({
      id: i,
      icon: design.icon,
      color: design.color,
      isFlipped: false,
      isMatched: false
    })
  }
  
  // 1 joker kart ekle (eşi olmayan)
  gameCards.push({
    id: 999,
    icon: 'mdi-star',
    color: '#FFD93D',
    isFlipped: false,
    isMatched: false,
    isJoker: true
  })
  
  // Kartları karıştır
  for (let i = gameCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]]
  }
  
  cards.value = gameCards
}

// Reset game
const resetGame = () => {
  score.value = 0
  moves.value = 0
  gameCompleted.value = false
  timer.value = 0
  flippedCards.value = []
  isProcessing.value = false
  initGame()
}

// Flip card
const flipCard = (index) => {
  if (isProcessing.value) return
  
  const card = cards.value[index]
  
  // Zaten eşleşmiş veya çevrilmişse tıklama
  if (card.isMatched || card.isFlipped || flippedCards.value.length >= 2) {
    return
  }
  
  // Kartı çevir
  card.isFlipped = true
  flippedCards.value.push(index)
  
  // Joker kartsa bonus puan
  if (card.isJoker) {
    setTimeout(() => {
      card.isMatched = true
      score.value += 5
      flippedCards.value = []
      checkGameComplete()
    }, 500)
    return
  }
  
  // 2 kart çevrildiyse kontrol et
  if (flippedCards.value.length === 2) {
    moves.value++
    isProcessing.value = true
    setTimeout(() => {
      checkMatch()
    }, 600)
  }
}

// Check if cards match
const checkMatch = () => {
  const [first, second] = flippedCards.value
  const firstCard = cards.value[first]
  const secondCard = cards.value[second]
  
  if (firstCard.id === secondCard.id) {
    // Eşleşme var!
    firstCard.isMatched = true
    secondCard.isMatched = true
    score.value += 10
    flippedCards.value = []
    
    checkGameComplete()
  } else {
    // Eşleşme yok - kartları geri çevir
    setTimeout(() => {
      firstCard.isFlipped = false
      secondCard.isFlipped = false
      flippedCards.value = []
    }, 400)
  }
  
  isProcessing.value = false
}

// Check if game is completed
const checkGameComplete = () => {
  if (cards.value.every(card => card.isMatched)) {
    gameCompleted.value = true
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }
}

// Start timer
const startTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  timerInterval.value = setInterval(() => {
    timer.value++
  }, 1000)
}

// Stop timer
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

// Simulate upload progress
const startUploadProgress = () => {
  uploadProgress.value = 0
  const interval = setInterval(() => {
    if (uploadProgress.value < 100) {
      uploadProgress.value += Math.random() * 20 + 5
      if (uploadProgress.value > 100) uploadProgress.value = 100
    } else {
      clearInterval(interval)
    }
  }, 300)
}

// Watch show prop
watch(() => props.show, (newVal) => {
  if (newVal) {
    resetGame()
    startTimer()
    startUploadProgress()
  } else {
    stopTimer()
  }
})

// Cleanup
onUnmounted(() => {
  stopTimer()
})

// Initialize on mount
onMounted(() => {
  if (props.show) {
    resetGame()
    startTimer()
  }
})
</script>

<style scoped>
.excel-loading-overlay {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Main Content */
.loading-content {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  min-width: 380px;
  max-width: 420px;
}

/* Excel Icon */
.excel-icon-container {
  text-align: center;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

/* Loading Text */
.main-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
  text-align: center;
}

.subtitle {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Memory Game */
.memory-game {
  margin: 1rem 0;
  text-align: center;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #444;
  font-weight: 500;
}

.game-info > div {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 1rem auto;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 12px;
  width: fit-content;
}

.memory-card {
  position: relative;
  width: 70px;
  height: 70px;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.memory-card.flipped {
  transform: rotateY(180deg);
}

.memory-card.matched {
  animation: matchBounce 0.4s ease;
}

@keyframes matchBounce {
  0%, 100% { transform: rotateY(180deg) scale(1); }
  50% { transform: rotateY(180deg) scale(1.15); }
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.memory-card:not(.flipped):hover .card-front {
  transform: rotateY(0deg) scale(1.05);
}

.game-completed {
  text-align: center;
  font-size: 0.95rem;
  color: #2e7d32;
  font-weight: 600;
  margin: 0.75rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Stats Display */
.stats-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #555;
}

/* Responsive */
@media (max-width: 480px) {
  .loading-content {
    min-width: 320px;
    padding: 1.25rem;
  }
  
  .memory-card {
    width: 60px;
    height: 60px;
  }
  
  .game-board {
    gap: 6px;
    padding: 0.5rem;
  }
}
</style> 