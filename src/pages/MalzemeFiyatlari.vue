<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>💰 Malzeme Fiyatları Yönetimi</span>
        <div>
          <v-text-field v-model="search" label="Malzemede Ara..." prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details clearable style="max-width: 300px; display: inline-block;"
            fluid class="mr-2"></v-text-field>
          <v-btn icon="mdi-refresh" variant="text" @click="fetchMalzemeFiyatlari" title="Listeyi Yenile"></v-btn>
          <v-btn color="primary" @click="openBulkUpdateDialog" prepend-icon="mdi-update">
            Toplu Güncelleme
          </v-btn>
        </div>
      </v-card-title>

      <v-alert type="error" v-if="error" class="mb-4" closable>{{ error }}</v-alert>

      <!-- Hammadde Fiyatları -->
      <v-card class="mb-6" variant="outlined">
        <v-card-title class="text-h6 bg-green-lighten-5">
          <v-icon color="green" class="mr-2">mdi-package-variant</v-icon>
          Hammadde Fiyatları ({{ hammaddeler.length }} adet)
        </v-card-title>
        <v-card-text>
          <v-data-table :headers="headers" :items="hammaddeler" :search="search" item-value="stokKod"
            class="elevation-1" hover density="comfortable" :loading="loading"
            no-data-text="Hammadde bulunamadı." loading-text="Hammaddeler yükleniyor...">
            <template v-slot:item.fiyat="{ item }">
              <v-text-field v-model.number="item.fiyat" type="number" density="compact" variant="outlined"
                suffix="₺/KG" @blur="updateMalzemeFiyati(item)" @keyup.enter="updateMalzemeFiyati(item)"
                :loading="item.updating" hide-details style="max-width: 120px;"></v-text-field>
            </template>
            <template v-slot:item.tip="{ item }">
              <v-chip color="green" size="small" label>{{ item.tip }}</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-content-save" size="small" color="success" variant="text"
                @click="updateMalzemeFiyati(item)" :loading="item.updating" title="Kaydet"></v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- Yarı Mamul Fiyatları -->
      <v-card class="mb-6" variant="outlined">
        <v-card-title class="text-h6 bg-orange-lighten-5">
          <v-icon color="orange" class="mr-2">mdi-cube-outline</v-icon>
          Yarı Mamul Fiyatları ({{ yariMamuller.length }} adet)
        </v-card-title>
        <v-card-text>
          <v-data-table :headers="headers" :items="yariMamuller" :search="search" item-value="stokKod"
            class="elevation-1" hover density="comfortable" :loading="loading"
            no-data-text="Yarı mamul bulunamadı." loading-text="Yarı mamuller yükleniyor...">
            <template v-slot:item.fiyat="{ item }">
              <v-text-field v-model.number="item.fiyat" type="number" density="compact" variant="outlined"
                suffix="₺/KG" @blur="updateMalzemeFiyati(item)" @keyup.enter="updateMalzemeFiyati(item)"
                :loading="item.updating" hide-details style="max-width: 120px;"></v-text-field>
            </template>
            <template v-slot:item.tip="{ item }">
              <v-chip color="orange" size="small" label>{{ item.tip }}</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-content-save" size="small" color="success" variant="text"
                @click="updateMalzemeFiyati(item)" :loading="item.updating" title="Kaydet"></v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- Özet Kartları -->
      <v-row>
        <v-col cols="12" md="4">
          <v-card color="green-lighten-5" variant="outlined">
            <v-card-text class="text-center">
              <v-icon size="48" color="green" class="mb-2">mdi-package-variant</v-icon>
              <div class="text-h4 font-weight-bold text-green">{{ hammaddeler.length }}</div>
              <div class="text-subtitle-1">Toplam Hammadde</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="orange-lighten-5" variant="outlined">
            <v-card-text class="text-center">
              <v-icon size="48" color="orange" class="mb-2">mdi-cube-outline</v-icon>
              <div class="text-h4 font-weight-bold text-orange">{{ yariMamuller.length }}</div>
              <div class="text-subtitle-1">Toplam Yarı Mamul</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="blue-lighten-5" variant="outlined">
            <v-card-text class="text-center">
              <v-icon size="48" color="blue" class="mb-2">mdi-currency-try</v-icon>
              <div class="text-h4 font-weight-bold text-blue">{{ ortalamaFiyat }}</div>
              <div class="text-subtitle-1">Ortalama Fiyat (₺/KG)</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Toplu Güncelleme Dialog -->
    <v-dialog v-model="bulkUpdateDialog" max-width="600px">
      <v-card>
        <v-card-title>Toplu Fiyat Güncelleme</v-card-title>
        <v-card-text>
          <v-form ref="bulkFormRef">
            <v-select v-model="bulkUpdate.tip" :items="['Hammadde', 'Yarı Mamul', 'Tümü']" label="Malzeme Tipi"
              variant="outlined" density="compact" class="mb-3"></v-select>
            <v-text-field v-model.number="bulkUpdate.yuzde" label="Yüzde Artış/Azalış (%)" type="number"
              variant="outlined" density="compact" class="mb-3" hint="Pozitif: artış, Negatif: azalış"
              persistent-hint></v-text-field>
            <v-text-field v-model.number="bulkUpdate.sabitMiktar" label="Sabit Miktar (₺)" type="number"
              variant="outlined" density="compact" class="mb-3" hint="Tüm fiyatlara eklenecek/çıkarılacak miktar"
              persistent-hint></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="bulkUpdateDialog = false">İptal</v-btn>
          <v-btn color="primary" @click="applyBulkUpdate" :loading="bulkUpdating">Uygula</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line>
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// Data Table State
const headers = ref([
  { title: 'Stok Kodu', key: 'stokKod', sortable: true },
  { title: 'Malzeme Adı', key: 'ad', sortable: true },
  { title: 'Fiyat (₺/KG)', key: 'fiyat', align: 'center', sortable: true },
  { title: 'Tip', key: 'tip', align: 'center', sortable: true },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'center' }
]);

