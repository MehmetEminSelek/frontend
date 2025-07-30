<template>
  <v-card 
    v-if="showWidget"
    :color="widgetColor" 
    class="stok-uyari-widget"
    rounded="xl"
    elevation="4"
  >
    <v-card-text class="pa-4">
      <v-row align="center">
        <v-col cols="auto">
          <v-icon 
            :icon="widgetIcon" 
            size="40" 
            color="white"
            :class="{ 'mdi-spin': loading }"
          />
        </v-col>
        <v-col>
          <div class="text-h6 text-white font-weight-bold">
            {{ loading ? 'Stok Kontrolü' : uyariBilgisi.text }}
          </div>
          <div v-if="!loading && uyariBilgisi.count > 0" class="text-body-2 text-white opacity-80">
            {{ uyariBilgisi.count }} malzemede stok uyarısı var
            <v-chip 
              v-if="detailsOpen === false"
              size="x-small" 
              class="ml-2"
              color="rgba(255,255,255,0.2)"
              @click="toggleDetails"
            >
              Detayları Gör
            </v-chip>
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
const uyarilar = ref([])
const showWidget = ref(true) // Başlangıçta göster
const detailsOpen = ref(false)
const loading = ref(true) // Başlangıçta loading true
const refreshInterval = ref(null)

// Uyarı bilgisi
const uyariBilgisi = ref({
  count: 0,
  text: 'Stok durumu kontrol ediliyor...',
  severity: 'info'
})

// API
const api = useApi()

// Computed
const widgetColor = computed(() => {
  switch (uyariBilgisi.value.severity) {
    case 'critical': return 'error'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'success': return 'success'
    default: return 'info'
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
  if (loading.value) return 'mdi-loading'
  
  switch (uyariBilgisi.value.severity) {
    case 'critical': return 'mdi-alert-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'success': return 'mdi-check-circle'
    default: return 'mdi-information'
  }
})

// Methods
const refreshUyarilar = async () => {
  loading.value = true
  try {
    // API base URL'i doğru kullan
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/stok/alerts`
    console.log('🔍 Stok uyarıları API çağrısı:', apiUrl)
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    console.log('📊 API Response:', data)
    
    if (data.success) {
      uyarilar.value = data.uyarilar.tumKritikStoklar || []
      
      // Özet bilgileri güncelle
      if (data.ozet) {
        uyariBilgisi.value = {
          count: data.toplamUyari || 0,
          text: data.ozet.uyariMesaji || 'Stok kontrolü yapılıyor...',
          severity: data.ozet.seviyeRengi || 'info'
        }
      }
      
      // Widget'ı sadece uyarı varsa göster
      showWidget.value = uyarilar.value.length > 0 || uyariBilgisi.value.severity !== 'success'
      
      console.log(`📊 Stok uyarıları güncellendi: ${uyarilar.value.length} uyarı`)
      console.log('🚨 Kritik stoklar:', uyarilar.value)
    } else {
      console.error('❌ API başarısız response:', data)
      uyarilar.value = []
      showWidget.value = false
    }
  } catch (error) {
    console.error('❌ Stok uyarıları alınamadı:', error)
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

/* Loading animasyonu */
.mdi-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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