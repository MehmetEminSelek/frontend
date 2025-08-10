<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-4"
        style="background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%); color: #E65100; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
          <v-icon size="120">mdi-currency-usd</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="#F57C00">mdi-chart-line</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1" style="color: #E65100;">Fiyat Yönetimi</h1>
                <p class="text-h6 mb-0" style="color: #F57C00; opacity: 0.8;">Ürün fiyatlandırma ve maliyet yönetimi</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="rgba(230, 81, 0, 0.15)" size="small" class="mr-2" style="color: #E65100;">
                <v-icon start size="16" color="#F57C00">mdi-tag-multiple</v-icon>
                Çoklu Fiyat
              </v-chip>
              <v-chip color="rgba(230, 81, 0, 0.15)" size="small" style="color: #E65100;">
                <v-icon start size="16" color="#F57C00">mdi-calendar-range</v-icon>
                Tarih Bazlı
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-btn size="x-large" color="white" variant="elevated" @click="openNewFiyatDialog" class="font-weight-bold"
              style="color: #F57C00 !important; box-shadow: 0 4px 12px rgba(245, 124, 0, 0.2);">
              <v-icon left size="20">mdi-plus</v-icon>
              Yeni Fiyat
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Filter Section -->
    <v-card class="mb-6 rounded-xl" elevation="2" style="border: 1px solid #FFF3E0;">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="search" label="Ürün Ara" prepend-inner-icon="mdi-magnify" variant="outlined"
              density="compact" clearable color="#F57C00" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="selectedCategory" :items="categories" label="Kategori" variant="outlined"
              density="compact" clearable color="#F57C00" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="selectedType" :items="priceTypes" label="Fiyat Türü" variant="outlined" density="compact"
              clearable color="#F57C00" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Content Card -->
    <v-card class="rounded-xl" elevation="2" style="border: 1px solid #FFF3E0;">
      <v-card-title class="pa-4 d-flex justify-space-between align-center"
        style="background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); color: white;">
        <div class="d-flex align-center">
          <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
            <v-icon color="white">mdi-table</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold">Fiyat Listesi</h3>
            <p class="text-body-2 opacity-80 ma-0">Ürün fiyatları ve güncellemeleri</p>
          </div>
        </div>
        <v-btn icon="mdi-refresh" variant="flat" color="rgba(255,255,255,0.2)" @click="fetchFiyatlar"
          title="Yenile"></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" class="mb-4" closable style="border-radius: 8px;">{{ error }}</v-alert>

        <v-data-table :headers="headers" :items="filteredFiyatlar" :loading="loading" item-value="id"
          class="price-table rounded-lg" hover density="comfortable" items-per-page-text="Sayfa başına fiyat:"
          :items-per-page="itemsPerPage" no-data-text="Gösterilecek fiyat kaydı bulunamadı."
          loading-text="Fiyatlar yükleniyor...">

          <template v-slot:item.urun="{ item }">
            <div class="d-flex align-center">
              <v-avatar color="#FFE0B2" size="36" class="mr-3">
                <span class="font-weight-bold" style="color: #E65100;">{{ item.urun?.ad?.charAt(0).toUpperCase()
                }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium" style="color: #E65100;">{{ item.urun?.ad }}</div>
                <div class="text-caption" style="color: #F57C00;">{{ item.urun?.kod }}</div>
              </div>
            </div>
          </template>

          <template v-slot:item.birim="{ item }">
            <v-chip color="#FFE0B2" size="small" variant="flat" style="color: #E65100;">
              {{ item.birim }}
            </v-chip>
          </template>

          <template v-slot:item.fiyatTipi="{ item }">
            <v-chip :color="getTipColor(item.fiyatTipi)" size="small" variant="flat">
              <v-icon start size="16">{{ getTipIcon(item.fiyatTipi) }}</v-icon>
              {{ getTipText(item.fiyatTipi) }}
            </v-chip>
          </template>

          <template v-slot:item.fiyat="{ item }">
            <div class="text-h6 font-weight-bold" style="color: #E65100;">
              {{ formatCurrency(item.kgFiyati) }}
            </div>
          </template>

          <template v-slot:item.gecerliTarih="{ item }">
            <span class="text-body-2">{{ formatDate(item.baslangicTarihi) }}</span>
          </template>

          <template v-slot:item.bitisTarihi="{ item }">
            <span class="text-body-2" :class="{ 'text-error': isExpired(item.bitisTarihi) }">
              {{ item.bitisTarihi ? formatDate(item.bitisTarihi) : 'Süresiz' }}
            </span>
          </template>

          <template v-slot:item.aktif="{ item }">
            <v-chip :color="item.aktif ? 'success' : 'error'" size="small" variant="flat">
              {{ item.aktif ? 'Aktif' : 'Pasif' }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-pencil" size="small" color="#F57C00" variant="text" @click="editFiyat(item)"
              title="Düzenle"></v-btn>
            <v-btn icon="mdi-delete" size="small" color="#E91E63" variant="text" @click="deleteFiyat(item)"
              title="Sil"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Price Dialog -->
    <v-dialog v-model="fiyatDialog" persistent max-width="600px">
      <v-card style="border-radius: 16px; overflow: hidden;">
        <v-card-title class="text-h6"
          style="background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); color: white;">
          {{ editingFiyat ? 'Fiyat Düzenle' : 'Yeni Fiyat Ekle' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="fiyatFormRef" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-select v-model="fiyatForm.urunId" :items="urunler" item-title="ad" item-value="id" label="Ürün"
                  :rules="[rules.required]" variant="outlined" color="#FF9800" />
              </v-col>
              <v-col cols="6">
                <v-select v-model="fiyatForm.birim" :items="birimOptions" item-title="text" item-value="value"
                  label="Birim" :rules="[rules.required]" variant="outlined" color="#FF9800" />
              </v-col>
              <v-col cols="6">
                <v-select v-model="fiyatForm.fiyatTipi" :items="priceTypeOptions" item-title="text" item-value="value"
                  label="Fiyat Türü" :rules="[rules.required]" variant="outlined" color="#FF9800" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="fiyatForm.fiyat" label="Fiyat" type="number" step="0.01"
                  :rules="[rules.positiveNumber]" variant="outlined" color="#FF9800" prefix="₺"
                  placeholder="Örn: 999.50" hint="Pozitif bir sayı giriniz" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="fiyatForm.gecerliTarih" label="Geçerlilik Tarihi" type="date"
                  :rules="[rules.required]" variant="outlined" color="#FF9800" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="fiyatForm.bitisTarihi" label="Bitiş Tarihi" type="date" variant="outlined"
                  color="#FF9800" hint="Boş bırakılırsa süresiz geçerli olur" />
              </v-col>
              <v-col cols="12">
                <v-checkbox v-model="fiyatForm.aktif" label="Aktif" color="#FF9800" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closeFiyatDialog" style="color: #F57C00;">İptal</v-btn>
          <v-btn @click="saveFiyat" :loading="fiyatDialogLoading" :disabled="!validForm"
            style="background: #FF9800; color: white;">
            {{ editingFiyat ? 'Güncelle' : 'Ekle' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Silme Onay Dialog -->
    <v-dialog v-model="silmeDialog" max-width="450">
      <v-card class="rounded-xl" style="overflow: hidden;">
        <v-card-title class="text-h6 pa-4 d-flex align-center"
          style="background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%); color: white;">
          <v-icon color="white" class="mr-3" size="24">mdi-delete-alert</v-icon>
          Fiyat Kaydını Sil
        </v-card-title>
        <v-card-text class="pa-6">
          <div class="text-body-1 mb-4">
            <strong>"{{ silinecekFiyat?.urun?.ad || 'Seçili ürün' }}"</strong> ürününün
            <strong>{{ formatCurrency(silinecekFiyat?.kgFiyati) }}</strong> fiyat kaydını
            silmek istediğinizden emin misiniz?
          </div>

          <div class="d-flex align-center mb-3 pa-3 rounded" style="background-color: #FFF3E3;">
            <v-icon color="#F57C00" class="mr-2">mdi-information</v-icon>
            <div class="text-body-2" style="color: #E65100;">
              <strong>Fiyat Türü:</strong> {{ silinecekFiyat?.fiyatTipi || 'Belirtilmemiş' }} •
              <strong>Birim:</strong> {{ silinecekFiyat?.birim || 'Belirtilmemiş' }}
            </div>
          </div>

          <v-alert type="warning" variant="tonal" class="mb-0" style="border-radius: 8px;">
            <v-icon slot="prepend" color="warning">mdi-alert-triangle</v-icon>
            <strong>Dikkat!</strong> Bu işlem geri alınamaz ve fiyat geçmişinden tamamen silinecektir.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="silmeDialog = false" style="color: #757575; border-color: #E0E0E0;"
            class="mr-2">
            <v-icon start size="16">mdi-close</v-icon>
            İptal
          </v-btn>
          <v-btn color="error" @click="fiyatSilOnayla" :loading="silmeYukleniyor" class="font-weight-medium">
            <v-icon start size="16">mdi-delete</v-icon>
            Kalıcı Olarak Sil
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, computed } from 'vue';
import { apiCall } from '../utils/api';
import { formatDate } from '../utils/date';

// Custom Vuetify instance kaldırıldı - global instance kullanacağız
// Böylece component unmount sırasında vnode null hatası oluşmayacak

// Data Table State
const itemsPerPage = ref(50);
const headers = ref([
  { title: 'Ürün', key: 'urun', sortable: true },
  { title: 'Birim', key: 'birim', sortable: true },
  { title: 'Tür', key: 'fiyatTipi', sortable: true },
  { title: 'Fiyat', key: 'kgFiyati', align: 'end', sortable: true },
  { title: 'Başlangıç', key: 'baslangicTarihi', sortable: true },
  { title: 'Bitiş', key: 'bitisTarihi', sortable: true },
  { title: 'Durum', key: 'aktif', sortable: true },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' }
]);
const fiyatlar = ref([]);
const loading = ref(true);
const search = ref('');
const error = ref(null);
const totalItems = ref(0);

// Filter State
const selectedCategory = ref(null);
const selectedType = ref(null);
const categories = ref([]);
const priceTypes = ref([]);

// Computed Properties
const filteredFiyatlar = computed(() => {
  let filtered = fiyatlar.value;

  if (search.value) {
    filtered = filtered.filter(item =>
      item.urun?.ad?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.urun?.kod?.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.urun?.kategori === selectedCategory.value);
  }

  if (selectedType.value) {
    filtered = filtered.filter(item => item.fiyatTipi === selectedType.value);
  }

  return filtered;
});

// Dialog State
const fiyatDialog = ref(false);
const fiyatDialogLoading = ref(false);
const editingFiyat = ref(null);
const fiyatFormRef = ref(null);
const validForm = ref(false);
const silmeDialog = ref(false);
const silmeYukleniyor = ref(false);
const silinecekFiyat = ref(null);
const fiyatForm = reactive({
  urunId: null,
  birim: 'KG',
  fiyatTipi: 'normal',
  fiyat: null,
  gecerliTarih: null,
  bitisTarihi: null,
  aktif: true
});
const urunler = ref([]);
const priceHistory = ref([]);
const selectedUrunId = ref(null);
const selectedBirim = ref(null);
const priceOrderCounts = ref({});

// Options for dropdowns
const priceTypeOptions = ref([
  { text: 'Normal Fiyat', value: 'NORMAL' },
  { text: 'Toptan Fiyat', value: 'TOPTAN' },
  { text: 'Perakende Fiyat', value: 'PERAKENDE' },
  { text: 'Kampanya Fiyatı', value: 'KAMPANYA' }
]);

const birimOptions = ref([
  { text: 'Kilogram', value: 'KG' },
  { text: 'Adet', value: 'Adet' },
  { text: 'Gram', value: 'Gram' },
  { text: 'Litre', value: 'Litre' }
]);

// Snackbar State
const snackbar = ref(false); const snackbarText = ref(''); const snackbarColor = ref('info'); const snackbarTimeout = ref(4000);
function showSnackbar(text, color = 'info', timeout = 4000) { snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true; }

// Validasyon Kuralları
const rules = {
  required: value => !!value || 'Bu alan zorunludur.',
  positiveNumber: value => {
    console.log('🔍 Validation - value:', value, 'type:', typeof value);

    // Boş değer kontrolü
    if (!value && value !== 0) return 'Bu alan zorunludur.';

    // String veya number'ı number'a çevir
    const num = Number(value);
    console.log('🔍 Validation - converted number:', num, 'isNaN:', isNaN(num));

    // Geçerli number ve pozitif olmalı
    const isValid = !isNaN(num) && num > 0;
    console.log('🔍 Validation - isValid:', isValid);

    return isValid || 'Fiyat 0\'dan büyük bir sayı olmalıdır.';
  }
};

// Utility Functions
function formatCurrency(amount) {
  if (amount == null) return '0,00 ₺';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
}

function getTipColor(tip) {
  switch (tip) {
    case 'NORMAL': return '#4CAF50';
    case 'TOPTAN': return '#FF9800';
    case 'PERAKENDE': return '#9C27B0';
    case 'KAMPANYA': return '#F44336';
    default: return '#757575';
  }
}

function getTipIcon(tip) {
  switch (tip) {
    case 'NORMAL': return 'mdi-tag';
    case 'TOPTAN': return 'mdi-warehouse';
    case 'PERAKENDE': return 'mdi-store';
    case 'KAMPANYA': return 'mdi-percent';
    default: return 'mdi-tag';
  }
}

function getTipText(tip) {
  switch (tip) {
    case 'NORMAL': return 'Normal';
    case 'TOPTAN': return 'Toptan';
    case 'PERAKENDE': return 'Perakende';
    case 'KAMPANYA': return 'Kampanya';
    default: return tip;
  }
}

function isExpired(bitisTarihi) {
  if (!bitisTarihi) return false;
  return new Date(bitisTarihi) < new Date();
}

function editFiyat(item) {
  openEditFiyatDialog(item);
}

async function deleteFiyat(item) {
  silinecekFiyat.value = item;
  silmeDialog.value = true;
}

// API'den fiyatları çek
async function fetchFiyatlar() {
  loading.value = true;
  error.value = null;
  try {
    console.log('🔄 Fiyatlar yükleniyor...');
    const response = await apiCall('/fiyatlar', {
      method: 'GET',
      useCache: false
    });
    console.log('📦 Backend yanıtı:', response);

    // Backend: { success, pricing, pagination }
    const allPrices = Array.isArray(response?.pricing)
      ? response.pricing
      : Array.isArray(response?.data?.pricing)
        ? response.data.pricing
        : Array.isArray(response)
          ? response
          : [];
    console.log('📊 Toplam fiyat sayısı:', allPrices.length);

    if (allPrices.length > 0) {
      console.log('📝 İlk fiyat örneği:', allPrices[0]);
    }

    fiyatlar.value = allPrices;
    totalItems.value = fiyatlar.value.length;
    console.log('✅ Fiyatlar başarıyla yüklendi:', fiyatlar.value.length, 'adet');
  } catch (err) {
    console.error('❌ Fiyatlar çekilemedi:', err);
    console.error('❌ Hata detayı:', err.response?.data);
    error.value = `Fiyatlar yüklenirken hata oluştu: ${err.response?.data?.error || err.message}`;
    fiyatlar.value = [];
    totalItems.value = 0;
  }
  finally {
    loading.value = false;
  }
}

// Ürün listesini çek (Dialog için)
async function fetchUrunler() {
  try {
    const response = await apiCall('/dropdown', { useCache: true });
    urunler.value = response.urunler || [];
  } catch (err) {
    console.error('❌ Ürün listesi çekilemedi:', err);
    showSnackbar('Ürün listesi yüklenemedi.', 'error');
  }
}

onMounted(() => {
  console.log('🚀 FiyatYonetimi component mounted');
  fetchFiyatlar();
  fetchUrunler();
});

// Component cleanup
onBeforeUnmount(() => {
  console.log('🧹 FiyatYonetimi component cleanup');

  // Form referanslarını temizle
  if (fiyatFormRef.value) {
    fiyatFormRef.value = null;
  }

  // Dialog'ları kapat
  fiyatDialog.value = false;
  silmeDialog.value = false;

  // Loading state'leri temizle
  loading.value = false;
  fiyatDialogLoading.value = false;
  silmeYukleniyor.value = false;

  // Error state'i temizle
  error.value = null;

  console.log('✅ FiyatYonetimi component temizlendi');
});

// Number validation helper
function validateNumber(event) {
  // Ensure the value is treated as a number
  if (event.target.value) {
    fiyatForm.fiyat = parseFloat(event.target.value);
  }
}

function handleOptionsUpdate(options) { console.log('Data table options updated:', options); }

// Dialog Fonksiyonları
function openNewFiyatDialog() {
  editingFiyat.value = null;
  fiyatForm.urunId = null;
  fiyatForm.birim = 'KG';
  fiyatForm.fiyatTipi = 'NORMAL';
  fiyatForm.fiyat = null;
  fiyatForm.gecerliTarih = new Date().toISOString().split('T')[0];
  fiyatForm.bitisTarihi = null;
  fiyatForm.aktif = true;
  fiyatDialog.value = true;
}

function openEditFiyatDialog(fiyat) {
  editingFiyat.value = { ...fiyat };
  fiyatForm.urunId = fiyat.urunId;
  fiyatForm.birim = fiyat.birim || 'KG';
  fiyatForm.fiyatTipi = fiyat.fiyatTipi || 'NORMAL';
  fiyatForm.fiyat = fiyat.kgFiyati;
  fiyatForm.gecerliTarih = fiyat.baslangicTarihi ? new Date(fiyat.baslangicTarihi).toISOString().split('T')[0] : null;
  fiyatForm.bitisTarihi = fiyat.bitisTarihi ? new Date(fiyat.bitisTarihi).toISOString().split('T')[0] : null;
  fiyatForm.aktif = fiyat.aktif !== false;
  fiyatDialog.value = true;
  selectedUrunId.value = fiyat.urunId;
}

function closeFiyatDialog() {
  fiyatDialog.value = false;
  editingFiyat.value = null;
}

// Fetch price history for a product/unit
async function fetchPriceHistory(urunId, birim) {
  if (!urunId || !birim) { priceHistory.value = []; return; }
  try {
    const response = await apiCall(`/fiyatlar?all=true&urunId=${urunId}&birim=${birim}`, { useCache: true });
    priceHistory.value = response.fiyatlar || response.data || response || [];
  } catch (err) {
    priceHistory.value = [];
  }
}

async function fetchOrderCountsForHistory() {
  priceOrderCounts.value = {};
  await Promise.all(priceHistory.value.map(async (f) => {
    try {
      const res = await apiCall(`/fiyatlar/${f.id}?orders=true`, { useCache: true });
      priceOrderCounts.value[f.id] = res;
    } catch (e) {
      priceOrderCounts.value[f.id] = { count: 0, orders: [] };
    }
  }));
}

// Yeni Fiyatı Kaydet veya Mevcut Fiyatı Güncelle
async function saveFiyat() {
  const { valid } = await fiyatFormRef.value.validate();
  if (!valid) { showSnackbar('Lütfen formdaki hataları düzeltin.', 'warning'); return; }
  fiyatDialogLoading.value = true;
  try {
    // Form verilerini number'a çevir
    const fiyatValue = Number(fiyatForm.fiyat);
    console.log('💰 Fiyat değeri:', fiyatValue, 'type:', typeof fiyatValue);

    const payload = {
      urunId: parseInt(fiyatForm.urunId),
      birim: fiyatForm.birim,
      fiyatTipi: fiyatForm.fiyatTipi,
      kgFiyati: fiyatValue, // Number olarak gönder
      baslangicTarihi: fiyatForm.gecerliTarih,
      bitisTarihi: fiyatForm.bitisTarihi || null,
      aktif: fiyatForm.aktif
    };

    console.log('📤 Gönderilen payload:', payload);

    if (editingFiyat.value) {
      await apiCall(`/fiyatlar/${editingFiyat.value.id}`, {
        method: 'PUT',
        data: payload,
        clearCacheOnSuccess: true
      });
      showSnackbar('Fiyat başarıyla güncellendi!', 'success');
    } else {
      await apiCall('/fiyatlar', {
        method: 'POST',
        data: payload,
        clearCacheOnSuccess: true
      });
      showSnackbar('Yeni fiyat başarıyla eklendi!', 'success');
    }
    closeFiyatDialog();
    fetchFiyatlar();
  } catch (err) {
    console.error('❌ Fiyat kaydetme hatası:', err);
    console.error('❌ Hata detayı:', err.response?.data);
    showSnackbar(`İşlem sırasında hata oluştu: ${err.response?.data?.message || err.message}`, 'error');
  } finally {
    fiyatDialogLoading.value = false;
  }
}

async function fiyatSilOnayla() {
  silmeYukleniyor.value = true;
  try {
    await apiCall(`/fiyatlar/${silinecekFiyat.value.id}`, {
      method: 'DELETE',
      clearCacheOnSuccess: true
    });
    showSnackbar('Fiyat kaydı başarıyla silindi!', 'success');
    fetchFiyatlar(); // Listeyi yenile
  } catch (err) {
    console.error('❌ Fiyat silme hatası:', err);
    showSnackbar(`Fiyat silinirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error');
  } finally {
    silmeYukleniyor.value = false;
    silmeDialog.value = false;
    silinecekFiyat.value = null;
  }
}

function getUrunIcon(urunAdi) { if (!urunAdi) return 'mdi-help-circle-outline'; if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone'; if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie'; if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles'; return 'mdi-food-variant'; }

// In the price history table, highlight overlapping records (if any). Add a computed property to detect overlaps.
const hasOverlap = computed(() => {
  if (!priceHistory.value.length) return false;
  for (let i = 1; i < priceHistory.value.length; i++) {
    const prev = priceHistory.value[i - 1];
    const curr = priceHistory.value[i];
    if (prev.bitisTarihi && curr.gecerliTarih < prev.bitisTarihi) {
      return true;
    }
  }
  return false;
});

const historyFilter = reactive({ start: '', end: '' });
const filteredPriceHistory = computed(() => {
  if (!historyFilter.start && !historyFilter.end) return priceHistory.value;
  const start = historyFilter.start ? new Date(historyFilter.start) : null;
  const end = historyFilter.end ? new Date(historyFilter.end) : null;
  return priceHistory.value.filter(f => {
    const gecerli = new Date(f.gecerliTarih);
    const bitis = f.bitisTarihi ? new Date(f.bitisTarihi) : null;
    if (start && gecerli < start && (!bitis || bitis < start)) return false;
    if (end && gecerli > end && (!bitis || bitis > end)) return false;
    return true;
  });
});

</script>

<style scoped>
.hero-section {
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(230,81,0,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.price-table th {
  background: #FFF3E0 !important;
  color: #F57C00 !important;
  font-weight: 600 !important;
}

.price-table tbody tr:hover {
  background: rgba(245, 124, 0, 0.03) !important;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>
