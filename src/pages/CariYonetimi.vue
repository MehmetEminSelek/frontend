<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card class="pa-4 elevation-3 rounded-lg" style="background: #fafbfc;">
                    <v-card-title class="d-flex align-center">
                        <v-text-field v-model="search" label="Müşteri Ara" prepend-inner-icon="mdi-magnify" dense
                            hide-details class="mr-4" style="max-width:300px;" />
                        <v-spacer />
                        <v-btn color="info" class="elevation-1 mr-2" @click="downloadExcelTemplate">
                            <v-icon left>mdi-download</v-icon>Excel Şablonunu İndir
                        </v-btn>
                        <input ref="excelInput" type="file" accept=".xlsx" style="display:none"
                            @change="onExcelFileChange" />
                        <v-btn color="success" class="elevation-1 mr-2" @click="triggerExcelInput">
                            <v-icon left>mdi-upload</v-icon>Excel'den Yükle
                        </v-btn>
                        <v-btn color="primary" class="elevation-1" @click="openDialogYeni"><v-icon
                                left>mdi-account-plus</v-icon>Yeni Müşteri</v-btn>
                    </v-card-title>
                    <div v-if="excelResults.length > 0" class="my-2">
                        <v-alert type="info" border="left" prominent>
                            <div v-for="(r, i) in excelResults" :key="i">
                                <span v-if="r.status === 'ok'" class="text-success">✔</span>
                                <span v-else-if="r.status === 'skipped'" class="text-warning">⏭</span>
                                <span v-else class="text-error">✖</span>
                                {{ r.musteriKodu }} - {{ r.ad }} <span v-if="r.message">({{ r.message }})</span>
                            </div>
                        </v-alert>
                    </div>
                    <div style="overflow-x:auto">
                        <v-data-table :headers="headers" :items="filteredCariler" item-key="id" dense
                            class="modern-table">
                            <template #item.ad="{ item }">
                                <v-avatar color="primary" size="32" class="mr-2">{{ item.ad.charAt(0).toUpperCase()
                                    }}</v-avatar>
                                <span>{{ item.ad }}</span>
                            </template>
                            <template #item.musteriKodu="{ item }">
                                <span>{{ item.musteriKodu }}</span>
                            </template>
                            <template #item.telefon="{ item }">
                                <span>{{ item.telefon }}</span>
                            </template>
                            <template #item.bakiye="{ item }">
                                <span>{{ item.bakiye }}</span>
                            </template>
                            <template #item.enYakinVade="{ item }">
                                <span>{{ item.enYakinVade || '-' }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <v-btn icon color="secondary" density="compact" class="mr-1"
                                    @click="openAdresDialog(item)"><v-icon>mdi-home-map-marker</v-icon></v-btn>
                                <v-btn icon color="info" density="compact" class="mr-1"
                                    @click="openDialogDetay(item)"><v-icon>mdi-eye</v-icon></v-btn>
                                <v-btn icon color="primary" density="compact" class="mr-1"
                                    @click="openDialogFullEdit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
                                <v-btn icon color="red" density="compact"
                                    @click="deleteCari(item)"><v-icon>mdi-delete</v-icon></v-btn>
                            </template>
                        </v-data-table>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Detay Dialog (Mobil) -->
        <v-dialog v-model="dialogDetay" max-width="900" persistent scrollable>
            <v-card v-if="detayCari">
                <v-card-title class="text-h5 font-weight-bold mb-1">{{ detayCari.ad }}</v-card-title>
                <v-card-subtitle class="mb-2">{{ detayCari.email }}<br>{{ detayCari.telefon }}</v-card-subtitle>
                <v-card-text>
                    <v-row class="mb-2">
                        <v-col cols="12" md="6">
                            <v-sheet class="pa-3 mb-2 rounded-lg" color="#f5f7fa">
                                <div class="d-flex align-center mb-1">
                                    <span class="font-weight-bold mr-2">Bakiye:</span>
                                    <span class="text-h6">{{ detayCari.bakiye }} TL</span>
                                </div>
                                <div class="d-flex align-center mb-1">
                                    <span class="font-weight-bold mr-2">Toplam Borç:</span>
                                    <span>{{ toplamBorc }} TL</span>
                                </div>
                                <div class="d-flex align-center mb-1">
                                    <span class="font-weight-bold mr-2">Toplam Alacak:</span>
                                    <span>{{ toplamAlacak }} TL</span>
                                </div>
                                <div class="d-flex align-center mb-1">
                                    <span class="font-weight-bold mr-2">Kalan Borç:</span>
                                    <span :class="{ 'text-error': kalanBorc > 0, 'text-success': kalanBorc <= 0 }">{{
                                        kalanBorc }}
                                        TL</span>
                                </div>
                                <div v-if="enYakinVade" class="d-flex align-center mb-1">
                                    <span class="font-weight-bold mr-2">En Yakın Vade:</span>
                                    <span>{{ enYakinVade }}</span>
                                </div>
                            </v-sheet>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-sheet class="pa-3 mb-2 rounded-lg" color="#f5f7fa">
                                <div class="font-weight-bold mb-1">Açıklama:</div>
                                <div>{{ detayCari.aciklama || '—' }}</div>
                            </v-sheet>
                        </v-col>
                    </v-row>
                    <div class="font-weight-bold mb-2 mt-2 text-h6">Hareketler</div>
                    <div style="overflow-x:auto">
                        <v-data-table :headers="hareketHeaders" :items="hareketler" dense hide-default-footer
                            :items-per-page="5" class="modern-table modern-movement-table">
                            <template #item.createdAt="{ item }">
                                {{ formatDate(item.createdAt, true) }}
                            </template>
                            <template #item.tip="{ item }">
                                <v-chip :color="item.tip === 'siparis_odeme' ? 'success' : 'info'" size="small"
                                    variant="tonal">
                                    <v-icon start size="16">
                                        {{ item.tip === 'siparis_odeme' ? 'mdi-receipt-text' : 'mdi-cash' }}
                                    </v-icon>
                                    {{ item.tip === 'siparis_odeme' ? 'Sipariş Ödemesi' : item.tip }}
                                </v-chip>
                            </template>
                            <template #item.tutar="{ item }">
                                <span class="text-right d-block font-weight-medium"
                                    :class="item.direction === 'alacak' ? 'text-success' : 'text-error'">
                                    {{ item.direction === 'alacak' ? '+' : '-' }}{{ item.tutar }} ₺
                                </span>
                            </template>
                            <template #item.aciklama="{ item }">
                                <div>
                                    {{ item.aciklama }}
                                    <v-chip v-if="item.siparisDetay" size="x-small" color="primary" variant="outlined"
                                        class="ml-2" @click="openSiparisDetay(item.siparisDetay)"
                                        style="cursor: pointer;">
                                        <v-icon start size="12">mdi-eye</v-icon>
                                        Detay
                                    </v-chip>
                                </div>
                            </template>
                        </v-data-table>
                    </div>
                    <div class="mt-4 d-flex flex-wrap gap-2">
                        <v-btn color="success" class="elevation-1 mr-2 mb-2" @click="openDialogOdeme"><v-icon
                                left>mdi-cash-plus</v-icon>Ödeme Ekle</v-btn>
                        <v-btn color="info" class="elevation-1 mr-2 mb-2" @click="exportExcel"
                            prepend-icon="mdi-file-excel">Excel</v-btn>
                        <v-btn color="deep-orange" class="elevation-1 mr-2 mb-2" @click="exportPDF"
                            prepend-icon="mdi-file-pdf">PDF</v-btn>
                        <v-btn color="warning" class="elevation-1 mr-2 mb-2" @click="openVadeTakipDialog"><v-icon
                                left>mdi-calendar-clock</v-icon>Vade Takibi</v-btn>
                        <v-btn color="primary" class="elevation-1 mb-2" @click="openDialogFullEdit(detayCari)"><v-icon
                                left>mdi-pencil</v-icon>Detayları Düzenle</v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="closeDialogDetay">Kapat</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Yeni Müşteri Dialog -->
        <v-dialog v-model="dialogYeni" max-width="600">
            <v-card>
                <v-card-title>Yeni Müşteri</v-card-title>
                <v-card-text>
                    <v-text-field v-model="yeniCari.ad" label="Ad" required />
                    <v-text-field v-model="yeniCari.telefon" label="Telefon" />
                    <v-text-field v-model="yeniCari.email" label="Email" />
                    <v-textarea v-model="yeniCari.aciklama" label="Açıklama" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeDialogYeni">İptal</v-btn>
                    <v-btn color="primary" @click="addCari">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Ödeme Dialogu -->
        <v-dialog v-model="dialogOdeme" max-width="400">
            <v-card>
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
                    <v-btn text @click="closeDialogOdeme">İptal</v-btn>
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
                    <v-btn text @click="closeVadeTakip">İptal</v-btn>
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
                    <v-text-field :value="editCari.sube?.ad" label="Şube" disabled />
                    <v-textarea v-model="editCari.aciklama" label="Açıklama" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeDialogFullEdit">İptal</v-btn>
                    <v-btn color="primary" @click="saveFullEdit">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Adres Dialogu -->
        <v-dialog v-model="dialogAdres" max-width="600">
            <v-card>
                <v-card-title class="text-h5 font-weight-bold">Adresler</v-card-title>
                <v-card-text>
                    <div v-if="adreslerList.length === 0" class="mb-2">Kayıtlı adres yok.</div>
                    <v-row v-else class="mb-2" dense>
                        <v-col v-for="(adres, i) in adreslerList" :key="i" cols="12">
                            <v-card class="adres-card d-flex flex-row justify-space-between align-center mb-2 pa-4">
                                <div class="adres-info">
                                    <div class="adres-baslik">{{ adres.adres }}</div>
                                    <div class="adres-tip">{{ adres.tip }}</div>
                                </div>
                                <v-btn icon color="red" @click="removeAdres(i)"
                                    size="small"><v-icon>mdi-delete</v-icon></v-btn>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-divider class="my-2" />
                    <v-text-field v-model="yeniAdres.adres" label="Yeni Adres" class="mb-2" />
                    <v-select v-model="yeniAdres.tip" :items="['Ev', 'İş', 'Diğer']" label="Adres Tipi" class="mb-2" />
                    <v-btn color="success" @click="addAdres" :disabled="!yeniAdres.adres">Ekle</v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closeAdresDialog">Kapat</v-btn>
                    <v-btn color="primary" @click="saveAdresler" :loading="adresKayitLoading">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="2000"
            :location="isMobile ? 'top' : 'bottom'">{{
                snackbar.text }}</v-snackbar>

        <!-- Epic Excel Loading Screen -->
        <ExcelLoadingScreen :show="loadingExcel" title="Cariler Yükleniyor"
            subtitle="Excel dosyasından müşteri bilgileri okunuyor ve sisteme ekleniyor..."
            :stats="excelLoadingStats" />
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../utils/date';
import ExcelLoadingScreen from '../components/ExcelLoadingScreen.vue';
import { apiClient } from '@/utils/api'

const cariler = ref([]);
const search = ref('');
const detayCari = ref(null);
const hareketler = ref([]);
const dialogYeni = ref(false);
const dialogOdeme = ref(false);
const dialogDetay = ref(false);
const dialogVadeTakip = ref(false);
const dialogFullEdit = ref(false);
const dialogAdres = ref(false);
const yeniCari = ref({ ad: '', telefon: '', email: '', aciklama: '' });
const odemeTutar = ref(0);
const odemeAciklama = ref('');
const odemeYontemi = ref('');
const odemeVade = ref('');
const snackbar = ref({ show: false, text: '', color: 'success' });
const isMobile = ref(false);
const vadeList = ref([]);
const selectedVade = ref([]);
const editCari = ref({ ad: '', telefon: '', email: '', aciklama: '', musteriKodu: '', sube: {}, adresler: [] });
const excelInput = ref(null);
const excelResults = ref([]);
const loadingExcel = ref(false);
const excelLoadingStats = ref(null);
const adreslerList = ref([]);
const adresCariId = ref(null);
const yeniAdres = ref({ tip: 'Ev', adres: '' });
const adresKayitLoading = ref(false);

const headers = [
    { title: 'ADI', key: 'ad' },
    { title: 'MÜŞTERİ KODU', key: 'musteriKodu' },
    { title: 'TEL', key: 'telefon' },
    { title: 'GÜNCEL BORÇ', key: 'bakiye' },
    { title: 'EN YAKIN VADE/GEÇMİŞ VADE', key: 'enYakinVade' },
    { title: 'İşlemler', key: 'actions', sortable: false },
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

function openDialogYeni() { dialogYeni.value = true; }
function closeDialogYeni() {
    dialogYeni.value = false;
    yeniCari.value = { ad: '', telefon: '', email: '', aciklama: '' };
}

function openDialogDetay(item) {
    detayCari.value = item;
    fetchHareketler(item.id);
    dialogDetay.value = true;
}
function closeDialogDetay() {
    dialogDetay.value = false;
    detayCari.value = null;
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
    payload.adresler = (payload.adresler || []).filter(a => a.adres && a.adres.trim() !== '');
    if (payload.adresler.length === 0) {
        snackbar.value = { show: true, text: 'En az bir adres girin', color: 'error' };
        return;
    }
    if (payload.id) {
        await axios.put('/api/cari', payload);
        snackbar.value = { show: true, text: 'Müşteri güncellendi', color: 'success' };
    } else {
        await axios.post('/api/cari', payload);
        snackbar.value = { show: true, text: 'Müşteri eklendi', color: 'success' };
    }
    closeDialogYeni();
    fetchCariler();
}

async function fetchHareketler(cariId) {
    try {
        console.log('🔍 Cari ID için hareketler çekiliyor:', cariId);

        // Hem cari hareketlerini hem de sipariş ödemelerini çek
        const [cariHareketRes, siparislerRes] = await Promise.all([
            axios.get('/api/cari/hareket?cariId=' + cariId),
            apiClient.get('/siparis') // Tüm siparişleri çek, cariId filtrelemesi frontend'de yapılacak
        ]);

        const cariHareketler = cariHareketRes.data || [];
        const tumSiparisler = siparislerRes.data || [];

        // Bu cariye ait siparişleri filtrele
        const cariSiparisler = tumSiparisler.filter(siparis =>
            siparis.cariId === cariId ||
            (siparis.gonderenAdi && detayCari.value &&
                siparis.gonderenAdi.toLowerCase().includes(detayCari.value.ad.toLowerCase()))
        );

        console.log('🏦 Cari Hareketler:', cariHareketler.length);
        console.log('📦 Cari Siparişleri:', cariSiparisler.length);

        // Sipariş ödemelerini düzleştir
        const siparisOdemeleri = [];
        cariSiparisler.forEach(siparis => {
            if (siparis.odemeler && siparis.odemeler.length > 0) {
                siparis.odemeler.forEach(odeme => {
                    siparisOdemeleri.push({
                        ...odeme,
                        tip: 'siparis_odeme',
                        direction: 'alacak',
                        aciklama: `Sipariş #${siparis.id} ödemesi${odeme.aciklama ? ' - ' + odeme.aciklama : ''}${odeme.odemeYontemi ? ' (' + odeme.odemeYontemi + ')' : ''}`,
                        tutar: odeme.tutar,
                        createdAt: odeme.odemeTarihi,
                        siparisId: siparis.id,
                        siparisDetay: {
                            id: siparis.id,
                            tarih: siparis.tarih,
                            gonderenAdi: siparis.gonderenAdi,
                            toplamTutar: siparis.birimFiyat || 0,
                            teslimatTuru: siparis.teslimatTuru?.ad
                        }
                    });
                });
            }
        });

        console.log('💰 Sipariş Ödemeleri:', siparisOdemeleri.length);

        // Tüm hareketleri birleştir ve tarihe göre sırala
        const tumHareketler = [...cariHareketler, ...siparisOdemeleri];
        tumHareketler.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        hareketler.value = tumHareketler;
        console.log('📊 Toplam Hareket:', tumHareketler.length);

    } catch (error) {
        console.error('❌ Hareketler çekilirken hata:', error);
        hareketler.value = [];
    }
}

function openDialogOdeme() { dialogOdeme.value = true; }
function closeDialogOdeme() {
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
    if (!detayCari.value || !Array.isArray(hareketler.value) || !hareketler.value.length)
        return;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });
    doc.setFont('helvetica', '');
    // Başlık ve üst bilgi
    doc.setFontSize(18);
    doc.setTextColor(40, 70, 150);
    doc.text(`Cari Ekstresi`, 14, 16, { encoding: 'windows-1254' });
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(`Müşteri: ${detayCari.value.ad}`, 14, 26, { encoding: 'windows-1254' });
    doc.setFontSize(10);
    doc.text(`Telefon: ${detayCari.value.telefon || '-'}`, 14, 32, { encoding: 'windows-1254' });
    doc.text(`E-posta: ${detayCari.value.email || '-'}`, 80, 32, { encoding: 'windows-1254' });

    // Özet kutusu (gri arka plan)
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(12, 36, 185, 16, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Bakiye: ${detayCari.value.bakiye} TL`, 16, 44, { encoding: 'windows-1254' });
    doc.text(`Toplam Borç: ${toplamBorc.value} TL`, 60, 44, { encoding: 'windows-1254' });
    doc.text(`Toplam Alacak: ${toplamAlacak.value} TL`, 120, 44, { encoding: 'windows-1254' });
    doc.text(`Kalan Borç: ${kalanBorc.value} TL`, 16, 50, { encoding: 'windows-1254' });
    if (enYakinVade.value) {
        doc.text(`En Yakın Vade: ${enYakinVade.value}`, 60, 50, { encoding: 'windows-1254' });
    }

    // Açıklama kutusu (her zaman özet kutusunun altında, tam genişlikte)
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(12, 54, 185, 12, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Açıklama: ${detayCari.value.aciklama || '—'}`, 16, 62, { encoding: 'windows-1254' });

    // Hareketler tablosu
    autoTable(doc, {
        head: [['Tarih', 'Tip', 'Tutar', 'Açıklama']],
        body: hareketler.value.map(h => [
            new Date(h.createdAt).toLocaleString(),
            h.tip,
            h.tutar,
            h.aciklama || ''
        ]),
        startY: 70,
        headStyles: { fillColor: [40, 70, 150], textColor: 255, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 10, halign: 'center' },
        styles: { cellPadding: 2, overflow: 'linebreak' },
        margin: { left: 12, right: 12 }
    });

    doc.save(`CariEkstresi_${detayCari.value.ad}.pdf`);
}

