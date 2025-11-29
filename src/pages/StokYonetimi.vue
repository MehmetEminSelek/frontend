<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- 🔔 Stok Uyarıları Widget -->
    <StokUyariWidget class="mb-6" />

    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-0 border"
        style="background: #F5F7FA; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
          <v-icon size="120" color="primary">mdi-archive-outline</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="primary">mdi-archive-outline</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Stok Yönetimi</h1>
                <p class="text-h6 mb-0 text-secondary">Hammadde ve yarı mamul stok takibi</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="primary" variant="tonal" size="small" class="mr-2">
                <v-icon start size="16">mdi-eye-outline</v-icon>
                Gerçek Zamanlı
              </v-chip>
              <v-chip color="warning" variant="tonal" size="small">
                <v-icon start size="16">mdi-alert-outline</v-icon>
                Kritik Seviye Uyarıları
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-select v-model="selectedOp" :items="opList" item-title="ad" item-value="kod" label="Operasyon Birimi"
              variant="outlined" density="comfortable" color="primary" hide-details class="rounded-lg" />
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Main Content Card -->
    <v-card class="rounded-xl border" elevation="0">
      <v-card-title class="pa-4 bg-primary text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
              <v-icon color="white">mdi-table</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Stok Listesi</h3>
              <p class="text-body-2 opacity-80 ma-0">Mevcut stok durumu</p>
            </div>
          </div>
          <v-btn icon="mdi-refresh" variant="flat" color="rgba(255,255,255,0.2)" @click="fetchStoklar"
            title="Yenile"></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table :headers="headers" :items="filteredStoklar" :loading="loading" item-value="id" class="elevation-0"
          hover density="comfortable" items-per-page="50" no-data-text="Stok kaydı yok."
          loading-text="Stoklar yükleniyor..."
          :item-class="item => item.mevcutStok < item.minStokSeviye ? 'bg-red-lighten-5' : ''">
          <template v-slot:item.mevcutStok="{ item }">
            <span :class="item.mevcutStok < item.minStokSeviye ? 'text-error font-weight-bold' : ''">{{
              item.mevcutStok.toLocaleString() }} gr</span>
            <v-icon v-if="item.mevcutStok < item.minStokSeviye" color="error" size="16" class="ml-1">mdi-alert</v-icon>
          </template>
          <template v-slot:item.minStokSeviye="{ item }">
            <span @click="openMinStokDialog(item)" style="cursor:pointer; text-decoration:underline; color:#1976d2;">
              {{ item.minStokSeviye?.toLocaleString() || 0 }} gr
              <v-icon size="16" class="ml-1">mdi-pencil</v-icon>
            </span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-plus-circle-outline" size="small" color="success" variant="text" @click="openStokDialog(item, 'giris')"
              title="Stok Girişi"></v-btn>
            <v-btn icon="mdi-minus-circle-outline" size="small" color="error" variant="text" @click="openStokDialog(item, 'cikis')"
              title="Stok Çıkışı"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="stokDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Stok {{ stokDialogType === 'giris' ? 'Girişi' : 'Çıkışı' }}</v-card-title>
        <v-card-text>
          <div v-if="stokDialogItem">
            <div><strong>Malzeme:</strong> {{ stokDialogItem.ad }}</div>
            <div><strong>Kod:</strong> {{ stokDialogItem.kod }}</div>
            <div><strong>Mevcut Stok:</strong> {{ stokDialogItem.mevcutStok?.toLocaleString() }} gr</div>
            <v-text-field v-model.number="stokDialogMiktar" label="Miktar (gram)" type="number" min="1" required
              prefix="gr" class="mb-3" variant="outlined" density="comfortable"></v-text-field>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeStokDialog">İptal</v-btn>
          <v-btn :color="stokDialogType === 'giris' ? 'success' : 'error'" variant="flat" @click="saveStokDialog"
            :loading="stokDialogLoading">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line>
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn :color="snackbarColor === 'error' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
    <v-btn v-if="isAdmin" color="primary" class="mb-4" @click="openTransferDialog">Stok Transferi</v-btn>
    <v-dialog v-if="isAdmin" v-model="transferDialog" persistent max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Stok Transferi</v-card-title>
        <v-card-text>
          <v-select v-model="transferForm.kaynakStokId" :items="stoklar" item-title="ad" item-value="id"
            label="Kaynak Stok" :disabled="transferDialogLoading" required></v-select>
          <v-select v-model="transferForm.hedefStokId" :items="stoklar" item-title="ad" item-value="id"
            label="Hedef Stok" :disabled="transferDialogLoading" required></v-select>
          <v-text-field v-model.number="transferForm.miktarGram" label="Miktar (gram)" type="number" min="1" required
            prefix="gr" :disabled="transferDialogLoading"></v-text-field>
          <v-text-field v-model="transferForm.aciklama" label="Açıklama"
            :disabled="transferDialogLoading"></v-text-field>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeTransferDialog">İptal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveTransferDialog" :loading="transferDialogLoading">Transfer
            Et</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card v-if="isAdmin" class="mt-8 pa-4" elevation="1">
      <v-card-title class="text-h6">Transfer Geçmişi</v-card-title>
      <v-data-table :headers="transferHeaders" :items="transferHistory" :loading="transferHistoryLoading"
        item-value="id" class="elevation-0" hover density="comfortable" items-per-page="20"
        no-data-text="Transfer kaydı yok." loading-text="Transferler yükleniyor...">
        <template v-slot:item.kaynak="{ item }">
          <span>{{ item.kaynakStok?.ad || 'Bilinmiyor' }}<br><small>{{
            item.kaynakStok?.kod || '' }}</small></span>
        </template>
        <template v-slot:item.hedef="{ item }">
          <span>{{ item.hedefStok?.ad || 'Bilinmiyor' }}<br><small>{{
            item.hedefStok?.kod || '' }}</small></span>
        </template>
        <template v-slot:item.miktarGram="{ item }">
          <span>{{ item.miktarGram?.toLocaleString() || 0 }} gr</span>
        </template>
        <template v-slot:item.createdAt="{ item }">
          <span>{{ formatDate(item.createdAt, true) }}</span>
        </template>
      </v-data-table>
    </v-card>
    <v-card class="mt-8 pa-4" elevation="1">
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span>Stok Hareketleri</span>
        <v-select v-model="hareketFilterStokId" :items="stoklar" item-title="ad" item-value="id" label="Stok Filtresi"
          clearable style="max-width: 250px" density="compact" />
      </v-card-title>
      <v-data-table :headers="hareketHeaders" :items="hareketler" :loading="hareketlerLoading" item-value="id"
        class="elevation-0" hover density="comfortable" items-per-page="20" no-data-text="Hareket kaydı yok."
        loading-text="Hareketler yükleniyor...">
        <template v-slot:item.stok="{ item }">
          <span>
            {{ item.material?.ad || item.urun?.ad || 'Bilinmiyor' }}
            <br>
            <small>{{ item.material?.kod || item.urun?.kod || '' }}</small>
          </span>
        </template>
        <template v-slot:item.tip="{ item }">
          <span>{{ hareketTipLabel(item.tip) }}</span>
        </template>
        <template v-slot:item.miktarGram="{ item }">
          <span>{{ item.miktar?.toLocaleString() || 0 }} {{ item.birim || 'gr' }}</span>
        </template>
        <template v-slot:item.user.ad="{ item }">
          <span>{{ item.user?.ad || 'Sistem' }}</span>
        </template>
        <template v-slot:item.createdAt="{ item }">
          <span>{{ formatDate(item.createdAt, true) }}</span>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="minStokDialog" persistent max-width="350px">
      <v-card>
        <v-card-title class="text-h6">Minimum Stok Güncelle</v-card-title>
        <v-card-text>
          <div v-if="minStokDialogItem">
            <div><strong>Malzeme:</strong> {{ minStokDialogItem.ad }}</div>
            <div><strong>Kod:</strong> {{ minStokDialogItem.kod }}</div>
            <div><strong>Mevcut Stok:</strong> {{ minStokDialogItem.mevcutStok?.toLocaleString() }} gr</div>
            <v-text-field v-model.number="minStokDialogValue" label="Minimum Stok (gram)" type="number" min="0" required
              prefix="gr" variant="outlined" density="comfortable"></v-text-field>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeMinStokDialog">İptal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveMinStokDialog"
            :loading="minStokDialogLoading">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card class="mt-8 pa-4" elevation="1">
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <span>Raporlar</span>
        <v-row dense align="center" class="ma-0">
          <v-col cols="auto">
            <v-text-field v-model="raporStart" label="Başlangıç" type="date" density="compact" hide-details
              style="min-width:120px" />
          </v-col>
          <v-col cols="auto">
            <v-text-field v-model="raporEnd" label="Bitiş" type="date" density="compact" hide-details
              style="min-width:120px" />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="fetchRapor" :loading="raporLoading">Getir</v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-row class="mb-4" dense>
        <v-col cols="12" md="4">
          <v-card color="green-lighten-5" class="pa-3">
            <div class="text-caption">Toplam Giriş</div>
            <div class="text-h6 font-weight-bold">{{ (rapor.toplamGiris ?? 0).toLocaleString() }} gr</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="red-lighten-5" class="pa-3">
            <div class="text-caption">Toplam Çıkış</div>
            <div class="text-h6 font-weight-bold">{{ (rapor.toplamCikis ?? 0).toLocaleString() }} gr</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card color="blue-lighten-5" class="pa-3">
            <div class="text-caption">Toplam Transfer</div>
            <div class="text-h6 font-weight-bold">{{ (rapor.toplamTransfer ?? 0).toLocaleString() }} gr</div>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-2">
            <div class="text-subtitle-2 mb-2">En Çok Giriş Yapılan Stoklar</div>
            <v-data-table :headers="raporStokHeaders" :items="rapor.enCokGiren" :loading="raporLoading"
              item-value="stokId" class="elevation-0" density="compact" hide-default-footer>
              <template v-slot:item.stok="{ item }">
                <span>{{ item.material?.ad || 'Bilinmiyor' }}<br><small>{{
                  item.material?.kod || '' }}</small></span>
              </template>
              <template v-slot:item._sum.miktarGram="{ item }">
                <span>{{ item._sum?.miktarGram?.toLocaleString() || 0 }} gr</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-2">
            <div class="text-subtitle-2 mb-2">En Çok Çıkış Yapılan Stoklar</div>
            <v-data-table :headers="raporStokHeaders" :items="rapor.enCokCikan" :loading="raporLoading"
              item-value="stokId" class="elevation-0" density="compact" hide-default-footer>
              <template v-slot:item.stok="{ item }">
                <span>{{ item.material?.ad || 'Bilinmiyor' }}<br><small>{{
                  item.material?.kod || '' }}</small></span>
              </template>
              <template v-slot:item._sum.miktarGram="{ item }">
                <span>{{ item._sum?.miktarGram?.toLocaleString() || 0 }} gr</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { formatDate } from '../utils/date';
