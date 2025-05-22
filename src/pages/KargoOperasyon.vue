<template>
    <v-container class="py-6 px-4" fluid>
        <v-card class="pa-4 rounded-lg" elevation="2">
            <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
                <span>🚚 Kargo Operasyonları</span>
                <v-btn icon="mdi-refresh" variant="text" @click="fetchKargoSiparisler" title="Yenile"></v-btn>
            </v-card-title>
            <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
            <v-tabs v-model="tab" grow>
                <v-tab value="kargoyaVerilecek">Kargoya Verilecek</v-tab>
                <v-tab value="subeyeGonderilecek">Şubeye Gönderilecek</v-tab>
            </v-tabs>
            <v-window v-model="tab">
                <v-window-item value="kargoyaVerilecek">
                    <v-data-table :headers="headers" :items="kargoyaVerilecek" :loading="loading" item-value="id"
                        class="elevation-1" hover density="comfortable" items-per-page="20"
                        no-data-text="Kargoya verilecek sipariş yok." loading-text="Yükleniyor...">
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
                    <v-text-field v-model="kargoForm.kargoSirketi" label="Kargo Şirketi" required></v-text-field>
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
                        <div style="font-size:18px;font-weight:bold;">{{ etiketSiparis?.kargoSirketi || 'KARGO' }}</div>
                        <div><strong>Takip No:</strong> {{ etiketSiparis?.kargoTakipNo || '-' }}</div>
                        <div><strong>Alıcı:</strong> {{ etiketSiparis?.aliciAdi || '-' }}</div>
                        <div><strong>Adres:</strong> {{ etiketSiparis?.adres || '-' }}</div>
                        <div><strong>Tel:</strong> {{ etiketSiparis?.aliciTel || '-' }}</div>
                        <div><strong>Sipariş ID:</strong> {{ etiketSiparis?.id }}</div>
                        <div><strong>Tarih:</strong> {{ etiketSiparis?.tarih ? (etiketSiparis.tarih + '').slice(0, 10) :
                            '-' }}
                        </div>
                        <div><strong>Not:</strong> {{ etiketSiparis?.kargoNotu || '-' }}</div>
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
import { ref, onMounted, provide } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';

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
// Transfer Dialog State
const transferDialog = ref(false);
const transferDialogLoading = ref(false);
const transferForm = ref({ hedefSubeId: null, kargoNotu: '' });
const selectedSiparis = ref(null);
// Etiket Dialog State
const etiketDialog = ref(false);
const etiketSiparis = ref(null);
const etiketRef = ref(null);
async function fetchKargoSiparisler() {
    loading.value = true; error.value = null;
    try {
        const [kargoRes, subeRes, dropdownRes] = await Promise.all([
            axios.get('http://localhost:3000/api/siparis', { params: { kargoDurumu: 'Kargoya Verilecek' } }),
            axios.get('http://localhost:3000/api/siparis', { params: { kargoDurumu: 'Şubeye Gönderilecek' } }),
            axios.get('http://localhost:3000/api/dropdown'),
        ]);
        kargoyaVerilecek.value = kargoRes.data;
        subeyeGonderilecek.value = subeRes.data;
        subeler.value = dropdownRes.data.subeler || [];
    } catch (err) {
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
    kargoForm.value = { kargoSirketi: '', kargoTakipNo: '', kargoNotu: '', kargoTarihi: '' };
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
        await axios.patch(`http://localhost:3000/api/siparis/${selectedSiparis.value.id}/kargo`, {
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
        await axios.patch(`http://localhost:3000/api/siparis/${selectedSiparis.value.id}/transfer`, {
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
    win.document.write('<style>body{font-family:sans-serif;} .etiket-yazdir{padding:16px;min-width:320px;max-width:380px;border:1px solid #333;border-radius:8px;}</style>');
    win.document.write('</head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
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
</style>