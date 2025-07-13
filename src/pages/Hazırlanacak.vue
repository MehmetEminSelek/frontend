<template>
    <v-container class="py-6 px-4" max-width="xl">
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
                <span>🍳 Hazırlanacak Ürün Kalemleri</span>
                <v-btn icon="mdi-refresh" variant="text" @click="fetchOrdersToPrepare" title="Listeyi Yenile"></v-btn>
            </v-card-title>

            <v-progress-linear indeterminate color="primary" v-if="loading"></v-progress-linear>
            <v-alert type="error" v-if="error" class="mb-4" closable>{{ error }}</v-alert>

            <div v-if="!loading && orders.length === 0 && !error">
                <v-alert type="info" variant="tonal">Hazırlanacak sipariş bulunmamaktadır.</v-alert>
            </div>

            <v-expansion-panels v-if="!loading && orders.length > 0" variant="accordion" class="mt-4">
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
                        <v-list lines="two" density="compact" class="py-0"> <v-list-item
                                v-for="(item) in order.kalemler" :key="item.id" class="px-1 py-2 list-item-border">
                                <v-row dense align="center" class="mx-0" justify="space-between"> <v-col cols="12"
                                        sm="7" md="8" class="d-flex align-center pl-2"> <v-icon size="small"
                                            class="mr-2">{{ getUrunIcon(item.urun?.ad) }}</v-icon>
                                        <div class="d-flex flex-column">
                                            <span class="font-weight-medium text-body-1">{{ item.urun?.ad ||
                                                'BilinmeyenÜrün' }}</span> <span class="text-caption text-grey">
                                                {{ item.ambalaj?.ad }}
                                                <span v-if="item.kutu"> ({{ item.kutu.ad }})</span>
                                                <span v-if="item.tepsiTava"> ({{ item.tepsiTava.ad }})</span>
                                            </span>
                                        </div>
                                    </v-col>
                                    <v-col cols="auto" justfy="center" md="4" class="d-flex align-center pa-4">
                                        <v-text-field v-model.number="item.miktar" label="Gerçekleşen" type="number"
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
                                :loading="prepareLoading[order.id]" prepend-icon="mdi-check-decagram" size="small">
                                Kaydet ve Hazırlandı İşaretle
                            </v-btn>
                        </v-card-actions>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
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
import { ref, onMounted, reactive, provide } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';
import { useRealtimeStore } from '../stores/realtime.js';

const orders = ref([]); // API'den gelen siparişler (içindeki kalemler düzenlenecek)
const loading = ref(false);
const error = ref(null);
const prepareLoading = reactive({}); // { orderId: boolean } - Her sipariş için ayrı loading

// Realtime Store
const realtimeStore = useRealtimeStore();

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

// Hazırlanacak modülüne özel tema ile Vuetify instance'ı oluştur
const hazirlanacakTheme = {
    dark: false,
    colors: {
        primary: '#FF9800', // Turuncu
        secondary: '#FFE0B2', // Açık turuncu
        accent: '#FFB74D',
        error: '#D32F2F',
        info: '#FF9800',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#FFF8E1',
        surface: '#FFFFFF',
    },
};
const hazirlanacakVuetify = createCustomVuetify({ themeName: 'hazirlanacakTheme', extraThemes: { hazirlanacakTheme } });
provide('vuetify', hazirlanacakVuetify);

function showSnackbar(text, color = 'info', timeout = 4000) {
    snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true;
}

// Hazırlanacak siparişleri çek
async function fetchOrdersToPrepare() {
    loading.value = true; error.value = null; orders.value = [];
    console.log('Fetching orders to prepare...');
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/hazirlanacak`);
        // Gelen veriyi doğrudan kullanıyoruz, miktar alanları düzenlenebilir olacak
        orders.value = response.data;
        console.log('Fetched orders for preparation:', orders.value);
    } catch (err) {
        console.error('❌ Hazırlanacak siparişler çekilemedi:', err.response?.data || err.message || err);
        showSnackbar(`Hazırlanacak siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
    } finally { loading.value = false; }
}

onMounted(() => { fetchOrdersToPrepare(); });