import { apiCall } from '../utils/api';
import StokUyariWidget from '../components/StokUyariWidget.vue';

// Custom Vuetify instance'ı kaldırdık - global instance kullanacağız
// Böylece component unmount sırasında vnode null hatası oluşmayacak

const headers = [
  { title: 'Malzeme Adı', key: 'ad', sortable: true },
  { title: 'Kod', key: 'kod', sortable: true },
  { title: 'Tipi', key: 'tipi', sortable: true },
  { title: 'Birim', key: 'birim', sortable: true },
  { title: 'Mevcut Stok', key: 'mevcutStok', align: 'end', sortable: true },
  { title: 'Min. Stok', key: 'minStokSeviye', align: 'end', sortable: true },
  { title: 'Birim Fiyat', key: 'birimFiyat', align: 'end', sortable: true },
  { title: 'Tedarikçi', key: 'tedarikci', sortable: true },
  { title: 'Son Güncelleme', key: 'updatedAt', sortable: true },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
];
const stoklar = ref([]);
const loading = ref(true);
const error = ref(null);
const opList = ref([
  { ad: 'Tümü', kod: '' },
  { ad: 'Üretim', kod: 'OP004' },
  { ad: 'Ana Depo', kod: 'OP001' },
  { ad: 'Cep Depo', kod: 'OP002' },
  { ad: 'Sevkiyat', kod: 'OP003' },
]);
const selectedOp = ref('OP004');
const malzemeTipleri = ref([
  { ad: 'Tümü', kod: '' },
  { ad: 'Hammadde', kod: 'HAMMADDE' },
  { ad: 'Yarı Mamul', kod: 'YARI_MAMUL' },
  { ad: 'Yardımcı Madde', kod: 'YARDIMCI_MADDE' },
  { ad: 'Ambalaj Malzemesi', kod: 'AMBALAJ_MALZEMESI' },
]);
const selectedTip = ref('');
const searchQuery = ref('');

