<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-0 border"
                style="background: #F5F7FA; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
                    <v-icon size="120" color="success">mdi-chef-hat</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="success">mdi-chef-hat</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Hazırlanacak Siparişler</h1>
                                <p class="text-h6 mb-0 text-secondary">Ürün kalemlerini hazırlayın ve işaretleyin</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="success" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="16">mdi-food-variant</v-icon>
                                Hazırla
                            </v-chip>
                            <v-chip color="info" variant="tonal" size="small">
                                <v-icon start size="16">mdi-package-variant-closed-check</v-icon>
                                Stok Düşümü
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center d-flex flex-column align-center gap-3">
                        <v-btn size="large" color="primary" variant="flat" @click="fetchOrdersToPrepare" class="font-weight-bold rounded-lg">
                            <v-icon left size="20">mdi-refresh</v-icon>
                            Listeyi Yenile
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Main Content Card -->
        <v-card class="rounded-xl border" elevation="0">
            <v-card-title class="pa-4 bg-success text-white">
                <div class="d-flex align-center justify-space-between w-100">
                    <div class="d-flex align-center">
                        <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                            <v-icon color="white">mdi-clipboard-check-outline</v-icon>
                        </v-avatar>
                        <div>
                            <h3 class="text-h6 font-weight-bold">Hazırlanacak Siparişler</h3>
                            <p class="text-body-2 opacity-80 ma-0">{{ orders.length }} sipariş hazırlanmayı bekliyor</p>
                        </div>
                    </div>
                </div>
            </v-card-title>

            <v-card-text class="pa-4">
                <v-progress-linear indeterminate color="success" v-if="loading"></v-progress-linear>
                <v-alert type="error" v-if="error" class="mb-4" closable variant="tonal" rounded="lg">{{ error }}</v-alert>

                <div v-if="!loading && orders.length === 0 && !error">
                    <v-alert type="info" variant="tonal" rounded="lg">
                        <v-icon start>mdi-check-circle-outline</v-icon>
                        Hazırlanacak sipariş bulunmamaktadır.
                    </v-alert>
                </div>

                <v-expansion-panels v-if="!loading && orders.length > 0" variant="accordion">
                <v-expansion-panel v-for="(order, orderIndex) in orders" :key="order.id" elevation="1" class="mb-2">
                    <v-expansion-panel-title>
                        <v-row no-gutters align="center">
                            <v-col cols="12" sm="3"> <strong>ID:</strong> {{ order.id }} </v-col>
                            <v-col cols="12" sm="4"> <strong>Tarih:</strong> {{ formatDate(order.tarih, true) }}
                            </v-col>
                            <v-col cols="12" sm="5"> <strong>Müşteri:</strong> {{ order.gorunecekAd || order.gonderenAdi
                                }} </v-col>
                        </v-row>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text class="expansion-panel-no-padding">
                        <v-list lines="one" density="compact" class="py-0">
                            <v-list-item v-for="(item) in order.kalemler" :key="item.id"
                                class="px-1 py-2 list-item-border">
                                <v-row dense align="center" class="mx-0" justify="space-between">
                                    <v-col cols="12" sm="6" md="6" class="d-flex align-center pl-2">
                                        <v-icon size="small" class="mr-2">{{ getUrunIcon(item.urun?.ad) }}</v-icon>
                                        <div class="d-flex flex-column">
                                            <span class="font-weight-medium text-body-2">{{ item.urun?.ad || 'Bilinmeyen Ürün' }}</span>
                                            <span class="text-caption text-grey">
                                                {{ item.ambalaj?.ad }}
                                                <span v-if="item.kutu"> ({{ item.kutu.ad }})</span>
                                                <span v-if="item.tepsiTava"> ({{ item.tepsiTava.ad }})</span>
                                                - @ {{ item.birimFiyat?.toFixed(2) || '?' }} ₺/{{ item.birim === 'Gram'
                                                ? 'KG' : item.birim }}
                                            </span>
                                        </div>
                                    </v-col>
                                    <v-col cols="auto" justfy="center" md="4" class="d-flex align-center pa-4">
                                        <v-text-field v-model.number="item.miktar" label="Miktar" type="number"
                                            density="compact" min="0" variant="outlined" hide-details
                                            :suffix="item.birim" style="width: 140px;" />
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
                            <v-btn color="success" variant="flat" @click="saveAndMarkAsPrepared(order, orderIndex)"
                                :loading="prepareLoading[order.id]" prepend-icon="mdi-check-decagram" size="small" class="rounded-lg">
                                Kaydet ve Hazırlandı İşaretle
                            </v-btn>
                        </v-card-actions>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
            </v-card-text>
        </v-card>

        <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right"
            multi-line elevation="24">
            {{ snackbarText }}
            <template v-slot:actions> <v-btn
                    :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'"
                    variant="text" @click="snackbar = false"> Kapat </v-btn> </template>
        </v-snackbar>

    </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';
