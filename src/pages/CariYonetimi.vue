<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="8">
                <v-card class="pa-4 elevation-3 rounded-lg" style="background: #fafbfc;">
                    <v-card-title class="d-flex align-center">
                        <v-text-field v-model="search" label="Müşteri Ara" prepend-inner-icon="mdi-magnify" dense
                            hide-details :class="isMobile ? 'w-100' : ''" class="mr-4" style="max-width:300px;" />
                        <v-spacer />
                        <v-btn color="primary" class="elevation-1" @click="dialogYeni = true"><v-icon
                                left>mdi-account-plus</v-icon>Yeni Müşteri</v-btn>
                    </v-card-title>
                    <div style="overflow-x:auto">
                        <v-data-table :headers="headers" :items="filteredCariler" :search="search" item-key="id" dense
                            class="modern-table">
                            <template #item.ad="{ item }">
                                <v-avatar color="primary" size="32" class="mr-2">{{ item.ad.charAt(0).toUpperCase()
                                    }}</v-avatar>
                                <span>{{ item.ad }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <v-btn icon color="info" @click="openDetay(item)"><v-icon>mdi-eye</v-icon></v-btn>
                                <v-btn icon color="primary" @click="openEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
                                <v-btn icon color="red" @click="deleteCari(item)"><v-icon>mdi-delete</v-icon></v-btn>
                            </template>
                        </v-data-table>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" md="4" v-if="!isMobile">
                <v-card v-if="detayCari" class="pa-4 elevation-4 rounded-xl" style="background: #fff;">
                    <v-card-title class="d-flex align-center">
                        <v-avatar color="primary" size="40" class="mr-3">{{ detayCari.ad.charAt(0).toUpperCase()
                            }}</v-avatar>
                        <div>
                            <div class="font-weight-bold text-h6">{{ detayCari.ad }}</div>
                            <div class="grey--text">{{ detayCari.email }}<br>{{ detayCari.telefon }}</div>
                        </div>
                    </v-card-title>
                    <v-card-text>
                        <div v-if="detayCari && detayCari.adresler && detayCari.adresler.length">
                            <b>Adresler:</b>
                            <ul class="pa-0">
                                <li v-for="adres in detayCari.adresler" :key="adres.id" class="mb-1">
                                    <v-chip :color="adres.tip === 'Ev' ? 'green' : adres.tip === 'İş' ? 'blue' : 'grey'"
                                        text-color="white" small class="mr-2">{{ adres.tip }}</v-chip>
                                    <span>{{ adres.adres }}</span>
                                </li>
                            </ul>
                        </div>
                        <div v-else><b>Adres:</b> Yok</div>
                        <div class="mt-2"><b>Bakiye:</b> <span class="font-weight-bold">{{ detayCari.bakiye }} TL</span>
                        </div>
                        <div><b>Toplam Borç:</b> {{ toplamBorc }} TL</div>
                        <div><b>Toplam Alacak:</b> {{ toplamAlacak }} TL</div>
                        <div><b>Kalan Borç:</b> {{ kalanBorc }} TL</div>
                        <div v-if="enYakinVade"><b>En Yakın Vade:</b> {{ enYakinVade }}</div>
                        <div><b>Açıklama:</b> {{ detayCari.aciklama }}</div>
                        <v-divider class="my-2" />
                        <b>Hareketler</b>
                        <div style="overflow-x:auto">
                            <v-data-table :headers="hareketHeaders" :items="hareketler" dense hide-default-footer
                                :items-per-page="5" class="modern-table" />
                        </div>
                        <div class="mt-3 d-flex flex-wrap gap-2">
                            <v-btn color="success" class="elevation-1 mr-2 mb-2" @click="dialogOdeme = true"><v-icon
                                    left>mdi-cash-plus</v-icon>Ödeme Ekle</v-btn>
                            <v-btn color="info" class="elevation-1 mr-2 mb-2" @click="exportExcel"
                                prepend-icon="mdi-file-excel">Excel</v-btn>
                            <v-btn color="deep-orange" class="elevation-1 mr-2 mb-2" @click="exportPDF"
                                prepend-icon="mdi-file-pdf">PDF</v-btn>
                            <v-btn color="warning" class="elevation-1 mr-2 mb-2" @click="openVadeTakip"><v-icon
                                    left>mdi-calendar-clock</v-icon>Vade Takibi</v-btn>
                            <v-btn color="primary" class="elevation-1 mb-2" @click="openFullEdit(detayCari)"><v-icon
                                    left>mdi-pencil</v-icon>Detayları Düzenle</v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Detay Dialog (Mobil) -->
        <v-dialog v-model="dialogDetay" max-width="95vw" persistent scrollable>
            <v-card v-if="detayCari">
                <v-card-title>{{ detayCari.ad }}</v-card-title>
                <v-card-subtitle>{{ detayCari.email }}<br>{{ detayCari.telefon }}</v-card-subtitle>
                <v-card-text>
                    <div v-if="detayCari && detayCari.adresler && detayCari.adresler.length">
                        <b>Adresler:</b>
                        <ul>
                            <li v-for="adres in detayCari.adresler" :key="adres.id">
                                <b>{{ adres.tip }}:</b> {{ adres.adres }}
                            </li>
                        </ul>
                    </div>
                    <div v-else><b>Adres:</b> Yok</div>
                    <div><b>Bakiye:</b> {{ detayCari.bakiye }} TL</div>
                    <div><b>Toplam Borç:</b> {{ toplamBorc }} TL</div>
                    <div><b>Toplam Alacak:</b> {{ toplamAlacak }} TL</div>
                    <div><b>Kalan Borç:</b> {{ kalanBorc }} TL</div>
                    <div v-if="enYakinVade"><b>En Yakın Vade:</b> {{ enYakinVade }}</div>
                    <div><b>Açıklama:</b> {{ detayCari.aciklama }}</div>
                    <v-divider class="my-2" />
                    <b>Hareketler</b>
                    <div style="overflow-x:auto">
                        <v-data-table :headers="hareketHeaders" :items="hareketler" dense hide-default-footer
                            :items-per-page="5" />
                    </div>
                    <v-btn color="success" class="mt-2" @click="dialogOdeme = true">Ödeme Ekle</v-btn>
                    <v-btn color="info" class="mt-2" @click="exportExcel" prepend-icon="mdi-file-excel">Excel</v-btn>
                    <v-btn color="deep-orange" class="mt-2 ml-2" @click="exportPDF"
                        prepend-icon="mdi-file-pdf">PDF</v-btn>
                    <v-btn color="warning" class="mt-2 ml-2" @click="openVadeTakip">Vade Takibi</v-btn>
                    <v-btn color="primary" class="mt-2" @click="openFullEdit(detayCari)"><v-icon
                            left>mdi-pencil</v-icon>Detayları Düzenle</v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="closeDetay">Kapat</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Yeni Müşteri Dialog -->
        <v-dialog v-model="dialogYeni" max-width="600">
            <v-card :class="isMobile ? 'pa-4' : ''">
                <v-card-title>Yeni Müşteri</v-card-title>
                <v-card-text>
                    <v-text-field v-model="yeniCari.ad" label="Ad" required />
                    <v-text-field v-model="yeniCari.telefon" label="Telefon" />
                    <v-text-field v-model="yeniCari.email" label="Email" />
                    <v-textarea v-model="yeniCari.aciklama" label="Açıklama" />
                    <div class="mt-4">
                        <b>Adresler</b>
                        <div v-for="(adres, idx) in yeniCari.adresler" :key="idx" class="d-flex align-center mb-2">
                            <v-select v-model="adres.tip" :items="['Ev', 'İş', 'Diğer']" label="Tip" dense
                                style="max-width:100px" />
                            <v-text-field v-model="adres.adres" label="Adres" dense class="ml-2" />
                            <v-btn icon color="red" @click="removeAdres(idx)"
                                v-if="yeniCari.adresler.length > 1"><v-icon>mdi-delete</v-icon></v-btn>
                        </div>
                        <v-btn color="primary" variant="text" @click="addAdres"><v-icon left>mdi-plus</v-icon>Adres
                            Ekle</v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeYeni">İptal</v-btn>
                    <v-btn color="primary" @click="addCari">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Ödeme Dialogu -->
        <v-dialog v-model="dialogOdeme" max-width="400">
            <v-card :class="isMobile ? 'pa-4' : ''">
                <v-card-title>Ödeme Ekle</v-card-title>
                <v-card-text>
                    <v-text-field v-model.number="odemeTutar" label="Tutar (TL)" type="number" />
                    <v-select v-model="odemeYontemi" :items="['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Diğer']"
                        label="Ödeme Yöntemi" clearable />
                    <v-textarea v-model="odemeAciklama" label="Açıklama" />
                    <v-text-field v-model="odemeVade" label="Vade Tarihi" type="date" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeOdeme">İptal</v-btn>
                    <v-btn color="success" @click="addOdeme">Ekle</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Vade Takibi Dialog -->
        <v-dialog v-model="dialogVadeTakip" max-width="600">
            <v-card>
                <v-card-title>Vadesi Geçmiş Borçlar (30+ gün)</v-card-title>
                <v-card-text>
                    <v-data-table :headers="vadeHeaders" :items="vadeList" item-key="cariId" dense>
                        <template #item.actions="{ item }">
                            <v-checkbox v-model="selectedVade" :value="item.cariId" hide-details></v-checkbox>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="dialogVadeTakip = false">Kapat</v-btn>
                    <v-btn color="success" @click="sendVadeSms" :disabled="selectedVade.length === 0">SMS Gönder</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Cari Detaylarını Düzenle Dialog -->
        <v-dialog v-model="dialogFullEdit" max-width="700">
            <v-card>
                <v-card-title>Cari Detaylarını Düzenle</v-card-title>
                <v-card-text>
                    <v-text-field v-model="editCari.ad" label="Ad" required />
                    <v-text-field v-model="editCari.telefon" label="Telefon" />
                    <v-text-field v-model="editCari.email" label="Email" />
                    <v-text-field v-model="editCari.musteriKodu" label="Müşteri Kodu" disabled />
                    <v-text-field v-model="editCari.sube?.ad" label="Şube" disabled />
                    <v-textarea v-model="editCari.aciklama" label="Açıklama" />
                    <div class="mt-4">
                        <b>Adresler</b>
                        <div v-for="(adres, idx) in editCari.adresler" :key="adres.id || idx"
                            class="d-flex align-center mb-2">
                            <v-select v-model="adres.tip" :items="['Ev', 'İş', 'Diğer']" label="Tip" dense
                                style="max-width:100px" />
                            <v-text-field v-model="adres.adres" label="Adres" dense class="ml-2" />
                            <v-btn icon color="red" @click="removeEditAdres(idx)"
                                v-if="editCari.adresler.length > 1"><v-icon>mdi-delete</v-icon></v-btn>
                        </div>
                        <v-btn color="primary" variant="text" @click="addEditAdres"><v-icon left>mdi-plus</v-icon>Adres
                            Ekle</v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeFullEdit">İptal</v-btn>
                    <v-btn color="primary" @click="saveFullEdit">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="2000"
            :location="isMobile ? 'top' : 'bottom'">{{
                snackbar.text }}</v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const cariler = ref([]);
const search = ref('');
const detayCari = ref(null);
const hareketler = ref([]);
const dialogYeni = ref(false);
const dialogOdeme = ref(false);
const dialogDetay = ref(false);
const dialogVadeTakip = ref(false);
const dialogFullEdit = ref(false);
const yeniCari = ref({ ad: '', telefon: '', email: '', aciklama: '', adresler: [{ tip: 'Ev', adres: '' }] });
const odemeTutar = ref(0);
const odemeAciklama = ref('');
const odemeYontemi = ref('');
const odemeVade = ref('');
const snackbar = ref({ show: false, text: '', color: 'success' });
const isMobile = ref(false);
const vadeList = ref([]);
const selectedVade = ref([]);
const editCari = ref({ ad: '', telefon: '', email: '', aciklama: '', musteriKodu: '', sube: {}, adresler: [] });

const headers = [
    { text: 'Ad', value: 'ad' },
    { text: 'Telefon', value: 'telefon' },
    { text: 'Bakiye', value: 'bakiye' },
    { text: 'İşlemler', value: 'actions', sortable: false },
];
const hareketHeaders = [
    { text: 'Tarih', value: 'createdAt' },
    { text: 'Tip', value: 'tip' },
    { text: 'Tutar', value: 'tutar' },
    { text: 'Açıklama', value: 'aciklama' },
];
const vadeHeaders = [
    { text: 'Ad', value: 'ad' },
    { text: 'Telefon', value: 'telefon' },
    { text: 'Kalan Borç', value: 'kalanBorc' },
    { text: 'Vade Tarihi', value: 'vadeTarihi' },
    { text: 'Seç', value: 'actions', sortable: false },
];

const filteredCariler = computed(() => {
    if (!search.value) return cariler.value;
    return cariler.value.filter(c => c.ad.toLowerCase().includes(search.value.toLowerCase()));
});

const toplamBorc = computed(() => hareketler.value.filter(h => h.direction === 'borc').reduce((a, b) => a + (b.tutar || 0), 0));
const toplamAlacak = computed(() => hareketler.value.filter(h => h.direction === 'alacak').reduce((a, b) => a + (b.tutar || 0), 0));
const kalanBorc = computed(() => toplamBorc.value - toplamAlacak.value);
const enYakinVade = computed(() => {
    const vadeler = hareketler.value.filter(h => h.vadeTarihi && h.direction === 'borc').map(h => h.vadeTarihi);
    if (!vadeler.length) return null;
    return vadeler.sort()[0].split('T')[0];
});

function updateScreen() {
    isMobile.value = window.innerWidth < 960;
}

onMounted(() => {
    fetchCariler();
    updateScreen();
    window.addEventListener('resize', updateScreen);
});
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateScreen);
});

