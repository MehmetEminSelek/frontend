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
                        <div class="text-h6 font-weight-bold mb-2">Dönemsel Ciro (₺)</div>
                        <Line :data="ciroLineData" :options="ciroLineOptions" style="max-height:300px;" />
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
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="blue-lighten-5">
                        <div class="text-h6 font-weight-bold mb-2">En Çok Satış Yapan Şubeler</div>
                        <Bar :data="subeBarData" :options="subeBarOptions" style="max-height:300px;" />
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
                            class="elevation-0" density="compact" hide-default-footer :row-class="rowClass" />
                    </v-card>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" md="8">
                    <v-card class="pa-3 mb-4" color="blue-lighten-4">
                        <div class="text-h6 font-weight-bold mb-2">Saatlik Satış Dağılımı (₺)</div>
                        <Line
                            v-if="Array.isArray(saatlikCiroLineData.labels) && Array.isArray(saatlikCiroLineData.datasets)"
                            :data="saatlikCiroLineData" :options="saatlikCiroLineOptions" style="max-height:260px;" />
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

const ciroLineData = computed(() => safeChartData({
    labels: safeLabels(ciro.value?.map?.(x => x.tarih)),
    datasets: [{
        label: 'Ciro',
        data: safeData(ciro.value?.map?.(x => x.toplam)),
        borderColor: '#ffd54f',
        backgroundColor: 'rgba(255, 213, 79, 0.2)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#ffd54f',
        pointBorderColor: '#ffd54f',
        pointRadius: 4
    }]
}));
const ciroLineOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'Dönemsel Ciro (Çizgi Grafik)' }
    },
    scales: { y: { beginAtZero: true } }
};

const urunBarOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: '' } }, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

const urunBarDataAdet = computed(() => {
    const base = safeLabels(urunlerAdet.value).length ? urunlerAdet.value.slice(0, 5) : [];
    return {
        labels: safeLabels(base.map?.(x => x.urunAd)),
        datasets: [{
            label: 'Satış (adet)',
            data: safeData(base.map?.(x => x.toplamMiktar)),
            backgroundColor: base.map?.((_, i) => i === 0 ? '#ffd54f' : '#81c784') || []
        }]
    };
});
const urunBarDataCiro = computed(() => {
    const base = safeLabels(urunlerCiro.value).length ? urunlerCiro.value.slice(0, 5) : [];
    return {
        labels: safeLabels(base.map?.(x => x.urunAd)),
        datasets: [{
            label: 'Ciro (₺)',
            data: safeData(base.map?.(x => x.toplamTutar)),
            backgroundColor: base.map?.((_, i) => i === 0 ? '#ffd54f' : '#ffd180') || []
        }]
    };
});
const filteredUrunBarDataAdet = computed(() => {
    const data = urunBarDataAdet.value;
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return { labels: [], datasets: [] };
    if (!urunFilter.value) return data;
    const idx = data.labels.indexOf(urunFilter.value);
    return idx === -1 ? data : { ...data, labels: [data.labels[idx]], datasets: [{ ...data.datasets[0], data: [data.datasets[0].data[idx]], backgroundColor: [data.datasets[0].backgroundColor[idx]] }] };
});
const filteredUrunBarDataCiro = computed(() => {
    const data = urunBarDataCiro.value;
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return { labels: [], datasets: [] };
    if (!urunFilter.value) return data;
    const idx = data.labels.indexOf(urunFilter.value);
    return idx === -1 ? data : { ...data, labels: [data.labels[idx]], datasets: [{ ...data.datasets[0], data: [data.datasets[0].data[idx]], backgroundColor: [data.datasets[0].backgroundColor[idx]] }] };
});
const filteredSubeBarDataCiro = computed(() => {
    const data = subeBarDataCiro.value;
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return { labels: [], datasets: [] };
    if (!subeFilter.value) return data;
    const idx = data.labels.indexOf(subeFilter.value);
    return idx === -1 ? data : { ...data, labels: [data.labels[idx]], datasets: [{ ...data.datasets[0], data: [data.datasets[0].data[idx]], backgroundColor: [data.datasets[0].backgroundColor[idx]] }] };
});
const filteredSubeBarDataAdet = computed(() => {
    const data = subeBarDataAdet.value;
    if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return { labels: [], datasets: [] };
    if (!subeFilter.value) return data;
    const idx = data.labels.indexOf(subeFilter.value);
    return idx === -1 ? data : { ...data, labels: [data.labels[idx]], datasets: [{ ...data.datasets[0], data: [data.datasets[0].data[idx]], backgroundColor: [data.datasets[0].backgroundColor[idx]] }] };
});

const subeBarDataCiro = computed(() => {
    const base = safeLabels(subelerCiro.value).length ? subelerCiro.value.slice(0, 5) : [];
    return {
        labels: safeLabels(base.map?.(x => x.sube)),
        datasets: [{
            label: 'Satış (₺)',
            data: safeData(base.map?.(x => x.toplamTutar)),
            backgroundColor: base.map?.((_, i) => i === 0 ? '#ffd54f' : '#64b5f6') || []
        }]
    };
});
const subeBarDataAdet = computed(() => {
    const base = safeLabels(subelerAdet.value).length ? subelerAdet.value.slice(0, 5) : [];
    return {
        labels: safeLabels(base.map?.(x => x.sube)),
        datasets: [{
            label: 'Sipariş Adedi',
            data: safeData(base.map?.(x => x.toplamSiparis)),
            backgroundColor: base.map?.((_, i) => i === 0 ? '#ffd54f' : '#b39ddb') || []
        }]
    };
});
const subeBarOptions = { responsive: true, plugins: { legend: { display: false }, title: { display: true, text: '' } }, indexAxis: 'y', scales: { x: { beginAtZero: true } } };

const ortalamaSepetTutari = ref(0);
const saatlikCiro = ref([]);
const saatlikCiroLineData = computed(() => ({
    labels: safeLabels(saatlikCiro.value?.map?.(x => x.saat)),
    datasets: [{
        label: 'Saatlik Ciro',
        data: safeData(saatlikCiro.value?.map?.(x => x.toplam)),
        borderColor: '#64b5f6',
        backgroundColor: 'rgba(100,181,246,0.15)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#64b5f6',
        pointBorderColor: '#64b5f6',
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
</style>