<template>
    <v-container fluid class="crm-container">
        <!-- Header section with title and quick actions -->
        <v-row class="ma-0 pa-3" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <v-col cols="12" class="d-flex align-center justify-space-between">
                <div>
                    <h1 class="text-h4 font-weight-bold text-white mb-1">📊 CRM Raporlama</h1>
                    <p class="text-subtitle-1 text-white opacity-90 mb-0">Müşteri ilişkileri ve satış performans analizi
                    </p>
                </div>
                <div class="d-flex align-center gap-2">
                    <v-btn color="white" variant="outlined" @click="refreshAllReports" :loading="loading" size="small">
                        <v-icon left>mdi-refresh</v-icon>
                        Yenile
                    </v-btn>
                    <v-btn color="warning" @click="exportAllReports" size="small">
                        <v-icon left>mdi-download</v-icon>
                        İndir
                    </v-btn>
                </div>
            </v-col>
        </v-row>

        <!-- Date Range Selector -->
        <v-row class="ma-0 pa-3 bg-grey-lighten-5">
            <v-col cols="12" md="6" lg="3">
                <v-text-field v-model="startDate" label="Başlangıç Tarihi" type="date" variant="outlined"
                    density="compact" hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="6" lg="3">
                <v-text-field v-model="endDate" label="Bitiş Tarihi" type="date" variant="outlined" density="compact"
                    hide-details></v-text-field>
            </v-col>
            <v-col cols="12" md="6" lg="3">
                <v-select v-model="selectedReportType" :items="reportTypes" label="Rapor Türü" variant="outlined"
                    density="compact" hide-details></v-select>
            </v-col>
            <v-col cols="12" md="6" lg="3">
                <v-btn color="primary" block @click="fetchAllReports" :loading="loading" size="large">
                    <v-icon left>mdi-magnify</v-icon>
                    Rapor Oluştur
                </v-btn>
            </v-col>
        </v-row>

        <!-- KPI Cards -->
        <v-row class="ma-0 pa-3">
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 text-center kpi-card" color="blue-lighten-5" elevation="2">
                    <v-icon size="40" color="blue">mdi-currency-try</v-icon>
                    <div class="text-h5 font-weight-bold mt-2">₺{{ kpiData.toplamCiro.toLocaleString('tr-TR') }}</div>
                    <div class="text-subtitle-2 text-blue">Toplam Ciro</div>
                    <div class="text-caption" :class="kpiData.ciroArtis >= 0 ? 'text-green' : 'text-red'">
                        {{ kpiData.ciroArtis >= 0 ? '+' : '' }}{{ kpiData.ciroArtis }}%
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 text-center kpi-card" color="green-lighten-5" elevation="2">
                    <v-icon size="40" color="green">mdi-cart</v-icon>
                    <div class="text-h5 font-weight-bold mt-2">{{ kpiData.toplamSiparis.toLocaleString('tr-TR') }}</div>
                    <div class="text-subtitle-2 text-green">Toplam Sipariş</div>
                    <div class="text-caption" :class="kpiData.siparisArtis >= 0 ? 'text-green' : 'text-red'">
                        {{ kpiData.siparisArtis >= 0 ? '+' : '' }}{{ kpiData.siparisArtis }}%
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 text-center kpi-card" color="orange-lighten-5" elevation="2">
                    <v-icon size="40" color="orange">mdi-basket</v-icon>
                    <div class="text-h5 font-weight-bold mt-2">₺{{ kpiData.ortalamaSepetTutari.toLocaleString('tr-TR')
                    }}
                    </div>
                    <div class="text-subtitle-2 text-orange">Ort. Sepet Tutarı</div>
                    <div class="text-caption" :class="kpiData.sepetArtis >= 0 ? 'text-green' : 'text-red'">
                        {{ kpiData.sepetArtis >= 0 ? '+' : '' }}{{ kpiData.sepetArtis }}%
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 text-center kpi-card" color="purple-lighten-5" elevation="2">
                    <v-icon size="40" color="purple">mdi-account-group</v-icon>
                    <div class="text-h5 font-weight-bold mt-2">{{ kpiData.aktifMusteriSayisi.toLocaleString('tr-TR') }}
                    </div>
                    <div class="text-subtitle-2 text-purple">Aktif Müşteri</div>
                    <div class="text-caption" :class="kpiData.musteriArtis >= 0 ? 'text-green' : 'text-red'">
                        {{ kpiData.musteriArtis >= 0 ? '+' : '' }}{{ kpiData.musteriArtis }}%
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <div class="tabs-container">
            <!-- Tabs for different report sections -->
            <v-tabs v-model="activeTab" color="primary" class="ma-3">
                <v-tab value="satis">📈 Satış Analizi</v-tab>
                <v-tab value="musteri">👥 Müşteri Analizi</v-tab>
                <v-tab value="urun">📦 Ürün Performansı</v-tab>
                <v-tab value="finansal">💰 Finansal Analiz</v-tab>
                <v-tab value="kampanya">🎯 Kampanya Performansı</v-tab>
            </v-tabs>

            <div class="window-container">
                <v-window v-model="activeTab" class="ma-3">
                    <!-- Satış Analizi Tab -->
                    <v-window-item value="satis">
                        <v-row>
                            <v-col cols="12" md="8">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Satış Trendi</div>
                                    <SatisTrendiChart 
                                        v-if="subePerformansData.length > 0" 
                                        :data="subePerformansData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="primary">mdi-chart-line</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="primary" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Ödeme Yöntemleri</div>
                                    <OdemeYontemleriChart 
                                        v-if="urunPerformansData.length > 0" 
                                        :data="urunPerformansData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="success">mdi-chart-pie</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="success" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card class="pa-3 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Şube Performansı</div>
                                    <v-data-table :headers="subeHeaders" :items="subePerformansData" :loading="loading"
                                        class="elevation-0" density="compact" items-per-page="10" height="400">
                                        <template v-slot:item.performansSkor="{ item }">
                                            <v-chip
                                                :color="item.performansSkor >= 80 ? 'success' : item.performansSkor >= 60 ? 'warning' : 'error'"
                                                size="small">
                                                {{ item.performansSkor }}%
                                            </v-chip>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- Müşteri Analizi Tab -->
                    <v-window-item value="musteri">
                        <v-row>
                            <v-col cols="12" md="4">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Müşteri Segmentasyonu</div>
                                    <MusteriSegmentChart 
                                        v-if="musteriAnalizData.length > 0" 
                                        :data="musteriAnalizData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="info">mdi-chart-donut</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="info" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="8">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Müşteri Yaşam Döngüsü</div>
                                    <div class="chart-placeholder">
                                        <v-icon size="64" color="warning">mdi-chart-timeline-variant</v-icon>
                                        <div class="text-h6 mt-2">Yaşam Döngüsü</div>
                                        <div class="text-body-2 text-grey">Müşteri yaşam döngüsü analizi</div>
                                        <v-progress-linear indeterminate color="warning"
                                            class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="8">
                                <v-card class="pa-3 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Müşteri Analizi</div>
                                    <v-data-table :headers="musteriHeaders" :items="musteriAnalizData"
                                        :loading="loading" class="elevation-0" density="compact" items-per-page="10"
                                        height="400">
                                        <template v-slot:item.toplamHarcama="{ item }">
                                            ₺{{ item.toplamHarcama.toLocaleString('tr-TR') }}
                                        </template>
                                        <template v-slot:item.sadakatSeviyesi="{ item }">
                                            <v-chip
                                                :color="item.sadakatSeviyesi === 'Yüksek' ? 'success' : item.sadakatSeviyesi === 'Orta' ? 'warning' : 'error'"
                                                size="small">
                                                {{ item.sadakatSeviyesi }}
                                            </v-chip>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-card class="pa-3 top-customers-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Top 5 Müşteri</div>
                                    <div class="pa-3">
                                        <div class="text-h6 mb-3 text-center">⭐ En Değerli Müşteriler</div>
                                        <div v-for="(musteri, index) in musteriAnalizData.slice(0, 5)" :key="index"
                                            class="d-flex align-center mb-2">
                                            <v-avatar :color="index === 0 ? 'warning' : 'grey'" size="32" class="mr-3">
                                                <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                                            </v-avatar>
                                            <div class="flex-grow-1">
                                                <div class="font-weight-medium">{{ musteri.musteriAdi }}</div>
                                                <div class="text-caption text-grey">₺{{
                                                    musteri.toplamHarcama.toLocaleString('tr-TR') }}
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="musteriAnalizData.length === 0" class="text-center text-grey">
                                            <v-icon size="48" color="grey">mdi-account-search</v-icon>
                                            <div class="text-body-2 mt-2">Müşteri verisi yükleniyor...</div>
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- Ürün Performansı Tab -->
                    <v-window-item value="urun">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">En Çok Satan Ürünler</div>
                                    <PerformansBarChart 
                                        v-if="urunPerformansData.length > 0" 
                                        :data="urunPerformansData" 
                                        title="Ürün Satış Performansı"
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="success">mdi-chart-bar</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="success" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Kategori Dağılımı</div>
                                    <OdemeYontemleriChart 
                                        v-if="urunPerformansData.length > 0" 
                                        :data="urunPerformansData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="info">mdi-chart-pie</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="info" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card class="pa-3 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Ürün Performans Detayı</div>
                                    <v-data-table :headers="urunHeaders" :items="urunPerformansData" :loading="loading"
                                        class="elevation-0" density="compact" items-per-page="10" height="400">
                                        <template v-slot:item.toplamSatis="{ item }">
                                            ₺{{ item.toplamSatis.toLocaleString('tr-TR') }}
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- Finansal Analiz Tab -->
                    <v-window-item value="finansal">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Gelir-Gider Analizi</div>
                                    <PerformansBarChart 
                                        v-if="finansalAnalizData.length > 0" 
                                        :data="finansalAnalizData" 
                                        title="Finansal Performans"
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="primary">mdi-chart-line</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="primary" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Kârlılık Analizi</div>
                                    <SatisTrendiChart 
                                        v-if="finansalAnalizData.length > 0" 
                                        :data="finansalAnalizData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="success">mdi-chart-timeline-variant</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="success"
                                            class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card class="pa-3 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Finansal Detay</div>
                                    <v-data-table :headers="finansalHeaders" :items="finansalAnalizData"
                                        :loading="loading" class="elevation-0" density="compact" items-per-page="10"
                                        height="400">
                                        <template v-slot:item.toplamGelir="{ item }">
                                            ₺{{ item.toplamGelir.toLocaleString('tr-TR') }}
                                        </template>
                                        <template v-slot:item.toplamGider="{ item }">
                                            ₺{{ item.toplamGider.toLocaleString('tr-TR') }}
                                        </template>
                                        <template v-slot:item.netKar="{ item }">
                                            <span :class="item.netKar >= 0 ? 'text-green' : 'text-red'">
                                                ₺{{ item.netKar.toLocaleString('tr-TR') }}
                                            </span>
                                        </template>
                                        <template v-slot:item.karMarji="{ item }">
                                            <v-chip
                                                :color="item.karMarji >= 20 ? 'success' : item.karMarji >= 10 ? 'warning' : 'error'"
                                                size="small">
                                                %{{ item.karMarji }}
                                            </v-chip>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- Kampanya Performansı Tab -->
                    <v-window-item value="kampanya">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Kampanya ROI</div>
                                    <PerformansBarChart 
                                        v-if="kampanyaPerformansData.length > 0" 
                                        :data="kampanyaPerformansData" 
                                        title="Kampanya Performansı"
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="warning">mdi-target</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="warning" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-card class="pa-3 mb-4 chart-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Kampanya Dağılımı</div>
                                    <OdemeYontemleriChart 
                                        v-if="kampanyaPerformansData.length > 0" 
                                        :data="kampanyaPerformansData" 
                                    />
                                    <div v-else class="chart-placeholder">
                                        <v-icon size="64" color="info">mdi-truck</v-icon>
                                        <div class="text-h6 mt-2">Veri yükleniyor...</div>
                                        <v-progress-linear indeterminate color="info" class="mt-3"></v-progress-linear>
                                    </div>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card class="pa-3 mb-4 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Stok Durumu</div>
                                    <v-data-table :headers="stokHeaders" :items="stokDurumData" :loading="loading"
                                        class="elevation-0" density="compact" items-per-page="10" height="300">
                                        <template v-slot:item.kritikSeviye="{ item }">
                                            <v-chip :color="item.kritikSeviye ? 'error' : 'success'" size="small">
                                                {{ item.kritikSeviye ? 'Kritik' : 'Normal' }}
                                            </v-chip>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                            <v-col cols="12">
                                <v-card class="pa-3 data-table-card" elevation="2">
                                    <div class="text-h6 font-weight-bold mb-2">Kampanya Detayları</div>
                                    <v-data-table :headers="kampanyaHeaders" :items="kampanyaPerformansData"
                                        :loading="loading" class="elevation-0" density="compact" items-per-page="10"
                                        height="300">
                                        <template v-slot:item.maliyet="{ item }">
                                            ₺{{ item.maliyet.toLocaleString('tr-TR') }}
                                        </template>
                                        <template v-slot:item.gelir="{ item }">
                                            ₺{{ item.gelir.toLocaleString('tr-TR') }}
                                        </template>
                                        <template v-slot:item.roi="{ item }">
                                            <v-chip
                                                :color="item.roi >= 300 ? 'success' : item.roi >= 200 ? 'warning' : 'error'"
                                                size="small">
                                                %{{ item.roi }}
                                            </v-chip>
                                        </template>
                                    </v-data-table>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </div>
        </div>

        <!-- Snackbar for notifications -->
        <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
            {{ snackbarText }}
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Grafik bileşenlerini import et
import SatisTrendiChart from '../components/SatisTrendiChart.vue';
import OdemeYontemleriChart from '../components/OdemeYontemleriChart.vue';
import MusteriSegmentChart from '../components/MusteriSegmentChart.vue';
import PerformansBarChart from '../components/PerformansBarChart.vue';

