<template>
    <v-container class="py-6 px-4" fluid>
        <!-- Header -->
        <v-card class="pa-6 mb-6 rounded-lg" elevation="2" 
            style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 1px solid #dee2e6;">
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                        <v-icon size="40" class="mr-3" color="#495057">mdi-chart-line</v-icon>
                            <div>
                            <h1 class="text-h4 font-weight-bold mb-1" style="color: #343a40;">Satış Raporları</h1>
                            <p class="text-body-1 mb-0" style="color: #6c757d;">Günlük ve aylık satış performansı</p>
                        </div>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                    <v-card class="pa-4" color="#f8f9fa" elevation="0" style="border: 1px solid #dee2e6;">
                        <div class="text-h5 font-weight-bold" style="color: #28a745;">
                            ₺{{ toplamCiro.toLocaleString('tr-TR') }}
                        </div>
                        <div class="text-body-2" style="color: #6c757d;">Toplam Ciro</div>
                    </v-card>
                    </v-col>
                </v-row>
            </v-card>

        <!-- Filters -->
        <v-card class="pa-4 mb-6 rounded-lg" elevation="1" style="border: 1px solid #dee2e6;">
            <v-row align="center">
                    <v-col cols="12" md="3">
                        <v-text-field 
                            v-model="startDate" 
                            label="Başlangıç Tarihi" 
                            type="date"
                            variant="outlined" 
                        density="compact"
                        color="#6c757d"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field 
                            v-model="endDate" 
                            label="Bitiş Tarihi" 
                            type="date"
                            variant="outlined"
                        density="compact"
                        color="#6c757d"
                            hide-details />
                    </v-col>
                <v-col cols="12" md="3">
                    <v-btn 
                        color="#495057" 
                        variant="elevated" 
                        @click="fetchReport" 
                        :loading="loading"
                        prepend-icon="mdi-refresh" 
                        class="w-100"
                        elevation="2">
                            Raporu Getir
                        </v-btn>
                    </v-col>
                <v-col cols="12" md="3">
                    <v-btn 
                        color="#28a745" 
                        variant="outlined" 
                        @click="exportCSV"
                        prepend-icon="mdi-file-excel" 
                        class="w-100">
                        Excel İndir
                        </v-btn>
                    </v-col>
                </v-row>
        </v-card>

        <!-- Main Charts -->
        <v-row>
            <!-- Günlük Ciro Trendi -->
            <v-col cols="12" lg="8">
                <v-card class="rounded-lg" elevation="2" style="border: 1px solid #dee2e6;">
                    <v-card-title class="pa-4" style="background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                            <div class="d-flex align-center">
                            <v-icon class="mr-3" color="#495057">mdi-chart-line</v-icon>
                                <div>
                                <h3 class="text-h6 font-weight-bold" style="color: #343a40;">Günlük Ciro Trendi</h3>
                                <p class="text-body-2 mb-0" style="color: #6c757d;">{{ formattedDateRange }}</p>
                            </div>
                        </div>
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 8px; padding: 16px; min-height: 350px;">
                            <Line v-if="gunlukCiroData.labels.length > 0" 
                                :data="gunlukCiroData" 
                                :options="chartOptions" />
                            <div v-else class="d-flex align-center justify-center" style="height: 300px;">
                                <div class="text-center">
                                    <v-icon size="64" color="#dee2e6">mdi-chart-line</v-icon>
                                    <p class="text-body-1 mt-2" style="color: #6c757d;">Veri yükleniyor...</p>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- En Çok Satan Ürünler -->
            <v-col cols="12" lg="4">
                <v-card class="rounded-lg" elevation="2" style="border: 1px solid #dee2e6;">
                    <v-card-title class="pa-4" style="background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                            <div class="d-flex align-center">
                            <v-icon class="mr-3" color="#495057">mdi-trophy</v-icon>
                                <div>
                                <h3 class="text-h6 font-weight-bold" style="color: #343a40;">En Çok Satan Ürünler</h3>
                                <p class="text-body-2 mb-0" style="color: #6c757d;">Adet bazında sıralama</p>
                            </div>
                        </div>
                    </v-card-title>
                    <v-card-text class="pa-4">
                        <div style="background: white; border-radius: 8px; padding: 16px; min-height: 350px;">
                            <Bar v-if="urunSatisChartData.labels.length > 0" 
                                :data="urunSatisChartData" 
                                :options="urunChartOptions" />
                            <div v-else class="d-flex align-center justify-center" style="height: 300px;">
                                <div class="text-center">
                                    <v-icon size="64" color="#dee2e6">mdi-chart-bar</v-icon>
                                    <p class="text-body-1 mt-2" style="color: #6c757d;">Veri yükleniyor...</p>
                                </div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Satış Detay Tablosu -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card class="rounded-lg" elevation="2" style="border: 1px solid #dee2e6;">
                    <v-card-title class="pa-4" style="background: #f8f9fa; border-bottom: 1px solid #dee2e6;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-icon class="mr-3" color="#495057">mdi-table</v-icon>
                                <div>
                                    <h3 class="text-h6 font-weight-bold" style="color: #343a40;">Satış Detay Tablosu</h3>
                                    <p class="text-body-2 mb-0" style="color: #6c757d;">
                                        {{ satisDetay.length }} kayıt
                                    </p>
                                </div>
                            </div>
                        </div>
                    </v-card-title>
                    <v-card-text class="pa-0">
                        <v-data-table 
                            :headers="satisHeaders" 
                            :items="satisDetay" 
                            :loading="loading"
                            class="clean-table"
                            density="comfortable" 
                            :items-per-page="25"
                            items-per-page-text="Sayfa başına:"
                            no-data-text="Veri bulunamadı">
                            
                            <template #item.tarih="{ item }">
                                <span style="color: #495057;">{{ formatDate(item.tarih) }}</span>
                            </template>
                            
                            <template #item.tutar="{ item }">
                                <span class="font-weight-bold" style="color: #28a745;">
                                    ₺{{ (item.tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                                </span>
                            </template>
                            
                            <template #bottom>
                                <div class="pa-4" style="background: #f8f9fa; border-top: 1px solid #dee2e6;">
                                    <div class="d-flex justify-space-between align-center">
                                        <span class="font-weight-bold" style="color: #495057;">Toplam:</span>
                                        <span class="text-h6 font-weight-bold" style="color: #28a745;">
                                            ₺{{ totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Toast/Snackbar -->
        <v-snackbar v-model="snackbar" color="error" timeout="4000">
            {{ snackbarMsg }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Line, Bar } from 'vue-chartjs';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

// Reactive data
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const loading = ref(false);
const satisDetay = ref([]);
const ciroData = ref([]);
const urunSatisData = ref([]);
const snackbar = ref(false);
const snackbarMsg = ref('');
const toplamCiro = ref(0);

// Table headers - Yeni API uyumlu
const satisHeaders = [
    { title: 'Tarih', key: 'tarih', width: '15%' },
    { title: 'Ürün', key: 'urunAdi', width: '25%' },
    { title: 'Şube', key: 'sube', width: '15%' },
    { title: 'Müşteri', key: 'musteri', width: '20%' },
    { title: 'Miktar', key: 'miktar', align: 'end', width: '10%' },
    { title: 'Tutar (₺)', key: 'tutar', align: 'end', width: '15%' }
];



// Computed properties
const formattedDateRange = computed(() => {
    if (!startDate.value || !endDate.value) return '';
    return `${formatDate(startDate.value)} - ${formatDate(endDate.value)}`;
});

const totalAmount = computed(() => {
    return satisDetay.value.reduce((sum, item) => sum + (item.tutar || 0), 0);
});

const gunlukCiroData = computed(() => {
    if (!ciroData.value || ciroData.value.length === 0) {
        return { labels: [], datasets: [] };
    }

    const labels = ciroData.value.map(item => formatDate(item.tarih));
    const data = ciroData.value.map(item => item.ciro || 0);
    
    return {
        labels,
        datasets: [{
            label: 'Günlük Ciro (₺)',
            data,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }]
    };
});

const urunSatisChartData = computed(() => {
    if (!urunSatisData.value || urunSatisData.value.length === 0) {
        return { labels: [], datasets: [] };
    }
    
    // En çok satan 5 ürünü al
    const topUrunler = urunSatisData.value.slice(0, 5);
    const labels = topUrunler.map(item => item.urunAdi || item.urunAd);
    const data = topUrunler.map(item => item.toplamMiktar || item.satisAdedi || 0);
    
    return {
        labels,
        datasets: [{
            label: 'Satış Adedi',
            data,
            backgroundColor: [
                '#28a745',  // Yeşil
                '#17a2b8',  // Cyan  
                '#ffc107',  // Sarı
                '#fd7e14',  // Turuncu
                '#6f42c1'   // Mor
            ],
            borderColor: [
                '#1e7e34',
                '#138496', 
                '#e0a800',
                '#e8690b',
                '#59359a'
            ],
            borderWidth: 1,
            borderRadius: 4
        }]
    };
});

// Chart options - Line chart için
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#28a745',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
                label: function(context) {
                    return `Ciro: ₺${context.parsed.y.toLocaleString('tr-TR')}`;
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    size: 11
                },
                color: '#6c757d'
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    size: 11
                },
                color: '#6c757d',
                callback: function(value) {
                    return '₺' + value.toLocaleString('tr-TR');
                }
            }
        }
    }
};

