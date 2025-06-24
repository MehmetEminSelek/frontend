<template>
    <v-container fluid>
        <!-- Başlık ve Hızlı Eylemler -->
        <v-row class="mb-4">
            <v-col cols="12" md="6">
                <h1 class="text-h4 font-weight-bold">
                    <v-icon class="mr-2" color="primary">mdi-package-variant</v-icon>
                    Ürün Yönetimi
                </h1>
                <p class="text-subtitle-1 text-grey-600 mt-2">
                    Ürünlerinizi ekleyin, düzenleyin ve yönetin
                </p>
            </v-col>
            <v-col cols="12" md="6" class="text-right">
                <v-btn color="primary" size="large" @click="yeniUrunDialog = true" class="mr-2">
                    <v-icon left>mdi-plus</v-icon>
                    Yeni Ürün
                </v-btn>
                <v-btn color="secondary" size="large" @click="kategoriDialog = true">
                    <v-icon left>mdi-folder-plus</v-icon>
                    Kategori Yönet
                </v-btn>
            </v-col>
        </v-row>

        <!-- İstatistik Kartları -->
        <v-row class="mb-6">
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="primary" dark>
                    <div class="d-flex align-center">
                        <v-icon size="40" class="mr-3">mdi-package-variant</v-icon>
                        <div>
                            <div class="text-h4 font-weight-bold">{{ istatistikler.toplamUrun }}</div>
                            <div class="text-subtitle-2">Toplam Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="success" dark>
                    <div class="d-flex align-center">
                        <v-icon size="40" class="mr-3">mdi-check-circle</v-icon>
                        <div>
                            <div class="text-h4 font-weight-bold">{{ istatistikler.aktifUrun }}</div>
                            <div class="text-subtitle-2">Aktif Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="warning" dark>
                    <div class="d-flex align-center">
                        <v-icon size="40" class="mr-3">mdi-star</v-icon>
                        <div>
                            <div class="text-h4 font-weight-bold">{{ istatistikler.ozelUrun }}</div>
                            <div class="text-subtitle-2">Özel Ürün</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="3">
                <v-card class="pa-4" color="info" dark>
                    <div class="d-flex align-center">
                        <v-icon size="40" class="mr-3">mdi-folder</v-icon>
                        <div>
                            <div class="text-h4 font-weight-bold">{{ kategoriler.length }}</div>
                            <div class="text-subtitle-2">Kategori</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Filtreler ve Arama -->
        <v-card class="mb-4">
            <v-card-title>
                <v-icon class="mr-2">mdi-filter</v-icon>
                Filtreler ve Arama
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="filtreler.arama" label="Ürün Ara..." prepend-inner-icon="mdi-magnify"
                            clearable @input="aramaYap" variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-select v-model="filtreler.kategori" :items="kategoriSecenekleri" label="Kategori"
                            prepend-inner-icon="mdi-folder" clearable @update:model-value="urunleriYukle"
                            variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-select v-model="filtreler.aktif" :items="[
                            { title: 'Tümü', value: '' },
                            { title: 'Aktif', value: 'true' },
                            { title: 'Pasif', value: 'false' }
                        ]" label="Durum" prepend-inner-icon="mdi-toggle-switch" @update:model-value="urunleriYukle"
                            variant="outlined" density="compact" />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-select v-model="filtreler.siralama" :items="[
                            { title: 'Ad (A-Z)', value: 'ad:asc' },
                            { title: 'Ad (Z-A)', value: 'ad:desc' },
                            { title: 'Kod (A-Z)', value: 'kodu:asc' },
                            { title: 'Tarih (Yeni)', value: 'createdAt:desc' },
                            { title: 'Tarih (Eski)', value: 'createdAt:asc' }
                        ]" label="Sıralama" prepend-inner-icon="mdi-sort" @update:model-value="urunleriYukle"
                            variant="outlined" density="compact" />
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Ürün Listesi -->
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>
                    <v-icon class="mr-2">mdi-view-list</v-icon>
                    Ürün Listesi ({{ pagination.total }} ürün)
                </span>
                <v-btn-toggle v-model="gorunumModu" mandatory>
                    <v-btn value="liste" size="small">
                        <v-icon>mdi-view-list</v-icon>
                    </v-btn>
                    <v-btn value="kart" size="small">
                        <v-icon>mdi-view-grid</v-icon>
                    </v-btn>
                </v-btn-toggle>
            </v-card-title>

            <!-- Liste Görünümü -->
            <v-data-table v-if="gorunumModu === 'liste'" :headers="headers" :items="urunler" :loading="yukleniyor"
                :items-per-page="pagination.limit" :page="pagination.page" :server-items-length="pagination.total"
                @update:page="sayfaDegistir" class="elevation-0">
                <!-- Ürün Adı -->
                <template v-slot:item.ad="{ item }">
                    <div class="d-flex align-center">
                        <v-avatar size="40" class="mr-3" color="grey-lighten-3">
                            <v-img v-if="item.anaGorsel" :src="item.anaGorsel" :alt="item.ad" />
                            <v-icon v-else>mdi-package-variant</v-icon>
                        </v-avatar>
                        <div>
                            <div class="font-weight-medium">{{ item.ad }}</div>
                            <div class="text-caption text-grey-600">{{ item.kodu }}</div>
                        </div>
                    </div>
                </template>

                <!-- Kategori -->
                <template v-slot:item.kategori="{ item }">
                    <v-chip v-if="item.kategori" :color="item.kategori.renk" size="small" variant="tonal">
                        <v-icon left size="16">{{ item.kategori.ikon }}</v-icon>
                        {{ item.kategori.ad }}
                    </v-chip>
                    <span v-else class="text-grey-500">-</span>
                </template>

                <!-- Fiyat -->
                <template v-slot:item.guncelFiyat="{ item }">
                    <div v-if="item.guncelFiyat">
                        <div class="font-weight-medium">
                            {{ formatFiyat(item.guncelFiyat.fiyat) }} / {{ item.guncelFiyat.birim }}
                        </div>
                        <v-chip v-if="item.guncelFiyat.fiyatTipi !== 'normal'" size="x-small" color="orange"
                            variant="tonal">
                            {{ item.guncelFiyat.fiyatTipi }}
                        </v-chip>
                    </div>
                    <span v-else class="text-grey-500">Fiyat yok</span>
                </template>

                <!-- Reçete -->
                <template v-slot:item.recete="{ item }">
                    <div v-if="item.receteAdedi > 0" class="d-flex align-center">
                        <v-icon size="small" color="success" class="mr-1">mdi-food-variant</v-icon>
                        <span class="text-body-2">{{ item.receteAdedi }} reçete</span>
                        <v-btn icon="mdi-eye" size="x-small" variant="text" color="info" 
                               @click="receteDetayGoster(item)" class="ml-1" title="Reçete Detayı"></v-btn>
                    </div>
                    <span v-else class="text-grey-500">Reçete yok</span>
                </template>

                <!-- Durum -->
                <template v-slot:item.durum="{ item }">
                    <div class="d-flex flex-column gap-1">
                        <v-chip :color="item.aktif ? 'success' : 'error'" size="small" variant="tonal">
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
                        <v-btn icon="mdi-eye" size="small" @click="urunDetayGoster(item)" color="info" />
                        <v-btn icon="mdi-pencil" size="small" @click="urunDuzenle(item)" color="warning" />
                        <v-btn icon="mdi-delete" size="small" @click="urunSil(item)" color="error" />
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
                                    {{ formatFiyat(urun.guncelFiyat.fiyat) }} / {{ urun.guncelFiyat.birim }}
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
                    <v-pagination v-model="pagination.page" :length="pagination.totalPages"
                        @update:model-value="sayfaDegistir" />
                </div>
            </div>
        </v-card>

        <!-- Yeni Ürün Dialog -->
        <UrunFormDialog v-model="yeniUrunDialog" :kategoriler="kategoriler" @kaydet="urunKaydet" />

        <!-- Ürün Düzenleme Dialog -->
        <UrunFormDialog v-model="duzenleDialog" :kategoriler="kategoriler" :urun="seciliUrun" @kaydet="urunGuncelle" />

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
        <KategoriYonetimDialog v-model="kategoriDialog" @guncelle="kategorileriYukle" />

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
            { title: 'Ürün', key: 'ad', sortable: false },
            { title: 'Kategori', key: 'kategori', sortable: false },
            { title: 'Fiyat', key: 'guncelFiyat', sortable: false },
            { title: 'Durum', key: 'durum', sortable: false },
            { title: 'İşlemler', key: 'islemler', sortable: false, width: 120 }
        ]

        // Computed
        const kategoriSecenekleri = computed(() => {
            return kategoriler.value.map(k => ({
                title: k.ad,
                value: k.id
            }))
        })

        const istatistikler = computed(() => {
            return {
                toplamUrun: urunler.value.length,
                aktifUrun: urunler.value.filter(u => u.aktif).length,
                ozelUrun: urunler.value.filter(u => u.ozelUrun).length
            }
        })

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

        const kategorileriYukle = async () => {
            try {
                const data = await apiCall('/kategoriler')
                kategoriler.value = data.kategoriler
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error)
                snackbarGoster('Kategoriler yüklenirken hata oluştu', 'error')
            }
        }

        const urunleriYukle = async () => {
            yukleniyor.value = true
            try {
                const params = new URLSearchParams({
                    page: pagination.page,
                    limit: pagination.limit
                })

                if (filtreler.arama) params.append('search', filtreler.arama)
                if (filtreler.kategori) params.append('kategori', filtreler.kategori)
                if (filtreler.aktif !== '') params.append('aktif', filtreler.aktif)

                if (filtreler.siralama) {
                    const [sortBy, sortOrder] = filtreler.siralama.split(':')
                    params.append('sortBy', sortBy)
                    params.append('sortOrder', sortOrder)
                }

                const data = await apiCall(`/urunler?${params}`)

                urunler.value = data.urunler
                pagination.total = data.pagination.total
                pagination.totalPages = data.pagination.totalPages

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
            pagination.page = yeniSayfa
            urunleriYukle()
        }

        const urunDetayGoster = (urun) => {
            seciliUrun.value = urun
            detayDialog.value = true
        }

        const receteDetayGoster = async (urun) => {
            try {
                // Ürünün reçetelerini getir
                const response = await apiCall(`/receteler?urunId=${urun.id}`)
                seciliRecete.value = response
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
                const response = await fetch('/api/urunler', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(urunData)
                })

                if (response.ok) {
                    snackbarGoster('Ürün başarıyla oluşturuldu')
                    yeniUrunDialog.value = false
                    urunleriYukle()
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Ürün oluşturulurken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Ürün kaydetme hatası:', error)
                snackbarGoster('Ürün kaydedilirken hata oluştu', 'error')
            }
        }

        const urunGuncelle = async (urunData) => {
            try {
                const response = await fetch(`/api/urunler/${seciliUrun.value.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(urunData)
                })

                if (response.ok) {
                    snackbarGoster('Ürün başarıyla güncellendi')
                    duzenleDialog.value = false
                    urunleriYukle()
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Ürün güncellenirken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Ürün güncelleme hatası:', error)
                snackbarGoster('Ürün güncellenirken hata oluştu', 'error')
            }
        }

        const urunSilOnayla = async () => {
            silmeYukleniyor.value = true
            try {
                const response = await fetch(`/api/urunler/${seciliUrun.value.id}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    snackbarGoster('Ürün başarıyla silindi')
                    silmeDialog.value = false
                    urunleriYukle()
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Ürün silinirken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Ürün silme hatası:', error)
                snackbarGoster('Ürün silinirken hata oluştu', 'error')
            } finally {
                silmeYukleniyor.value = false
            }
        }

        // Lifecycle
        onMounted(() => {
            kategorileriYukle()
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
            istatistikler,

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