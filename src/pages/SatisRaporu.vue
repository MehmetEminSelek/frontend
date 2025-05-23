<template>
    <v-container class="py-6 px-4" fluid>
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4">Satış Raporları & Analiz</v-card-title>
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
                    <v-btn color="primary" @click="fetchReport" :loading="loading">Raporu Getir</v-btn>
                </v-col>
            </v-row>
            <v-divider class="mb-4"></v-divider>
            <v-row dense align="center" class="mb-2">
                <v-col cols="auto">
                    <v-select v-model="urunFilter" :items="urunOptions" label="Ürün Filtrele" clearable dense
                        style="min-width:180px" />
                </v-col>
                <v-col cols="auto">
                    <v-select v-model="subeFilter" :items="subeOptions" label="Şube Filtrele" clearable dense
                        style="min-width:180px" />
                </v-col>
                <v-col cols="auto">
                    <v-select v-model="musteriFilter" :items="musteriOptions" label="Müşteri Filtrele" clearable dense
                        style="min-width:180px" />
                </v-col>
            </v-row>
            <v-row class="mb-2">
                <v-col cols="auto">
                    <v-btn color="primary" @click="exportCSV" variant="outlined">Tabloyu Excel (CSV) Olarak
                        İndir</v-btn>
                </v-col>
                <v-col cols="auto">
                    <v-sheet color="green-lighten-5" class="pa-3 rounded-lg d-flex align-center"
                        style="min-width:220px">
                        <span class="font-weight-bold mr-2">Ortalama Sepet Tutarı:</span>
                        <span class="text-h6">₺{{ ortalamaSepetTutari.toLocaleString('tr-TR', {
                            minimumFractionDigits: 2
                        })
                            }}</span>
                    </v-sheet>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="amber-lighten-5">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="text-h6 font-weight-bold">Aylık Ciro (₺)</div>
                            <v-select v-model="selectedMonth" :items="monthOptions" label="Ay Seçiniz" item-text="label"
                                item-value="value" dense style="max-width:180px; min-width:120px;" />
                        </div>
                        <Line :data="ciroLineData" :options="ciroLineOptions" style="max-height:300px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            X: Gün, Y: Ciro (₺) — Seçili ay: {{ selectedMonthLabel }}
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="green-lighten-5">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="text-h6 font-weight-bold">En Çok Satış Yapan Ürünler (Adet)</div>
                            <v-btn size="small" variant="text" @click="exportChartPng('urunAdet')">PNG</v-btn>
                        </div>
                        <Bar v-if="Array.isArray(filteredUrunBarDataAdet.labels) && Array.isArray(filteredUrunBarDataAdet.datasets)"
                            ref="el => chartRefs.urunAdet = el"
                            :data="filteredUrunBarDataAdet || { labels: [], datasets: [] }"
                            :options="{ ...urunBarOptions, title: { text: 'En Çok Satılan Ürünler (Adet)' } }"
                            style="max-height:220px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            X: Satış (adet), Y: Ürün Adı
                        </div>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="amber-lighten-5">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="text-h6 font-weight-bold">En Çok Ciro Yapan Ürünler (₺)</div>
                            <v-btn size="small" variant="text" @click="exportChartPng('urunCiro')">PNG</v-btn>
                        </div>
                        <Bar v-if="Array.isArray(filteredUrunBarDataCiro.labels) && Array.isArray(filteredUrunBarDataCiro.datasets)"
                            ref="el => chartRefs.urunCiro = el"
                            :data="filteredUrunBarDataCiro || { labels: [], datasets: [] }"
                            :options="{ ...urunBarOptions, title: { text: 'En Çok Ciro Yapan Ürünler (₺)' } }"
                            style="max-height:220px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            X: Ciro (₺), Y: Ürün Adı
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="blue-lighten-5">
                        <div class="text-h6 font-weight-bold mb-2">En Çok Satış Yapan Şubeler</div>
                        <Bar :data="subeBarData" :options="subeBarOptions" style="max-height:300px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            X: Satış (adet), Y: Şube Adı
                        </div>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="blue-lighten-5">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="text-h6 font-weight-bold">En Çok Ciro Yapan Şubeler (₺)</div>
                            <v-btn size="small" variant="text" @click="exportChartPng('subeCiro')">PNG</v-btn>
                        </div>
                        <Bar v-if="Array.isArray(filteredSubeBarDataCiro.labels) && Array.isArray(filteredSubeBarDataCiro.datasets)"
                            ref="el => chartRefs.subeCiro = el"
                            :data="filteredSubeBarDataCiro || { labels: [], datasets: [] }"
                            :options="{ ...subeBarOptions, title: { text: 'En Çok Ciro Yapan Şubeler (₺)' } }"
                            style="max-height:220px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            X: Ciro (₺), Y: Şube Adı
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="purple-lighten-5">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <div class="text-h6 font-weight-bold">En Çok Sipariş Alan Şubeler (Adet)</div>
                            <v-btn size="small" variant="text" @click="exportChartPng('subeAdet')">PNG</v-btn>
                        </div>
                        <Bar v-if="Array.isArray(filteredSubeBarDataAdet.labels) && Array.isArray(filteredSubeBarDataAdet.datasets)"
                            ref="el => chartRefs.subeAdet = el"
                            :data="filteredSubeBarDataAdet || { labels: [], datasets: [] }"
                            :options="{ ...subeBarOptions, title: { text: 'En Çok Sipariş Alan Şubeler (Adet)' } }"
                            style="max-height:220px;" />
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="grey-lighten-5">
                        <div class="text-h6 font-weight-bold mb-2">Satış Detay Tablosu</div>
                        <v-data-table :headers="satisHeaders" :items="filteredSatisDetay" :loading="loading"
                            class="elevation-0 modern-table" density="compact" hide-default-footer :row-class="rowClass"
                            item-value="tutar" :footer-props="{ 'items-per-page-options': [10, 20, 50] }">
                            <template #item.tutar="{ item }">
                                <span class="font-weight-bold">₺{{ (item.tutar || 0).toLocaleString('tr-TR', {
                                    minimumFractionDigits: 2
                                }) }}</span>
                            </template>
                            <template #bottom>
                                <tr class="font-weight-bold">
                                    <td colspan="5" class="text-right pr-4">Toplam:</td>
                                    <td class="text-right">₺{{filteredSatisDetay.reduce((sum, r) => sum + (r.tutar ||
                                        0), 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}}</td>
                                </tr>
                            </template>
                        </v-data-table>
                        <div class="mt-2 text-caption text-grey-darken-2">
                            {{ formattedDateRange }}
                        </div>
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="8">
                    <v-card class="pa-3 mb-4" color="blue-lighten-4">
                        <div class="text-h6 font-weight-bold mb-2">Kalan Hammadde Dağılımı (Örnek)</div>
                        <Bar :data="kalanHammaddeBarData" :options="kalanHammaddeBarOptions"
                            style="max-height:260px;" />
                        <div class="mt-2 text-caption text-grey-darken-2">
                            {{ formattedDateRange }}
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
        <v-snackbar v-model="snackbar" color="error" timeout="4000">{{ snackbarMsg }}</v-snackbar>
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
        const res = await fetch('http://localhost:3000/api/satis-raporu', {
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
.highlight-row {
    background: linear-gradient(90deg, #fffde7 0%, #ffe082 100%) !important;
    font-weight: bold;
}

.v-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px #2196f322;
}

.v-btn {
    border-radius: 8px;
    font-weight: 500;
}

.v-chip {
    border-radius: 8px;
}

.v-alert {
    border-radius: 8px;
}

.v-data-table {
    border-radius: 12px;
}

.modern-table>>>tbody tr:nth-child(even) {
    background-color: #f5f5f5;
}

.modern-table>>>tbody tr:hover {
    background-color: #e3f2fd;
}

.modern-table>>>thead th {
    font-weight: bold;
    background: #e3e3e3;
}
</style>