const filteredStoklar = computed(() => {
  let filtered = stoklar.value;

  if (selectedTip.value) {
    filtered = filtered.filter(s => s.tipi === selectedTip.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(s =>
      s.ad.toLowerCase().includes(query) ||
      s.kod.toLowerCase().includes(query) ||
      (s.tedarikci && s.tedarikci.toLowerCase().includes(query))
    );
  }

  return filtered;
});

const kritikStoklar = computed(() => {
  return stoklar.value.filter(s => s.mevcutStok <= s.minStokSeviye);
});

// User bilgilerini al
const user = computed(() => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
});

// Admin kontrolü
const isAdmin = computed(() => {
  return user.value?.rol === 'ADMIN' || user.value?.rol === 'MUDUR';
});

async function fetchStoklar() {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiCall('/stok');
    const list = Array.isArray(response?.materials) ? response.materials
      : Array.isArray(response) ? response
        : []
    stoklar.value = list;
  } catch (err) {
    error.value = 'Malzemeler yüklenirken hata oluştu.';
    stoklar.value = [];
    showSnackbar('Malzemeler yüklenirken hata oluştu.', 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('Kullanıcı bilgisi:', user); // Debug için

  // Tüm yetkili rolleri tanımla
  const yetkiliRoller = [
    'admin', 'superadmin', 'mudur',
    'GENEL_MUDUR', 'SUBE_MUDURU', 'SUBE_PERSONELI',
    'URETIM_MUDURU', 'URETIM_PERSONELI', 'MUHASEBE_PERSONELI'
  ];

  // Backend'den gelen alan adı 'rol', frontend'te 'role' olarak kullanılıyor
  const userRole = user.rol || user.role;
  const isAdmin = user && yetkiliRoller.map(r => r.toUpperCase()).includes((userRole || '').toUpperCase());

  // GEÇİCİ OLARAK YETKİ KONTROLÜ KAPALI - GELIŞTIRME İÇİN
  if (!user || !userRole) {
    console.log('Kullanıcı bilgisi eksik, login sayfasına yönlendiriliyor');
    showSnackbar('Lütfen önce giriş yapın.', 'warning');
    setTimeout(() => { window.location.href = '/login'; }, 2000);
    return;
  }

  // Kullanıcı varsa devam et (geçici)
  console.log('Kullanıcı girişi başarılı:', userRole);

  fetchStoklar();
  fetchTransferHistory();
  fetchHareketler();
  fetchRapor();
});