async function fetchCariler() {
    const { data } = await axios.get('/api/cari');
    cariler.value = data.map(c => ({ ...c, adresler: c.adresler || [] }));
}

function openDetay(item) {
    detayCari.value = item;
    fetchHareketler(item.id);
    if (isMobile.value) dialogDetay.value = true;
}

function closeDetay() {
    dialogDetay.value = false;
    detayCari.value = null;
}

function openEdit(item) {
    Object.assign(yeniCari.value, item);
    if (!yeniCari.value.adresler || !Array.isArray(yeniCari.value.adresler) || yeniCari.value.adresler.length === 0) {
        yeniCari.value.adresler = [{ tip: 'Ev', adres: '' }];
    }
    dialogYeni.value = true;
}

function closeYeni() {
    dialogYeni.value = false;
    yeniCari.value = { ad: '', telefon: '', email: '', aciklama: '', adresler: [{ tip: 'Ev', adres: '' }] };
}

async function deleteCari(item) {
    if (confirm('Silmek istediğinize emin misiniz?')) {
        await axios.delete('/api/cari', { data: { id: item.id } });
        snackbar.value = { show: true, text: 'Cari silindi', color: 'success' };
        fetchCariler();
        detayCari.value = null;
        dialogDetay.value = false;
    }
}

