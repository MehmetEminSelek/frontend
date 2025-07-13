<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn 
        v-bind="props"
        :color="cacheColor"
        :variant="cacheStore.isCacheValid ? 'tonal' : 'outlined'"
        size="small"
        :loading="cacheStore.cacheStatus.isLoading"
      >
        <v-icon start>{{ cacheIcon }}</v-icon>
        Cache
        <v-badge 
          v-if="!cacheStore.isCacheValid" 
          color="warning" 
          dot 
          floating
        />
      </v-btn>
    </template>

    <v-card min-width="300">
      <v-card-title class="text-subtitle-1">
        <v-icon start>mdi-database</v-icon>
        Cache Durumu
      </v-card-title>
      
      <v-divider />
      
      <v-card-text>
        <v-row dense>
          <v-col cols="6">
            <v-chip 
              :color="cacheStore.isCacheValid ? 'success' : 'warning'"
              variant="flat"
              size="small"
            >
              {{ cacheStore.isCacheValid ? 'Geçerli' : 'Süresi Dolmuş' }}
            </v-chip>
          </v-col>
          <v-col cols="6" class="text-right">
            <span class="text-caption text-medium-emphasis">
              {{ cacheAge }}
            </span>
          </v-col>
        </v-row>

        <v-divider class="my-3" />

        <div class="text-caption mb-2">Cached Data:</div>
        <v-row dense>
          <v-col cols="6">
            <div class="d-flex align-center">
              <v-icon size="x-small" class="mr-1">mdi-account-group</v-icon>
              <span class="text-caption">Cariler: {{ cacheStore.dropdownData.cariler?.length || 0 }}</span>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="d-flex align-center">
              <v-icon size="x-small" class="mr-1">mdi-food</v-icon>
              <span class="text-caption">Ürünler: {{ cacheStore.dropdownData.urunler?.length || 0 }}</span>
            </div>
          </v-col>
        </v-row>

        <div v-if="cacheStore.cacheStatus.lastUpdate" class="text-caption text-medium-emphasis mt-2">
          Son güncelleme: {{ formatDate(cacheStore.cacheStatus.lastUpdate) }}
        </div>

        <div v-if="cacheStore.cacheStatus.error" class="text-caption text-error mt-2">
          Hata: {{ cacheStore.cacheStatus.error }}
        </div>
      </v-card-text>

      <v-divider />
      
      <v-card-actions>
        <v-btn 
          variant="text" 
          size="small"
          @click="refreshCache"
          :loading="cacheStore.cacheStatus.isLoading"
        >
          <v-icon start>mdi-refresh</v-icon>
          Yenile
        </v-btn>
        
        <v-spacer />
        
        <v-btn 
          variant="text" 
          size="small" 
          color="warning"
          @click="clearCache"
        >
          <v-icon start>mdi-delete</v-icon>
          Temizle
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useCacheStore } from '../stores/cache.js'

const cacheStore = useCacheStore()

const cacheColor = computed(() => {
  if (cacheStore.cacheStatus.isLoading) return 'primary'
  if (cacheStore.cacheStatus.error) return 'error'
  if (cacheStore.isCacheValid) return 'success'
  return 'warning'
})

const cacheIcon = computed(() => {
  if (cacheStore.cacheStatus.isLoading) return 'mdi-loading'
  if (cacheStore.cacheStatus.error) return 'mdi-alert-circle'
  if (cacheStore.isCacheValid) return 'mdi-check-circle'
  return 'mdi-clock-alert'
})

const cacheAge = computed(() => {
  if (!cacheStore.cacheStatus.lastUpdate) return 'Hiç güncellenmemiş'
  
  const now = new Date()
  const lastUpdate = new Date(cacheStore.cacheStatus.lastUpdate)
  const diffMs = now - lastUpdate
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  const diffHours = Math.floor(diffMins / 60)
  return `${diffHours} saat önce`
})

function formatDate(date) {
  return new Date(date).toLocaleString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  })
}

async function refreshCache() {
  try {
    await cacheStore.refreshCache()
  } catch (error) {
    console.error('Cache refresh error:', error)
  }
}

function clearCache() {
  cacheStore.invalidateCache()
}
</script> 