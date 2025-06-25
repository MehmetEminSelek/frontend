<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-4" 
                style="background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%); color: #4A148C; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
                    <v-icon size="120">mdi-chart-line</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="#6A1B9A">mdi-chart-bar-stacked</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1" style="color: #4A148C;">Satış Raporları</h1>
                                <p class="text-h6 mb-0" style="color: #6A1B9A; opacity: 0.8;">Detaylı satış analizleri ve performans raporları</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="rgba(74, 20, 140, 0.15)" size="small" class="mr-2" style="color: #4A148C;">
                                <v-icon start size="16" color="#6A1B9A">mdi-trending-up</v-icon>
                                Canlı Veriler
                            </v-chip>
                            <v-chip color="rgba(74, 20, 140, 0.15)" size="small" style="color: #4A148C;">
                                <v-icon start size="16" color="#6A1B9A">mdi-export</v-icon>
                                Excel Export
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <div class="mb-3">
                            <v-sheet color="rgba(255,255,255,0.9)" class="pa-3 rounded-lg" style="color: #4A148C;">
                                <div class="text-h5 font-weight-bold">₺{{ ortalamaSepetTutari.toLocaleString('tr-TR', {
                                    minimumFractionDigits: 2
                                }) }}</div>
                                <div class="text-body-2">Ortalama Sepet Tutarı</div>
                            </v-sheet>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Filters Section -->
        <v-card class="mb-6 rounded-xl" elevation="1" style="border: 1px solid #F3E5F5;">
            <v-card-title class="d-flex align-center py-4">
                <v-icon color="#6A1B9A" class="mr-2">mdi-filter-variant</v-icon>
                <span class="text-h6 font-weight-bold" style="color: #4A148C;">Filtreler ve Tarih Aralığı</span>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-row>
                    <v-col cols="12" md="3">
                        <v-text-field 
                            v-model="startDate" 
                            label="Başlangıç Tarihi" 
                            type="date"
                            prepend-inner-icon="mdi-calendar-start"
                            variant="outlined" 
                            density="comfortable"
                            color="#9C27B0"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field 
                            v-model="endDate" 
                            label="Bitiş Tarihi" 
                            type="date"
                            prepend-inner-icon="mdi-calendar-end"
                            variant="outlined"
                            density="comfortable"
                            color="#9C27B0"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn color="#9C27B0" variant="outlined" @click="fetchReport" :loading="loading"
                            prepend-icon="mdi-refresh" class="w-100">
                            Raporu Getir
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-btn color="#9C27B0" variant="outlined" @click="exportCSV"
                            prepend-icon="mdi-file-excel" class="w-100">
                            Excel (CSV) İndir
                        </v-btn>
                    </v-col>
                </v-row>
                
                <v-divider class="my-4"></v-divider>
                
                <v-row>
                    <v-col cols="12" md="4">
                        <v-select 
                            v-model="urunFilter" 
                            :items="urunOptions" 
                            label="Ürün Filtrele"
                            prepend-inner-icon="mdi-package-variant"
                            clearable 
                            variant="outlined"
                            density="comfortable"
                            color="#9C27B0"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select 
                            v-model="subeFilter" 
                            :items="subeOptions" 
                            label="Şube Filtrele"
                            prepend-inner-icon="mdi-store"
                            clearable 
                            variant="outlined"
                            density="comfortable"
                            color="#9C27B0"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select 
                            v-model="musteriFilter" 
                            :items="musteriOptions" 
                            label="Müşteri Filtrele"
                            prepend-inner-icon="mdi-account-group"
                            clearable 
                            variant="outlined"
                            density="comfortable"
                            color="#9C27B0"
                            hide-details />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Charts Grid -->
        <v-row>
            <!-- Monthly Revenue Chart -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #FFF3E0 100%); border: 1px solid #FFE0B2;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-chart-line</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">Aylık Ciro</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Günlük satış performansı</p>
                                </div>
                            </div>
                            <v-select 
                                v-model="selectedMonth" 
                                :items="monthOptions" 
                                label="Ay Seçiniz" 
                                item-text="label"
                                item-value="value" 
                                density="compact" 
                                variant="solo"
                                style="max-width:160px; min-width:120px;"
                                color="white"
                                hide-details />
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Line :data="ciroLineData" :options="ciroLineOptions" style="max-height:300px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #E65100;">
                            Seçili ay: {{ selectedMonthLabel }} - Günlük ciro değişimi
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Top Product Sales -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #E8F5E9 100%); border: 1px solid #E0F2E7;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #A5D6A7 0%, #81C784 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-trophy</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">En Çok Satılan Ürünler</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Adet bazında satış</p>
                                </div>
                            </div>
                            <v-btn size="small" color="rgba(255,255,255,0.2)" variant="flat" @click="exportChartPng('urunAdet')">
                                <v-icon size="16">mdi-download</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar v-if="Array.isArray(filteredUrunBarDataAdet.labels) && Array.isArray(filteredUrunBarDataAdet.datasets)"
                                ref="el => chartRefs.urunAdet = el"
                                :data="filteredUrunBarDataAdet || { labels: [], datasets: [] }"
                                :options="{ ...urunBarOptions, title: { text: 'En Çok Satılan Ürünler (Adet)' } }"
                                style="max-height:220px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #2E7D32;">
                            Satış performansı - adet bazında sıralama
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Additional Charts Row -->
        <v-row>
            <!-- Product Revenue Chart -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #FFF3E0 100%); border: 1px solid #FFE0B2;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-currency-try</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">En Çok Ciro Yapan Ürünler</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Gelir bazında analiz</p>
                                </div>
                            </div>
                            <v-btn size="small" color="rgba(255,255,255,0.2)" variant="flat" @click="exportChartPng('urunCiro')">
                                <v-icon size="16">mdi-download</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar v-if="Array.isArray(filteredUrunBarDataCiro.labels) && Array.isArray(filteredUrunBarDataCiro.datasets)"
                                ref="el => chartRefs.urunCiro = el"
                                :data="filteredUrunBarDataCiro || { labels: [], datasets: [] }"
                                :options="{ ...urunBarOptions, title: { text: 'En Çok Ciro Yapan Ürünler (₺)' } }"
                                style="max-height:220px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #E65100;">
                            Gelir performansı - ciro bazında sıralama
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Branch Sales Chart -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #E3F2FD 100%); border: 1px solid #BBDEFB;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-store</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">Şube Satış Performansı</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Adet bazında karşılaştırma</p>
                                </div>
                            </div>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar :data="subeBarData" :options="subeBarOptions" style="max-height:300px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #1565C0;">
                            Şube performans karşılaştırması
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Branch Revenue and Orders Row -->
        <v-row>
            <!-- Branch Revenue -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #E3F2FD 100%); border: 1px solid #BBDEFB;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-currency-try</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">Şube Ciro Analizi</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Gelir bazında performans</p>
                                </div>
                            </div>
                            <v-btn size="small" color="rgba(255,255,255,0.2)" variant="flat" @click="exportChartPng('subeCiro')">
                                <v-icon size="16">mdi-download</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar v-if="Array.isArray(filteredSubeBarDataCiro.labels) && Array.isArray(filteredSubeBarDataCiro.datasets)"
                                ref="el => chartRefs.subeCiro = el"
                                :data="filteredSubeBarDataCiro || { labels: [], datasets: [] }"
                                :options="{ ...subeBarOptions, title: { text: 'En Çok Ciro Yapan Şubeler (₺)' } }"
                                style="max-height:220px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #1565C0;">
                            Şube bazında gelir karşılaştırması
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Branch Orders -->
            <v-col cols="12" lg="6">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #F3E5F5 100%); border: 1px solid #E8EAF6;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-cart</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">Şube Sipariş Analizi</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Sipariş adedi karşılaştırması</p>
                                </div>
                            </div>
                            <v-btn size="small" color="rgba(255,255,255,0.2)" variant="flat" @click="exportChartPng('subeAdet')">
                                <v-icon size="16">mdi-download</v-icon>
                            </v-btn>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar v-if="Array.isArray(filteredSubeBarDataAdet.labels) && Array.isArray(filteredSubeBarDataAdet.datasets)"
                                ref="el => chartRefs.subeAdet = el"
                                :data="filteredSubeBarDataAdet || { labels: [], datasets: [] }"
                                :options="{ ...subeBarOptions, title: { text: 'En Çok Sipariş Alan Şubeler (Adet)' } }"
                                style="max-height:220px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #6A1B9A;">
                            Sipariş yoğunluğu analizi
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Sales Details and Inventory -->
        <v-row>
            <!-- Sales Details Table -->
            <v-col cols="12" lg="8">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #FAFAFA 100%); border: 1px solid #EEEEEE;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #90A4AE 0%, #78909C 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                    <v-icon color="white">mdi-table</v-icon>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">Satış Detay Tablosu</h3>
                                    <p class="text-body-2 opacity-80 ma-0">Detaylı satış verileri</p>
                                </div>
                            </div>
                            <v-chip color="rgba(255,255,255,0.2)" size="small">
                                {{ filteredSatisDetay.length }} kayıt
                            </v-chip>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <v-data-table 
                            :headers="satisHeaders" 
                            :items="filteredSatisDetay" 
                            :loading="loading"
                            class="sales-table rounded-lg"
                            density="comfortable" 
                            hide-default-footer 
                            :row-class="rowClass"
                            item-value="tutar" 
                            :footer-props="{ 'items-per-page-options': [10, 20, 50] }">
                            
                            <template #item.tutar="{ item }">
                                <span class="font-weight-bold" style="color: #388E3C;">
                                    ₺{{ (item.tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                                </span>
                            </template>
                            
                            <template #bottom>
                                <div class="pa-3" style="background: #F5F5F5; border-radius: 0 0 12px 12px;">
                                    <div class="d-flex justify-space-between align-center">
                                        <span class="font-weight-bold">Toplam:</span>
                                        <span class="text-h6 font-weight-bold" style="color: #388E3C;">
                                            ₺{{ filteredSatisDetay.reduce((sum, r) => sum + (r.tutar || 0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </v-data-table>
                        <p class="text-caption mt-2" style="color: #555;">
                            {{ formattedDateRange }}
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Inventory Distribution -->
            <v-col cols="12" lg="4">
                <v-card class="h-100 rounded-xl" elevation="2" 
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #E3F2FD 100%); border: 1px solid #BBDEFB;">
                    
                    <v-card-title class="pa-4" style="background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%); color: white;">
                        <div class="d-flex align-center">
                            <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                                <v-icon color="white">mdi-warehouse</v-icon>
                            </v-avatar>
                            <div>
                                <h3 class="text-h6 font-weight-bold">Hammadde Dağılımı</h3>
                                <p class="text-body-2 opacity-80 ma-0">Mevcut stok durumu</p>
                            </div>
                        </div>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 12px; padding: 16px;">
                            <Bar :data="kalanHammaddeBarData" :options="kalanHammaddeBarOptions" style="max-height:260px;" />
                        </div>
                        <p class="text-caption mt-2" style="color: #1565C0;">
                            {{ formattedDateRange }}
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-snackbar v-model="snackbar" color="#E57373" timeout="4000">{{ snackbarMsg }}</v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, computed, nextTick, provide } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
} from 'chart.js';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const startDate = ref(new Date().toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const loading = ref(false);
const satisDetay = ref([]);
const snackbar = ref(false);
const snackbarMsg = ref('');

const satisHeaders = [
    { text: 'Tarih', value: 'tarih' },
    { text: 'Ürün', value: 'urunAd' },
    { text: 'Şube', value: 'sube' },
    { text: 'Müşteri', value: 'musteri' },
    { text: 'Miktar', value: 'miktar', align: 'end' },
    { text: 'Tutar (₺)', value: 'tutar', align: 'end' }
];

const ciro = ref([]);
const urunlerAdet = ref([]);
const urunlerCiro = ref([]);
const subelerCiro = ref([]);
const subelerAdet = ref([]);

const urunFilter = ref('');
const subeFilter = ref('');
const musteriFilter = ref('');

const urunOptions = computed(() => urunlerAdet.value.map(x => x.urunAd));
const subeOptions = computed(() => subelerCiro.value.map(x => x.sube));
const musteriOptions = computed(() => Array.from(new Set(satisDetay.value.map(x => x.musteri))).filter(Boolean));

const filteredSatisDetay = computed(() => {
    return satisDetay.value.filter(row =>
        (!urunFilter.value || row.urunAd === urunFilter.value) &&
        (!subeFilter.value || row.sube === subeFilter.value) &&
        (!musteriFilter.value || row.musteri === musteriFilter.value)
    );
});

const safeLabels = arr => Array.isArray(arr) ? arr : [];
const safeData = arr => Array.isArray(arr) ? arr : [];

function safeChartData(data) {
    if (!data || typeof data !== 'object') return { labels: [], datasets: [] };
    return {
        labels: Array.isArray(data.labels) ? data.labels : [],
        datasets: Array.isArray(data.datasets) ? data.datasets : []
    };
}

const ciroLineData = computed(() => {
    const [yil, ay] = selectedMonth.value.split('-');
    const days = getDaysInMonth(+yil, +ay);
    const labels = Array.from({ length: days }, (_, i) => `${(i + 1).toString().padStart(2, '0')} ${monthOptions[+ay - 1].label.split(' ')[0]}`);
    // Her gün için ciroyu bul
    const dataArr = Array(days).fill(0);
    ciro.value.forEach(x => {
        const d = new Date(x.tarih);
        const gun = d.getDate();
        dataArr[gun - 1] = x.toplam || 0;
    });
    return {
        labels,
        datasets: [{
            label: 'Ciro',
            data: dataArr,
            borderColor: '#ffd54f',
            backgroundColor: 'rgba(255, 213, 79, 0.2)',
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#ffd54f',
            pointBorderColor: '#ffd54f',
            pointRadius: 4
        }]
    };
});
const ciroLineOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Dönemsel Ciro (Çizgi Grafik)' }
    },
    scales: { y: { beginAtZero: true } }
};

const urunBarOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: '' } }, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

const urunBarDataAdet = computed(() => safeChartData({
    labels: safeLabels((urunlerAdet.value || []).slice(0, 5).map(x => x.urunAd)),
    datasets: [{
        label: 'Satış (adet)',
        data: safeData((urunlerAdet.value || []).slice(0, 5).map(x => x.toplamMiktar)),
        backgroundColor: (urunlerAdet.value || []).slice(0, 5).map((_, i) => i === 0 ? '#ffd54f' : '#81c784')
    }]
}));
const urunBarDataCiro = computed(() => safeChartData({
    labels: safeLabels((urunlerCiro.value || []).slice(0, 5).map(x => x.urunAd)),
    datasets: [{
        label: 'Ciro (₺)',
        data: safeData((urunlerCiro.value || []).slice(0, 5).map(x => x.toplamTutar)),
        backgroundColor: (urunlerCiro.value || []).slice(0, 5).map((_, i) => i === 0 ? '#ffd54f' : '#81c784')
    }]
}));
const filteredUrunBarDataAdet = computed(() => safeChartData(urunBarDataAdet.value));
const filteredUrunBarDataCiro = computed(() => safeChartData(urunBarDataCiro.value));
const filteredSubeBarDataCiro = computed(() => safeChartData({
    labels: safeLabels((subelerCiro.value || []).slice(0, 5).map(x => x.sube)),
    datasets: [{
        label: 'Ciro (₺)',
        data: safeData((subelerCiro.value || []).slice(0, 5).map(x => x.toplamTutar)),
        backgroundColor: (subelerCiro.value || []).slice(0, 5).map((_, i) => i === 0 ? '#ffd54f' : '#64b5f6')
    }]
}));
const filteredSubeBarDataAdet = computed(() => safeChartData(subeBarData.value));

const subeBarData = computed(() => safeChartData({
    labels: safeLabels((subelerAdet.value || []).slice(0, 5).map(x => x.sube)),
    datasets: [{
        label: 'Satış (adet)',
        data: safeData((subelerAdet.value || []).slice(0, 5).map(x => x.toplamMiktar)),
        backgroundColor: (subelerAdet.value || []).slice(0, 5).map((_, i) => i === 0 ? '#ffd54f' : '#64b5f6')
    }]
}));
const subeBarOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: '' } }, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