function openVadeTakipDialog() {
    axios.get('/api/cari/vade-takip').then(r => {
        vadeList.value = r.data;
        selectedVade.value = [];
        dialogVadeTakip.value = true;
    });
}
function closeVadeTakip() { dialogVadeTakip.value = false; }

async function openDialogFullEdit(item) {
    const { data } = await axios.get('/api/cari/' + item.id);
    editCari.value = data;
    if (!editCari.value.adresler || !Array.isArray(editCari.value.adresler) || editCari.value.adresler.length === 0) {
        editCari.value.adresler = [{ tip: 'Ev', adres: '' }];
    }
    dialogFullEdit.value = true;
}
function closeDialogFullEdit() {
    dialogFullEdit.value = false;
    editCari.value = { ad: '', telefon: '', email: '', aciklama: '', musteriKodu: '', sube: {}, adresler: [] };
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
    closeDialogFullEdit();
    fetchCariler();
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
    closeDialogOdeme();
    fetchCariler();
    fetchHareketler(detayCari.value.id);
}

async function sendVadeSms() {
    if (!selectedVade.value.length) return;
    const { data } = await axios.post('/api/cari/vade-takip', { cariIds: selectedVade.value });
    snackbar.value = { show: true, text: `${data.sent.length} kişiye SMS gönderildi`, color: 'success' };
    dialogVadeTakip.value = false;
}

