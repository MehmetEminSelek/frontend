<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-0 border"
        style="background: #F5F7FA; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
          <v-icon size="120" color="warning">mdi-clock-alert-outline</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="warning">mdi-clock-alert-outline</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Onay Bekleyen Siparişler</h1>
                <p class="text-h6 mb-0 text-secondary">Onay bekleyen siparişleri inceleyin ve onaylayın</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="warning" variant="tonal" size="small" class="mr-2">
                <v-icon start size="16">mdi-timer-sand</v-icon>
                Beklemede
              </v-chip>
              <v-chip color="success" variant="tonal" size="small">
                <v-icon start size="16">mdi-check-decagram-outline</v-icon>
                Onayla
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-center d-flex flex-column align-center gap-3">
            <v-btn size="large" color="primary" variant="flat" @click="fetchPendingOrders" class="font-weight-bold rounded-lg">
              <v-icon left size="20">mdi-refresh</v-icon>
              Listeyi Yenile
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Main Content Card -->
    <v-card class="rounded-xl border" elevation="0">
      <v-card-title class="pa-4 bg-warning text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
              <v-icon color="white">mdi-clipboard-clock-outline</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Bekleyen Siparişler</h3>
              <p class="text-body-2 opacity-80 ma-0">{{ orders.length }} sipariş onay bekliyor</p>
            </div>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-progress-linear indeterminate color="warning" v-if="loading"></v-progress-linear>
        <v-alert type="error" v-if="error" class="mb-4" closable variant="tonal" rounded="lg">{{ error }}</v-alert>

        <div v-if="!loading && orders.length === 0 && !error">
          <v-alert type="info" variant="tonal" rounded="lg">
            <v-icon start>mdi-check-circle-outline</v-icon>
            Onay bekleyen sipariş bulunmamaktadır.
          </v-alert>
        </div>

        <v-expansion-panels v-if="!loading && orders.length > 0" variant="accordion">
        <v-expansion-panel v-for="(order, orderIndex) in orders" :key="order.id" elevation="1" class="mb-2">
          <v-expansion-panel-title>
            <v-row no-gutters align="center">
              <v-col cols="12" sm="3"> <strong>ID:</strong> {{ order.id }} </v-col>
              <v-col cols="12" sm="4"> <strong>Tarih:</strong> {{ formatDate(order.tarih, true) }} </v-col>
              <v-col cols="12" sm="5"> <strong>Müşteri:</strong> {{ order.gorunecekAd || order.gonderenAdi }} </v-col>
            </v-row>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="expansion-panel-no-padding">
            <v-list lines="one" density="compact" class="py-0">
              <v-list-item v-for="(item) in order.kalemler" :key="item.id" class="px-1 py-2 list-item-border">
                <v-row dense align="center" class="mx-0" justify="space-between">
                  <v-col cols="12" sm="6" md="6" class="d-flex align-center pl-2">
                    <v-icon size="small" class="mr-2">{{ getUrunIcon(item.urun?.ad) }}</v-icon>
                    <div class="d-flex flex-column">
                      <span class="font-weight-medium text-body-2">{{ item.urun?.ad || 'Bilinmeyen Ürün' }}</span>
                      <span class="text-caption text-grey">
                        {{ item.ambalaj?.ad }}
                        <span v-if="item.kutu"> ({{ item.kutu.ad }})</span>
                        <span v-if="item.tepsiTava"> ({{ item.tepsiTava.ad }})</span>
                        - @ {{ item.birimFiyat?.toFixed(2) || '?' }} ₺/{{ item.birim === 'Gram' ? 'KG' : item.birim }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="auto" justfy="center" md="4" class="d-flex align-center pa-4">
                    <v-text-field v-model.number="item.miktar" label="Miktar" type="number" density="compact" min="0"
                      variant="outlined" hide-details :suffix="item.birim" style="width: 140px;" />
                  </v-col>
                </v-row>
              </v-list-item>
              <v-list-item v-if="!order.kalemler || order.kalemler.length === 0">
                <v-list-item-title>Bu siparişe ait ürün bulunamadı.</v-list-item-title>
              </v-list-item>
            </v-list>
            <v-divider class="my-2"></v-divider>
            <v-card-actions class="pa-2">
              <v-spacer></v-spacer>
              <v-btn color="success" variant="flat" @click="saveChangesAndApprove(order, orderIndex)"
                :loading="approveLoading[order.id]" prepend-icon="mdi-check-decagram" size="small">
                Değişiklikleri Kabul Et ve Onayla
              </v-btn>
            </v-card-actions>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line
      elevation="24">
      {{ snackbarText }}
      <template v-slot:actions> <v-btn
          :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false"> Kapat </v-btn> </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { formatDate } from '../utils/date';
import { useAuthStore } from '../stores/auth';

const orders = ref([]); // API'den gelen siparişler (içindeki kalemler düzenlenecek)
const loading = ref(false);
const error = ref(null);
const approveLoading = reactive({}); // { orderId: boolean } - Her sipariş için ayrı loading

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true;
}