// Watch'ları reactive olarak tanımla ki temizleyebilelim
const stopWatchSelectedOp = watch(selectedOp, fetchStoklar);

// Component unmount olurken tüm listener'ları ve watch'ları temizle
onBeforeUnmount(() => {
  // Watch'ları temizle
  if (stopWatchSelectedOp) {
    stopWatchSelectedOp();
  }

  // Event listener'ları temizle
  // Global event'ler varsa burada temizle

  // Timer/interval'ları temizle
  // setInterval/setTimeout'lar varsa burada temizle

  console.log('🧹 StokYonetimi component temizlendi');
});

const stokDialog = ref(false);
const stokDialogItem = ref(null);
const stokDialogType = ref('giris');
const stokDialogMiktar = ref(0);
const stokDialogLoading = ref(false);

function openStokDialog(item, type) {
  stokDialogItem.value = item;
  stokDialogType.value = type;
  stokDialogMiktar.value = 0;
  stokDialog.value = true;
}

function closeStokDialog() {
  stokDialog.value = false;
  stokDialogItem.value = null;
  stokDialogMiktar.value = 0;
}

async function saveStokDialog() {
  if (!stokDialogItem.value || stokDialogMiktar.value <= 0) return;
  stokDialogLoading.value = true;
  try {
    await apiCall('/stok', {
      method: 'POST',
      data: {
        materialId: stokDialogItem.value.id,
        miktar: stokDialogMiktar.value,
        tip: stokDialogType.value.toUpperCase(),
      }
    });
    showSnackbar('Stok başarıyla güncellendi!', 'success');
    closeStokDialog();
    fetchStoklar();
  } catch (err) {
    showSnackbar('Stok güncellenirken hata oluştu.', 'error');
  } finally {
    stokDialogLoading.value = false;
  }
}

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

const transferDialog = ref(false);
const transferDialogLoading = ref(false);
const transferForm = ref({ kaynakStokId: null, hedefStokId: null, miktarGram: 0, aciklama: '' });
const transferHistory = ref([]);
const transferHistoryLoading = ref(false);
const transferHeaders = [
  { title: 'Kaynak', key: 'kaynak', sortable: false },
  { title: 'Hedef', key: 'hedef', sortable: false },
  { title: 'Miktar', key: 'miktarGram', align: 'end', sortable: true },
  { title: 'Açıklama', key: 'aciklama', sortable: false },
  { title: 'Tarih', key: 'createdAt', sortable: true },
];

function openTransferDialog() {
  transferForm.value = { kaynakStokId: null, hedefStokId: null, miktarGram: 0, aciklama: '' };
  transferDialog.value = true;
}

function closeTransferDialog() {
  transferDialog.value = false;
}

