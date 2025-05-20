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
                        <Bar :data="barData" :options="barOptions" style="max-height:300px;" />
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
import { ref, computed } from 'vue';
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

const barData = computed(() => ({
    labels: top5Uretim.value.map(x => x.stokAd),
    datasets: [
        {
            label: 'İhtiyaç (gr)',
            data: top5Uretim.value.map(x => x.toplamGram),
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