// Gramajları Kaydet ve Hazırlandı İşaretle
async function saveAndMarkAsPrepared(order, index) {
    if (!order || !order.kalemler) return;

    // TODO: Vue dialog ile onay alınmalı!
    // Kullanıcıya onay soralım (isteğe bağlı ama önerilir)
    // if (!confirm(`ID: ${order.id} siparişindeki gramajları kaydedip 'Hazırlandı' olarak işaretlemek istediğinizden emin misiniz?`)) {
    //     return;
    // }

    const orderId = order.id;
    prepareLoading[orderId] = true; // Bu sipariş için loading başlat
    loading.value = true; // Genel loading

    // Backend'e gönderilecek payload'ı hazırla
    // Sadece ID ve güncellenmiş miktar yeterli
    const payload = {
        hazirlanmaDurumu: "Hazırlandı", // Durumu güncelle
        kalemler: order.kalemler.map(item => ({
            id: item.id, // Kalemin kendi ID'si (güncelleme için önemli)
            miktar: parseFloat(item.miktar) || 0 // Doğrudan düzenlenen miktar
        }))
    };

    console.log(`PUT /api/siparis/${orderId} gönderiliyor (Gramaj & Hazırlandı):`, payload);

    try {
        // PUT isteği ile hem kalem miktarlarını hem de durumu güncelle
        const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/siparis/${orderId}`, payload);

        // 🐍 Stok düşümü uyarılarını kontrol et ve global toast notifications göster
        if (response.data && response.data.stokUyarilari && response.data.stokUyarilari.length > 0) {
            // Store'a stok uyarılarını ekle (yılan efektli border için)
            realtimeStore.addStockWarnings(response.data.stokUyarilari, orderId);
            
            // Her uyarı için ayrı toast notification göster
            response.data.stokUyarilari.forEach((uyari, index) => {
                setTimeout(() => {
                    if (window.showStockAlert) {
                        window.showStockAlert({
                            type: 'warning',
                            title: '🐍 Reçete Uyarısı',
                            message: uyari,
                            details: `Sipariş #${orderId} için stok düşümü yapılamadı`,
                            action: '/main/recete-yonetimi',
                            actionText: 'Reçeteler',
                            duration: 8000
                        });
                    }
                }, index * 500); // 500ms aralıklarla göster
            });
            
            // Genel başarı mesajı (snackbar olarak)
            showSnackbar(
                `Sipariş ${orderId} güncellendi! ${response.data.stokUyarilari.length} ürün için reçete eksik. ⚠️`, 
                'warning', 
                4000
            );
        } else {
            // Tam başarı durumu - toast notification
            if (window.showToast) {
                window.showToast({
                    type: 'success',
                    title: '✅ Sipariş Hazırlandı',
                    message: `Sipariş #${orderId} başarıyla hazırlandı!`,
                    details: 'Tüm stok düşümleri tamamlandı',
                    duration: 5000
                });
            }

        showSnackbar(`Sipariş ${orderId} başarıyla güncellendi ve "Hazırlandı" olarak işaretlendi!`, 'success');
        }

        // Başarılı olursa listeden kaldır
        if (index > -1) {
            orders.value.splice(index, 1);
        } else {
            fetchOrdersToPrepare(); // Index bulunamazsa listeyi yenile
        }

    } catch (err) {
        console.error(`❌ Sipariş ${orderId} güncellenemedi/hazırlanamadı:`, err.response?.data || err.message || err);
        showSnackbar(`Sipariş ${orderId} güncellenirken/hazırlanırken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
    } finally {
        prepareLoading[orderId] = false; // Bu sipariş için loading bitir
        loading.value = false;
    }
}

// --- Diğer Yardımcı Fonksiyonlar ---
function getAmbalajIcon(ambalajAdi) { if (ambalajAdi === 'Kutu') return 'mdi-package-variant-closed'; if (ambalajAdi === 'Tepsi/Tava') return 'mdi-silverware-fork-knife'; if (ambalajAdi === 'Özel') return 'mdi-star-outline'; return 'mdi-help-box-outline'; }
function getUrunIcon(urunAdi) { if (!urunAdi) return 'mdi-help-circle-outline'; if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone'; if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie'; if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles'; return 'mdi-food-variant'; }

</script>

<style scoped>
.v-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.08);
    background: #fff;
    transition: box-shadow 0.2s;
}

.v-card:hover {
    box-shadow: 0 4px 16px rgba(255, 152, 0, 0.16);
}

.v-btn {
    transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.10);
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
    background: #FFE0B2 !important;
    color: #FF9800 !important;
    font-weight: bold;
}

.v-chip {
    border-radius: 8px;
    font-weight: 500;
}

.v-card-title.bg-primary {
    background: #FF9800 !important;
    color: #fff !important;
    border-radius: 12px 12px 0 0;
}

.expansion-panel-no-padding :deep(.v-expansion-panel-text__wrapper) {
    padding: 0;
}

.list-item-border:not(:last-child) {
    border-bottom: 1px solid #e0e0e0;
}

.input-narrow {
    max-width: 120px !important;
    display: inline-block;
}
</style>