function triggerExcelInput() {
    excelInput.value && excelInput.value.click();
}

async function downloadExcelTemplate() {
    try {
        const res = await axios.get('/api/excel/template/cari', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'cari-sablon.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (e) {
        snackbar.value = { show: true, color: 'error', text: 'Şablon indirilemedi.' };
    }
}

async function onExcelFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    loadingExcel.value = true;
    excelLoadingStats.value = null;

    try {
        // Simulate file reading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const res = await axios.post('/api/excel/upload/cari', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const results = res.data.results || [];
        excelResults.value = results;

        // Calculate stats for loading screen
        const stats = {
            success: results.filter(r => r.status === 'ok').length,
            skipped: results.filter(r => r.status === 'skipped').length,
            errors: results.filter(r => r.status === 'error').length
        };
        excelLoadingStats.value = stats;

        // Show stats for a moment before closing
        await new Promise(resolve => setTimeout(resolve, 1500));

        snackbar.value = {
            show: true,
            color: stats.errors > 0 ? 'warning' : 'success',
            text: `Excel yükleme tamamlandı! ${stats.success} başarılı, ${stats.skipped} atlandı, ${stats.errors} hata`
        };

        await fetchCariler();
    } catch (err) {
        const msg = err.response?.data?.error || 'Yükleme hatası.';
        snackbar.value = { show: true, color: 'error', text: msg };
        excelResults.value = [];
        excelLoadingStats.value = null;
    } finally {
        loadingExcel.value = false;
        // Reset file input
        if (e.target) e.target.value = '';
    }
}

