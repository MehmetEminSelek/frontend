<template>
    <v-container class="py-6 px-4" fluid>
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
                <span>🚚 Kargo Operasyonları</span>
                <div class="d-flex align-center">
                    <v-select v-model="selectedKargoDurumu" :items="kargoDurumlari" item-title="ad" item-value="kodu"
                        label="Kargo Durumu" density="compact" hide-details class="mr-4" style="min-width: 200px;" />
                    <v-checkbox v-model="showOnlyHazirlandi" label="Sadece Hazırlandı" density="compact"
                        hide-details class="mr-4" />
                    <v-btn icon="mdi-refresh" variant="text" @click="fetchKargoSiparisler" title="Yenile"></v-btn>
                </div>
            </v-card-title>
            <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
            
            <!-- Kargo İstatistikleri -->
            <v-row class="mb-4">
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="primary" dark>
                        <div class="text-h6">{{ kargoIstatistikleri.kargoyaVerilecek }}</div>
                        <div class="text-caption">Kargoya Verilecek</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="info" dark>
                        <div class="text-h6">{{ kargoIstatistikleri.kargoda }}</div>
                        <div class="text-caption">Kargoda</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="success" dark>
                        <div class="text-h6">{{ kargoIstatistikleri.teslimEdildi }}</div>
                        <div class="text-caption">Teslim Edildi</div>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card class="text-center pa-3" color="secondary" dark>
                        <div class="text-h6">{{ kargoIstatistikleri.subeyeGonderilecek }}</div>
                        <div class="text-caption">Şubeye Gönderilecek</div>
                    </v-card>
                </v-col>
            </v-row>
            
            <v-tabs v-model="tab" grow>
                <v-tab value="kargoyaVerilecek">Kargoya Verilecek</v-tab>
                <v-tab value="subeyeGonderilecek">Şubeye Gönderilecek</v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item value="kargoyaVerilecek">
                    <v-data-table :headers="headers" :items="kargoyaVerilecek" :loading="loading" item-value="id"
                        class="elevation-1" hover density="comfortable" items-per-page="20"
                        no-data-text="Kargoya verilecek sipariş yok." loading-text="Yükleniyor...">
                        <template v-slot:item.tarih="{ item }">{{ formatDate(item.tarih, true) }}</template>
                        <template v-slot:item.kargoDurumu="{ item }">
                            <v-chip :color="getKargoDurumuColor(item.kargoDurumu)" size="small" variant="flat">
                                {{ item.kargoDurumu || 'Bekliyor' }}
                            </v-chip>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn color="primary" size="small" @click="openKargoDialog(item)">Kargo İşlemi</v-btn>
                            <v-btn color="secondary" size="small" class="ml-2" @click="openEtiketDialog(item)">Etiket
                                Yazdır</v-btn>
                        </template>
                    </v-data-table>
                </v-window-item>
                <v-window-item value="subeyeGonderilecek">
                    <v-data-table :headers="headers" :items="subeyeGonderilecek" :loading="loading" item-value="id"
                        class="elevation-1" hover density="comfortable" items-per-page="20"
                        no-data-text="Şubeye gönderilecek sipariş yok." loading-text="Yükleniyor...">
                        <template v-slot:item.tarih="{ item }">{{ formatDate(item.tarih, true) }}</template>
                        <template v-slot:item.kargoDurumu="{ item }">
                            <v-chip :color="getKargoDurumuColor(item.kargoDurumu)" size="small" variant="flat">
                                {{ item.kargoDurumu || 'Bekliyor' }}
                            </v-chip>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn color="primary" size="small" @click="openTransferDialog(item)">Transfer
                                İşlemi</v-btn>
                            <v-btn color="secondary" size="small" class="ml-2" @click="openEtiketDialog(item)">Etiket
                                Yazdır</v-btn>
                        </template>
                    </v-data-table>
                </v-window-item>
            </v-window>
        </v-card>
        <!-- Kargo Dialog -->
        <v-dialog v-model="kargoDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Kargo İşlemi (Sipariş ID: {{ selectedSiparis?.id }})</v-card-title>
                <v-card-text>
                    <v-select v-model="kargoForm.kargoSirketi" :items="kargoSirketleri" item-title="ad" item-value="kodu"
                        label="Kargo Şirketi" required></v-select>
                    <v-text-field v-model="kargoForm.kargoTakipNo" label="Takip Numarası" required></v-text-field>
                    <v-textarea v-model="kargoForm.kargoNotu" label="Kargo Notu" rows="2"></v-textarea>
                    <v-text-field v-model="kargoForm.kargoTarihi" label="Kargo Tarihi" type="date"></v-text-field>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-3">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="closeKargoDialog">İptal</v-btn>
                    <v-btn color="primary" variant="flat" @click="saveKargoDialog" :loading="kargoDialogLoading">Kargoya
                        Ver</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Transfer Dialog -->
        <v-dialog v-model="transferDialog" persistent max-width="400px">
            <v-card>
                <v-card-title class="text-h6">Şubeye Transfer (Sipariş ID: {{ selectedSiparis?.id }})</v-card-title>
                <v-card-text>
                    <v-select v-model="transferForm.hedefSubeId" :items="subeler" item-title="ad" item-value="id"
                        label="Hedef Şube" required></v-select>
                    <v-textarea v-model="transferForm.kargoNotu" label="Transfer Notu" rows="2"></v-textarea>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-3">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="closeTransferDialog">İptal</v-btn>
                    <v-btn color="primary" variant="flat" @click="saveTransferDialog"
                        :loading="transferDialogLoading">Şubeye
                        Gönder</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- Etiket Dialog -->
        <v-dialog v-model="etiketDialog" max-width="420px">
            <v-card>
                <v-card-title class="text-h6">Kargo Etiketi</v-card-title>
                <v-card-text>
                    <div ref="etiketRef" class="etiket-yazdir">
                        <div class="etiket-header">
                            <div style="font-size:20px;font-weight:bold;text-align:center;margin-bottom:10px;">
                                {{ getKargoSirketiAdi(etiketSiparis?.kargoSirketi) || 'KARGO ETİKETİ' }}
                            </div>
                            <div style="border-bottom:2px solid #333;margin-bottom:15px;"></div>
                        </div>
                        <div class="etiket-content">
                            <div class="etiket-row">
                                <strong>Takip No:</strong> 
                                <span class="tracking-number">{{ etiketSiparis?.kargoTakipNo || '-' }}</span>
                            </div>
                            <div class="etiket-row">
                                <strong>Alıcı:</strong> {{ etiketSiparis?.aliciAdi || etiketSiparis?.gorunecekAd || '-' }}
                            </div>
                            <div class="etiket-row">
                                <strong>Adres:</strong> {{ etiketSiparis?.adres || '-' }}
                            </div>
                            <div class="etiket-row">
                                <strong>Tel:</strong> {{ etiketSiparis?.aliciTel || '-' }}
                            </div>
                            <div class="etiket-row">
                                <strong>Sipariş ID:</strong> {{ etiketSiparis?.id }}
                            </div>
                            <div class="etiket-row">
                                <strong>Tarih:</strong> {{ etiketSiparis?.tarih ? formatDate(etiketSiparis.tarih, true) : '-' }}
                            </div>
                            <div class="etiket-row" v-if="etiketSiparis?.kargoNotu">
                                <strong>Not:</strong> {{ etiketSiparis?.kargoNotu }}
                            </div>
                        </div>
                        <div class="etiket-footer">
                            <div style="border-top:2px solid #333;margin-top:15px;padding-top:10px;text-align:center;font-size:12px;">
                                {{ new Date().toLocaleDateString('tr-TR') }} - {{ new Date().toLocaleTimeString('tr-TR') }}
                            </div>
                        </div>
                    </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-3">
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="etiketDialog = false">Kapat</v-btn>
                    <v-btn color="primary" variant="flat" @click="yazdirEtiket">Yazdır</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right"
            multi-line>
            {{ snackbarText }}
            <template v-slot:actions>
                <v-btn :color="snackbarColor === 'error' ? 'white' : 'primary'" variant="text"
                    @click="snackbar = false">Kapat</v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>
