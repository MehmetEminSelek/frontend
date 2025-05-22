<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>Stok Yönetimi</span>
        <v-select v-model="selectedOp" :items="opList" item-title="ad" item-value="kod" label="Operasyon Birimi"
          style="max-width: 250px" density="compact" clearable />
        <v-btn icon="mdi-refresh" variant="text" @click="fetchStoklar" title="Yenile"></v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="stoklar" :loading="loading" item-value="id" class="elevation-1" hover
        density="comfortable" items-per-page="50" no-data-text="Stok kaydı yok." loading-text="Stoklar yükleniyor..."
        :item-class="item => item.miktarGram < item.minimumMiktarGram ? 'bg-red-lighten-5' : ''">
        <template v-slot:item.miktarGram="{ item }">
          <span :class="item.miktarGram < item.minimumMiktarGram ? 'text-error font-weight-bold' : ''">{{
            item.miktarGram.toLocaleString() }} gr</span>
          <v-icon v-if="item.miktarGram < item.minimumMiktarGram" color="error" size="16"
            class="ml-1">mdi-alert</v-icon>
        </template>
        <template v-slot:item.minimumMiktarGram="{ item }">
          <span @click="openMinStokDialog(item)" style="cursor:pointer; text-decoration:underline; color:#1976d2;">
            {{ item.minimumMiktarGram?.toLocaleString() || 0 }} gr
            <v-icon size="16" class="ml-1">mdi-pencil</v-icon>
          </span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-plus" size="small" color="success" variant="text" @click="openStokDialog(item, 'giris')"
            title="Stok Girişi"></v-btn>
          <v-btn icon="mdi-minus" size="small" color="error" variant="text" @click="openStokDialog(item, 'cikis')"
            title="Stok Çıkışı"></v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="stokDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Stok {{ stokDialogType === 'giris' ? 'Girişi' : 'Çıkışı' }}</v-card-title>
        <v-card-text>
          <div v-if="stokDialogItem">
            <div><strong>Stok:</strong> {{ stokDialogItem.hammadde?.ad || stokDialogItem.yariMamul?.ad }}</div>
            <div><strong>Operasyon Birimi:</strong> {{ stokDialogItem.operasyonBirimi?.ad }}</div>
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
          <span>{{ item.kaynakStok.hammadde?.ad || item.kaynakStok.yariMamul?.ad }}<br><small>{{
            item.kaynakStok.operasyonBirimi?.ad }}</small></span>
        </template>
        <template v-slot:item.hedef="{ item }">
          <span>{{ item.hedefStok.hammadde?.ad || item.hedefStok.yariMamul?.ad }}<br><small>{{
            item.hedefStok.operasyonBirimi?.ad }}</small></span>
        </template>
        <template v-slot:item.miktarGram="{ item }">
          <span>{{ item.miktarGram.toLocaleString() }} gr</span>
        </template>
        <template v-slot:item.createdAt="{ item }">
          <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
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
          <span>{{ item.stok.hammadde?.ad || item.stok.yariMamul?.ad }}<br><small>{{ item.stok.operasyonBirimi?.ad
          }}</small></span>
        </template>
        <template v-slot:item.tip="{ item }">
          <span>{{ hareketTipLabel(item.tip) }}</span>
        </template>
        <template v-slot:item.miktarGram="{ item }">
          <span
            :class="item.tip === 'cikis' || item.tip === 'transfer' && item.aciklama?.includes('Çıkış') ? 'text-error font-weight-bold' : (item.tip === 'giris' || item.tip === 'transfer' && item.aciklama?.includes('Giriş') ? 'text-success font-weight-bold' : '')">{{
              item.miktarGram.toLocaleString() }} gr</span>
        </template>
        <template v-slot:item.createdAt="{ item }">
          <span>{{ new Date(item.createdAt).toLocaleString() }}</span>
        </template>
        <template v-slot:item["user.ad"]="{ item }">
          <span>{{ item.user?.ad || '-' }}</span>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="minStokDialog" persistent max-width="350px">
      <v-card>
        <v-card-title class="text-h6">Minimum Stok Güncelle</v-card-title>
        <v-card-text>
          <div v-if="minStokDialogItem">
            <div><strong>Stok:</strong> {{ minStokDialogItem.ad }}</div>
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
                <span>{{ item.stok?.hammadde?.ad || item.stok?.yariMamul?.ad }}<br><small>{{
                  item.stok?.operasyonBirimi?.ad }}</small></span>
              </template>
              <template v-slot:item._sum.miktarGram="{ item }">
                <span>{{ item._sum.miktarGram?.toLocaleString() }} gr</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch, provide } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';

// Stok modülüne özel tema ile Vuetify instance'ı oluştur
const stokTheme = {
  dark: false,
  colors: {
    primary: '#388E3C', // Yeşil
    secondary: '#C8E6C9', // Açık yeşil
    accent: '#81C784',
    error: '#D32F2F',
    info: '#388E3C',
    success: '#43A047',
    warning: '#FBC02D',
    background: '#F4F8F3',
    surface: '#FFFFFF',
  },
};
const stokVuetify = createCustomVuetify({ themeName: 'stokTheme', extraThemes: { stokTheme } });
provide('vuetify', stokVuetify);