function openAdresDialog(item) {
    adreslerList.value = Array.isArray(item.adresler) ? [...item.adresler] : [];
    adresCariId.value = item.id;
    yeniAdres.value = { tip: 'Ev', adres: '' };
    dialogAdres.value = true;
}
function closeAdresDialog() {
    dialogAdres.value = false;
    adreslerList.value = [];
    adresCariId.value = null;
    yeniAdres.value = { tip: 'Ev', adres: '' };
}
function addAdres() {
    if (!yeniAdres.value.adres) return;
    adreslerList.value.push({ tip: yeniAdres.value.tip, adres: yeniAdres.value.adres });
    yeniAdres.value = { tip: 'Ev', adres: '' };
}
function removeAdres(i) {
    adreslerList.value.splice(i, 1);
}
async function saveAdresler() {
    if (!adresCariId.value) return;
    adresKayitLoading.value = true;
    try {
        await axios.put('/api/cari', { id: adresCariId.value, adresler: adreslerList.value });
        snackbar.value = { show: true, text: 'Adresler kaydedildi', color: 'success' };
        fetchCariler();
        closeAdresDialog();
    } catch (e) {
        snackbar.value = { show: true, text: 'Adresler kaydedilemedi', color: 'error' };
    } finally {
        adresKayitLoading.value = false;
    }
}
</script>