async function addCari() {
    if (!yeniCari.value.ad) {
        snackbar.value = { show: true, text: 'Ad zorunlu', color: 'error' };
        return;
    }
    const payload = { ...yeniCari.value };
    if (!payload.adresler || !Array.isArray(payload.adresler) || payload.adresler.length === 0) {
        payload.adresler = [{ tip: 'Ev', adres: '' }];
    }
    if (payload.id) {
        await axios.put('/api/cari', payload);
        snackbar.value = { show: true, text: 'Müşteri güncellendi', color: 'success' };
    } else {
        await axios.post('/api/cari', payload);
        snackbar.value = { show: true, text: 'Müşteri eklendi', color: 'success' };
    }
    closeYeni();
    fetchCariler();
}

async function fetchHareketler(cariId) {
    const { data } = await axios.get('/api/cari/hareket?cariId=' + cariId);
    hareketler.value = data;
}

async function addOdeme() {
    if (!detayCari.value) return;
    await axios.post('/api/cari/odeme', {
        cariId: detayCari.value.id,
        tutar: odemeTutar.value,
        aciklama: odemeAciklama.value,
        odemeYontemi: odemeYontemi.value,
        vadeTarihi: odemeVade.value || null,
    });
    snackbar.value = { show: true, text: 'Ödeme eklendi', color: 'success' };
    closeOdeme();
    fetchCariler();
    fetchHareketler(detayCari.value.id);
}

