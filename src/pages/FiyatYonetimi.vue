<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>💰 Fiyat Yönetimi</span>
        <div>
          <v-text-field v-model="search" label="Fiyatlarda Ara (Ürün Adı...)" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details clearable style="max-width: 300px; display: inline-block;"
            fluid class="mr-2"></v-text-field>
          <v-btn icon="mdi-refresh" variant="text" @click="fetchFiyatlar" title="Listeyi Yenile"></v-btn>
          <v-btn color="primary" @click="openNewPriceDialog" prepend-icon="mdi-plus-circle-outline">
            Yeni Fiyat Ekle
          </v-btn>
        </div>
      </v-card-title>

      <v-alert type="error" v-if="error" class="mb-4" closable>{{ error }}</v-alert>

      <v-data-table :headers="headers" :items="fiyatlar" :loading="loading" :search="search" item-value="id"
        class="elevation-1" hover density="comfortable" items-per-page-text="Sayfa başına fiyat:"
        :items-per-page="itemsPerPage" @update:options="handleOptionsUpdate" :items-length="totalItems"
        no-data-text="Gösterilecek fiyat kaydı bulunamadı." loading-text="Fiyatlar yükleniyor...">
        <template v-slot:item.urun.ad="{ item }">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">{{ getUrunIcon(item.urun?.ad) }}</v-icon>
            <span>{{ item.urun?.ad || 'Bilinmeyen Ürün' }}</span>
          </div>
        </template>

        <template v-slot:item.fiyat="{ item }">
          <span>{{ item.fiyat?.toFixed(2) }} ₺</span>
        </template>

        <template v-slot:item.gecerliTarih="{ item }">
          {{ formatDate(item.gecerliTarih) }}
        </template>

        <template v-slot:item.bitisTarihi="{ item }">
          <span v-if="item.bitisTarihi">{{ formatDate(item.bitisTarihi) }}</span>
          <v-chip v-else color="success" size="x-small" label>Aktif</v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top" text="Fiyatı Düzenle">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" v-bind="props"
                @click="openEditPriceDialog(item)"></v-btn>
            </template>
          </v-tooltip>
        </template>

        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="priceDialog" persistent max-width="600px">
      <v-card :loading="priceDialogLoading">
        <v-card-title>
          <span class="text-h5">{{ editingFiyat ? 'Fiyatı Düzenle' : 'Yeni Fiyat Ekle' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="priceFormRef">
            <v-autocomplete v-model="priceForm.urunId" :items="urunListesi" item-title="ad" item-value="id"
              label="Ürün Seçin" :rules="[rules.required]" required variant="outlined" density="compact" class="mb-3"
              :readonly="!!editingFiyat"></v-autocomplete>
            <v-select v-model="priceForm.birim" :items="['KG', 'Adet']" label="Birim" :rules="[rules.required]" required
              variant="outlined" density="compact" class="mb-3" :readonly="!!editingFiyat"></v-select>
            <v-text-field v-model.number="priceForm.fiyat" label="Fiyat (₺)" type="number" prefix="₺"
              :rules="[rules.required, rules.positiveNumber]" required variant="outlined" density="compact"
              class="mb-3"></v-text-field>
            <v-text-field v-model="priceForm.gecerliTarih" label="Geçerli Başlangıç Tarihi" type="date"
              :rules="[rules.required]" required variant="outlined" density="compact" class="mb-3"
              :readonly="!!editingFiyat"></v-text-field>
            <v-text-field v-model="priceForm.bitisTarihi" label="Geçerli Bitiş Tarihi (Boşsa aktif kalır)" type="date"
              clearable variant="outlined" density="compact" class="mb-3"
              hint="Bu tarihten sonra bu fiyat geçerli olmaz." persistent-hint></v-text-field>
          </v-form>
          <div v-if="editingFiyat && priceHistory.length > 0" class="mt-4">
            <v-alert type="info" variant="tonal" class="mb-2">
              <div>
                <strong>Fiyat Geçmişi Hakkında:</strong><br>
                Fiyatlar geçmişe dönük olarak saklanır. Bir fiyat güncellendiğinde, eski fiyatın bitiş tarihi yeni
                fiyatın
                başlangıç tarihi olarak ayarlanır ve yeni bir kayıt oluşturulur. Böylece siparişler, kendi tarihlerinde
                geçerli olan fiyatla hesaplanır. Aynı ürün ve birim için aynı dönemde birden fazla aktif fiyat olamaz.
              </div>
            </v-alert>
            <div class="d-flex align-center mb-2">
              <v-text-field v-model="historyFilter.start" type="date" label="Başlangıç Tarihi" density="compact"
                style="max-width: 180px;" class="mr-2" clearable></v-text-field>
              <v-text-field v-model="historyFilter.end" type="date" label="Bitiş Tarihi" density="compact"
                style="max-width: 180px;" clearable></v-text-field>
            </div>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Fiyat (₺)</th>
                  <th>Başlangıç</th>
                  <th>Bitiş</th>
                  <th>Kullanılan Sipariş</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(f, i) in filteredPriceHistory" :key="f.id" :class="{
                  'bg-red-lighten-4': i > 0 && filteredPriceHistory[i - 1].bitisTarihi && f.gecerliTarih < filteredPriceHistory[i - 1].bitisTarihi
                }">
                  <td>{{ f.fiyat.toFixed(2) }}</td>
                  <td>{{ formatDate(f.gecerliTarih) }}</td>
                  <td>{{ f.bitisTarihi ? formatDate(f.bitisTarihi) : 'Aktif' }}</td>
                  <td>
                    <v-tooltip v-if="priceOrderCounts[f.id] && priceOrderCounts[f.id].count > 0" location="top">
                      <template #activator="{ props }">
                        <span v-bind="props" class="font-weight-bold">{{ priceOrderCounts[f.id].count }}</span>
                      </template>
                      <div style="max-width: 250px;">
                        <div v-for="o in priceOrderCounts[f.id].orders" :key="o.id">
                          #{{ o.id }} - {{ formatDate(o.tarih) }}
                        </div>
                      </div>
                    </v-tooltip>
                    <span v-else>0</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closePriceDialog">İptal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveFiyat" :loading="priceDialogLoading">
            {{ editingFiyat ? 'Güncelle' : 'Kaydet' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line>
      {{ snackbarText }}
      <template v-slot:actions> <v-btn
          :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false"> Kapat </v-btn> </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive, computed, provide } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';

// Fiyat modülüne özel tema ile Vuetify instance'ı oluştur
const fiyatTheme = {
  dark: false,
  colors: {
    primary: '#F6C177', // Altın/Sarı
    secondary: '#FFF3CD', // Açık sarı
    accent: '#FFD700',
    error: '#D32F2F',
    info: '#F6C177',
    success: '#388E3C',
    warning: '#FBC02D',
    background: '#FFFBEA',
    surface: '#FFFFFF',
  },
};
const fiyatVuetify = createCustomVuetify({ themeName: 'fiyatTheme', extraThemes: { fiyatTheme } });
provide('vuetify', fiyatVuetify);

// Data Table State
const itemsPerPage = ref(50);
const headers = ref([{ title: 'Ürün Adı', key: 'urun.ad', sortable: true }, { title: 'Birim', key: 'birim', sortable: true }, { title: 'Fiyat (₺)', key: 'fiyat', align: 'end', sortable: true }, { title: 'Başlangıç Tarihi', key: 'gecerliTarih', sortable: true }, { title: 'Bitiş Tarihi', key: 'bitisTarihi', sortable: true }, { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },]);
const fiyatlar = ref([]);
const loading = ref(true);
const search = ref('');
const error = ref(null);
const totalItems = ref(0);

// Dialog State
const priceDialog = ref(false);
const priceDialogLoading = ref(false);
const editingFiyat = ref(null);
const priceFormRef = ref(null);
const priceForm = reactive({ urunId: null, birim: 'KG', fiyat: null, gecerliTarih: null, bitisTarihi: null, });
const urunListesi = ref([]);
const priceHistory = ref([]);
const selectedUrunId = ref(null);
const selectedBirim = ref(null);
const priceOrderCounts = ref({});

// Snackbar State
const snackbar = ref(false); const snackbarText = ref(''); const snackbarColor = ref('info'); const snackbarTimeout = ref(4000);
function showSnackbar(text, color = 'info', timeout = 4000) { snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true; }

// Validasyon Kuralları
const rules = { required: value => !!value || 'Bu alan zorunludur.', positiveNumber: value => (typeof value === 'number' && value > 0) || 'Fiyat 0 dan büyük bir sayı olmalıdır.' };

// API'den fiyatları çek
async function fetchFiyatlar() {
  loading.value = true; error.value = null;
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/fiyatlar`);
    // Filter to only keep the latest price for each product/unit
    const allPrices = response.data.fiyatlar || response.data || [];
    const latestMap = {};
    allPrices.forEach(price => {
      const key = `${price.urunId}-${price.birim}`;
      if (!latestMap[key] || new Date(price.gecerliTarih) > new Date(latestMap[key].gecerliTarih)) {
        latestMap[key] = price;
      }
    });
    fiyatlar.value = Object.values(latestMap);
    totalItems.value = fiyatlar.value.length;
    console.log('Fiyatlar yüklendi (sadece en güncel):', fiyatlar.value);
  } catch (err) { console.error('❌ Fiyatlar çekilemedi:', err); error.value = `Fiyatlar yüklenirken hata oluştu.`; fiyatlar.value = []; totalItems.value = 0; }
  finally { loading.value = false; }
}

// Ürün listesini çek (Dialog için)
async function fetchUrunler() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/dropdown`);
    urunListesi.value = response.data.urunler || [];
  } catch (err) { console.error('❌ Ürün listesi çekilemedi:', err); showSnackbar('Ürün listesi yüklenemedi.', 'error'); }
}

onMounted(() => { fetchFiyatlar(); fetchUrunler(); });
function handleOptionsUpdate(options) { console.log('Data table options updated:', options); }

// Dialog Fonksiyonları
function openNewPriceDialog() { editingFiyat.value = null; priceForm.urunId = null; priceForm.birim = 'KG'; priceForm.fiyat = null; priceForm.gecerliTarih = new Date().toISOString().split('T')[0]; priceForm.bitisTarihi = null; priceDialog.value = true; }
function openEditPriceDialog(fiyat) {
  editingFiyat.value = { ...fiyat };
  priceForm.urunId = fiyat.urunId;
  priceForm.birim = fiyat.birim;
  priceForm.fiyat = fiyat.fiyat;
  priceForm.gecerliTarih = fiyat.gecerliTarih ? new Date(fiyat.gecerliTarih).toISOString().split('T')[0] : null;
  priceForm.bitisTarihi = fiyat.bitisTarihi ? new Date(fiyat.bitisTarihi).toISOString().split('T')[0] : null;
  priceDialog.value = true;
  selectedUrunId.value = fiyat.urunId;
  selectedBirim.value = fiyat.birim;
  fetchPriceHistory(fiyat.urunId, fiyat.birim).then(fetchOrderCountsForHistory);
}
function closePriceDialog() { priceDialog.value = false; editingFiyat.value = null; }

// Fetch price history for a product/unit
async function fetchPriceHistory(urunId, birim) {
  if (!urunId || !birim) { priceHistory.value = []; return; }
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/fiyatlar?all=true&urunId=${urunId}&birim=${birim}`);
    priceHistory.value = response.data.fiyatlar || response.data || [];
  } catch (err) {
    priceHistory.value = [];
  }
}

async function fetchOrderCountsForHistory() {
  priceOrderCounts.value = {};
  await Promise.all(priceHistory.value.map(async (f) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/fiyatlar/${f.id}?orders=true`);
      priceOrderCounts.value[f.id] = res.data;
    } catch (e) {
      priceOrderCounts.value[f.id] = { count: 0, orders: [] };
    }
  }));
}