// Sadece onaylanmamışları çek
async function fetchPendingOrders() {
  loading.value = true; error.value = null; orders.value = [];
  try {
    const authStore = useAuthStore();
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
      params: { status: 'pending' },
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    // Check if response has orders array structure
    if (response.data.orders) {
      orders.value = response.data.orders; // Extract orders array from {success, count, orders}
    } else if (Array.isArray(response.data)) {
      orders.value = response.data; // Direct array response
    } else {
      orders.value = []; // Fallback
    }
    console.log('Onay bekleyen siparişler:', orders.value);
    console.log('Orders count:', orders.value.length);
  } catch (err) {
    console.error('❌ Siparişler çekilemedi:', err.response?.data || err.message || err);
    showSnackbar(`Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally { loading.value = false; }
}

onMounted(() => { fetchPendingOrders(); });

// Değişiklikleri Kaydet ve Onayla
async function saveChangesAndApprove(order, index) {
  if (!order || !order.kalemler) return;

  const orderId = order.id;
  approveLoading[orderId] = true; // Bu sipariş için loading başlat
  loading.value = true; // Genel loading

  // Backend'e gönderilecek payload'ı hazırla
  const payload = {
    onaylandiMi: true, // Onay durumunu true yap
    kalemler: order.kalemler.map(item => ({
      id: item.id, // Kalemin kendi ID'si
      miktar: parseFloat(item.miktar) || 0 // Doğrudan düzenlenen miktar
      // Diğer alanları göndermeye gerek yok, backend miktarı günceller
    }))
  };

  // Eksik ID veya geçersiz miktar kontrolü
  for (const kalem of payload.kalemler) {
    if (!kalem.id || isNaN(kalem.miktar) || kalem.miktar < 0) {
      showSnackbar(`Geçersiz kalem verisi! ID: ${kalem.id}, Miktar: ${kalem.miktar}`, 'error');
      approveLoading[orderId] = false; loading.value = false;
      return;
    }
  }

  console.log(`PUT ${import.meta.env.VITE_API_BASE_URL}/siparis/${orderId} gönderiliyor (Kaydet ve Onayla):`, payload);

  try {
    // PUT isteği ile hem kalem miktarlarını hem de onay durumunu güncelle
    const authStore = useAuthStore();
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/siparis/${orderId}`, payload, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    showSnackbar(`Sipariş ${orderId} başarıyla güncellendi ve onaylandı!`, 'success');

    // Başarılı olursa listeden kaldır
    if (index > -1) {
      orders.value.splice(index, 1);
    } else {
      fetchPendingOrders(); // Index bulunamazsa listeyi yenile
    }

  } catch (err) {
    console.error(`❌ Sipariş ${orderId} güncellenemedi/onaylanamadı:`, err.response?.data || err.message || err);
    showSnackbar(`Sipariş ${orderId} güncellenirken/onaylanırken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally {
    approveLoading[orderId] = false; // Bu sipariş için loading bitir
    loading.value = false;
  }
}

// --- Diğer Yardımcı Fonksiyonlar ---
function getAmbalajIcon(ambalajAdi) {
  if (ambalajAdi === 'Kutu') return 'mdi-package-variant-closed';
  if (ambalajAdi === 'Tepsi/Tava') return 'mdi-silverware-fork-knife';
  if (ambalajAdi === 'Özel') return 'mdi-star-outline';
  return 'mdi-help-box-outline';
}

function getUrunIcon(urunAdi) {
  if (!urunAdi) return 'mdi-help-circle-outline';
  if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone';
  if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie';
  if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles';
  return 'mdi-food-variant';
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
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,174,31,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  text-transform: none;
}

.expansion-panel-no-padding :deep(.v-expansion-panel-text__wrapper) {
  padding: 12px 16px;
}

.list-item-border:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}
</style>