// Reactive data
const startDate = ref(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
const endDate = ref(new Date().toISOString().slice(0, 10));
const loading = ref(false);
const activeTab = ref('satis');
const selectedReportType = ref('genel');

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');

// Report types - Yeni API formatına uygun
const reportTypes = [
    { title: 'Genel CRM Raporu', value: 'genel' },
    { title: 'Müşteri Analizi', value: 'musteri' },
    { title: 'Müşteri Davranış Analizi', value: 'davranis' },
    { title: 'Segmentasyon Raporu', value: 'segmentasyon' },
    { title: 'Ödeme Analizi', value: 'odeme' }
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

// Data tables
const subePerformansData = ref([]);
const musteriAnalizData = ref([]);
const urunPerformansData = ref([]);
const finansalAnalizData = ref([]);
const kampanyaPerformansData = ref([]);
const stokDurumData = ref([]);

// Table headers
const subeHeaders = [
    { title: 'Şube', key: 'subeAd' },
    { title: 'Satış Adet', key: 'satisAdet' },
    { title: 'Toplam Ciro', key: 'toplamCiro' },
    { title: 'Performans', key: 'performansSkor' }
];

const musteriHeaders = [
    { title: 'Müşteri Adı', key: 'musteriAdi' },
    { title: 'Toplam Harcama', key: 'toplamHarcama' },
    { title: 'Sipariş Sayısı', key: 'siparisSayisi' },
    { title: 'Son Sipariş', key: 'sonSiparisTarihi' },
    { title: 'Sadakat', key: 'sadakatSeviyesi' }
];

const urunHeaders = [
    { title: 'Ürün Adı', key: 'urunAdi' },
    { title: 'Satış Adet', key: 'satisAdet' },
    { title: 'Toplam Satış', key: 'toplamSatis' },
    { title: 'Kategori', key: 'kategori' }
];

const finansalHeaders = [
    { title: 'Dönem', key: 'donem' },
    { title: 'Toplam Gelir', key: 'toplamGelir' },
    { title: 'Toplam Gider', key: 'toplamGider' },
    { title: 'Net Kâr', key: 'netKar' },
    { title: 'Kâr Marjı (%)', key: 'karMarji' }
];

const stokHeaders = [
    { title: 'Ürün Adı', key: 'stokAdi' },
    { title: 'Mevcut Stok', key: 'mevcutStok' },
    { title: 'Minimum Stok', key: 'minimumStok' },
    { title: 'Durum', key: 'kritikSeviye' },
    { title: 'Son Güncelleme', key: 'sonGuncelleme' }
];

const kampanyaHeaders = [
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
    console.log('🔄 CRM raporları yükleniyor...');
    console.log('📊 API URL:', `${import.meta.env.VITE_API_BASE_URL}/reports/crm`);
    console.log('📅 Date Range:', { startDate: startDate.value, endDate: endDate.value });

    try {
        // YENİ CRM raporlama API'sini kullan
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/reports/crm`, {
            startDate: startDate.value,
            endDate: endDate.value,
            reportType: selectedReportType.value,
            detayLevel: 'detay'
        });

        console.log('✅ API Response received:', response);
        console.log('📈 Response data:', response.data);

        const responseData = response.data;

        // Veri kontrolü
        if (!responseData || !responseData.success) {
            console.warn('⚠️ API response başarısız veya boş! Test verisi kullanılıyor...');
            
            // TEST VERİSİ - Gerçek veri gelmediğinde
            loadTestData();
            showSnackbar('API\'den veri alınamadı, test verisi yüklendi!', 'warning');
            return;
        }

        const data = responseData.data;

        // KPI verilerini güncelle (yeni format)
        if (data.ozet) {
        kpiData.value = {
                toplamCiro: data.ozet.toplamCiro || 0,
                ciroArtis: calculateGrowthRate(data.ozet.toplamCiro, data.ozet.oncekiDonemCiro),
                toplamSiparis: data.ozet.toplamSiparis || 0,
                siparisArtis: calculateGrowthRate(data.ozet.toplamSiparis, data.ozet.oncekiDonemSiparis),
                ortalamaSepetTutari: data.ozet.ortalamaSiparisDeğeri || 0,
                sepetArtis: calculateGrowthRate(data.ozet.ortalamaSiparisDeğeri, data.ozet.oncekiDonemOrtalama),
                aktifMusteriSayisi: data.ozet.toplamMusteriSayisi || 0,
                musteriArtis: calculateGrowthRate(data.ozet.toplamMusteriSayisi, data.ozet.oncekiDonemMusteriSayisi)
        };
        }

        console.log('📊 KPI Data updated:', kpiData.value);

        // Şube performansı - enYogunSaatler verisinden türet
        if (data.enYogunSaatler && data.enYogunSaatler.length > 0) {
            subePerformansData.value = data.enYogunSaatler.map((saat, index) => ({
                subeAd: `Saat ${saat.saat}:00`,
                satisAdet: saat.siparisAdeti || 0,
                toplamCiro: saat.toplamTutar || 0,
                performansSkor: Math.min(100, Math.round((saat.siparisAdeti || 0) * 10))
            }));
        } else {
            // Boşsa test verisi yükle
            console.warn('⚠️ Şube performans verisi boş, test verisi yükleniyor...');
            subePerformansData.value = generateTestSalesData();
        }

        console.log('🏢 Şube performansı:', subePerformansData.value);

        // Müşteri analizi (yeni format)
        if (data.musteriSegmentleri && data.musteriSegmentleri.length > 0) {
            musteriAnalizData.value = data.musteriSegmentleri.map(musteri => ({
                musteriAdi: musteri.musteriAd || 'Bilinmeyen',
                toplamHarcama: musteri.toplamHarcama || 0,
                siparisSayisi: musteri.siparisAdeti || 0,
                sonSiparisTarihi: musteri.sonSiparisTarihi ? 
                    new Date(musteri.sonSiparisTarihi).toLocaleDateString('tr-TR') : '-',
                sadakatSeviyesi: musteri.segment || 'Bilinmiyor'
            }));
        } else {
            // Boşsa test verisi yükle
            console.warn('⚠️ Müşteri verisi boş, test verisi yükleniyor...');
            musteriAnalizData.value = generateTestCustomerData();
        }

        console.log('👥 Müşteri analizi:', musteriAnalizData.value);

        // Ürün performansı - ödeme yöntemlerinden türet
        if (data.odemeYontemleri && data.odemeYontemleri.length > 0) {
            urunPerformansData.value = data.odemeYontemleri.map(odeme => ({
                urunAdi: `${odeme.yontem} Ödemeleri`,
                satisAdet: odeme.islemAdeti || 0,
                toplamSatis: odeme.toplamTutar || 0,
                kategori: 'Ödeme Yöntemi'
            }));
        } else {
            // Boşsa test verisi yükle
            console.warn('⚠️ Ödeme yöntemi verisi boş, test verisi yükleniyor...');
            urunPerformansData.value = generateTestPaymentData();
        }

        console.log('📦 Ürün performansı:', urunPerformansData.value);

        // Stok durumu verilerini al
        try {
            console.log('📦 Stok verisi alınıyor...');
            const stokResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stok/alerts`);
            const stokData = stokResponse.data;

            console.log('📦 Stok API response:', stokData);

            if (stokData.kritikStoklar) {
                stokDurumData.value = stokData.kritikStoklar.map(stok => ({
                    stokAdi: stok.ad || 'Bilinmeyen',
                    mevcutStok: stok.mevcutStok || 0,
                    minimumStok: stok.minStokSeviye || 0,
                    kritikSeviye: (stok.mevcutStok || 0) < (stok.minStokSeviye || 0),
                    sonGuncelleme: stok.updatedAt ? 
                        new Date(stok.updatedAt).toLocaleDateString('tr-TR') : '-'
                }));
            }

            console.log('📦 Stok durumu:', stokDurumData.value);
        } catch (error) {
            console.error('❌ Stok verisi alınamadı:', error);
            stokDurumData.value = [];
        }

        // Finansal analiz - müşteri davranışlarından türet
        if (data.musteriDavranislari) {
            const davranis = data.musteriDavranislari;
            finansalAnalizData.value = [
                {
                    donem: 'Bu Dönem',
                    toplamGelir: data.ozet?.toplamCiro || 0,
                    toplamGider: Math.round((data.ozet?.toplamCiro || 0) * 0.65), // %65 gider varsayımı
                    netKar: Math.round((data.ozet?.toplamCiro || 0) * 0.35),
                    karMarji: 35
                },
                {
                    donem: 'Tekrar Eden Müşteriler',
                    toplamGelir: davranis.tekrarEdenMusteriler * 1500, // Ortalama müşteri değeri
                    toplamGider: davranis.tekrarEdenMusteriler * 975,
                    netKar: davranis.tekrarEdenMusteriler * 525,
                    karMarji: 35
                },
                {
                    donem: 'Bir Kerelik Müşteriler',
                    toplamGelir: davranis.birkerelikMusteriler * 800,
                    toplamGider: davranis.birkerelikMusteriler * 520,
                    netKar: davranis.birkerelikMusteriler * 280,
                    karMarji: 35
                }
            ];
        } else {
            // Boşsa test verisi yükle
            console.warn('⚠️ Finansal veri boş, test verisi yükleniyor...');
            finansalAnalizData.value = generateTestFinancialData();
        }

        console.log('💰 Finansal analiz:', finansalAnalizData.value);

        // Kampanya performansı - gerçek verilerden türet
        if (data.ozet && data.musteriSegmentleri && data.musteriSegmentleri.length > 0) {
        kampanyaPerformansData.value = [
                {
                    kampanya: 'VIP Müşteri Kampanyası',
                    baslangic: startDate.value,
                    bitis: endDate.value,
                    maliyet: 3000,
                    gelir: data.musteriSegmentleri.filter(m => m.segment === 'VIP')
                        .reduce((sum, m) => sum + m.toplamHarcama, 0),
                    roi: Math.round(((data.musteriSegmentleri.filter(m => m.segment === 'VIP')
                        .reduce((sum, m) => sum + m.toplamHarcama, 0) - 3000) / 3000) * 100)
                },
                {
                    kampanya: 'Sadık Müşteri Kampanyası',
                    baslangic: startDate.value,
                    bitis: endDate.value,
                    maliyet: 2000,
                    gelir: data.musteriSegmentleri.filter(m => m.segment === 'Sadık')
                        .reduce((sum, m) => sum + m.toplamHarcama, 0),
                    roi: Math.round(((data.musteriSegmentleri.filter(m => m.segment === 'Sadık')
                        .reduce((sum, m) => sum + m.toplamHarcama, 0) - 2000) / 2000) * 100)
                }
        ];
        } else {
            // Boşsa test verisi yükle
            console.warn('⚠️ Kampanya verisi boş, test verisi yükleniyor...');
            kampanyaPerformansData.value = generateTestCampaignData();
        }

        console.log('🎯 Kampanya performansı:', kampanyaPerformansData.value);

        showSnackbar('Raporlar başarıyla yüklendi!', 'success');
        console.log('✅ Tüm veriler başarıyla yüklendi!');
    } catch (error) {
        console.error('❌ CRM raporları yüklenirken hata:', error);
        console.error('❌ Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });

        // API hatası durumunda test verisi yükle
        console.warn('⚠️ API hatası, test verisi yükleniyor...');
        loadTestData();

        if (error.response?.status === 404) {
            showSnackbar('API endpoint bulunamadı! Test verisi yüklendi.', 'warning');
        } else if (error.code === 'ERR_NETWORK') {
            showSnackbar('Backend bağlantısı kurulamadı! Test verisi yüklendi.', 'warning');
        } else {
            showSnackbar('API hatası! Test verisi yüklendi: ' + error.message, 'warning');
        }
    } finally {
        loading.value = false;
        console.log('🏁 fetchAllReports tamamlandı');
    }
}

// Yardımcı fonksiyon: Büyüme oranı hesaplama
function calculateGrowthRate(current, previous) {
    if (!current || !previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
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

// TEST VERİ ÜRETME FONKSİYONLARI
function loadTestData() {
    console.log('🧪 Test verisi yükleniyor...');
    
    // Test KPI verileri
    kpiData.value = {
        toplamCiro: 125000,
        ciroArtis: 15,
        toplamSiparis: 45,
        siparisArtis: 8,
        ortalamaSepetTutari: 2780,
        sepetArtis: 12,
        aktifMusteriSayisi: 28,
        musteriArtis: 5
    };

    subePerformansData.value = generateTestSalesData();
    musteriAnalizData.value = generateTestCustomerData();
    urunPerformansData.value = generateTestPaymentData();
    finansalAnalizData.value = generateTestFinancialData();
    kampanyaPerformansData.value = generateTestCampaignData();
}

function generateTestSalesData() {
    return [
        { subeAd: 'Saat 09:00', satisAdet: 8, toplamCiro: 15000, performansSkor: 80 },
        { subeAd: 'Saat 11:00', satisAdet: 12, toplamCiro: 25000, performansSkor: 100 },
        { subeAd: 'Saat 14:00', satisAdet: 15, toplamCiro: 35000, performansSkor: 95 },
        { subeAd: 'Saat 17:00', satisAdet: 10, toplamCiro: 20000, performansSkor: 85 },
        { subeAd: 'Saat 19:00', satisAdet: 6, toplamCiro: 12000, performansSkor: 60 }
    ];
}

function generateTestCustomerData() {
    return [
        { musteriAdi: 'Ahmet Yılmaz', toplamHarcama: 8500, siparisSayisi: 12, sonSiparisTarihi: '2024-12-15', sadakatSeviyesi: 'VIP' },
        { musteriAdi: 'Fatma Kaya', toplamHarcama: 6200, siparisSayisi: 8, sonSiparisTarihi: '2024-12-10', sadakatSeviyesi: 'Sadık' },
        { musteriAdi: 'Mehmet Öz', toplamHarcama: 4500, siparisSayisi: 6, sonSiparisTarihi: '2024-12-08', sadakatSeviyesi: 'Düzenli' },
        { musteriAdi: 'Ayşe Demir', toplamHarcama: 2800, siparisSayisi: 4, sonSiparisTarihi: '2024-12-05', sadakatSeviyesi: 'Yeni' },
        { musteriAdi: 'Ali Çelik', toplamHarcama: 1200, siparisSayisi: 2, sonSiparisTarihi: '2024-12-01', sadakatSeviyesi: 'Yeni' }
    ];
}

function generateTestPaymentData() {
    return [
        { yontem: 'Nakit', toplamTutar: 45000, value: 45000, label: 'Nakit' },
        { yontem: 'Kredi Kartı', toplamTutar: 35000, value: 35000, label: 'Kredi Kartı' },
        { yontem: 'Havale/EFT', toplamTutar: 25000, value: 25000, label: 'Havale/EFT' },
        { yontem: 'Çek', toplamTutar: 15000, value: 15000, label: 'Çek' },
        { yontem: 'Cari', toplamTutar: 5000, value: 5000, label: 'Cari' }
    ];
}

function generateTestFinancialData() {
    return [
        { donem: 'Bu Dönem', toplamGelir: 125000, toplamGider: 81250, netKar: 43750, karMarji: 35 },
        { donem: 'Geçen Dönem', toplamGelir: 105000, toplamGider: 68250, netKar: 36750, karMarji: 35 },
        { donem: 'Yıllık Ortalama', toplamGelir: 115000, toplamGider: 74750, netKar: 40250, karMarji: 35 }
    ];
}

function generateTestCampaignData() {
    return [
        { kampanya: 'VIP Müşteri Kampanyası', maliyet: 3000, gelir: 18000, roi: 500 },
        { kampanya: 'Sadık Müşteri Kampanyası', maliyet: 2000, gelir: 12000, roi: 500 },
        { kampanya: 'Yeni Müşteri Kampanyası', maliyet: 1500, gelir: 8000, roi: 433 }
    ];
}

// Lifecycle
onMounted(() => {
    fetchAllReports();
});
</script>

<style scoped>
.crm-container {
    background-color: transparent;
    min-height: calc(100vh - 100px);
    flex: 1;
    padding: 0;
}

.text-h4 {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.v-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.v-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.v-tab {
    font-weight: 600;
}

.v-data-table {
    border-radius: 12px;
    overflow: hidden;
}

.gap-2 {
    gap: 8px;
}

.kpi-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-height: 120px;
}

.kpi-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.chart-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-height: 250px;
}

.chart-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.data-table-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.data-table-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.top-customers-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    min-height: 400px;
}

.top-customers-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #9e9e9e;
    text-align: center;
    min-height: 200px;
}

.chart-placeholder .v-icon {
    margin-bottom: 15px;
    opacity: 0.7;
}

.chart-placeholder .text-h6 {
    margin-bottom: 8px;
    color: #666;
    font-weight: 500;
}

.chart-placeholder .text-body-2 {
    margin-bottom: 20px;
    color: #999;
}

.chart-placeholder .v-progress-linear {
    width: 150px;
    border-radius: 10px;
}

.tabs-container {
    flex: 1;
}

.window-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

/* Data table scrollable ayarları */
.v-data-table {
    max-height: 400px !important;
    overflow-y: auto !important;
}

/* Mobil uyumluluk */
@media (max-width: 768px) {
    .kpi-card {
        min-height: 100px;
    }

    .chart-card {
        min-height: 200px;
    }

    .chart-placeholder {
        padding: 20px 10px;
        min-height: 150px;
    }

    .top-customers-card {
        min-height: 300px;
    }
}

/* İyileştirilmiş responsive tasarım */
@media (max-width: 600px) {
    .chart-placeholder .v-icon {
        font-size: 48px !important;
    }

    .chart-placeholder .text-h6 {
        font-size: 1rem !important;
    }

    .chart-placeholder .text-body-2 {
        font-size: 0.85rem !important;
    }
}
</style>