function closeOdeme() {
    dialogOdeme.value = false;
    odemeTutar.value = 0;
    odemeAciklama.value = '';
    odemeYontemi.value = '';
    odemeVade.value = '';
}

function exportExcel() {
    if (!detayCari.value || !hareketler.value.length) return;
    const ws = XLSX.utils.json_to_sheet(hareketler.value.map(h => ({
        Tarih: new Date(h.createdAt).toLocaleString(),
        Tip: h.tip,
        Tutar: h.tutar,
        Açıklama: h.aciklama || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hareketler');
    XLSX.writeFile(wb, `CariEkstresi_${detayCari.value.ad}.xlsx`);
}

function exportPDF() {
    if (!detayCari.value || !hareketler.value.length) return;
    const doc = new jsPDF();
    doc.text(`Cari Ekstresi: ${detayCari.value.ad}`, 14, 14);
    doc.autoTable({
        head: [['Tarih', 'Tip', 'Tutar', 'Açıklama']],
        body: hareketler.value.map(h => [
            new Date(h.createdAt).toLocaleString(),
            h.tip,
            h.tutar,
            h.aciklama || ''
        ]),
        startY: 20
    });
    doc.save(`CariEkstresi_${detayCari.value.ad}.pdf`);
}

function openVadeTakip() {
    axios.get('/api/cari/vade-takip').then(r => {
        vadeList.value = r.data;
        selectedVade.value = [];
        dialogVadeTakip.value = true;
    });
}

async function sendVadeSms() {
    if (!selectedVade.value.length) return;
    const { data } = await axios.post('/api/cari/vade-takip', { cariIds: selectedVade.value });
    snackbar.value = { show: true, text: `${data.sent.length} kişiye SMS gönderildi`, color: 'success' };
    dialogVadeTakip.value = false;
}

function addAdres() {
    yeniCari.value.adresler.push({ tip: 'Ev', adres: '' });
}

function removeAdres(idx) {
    yeniCari.value.adresler.splice(idx, 1);
}

function openFullEdit(item) {
    editCari.value = JSON.parse(JSON.stringify(item));
    if (!editCari.value.adresler || !Array.isArray(editCari.value.adresler) || editCari.value.adresler.length === 0) {
        editCari.value.adresler = [{ tip: 'Ev', adres: '' }];
    }
    dialogFullEdit.value = true;
}

function closeFullEdit() {
    dialogFullEdit.value = false;
    editCari.value = { ad: '', telefon: '', email: '', aciklama: '', musteriKodu: '', sube: {}, adresler: [] };
}

function addEditAdres() {
    editCari.value.adresler.push({ tip: 'Ev', adres: '' });
}

function removeEditAdres(idx) {
    editCari.value.adresler.splice(idx, 1);
}

async function saveFullEdit() {
    if (!editCari.value.ad) {
        snackbar.value = { show: true, text: 'Ad zorunlu', color: 'error' };
        return;
    }
    const payload = { ...editCari.value };
    if (payload.sube && payload.sube.id) payload.subeId = payload.sube.id;
    delete payload.sube;
    await axios.put('/api/cari', payload);
    snackbar.value = { show: true, text: 'Cari güncellendi', color: 'success' };
    closeFullEdit();
    fetchCariler();
}
</script>

<style scoped>
.modern-table {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.06);
    background: #fff;
}

.v-card {
    transition: box-shadow 0.2s;
}

.v-card:hover {
    box-shadow: 0 4px 16px rgba(60, 60, 60, 0.12);
}

.v-btn {
    transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
    filter: brightness(1.08);
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.10);
}

.v-avatar {
    font-weight: bold;
    font-size: 1.2em;
}
</style>