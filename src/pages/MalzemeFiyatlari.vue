<template>
  <div class="malzeme-fiyatlari">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Malzeme Fiyatları</h1>
      <button 
        @click="showCreateDialog = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Yeni Malzeme
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Malzeme Adı</label>
          <input 
            v-model="filters.search"
            type="text" 
            placeholder="Malzeme ara..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Malzeme Tipi</label>
          <select 
            v-model="filters.tipi"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadMaterials"
          >
            <option value="">Tüm Tipler</option>
            <option value="HAMMADDE">Hammadde</option>
            <option value="YARI_MAMUL">Yarı Mamül</option>
            <option value="YARDIMCI_MADDE">Yardımcı Madde</option>
            <option value="AMBALAJ_MALZEMESI">Ambalaj Malzemesi</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Birim</label>
          <select 
            v-model="filters.birim"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadMaterials"
          >
            <option value="">Tüm Birimler</option>
            <option value="KG">KG</option>
            <option value="GRAM">Gram</option>
            <option value="LITRE">Litre</option>
            <option value="ML">ML</option>
            <option value="ADET">Adet</option>
            <option value="PAKET">Paket</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <select 
            v-model="filters.aktif"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadMaterials"
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <i class="fas fa-exclamation-triangle text-red-400 mr-3 mt-1"></i>
        <div>
          <h3 class="text-sm font-medium text-red-800">Hata</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          <button 
            @click="loadMaterials" 
            class="text-sm text-red-600 hover:text-red-500 mt-2"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>

    <!-- Materials Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Malzeme
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kod
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birim
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birim Fiyat
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="material in materials" :key="material.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ material.ad }}</div>
                <div v-if="material.aciklama" class="text-sm text-gray-500">{{ material.aciklama }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ material.kod }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeColor(material.tipi)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getTypeLabel(material.tipi) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ material.birim }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center">
                  <span class="font-medium">{{ formatCurrency(material.birimFiyat) }}</span>
                  <button 
                    @click="editPrice(material)"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div :class="getStockColor(material.mevcutStok, material.minStokSeviye)">
                  {{ material.mevcutStok }} {{ material.birim }}
                  <div class="text-xs text-gray-500">Min: {{ material.minStokSeviye }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="material.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ material.aktif ? 'Aktif' : 'Pasif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    @click="editMaterial(material)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="deleteMaterial(material)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="materials.length === 0" class="text-center py-12">
        <i class="fas fa-box-open text-gray-400 text-4xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Malzeme bulunamadı</h3>
        <p class="text-gray-500">Filtreleri değiştirin veya yeni malzeme ekleyin.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="materials.length > 0" class="flex justify-between items-center mt-6">
      <div class="text-sm text-gray-700">
        Toplam {{ totalCount }} malzemeden {{ ((currentPage - 1) * pageSize) + 1 }}-{{ Math.min(currentPage * pageSize, totalCount) }} arası gösteriliyor
      </div>
      <div class="flex space-x-2">
        <button 
          @click="previousPage"
          :disabled="currentPage <= 1"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Önceki
        </button>
        <button 
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useMaterialsApi } from '@/composables/useApi'
import { debounce } from 'lodash-es'

// API Composable
const { 
  loading, 
  error, 
  getMaterials, 
  updateMaterial, 
  deleteMaterial: deleteMaterialApi 
} = useMaterialsApi()

// Reactive Data
const materials = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const showCreateDialog = ref(false)

// Filters
const filters = reactive({
  search: '',
  tipi: '',
  birim: '',
  aktif: ''
})

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadMaterials()
}, 300)

// Methods
async function loadMaterials() {
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filters
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await getMaterials(params)
    materials.value = response.data || []
    totalCount.value = response.total || 0
  } catch (err) {
    console.error('Malzemeler yüklenirken hata:', err)
  }
}

function getTypeLabel(type) {
  const labels = {
    'HAMMADDE': 'Hammadde',
    'YARI_MAMUL': 'Yarı Mamül',
    'YARDIMCI_MADDE': 'Yardımcı Madde',
    'AMBALAJ_MALZEMESI': 'Ambalaj'
  }
  return labels[type] || type
}

function getTypeColor(type) {
  const colors = {
    'HAMMADDE': 'bg-blue-100 text-blue-800',
    'YARI_MAMUL': 'bg-purple-100 text-purple-800',
    'YARDIMCI_MADDE': 'bg-yellow-100 text-yellow-800',
    'AMBALAJ_MALZEMESI': 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function getStockColor(current, min) {
  if (current <= min) return 'text-red-600 font-medium'
  if (current <= min * 1.5) return 'text-yellow-600 font-medium'
  return 'text-green-600'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount || 0)
}

function editPrice(material) {
  // Price edit modal implementation
  console.log('Edit price for:', material)
}

function editMaterial(material) {
  // Material edit modal implementation  
  console.log('Edit material:', material)
}

async function deleteMaterial(material) {
  if (confirm(`"${material.ad}" malzemesini silmek istediğinizden emin misiniz?`)) {
    try {
      await deleteMaterialApi(material.id)
      await loadMaterials()
    } catch (err) {
      console.error('Malzeme silinirken hata:', err)
    }
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadMaterials()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadMaterials()
  }
}

// Lifecycle
onMounted(() => {
  loadMaterials()
})
</script>

<style scoped>
.malzeme-fiyatlari {
  @apply p-6;
}
</style> 