// Yeni Fiyatı Kaydet veya Mevcut Fiyatı Güncelle (GÜNCELLENDİ)
async function saveFiyat() {
  const { valid } = await priceFormRef.value.validate();
  if (!valid) { showSnackbar('Lütfen formdaki hataları düzeltin.', 'warning'); return; }
  priceDialogLoading.value = true;
  try {
    if (editingFiyat.value) {
      // Güncelleme (Tüm zorunlu alanları gönder)
      const updatePayload = {
        urunId: priceForm.urunId,
        birim: priceForm.birim,
        fiyat: priceForm.fiyat,
        gecerliTarih: priceForm.gecerliTarih ? new Date(priceForm.gecerliTarih) : null
      };
      await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/fiyatlar/${editingFiyat.value.id}`, updatePayload);
      showSnackbar('Fiyat başarıyla güncellendi!', 'success');
    } else {
      // Yeni fiyat ekleme
      const payload = {
        urunId: priceForm.urunId,
        birim: priceForm.birim,
        fiyat: priceForm.fiyat,
        gecerliTarih: priceForm.gecerliTarih ? new Date(priceForm.gecerliTarih) : null, // Tarih objesi
        bitisTarihi: priceForm.bitisTarihi ? new Date(priceForm.bitisTarihi) : null,
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/fiyatlar`, payload);
      showSnackbar('Yeni fiyat başarıyla eklendi!', 'success');
    }
    closePriceDialog();
    fetchFiyatlar();
  } catch (err) {
    if (err.response?.data?.message?.includes('aktif bir fiyat kaydı var')) {
      showSnackbar('Bu ürün ve birim için bu tarihte zaten aktif bir fiyat kaydı var. Lütfen başka bir tarih seçin.', 'warning');
    } else {
      showSnackbar(`İşlem sırasında hata oluştu: ${err.response?.data?.message || err.message}`, 'error');
    }
  } finally {
    priceDialogLoading.value = false;
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
.v-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(246, 193, 119, 0.08);
  background: #fff;
  transition: box-shadow 0.2s;
}

.v-card:hover {
  box-shadow: 0 4px 16px rgba(246, 193, 119, 0.16);
}

.v-btn {
  transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(246, 193, 119, 0.10);
}

.v-avatar {
  font-weight: bold;
  font-size: 1.2em;
}

.v-data-table {
  border-radius: 12px;
  background: #fff;
}

.v-data-table th {
  background: #FFF3CD !important;
  color: #F6C177 !important;
  font-weight: bold;
}

.v-chip {
  border-radius: 8px;
  font-weight: 500;
}

.v-card-title.bg-primary {
  background: #F6C177 !important;
  color: #fff !important;
  border-radius: 12px 12px 0 0;
}
</style>
