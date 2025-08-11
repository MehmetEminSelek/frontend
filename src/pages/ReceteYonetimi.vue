<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-4"
                style="background: linear-gradient(135deg, #FFE0B2 0%, #FFCC80 50%, #FFB74D 100%); color: #5D4037; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
                    <v-icon size="120">mdi-chef-hat</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="#8D6E63">mdi-food-variant</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1" style="color: #5D4037;">Reçete Yönetimi</h1>
                                <p class="text-h6 mb-0" style="color: #6D4C41; opacity: 0.8;">Yemek tariflerinizi ve
                                    malzemelerinizi kolayca yönetin</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="rgba(93, 64, 55, 0.15)" size="small" class="mr-2" style="color: #5D4037;">
                                <v-icon start size="16" color="#8D6E63">mdi-clipboard-check</v-icon>
                                {{ filteredReceteler.length }} Reçete
                            </v-chip>
                            <v-chip color="rgba(93, 64, 55, 0.15)" size="small" style="color: #5D4037;">
                                <v-icon start size="16" color="#8D6E63">mdi-package-variant</v-icon>
                                Otomatik Maliyet
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <v-btn size="x-large" color="white" variant="elevated" @click="openAddDialog"
                            class="font-weight-bold"
                            style="color: #8D6E63 !important; box-shadow: 0 4px 12px rgba(141, 110, 99, 0.2);">
                            <v-icon left size="20">mdi-plus-circle</v-icon>
                            Yeni Reçete Ekle
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- Filters Section -->
        <v-card class="mb-6 rounded-xl" elevation="1" style="border: 1px solid #EFEBE9;">
            <v-card-title class="d-flex align-center py-4">
                <v-icon color="#8D6E63" class="mr-2">mdi-filter-variant</v-icon>
                <span class="text-h6 font-weight-bold" style="color: #5D4037;">Filtreler & Arama</span>
            </v-card-title>
            <v-card-text class="pt-0">
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="search" label="Reçete ara..." prepend-inner-icon="mdi-magnify"
                            variant="outlined" density="comfortable" clearable @keyup.enter="fetchReceteler"
                            color="#A1887F" hide-details />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select v-model="filterUrunId" :items="urunler" item-title="ad" item-value="id"
                            label="Ürüne göre filtrele" prepend-inner-icon="mdi-package-variant" variant="outlined"
                            density="comfortable" clearable @update:model-value="fetchReceteler" color="#A1887F"
                            hide-details />
                    </v-col>
                    <v-col cols="12" md="4" class="d-flex align-center gap-2">
                        <v-btn color="#A1887F" variant="outlined" @click="fetchReceteler" prepend-icon="mdi-refresh"
                            class="flex-grow-1">
                            Yenile
                        </v-btn>
                        <v-btn color="#81C784" variant="outlined" prepend-icon="mdi-download" @click="exportReceteler">
                            Dışa Aktar
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Recipe Grid -->
        <div v-if="loading" class="text-center my-8">
            <v-progress-circular size="64" color="#A1887F" indeterminate></v-progress-circular>
            <p class="text-h6 mt-4 text-grey-600">Reçeteler yükleniyor...</p>
        </div>

        <div v-else-if="filteredReceteler.length === 0" class="text-center my-12">
            <v-icon size="80" color="grey-lighten-2">mdi-chef-hat-outline</v-icon>
            <h3 class="text-h5 mt-4 text-grey-600">Henüz reçete eklenmemiş</h3>
            <p class="text-body-1 text-grey-500 mb-4">İlk reçetenizi ekleyerek başlayın!</p>
            <v-btn color="#A1887F" size="large" @click="openAddDialog" prepend-icon="mdi-plus">
                İlk Reçetemi Ekle
            </v-btn>
        </div>

        <v-row v-else>
            <v-col v-for="recete in filteredReceteler" :key="recete.id" cols="12" sm="6" lg="4" xl="3">
                <v-card class="recipe-card rounded-xl h-100" elevation="2"
                    style="background: linear-gradient(145deg, #FFFFFF 0%, #FFF8E1 100%); border: 1px solid #EFEBE9; transition: all 0.3s ease;">

                    <!-- Card Header -->
                    <v-card-title class="pa-4"
                        style="background: linear-gradient(135deg, #BCAAA4 0%, #A1887F 100%); color: white;">
                        <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                                <v-avatar color="rgba(255,255,255,0.2)" size="32" class="mr-3">
                                    <v-icon color="white">mdi-clipboard-list</v-icon>
                                </v-avatar>
                                <div>
                                    <h4 class="text-subtitle-1 font-weight-bold">{{ recete.urunAd || recete.name }}</h4>
                                    <p class="text-caption opacity-80 ma-0">{{ recete.ingredients?.length || 0 }}
                                        malzeme</p>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="d-flex">
                                <v-btn icon size="small" variant="text" @click="hesaplaMaliyet(recete)"
                                    title="Maliyet Hesapla" style="color: rgba(255,255,255,0.9);">
                                    <v-icon size="18">mdi-calculator</v-icon>
                                </v-btn>
                                <v-btn icon size="small" variant="text" @click="copyRecete(recete)" title="Kopyala"
                                    style="color: rgba(255,255,255,0.9);">
                                    <v-icon size="18">mdi-content-copy</v-icon>
                                </v-btn>
                            </div>
                        </div>
                    </v-card-title>

                    <!-- Ingredients Table -->
                    <div class="pa-0">
                        <v-table density="compact" class="ingredients-table">
                            <thead style="background: #F3E5F5;">
                                <tr>
                                    <th class="text-caption font-weight-bold">Malzeme</th>
                                    <th class="text-caption font-weight-bold text-center">Tip</th>
                                    <th class="text-caption font-weight-bold text-end">Miktar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="ing in recete.ingredients?.slice(0, 4)" :key="ing.id" class="ingredient-row">
                                    <td class="py-2">
                                        <div class="d-flex align-center">
                                            <v-avatar size="20" class="mr-2"
                                                :color="ing.stokTip === 'Hammadde' ? '#C8E6C9' : '#FFE0B2'">
                                                <v-icon size="12"
                                                    :color="ing.stokTip === 'Hammadde' ? '#388E3C' : '#F57C00'">
                                                    {{ ing.stokTip === 'Hammadde' ? 'mdi-leaf' : 'mdi-cog' }}
                                                </v-icon>
                                            </v-avatar>
                                            <span class="text-body-2">{{ ing.stokAd || ing.stokKod || '-' }}</span>
                                        </div>
                                    </td>
                                    <td class="text-center py-2">
                                        <v-chip size="x-small" variant="flat"
                                            :color="ing.stokTip === 'Hammadde' ? '#E8F5E9' : '#FFF3E0'"
                                            :style="{ color: ing.stokTip === 'Hammadde' ? '#2E7D32' : '#E65100' }">
                                            {{ ing.stokTip === 'Hammadde' ? 'HM' : 'YM' }}
                                        </v-chip>
                                    </td>
                                    <td class="text-end py-2">
                                        <span class="text-body-2 font-weight-medium">
                                            {{ (ing.miktarGram != null ? ing.miktarGram : (ing.miktarKg != null ? ing.miktarKg * 1000 : null)) != null
                                                ? ((ing.miktarGram ?? (ing.miktarKg * 1000)).toLocaleString() + 'g')
                                                : '-' }}
                                        </span>
                                    </td>
                                </tr>

                                <!-- Show more indicator -->
                                <tr v-if="recete.ingredients?.length > 4">
                                    <td colspan="3" class="text-center py-2">
                                        <v-chip size="small" color="#F5F5F5" variant="flat" style="color: #616161;">
                                            +{{ recete.ingredients.length - 4 }} daha fazla
                                        </v-chip>
                                    </td>
                                </tr>

                                <!-- Empty state -->
                                <tr v-if="!recete.ingredients || recete.ingredients.length === 0">
                                    <td colspan="3" class="text-center py-4 text-grey-500">
                                        <v-icon size="24" class="mb-1">mdi-package-variant-closed</v-icon>
                                        <div class="text-caption">Malzeme eklenmemiş</div>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>

                    <!-- Card Actions -->
                    <v-card-actions class="pa-3" style="background: rgba(161, 136, 127, 0.05);">
                        <v-btn variant="outlined" size="small" color="#A1887F" @click="openEditDialog(recete)"
                            prepend-icon="mdi-pencil" class="flex-grow-1">
                            Düzenle
                        </v-btn>
                        <v-btn variant="outlined" size="small" color="#E57373" @click="confirmDelete(recete)"
                            icon="mdi-delete" class="ml-2">
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>

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
import { apiCall } from '../utils/api';
import { createCustomVuetify } from '../plugins/vuetify';