const hammaddeler = ref([]);
const yariMamuller = ref([]);
const loading = ref(true);
const search = ref('');
const error = ref(null);

// Bulk Update State
const bulkUpdateDialog = ref(false);
const bulkUpdating = ref(false);
const bulkUpdate = ref({
  tip: 'Tümü',
  yuzde: 0,
  sabitMiktar: 0
});

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}

// Computed Properties
const ortalamaFiyat = computed(() => {
  const tumMalzemeler = [...hammaddeler.value, ...yariMamuller.value];
  if (tumMalzemeler.length === 0) return '0.00';
  
  const toplamFiyat = tumMalzemeler.reduce((sum, item) => sum + (item.fiyat || 0), 0);
  return (toplamFiyat / tumMalzemeler.length).toFixed(2);
});

// API'den malzeme fiyatlarını çek
async function fetchMalzemeFiyatlari() {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/malzeme-fiyatlari`);
    hammaddeler.value = response.data.hammaddeler || [];
    yariMamuller.value = response.data.yariMamuller || [];
    
    // Her malzemeye updating özelliği ekle
    hammaddeler.value.forEach(item => item.updating = false);
    yariMamuller.value.forEach(item => item.updating = false);
    
    console.log('Malzeme fiyatları yüklendi:', {
      hammaddeler: hammaddeler.value.length,
      yariMamuller: yariMamuller.value.length
    });
  } catch (err) {
    console.error('❌ Malzeme fiyatları çekilemedi:', err);
    error.value = `Malzeme fiyatları yüklenirken hata oluştu.`;
    hammaddeler.value = [];
    yariMamuller.value = [];
  } finally {
    loading.value = false;
  }
}

// Tekil malzeme fiyatı güncelle
async function updateMalzemeFiyati(malzeme) {
  if (!malzeme.fiyat || malzeme.fiyat < 0) {
    showSnackbar('Geçersiz fiyat değeri!', 'error');
    return;
  }

  malzeme.updating = true;
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/malzeme-fiyatlari`, {
      stokKod: malzeme.stokKod,
      fiyat: malzeme.fiyat,
      birim: 'KG'
    });
    
    showSnackbar(`${malzeme.ad} fiyatı güncellendi!`, 'success');
  } catch (err) {
    console.error('❌ Malzeme fiyatı güncellenemedi:', err);
    showSnackbar(`Fiyat güncellenirken hata oluştu: ${err.response?.data?.error || err.message}`, 'error');
  } finally {
    malzeme.updating = false;
  }
}

// Toplu güncelleme dialog'unu aç
function openBulkUpdateDialog() {
  bulkUpdate.value = {
    tip: 'Tümü',
    yuzde: 0,
    sabitMiktar: 0
  };
  bulkUpdateDialog.value = true;
}

// Toplu güncelleme uygula
async function applyBulkUpdate() {
  if (bulkUpdate.value.yuzde === 0 && bulkUpdate.value.sabitMiktar === 0) {
    showSnackbar('Lütfen bir güncelleme değeri girin!', 'warning');
    return;
  }

  bulkUpdating.value = true;
  try {
    let hedefMalzemeler = [];
    
    if (bulkUpdate.value.tip === 'Hammadde') {
      hedefMalzemeler = hammaddeler.value;
    } else if (bulkUpdate.value.tip === 'Yarı Mamul') {
      hedefMalzemeler = yariMamuller.value;
    } else {
      hedefMalzemeler = [...hammaddeler.value, ...yariMamuller.value];
    }

    let guncellenenSayisi = 0;
    
    for (const malzeme of hedefMalzemeler) {
      let yeniFiyat = malzeme.fiyat;
      
      // Yüzde hesaplama
      if (bulkUpdate.value.yuzde !== 0) {
        yeniFiyat = yeniFiyat * (1 + bulkUpdate.value.yuzde / 100);
      }
      
      // Sabit miktar ekleme/çıkarma
      if (bulkUpdate.value.sabitMiktar !== 0) {
        yeniFiyat = yeniFiyat + bulkUpdate.value.sabitMiktar;
      }
      
      // Negatif fiyat kontrolü
      if (yeniFiyat < 0) {
        yeniFiyat = 0;
      }
      
      // Fiyatı güncelle
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/malzeme-fiyatlari`, {
        stokKod: malzeme.stokKod,
        fiyat: yeniFiyat,
        birim: 'KG'
      });
      
      // Local state'i güncelle
      malzeme.fiyat = yeniFiyat;
      guncellenenSayisi++;
    }
    
    showSnackbar(`${guncellenenSayisi} malzeme fiyatı toplu olarak güncellendi!`, 'success');
    bulkUpdateDialog.value = false;
  } catch (err) {
    console.error('❌ Toplu güncelleme hatası:', err);
    showSnackbar(`Toplu güncelleme sırasında hata oluştu: ${err.response?.data?.error || err.message}`, 'error');
  } finally {
    bulkUpdating.value = false;
  }
}

onMounted(() => {
  fetchMalzemeFiyatlari();
});
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
}

.v-chip {
  border-radius: 8px;
}

.v-alert {
  border-radius: 8px;
}

.v-data-table {
  border-radius: 12px;
}

.v-text-field {
  border-radius: 8px;
}
</style> 