const ortalamaSepetTutari = ref(0);
const saatlikCiro = ref([]);
const saatlikCiroLineData = computed(() => safeChartData({
    labels: safeLabels((saatlikCiro.value || []).map(x => x.saat)),
    datasets: [{
        label: 'Ciro',
        data: safeData((saatlikCiro.value || []).map(x => x.tutar)),
        borderColor: '#ffd54f',
        backgroundColor: 'rgba(255, 213, 79, 0.2)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#ffd54f',
        pointBorderColor: '#ffd54f',
        pointRadius: 4
    }]
}));
const saatlikCiroLineOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Saatlik Satış Dağılımı (₺)' }
    },
    scales: { y: { beginAtZero: true } }
};

const maxTutar = computed(() => Math.max(...filteredSatisDetay.value.map(x => x.tutar || 0), 0));
function rowClass(item) {
    return item.tutar === maxTutar.value ? 'highlight-row' : '';
}

async function fetchReport() {
    loading.value = true;
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/satis-raporu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: startDate.value, endDate: endDate.value })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'API hatası');
        const data = await res.json();
        ciro.value = data.ciro || [];
        urunlerAdet.value = data.urunlerAdet || [];
        urunlerCiro.value = data.urunlerCiro || [];
        subelerCiro.value = data.subelerCiro || [];
        subelerAdet.value = data.subelerAdet || [];
        satisDetay.value = data.satisDetay || [];
        ortalamaSepetTutari.value = data.ortalamaSepetTutari || 0;
        saatlikCiro.value = data.saatlikCiro || [];
    } catch (e) {
        snackbarMsg.value = e.message || 'Rapor alınamadı';
        snackbar.value = true;
    } finally {
        loading.value = false;
    }
}

