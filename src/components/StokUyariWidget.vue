<template>
  <v-card 
    v-if="showWidget" 
    class="stok-uyari-widget mb-4" 
    :color="widgetColor" 
    elevation="4"
    rounded="xl"
  >
    <v-card-text class="pa-4">
      <v-row align="center">
        <v-col cols="12" md="8">
          <div class="d-flex align-center">
            <v-avatar :color="iconColor" size="48" class="mr-4">
              <v-icon color="white" size="28">{{ widgetIcon }}</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold text-white mb-1">
                {{ uyariBilgisi.title }}
              </h3>
              <p class="text-body-2 text-white opacity-90 mb-0">
                {{ uyariBilgisi.message }}
              </p>
              <div class="d-flex mt-2">
                <v-chip 
                  v-if="uyariBilgisi.negatifCount > 0" 
                  size="small" 
                  color="error" 
                  class="mr-2"
                >
                  <v-icon start size="16">mdi-alert-circle</v-icon>
                  {{ uyariBilgisi.negatifCount }} Negatif Stok
                </v-chip>
                <v-chip 
                  v-if="uyariBilgisi.dusukCount > 0" 
                  size="small" 
                  color="warning" 
                  class="mr-2"
                >
                  <v-icon start size="16">mdi-alert</v-icon>
                  {{ uyariBilgisi.dusukCount }} Düşük Stok
                </v-chip>
              </div>
            </div>
          </div>
        </v-col>
        
        <v-col cols="12" md="4" class="text-right">
          <v-btn
            v-if="uyariBilgisi.count > 0"
            color="white"
            variant="outlined"
            size="small"
            @click="toggleDetails"
            class="mr-2"
          >
            <v-icon start>{{ detailsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            Detayları {{ detailsOpen ? 'Gizle' : 'Göster' }}
          </v-btn>
          <v-btn
            icon="mdi-refresh"
            color="white"
            variant="text"
            size="small"
            @click="refreshUyarilar"
            :loading="loading"
          />
          <v-btn
            icon="mdi-close"
            color="white"
            variant="text"
            size="small"
            @click="closeWidget"
          />
        </v-col>
      </v-row>
      
      <!-- Detay Listesi -->
      <v-expand-transition>
        <div v-if="detailsOpen && uyarilar.length > 0" class="mt-4">
          <v-divider class="mb-3" color="rgba(255,255,255,0.3)" />
          <v-row>
            <v-col 
              v-for="material in uyarilar.slice(0, 6)" 
              :key="material.id"
              cols="12" sm="6" md="4"
            >
              <v-card color="rgba(255,255,255,0.15)" rounded="lg" class="pa-3">
                <div class="d-flex align-center">
                  <v-icon 
                    :color="material.mevcutStok <= 0 ? 'error' : 'warning'" 
                    class="mr-2"
                  >
                    {{ material.mevcutStok <= 0 ? 'mdi-alert-circle' : 'mdi-alert' }}
                  </v-icon>
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-medium text-white">
                      {{ material.ad }}
                    </div>
                    <div class="text-caption text-white opacity-80">
                      {{ material.kod }} - {{ material.mevcutStok }}{{ material.birim }}
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
          
          <div v-if="uyarilar.length > 6" class="text-center mt-3">
            <v-chip color="rgba(255,255,255,0.2)" size="small">
              +{{ uyarilar.length - 6 }} daha fazla malzeme
            </v-chip>
          </div>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '../composables/useApi.js'

// State
const loading = ref(false)
const uyarilar = ref([])
const detailsOpen = ref(false)
const showWidget = ref(false)
const refreshInterval = ref(null)

// API
const api = useApi()

// Computed
const uyariBilgisi = computed(() => {
  const negatifCount = uyarilar.value.filter(m => m.mevcutStok <= 0).length
  const dusukCount = uyarilar.value.filter(m => m.mevcutStok > 0).length
  const totalCount = uyarilar.value.length

  if (totalCount === 0) {
    return {
      title: '✅ Stok Durumu Normal',
      message: 'Tüm malzemeler yeterli stok seviyesinde',
      count: 0,
      negatifCount: 0,
      dusukCount: 0,
      severity: 'success'
    }
  }

  return {
    title: negatifCount > 0 ? '🚨 Kritik Stok Uyarısı' : '⚠️ Düşük Stok Uyarısı',
    message: negatifCount > 0 
      ? `${negatifCount} malzemede negatif stok var!` 
      : `${dusukCount} malzemede düşük stok uyarısı!`,
    count: totalCount,
    negatifCount,
    dusukCount,
    severity: negatifCount > 0 ? 'critical' : 'warning'
  }
})

const widgetColor = computed(() => {
  switch (uyariBilgisi.value.severity) {
    case 'critical': return 'error'
    case 'warning': return 'warning'
    default: return 'success'
  }
})

const iconColor = computed(() => {
  switch (uyariBilgisi.value.severity) {
    case 'critical': return 'red-darken-2'
    case 'warning': return 'orange-darken-2'
    default: return 'green-darken-2'
  }
})

const widgetIcon = computed(() => {
  switch (uyariBilgisi.value.severity) {
    case 'critical': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    default: return 'mdi-check-circle'
  }
})

// Methods
const refreshUyarilar = async () => {
  loading.value = true
  try {
    // API base URL'i doğru kullan
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/stok/alerts`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.success) {
      uyarilar.value = data.uyarilar.tumKritikStoklar || []
      
      // Widget'ı sadece uyarı varsa göster
      showWidget.value = uyarilar.value.length > 0 || uyariBilgisi.value.severity !== 'success'
      
      console.log(`📊 Stok uyarıları güncellendi: ${uyarilar.value.length} uyarı`)
    } else {
      uyarilar.value = []
      showWidget.value = false
    }
  } catch (error) {
    console.error('Stok uyarıları alınamadı:', error)
    uyarilar.value = []
    showWidget.value = false
  } finally {
    loading.value = false
  }
}

const toggleDetails = () => {
  detailsOpen.value = !detailsOpen.value
}

const closeWidget = () => {
  showWidget.value = false
  // 30 saniye sonra tekrar göster
  setTimeout(() => {
    if (uyarilar.value.length > 0) {
      showWidget.value = true
    }
  }, 30000)
}

const startAutoRefresh = () => {
  // Her 2 dakikada bir otomatik yenile
  refreshInterval.value = setInterval(() => {
    refreshUyarilar()
  }, 120000) // 2 dakika
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// Lifecycle
onMounted(() => {
  refreshUyarilar()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.stok-uyari-widget {
  background: linear-gradient(135deg, var(--v-theme-error) 0%, var(--v-theme-warning) 100%);
  position: relative;
  overflow: hidden;
}

.stok-uyari-widget::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255,255,255,0.05) 10px,
    rgba(255,255,255,0.05) 20px
  );
  animation: slide 20s linear infinite;
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.stok-uyari-widget.success {
  background: linear-gradient(135deg, var(--v-theme-success) 0%, var(--v-theme-primary) 100%);
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style> 