const headers = [
  { title: 'Hammadde/Yarı Mamul', key: 'ad', sortable: true },
  { title: 'Kod', key: 'kod', sortable: true },
  { title: 'Operasyon Birimi', key: 'operasyonBirimi.ad', sortable: true },
  { title: 'Stok (gr)', key: 'miktarGram', align: 'end', sortable: true },
  { title: 'Minimum Stok (gr)', key: 'minimumMiktarGram', align: 'end', sortable: true },
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
async function fetchStoklar() {
  loading.value = true; error.value = null;
  try {
    const params = selectedOp.value ? { operasyonBirimiKod: selectedOp.value } : {};
    const response = await axios.get('http://localhost:3000/api/stok', { params });
    stoklar.value = response.data.map(s => ({
      ...s,
      ad: s.hammadde?.ad || s.yariMamul?.ad || '-',
      kod: s.hammadde?.kod || s.yariMamul?.kod || '-',
    }));
  } catch (err) {
    error.value = 'Stoklar yüklenirken hata oluştu.';
    stoklar.value = [];
  } finally {
    loading.value = false;
  }
}
onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user && user.role === 'admin';
  if (!user || (user.role !== 'admin' && user.role !== 'mudur')) {
    showSnackbar('Bu sayfaya erişim için yetkiniz yok.', 'error');
    setTimeout(() => { window.location.href = '/login'; }, 2000);
    return;
  }
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }
  fetchStoklar();
  fetchTransferHistory();
  fetchHareketler();
  fetchRapor();
});
watch(selectedOp, fetchStoklar);
// Stok Giriş/Çıkış Dialog
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
    await axios.post('http://localhost:3000/api/stok', {
      stokId: stokDialogItem.value.id,
      miktar: stokDialogMiktar.value,
      tip: stokDialogType.value,
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
// Snackbar
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
// Stok Transfer Dialog
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
    await axios.post('http://localhost:3000/api/stok/transfer', transferForm.value);
    showSnackbar('Transfer başarıyla tamamlandı!', 'success');
    closeTransferDialog();
    fetchStoklar();
    fetchTransferHistory();
  } catch (err) {
    showSnackbar(err.response?.data?.message || 'Transfer sırasında hata oluştu.', 'error');
  } finally {
    transferDialogLoading.value = false;
  }
}
async function fetchTransferHistory() {
  transferHistoryLoading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/api/stok/transfer');
    transferHistory.value = res.data;
  } catch (err) {
    transferHistory.value = [];
  } finally {
    transferHistoryLoading.value = false;
  }
}
// Hareketler
const hareketler = ref([]);
const hareketlerLoading = ref(false);
const hareketHeaders = [
  { title: 'Stok', key: 'stok', sortable: false },
  { title: 'Operasyon Birimi', key: 'stok.operasyonBirimi.ad', sortable: true },
  { title: 'Kullanıcı', key: 'user.ad', sortable: true },
  { title: 'Tip', key: 'tip', sortable: true },
  { title: 'Miktar', key: 'miktarGram', align: 'end', sortable: true },
  { title: 'Açıklama', key: 'aciklama', sortable: false },
  { title: 'Tarih', key: 'createdAt', sortable: true },
];
const hareketFilterStokId = ref(null);
function hareketTipLabel(tip) {
  if (tip === 'giris') return 'Giriş';
  if (tip === 'cikis') return 'Çıkış';
  if (tip === 'transfer') return 'Transfer';
  return tip;
}
async function fetchHareketler() {
  hareketlerLoading.value = true;
  try {
    const params = hareketFilterStokId.value ? { stokId: hareketFilterStokId.value } : {};
    const res = await axios.get('http://localhost:3000/api/stok/hareket', { params });
    hareketler.value = res.data;
  } catch (err) {
    hareketler.value = [];
  } finally {
    hareketlerLoading.value = false;
  }
}
watch([hareketFilterStokId, stoklar], fetchHareketler);
// Minimum Stok Dialog
const minStokDialog = ref(false);
const minStokDialogItem = ref(null);
const minStokDialogValue = ref(0);
const minStokDialogLoading = ref(false);
function openMinStokDialog(item) {
  minStokDialogItem.value = item;
  minStokDialogValue.value = item.minimumMiktarGram || 0;
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
    await axios.patch('http://localhost:3000/api/stok', { stokId: minStokDialogItem.value.id, minimumMiktarGram: minStokDialogValue.value });
    showSnackbar('Minimum stok başarıyla güncellendi!', 'success');
    closeMinStokDialog();
    fetchStoklar();
  } catch (err) {
    showSnackbar('Minimum stok güncellenirken hata oluştu.', 'error');
  } finally {
    minStokDialogLoading.value = false;
  }
}
// Raporlar
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
    const res = await axios.get('http://localhost:3000/api/stok/rapor', { params: { start: raporStart.value, end: raporEnd.value } });
    rapor.value = res.data;
  } catch (err) {
    rapor.value = {};
  } finally {
    raporLoading.value = false;
  }
}
// Siparişe göre stoktan otomatik düşüm fonksiyonu (örnek buton ve fonksiyon)
async function consumeOrderStok(siparisId) {
  try {
    await axios.post('http://localhost:3000/api/stok/consume-order', { siparisId });
    showSnackbar('Sipariş stoktan başarıyla düşüldü!', 'success');
    fetchStoklar();
    fetchHareketler(); // HAREKETLERİ GÜNCELLE
  } catch (err) {
    showSnackbar('Stok düşümü sırasında hata oluştu.', 'error');
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.08);
  background: #fff;
  transition: box-shadow 0.2s;
}

.v-card:hover {
  box-shadow: 0 4px 16px rgba(56, 142, 60, 0.16);
}

.v-btn {
  transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(56, 142, 60, 0.10);
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
  background: #C8E6C9 !important;
  color: #388E3C !important;
  font-weight: bold;
}

.v-chip {
  border-radius: 8px;
  font-weight: 500;
}

.v-card-title.bg-primary {
  background: #388E3C !important;
  color: #fff !important;
  border-radius: 12px 12px 0 0;
}
</style>