// CSV export
function exportCSV() {
    const rows = [
        ['Tarih', 'Ürün', 'Şube', 'Müşteri', 'Miktar', 'Tutar (₺)'],
        ...filteredSatisDetay.value.map(r => [r.tarih, r.urunAd, r.sube, r.musteri, r.miktar, r.tutar])
    ];
    const csv = rows.map(row => row.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satis-raporu-${startDate.value}_to_${endDate.value}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Chart PNG export
const chartRefs = ref({});
async function exportChartPng(chartKey) {
    await nextTick();
    const chart = chartRefs.value[chartKey]?.chartInstance;
    if (chart) {
        const url = chart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chartKey}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// Satış Raporu modülüne özel tema ile Vuetify instance'ı oluştur
const satisRaporuTheme = {
    dark: false,
    colors: {
        primary: '#2196F3', // Mavi
        secondary: '#A5D6A7', // Açık yeşil
        accent: '#64B5F6',
        error: '#D32F2F',
        info: '#2196F3',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};
const satisRaporuVuetify = createCustomVuetify({ themeName: 'satisRaporuTheme', customTheme: satisRaporuTheme });
provide('vuetify', satisRaporuVuetify);

// Kalan hammadde için örnek veri
const kalanHammadde = ref([
    { ad: 'Un', miktar: 1200 },
    { ad: 'Şeker', miktar: 800 },
    { ad: 'Tuz', miktar: 500 },
    { ad: 'Yağ', miktar: 300 },
    { ad: 'Yumurta', miktar: 200 }
]);
const kalanHammaddeBarData = computed(() => ({
    labels: kalanHammadde.value.map(x => x.ad),
    datasets: [{
        label: 'Kalan Miktar (kg)',
        data: kalanHammadde.value.map(x => x.miktar),
        backgroundColor: ['#81c784', '#ffd54f', '#64b5f6', '#ffb74d', '#e57373']
    }]
}));
const kalanHammaddeBarOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Kalan Hammadde Dağılımı' }
    },
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
};

// Tarih aralığını güzelce formatlayan fonksiyon
function formatDateTR(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' });
}
const formattedDateRange = computed(() => {
    if (!startDate.value || !endDate.value) return '';
    return `${formatDate(startDate.value, true)} - ${formatDate(endDate.value, true)}`;
});

// Ay seçici için
const monthOptions = [
    { value: '2024-01', label: 'Ocak 2024' },
    { value: '2024-02', label: 'Şubat 2024' },
    { value: '2024-03', label: 'Mart 2024' },
    { value: '2024-04', label: 'Nisan 2024' },
    { value: '2024-05', label: 'Mayıs 2024' },
    { value: '2024-06', label: 'Haziran 2024' },
    { value: '2024-07', label: 'Temmuz 2024' },
    { value: '2024-08', label: 'Ağustos 2024' },
    { value: '2024-09', label: 'Eylül 2024' },
    { value: '2024-10', label: 'Ekim 2024' },
    { value: '2024-11', label: 'Kasım 2024' },
    { value: '2024-12', label: 'Aralık 2024' },
];
const selectedMonth = ref(monthOptions[4].value); // default: Mayıs 2024
const selectedMonthLabel = computed(() => monthOptions.find(m => m.value === selectedMonth.value)?.label || '');

// ciroLineData ve ilgili veriler sadece seçili ayı gösterecek şekilde filtrelenmeli
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
const ciroAyVerisi = computed(() => {
    // ciro.value içinden sadece seçili ayı filtrele
    const [yil, ay] = selectedMonth.value.split('-');
    return (ciro.value || []).filter(x => {
        const d = new Date(x.tarih);
        return d.getFullYear() === +yil && (d.getMonth() + 1) === +ay;
    });
});

// Sayfa açıldığında bugünün raporunu getir
fetchReport();
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
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(74,20,140,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

.sales-table th {
    background: #FAFAFA !important;
    color: #555 !important;
    font-weight: 600 !important;
}

.sales-table tbody tr:hover {
    background: rgba(0, 0, 0, 0.02) !important;
}

.v-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>