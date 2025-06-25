<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-4" 
                style="background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 50%, #81D4FA 100%); color: #0D47A1; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
                    <v-icon size="120">mdi-factory</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="#1565C0">mdi-chart-timeline-variant</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1" style="color: #0D47A1;">Üretim Planı & Maliyet</h1>
                                <p class="text-h6 mb-0" style="color: #1565C0; opacity: 0.8;">Sipariş bazlı üretim durumu ve karlılık analizi</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="rgba(13, 71, 161, 0.15)" size="small" class="mr-2" style="color: #0D47A1;">
                                <v-icon start size="16" color="#1565C0">mdi-clock-outline</v-icon>
                                Gerçek Zamanlı
                            </v-chip>
                            <v-chip color="rgba(13, 71, 161, 0.15)" size="small" style="color: #0D47A1;">
                                <v-icon start size="16" color="#1565C0">mdi-cash</v-icon>
                                Maliyet Analizi
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <v-btn size="x-large" color="white" variant="elevated" @click="fetchData" :loading="loading"
                            class="font-weight-bold" style="color: #1565C0 !important; box-shadow: 0 4px 12px rgba(21, 101, 192, 0.2);">
                            <v-icon left size="20">mdi-refresh</v-icon>
                            Verileri Yenile
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Filters Section -->
        <v-card class="mb-6 rounded-xl" elevation="1" style="border: 1px solid #E3F2FD;">
            <v-card-title class="d-flex align-center py-4">
                <v-icon color="#1565C0" class="mr-2">mdi-calendar-range</v-icon>
                <span class="text-h6 font-weight-bold" style="color: #0D47A1;">Tarih Aralığı</span>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field 
                            v-model="startDate" 
                            label="Başlangıç Tarihi" 
                            type="date"
                            prepend-inner-icon="mdi-calendar-start"
                            variant="outlined" 
                            density="comfortable"
                            color="#42A5F5"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field 
                            v-model="endDate" 
                            label="Bitiş Tarihi" 
                            type="date"
                            prepend-inner-icon="mdi-calendar-end"
                            variant="outlined"
                            density="comfortable"
                            color="#42A5F5"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="4" class="d-flex align-center">
                        <v-btn color="#42A5F5" variant="outlined" @click="fetchData" :loading="loading"
                            prepend-icon="mdi-chart-line" class="flex-grow-1">
                            Raporu Getir
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Summary Cards -->
        <v-row class="mb-6">
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #FFECB3 0%, #FFD54F 100%); color: #E65100; border: 1px solid #FFE0B2;">
                    <v-icon size="40" class="mb-2">mdi-clock-fast</v-icon>
                    <div class="text-h4 font-weight-bold">{{ data?.genel?.bekleyenMaliyet ? formatCurrency(data.genel.bekleyenMaliyet) : '₺0' }}</div>
                    <div class="text-body-2">Bekleyen Maliyet</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%); color: #2E7D32; border: 1px solid #E8F5E9;">
                    <v-icon size="40" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-h4 font-weight-bold">{{ data?.genel?.toplamCiro ? formatCurrency(data.genel.toplamCiro) : '₺0' }}</div>
                    <div class="text-body-2">Toplam Ciro</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #E1BEE7 0%, #CE93D8 100%); color: #6A1B9A; border: 1px solid #F3E5F5;">
                    <v-icon size="40" class="mb-2">mdi-trending-up</v-icon>
                    <div class="text-h4 font-weight-bold">{{ data?.hazırlananlar?.toplam?.toplamKar ? formatCurrency(data.hazırlananlar.toplam.toplamKar) : '₺0' }}</div>
                    <div class="text-body-2">Toplam Kar</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #BBDEFB 0%, #90CAF9 100%); color: #1565C0; border: 1px solid #E3F2FD;">
                    <v-icon size="40" class="mb-2">mdi-package-variant</v-icon>
                    <div class="text-h4 font-weight-bold">{{ data?.genel?.toplamSiparis || 0 }}</div>
                    <div class="text-body-2">Toplam Sipariş</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Main Content Tabs -->
        <v-card class="rounded-xl" elevation="2" style="border: 1px solid #E3F2FD;">
            <v-tabs v-model="activeTab" grow style="border-radius: 8px 8px 0 0;">
                <v-tab value="hazirlanacak" style="color: #E65100;">
                    <v-icon start>mdi-clock-fast</v-icon>
                    Hazırlanacaklar ({{ data?.hazirlanacaklar?.siparisler?.length || 0 }})
                </v-tab>
                <v-tab value="hazırlanan" style="color: #2E7D32;">
                    <v-icon start>mdi-check-circle</v-icon>
                    Hazırlananlar ({{ data?.hazırlananlar?.siparisler?.length || 0 }})
                </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
                <!-- Hazırlanacaklar Tab -->
                <v-window-item value="hazirlanacak">
                    <v-card-text class="pa-4">
                        <v-alert v-if="error" type="error" class="mb-4" closable style="border-radius: 8px;">{{ error }}</v-alert>

                        <!-- Malzeme İhtiyacı Özeti -->
                        <div v-if="data?.hazirlanacaklar?.toplam?.malzemeIhtiyaci?.length" class="mb-6">
                            <h3 class="text-h6 font-weight-bold mb-3" style="color: #E65100;">
                                <v-icon class="mr-2" color="#E65100">mdi-package-variant</v-icon>
                                Toplam Malzeme İhtiyacı
                            </h3>
                            <v-row>
                                <v-col v-for="malzeme in data.hazirlanacaklar.toplam.malzemeIhtiyaci.slice(0, 6)" 
                                    :key="malzeme.stokKod" cols="12" md="4">
                                    <v-card variant="outlined" class="pa-3">
                                        <div class="d-flex justify-space-between align-center">
                                            <div>
                                                <div class="font-weight-bold">{{ malzeme.ad }}</div>
                                                <div class="text-caption">{{ malzeme.stokKod }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-weight-bold" style="color: #E65100;">
                                                    {{ formatWeight(malzeme.miktar) }}
                                                </div>
                                                <div class="text-caption">{{ formatCurrency(malzeme.toplamMaliyet) }}</div>
                                            </div>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Hazırlanacak Siparişler Tablosu -->
                        <h3 class="text-h6 font-weight-bold mb-3" style="color: #E65100;">
                            <v-icon class="mr-2" color="#E65100">mdi-list-box</v-icon>
                            Hazırlanacak Siparişler
                        </h3>
                        <v-data-table 
                            :headers="hazirlanacakHeaders" 
                            :items="data?.hazirlanacaklar?.siparisler || []" 
                            :loading="loading"
                            class="pending-table rounded-lg"
                            density="comfortable"
                            items-per-page="10">
                            
                            <template v-slot:item.tarih="{ item }">
                                <span class="text-body-2">{{ formatDate(item.tarih) }}</span>
                            </template>

                            <template v-slot:item.musteri="{ item }">
                                <div>
                                    <div class="font-weight-medium">{{ item.cari?.ad || item.gonderenAdi }}</div>
                                    <div class="text-caption">{{ item.cari?.telefon || item.gonderenTel }}</div>
                                </div>
                            </template>

                            <template v-slot:item.urunler="{ item }">
                                <div>
                                    <v-chip v-for="kalem in item.kalemler.slice(0, 2)" :key="kalem.id" 
                                        size="x-small" class="ma-1" color="#FFE0B2" style="color: #E65100;">
                                        {{ kalem.urun.ad }} ({{ kalem.miktar }}{{ kalem.birim }})
                                    </v-chip>
                                    <span v-if="item.kalemler.length > 2" class="text-caption">
                                        +{{ item.kalemler.length - 2 }} daha
                                    </span>
                                </div>
                            </template>

                            <template v-slot:item.maliyet="{ item }">
                                <div class="text-h6 font-weight-bold" style="color: #E65100;">
                                    {{ formatCurrency(item.maliyet?.toplam || 0) }}
                                </div>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon="mdi-eye" size="small" color="#42A5F5" variant="text" 
                                    @click="showSiparisDetay(item)" title="Detay Görüntüle"></v-btn>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-window-item>

                <!-- Hazırlananlar Tab -->
                <v-window-item value="hazırlanan">
                    <v-card-text class="pa-4">
                        <!-- Kullanılan Malzemeler Özeti -->
                        <div v-if="data?.hazırlananlar?.toplam?.kullanılanMalzemeler?.length" class="mb-6">
                            <h3 class="text-h6 font-weight-bold mb-3" style="color: #2E7D32;">
                                <v-icon class="mr-2" color="#2E7D32">mdi-check-circle</v-icon>
                                Kullanılan Malzemeler
                            </h3>
                            <v-row>
                                <v-col v-for="malzeme in data.hazırlananlar.toplam.kullanılanMalzemeler.slice(0, 6)" 
                                    :key="malzeme.stokKod" cols="12" md="4">
                                    <v-card variant="outlined" class="pa-3">
                                        <div class="d-flex justify-space-between align-center">
                                            <div>
                                                <div class="font-weight-bold">{{ malzeme.ad }}</div>
                                                <div class="text-caption">{{ malzeme.stokKod }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-weight-bold" style="color: #2E7D32;">
                                                    {{ formatWeight(malzeme.miktar) }}
                                                </div>
                                                <div class="text-caption">{{ formatCurrency(malzeme.toplamMaliyet) }}</div>
                                            </div>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Hazırlanan Siparişler Tablosu -->
                        <h3 class="text-h6 font-weight-bold mb-3" style="color: #2E7D32;">
                            <v-icon class="mr-2" color="#2E7D32">mdi-check-all</v-icon>
                            Hazırlanan Siparişler
                        </h3>
                        <v-data-table 
                            :headers="hazırlananHeaders" 
                            :items="data?.hazırlananlar?.siparisler || []" 
                            :loading="loading"
                            class="completed-table rounded-lg"
                            density="comfortable"
                            items-per-page="10">
                            
                            <template v-slot:item.tarih="{ item }">
                                <span class="text-body-2">{{ formatDate(item.tarih) }}</span>
                            </template>

                            <template v-slot:item.hazirlanmaTarihi="{ item }">
                                <span class="text-body-2">{{ formatDate(item.updatedAt) }}</span>
                            </template>

                            <template v-slot:item.musteri="{ item }">
                                <div>
                                    <div class="font-weight-medium">{{ item.cari?.ad || item.gonderenAdi }}</div>
                                    <div class="text-caption">{{ item.cari?.telefon || item.gonderenTel }}</div>
                                </div>
                            </template>

                            <template v-slot:item.urunler="{ item }">
                                <div>
                                    <v-chip v-for="kalem in item.kalemler.slice(0, 2)" :key="kalem.id" 
                                        size="x-small" class="ma-1" color="#C8E6C9" style="color: #2E7D32;">
                                        {{ kalem.urun.ad }} ({{ kalem.miktar }}{{ kalem.birim }})
                                    </v-chip>
                                    <span v-if="item.kalemler.length > 2" class="text-caption">
                                        +{{ item.kalemler.length - 2 }} daha
                                    </span>
                                </div>
                            </template>

                            <template v-slot:item.maliyet="{ item }">
                                <div class="font-weight-bold" style="color: #D32F2F;">
                                    {{ formatCurrency(item.maliyet?.toplam || 0) }}
                                </div>
                            </template>

                            <template v-slot:item.satis="{ item }">
                                <div class="font-weight-bold" style="color: #1976D2;">
                                    {{ formatCurrency(item.satis?.toplam || 0) }}
                                </div>
                            </template>

                            <template v-slot:item.kar="{ item }">
                                <div class="font-weight-bold" :style="{ color: (item.kar || 0) >= 0 ? '#2E7D32' : '#D32F2F' }">
                                    {{ formatCurrency(item.kar || 0) }}
                                </div>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon="mdi-eye" size="small" color="#42A5F5" variant="text" 
                                    @click="showSiparisDetay(item)" title="Detay Görüntüle"></v-btn>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-window-item>
            </v-window>
        </v-card>

        <!-- Sipariş Detay Dialog -->
        <v-dialog v-model="detayDialog" max-width="800px">
            <v-card v-if="selectedSiparis" style="border-radius: 16px;">
                <v-card-title class="text-h5" style="background: linear-gradient(135deg, #42A5F5 0%, #1976D2 100%); color: white;">
                    <v-icon class="mr-2">mdi-receipt</v-icon>
                    Sipariş Detayı #{{ selectedSiparis.id }}
                </v-card-title>
                <v-card-text class="pa-6">
                    <!-- Sipariş Bilgileri -->
                    <v-row class="mb-4">
                        <v-col cols="6">
                            <strong>Müşteri:</strong> {{ selectedSiparis.cari?.ad || selectedSiparis.gonderenAdi }}
                        </v-col>
                        <v-col cols="6">
                            <strong>Tarih:</strong> {{ formatDate(selectedSiparis.tarih) }}
                        </v-col>
                        <v-col cols="6">
                            <strong>Durum:</strong> {{ selectedSiparis.hazirlanmaDurumu }}
                        </v-col>
                        <v-col cols="6">
                            <strong>Teslimat:</strong> {{ selectedSiparis.teslimatTuru?.ad }}
                        </v-col>
                    </v-row>

                    <!-- Ürün Detayları -->
                    <h4 class="mb-3">Ürün Detayları</h4>
                    <v-table density="compact" class="mb-4">
                        <thead>
                            <tr>
                                <th>Ürün</th>
                                <th>Miktar</th>
                                <th>Birim Maliyet</th>
                                <th>Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="kalem in selectedSiparis.maliyet?.kalemler || []" :key="kalem.urunAd">
                                <td>{{ kalem.urunAd }}</td>
                                <td>{{ kalem.miktar }} {{ kalem.birim }}</td>
                                <td>{{ formatCurrency(kalem.birimMaliyet) }}</td>
                                <td>{{ formatCurrency(kalem.toplamMaliyet) }}</td>
                            </tr>
                        </tbody>
                    </v-table>

                    <!-- Maliyet Özeti -->
                    <v-row>
                        <v-col cols="6">
                            <div class="text-subtitle-1 font-weight-bold">Maliyet Özeti:</div>
                            <div>Ürün Maliyeti: {{ formatCurrency((selectedSiparis.maliyet?.toplam || 0) - (selectedSiparis.maliyet?.kargoUcreti || 0) - (selectedSiparis.maliyet?.digerMasraflar || 0)) }}</div>
                            <div>Kargo: {{ formatCurrency(selectedSiparis.maliyet?.kargoUcreti || 0) }}</div>
                            <div>Diğer: {{ formatCurrency(selectedSiparis.maliyet?.digerMasraflar || 0) }}</div>
                            <div class="font-weight-bold">Toplam: {{ formatCurrency(selectedSiparis.maliyet?.toplam || 0) }}</div>
                        </v-col>
                        <v-col v-if="selectedSiparis.satis" cols="6">
                            <div class="text-subtitle-1 font-weight-bold">Satış & Kar:</div>
                            <div>Satış Tutarı: {{ formatCurrency(selectedSiparis.satis?.toplam || 0) }}</div>
                            <div>Maliyet: {{ formatCurrency(selectedSiparis.maliyet?.toplam || 0) }}</div>
                            <div class="font-weight-bold" :style="{ color: (selectedSiparis.kar || 0) >= 0 ? '#2E7D32' : '#D32F2F' }">
                                Kar: {{ formatCurrency(selectedSiparis.kar || 0) }}
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-spacer />
                    <v-btn variant="text" @click="detayDialog = false" style="color: #1976D2;">Kapat</v-btn>
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
import { ref, provide, onMounted } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';

// Üretim Planı modülüne özel tema
const uretimPlaniTheme = {
    dark: false,
    colors: {
        primary: '#2196F3',
        secondary: '#A5D6A7',
        accent: '#64B5F6',
        error: '#D32F2F',
        info: '#2196F3',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};
const uretimPlaniVuetify = createCustomVuetify({ themeName: 'uretimPlaniTheme', customTheme: uretimPlaniTheme });
provide('vuetify', uretimPlaniVuetify);

// State
const loading = ref(false);
const data = ref(null);
const error = ref(null);
const activeTab = ref('hazirlanacak');
const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));

// Dialog
const detayDialog = ref(false);
const selectedSiparis = ref(null);

// Snackbar
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

// Table Headers
const hazirlanacakHeaders = [
    { title: 'Sipariş ID', key: 'id', width: '100px' },
    { title: 'Tarih', key: 'tarih', width: '120px' },
    { title: 'Müşteri', key: 'musteri', width: '200px' },
    { title: 'Ürünler', key: 'urunler', width: '300px' },
    { title: 'Maliyet', key: 'maliyet', align: 'end', width: '120px' },
    { title: 'İşlemler', key: 'actions', sortable: false, align: 'center', width: '100px' }
];

const hazırlananHeaders = [
    { title: 'Sipariş ID', key: 'id', width: '100px' },
    { title: 'Sipariş Tarihi', key: 'tarih', width: '120px' },
    { title: 'Hazırlanma', key: 'hazirlanmaTarihi', width: '120px' },
    { title: 'Müşteri', key: 'musteri', width: '180px' },
    { title: 'Ürünler', key: 'urunler', width: '250px' },
    { title: 'Maliyet', key: 'maliyet', align: 'end', width: '100px' },
    { title: 'Satış', key: 'satis', align: 'end', width: '100px' },
    { title: 'Kar', key: 'kar', align: 'end', width: '100px' },
    { title: 'İşlemler', key: 'actions', sortable: false, align: 'center', width: '100px' }
];

// Functions
function formatCurrency(amount) {
    if (amount == null) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
    }).format(amount);
}