<script setup>
import { ref, onMounted, provide, watch } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';

// Kargo modülüne özel tema ile Vuetify instance'ı oluştur
const kargoTheme = {
    dark: false,
    colors: {
        primary: '#1976D2', // Mavi
        secondary: '#90A4AE', // Gri
        accent: '#64B5F6',
        error: '#D32F2F',
        info: '#1976D2',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};
const kargoVuetify = createCustomVuetify({ themeName: 'kargoTheme', extraThemes: { kargoTheme } });
provide('vuetify', kargoVuetify);

const tab = ref('kargoyaVerilecek');
const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Tarih', key: 'tarih', sortable: true },
    { title: 'Müşteri', key: 'gorunecekAd', sortable: true },
    { title: 'Adres', key: 'adres', sortable: false },
    { title: 'Durum', key: 'kargoDurumu', sortable: true },
    { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
];
const kargoyaVerilecek = ref([]);
const subeyeGonderilecek = ref([]);
const subeler = ref([]);
const loading = ref(false);
const error = ref(null);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);
const showOnlyHazirlandi = ref(false);
const selectedKargoDurumu = ref(null);

// Kargo istatistikleri
const kargoIstatistikleri = ref({
    kargoyaVerilecek: 0,
    kargoda: 0,
    teslimEdildi: 0,
    subeyeGonderilecek: 0
});

