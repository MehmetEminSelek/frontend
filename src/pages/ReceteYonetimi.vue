<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <v-card class="pa-4 rounded-xl" elevation="2"
            style="background: linear-gradient(135deg, #e8f5e9 60%, #fffde7 100%);">
            <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
                <span class="d-flex align-center">
                    <v-icon color="success" class="mr-2">mdi-food-variant</v-icon>
                    Reçete Yönetimi
                </span>
                <div class="d-flex align-center flex-wrap">
                    <v-text-field v-model="search" label="Ara..." dense hide-details clearable class="mr-2 mb-2 mb-md-0"
                        style="max-width:180px" @keyup.enter="fetchReceteler" color="success" />
                    <v-select v-model="filterUrunId" :items="urunler" item-title="ad" item-value="id"
                        label="Ürün Filtrele" dense hide-details clearable class="mr-2 mb-2 mb-md-0"
                        style="max-width:180px" color="success" />
                    <v-btn color="success" class="mr-2 mb-2 mb-md-0" @click="openAddDialog"
                        prepend-icon="mdi-plus-circle-outline">Yeni Reçete</v-btn>
                    <v-btn icon="mdi-refresh" variant="text" @click="fetchReceteler" title="Yenile"
                        color="success"></v-btn>
                </div>
            </v-card-title>
            <v-divider class="mb-4"></v-divider>
            <v-row dense class="recete-grid">
                <v-col cols="12" v-if="loading">
                    <v-skeleton-loader type="card@3" class="my-4" />
                </v-col>
                <v-col cols="12" v-if="!loading && filteredReceteler.length === 0">
                    <v-alert type="info" color="success" variant="tonal" class="my-8 text-center">
                        <v-icon size="large" color="success">mdi-emoticon-sad-outline</v-icon>
                        <div class="mt-2">Hiç reçete bulunamadı. Yeni bir reçete ekleyin!</div>
                    </v-alert>
                </v-col>
                <v-col v-for="recete in filteredReceteler" :key="recete.id" cols="12" md="6" lg="4" class="d-flex">
                    <v-card class="mb-4 pa-0 rounded-lg flex-grow-1 recipe-card" elevation="1"
                        style="background: linear-gradient(120deg, #f1f8e9 80%, #fffde7 100%); min-height: 340px; display: flex; flex-direction: column; justify-content: space-between;">
                        <v-card-title class="text-body-1 font-weight-bold d-flex justify-space-between align-center"
                            style="background:rgba(76,175,80,0.08); min-height: 48px;">
                            <span class="d-flex align-center">
                                <v-icon color="success" class="mr-1">mdi-clipboard-list-outline</v-icon>
                                <span>{{ recete.urunAd || recete.name }}</span>
                            </span>
                            <span>
                                <v-btn icon="mdi-calculator" size="small" variant="text" color="info"
                                    @click="hesaplaMaliyet(recete)" title="Maliyet Hesapla"></v-btn>
                                <v-btn icon="mdi-content-copy" size="small" variant="text" color="primary"
                                    @click="copyRecete(recete)" title="Kopyala"></v-btn>
                                <v-btn icon="mdi-pencil" size="small" variant="text" color="warning"
                                    @click="openEditDialog(recete)"></v-btn>
                                <v-btn icon="mdi-delete" size="small" variant="text" color="error"
                                    @click="confirmDelete(recete)"></v-btn>
                            </span>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-table density="compact" class="rounded-b-lg" style="flex:1;">
                            <thead style="background:#f9fbe7;">
                                <tr>
                                    <th>Stok Adı</th>
                                    <th>Tip</th>
                                    <th class="text-end">Miktar (gr)</th>
                                    <th>Kod</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="ing in recete.ingredients" :key="ing.id">
                                    <td>{{ ing.stokAd || ing.stokKod || '-' }}</td>
                                    <td>
                                        <v-chip :color="ing.stokTip === 'Hammadde' ? 'success' : 'warning'"
                                            size="x-small" label>{{ ing.stokTip || '-' }}</v-chip>
                                    </td>
                                    <td class="text-end font-weight-bold">{{ ing.miktarGram ?
                                        ing.miktarGram.toLocaleString() + ' gr' : '-' }}</td>
                                    <td>{{ ing.stokKod || '-' }}</td>
                                </tr>
                                <tr v-if="!recete.ingredients || recete.ingredients.length === 0">
                                    <td colspan="4" class="text-center text-grey">Malzeme eklenmemiş</td>
                                </tr>
                                <tr v-for="n in (5 - (recete.ingredients?.length || 0))"
                                    v-if="recete.ingredients && recete.ingredients.length < 5" :key="'empty' + n">
                                    <td colspan="4" style="height:28px;"></td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
        <v-dialog v-model="dialog" max-width="600px">
            <v-card class="rounded-xl">
                <v-card-title class="text-h6 font-weight-bold">{{ editMode ? 'Reçeteyi Düzenle' : 'Yeni Reçete Ekle'
                }}</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="saveRecete">
                        <v-text-field v-model="form.name" label="Reçete Adı" required color="success"></v-text-field>
                        <v-select v-model="form.urunId" :items="urunler" item-title="ad" item-value="id"
                            label="Ürün (opsiyonel)" color="success"></v-select>
                        <div class="mb-2 mt-4 font-weight-bold">Malzemeler</div>
                        <div v-for="(ing, idx) in form.ingredients" :key="idx"
                            class="d-flex align-center mb-2 flex-wrap">
                            <v-select v-model="ing.stokKod" :items="stokOptions" item-title="label" item-value="kod"
                                label="Stok" class="mr-2 mb-2 mb-md-0" style="min-width: 180px" dense required
                                color="success"></v-select>
                            <v-text-field v-model.number="ing.miktarGram" label="Miktar (gr)" type="number" min="1"
                                style="max-width:120px" dense required color="success"></v-text-field>
                            <v-btn icon="mdi-delete" size="small" color="error" variant="text"
                                @click="removeIngredient(idx)"></v-btn>
                        </div>
                        <v-btn color="primary" variant="tonal" class="mb-2" @click="addIngredient"
                            prepend-icon="mdi-plus">Malzeme Ekle</v-btn>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="closeDialog">İptal</v-btn>
                    <v-btn color="success" @click="saveRecete">Kaydet</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="deleteDialog" max-width="400px">
            <v-card class="rounded-xl">
                <v-card-title class="text-h6">Reçete Sil</v-card-title>
                <v-card-text>Bu reçeteyi silmek istediğinize emin misiniz?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="deleteDialog = false">Vazgeç</v-btn>
                    <v-btn color="error" @click="deleteRecete">Sil</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="maliyetDialog" max-width="700px">
            <v-card class="rounded-xl">
                <v-card-title class="text-h6">
                    <v-icon color="info" class="mr-2">mdi-calculator</v-icon>
                    {{ seciliMaliyet?.recete?.name }} - Maliyet Analizi
                </v-card-title>
                <v-card-text>
                    <div v-if="seciliMaliyet?.maliyet">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card variant="tonal" color="info" class="pa-3">
                                    <div class="text-h6 font-weight-bold text-center">
                                        {{ seciliMaliyet.maliyet.toplamMaliyet?.toFixed(2) }} ₺
                                    </div>
                                    <div class="text-center text-caption">Toplam Maliyet</div>
                                </v-card>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-card variant="tonal" color="success" class="pa-3">
                                    <div class="text-h6 font-weight-bold text-center">
                                        {{ seciliMaliyet.maliyet.toplamAgirlik?.toFixed(0) }} gr
                                    </div>
                                    <div class="text-center text-caption">Toplam Ağırlık</div>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-divider class="my-4"></v-divider>

                        <h4 class="text-subtitle-1 font-weight-bold mb-3">Malzeme Detayları</h4>
                        <v-table>
                            <thead>
                                <tr>
                                    <th>Malzeme</th>
                                    <th>Miktar</th>
                                    <th>Birim Fiyat</th>
                                    <th class="text-end">Toplam</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in seciliMaliyet.maliyet.detaylar" :key="item.stokKod">
                                    <td>{{ item.stokAd }}</td>
                                    <td>{{ item.miktarGram?.toFixed(0) }} gr</td>
                                    <td>{{ item.birimFiyat?.toFixed(2) }} ₺/KG</td>
                                    <td class="text-end font-weight-bold">
                                        {{ item.toplamFiyat?.toFixed(2) }} ₺
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                    <div v-else class="text-center py-4">
                        <v-icon size="64" color="grey-lighten-2">mdi-calculator-off</v-icon>
                        <div class="text-h6 text-grey-500 mt-2">Maliyet hesaplanamadı</div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="maliyetDialog = false">Kapat</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500">{{ snackbar.text }}</v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed, provide } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';