async function saveTransferDialog() {
  if (!transferForm.value.kaynakStokId || !transferForm.value.hedefStokId || transferForm.value.miktarGram <= 0) return;
  transferDialogLoading.value = true;
  try {
    await apiCall('/stok/transfer', {
      method: 'POST',
      data: transferForm.value
    });
    showSnackbar('Transfer başarıyla tamamlandı!', 'success');
    closeTransferDialog();
    fetchStoklar();
    fetchTransferHistory();
  } catch (err) {
    showSnackbar(err.message || 'Transfer sırasında hata oluştu.', 'error');
  } finally {
    transferDialogLoading.value = false;
  }
}

async function fetchTransferHistory() {
  transferHistoryLoading.value = true;
  try {
    const res = await apiCall('/stok/transfer');
    transferHistory.value = Array.isArray(res) ? res : [];
  } catch (err) {
    transferHistory.value = [];
  } finally {
    transferHistoryLoading.value = false;
  }
}

const hareketler = ref([]);
const hareketlerLoading = ref(false);
const hareketHeaders = [
  { title: 'Malzeme', key: 'stok', sortable: false },
  { title: 'Tip', key: 'tip', sortable: true },
  { title: 'Miktar', key: 'miktarGram', align: 'end', sortable: true },
  { title: 'Kullanıcı', key: 'user.ad', sortable: true },
  { title: 'Açıklama', key: 'aciklama', sortable: false },
  { title: 'Tarih', key: 'createdAt', sortable: true },
];
const hareketFilterStokId = ref(null);

function hareketTipLabel(tip) {
  const labels = {
    'GIRIS': 'Giriş',
    'CIKIS': 'Çıkış',
    'TRANSFER': 'Transfer',
    'FIRE': 'Fire',
    'SAYIM_FAZLA': 'Sayım Fazlası',
    'SAYIM_EKSIK': 'Sayım Eksiği',
    'URETIM_GIRDI': 'Üretim Girdisi',
    'URETIM_CIKTI': 'Üretim Çıktısı',
    'IADE': 'İade',
    'DUZELTME': 'Düzeltme'
  };
  return labels[tip] || tip;
}

async function fetchHareketler() {
  hareketlerLoading.value = true;
  try {
    const params = hareketFilterStokId.value ? { stokId: hareketFilterStokId.value } : {};
    const res = await apiCall('/stok/hareket', { params });
    hareketler.value = Array.isArray(res) ? res : [];
  } catch (err) {
    hareketler.value = [];
  } finally {
    hareketlerLoading.value = false;
  }
}

watch([hareketFilterStokId, stoklar], fetchHareketler);

const minStokDialog = ref(false);
const minStokDialogItem = ref(null);
const minStokDialogValue = ref(0);
const minStokDialogLoading = ref(false);

function openMinStokDialog(item) {
  minStokDialogItem.value = item;
  minStokDialogValue.value = item.minStokSeviye || 0;
  minStokDialog.value = true;
}

function closeMinStokDialog() {
  minStokDialog.value = false;
  minStokDialogItem.value = null;
  minStokDialogValue.value = 0;
}

async function saveMinStokDialog() {
  if (!minStokDialogItem.value) return;
  minStokDialogLoading.value = true;
  try {
    await apiCall('/stok', {
      method: 'PATCH',
      data: {
        materialId: minStokDialogItem.value.id,
        minStokSeviye: minStokDialogValue.value
      }
    });
    showSnackbar('Minimum stok başarıyla güncellendi!', 'success');
    closeMinStokDialog();
    fetchStoklar();
  } catch (err) {
    showSnackbar('Minimum stok güncellenirken hata oluştu.', 'error');
  } finally {
    minStokDialogLoading.value = false;
  }
}

const rapor = ref({});
const raporLoading = ref(false);
const raporStart = ref('');
const raporEnd = ref('');
const raporStokHeaders = [
  { title: 'Stok', key: 'stok', sortable: false },
  { title: 'Miktar', key: '_sum.miktarGram', align: 'end', sortable: true },
];

async function fetchRapor() {
  raporLoading.value = true;
  try {
    const params = { start: raporStart.value, end: raporEnd.value };
    const res = await apiCall('/stok/rapor', { params });
    rapor.value = res && typeof res === 'object' ? res : {};
  } catch (err) {
    rapor.value = {};
  } finally {
    raporLoading.value = false;
  }
}

async function consumeOrderStok(siparisId) {
  try {
    await apiCall('/stok/consume-order', {
      method: 'POST',
      data: { siparisId }
    });
    showSnackbar('Sipariş stoktan başarıyla düşüldü!', 'success');
    fetchStoklar();
    fetchHareketler();
  } catch (err) {
    showSnackbar('Stok düşümü sırasında hata oluştu.', 'error');
  }
}
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
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(93,135,255,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  text-transform: none;
}
</style>