// Watch showOnlyHazirlandi değişimini
watch(showOnlyHazirlandi, () => {
    fetchKargoSiparisler();
});

// Watch selectedKargoDurumu değişimini
watch(selectedKargoDurumu, () => {
    fetchKargoSiparisler();
});

function showSnackbar(text, color = 'info', timeout = 4000) {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbarTimeout.value = timeout;
    snackbar.value = true;
}
// Kargo Dialog State
const kargoDialog = ref(false);
const kargoDialogLoading = ref(false);
const kargoForm = ref({ kargoSirketi: '', kargoTakipNo: '', kargoNotu: '', kargoTarihi: '' });

// Kargo şirketleri listesi
const kargoSirketleri = [
    { ad: 'Yurtiçi Kargo', kodu: 'YURTICI' },
    { ad: 'MNG Kargo', kodu: 'MNG' },
    { ad: 'PTT Kargo', kodu: 'PTT' },
    { ad: 'Aras Kargo', kodu: 'ARAS' },
    { ad: 'UPS Kargo', kodu: 'UPS' },
    { ad: 'DHL Express', kodu: 'DHL' },
    { ad: 'FedEx', kodu: 'FEDEX' },
    { ad: 'Diğer', kodu: 'DIGER' }
];

// Transfer Dialog State
const transferDialog = ref(false);
const transferDialogLoading = ref(false);
const transferForm = ref({ hedefSubeId: null, kargoNotu: '' });
const selectedSiparis = ref(null);
// Etiket Dialog State
const etiketDialog = ref(false);
const etiketSiparis = ref(null);
const etiketRef = ref(null);

const kargoDurumlari = [
    { ad: 'Kargoya Verilecek', kodu: 'Kargoya Verilecek' },
    { ad: 'Şubeye Gönderilecek', kodu: 'Şubeye Gönderilecek' },
    { ad: 'Kargoda', kodu: 'Kargoda' },
    { ad: 'Şubede Teslim', kodu: 'Şubede Teslim' },
    { ad: 'İptal', kodu: 'İptal' },
    { ad: 'Hazırlandı', kodu: 'Hazırlandı' },
    { ad: 'İşlemde', kodu: 'İşlemde' },
    { ad: 'Diğer', kodu: 'Diğer' }
];

