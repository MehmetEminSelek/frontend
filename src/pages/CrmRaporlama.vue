<template>
    <v-container class="py-6 px-4" fluid>
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
                <span>📊 CRM Raporlama & Analiz Merkezi</span>
                <div class="d-flex align-center">
                    <v-btn icon="mdi-refresh" variant="text" @click="refreshAllReports" title="Tüm Raporları Yenile"></v-btn>
                    <v-btn icon="mdi-download" variant="text" @click="exportAllReports" title="Tüm Raporları İndir"></v-btn>
                </div>
            </v-card-title>

            <!-- Tarih Filtreleri -->
            <v-row dense align="center" class="mb-4">
                <v-col cols="auto">
                    <v-text-field v-model="startDate" label="Başlangıç Tarihi" type="date" density="compact"
                        hide-details style="min-width:140px" />
                </v-col>
                <v-col cols="auto">
                    <v-text-field v-model="endDate" label="Bitiş Tarihi" type="date" density="compact" hide-details
                        style="min-width:140px" />
                </v-col>
                <v-col cols="auto">
                    <v-btn color="primary" @click="fetchAllReports" :loading="loading">Raporları Getir</v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-select v-model="selectedReportType" :items="reportTypes" label="Rapor Türü" density="compact"
                        hide-details style="min-width:180px" />
                </v-col>
            </v-row>

            <!-- Hızlı İstatistikler -->
            <v-row class="mb-6">
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="primary" dark>
                        <div class="text-h4 font-weight-bold">{{ kpiData.toplamCiro.toLocaleString('tr-TR') }}₺</div>
                        <div class="text-caption">Toplam Ciro</div>
                        <div class="text-caption">{{ kpiData.ciroArtis > 0 ? '+' : '' }}{{ kpiData.ciroArtis }}% geçen dönem</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="success" dark>
                        <div class="text-h4 font-weight-bold">{{ kpiData.toplamSiparis }}</div>
                        <div class="text-caption">Toplam Sipariş</div>
                        <div class="text-caption">{{ kpiData.siparisArtis > 0 ? '+' : '' }}{{ kpiData.siparisArtis }}% geçen dönem</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="info" dark>
                        <div class="text-h4 font-weight-bold">{{ kpiData.ortalamaSepetTutari.toLocaleString('tr-TR') }}₺</div>
                        <div class="text-caption">Ortalama Sepet</div>
                        <div class="text-caption">{{ kpiData.sepetArtis > 0 ? '+' : '' }}{{ kpiData.sepetArtis }}% geçen dönem</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="warning" dark>
                        <div class="text-h4 font-weight-bold">{{ kpiData.aktifMusteriSayisi }}</div>
                        <div class="text-caption">Aktif Müşteri</div>
                        <div class="text-caption">{{ kpiData.musteriArtis > 0 ? '+' : '' }}{{ kpiData.musteriArtis }}% geçen dönem</div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Rapor Sekmeleri -->
            <v-tabs v-model="activeTab" grow class="mb-4">
                <v-tab value="satis">📈 Satış Raporları</v-tab>
                <v-tab value="musteri">👥 Müşteri Raporları</v-tab>
                <v-tab value="urun">🛍️ Ürün Raporları</v-tab>
                <v-tab value="operasyon">⚙️ Operasyonel Raporlar</v-tab>
                <v-tab value="finansal">💰 Finansal Raporlar</v-tab>
                <v-tab value="pazarlama">🎯 Pazarlama Raporları</v-tab>
            </v-tabs>

            <v-window v-model="activeTab">
                <!-- Satış Raporları -->
                <v-window-item value="satis">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Günlük Satış Trendi</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="primary">mdi-chart-line</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Saatlik Satış Dağılımı</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="success">mdi-chart-bar</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Detaylı Satış Tablosu</div>
                                <v-data-table :headers="satisHeaders" :items="satisDetayData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.tutar="{ item }">
                                        <span class="font-weight-bold">₺{{ item.tutar.toLocaleString('tr-TR') }}</span>
                                    </template>
                                    <template v-slot:item.tarih="{ item }">
                                        {{ formatDate(item.tarih) }}
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Müşteri Raporları -->
                <v-window-item value="musteri">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Müşteri Segmentasyonu</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="info">mdi-chart-donut</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">En Değerli Müşteriler</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="warning">mdi-account-star</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Müşteri Sadakat Analizi</div>
                                <v-data-table :headers="musteriHeaders" :items="musteriAnalizData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.toplamHarcama="{ item }">
                                        <span class="font-weight-bold">₺{{ item.toplamHarcama.toLocaleString('tr-TR') }}</span>
                                    </template>
                                    <template v-slot:item.sonSiparis="{ item }">
                                        {{ formatDate(item.sonSiparis) }}
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Ürün Raporları -->
                <v-window-item value="urun">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">En Çok Satan Ürünler</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="success">mdi-package-variant</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Ürün Kategori Dağılımı</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="primary">mdi-chart-pie</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Ürün Performans Analizi</div>
                                <v-data-table :headers="urunHeaders" :items="urunPerformansData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.toplamCiro="{ item }">
                                        <span class="font-weight-bold">₺{{ item.toplamCiro.toLocaleString('tr-TR') }}</span>
                                    </template>
                                    <template v-slot:item.karMarji="{ item }">
                                        <v-chip :color="item.karMarji > 30 ? 'success' : item.karMarji > 15 ? 'warning' : 'error'"
                                            size="small">
                                            %{{ item.karMarji.toFixed(1) }}
                                        </v-chip>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Operasyonel Raporlar -->
                <v-window-item value="operasyon">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Şube Performansı</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="info">mdi-store</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Kargo Durumu Dağılımı</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="warning">mdi-truck</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Stok Durumu</div>
                                <v-data-table :headers="stokHeaders" :items="stokDurumData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.kritikSeviye="{ item }">
                                        <v-chip :color="item.kritikSeviye ? 'error' : 'success'" size="small">
                                            {{ item.kritikSeviye ? 'Kritik' : 'Normal' }}
                                        </v-chip>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Finansal Raporlar -->
                <v-window-item value="finansal">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Aylık Gelir/Gider Trendi</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="success">mdi-currency-usd</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Kar Marjı Analizi</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="warning">mdi-chart-line</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Detaylı Finansal Analiz</div>
                                <v-data-table :headers="finansalHeaders" :items="finansalAnalizData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.toplamGelir="{ item }">
                                        <span class="font-weight-bold text-success">₺{{ item.toplamGelir.toLocaleString('tr-TR') }}</span>
                                    </template>
                                    <template v-slot:item.toplamGider="{ item }">
                                        <span class="font-weight-bold text-error">₺{{ item.toplamGider.toLocaleString('tr-TR') }}</span>
                                    </template>
                                    <template v-slot:item.netKar="{ item }">
                                        <span class="font-weight-bold" :class="item.netKar > 0 ? 'text-success' : 'text-error'">
                                            ₺{{ item.netKar.toLocaleString('tr-TR') }}
                                        </span>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>

                <!-- Pazarlama Raporları -->
                <v-window-item value="pazarlama">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Müşteri Kazanım Trendi</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="info">mdi-account-plus</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-card class="pa-3 mb-4">
                                <div class="text-h6 font-weight-bold mb-2">Müşteri Kaybı Analizi</div>
                                <div class="text-center pa-8">
                                    <v-icon size="64" color="error">mdi-account-minus</v-icon>
                                    <div class="text-h6 mt-2">Grafik Yükleniyor...</div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-card class="pa-3">
                                <div class="text-h6 font-weight-bold mb-2">Pazarlama Kampanya Performansı</div>
                                <v-data-table :headers="pazarlamaHeaders" :items="kampanyaPerformansData" :loading="loading"
                                    class="elevation-0" density="compact" items-per-page="10">
                                    <template v-slot:item.roi="{ item }">
                                        <v-chip :color="item.roi > 200 ? 'success' : item.roi > 100 ? 'warning' : 'error'" size="small">
                                            %{{ item.roi.toFixed(1) }}
                                        </v-chip>
                                    </template>
                                </v-data-table>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-window-item>
            </v-window>
        </v-card>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000">
            {{ snackbarText }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';
import axios from 'axios';

// CRM Raporlama modülüne özel tema
const crmTheme = {
    dark: false,
    colors: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#D32F2F',
        info: '#1976D2',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};
const crmVuetify = createCustomVuetify({ themeName: 'crmTheme', customTheme: crmTheme });
provide('vuetify', crmVuetify);

// Reactive data
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const loading = ref(false);
const activeTab = ref('satis');
const selectedReportType = ref('tum');

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Report types
const reportTypes = [
    { title: 'Tüm Raporlar', value: 'tum' },
    { title: 'Günlük Rapor', value: 'gunluk' },
    { title: 'Haftalık Rapor', value: 'haftalik' },
    { title: 'Aylık Rapor', value: 'aylik' },
    { title: 'Yıllık Rapor', value: 'yillik' }
];

// KPI Data
const kpiData = ref({
    toplamCiro: 0,
    ciroArtis: 0,
    toplamSiparis: 0,
    siparisArtis: 0,
    ortalamaSepetTutari: 0,
    sepetArtis: 0,
    aktifMusteriSayisi: 0,
    musteriArtis: 0
});

// Table data placeholders
const satisDetayData = ref([]);
const musteriAnalizData = ref([]);
const urunPerformansData = ref([]);
const stokDurumData = ref([]);
const finansalAnalizData = ref([]);
const kampanyaPerformansData = ref([]);

// Table headers
const satisHeaders = [
    { title: 'Tarih', key: 'tarih' },
    { title: 'Müşteri', key: 'musteri' },
    { title: 'Ürün', key: 'urun' },
    { title: 'Miktar', key: 'miktar' },
    { title: 'Tutar', key: 'tutar' }
];

const musteriHeaders = [
    { title: 'Müşteri', key: 'musteri' },
    { title: 'Toplam Sipariş', key: 'toplamSiparis' },
    { title: 'Toplam Harcama', key: 'toplamHarcama' },
    { title: 'Son Sipariş', key: 'sonSiparis' },
    { title: 'Segment', key: 'segment' }
];

const urunHeaders = [
    { title: 'Ürün', key: 'urun' },
    { title: 'Satış Adedi', key: 'satisAdedi' },
    { title: 'Toplam Ciro', key: 'toplamCiro' },
    { title: 'Kar Marjı', key: 'karMarji' },
    { title: 'Stok Durumu', key: 'stokDurumu' }
];

const stokHeaders = [
    { title: 'Stok Adı', key: 'stokAdi' },
    { title: 'Mevcut Stok', key: 'mevcutStok' },
    { title: 'Minimum Stok', key: 'minimumStok' },
    { title: 'Kritik Seviye', key: 'kritikSeviye' },
    { title: 'Son Güncelleme', key: 'sonGuncelleme' }
];

const finansalHeaders = [
    { title: 'Dönem', key: 'donem' },
    { title: 'Toplam Gelir', key: 'toplamGelir' },
    { title: 'Toplam Gider', key: 'toplamGider' },
    { title: 'Net Kar', key: 'netKar' },
    { title: 'Kar Marjı', key: 'karMarji' }
];

const pazarlamaHeaders = [
    { title: 'Kampanya', key: 'kampanya' },
    { title: 'Başlangıç', key: 'baslangic' },
    { title: 'Bitiş', key: 'bitis' },
    { title: 'Maliyet', key: 'maliyet' },
    { title: 'Gelir', key: 'gelir' },
    { title: 'ROI', key: 'roi' }
];

// Functions
async function fetchAllReports() {
    loading.value = true;
    try {
        // Mevcut satış raporu API'sini kullan
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/satis-raporu`, {
            startDate: startDate.value,
            endDate: endDate.value
        });

        const data = response.data;
        
        // KPI hesaplamaları
        const toplamCiro = data.satisDetay?.reduce((sum, item) => sum + (item.tutar || 0), 0) || 0;
        const toplamSiparis = new Set(data.satisDetay?.map(item => `${item.tarih}-${item.musteri}`) || []).size;
        const ortalamaSepetTutari = toplamSiparis > 0 ? toplamCiro / toplamSiparis : 0;
        
        // Benzersiz müşteri sayısı
        const musteriSet = new Set(data.satisDetay?.map(item => item.musteri).filter(Boolean) || []);
        const aktifMusteriSayisi = musteriSet.size;

        kpiData.value = {
            toplamCiro: Math.round(toplamCiro * 100) / 100,
            ciroArtis: 15, // Örnek değer
            toplamSiparis,
            siparisArtis: 8, // Örnek değer
            ortalamaSepetTutari: Math.round(ortalamaSepetTutari * 100) / 100,
            sepetArtis: 12, // Örnek değer
            aktifMusteriSayisi,
            musteriArtis: 5 // Örnek değer
        };
        
        // Tablo verilerini güncelle
        satisDetayData.value = data.satisDetay || [];
        
        // Müşteri analizi - gerçek verilerden hesapla
        const musteriMap = {};
        data.satisDetay?.forEach(item => {
            if (!item.musteri) return;
            if (!musteriMap[item.musteri]) {
                musteriMap[item.musteri] = {
                    musteri: item.musteri,
                    toplamSiparis: 0,
                    toplamHarcama: 0,
                    sonSiparis: item.tarih,
                    segment: 'Regular'
                };
            }
            musteriMap[item.musteri].toplamSiparis += 1;
            musteriMap[item.musteri].toplamHarcama += item.tutar || 0;
            if (item.tarih > musteriMap[item.musteri].sonSiparis) {
                musteriMap[item.musteri].sonSiparis = item.tarih;
            }
        });

        // Segment belirleme
        Object.values(musteriMap).forEach(musteri => {
            if (musteri.toplamHarcama > 1000) musteri.segment = 'VIP';
            else if (musteri.toplamHarcama > 500) musteri.segment = 'Premium';
        });

        musteriAnalizData.value = Object.values(musteriMap).sort((a, b) => b.toplamHarcama - a.toplamHarcama);

        // Ürün performansı - gerçek verilerden hesapla
        const urunMap = {};
        data.satisDetay?.forEach(item => {
            if (!urunMap[item.urun]) {
                urunMap[item.urun] = {
                    urun: item.urun,
                    satisAdedi: 0,
                    toplamCiro: 0,
                    karMarji: 0,
                    stokDurumu: 'Yeterli'
                };
            }
            urunMap[item.urun].satisAdedi += item.miktar || 0;
            urunMap[item.urun].toplamCiro += item.tutar || 0;
        });

        // Kar marjı hesaplama (örnek: %30)
        Object.values(urunMap).forEach(urun => {
            urun.karMarji = 30; // Örnek değer
        });

        urunPerformansData.value = Object.values(urunMap).sort((a, b) => b.toplamCiro - a.toplamCiro);

        // Stok durumu - gerçek verilerden al
        try {
            const stokResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stok/rapor`, {
                params: { startDate: startDate.value, endDate: endDate.value }
            });
            const stokData = stokResponse.data;
            
            stokDurumData.value = stokData.kritikStoklar?.map(stok => ({
                stokAdi: stok.hammadde?.ad || stok.yariMamul?.ad || 'Bilinmeyen',
                mevcutStok: stok.miktarGram || 0,
                minimumStok: stok.minimumMiktarGram || 0,
                kritikSeviye: (stok.miktarGram || 0) < (stok.minimumMiktarGram || 0),
                sonGuncelleme: stok.updatedAt?.toISOString().slice(0, 10) || '-'
            })) || [];
        } catch (error) {
            console.error('Stok verisi alınamadı:', error);
            stokDurumData.value = [];
        }

        // Finansal analiz - gerçek verilerden hesapla
        const aylikMap = {};
        data.satisDetay?.forEach(item => {
            const ay = item.tarih.slice(0, 7); // YYYY-MM formatı
            if (!aylikMap[ay]) aylikMap[ay] = { toplamGelir: 0, toplamGider: 0 };
            aylikMap[ay].toplamGelir += item.tutar || 0;
            aylikMap[ay].toplamGider += (item.tutar || 0) * 0.6; // Örnek gider oranı
        });

        finansalAnalizData.value = Object.entries(aylikMap).map(([donem, data]) => ({
            donem,
            toplamGelir: Math.round(data.toplamGelir * 100) / 100,
            toplamGider: Math.round(data.toplamGider * 100) / 100,
            netKar: Math.round((data.toplamGelir - data.toplamGider) * 100) / 100,
            karMarji: data.toplamGelir > 0 ? Math.round(((data.toplamGelir - data.toplamGider) / data.toplamGelir) * 100) : 0
        }));

        // Kampanya performansı - örnek veriler
        kampanyaPerformansData.value = [
            { kampanya: 'Yılbaşı Kampanyası', baslangic: '2024-12-01', bitis: '2024-12-31', maliyet: 5000, gelir: 25000, roi: 400 },
            { kampanya: 'Bahar Kampanyası', baslangic: '2024-03-01', bitis: '2024-03-31', maliyet: 3000, gelir: 18000, roi: 500 }
        ];

        showSnackbar('Raporlar başarıyla yüklendi!', 'success');
    } catch (error) {
        console.error('Rapor yükleme hatası:', error);
        showSnackbar('Raporlar yüklenirken hata oluştu!', 'error');
    } finally {
        loading.value = false;
    }
}

function refreshAllReports() {
    fetchAllReports();
}

async function exportAllReports() {
    try {
        showSnackbar('Rapor indirme özelliği yakında eklenecek!', 'info');
    } catch (error) {
        console.error('Rapor indirme hatası:', error);
        showSnackbar('Raporlar indirilirken hata oluştu!', 'error');
    }
}

function showSnackbar(text, color = 'info') {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbar.value = true;
}

// Initialize
onMounted(() => {
    fetchAllReports();
});
</script>

<style scoped>
.v-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
    background: #fff;
    transition: box-shadow 0.2s;
}

.v-card:hover {
    box-shadow: 0 4px 16px rgba(25, 118, 210, 0.16);
}

.v-btn {
    transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
}

.v-data-table {
    border-radius: 12px;
    background: #fff;
}

.v-data-table th {
    background: #f5f5f5 !important;
    color: #1976D2 !important;
    font-weight: bold;
}

.v-chip {
    border-radius: 8px;
    font-weight: 500;
}

.v-tabs {
    border-radius: 12px;
}

.v-tab {
    border-radius: 8px 8px 0 0;
}
</style> 