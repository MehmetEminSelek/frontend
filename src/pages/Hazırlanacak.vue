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
                            <v-col cols="12" sm="4"> <strong>Tarih:</strong> {{ formatDate(order.tarih) }} </v-col>
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
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const orders = ref([]); // API'den gelen siparişler (içindeki kalemler düzenlenecek)
const loading = ref(false);
const error = ref(null);
const prepareLoading = reactive({}); // { orderId: boolean } - Her sipariş için ayrı loading

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

function showSnackbar(text, color = 'info', timeout = 4000) {
    snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true;
}

// Hazırlanacak siparişleri çek
async function fetchOrdersToPrepare() {
    loading.value = true; error.value = null; orders.value = [];
    console.log('Fetching orders to prepare...');
    try {
        const response = await axios.get('http://localhost:3000/api/hazirlanacak');
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

    // Kullanıcıya onay soralım (isteğe bağlı ama önerilir)
    if (!confirm(`ID: ${order.id} siparişindeki gramajları kaydedip 'Hazırlandı' olarak işaretlemek istediğinizden emin misiniz?`)) {
        return;
    }

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
        await axios.put(`http://localhost:3000/api/siparis/${orderId}`, payload);

        showSnackbar(`Sipariş ${orderId} başarıyla güncellendi ve "Hazırlandı" olarak işaretlendi!`, 'success');

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
function formatDate(dateString) {
    if (!dateString) return '';
    try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Geçersiz Tarih'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}.${month}.${year}`; } catch (e) { console.error("Tarih formatlama hatası:", e); return 'Hatalı Tarih'; }
}
function getAmbalajIcon(ambalajAdi) { if (ambalajAdi === 'Kutu') return 'mdi-package-variant-closed'; if (ambalajAdi === 'Tepsi/Tava') return 'mdi-silverware-fork-knife'; if (ambalajAdi === 'Özel') return 'mdi-star-outline'; return 'mdi-help-box-outline'; }
function getUrunIcon(urunAdi) { if (!urunAdi) return 'mdi-help-circle-outline'; if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone'; if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie'; if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles'; return 'mdi-food-variant'; }

</script>

<style scoped>
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