async function fetchKargoSiparisler() {
    loading.value = true; error.value = null;
    try {
        // Tüm siparişleri çek (kargo durumu filtresiz)
        const [allOrdersRes, subeRes, dropdownRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/siparis`),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/siparis`, { params: { kargoDurumu: 'Şubeye Gönderilecek' } }),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/dropdown`),
        ]);
        
        console.log('🚚 Tüm Siparişler API Yanıtı:', allOrdersRes.data?.length);
        
        // Kargo için uygun teslimat türü kodları
        const kargoTeslimatKodlari = ['TT001', 'TT003', 'TT004', 'TT006', 'TT007'];
        
        // Teslimat türüne göre filtrele ve kargo durumu kontrol et
        let filtered = (allOrdersRes.data || []).filter(siparis => {
            const teslimatKodu = siparis.teslimatTuru?.kodu;
            const isKargoTeslimati = kargoTeslimatKodlari.includes(teslimatKodu);
            const kargoCompatible = siparis.kargoDurumu === 'Kargoya Verilecek' || 
                                  siparis.kargoDurumu === null || 
                                  siparis.kargoDurumu === '';
            return isKargoTeslimati && kargoCompatible;
        });
        
        console.log('🚚 Teslimat Türüne Göre Filtrelenmiş:', filtered.length);
        
        // Kargo durumu filtresi
        if (selectedKargoDurumu.value) {
            filtered = filtered.filter(siparis => siparis.kargoDurumu === selectedKargoDurumu.value);
            console.log('🚚 Kargo Durumu Filtrelenmiş:', filtered.length);
        }
        
        // Sadece hazırlandı filtresi
        if (showOnlyHazirlandi.value) {
            filtered = filtered.filter(siparis => siparis.hazirlanmaDurumu === 'Hazırlandı');
            console.log('🚚 Sadece Hazırlandı Olanlar:', filtered.length);
        }
        
        console.log('🚚 Final Kargo Listesi:', filtered.length);
        kargoyaVerilecek.value = filtered;
        subeyeGonderilecek.value = subeRes.data;
        subeler.value = dropdownRes.data.subeler || [];
        
        // Kargo istatistiklerini hesapla
        hesaplaKargoIstatistikleri(allOrdersRes.data || []);
    } catch (err) {
        console.error('🚚 Kargo siparişleri yüklenirken hata:', err);
        error.value = 'Siparişler yüklenirken hata oluştu.';
        kargoyaVerilecek.value = [];
        subeyeGonderilecek.value = [];
        subeler.value = [];
    } finally {
        loading.value = false;
    }
}
function openKargoDialog(item) {
    selectedSiparis.value = item;
    kargoForm.value = { 
        kargoSirketi: '', 
        kargoTakipNo: generateKargoTakipNo(), 
        kargoNotu: '', 
        kargoTarihi: new Date().toISOString().split('T')[0] 
    };
    kargoDialog.value = true;
}
function closeKargoDialog() {
    kargoDialog.value = false;
    selectedSiparis.value = null;
}
async function saveKargoDialog() {
    if (!selectedSiparis.value) return;
    kargoDialogLoading.value = true;
    try {
        await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/siparis/${selectedSiparis.value.id}/kargo`, {
            kargoSirketi: kargoForm.value.kargoSirketi,
            kargoTakipNo: kargoForm.value.kargoTakipNo,
            kargoNotu: kargoForm.value.kargoNotu,
            kargoTarihi: kargoForm.value.kargoTarihi || null,
            kargoDurumu: 'Kargoda',
        });
        showSnackbar('Kargo bilgisi güncellendi!', 'success');
        closeKargoDialog();
        fetchKargoSiparisler();
    } catch (err) {
        showSnackbar('Kargo bilgisi güncellenirken hata oluştu.', 'error');
    } finally {
        kargoDialogLoading.value = false;
    }
}
function openTransferDialog(item) {
    selectedSiparis.value = item;
    transferForm.value = { hedefSubeId: null, kargoNotu: '' };
    transferDialog.value = true;
}
function closeTransferDialog() {
    transferDialog.value = false;
    selectedSiparis.value = null;
}
async function saveTransferDialog() {
    if (!selectedSiparis.value) return;
    if (!transferForm.value.hedefSubeId) {
        showSnackbar('Hedef şube seçmelisiniz.', 'warning');
        return;
    }
    transferDialogLoading.value = true;
    try {
        await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/siparis/${selectedSiparis.value.id}/transfer`, {
            hedefSubeId: transferForm.value.hedefSubeId,
            kargoNotu: transferForm.value.kargoNotu,
            kargoDurumu: 'Şubede Teslim',
        });
        showSnackbar('Transfer işlemi güncellendi!', 'success');
        closeTransferDialog();
        fetchKargoSiparisler();
    } catch (err) {
        showSnackbar('Transfer işlemi güncellenirken hata oluştu.', 'error');
    } finally {
        transferDialogLoading.value = false;
    }
}
function openEtiketDialog(item) {
    etiketSiparis.value = item;
    etiketDialog.value = true;
}
function yazdirEtiket() {
    // Sadece etiket kısmını yazdır
    const printContents = etiketRef.value?.innerHTML;
    const win = window.open('', '', 'width=400,height=600');
    win.document.write('<html><head><title>Kargo Etiketi</title>');
    win.document.write(`
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white; 
            } 
            .etiket-yazdir {
                padding: 20px; 
                min-width: 320px; 
                max-width: 380px; 
                border: 2px solid #333; 
                border-radius: 8px; 
                background: white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .etiket-header {
                text-align: center;
                margin-bottom: 15px;
            }
            .etiket-content {
                margin-bottom: 15px;
            }
            .etiket-row {
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
            }
            .tracking-number {
                font-weight: bold;
                color: #1976D2;
            }
            .etiket-footer {
                text-align: center;
                padding-top: 10px;
                border-top: 2px solid #333;
                margin-top: 15px;
                font-size: 12px;
            }
            @media print {
                body { margin: 0; padding: 10px; }
                .etiket-yazdir { border: 1px solid #000; box-shadow: none; }
            }
        </style>
    `);
    win.document.write('</head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
}
function getKargoDurumuColor(kargoDurumu) {
    const colors = {
        'Kargoya Verilecek': 'primary',
        'Şubeye Gönderilecek': 'secondary',
        'Kargoda': 'info',
        'Şubede Teslim': 'success',
        'İptal': 'error',
        'Hazırlandı': 'success',
        'İşlemde': 'info',
        'Diğer': 'warning',
        'Bekliyor': 'warning'
    };
    return colors[kargoDurumu] || 'warning';
}
function generateKargoTakipNo() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TRK${year}${month}${day}${random}`;
}
function getKargoSirketiAdi(kargoSirketi) {
    const sirketler = {
        'YURTICI': 'Yurtiçi Kargo',
        'MNG': 'MNG Kargo',
        'PTT': 'PTT Kargo',
        'ARAS': 'Aras Kargo',
        'UPS': 'UPS Kargo',
        'DHL': 'DHL Express',
        'FEDEX': 'FedEx',
        'DIGER': 'Diğer'
    };
    return sirketler[kargoSirketi] || 'KARGO';
}
function hesaplaKargoIstatistikleri(siparisler) {
    kargoIstatistikleri.value = {
        kargoyaVerilecek: siparisler.filter(siparis => siparis.kargoDurumu === 'Kargoya Verilecek').length,
        kargoda: siparisler.filter(siparis => siparis.kargoDurumu === 'Kargoda').length,
        teslimEdildi: siparisler.filter(siparis => siparis.kargoDurumu === 'Şubede Teslim').length,
        subeyeGonderilecek: siparisler.filter(siparis => siparis.kargoDurumu === 'Şubeye Gönderilecek').length
    };
}
onMounted(fetchKargoSiparisler);
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

.v-avatar {
    font-weight: bold;
    font-size: 1.2em;
}

.v-data-table {
    border-radius: 12px;
    background: #fff;
}

.v-data-table th {
    background: #90A4AE !important;
    color: #1976D2 !important;
    font-weight: bold;
}

.v-chip {
    border-radius: 8px;
    font-weight: 500;
}

.v-card-title.bg-primary {
    background: #1976D2 !important;
    color: #fff !important;
    border-radius: 12px 12px 0 0;
}

.etiket-yazdir {
    background: #fff;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    min-width: 320px;
    max-width: 380px;
    font-size: 15px;
    margin: 0 auto;
}

.etiket-header {
    text-align: center;
    margin-bottom: 10px;
}

.etiket-content {
    margin-bottom: 15px;
}

.etiket-row {
    margin-bottom: 10px;
}

.tracking-number {
    font-weight: bold;
}

.etiket-footer {
    text-align: center;
    padding-top: 10px;
    border-top: 2px solid #333;
    margin-top: 15px;
}
</style>