// Chart options - Bar chart için
const urunChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Yatay bar chart
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#28a745',
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
                label: function(context) {
                    return `Satış: ${context.parsed.x} adet`;
                }
            }
        }
    },
    scales: {
        x: {
            beginAtZero: true,
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
                font: {
                    size: 11
                },
                color: '#6c757d'
            }
        },
        y: {
            grid: {
                display: false
            },
            ticks: {
                font: {
                    size: 11
                },
                color: '#6c757d'
            }
        }
    }
};

// Functions
async function fetchReport() {
    loading.value = true;
    try {
        console.log('📊 Gerçek sipariş verileri yükleniyor...');
        console.log('📅 Tarih aralığı:', startDate.value, '-', endDate.value);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reports/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                startDate: startDate.value, 
                endDate: endDate.value,
                reportType: 'genel',
                detayLevel: 'detay'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API hatası');
        }
        
        const response_data = await response.json();
        const data = response_data.data;
        
        // Yeni API formatına göre verileri set et
        ciroData.value = data.gunlukTrend || [];
        satisDetay.value = data.satisDetaylari || [];
        urunSatisData.value = data.enCokSatanUrunler || [];
        toplamCiro.value = data.ozet?.toplamCiro || 0;
        
        console.log('✅ Yeni API ile satış verileri yüklendi:');
        console.log('- Günlük ciro kayıtları:', ciroData.value.length);
        console.log('- Satış detay kayıtları:', satisDetay.value.length);
        console.log('- En çok satan ürünler:', urunSatisData.value.length);
        console.log('- Toplam ciro:', toplamCiro.value);
        console.log('- API Response Meta:', response_data.data.meta);
        
    } catch (error) {
        console.error('❌ Satış raporu hatası:', error);
        snackbarMsg.value = error.message || 'Gerçek veriler yüklenemedi';
        snackbar.value = true;
        
        // Hata durumunda test verisi yükle
        console.log('🧪 Fallback: Test verileri yükleniyor...');
        loadTestData();
    } finally {
        loading.value = false;
    }
}

