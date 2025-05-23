<template>
    <v-container class="py-6 px-4" fluid>
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4">Üretim Planı & Sipariş Raporu</v-card-title>
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
            <v-row>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="green-lighten-5">
                        <div class="text-h6 font-weight-bold mb-2">Üretim Planı (Toplam Hammadde/Yarı Mamul İhtiyacı)
                        </div>
                        <Bar v-if="Array.isArray(barData.labels) && Array.isArray(barData.datasets)" :data="barData"
                            :options="barOptions" style="max-height:300px;" />
                        <v-data-table :headers="planHeaders" :items="uretimPlani" :loading="loading" class="elevation-0"
                            density="compact" hide-default-footer />
                    </v-card>
                </v-col>
                <v-col cols="12" md="6">
                    <v-card class="pa-3 mb-4" color="blue-lighten-5">
                        <div class="text-h6 font-weight-bold mb-2">Sipariş Raporu (Ürün/Müşteri Bazlı)</div>
                        <v-data-table :headers="siparisHeaders" :items="siparisRaporu" :loading="loading"
                            class="elevation-0" density="compact" hide-default-footer />
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
        <v-snackbar v-model="snackbar" color="error" timeout="4000">{{ snackbarMsg }}</v-snackbar>
    </v-container>
</template>
<script setup>
import { ref, computed, provide } from 'vue';
import { Bar } from 'vue-chartjs';
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
const uretimPlani = ref([]);
const siparisRaporu = ref([]);
const planHeaders = [
    { text: 'Stok Adı', value: 'stokAd' },
    { text: 'Tip', value: 'stokTip' },
    { text: 'Toplam İhtiyaç (gr)', value: 'toplamGram', align: 'end' },
    { text: 'Kod', value: 'stokKod' }
];
const siparisHeaders = [
    { text: 'Ürün', value: 'urunAd' },
    { text: 'Müşteri', value: 'musteri' },
    { text: 'Toplam Miktar', value: 'toplamMiktar', align: 'end' },
    { text: 'Birim', value: 'birim' }
];
const snackbar = ref(false);
const snackbarMsg = ref('');

const top5Uretim = computed(() => {
    return [...uretimPlani.value]
        .sort((a, b) => b.toplamGram - a.toplamGram)
        .slice(0, 5);
});

const safeChartData = data => {
    if (!data || typeof data !== 'object') return { labels: [], datasets: [] };
    return {
        labels: Array.isArray(data.labels) ? data.labels : [],
        datasets: Array.isArray(data.datasets) ? data.datasets : []
    };
};

const barData = computed(() => safeChartData({
    labels: (top5Uretim.value || []).map(x => x.stokAd),
    datasets: [
        {
            label: 'İhtiyaç (gr)',
            data: (top5Uretim.value || []).map(x => x.toplamGram),
            backgroundColor: [
                '#81c784', '#aed581', '#ffd54f', '#ffb74d', '#e57373'
            ]
        }
    ]
}));
const barOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        title: { display: true, text: 'En Çok İhtiyaç Duyulan 5 Malzeme' }
    },
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
};

// Üretim Planı modülüne özel tema ile Vuetify instance'ı oluştur
const uretimPlaniTheme = {
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
const uretimPlaniVuetify = createCustomVuetify({ themeName: 'uretimPlaniTheme', customTheme: uretimPlaniTheme });
provide('vuetify', uretimPlaniVuetify);

async function fetchReport() {
    loading.value = true;
    try {
        const res = await fetch('http://localhost:3000/api/uretim-plani', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: startDate.value, endDate: endDate.value })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'API hatası');
        const data = await res.json();
        uretimPlani.value = data.uretimPlani || [];
        siparisRaporu.value = data.siparisRaporu || [];
    } catch (e) {
        snackbarMsg.value = e.message || 'Rapor alınamadı';
        snackbar.value = true;
    } finally {
        loading.value = false;
    }
}

// Sayfa açıldığında bugünün raporunu getir
fetchReport();
</script>

<style scoped>
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