const receteler = ref([]);
const loading = ref(true);
const urunler = ref([]);
const stokOptions = ref([]);
const materials = ref([]);
const kodToId = ref({});
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
        const data = await apiCall('/receteler?limit=500');
        const list = Array.isArray(data?.legacy)
            ? data.legacy
            : Array.isArray(data?.recipes)
                ? data.recipes.map(r => {
                    const kalemler = Array.isArray(r.icerikler)
                        ? r.icerikler
                        : Array.isArray(r.receteKalemleri)
                            ? r.receteKalemleri
                            : [];
                    return {
                        id: r.id,
                        name: r.ad,
                        urunId: r.urunId,
                        urunAd: r.urun?.ad || null,
                        ingredients: kalemler.map(k => {
                            const kg = k.miktar != null ? Number(k.miktar) : (k.miktarKg != null ? Number(k.miktarKg) : (k.miktarGram != null ? Number(k.miktarGram) / 1000 : 0));
                            const mat = k.material || k.malzeme || {};
                            return {
                                stokKod: mat.kod,
                                stokAd: mat.ad,
                                miktarKg: kg,
                                miktarGram: kg * 1000
                            };
                        })
                    };
                })
                : Array.isArray(data)
                    ? data
                    : [];
        receteler.value = list;
    } catch (err) {
        receteler.value = [];
    } finally {
        loading.value = false;
    }
}
async function fetchDropdowns() {
    try {
        const res = await apiCall('/dropdown');
        urunler.value = Array.isArray(res?.urunler) ? res.urunler : [];
        const hm = Array.isArray(res?.hammaddeler) ? res.hammaddeler : [];
        const ym = Array.isArray(res?.yariMamuller) ? res.yariMamuller : [];
        const mats = Array.isArray(res?.materials) ? res.materials : [...hm, ...ym];
        materials.value = mats;
        // kod -> id map
        const m = {};
        mats.forEach(x => { if (x?.kod && x?.id) m[x.kod] = x.id; });
        kodToId.value = m;
        stokOptions.value = [
            ...hm.map(x => ({ kod: x.kod, label: x.ad + ' (Hammadde)' })),
            ...ym.map(x => ({ kod: x.kod, label: x.ad + ' (Yarı Mamul)' }))
        ];
    } catch (err) {
        urunler.value = [];
        stokOptions.value = [];
        materials.value = [];
        kodToId.value = {};
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
        ingredients: recete.ingredients.map(ing => ({
            stokKod: ing.stokKod,
            miktarGram: ing.miktarGram != null ? ing.miktarGram : (ing.miktarKg != null ? ing.miktarKg * 1000 : null)
        }))
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
        // Backend şemasına dönüştür
        const receteKalemleri = form.value.ingredients
            .map(ing => ({
                materialId: kodToId.value[ing.stokKod] || null,
                miktar: (Number(ing.miktarGram) || 0) / 1000,
                birim: 'KG'
            }))
            .filter(x => x.materialId && x.miktar > 0);

        if (editMode.value) {
            // PUT allowedFields'ta urunId yok; göndermeyelim
            const payload = { id: form.value.id, ad: form.value.name, porsiyon: 1 };
            if (receteKalemleri.length > 0) Object.assign(payload, { receteKalemleri });
            await apiCall('/receteler', payload, 'PUT');
            snackbar.value = { show: true, text: 'Reçete güncellendi.', color: 'success' };
        } else {
            if (!form.value.urunId) {
                snackbar.value = { show: true, text: 'Lütfen bir ürün seçin.', color: 'error' };
                return;
            }
            await apiCall('/receteler', {
                ad: form.value.name,
                urunId: form.value.urunId,
                porsiyon: 1,
                receteKalemleri
            }, 'POST');
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
        await apiCall('/receteler', { id: deleteId.value }, 'DELETE');
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
        ingredients: recete.ingredients.map(ing => ({
            stokKod: ing.stokKod,
            miktarGram: ing.miktarGram != null ? ing.miktarGram : (ing.miktarKg != null ? ing.miktarKg * 1000 : null)
        }))
    };
    dialog.value = true;
}
async function hesaplaMaliyet(recete) {
    try {
        // Recipe bazında maliyet analizi (GET)
        const response = await apiCall(`/receteler/maliyet?recipeId=${recete.id}&includeBreakdown=true`);
        const data = response?.data;
        // Beklenen UI şemasına dönüştür
        const breakdown = Array.isArray(data?.currentCostBreakdown?.items) ? data.currentCostBreakdown.items : [];
        const detaylar = breakdown.map(it => ({
            stokAd: it.materialName,
            stokKod: it.materialCode,
            miktarGram: (Number(it.quantity) || 0) * 1000,
            birimFiyat: Number(it.unitPrice) || 0,
            toplamFiyat: Number(it.totalCost) || 0
        }));
        const toplamAgirlik = detaylar.reduce((s, d) => s + (Number(d.miktarGram) || 0), 0);
        const maliyet = {
            toplamMaliyet: Number(data?.currentCostBreakdown?.totalCost) || 0,
            toplamAgirlik,
            detaylar
        };
        seciliMaliyet.value = { recete, maliyet };
        maliyetDialog.value = true;
    } catch (err) {
        snackbar.value = { show: true, text: 'Maliyet hesaplanırken hata oluştu.', color: 'error' };
    }
}

function exportReceteler() {
    const rows = [
        ['Reçete Adı', 'Ürün', 'Malzeme Sayısı']
    ];
    filteredReceteler.value.forEach(r => {
        rows.push([r.name, r.urunAd || '', Array.isArray(r.ingredients) ? r.ingredients.length : 0]);
        if (Array.isArray(r.ingredients)) {
            rows.push(['', 'Malzeme', 'Miktar (gr)']);
            r.ingredients.forEach(i => rows.push(['', `${i.stokAd || i.stokKod || '-'}`, `${i.miktarGram || 0}`]));
        }
    });
    const csv = rows.map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'receteler.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
.recipe-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid #EFEBE9;
}

.recipe-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(161, 136, 127, 0.12) !important;
    border-color: rgba(161, 136, 127, 0.25);
}

.ingredients-table th {
    background: #F3E5F5 !important;
    color: #6A1B9A !important;
    font-weight: 600 !important;
    font-size: 0.75rem !important;
}

.ingredient-row:hover {
    background: rgba(161, 136, 127, 0.03);
}

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
    background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(93,64,55,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

/* Custom scrollbar */
.ingredients-table::-webkit-scrollbar {
    height: 4px;
}

.ingredients-table::-webkit-scrollbar-track {
    background: #F5F5F5;
    border-radius: 2px;
}

.ingredients-table::-webkit-scrollbar-thumb {
    background: #BCAAA4;
    border-radius: 2px;
}

.ingredients-table::-webkit-scrollbar-thumb:hover {
    background: #A1887F;
}
</style>