<style scoped>
.modern-table {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.06);
    background: #fff;
    font-size: 1.05em;
}

.v-data-table-header th,
.v-data-table thead th,
.v-data-table__th {
    font-weight: bold !important;
    background: #f5f7fa !important;
    color: #263238 !important;
    font-size: 1.08em;
    letter-spacing: 0.02em;
}

.v-data-table__td,
.v-data-table__th {
    padding: 14px 18px !important;
    vertical-align: middle;
}

.v-data-table__tr {
    transition: background 0.2s;
}

.v-data-table__tr:hover {
    background: #f5f7fa !important;
}

.v-data-table__tr:nth-child(even) {
    background: #f9fafb;
}

.v-avatar {
    font-weight: bold;
    font-size: 1.2em;
    margin-right: 8px;
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

.modern-movement-table .v-data-table__th {
    font-weight: bold !important;
    text-align: center;
    background: #f5f7fa;
}

.modern-movement-table .v-data-table__td {
    text-align: center;
    font-size: 1.05em;
    border-bottom: 1px solid #f0f0f0;
}

.modern-movement-table .v-data-table__td.text-right {
    text-align: right !important;
}

.cari-mobile-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 12px;
}

@media (min-width: 600px) {
    .cari-mobile-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.cari-mobile-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.08);
    padding: 16px 14px 10px 14px;
    display: flex;
    flex-direction: column;
    font-size: 1.05em;
}