function loadTestData() {
    console.log('🧪 Test verisi yükleniyor...');
    
    // Test ciro verisi - son 30 gün
    const testCiro = [];
    const bugün = new Date();
    for (let i = 29; i >= 0; i--) {
        const tarih = new Date(bugün);
        tarih.setDate(bugün.getDate() - i);
        testCiro.push({
            tarih: tarih.toISOString().slice(0, 10),
            ciro: Math.floor(Math.random() * 15000) + 5000 // 5000-20000 arası
        });
    }
    
    // Test satış detayı - daha fazla veri
    const testDetay = [
        { tarih: '2024-12-15', urunAd: 'Baklava', sube: 'Merkez', musteri: 'Ahmet Yılmaz', miktar: 2, tutar: 1500 },
        { tarih: '2024-12-15', urunAd: 'Kadayıf', sube: 'Merkez', musteri: 'Fatma Kaya', miktar: 1, tutar: 800 },
        { tarih: '2024-12-15', urunAd: 'Börek', sube: 'Şube 1', musteri: 'Zeynep Arslan', miktar: 4, tutar: 1200 },
        { tarih: '2024-12-14', urunAd: 'Baklava', sube: 'Şube 1', musteri: 'Mehmet Öz', miktar: 3, tutar: 2250 },
        { tarih: '2024-12-14', urunAd: 'Börek', sube: 'Merkez', musteri: 'Ayşe Demir', miktar: 5, tutar: 1000 },
        { tarih: '2024-12-14', urunAd: 'Kurabiye', sube: 'Şube 2', musteri: 'Hasan Kaya', miktar: 10, tutar: 500 },
        { tarih: '2024-12-13', urunAd: 'Baklava', sube: 'Şube 2', musteri: 'Ali Çelik', miktar: 1, tutar: 750 },
        { tarih: '2024-12-13', urunAd: 'Pasta', sube: 'Merkez', musteri: 'Elif Doğan', miktar: 2, tutar: 1600 },
        { tarih: '2024-12-13', urunAd: 'Kadayıf', sube: 'Şube 1', musteri: 'Mustafa Şen', miktar: 3, tutar: 2400 },
        { tarih: '2024-12-12', urunAd: 'Baklava', sube: 'Merkez', musteri: 'Gül Aydın', miktar: 5, tutar: 3750 },
        { tarih: '2024-12-12', urunAd: 'Börek', sube: 'Şube 2', musteri: 'Okan Yurt', miktar: 8, tutar: 1600 },
        { tarih: '2024-12-12', urunAd: 'Kurabiye', sube: 'Merkez', musteri: 'Seda Kök', miktar: 15, tutar: 750 },
        { tarih: '2024-12-11', urunAd: 'Pasta', sube: 'Şube 1', musteri: 'Kemal Özer', miktar: 1, tutar: 800 },
        { tarih: '2024-12-11', urunAd: 'Kadayıf', sube: 'Merkez', musteri: 'İrem Sakar', miktar: 2, tutar: 1600 },
        { tarih: '2024-12-10', urunAd: 'Baklava', sube: 'Şube 2', musteri: 'Cem Taş', miktar: 4, tutar: 3000 }
    ];
    
    // Test ürün satış verisi
    const testUrunSatis = [
        { urunAd: 'Baklava', satisAdedi: 156, toplamTutar: 234000 },
        { urunAd: 'Kadayıf', satisAdedi: 89, toplamTutar: 133500 },
        { urunAd: 'Börek', satisAdedi: 67, toplamTutar: 100500 },
        { urunAd: 'Kurabiye', satisAdedi: 45, toplamTutar: 67500 },
        { urunAd: 'Pasta', satisAdedi: 32, toplamTutar: 96000 }
    ];
    
    ciroData.value = testCiro;
    satisDetay.value = testDetay;
    urunSatisData.value = testUrunSatis;
    toplamCiro.value = testCiro.reduce((sum, item) => sum + item.ciro, 0);
    
    console.log('📊 Test verileri yüklendi:');
    console.log('- Ciro kayıtları:', ciroData.value.length);
    console.log('- Satış detay kayıtları:', satisDetay.value.length);
    console.log('- Ürün satış kayıtları:', urunSatisData.value.length);
}

function exportCSV() {
    const rows = [
        ['Tarih', 'Ürün', 'Şube', 'Müşteri', 'Miktar', 'Tutar (₺)'],
        ...satisDetay.value.map(r => [
            r.tarih, 
            r.urunAd, 
            r.sube, 
            r.musteri, 
            r.miktar, 
            r.tutar
        ])
    ];
    
    const csv = rows.map(row => 
        row.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satis-raporu-${startDate.value}_${endDate.value}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit'
    });
}

// Initialize
onMounted(() => {
    fetchReport();
});
</script>

<style scoped>
.v-card {
    transition: all 0.2s ease-in-out;
}

.v-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.clean-table :deep(.v-data-table__th) {
    background: #f8f9fa !important;
    color: #495057 !important;
    font-weight: 600 !important;
    border-bottom: 1px solid #dee2e6 !important;
}

.clean-table :deep(.v-data-table__td) {
    border-bottom: 1px solid #f1f3f4 !important;
}

.clean-table :deep(tbody tr:hover) {
    background: rgba(0, 0, 0, 0.02) !important;
}

.space-y-3 > * + * {
    margin-top: 12px;
}
</style>