<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-4" 
                style="background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%); color: #0D47A1; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
                    <v-icon size="120">mdi-truck</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="#1565C0">mdi-truck-outline</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1" style="color: #0D47A1;">Kargo Operasyonları</h1>
                                <p class="text-h6 mb-0" style="color: #1565C0; opacity: 0.8;">Sevkiyat yönetimi ve kargo takip</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="rgba(13, 71, 161, 0.15)" size="small" class="mr-2" style="color: #0D47A1;">
                                <v-icon start size="16" color="#1565C0">mdi-package-variant</v-icon>
                                Otomatik Etiket
                            </v-chip>
                            <v-chip color="rgba(13, 71, 161, 0.15)" size="small" style="color: #0D47A1;">
                                <v-icon start size="16" color="#1565C0">mdi-map-marker</v-icon>
                                Takip Sistemi
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <div class="mb-3">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <v-select v-model="selectedKargoDurumu" :items="kargoDurumlari" item-title="ad" item-value="kodu"
                                    label="Durum Filtresi" density="compact" variant="solo" 
                                    style="background: rgba(255,255,255,0.9); border-radius: 8px; max-width: 140px;" />
                                <v-checkbox v-model="showOnlyHazirlandi" label="Sadece Hazırlandı" density="compact"
                                    style="color: white;" />
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Statistics Cards -->
        <v-row class="mb-6">
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%); color: white; border: 1px solid #BBDEFB;">
                    <v-icon size="40" class="mb-2">mdi-package-variant</v-icon>
                    <div class="text-h4 font-weight-bold">{{ kargoIstatistikleri.kargoyaVerilecek }}</div>
                    <div class="text-body-2">Kargoya Verilecek</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #81C784 0%, #66BB6A 100%); color: white; border: 1px solid #C8E6C9;">
                    <v-icon size="40" class="mb-2">mdi-truck-fast</v-icon>
                    <div class="text-h4 font-weight-bold">{{ kargoIstatistikleri.kargoda }}</div>
                    <div class="text-body-2">Kargoda</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #A5D6A7 0%, #81C784 100%); color: white; border: 1px solid #E8F5E9;">
                    <v-icon size="40" class="mb-2">mdi-check-circle</v-icon>
                    <div class="text-h4 font-weight-bold">{{ kargoIstatistikleri.teslimEdildi }}</div>
                    <div class="text-body-2">Teslim Edildi</div>
                </v-card>
            </v-col>
            <v-col cols="12" md="3">
                <v-card class="text-center pa-4 rounded-xl" elevation="2" 
                    style="background: linear-gradient(135deg, #FFB74D 0%, #FFA726 100%); color: white; border: 1px solid #FFE0B2;">
                    <v-icon size="40" class="mb-2">mdi-store</v-icon>
                    <div class="text-h4 font-weight-bold">{{ kargoIstatistikleri.subeyeGonderilecek }}</div>
                    <div class="text-body-2">Şubeye Gönderilecek</div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Main Content Card -->
        <v-card class="rounded-xl" elevation="2" style="border: 1px solid #E3F2FD;">
            <v-card-title class="pa-4 d-flex justify-space-between align-center" 
                style="background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%); color: white;">
                <div class="d-flex align-center">
                    <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                        <v-icon color="white">mdi-table</v-icon>
                    </v-avatar>
                    <div>
                        <h3 class="text-h6 font-weight-bold">Kargo İşlemleri</h3>
                        <p class="text-body-2 opacity-80 ma-0">Sevkiyat ve transfer yönetimi</p>
                    </div>
                </div>
                <v-btn icon="mdi-refresh" variant="flat" color="rgba(255,255,255,0.2)" @click="fetchKargoSiparisler" title="Yenile"></v-btn>
            </v-card-title>

            <v-card-text class="pa-4">
                <v-alert v-if="error" type="error" class="mb-4" closable style="border-radius: 8px;">{{ error }}</v-alert>
                
                <v-tabs v-model="tab" grow style="border-radius: 8px;">
                    <v-tab value="kargoyaVerilecek" style="color: #1565C0;">Kargoya Verilecek</v-tab>
                    <v-tab value="subeyeGonderilecek" style="color: #1565C0;">Şubeye Gönderilecek</v-tab>
                </v-tabs>
                
                <v-window v-model="tab" class="mt-4">
                    <v-window-item value="kargoyaVerilecek">
                        <v-data-table :headers="headers" :items="kargoyaVerilecek" :loading="loading" item-value="id"
                            class="cargo-table rounded-lg" hover density="comfortable" items-per-page="20"
                            no-data-text="Kargoya verilecek sipariş yok." loading-text="Yükleniyor...">
                            <template v-slot:item.tarih="{ item }">{{ formatDate(item.tarih, true) }}</template>
                            <template v-slot:item.kargoDurumu="{ item }">
                                <v-chip :color="getKargoDurumuColor(item.kargoDurumu)" size="small" variant="flat">
                                    {{ item.kargoDurumu || 'Bekliyor' }}
                                </v-chip>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn color="#42A5F5" size="small" @click="openKargoDialog(item)" variant="outlined">Kargo İşlemi</v-btn>
                                <v-btn color="#66BB6A" size="small" class="ml-2" @click="openEtiketDialog(item)" variant="outlined">Etiket
                                    Yazdır</v-btn>
                            </template>
                        </v-data-table>
                    </v-window-item>
                    
                    <v-window-item value="subeyeGonderilecek">
                        <v-data-table :headers="headers" :items="subeyeGonderilecek" :loading="loading" item-value="id"
                            class="cargo-table rounded-lg" hover density="comfortable" items-per-page="20"
                            no-data-text="Şubeye gönderilecek sipariş yok." loading-text="Yükleniyor...">
                            <template v-slot:item.tarih="{ item }">{{ formatDate(item.tarih, true) }}</template>
                            <template v-slot:item.kargoDurumu="{ item }">
                                <v-chip :color="getKargoDurumuColor(item.kargoDurumu)" size="small" variant="flat">
                                    {{ item.kargoDurumu || 'Bekliyor' }}
                                </v-chip>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn color="#FFB74D" size="small" @click="openTransferDialog(item)" variant="outlined">Transfer
                                    İşlemi</v-btn>
                                <v-btn color="#66BB6A" size="small" class="ml-2" @click="openEtiketDialog(item)" variant="outlined">Etiket
                                    Yazdır</v-btn>
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </v-card-text>
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
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(13,71,161,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

.cargo-table th {
    background: #E3F2FD !important;
    color: #1565C0 !important;
    font-weight: 600 !important;
}

.cargo-table tbody tr:hover {
    background: rgba(21, 101, 192, 0.03) !important;
}

.v-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>