.cari-mobile-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.cari-mobile-title {
    font-weight: bold;
    font-size: 1.15em;
}

.cari-mobile-row {
    display: flex;
    margin-bottom: 4px;
}

.cari-mobile-label {
    font-weight: 500;
    min-width: 110px;
    color: #607d8b;
    font-size: 0.98em;
}

.cari-mobile-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.cari-mobile-btn {
    min-width: 44px !important;
    min-height: 44px !important;
    border-radius: 50% !important;
    font-size: 1.3em !important;
}

.cari-mobile-header-row {
    display: flex;
    justify-content: space-between;
    background: #f5f7fa;
    border-radius: 8px;
    padding: 8px 10px;
    font-weight: bold;
    font-size: 1em;
    margin-bottom: 8px;
    color: #455a64;
    gap: 8px;
}

.cari-mobile-header-cell {
    flex: 1 1 0;
    text-align: left;
    min-width: 80px;
    font-size: 0.98em;
}

.adres-card {
    background: #f8f9fa;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(60, 60, 60, 0.07);
    min-height: 70px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 18px 20px;
}

.adres-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 1 auto;
}

.adres-baslik {
    font-size: 1.25em;
    font-weight: bold;
    color: #263238;
    margin-bottom: 2px;
    word-break: break-word;
}

.adres-tip {
    font-size: 1em;
    color: #607d8b;
    font-weight: 500;
}
</style>