import { formatDate } from '../utils/date';
import { useAuthStore } from '../stores/auth';
import { useRealtimeStore } from '../stores/realtime.js';

const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const prepareLoading = reactive({});
const realtimeStore = useRealtimeStore();
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

function showSnackbar(text, color = 'info', timeout = 4000) {
    snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true;
}

async function fetchOrdersToPrepare() {
    loading.value = true; error.value = null; orders.value = [];
    try {
        const authStore = useAuthStore();
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hazirlanacak`, {
            headers: { 'Authorization': `Bearer ${authStore.accessToken}`, 'Content-Type': 'application/json' }
        });
        if (response.data.orders) { orders.value = response.data.orders; } else { orders.value = response.data; }
    } catch (err) {
        console.error('❌ Hazırlanacak siparişler çekilemedi:', err.response?.data || err.message || err);
        showSnackbar(`Hazırlanacak siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
    } finally { loading.value = false; }
}

onMounted(() => { fetchOrdersToPrepare(); });

async function saveAndMarkAsPrepared(order, index) {
    if (!order || !order.kalemler) return;
    const orderId = order.id;
    prepareLoading[orderId] = true;
    loading.value = true;
    const payload = { hazirlanmaDurumu: "Hazırlandı", kalemler: order.kalemler.map(item => ({ id: item.id, miktar: parseFloat(item.miktar) || 0 })) };

    try {
        const authStore = useAuthStore();
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/siparis/${orderId}`, payload, {
            headers: { 'Authorization': `Bearer ${authStore.accessToken}`, 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.stokUyarilari && response.data.stokUyarilari.length > 0) {
            realtimeStore.addStockWarnings(response.data.stokUyarilari, orderId);
            response.data.stokUyarilari.forEach((uyari, index) => {
                setTimeout(() => {
                    if (window.showStockAlert) {
                        window.showStockAlert({ type: 'warning', title: '🐍 Reçete Uyarısı', message: uyari, details: `Sipariş #${orderId} için stok düşümü yapılamadı`, action: '/main/recete-yonetimi', actionText: 'Reçeteler', duration: 8000 });
                    }
                }, index * 500);
            });
            showSnackbar(`Sipariş ${orderId} güncellendi! ${response.data.stokUyarilari.length} ürün için reçete eksik. ⚠️`, 'warning', 4000);
        } else {
            if (window.showToast) {
                window.showToast({ type: 'success', title: '✅ Sipariş Hazırlandı', message: `Sipariş #${orderId} başarıyla hazırlandı!`, details: 'Tüm stok düşümleri tamamlandı', duration: 5000 });
            }
            showSnackbar(`Sipariş ${orderId} başarıyla güncellendi ve "Hazırlandı" olarak işaretlendi!`, 'success');
        }

        if (index > -1) { orders.value.splice(index, 1); } else { fetchOrdersToPrepare(); }
    } catch (err) {
        console.error(`❌ Sipariş ${orderId} güncellenemedi/hazırlanamadı:`, err.response?.data || err.message || err);
        showSnackbar(`Sipariş ${orderId} güncellenirken/hazırlanırken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
    } finally {
        prepareLoading[orderId] = false;
        loading.value = false;
    }
}

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
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(19,222,185,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
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