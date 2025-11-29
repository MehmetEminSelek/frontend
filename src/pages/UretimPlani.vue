<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-0 border"
                style="background: #F5F7FA; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
                    <v-icon size="120" color="primary">mdi-factory</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="primary">mdi-chart-timeline-variant</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Üretim Planı & Maliyet</h1>
                                <p class="text-h6 mb-0 text-secondary">Sipariş bazlı üretim durumu ve karlılık analizi</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="primary" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="16">mdi-clock-outline</v-icon>
                                Gerçek Zamanlı
                            </v-chip>
                            <v-chip color="success" variant="tonal" size="small">
                                <v-icon start size="16">mdi-cash</v-icon>
                                Maliyet Analizi
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <v-btn size="large" color="primary" variant="flat" @click="fetchData" :loading="loading"
                            class="rounded-lg font-weight-bold" prepend-icon="mdi-refresh">
                            Verileri Yenile
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Filters Section -->
        <v-card class="mb-6 rounded-xl border" elevation="0">
            <v-card-title class="pa-4 bg-grey-lighten-4">
                <div class="d-flex align-center">
                    <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
                        <v-icon size="20">mdi-calendar-range</v-icon>
                    </v-avatar>
                    <span class="text-body-1 font-weight-medium">Tarih Aralığı</span>
                </div>
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row align="center">
                    <v-col cols="12" md="4">
                        <v-text-field v-model="startDate" label="Başlangıç Tarihi" type="date"
                            prepend-inner-icon="mdi-calendar-start" variant="outlined" density="compact"
                            color="primary" hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="endDate" label="Bitiş Tarihi" type="date"
                            prepend-inner-icon="mdi-calendar-end" variant="outlined" density="compact"
                            color="primary" hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-btn color="primary" variant="flat" @click="fetchData" :loading="loading"
                            prepend-icon="mdi-magnify" class="rounded-lg" size="large" block>
                            Raporu Getir
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Summary Cards -->
        <v-row class="mb-6">
            <v-col cols="12" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="warning" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="warning">mdi-clock-fast</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold text-warning">{{ data?.genel?.bekleyenMaliyet ?
                                formatCurrency(data.genel.bekleyenMaliyet) : '₺0' }}</div>
                            <div class="text-subtitle-2 text-grey">Bekleyen Maliyet</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="success">mdi-check-circle-outline</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold text-success">{{ data?.genel?.toplamCiro ?
                                formatCurrency(data.genel.toplamCiro) : '₺0' }}</div>
                            <div class="text-subtitle-2 text-grey">Toplam Ciro</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="purple" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="purple">mdi-trending-up</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold text-purple">{{ data?.genel?.toplamKar ?
                                formatCurrency(data.genel.toplamKar) : '₺0' }}</div>
                            <div class="text-subtitle-2 text-grey">Toplam Kar</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="primary" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="primary">mdi-package-variant</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold text-primary">{{ data?.genel?.toplamSiparis || 0 }}</div>
                            <div class="text-subtitle-2 text-grey">Toplam Sipariş</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Main Content Tabs -->
        <v-card class="rounded-xl border" elevation="0">
            <v-tabs v-model="activeTab" grow color="primary" slider-color="primary">
                <v-tab value="hazirlanacak">
                    <v-icon start color="warning">mdi-clock-fast</v-icon>
                    Hazırlanacaklar ({{ data?.hazirlanacaklar?.siparisler?.length || 0 }})
                </v-tab>
                <v-tab value="hazırlanan">
                    <v-icon start color="success">mdi-check-circle-outline</v-icon>
                    Hazırlananlar ({{ data?.hazırlananlar?.siparisler?.length || 0 }})
                </v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
                <!-- Hazırlanacaklar Tab -->
                <v-window-item value="hazirlanacak">
                    <v-card-text class="pa-4">
                        <v-alert v-if="error" type="error" class="mb-4" closable variant="tonal" rounded="lg">{{ error }}</v-alert>

                        <!-- Malzeme İhtiyacı Özeti -->
                        <div v-if="data?.hazirlanacaklar?.toplam?.malzemeIhtiyaci?.length" class="mb-6">
                            <h3 class="text-h6 font-weight-bold mb-3 text-warning d-flex align-center">
                                <v-icon class="mr-2" color="warning">mdi-package-variant</v-icon>
                                Toplam Malzeme İhtiyacı
                            </h3>
                            <v-row>
                                <v-col v-for="malzeme in data.hazirlanacaklar.toplam.malzemeIhtiyaci.slice(0, 6)"
                                    :key="malzeme.stokKod" cols="12" md="4">
                                    <v-card variant="outlined" class="pa-3 rounded-lg">
                                        <div class="d-flex justify-space-between align-center">
                                            <div>
                                                <div class="font-weight-bold">{{ malzeme.ad }}</div>
                                                <div class="text-caption text-grey">{{ malzeme.stokKod }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-weight-bold text-warning">
                                                    {{ formatWeight(malzeme.miktar) }}
                                                </div>
                                                <div class="text-caption text-grey">{{ formatCurrency(malzeme.toplamMaliyet) }}</div>
                                            </div>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Hazırlanacak Siparişler Tablosu -->
                        <v-card class="rounded-lg border" elevation="0">
                            <v-card-title class="pa-4 bg-warning text-white">
                                <div class="d-flex align-center">
                                    <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                        <v-icon color="white">mdi-list-box-outline</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h3 class="text-h6 font-weight-bold">Hazırlanacak Siparişler</h3>
                                    </div>
                                </div>
                            </v-card-title>
                            <v-data-table :headers="hazirlanacakHeaders" :items="data?.hazirlanacaklar?.siparisler || []"
                                :loading="loading" class="elevation-0" density="comfortable"
                                items-per-page="10">

                                <template v-slot:item.tarih="{ item }">
                                    <span class="text-body-2">{{ formatDate(item.tarih) }}</span>
                                </template>

                                <template v-slot:item.musteri="{ item }">
                                    <div>
                                        <div class="font-weight-medium">{{ item.cari?.ad || item.gonderenAdi }}</div>
                                        <div class="text-caption text-grey">{{ item.cari?.telefon || item.gonderenTel }}</div>
                                    </div>
                                </template>

                                <template v-slot:item.urunler="{ item }">
                                    <div>
                                        <v-chip v-for="kalem in item.kalemler.slice(0, 2)" :key="kalem.id" size="x-small"
                                            class="ma-1" color="warning" variant="tonal">
                                            {{ kalem.urun.ad }} ({{ kalem.miktar }}{{ kalem.birim }})
                                        </v-chip>
                                        <span v-if="item.kalemler.length > 2" class="text-caption text-grey">
                                            +{{ item.kalemler.length - 2 }} daha
                                        </span>
                                    </div>
                                </template>

                                <template v-slot:item.maliyet="{ item }">
                                    <span class="font-weight-bold text-warning">
                                        {{ formatCurrency(item.maliyet?.toplam || 0) }}
                                    </span>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn icon size="small" color="primary" variant="text"
                                        @click="showSiparisDetay(item)" title="Detay Görüntüle">
                                        <v-icon>mdi-eye-outline</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-card>
                    </v-card-text>
                </v-window-item>

                <!-- Hazırlananlar Tab -->
                <v-window-item value="hazırlanan">
                    <v-card-text class="pa-4">
                        <!-- Kullanılan Malzemeler Özeti -->
                        <div v-if="data?.hazırlananlar?.toplam?.kullanılanMalzemeler?.length" class="mb-6">
                            <h3 class="text-h6 font-weight-bold mb-3 text-success d-flex align-center">
                                <v-icon class="mr-2" color="success">mdi-check-circle-outline</v-icon>
                                Kullanılan Malzemeler
                            </h3>
                            <v-row>
                                <v-col v-for="malzeme in data.hazırlananlar.toplam.kullanılanMalzemeler.slice(0, 6)"
                                    :key="malzeme.stokKod" cols="12" md="4">
                                    <v-card variant="outlined" class="pa-3 rounded-lg">
                                        <div class="d-flex justify-space-between align-center">
                                            <div>
                                                <div class="font-weight-bold">{{ malzeme.ad }}</div>
                                                <div class="text-caption text-grey">{{ malzeme.stokKod }}</div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-weight-bold text-success">
                                                    {{ formatWeight(malzeme.miktar) }}
                                                </div>
                                                <div class="text-caption text-grey">{{ formatCurrency(malzeme.toplamMaliyet) }}</div>
                                            </div>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div>

                        <!-- Hazırlanan Siparişler Tablosu -->
                        <v-card class="rounded-lg border" elevation="0">
                            <v-card-title class="pa-4 bg-success text-white">
                                <div class="d-flex align-center">
                                    <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                        <v-icon color="white">mdi-check-all</v-icon>
                                    </v-avatar>
                                    <div>
                                        <h3 class="text-h6 font-weight-bold">Hazırlanan Siparişler</h3>
                                    </div>
                                </div>
                            </v-card-title>
                            <v-data-table :headers="hazırlananHeaders" :items="data?.hazırlananlar?.siparisler || []"
                                :loading="loading" class="elevation-0" density="comfortable"
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
                                        <div class="text-caption text-grey">{{ item.cari?.telefon || item.gonderenTel }}</div>
                                    </div>
                                </template>

                                <template v-slot:item.urunler="{ item }">
                                    <div>
                                        <v-chip v-for="kalem in item.kalemler.slice(0, 2)" :key="kalem.id" size="x-small"
                                            class="ma-1" color="success" variant="tonal">
                                            {{ kalem.urun.ad }} ({{ kalem.miktar }}{{ kalem.birim }})
                                        </v-chip>
                                        <span v-if="item.kalemler.length > 2" class="text-caption text-grey">
                                            +{{ item.kalemler.length - 2 }} daha
                                        </span>
                                    </div>
                                </template>

                                <template v-slot:item.maliyet="{ item }">
                                    <span class="font-weight-bold text-error">
                                        {{ formatCurrency(item.maliyet?.toplam || 0) }}
                                    </span>
                                </template>

                                <template v-slot:item.satis="{ item }">
                                    <span class="font-weight-bold text-primary">
                                        {{ formatCurrency(item.satis?.toplam || 0) }}
                                    </span>
                                </template>

                                <template v-slot:item.kar="{ item }">
                                    <span class="font-weight-bold" :class="(item.kar || 0) >= 0 ? 'text-success' : 'text-error'">
                                        {{ formatCurrency(item.kar || 0) }}
                                    </span>
                                </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn icon size="small" color="primary" variant="text"
                                        @click="showSiparisDetay(item)" title="Detay Görüntüle">
                                        <v-icon>mdi-eye-outline</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </v-card>
                    </v-card-text>
                </v-window-item>
            </v-window>
        </v-card>

        <!-- Sipariş Detay Dialog -->
        <v-dialog v-model="detayDialog" max-width="800px">
            <v-card v-if="selectedSiparis" class="rounded-xl">
                <v-card-title class="pa-4 bg-primary text-white">
                    <div class="d-flex align-center">
                        <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                            <v-icon color="white">mdi-receipt-text-outline</v-icon>
                        </v-avatar>
                        <div>
                            <h3 class="text-h6 font-weight-bold">Sipariş Detayı #{{ selectedSiparis.id }}</h3>
                        </div>
                    </div>
                </v-card-title>
                <v-card-text class="pa-6">
                    <!-- Sipariş Bilgileri -->
                    <v-row class="mb-4">
                        <v-col cols="6">
                            <div class="text-caption text-grey mb-1">Müşteri</div>
                            <div class="font-weight-medium">{{ selectedSiparis.cari?.ad || selectedSiparis.gonderenAdi }}</div>
                        </v-col>
                        <v-col cols="6">
                            <div class="text-caption text-grey mb-1">Tarih</div>
                            <div class="font-weight-medium">{{ formatDate(selectedSiparis.tarih) }}</div>
                        </v-col>
                        <v-col cols="6">
                            <div class="text-caption text-grey mb-1">Durum</div>
                            <v-chip size="small" :color="selectedSiparis.durum === 'Hazırlandı' ? 'success' : 'warning'" variant="tonal">
                                {{ selectedSiparis.durum }}
                            </v-chip>
                        </v-col>
                        <v-col cols="6">
                            <div class="text-caption text-grey mb-1">Teslimat</div>
                            <div class="font-weight-medium">{{ selectedSiparis.teslimatTuru?.ad }}</div>
                        </v-col>
                    </v-row>

                    <!-- Ürün Detayları -->
                    <h4 class="mb-3 text-primary font-weight-bold">Ürün Detayları</h4>
                    <v-table density="compact" class="mb-4 rounded-lg border">
                        <thead>
                            <tr class="bg-grey-lighten-4">
                                <th>Ürün</th>
                                <th>Miktar</th>
                                <th>Birim Maliyet</th>
                                <th>Toplam</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="kalem in selectedSiparis.kalemler || []" :key="kalem.id">
                                <td>{{ kalem.urunAdi || kalem.urun?.ad }}</td>
                                <td>{{ kalem.miktar }} {{ kalem.birim }}</td>
                                <td>{{ formatCurrency(kalem.birimFiyat) }}</td>
                                <td class="font-weight-medium">{{ formatCurrency(kalem.toplamTutar) }}</td>
                            </tr>
                        </tbody>
                    </v-table>

                    <!-- Maliyet Özeti -->
                    <v-row>
                        <v-col cols="6">
                            <v-card class="pa-4 rounded-lg border" elevation="0">
                                <div class="text-subtitle-1 font-weight-bold mb-3 text-primary">Maliyet Özeti</div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">Ürün Maliyeti:</span>
                                    <span>{{ formatCurrency(selectedSiparis.araToplam || 0) }}</span>
                                </div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">KDV:</span>
                                    <span>{{ formatCurrency(selectedSiparis.kdvToplam || 0) }}</span>
                                </div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">Kargo:</span>
                                    <span>{{ formatCurrency(selectedSiparis.kargoUcreti || 0) }}</span>
                                </div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">Diğer:</span>
                                    <span>{{ formatCurrency(selectedSiparis.digerHizmetTutari || 0) }}</span>
                                </div>
                                <v-divider class="my-2"></v-divider>
                                <div class="d-flex justify-space-between">
                                    <span class="font-weight-bold">Toplam:</span>
                                    <span class="font-weight-bold text-primary">{{ formatCurrency(selectedSiparis.toplamTutar || 0) }}</span>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card class="pa-4 rounded-lg border" elevation="0">
                                <div class="text-subtitle-1 font-weight-bold mb-3 text-success">Satış & Kar</div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">Satış Tutarı:</span>
                                    <span>{{ formatCurrency(selectedSiparis.toplamTutar || 0) }}</span>
                                </div>
                                <div class="d-flex justify-space-between mb-1">
                                    <span class="text-grey">Maliyet:</span>
                                    <span class="text-error">{{ formatCurrency(selectedSiparis.toplamMaliyet || 0) }}</span>
                                </div>
                                <v-divider class="my-2"></v-divider>
                                <div class="d-flex justify-space-between">
                                    <span class="font-weight-bold">Kar:</span>
                                    <span class="font-weight-bold" :class="(selectedSiparis.karMarji || 0) >= 0 ? 'text-success' : 'text-error'">
                                        {{ formatCurrency(selectedSiparis.karMarji || 0) }}
                                    </span>
                                </div>
                                <div class="d-flex justify-space-between mt-1">
                                    <span class="text-grey">Kar Oranı:</span>
                                    <span>{{ ((selectedSiparis.karOrani || 0)).toFixed(1) }}%</span>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="pa-4 justify-end">
                    <v-btn variant="text" @click="detayDialog = false">Kapat</v-btn>
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
import { ref, onMounted } from 'vue';
import { apiCall } from '../utils/api';
import { formatDate } from '../utils/date';

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

        const response = await apiCall('/uretim-plani', {
            startDate: startDate.value,
            endDate: endDate.value
        }, 'POST');

        console.log('📦 API Yanıtı:', response);

        if (response?.success) {
            data.value = response.data;
            showSnackbar('Veriler başarıyla yüklendi!', 'success');
        } else {
            throw new Error(response?.error || 'Veri alınamadı');
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
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(33,150,243,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

.v-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
    text-transform: none;
}
</style>