function formatWeight(grams) {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(1)} kg`;
    }
    return `${Math.round(grams)} gr`;
}

function showSnackbar(text, color = 'info', timeout = 4000) {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbarTimeout.value = timeout;
    snackbar.value = true;
}

function showSiparisDetay(siparis) {
    selectedSiparis.value = siparis;
    detayDialog.value = true;
}

async function fetchData() {
    loading.value = true;
    error.value = null;
    
    try {
        console.log('🔄 Üretim planı verileri yükleniyor...');
        
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/uretim-plani`, {
            startDate: startDate.value,
            endDate: endDate.value
        });

        console.log('📦 API Yanıtı:', response.data);

        if (response.data.success) {
            data.value = response.data.data;
            showSnackbar('Veriler başarıyla yüklendi!', 'success');
        } else {
            throw new Error(response.data.error || 'Veri alınamadı');
        }
    } catch (err) {
        console.error('❌ Üretim planı hatası:', err);
        error.value = err.response?.data?.error || err.message || 'Veriler yüklenirken hata oluştu';
        showSnackbar(error.value, 'error');
    } finally {
        loading.value = false;
    }
}

// Initialize
onMounted(() => {
    fetchData();
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
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(13,71,161,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

.pending-table th {
    background: #FFE0B2 !important;
    color: #E65100 !important;
    font-weight: 600 !important;
}

.pending-table tbody tr:hover {
    background: rgba(230, 81, 0, 0.03) !important;
}

.completed-table th {
    background: #C8E6C9 !important;
    color: #2E7D32 !important;
    font-weight: 600 !important;
}

.completed-table tbody tr:hover {
    background: rgba(46, 125, 50, 0.03) !important;
}

.v-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>