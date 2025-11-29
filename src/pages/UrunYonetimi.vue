<template>
    <v-container class="py-6 px-2 px-md-8" fluid>
        <!-- Hero Section -->
        <div class="hero-section mb-6">
            <v-card class="pa-6 rounded-xl elevation-0 border"
                style="background: #F5F7FA; position: relative; overflow: hidden;">
                <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
                    <v-icon size="120" color="primary">mdi-package-variant-closed</v-icon>
                </div>
                <v-row align="center">
                    <v-col cols="12" md="8">
                        <div class="d-flex align-center mb-3">
                            <v-icon size="48" class="mr-3" color="primary">mdi-package-variant-closed</v-icon>
                            <div>
                                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Ürün Yönetimi</h1>
                                <p class="text-h6 mb-0 text-secondary">Ürünlerinizi ekleyin, düzenleyin ve yönetin</p>
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-chip color="primary" variant="tonal" size="small" class="mr-2">
                                <v-icon start size="16">mdi-food-variant</v-icon>
                                Ürün Kataloğu
                            </v-chip>
                            <v-chip color="success" variant="tonal" size="small">
                                <v-icon start size="16">mdi-clipboard-list-outline</v-icon>
                                Reçete Takibi
                            </v-chip>
                        </div>
                    </v-col>
                    <v-col cols="12" md="4" class="text-center">
                        <v-btn size="large" color="primary" variant="flat" @click="yeniUrunDialog = true" class="font-weight-bold rounded-lg">
                            <v-icon left size="20">mdi-plus</v-icon>
                            Yeni Ürün
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card>
        </div>

        <!-- İstatistik Kartları -->
        <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="primary" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="primary">mdi-package-variant-closed</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h5 font-weight-bold text-primary">{{ pagination.total }}</div>
                            <div class="text-subtitle-2 text-grey">Toplam Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="success" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="success">mdi-check-circle-outline</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h5 font-weight-bold text-success">{{ aktifUrunSayisi }}</div>
                            <div class="text-subtitle-2 text-grey">Aktif Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="warning" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="warning">mdi-star-outline</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h5 font-weight-bold text-warning">{{ ozelUrunSayisi }}</div>
                            <div class="text-subtitle-2 text-grey">Özel Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4 rounded-xl border" elevation="0">
                    <div class="d-flex align-center">
                        <v-avatar color="info" variant="tonal" size="48" class="mr-3">
                            <v-icon size="28" color="info">mdi-clipboard-list-outline</v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-h6 font-weight-bold text-info">Reçete</div>
                            <div class="text-subtitle-2 text-grey">Yönetimi</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Filtreler ve Arama -->
        <v-card class="mb-4 rounded-xl border" elevation="0">
            <v-card-title class="pa-4 bg-grey-lighten-4">
                <div class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-filter-outline</v-icon>
                    <span class="text-subtitle-1 font-weight-bold text-primary">Filtreler ve Arama</span>
                </div>
            </v-card-title>
            <v-card-text class="pa-4">
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filtreler.arama" label="Ürün Ara..." prepend-inner-icon="mdi-magnify"
                            clearable @input="aramaYap" variant="outlined" density="compact" color="primary" hide-details />
                    </v-col>
                    
                    <v-col cols="12" md="2">
                        <v-select v-model="filtreler.aktif" :items="[
                            { title: 'Tümü', value: '' },
                            { title: 'Aktif', value: 'true' },
                            { title: 'Pasif', value: 'false' }
                        ]" label="Durum" prepend-inner-icon="mdi-toggle-switch" @update:model-value="urunleriYukle"
                            variant="outlined" density="compact" color="primary" hide-details />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-select v-model="filtreler.siralama" :items="[
                            { title: 'Ad (A-Z)', value: 'ad:asc' },
                            { title: 'Ad (Z-A)', value: 'ad:desc' },
                            { title: 'Kod (A-Z)', value: 'kodu:asc' },
                            { title: 'Tarih (Yeni)', value: 'createdAt:desc' },
                            { title: 'Tarih (Eski)', value: 'createdAt:asc' }
                        ]" label="Sıralama" prepend-inner-icon="mdi-sort" @update:model-value="urunleriYukle"
                            variant="outlined" density="compact" color="primary" hide-details />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Ürün Listesi -->
        <v-card class="rounded-xl border" elevation="0">
            <v-card-title class="pa-4 bg-primary text-white">
                <div class="d-flex align-center justify-space-between w-100">
                    <div class="d-flex align-center">
                        <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
                            <v-icon color="white">mdi-view-list</v-icon>
                        </v-avatar>
                        <div>
                            <h3 class="text-h6 font-weight-bold">Ürün Listesi</h3>
                            <p class="text-body-2 opacity-80 ma-0">{{ pagination.total }} ürün</p>
                        </div>
                    </div>
                    <v-btn-toggle v-model="gorunumModu" mandatory density="compact" variant="flat" color="rgba(255,255,255,0.2)">
                        <v-btn value="liste" size="small">
                            <v-icon size="18" color="white">mdi-view-list</v-icon>
                        </v-btn>
                        <v-btn value="kart" size="small">
                            <v-icon size="18" color="white">mdi-view-grid</v-icon>
                        </v-btn>
                    </v-btn-toggle>
                </div>
            </v-card-title>

            <!-- Liste Görünümü -->
            <v-data-table v-if="gorunumModu === 'liste'" class="elevation-0" :headers="headers" :items="urunler" :loading="yukleniyor"
                :items-per-page="pagination.limit" :page="pagination.page" :server-items-length="pagination.total"
                :items-per-page-options="[20,50,100,200]" density="compact"
                 @update:page="sayfaDegistir" @update:items-per-page="(n)=>{ pagination.limit=n; pagination.page=1; urunleriYukle(); }">
                <!-- Ürün Adı -->
                <template v-slot:item.ad="{ item }">
                    <div class="d-flex align-center">
                        <v-avatar size="32" class="mr-3" color="grey-lighten-3">
                            <v-img v-if="item.anaGorsel" :src="item.anaGorsel" :alt="item.ad" />
                            <v-icon v-else>mdi-package-variant</v-icon>
                        </v-avatar>
                        <div>
                            <div class="font-weight-medium truncate">{{ item.ad }}</div>
                            <div class="text-caption text-grey-600 truncate">{{ item.kodu }}</div>
                        </div>
                    </div>
                </template>

                <!-- Kategori sütunu kaldırıldı -->

                <!-- Fiyat -->
                <template v-slot:item.guncelFiyat="{ item }">
                    <div class="text-right">
                        <div v-if="item.guncelFiyat">
                            <div class="font-weight-medium">
                                {{ formatFiyat(item.guncelFiyat.kgFiyati) }} <span class="text-caption">/ {{ item.guncelFiyat.birim }}</span>
                            </div>
                            <v-chip v-if="item.guncelFiyat.fiyatTipi !== 'NORMAL'" size="x-small" color="grey" variant="tonal">
                                {{ item.guncelFiyat.fiyatTipi }}
                            </v-chip>
                        </div>
                        <span v-else class="text-grey-500">Fiyat yok</span>
                    </div>
                </template>

                <!-- Reçete -->
                <template v-slot:item.recete="{ item }">
                    <div class="d-flex align-center">
                        <template v-if="(item.recipeCount ?? item.receteAdedi ?? 0) > 0">
                            <v-chip size="small" color="success" variant="tonal" class="mr-2">
                                <v-icon start size="16">mdi-food-variant</v-icon>
                                {{ item.recipeCount ?? item.receteAdedi }} reçete
                            </v-chip>
                            <v-btn icon="mdi-eye" size="x-small" variant="text" color="info" @click="receteDetayGoster(item)" />
                        </template>
                        <span v-else class="text-grey-500">Reçete yok</span>
                    </div>
                </template>

                <!-- Durum -->
                <template v-slot:item.durum="{ item }">
                    <div class="d-flex flex-column gap-1 align-center">
                        <v-chip :color="item.aktif ? 'success' : 'grey'" size="small" variant="tonal">
                            {{ item.aktif ? 'Aktif' : 'Pasif' }}
                        </v-chip>
                        <div class="d-flex gap-1">
                            <v-chip v-if="item.yeniUrun" color="blue" size="x-small" variant="tonal">
                                Yeni
                            </v-chip>
                            <v-chip v-if="item.ozelUrun" color="purple" size="x-small" variant="tonal">
                                Özel
                            </v-chip>
                            <v-chip v-if="item.indirimliUrun" color="orange" size="x-small" variant="tonal">
                                İndirim
                            </v-chip>
                        </div>
                    </div>
                </template>

                <!-- İşlemler -->
                <template v-slot:item.islemler="{ item }">
                    <v-btn-group variant="text" density="compact">
                        <v-btn icon="mdi-eye-outline" size="small" @click="urunDetayGoster(item)" color="info" />
                        <v-btn icon="mdi-pencil-outline" size="small" @click="urunDuzenle(item)" color="primary" />
                        <v-btn icon="mdi-delete-outline" size="small" @click="urunSil(item)" color="error" />
                    </v-btn-group>
                </template>
            </v-data-table>

            <!-- Kart Görünümü -->
            <div v-else class="pa-4">
                <v-row>
                    <v-col v-for="urun in urunler" :key="urun.id" cols="12" sm="6" md="4" lg="3">
                        <v-card class="h-100" hover>
                            <!-- Ürün Görseli -->
                            <v-img :src="urun.anaGorsel || '/placeholder-product.jpg'" height="200" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-icon size="64" color="grey-lighten-2">
                                            mdi-package-variant
                                        </v-icon>
                                    </div>
                                </template>

                                <!-- Durum Etiketleri -->
                                <div class="position-absolute top-0 right-0 pa-2">
                                    <v-chip v-if="urun.yeniUrun" color="blue" size="small" class="mb-1">
                                        Yeni
                                    </v-chip>
                                    <v-chip v-if="urun.ozelUrun" color="purple" size="small" class="mb-1">
                                        Özel
                                    </v-chip>
                                    <v-chip v-if="urun.indirimliUrun" color="orange" size="small">
                                        İndirim
                                    </v-chip>
                                </div>
                            </v-img>

                            <v-card-title class="pb-2">
                                <div class="text-truncate">{{ urun.ad }}</div>
                            </v-card-title>

                            <v-card-subtitle class="pt-0">
                                <div class="d-flex justify-space-between align-center">
                                    <span>{{ urun.kodu }}</span>
                                    <v-chip v-if="urun.kategori" :color="urun.kategori.renk" size="small"
                                        variant="tonal">
                                        {{ urun.kategori.ad }}
                                    </v-chip>
                                </div>
                            </v-card-subtitle>

                            <v-card-text>
                                <div v-if="urun.kisaAciklama" class="text-body-2 mb-2">
                                    {{ urun.kisaAciklama }}
                                </div>

                                <div v-if="urun.guncelFiyat" class="text-h6 font-weight-bold primary--text">
                                    {{ formatFiyat(urun.guncelFiyat.kgFiyati) }} / {{ urun.guncelFiyat.birim }}
                                </div>
                                <div v-else class="text-body-2 text-grey-500">
                                    Fiyat belirlenmemiş
                                </div>
                            </v-card-text>

                            <v-card-actions>
                                <v-btn variant="text" color="info" @click="urunDetayGoster(urun)">
                                    <v-icon left>mdi-eye</v-icon>
                                    Detay
                                </v-btn>
                                <v-spacer />
                                <v-btn icon="mdi-pencil" variant="text" color="warning" @click="urunDuzenle(urun)" />
                                <v-btn icon="mdi-delete" variant="text" color="error" @click="urunSil(urun)" />
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Sayfalama -->
                <div class="d-flex justify-center mt-4">
                    <v-pagination v-model="pagination.page" :length="Math.max(pagination.totalPages,1)" density="compact"
                        @update:model-value="sayfaDegistir" />
                </div>
            </div>
            <!-- Tablo Alt Sayfalama -->
            <template v-if="gorunumModu === 'liste'">
                <div class="d-flex justify-space-between align-center pa-3">
                    <div class="text-caption text-grey">Toplam: {{ pagination.total }}</div>
                    <v-pagination v-model="pagination.page" :length="Math.max(pagination.totalPages,1)" density="comfortable"
                        @update:model-value="sayfaDegistir" />
                </div>
            </template>
        </v-card>

        <!-- Yeni Ürün Dialog -->
        <UrunFormDialog v-model="yeniUrunDialog" @kaydet="urunKaydet" />

        <!-- Ürün Düzenleme Dialog -->
        <UrunFormDialog v-model="duzenleDialog" :urun="seciliUrun" @kaydet="urunGuncelle" />

        <!-- Ürün Detay Dialog -->
        <UrunDetayDialog v-model="detayDialog" :urun="seciliUrun" />

        <!-- Reçete Detay Dialog -->
        <v-dialog v-model="receteDialog" max-width="800">
            <v-card>
                <v-card-title class="text-h6">
                    <v-icon color="success" class="mr-2">mdi-food-variant</v-icon>
                    {{ seciliUrun?.ad }} - Reçete Detayları
                </v-card-title>
                <v-card-text>
                    <div v-if="seciliRecete && seciliRecete.length > 0">
                        <v-list>
                            <v-list-item v-for="recete in seciliRecete" :key="recete.id">
                                <template v-slot:prepend>
                                    <v-icon color="success">mdi-clipboard-list-outline</v-icon>
                                </template>
                                <v-list-item-title>{{ recete.name }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    {{ recete.ingredients?.length || 0 }} malzeme
                                </v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-btn icon="mdi-eye" size="small" variant="text" color="info"
                                        @click="receteMalzemeGoster(recete)" title="Malzemeleri Göster"></v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </div>
                    <div v-else class="text-center py-4">
                        <v-icon size="64" color="grey-lighten-2">mdi-food-variant-off</v-icon>
                        <div class="text-h6 text-grey-500 mt-2">Reçete bulunamadı</div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="receteDialog = false">Kapat</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Malzeme Detay Dialog -->
        <v-dialog v-model="malzemeDialog" max-width="600">
            <v-card>
                <v-card-title class="text-h6">
                    <v-icon color="info" class="mr-2">mdi-clipboard-list</v-icon>
                    Reçete Malzemeleri
                </v-card-title>
                <v-card-text>
                    <v-table>
                        <thead>
                            <tr>
                                <th>Malzeme</th>
                                <th>Tip</th>
                                <th class="text-end">Miktar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="malzeme in seciliMalzemeler" :key="malzeme.id">
                                <td>{{ malzeme.stokAd || malzeme.stokKod }}</td>
                                <td>
                                    <v-chip :color="malzeme.stokTip === 'Hammadde' ? 'success' : 'warning'"
                                        size="x-small" variant="tonal">
                                        {{ malzeme.stokTip }}
                                    </v-chip>
                                </td>
                                <td class="text-end font-weight-bold">
                                    {{ malzeme.miktarGram?.toLocaleString() }} gr
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="malzemeDialog = false">Kapat</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Kategori Yönetimi Dialog -->
        <!-- Kategori yönetim dialogu kaldırıldı -->

        <!-- Silme Onay Dialog -->
        <v-dialog v-model="silmeDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">
                    <v-icon color="error" class="mr-2">mdi-delete</v-icon>
                    Ürün Sil
                </v-card-title>
                <v-card-text>
                    <strong>{{ seciliUrun?.ad }}</strong> ürününü silmek istediğinizden emin misiniz?
                    <br><br>
                    <v-alert type="warning" variant="tonal" class="mt-2">
                        Bu işlem geri alınamaz!
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="silmeDialog = false">İptal</v-btn>
                    <v-btn color="error" @click="urunSilOnayla" :loading="silmeYukleniyor">
                        Sil
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
            {{ snackbar.text }}
            <template v-slot:actions>
                <v-btn variant="text" @click="snackbar.show = false">
                    Kapat
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import UrunFormDialog from '../components/UrunFormDialog.vue'
import UrunDetayDialog from '../components/UrunDetayDialog.vue'
import KategoriYonetimDialog from '../components/KategoriYonetimDialog.vue'
import { apiCall } from '../utils/api'

export default {
    name: 'UrunYonetimi',
    components: {
        UrunFormDialog,
        UrunDetayDialog,
        KategoriYonetimDialog
    },
    setup() {
        // Reactive data
        const urunler = ref([])
        const kategoriler = ref([])
        const yukleniyor = ref(false)
        const silmeYukleniyor = ref(false)
        const gorunumModu = ref('liste')

        // Dialogs
        const yeniUrunDialog = ref(false)
        const duzenleDialog = ref(false)
        const detayDialog = ref(false)
        const kategoriDialog = ref(false)
        const silmeDialog = ref(false)
        const receteDialog = ref(false)
        const malzemeDialog = ref(false)

        const seciliUrun = ref(null)
        const seciliRecete = ref(null)
        const seciliMalzemeler = ref([])

        // Filtreler
        const filtreler = reactive({
            arama: '',
            kategori: '',
            aktif: '',
            siralama: 'ad:asc'
        })

        // Sayfalama
        const pagination = reactive({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
        })

        // Snackbar
        const snackbar = reactive({
            show: false,
            text: '',
            color: 'success'
        })

        // Tablo başlıkları
        const headers = [
            { title: 'Ürün', key: 'ad', sortable: false, width: 340 },
            { title: 'Fiyat', key: 'guncelFiyat', sortable: false, align: 'end', width: 180 },
            { title: 'Reçete', key: 'recete', sortable: false, width: 140 },
            { title: 'Durum', key: 'durum', sortable: false, width: 140 },
            { title: 'İşlemler', key: 'islemler', sortable: false, width: 120 }
        ]

        // Computed
        const kategoriSecenekleri = computed(() => [])

        const aktifUrunSayisi = computed(() => urunler.value.filter(u => u.aktif).length)
        const ozelUrunSayisi = computed(() => urunler.value.filter(u => u.ozelUrun).length)

        // Methods
        const snackbarGoster = (text, color = 'success') => {
            snackbar.text = text
            snackbar.color = color
            snackbar.show = true
        }

        const formatFiyat = (fiyat) => {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(fiyat)
        }

        const kategorileriYukle = async () => { kategoriler.value = [] }

        const urunleriYukle = async () => {
            yukleniyor.value = true
            try {
                const params = new URLSearchParams({
                    page: pagination.page,
                    limit: pagination.limit
                })

                if (filtreler.arama) params.append('search', filtreler.arama)
                // kategori filtresi kaldırıldı
                if (filtreler.aktif !== '') params.append('aktif', filtreler.aktif)

                if (filtreler.siralama) {
                    const [sortBy, sortOrder] = filtreler.siralama.split(':')
                    params.append('sortBy', sortBy)
                    params.append('sortOrder', sortOrder)
                }

                const data = await apiCall(`/urunler?${params}`)

                const list = Array.isArray(data?.products) ? data.products
                    : Array.isArray(data?.urunler) ? data.urunler
                        : Array.isArray(data) ? data
                            : []
                urunler.value = list
                pagination.total = data?.pagination?.total ?? list.length
                pagination.totalPages = data?.pagination?.pages ?? Math.ceil((pagination.total || 0) / (pagination.limit || 20))

            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error)
                snackbarGoster('Ürünler yüklenirken hata oluştu', 'error')
            } finally {
                yukleniyor.value = false
            }
        }

        const aramaYap = () => {
            pagination.page = 1
            urunleriYukle()
        }

        const sayfaDegistir = (yeniSayfa) => {
            if (!yeniSayfa || yeniSayfa === pagination.page) return
            pagination.page = yeniSayfa
            urunleriYukle()
        }

        const urunDetayGoster = (urun) => {
            seciliUrun.value = urun
            detayDialog.value = true
        }

        const receteDetayGoster = async (urun) => {
            try {
                const response = await apiCall(`/receteler?urunId=${urun.id}`, { method: 'GET' })
                // Beklenen format: { recipes: [...] }
                const list = Array.isArray(response?.recipes) ? response.recipes : Array.isArray(response) ? response : []
                seciliRecete.value = list
                seciliUrun.value = urun
                receteDialog.value = true
            } catch (error) {
                console.error('Reçete detayları yüklenirken hata:', error)
                snackbarGoster('Reçete detayları yüklenirken hata oluştu', 'error')
            }
        }

        const receteMalzemeGoster = (recete) => {
            seciliMalzemeler.value = recete.ingredients || []
            malzemeDialog.value = true
        }

        const urunDuzenle = (urun) => {
            seciliUrun.value = { ...urun }
            duzenleDialog.value = true
        }

        const urunSil = (urun) => {
            seciliUrun.value = urun
            silmeDialog.value = true
        }

        const urunKaydet = async (urunData) => {
            try {
                // Backend POST /urunler ad ve kod ister (kod uppercase).
                const payload = {
                    ad: urunData.ad,
                    kod: (urunData.kod || urunData.ad || '').toString().toUpperCase().replace(/\s+/g, '_'),
                    kategoriId: null,
                    aciklama: urunData.aciklama || null,
                    birim: (urunData.birim || 'KG').toString().toUpperCase(),
                    minStokSeviye: urunData.minStokSeviye || 0,
                    satisaUygun: urunData.satisaUygun !== false
                }
                const res = await apiCall('/urunler', payload, 'POST')
                const created = res?.product || res

                // Fiyat girilmişse fiyat yönetimine de ekle
                const fiyatDegeri = Number(urunData.fiyat)
                if (created?.id && !isNaN(fiyatDegeri) && fiyatDegeri > 0) {
                    const fiyatPayload = {
                        urunId: created.id,
                        birim: payload.birim === 'GRAM' ? 'KG' : payload.birim,
                        kgFiyati: payload.birim === 'GRAM' ? fiyatDegeri * 1000 : fiyatDegeri,
                        fiyatTipi: 'NORMAL',
                        baslangicTarihi: new Date().toISOString(),
                        aktif: true
                    }
                    try { await apiCall('/fiyatlar', fiyatPayload, 'POST') } catch (e) { console.warn('Fiyat ekleme başarısız:', e?.response?.data || e?.message) }
                }
                snackbarGoster('Ürün başarıyla oluşturuldu')
                yeniUrunDialog.value = false
                urunleriYukle()
            } catch (error) {
                console.error('Ürün kaydetme hatası:', error)
                snackbarGoster(error.message || 'Ürün kaydedilirken hata oluştu', 'error')
            }
        }

        const urunGuncelle = async (urunData) => {
            try {
                const payload = { ...urunData }
                if (payload.kategori) { delete payload.kategori }
                await apiCall(`/urunler`, { id: seciliUrun.value.id, ...payload }, 'PUT')
                snackbarGoster('Ürün başarıyla güncellendi')
                duzenleDialog.value = false
                urunleriYukle()
            } catch (error) {
                console.error('Ürün güncelleme hatası:', error)
                snackbarGoster(error.message || 'Ürün güncellenirken hata oluştu', 'error')
            }
        }

        const urunSilOnayla = async () => {
            silmeYukleniyor.value = true
            try {
                await apiCall(`/urunler`, { id: seciliUrun.value.id }, 'DELETE')
                snackbarGoster('Ürün başarıyla silindi')
                silmeDialog.value = false
                urunleriYukle()
            } catch (error) {
                console.error('Ürün silme hatası:', error)
                snackbarGoster(error.message || 'Ürün silinirken hata oluştu', 'error')
            } finally {
                silmeYukleniyor.value = false
            }
        }

        // Lifecycle
        onMounted(() => {
            urunleriYukle()
        })

        return {
            // Data
            urunler,
            kategoriler,
            yukleniyor,
            silmeYukleniyor,
            gorunumModu,
            filtreler,
            pagination,
            headers,
            seciliUrun,
            snackbar,

            // Dialogs
            yeniUrunDialog,
            duzenleDialog,
            detayDialog,
            kategoriDialog,
            silmeDialog,
            receteDialog,
            malzemeDialog,

            // Computed
            kategoriSecenekleri,
            aktifUrunSayisi,
            ozelUrunSayisi,

            // Methods
            formatFiyat,
            kategorileriYukle,
            urunleriYukle,
            aramaYap,
            sayfaDegistir,
            urunDetayGoster,
            urunDuzenle,
            urunSil,
            urunKaydet,
            urunGuncelle,
            urunSilOnayla,
            receteDetayGoster,
            receteMalzemeGoster
        }
    }
}
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
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(93,135,255,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  text-transform: none;
}

.position-absolute {
    position: absolute;
}

.top-0 {
    top: 0;
}

.right-0 {
    right: 0;
}

.h-100 {
    height: 100%;
}
</style>