const receteler = ref([]);
const loading = ref(true);
const urunler = ref([]);
const stokOptions = ref([]);
const dialog = ref(false);
const deleteDialog = ref(false);
const maliyetDialog = ref(false);
const editMode = ref(false);
const form = ref({ id: null, name: '', urunId: null, ingredients: [] });
const deleteId = ref(null);
const seciliMaliyet = ref(null);
const snackbar = ref({ show: false, text: '', color: 'success' });
const search = ref('');
const filterUrunId = ref(null);

// Reçete modülüne özel tema ile Vuetify instance'ı oluştur
const receteTheme = {
    dark: false,
    colors: {
        primary: '#43A047', // Yeşil
        secondary: '#FFFDE7', // Açık sarı
        accent: '#FFD600',
        error: '#D32F2F',
        info: '#43A047',
        success: '#388E3C',
        warning: '#FBC02D',
        background: '#F4F8F3',
        surface: '#FFFFFF',
    },
};
const receteVuetify = createCustomVuetify({ themeName: 'receteTheme', customTheme: receteTheme });
provide('vuetify', receteVuetify);

async function fetchReceteler() {
    loading.value = true;
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/receteler`);
        receteler.value = response.data;
    } catch (err) {
        receteler.value = [];
    } finally {
        loading.value = false;
    }
}
async function fetchDropdowns() {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dropdown`);
        urunler.value = res.data.urunler;
        stokOptions.value = [
            ...res.data.hammaddeler.map(x => ({ kod: x.kod, label: x.ad + ' (Hammadde)' })),
            ...res.data.yariMamuller.map(x => ({ kod: x.kod, label: x.ad + ' (Yarı Mamul)' }))
        ];
    } catch (err) {
        urunler.value = [];
        stokOptions.value = [];
    }
}
function openAddDialog() {
    editMode.value = false;
    form.value = { id: null, name: '', urunId: null, ingredients: [{ stokKod: '', miktarGram: null }] };
    dialog.value = true;
}
function openEditDialog(recete) {
    editMode.value = true;
    form.value = {
        id: recete.id,
        name: recete.name,
        urunId: urunler.value.find(u => u.ad === recete.urunAd)?.id || null,
        ingredients: recete.ingredients.map(ing => ({ stokKod: ing.stokKod, miktarGram: ing.miktarGram }))
    };
    dialog.value = true;
}
function closeDialog() {
    dialog.value = false;
}
function addIngredient() {
    form.value.ingredients.push({ stokKod: '', miktarGram: null });
}
function removeIngredient(idx) {
    form.value.ingredients.splice(idx, 1);
}
async function saveRecete() {
    if (!form.value.name || form.value.ingredients.some(ing => !ing.stokKod || !ing.miktarGram)) {
        snackbar.value = { show: true, text: 'Tüm alanları doldurun.', color: 'error' };
        return;
    }
    try {
        if (editMode.value) {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/receteler`, form.value);
            snackbar.value = { show: true, text: 'Reçete güncellendi.', color: 'success' };
        } else {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/receteler`, form.value);
            snackbar.value = { show: true, text: 'Reçete eklendi.', color: 'success' };
        }
        dialog.value = false;
        fetchReceteler();
    } catch (err) {
        snackbar.value = { show: true, text: 'Kayıt sırasında hata oluştu.', color: 'error' };
    }
}
function confirmDelete(recete) {
    deleteId.value = recete.id;
    deleteDialog.value = true;
}
async function deleteRecete() {
    try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/receteler`, { data: { id: deleteId.value } });
        snackbar.value = { show: true, text: 'Reçete silindi.', color: 'success' };
        deleteDialog.value = false;
        fetchReceteler();
    } catch (err) {
        snackbar.value = { show: true, text: 'Silme sırasında hata oluştu.', color: 'error' };
    }
}
function copyRecete(recete) {
    editMode.value = false;
    form.value = {
        id: null,
        name: recete.name + ' (Kopya)',
        urunId: urunler.value.find(u => u.ad === recete.urunAd)?.id || null,
        ingredients: recete.ingredients.map(ing => ({ stokKod: ing.stokKod, miktarGram: ing.miktarGram }))
    };
    dialog.value = true;
}
async function hesaplaMaliyet(recete) {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/receteler/maliyet`, {
            ingredients: recete.ingredients
        });
        seciliMaliyet.value = {
            recete: recete,
            maliyet: response.data
        };
        maliyetDialog.value = true;
    } catch (err) {
        snackbar.value = { show: true, text: 'Maliyet hesaplanırken hata oluştu.', color: 'error' };
    }
}
const filteredReceteler = computed(() => {
    let list = receteler.value;
    if (search.value) {
        const s = search.value.toLowerCase();
        list = list.filter(r =>
            (r.name && r.name.toLowerCase().includes(s)) ||
            (r.urunAd && r.urunAd.toLowerCase().includes(s)) ||
            (urunler.value.find(u => u.id === r.urunId)?.ad?.toLowerCase().includes(s))
        );
    }
    if (filterUrunId.value) {
        list = list.filter(r => r.urunId === filterUrunId.value);
    }
    return list;
});
onMounted(() => { fetchReceteler(); fetchDropdowns(); });
</script>

<style scoped>
.v-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px #43a04722;
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

.v-card[variant="tonal"] {
    border: 1.5px solid #c8e6c9;
    box-shadow: 0 2px 8px 0 rgba(76, 175, 80, 0.07);
}

.v-card .v-card-title {
    background: none;
}

.v-table thead th {
    color: #388e3c;
    font-weight: 600;
    background: #f9fbe7;
}

.v-table tbody tr {
    transition: background 0.2s;
}

.v-table tbody tr:hover {
    background: #e8f5e9;
}

.v-chip {
    font-size: 0.85em;
}

@media (max-width: 960px) {

    .v-card-title,
    .v-table thead th,
    .v-table tbody td {
        font-size: 0.95em !important;
    }
}

.recete-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 28px 24px;
}

.recipe-card {
    min-height: 340px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

@media (max-width: 960px) {
    .recete-grid {
        gap: 16px 0;
    }

    .recipe-card {
        min-height: 260px;
    }
}
</style>