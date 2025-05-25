<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="1200">
        <v-card v-if="urun">
            <v-card-title class="text-h5 pa-4 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
                Ürün Detayları
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" @click="$emit('update:modelValue', false)" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-row no-gutters>
                    <!-- Sol Panel - Ürün Görseli ve Temel Bilgiler -->
                    <v-col cols="12" md="4" class="pa-4 bg-grey-lighten-5">
                        <!-- Ürün Görseli -->
                        <v-card class="mb-4" elevation="2">
                            <v-img :src="urun.anaGorsel || '/placeholder-product.jpg'" height="250" cover>
                                <template v-slot:placeholder>
                                    <div class="d-flex align-center justify-center fill-height">
                                        <v-icon size="64" color="grey-lighten-2">
                                            mdi-package-variant
                                        </v-icon>
                                    </div>
                                </template>
                            </v-img>
                        </v-card>

                        <!-- Durum Etiketleri -->
                        <div class="mb-4">
                            <v-chip :color="urun.aktif ? 'success' : 'error'" class="mr-2 mb-2" size="small">
                                <v-icon left size="16">
                                    {{ urun.aktif ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                </v-icon>
                                {{ urun.aktif ? 'Aktif' : 'Pasif' }}
                            </v-chip>

                            <v-chip v-if="urun.yeniUrun" color="blue" class="mr-2 mb-2" size="small">
                                <v-icon left size="16">mdi-new-box</v-icon>
                                Yeni
                            </v-chip>

                            <v-chip v-if="urun.ozelUrun" color="purple" class="mr-2 mb-2" size="small">
                                <v-icon left size="16">mdi-star</v-icon>
                                Özel
                            </v-chip>

                            <v-chip v-if="urun.indirimliUrun" color="orange" class="mr-2 mb-2" size="small">
                                <v-icon left size="16">mdi-sale</v-icon>
                                İndirimli
                            </v-chip>

                            <v-chip :color="urun.satisaUygun ? 'success' : 'warning'" class="mr-2 mb-2" size="small"
                                variant="tonal">
                                {{ urun.satisaUygun ? 'Satışa Uygun' : 'Satışa Uygun Değil' }}
                            </v-chip>
                        </div>

                        <!-- Kategori -->
                        <v-card v-if="urun.kategori" class="mb-4" variant="tonal">
                            <v-card-text class="pa-3">
                                <div class="text-subtitle-2 text-grey-600 mb-1">Kategori</div>
                                <v-chip :color="urun.kategori.renk" size="small">
                                    <v-icon left size="16">{{ urun.kategori.ikon }}</v-icon>
                                    {{ urun.kategori.ad }}
                                </v-chip>
                            </v-card-text>
                        </v-card>

                        <!-- Güncel Fiyat -->
                        <v-card v-if="urun.guncelFiyat" class="mb-4" color="primary" variant="tonal">
                            <v-card-text class="pa-3">
                                <div class="text-subtitle-2 text-grey-600 mb-1">Güncel Fiyat</div>
                                <div class="text-h6 font-weight-bold">
                                    {{ formatFiyat(urun.guncelFiyat.fiyat) }} / {{ urun.guncelFiyat.birim }}
                                </div>
                                <v-chip v-if="urun.guncelFiyat.fiyatTipi !== 'normal'" size="x-small" color="orange"
                                    class="mt-1">
                                    {{ urun.guncelFiyat.fiyatTipi }}
                                </v-chip>
                            </v-card-text>
                        </v-card>

                        <!-- Maliyet Özeti -->
                        <v-card v-if="maliyetAnalizi" class="mb-4" color="success" variant="tonal">
                            <v-card-text class="pa-3">
                                <div class="text-subtitle-2 text-grey-600 mb-1">Maliyet Analizi</div>
                                <div class="text-h6 font-weight-bold">
                                    {{ formatFiyat(maliyetAnalizi.toplamMaliyet) }}
                                </div>
                                <div class="text-caption">
                                    {{ maliyetAnalizi.gramMaliyeti.toFixed(2) }} kr/gram
                                </div>
                                <v-chip size="x-small" color="info" class="mt-1">
                                    {{ maliyetAnalizi.receteSayisi }} reçete
                                </v-chip>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <!-- Sağ Panel - Detaylı Bilgiler -->
                    <v-col cols="12" md="8" class="pa-4">
                        <v-tabs v-model="activeTab" color="primary">
                            <v-tab value="genel">
                                <v-icon left>mdi-information</v-icon>
                                Genel Bilgiler
                            </v-tab>
                            <v-tab value="ozellikler">
                                <v-icon left>mdi-cog</v-icon>
                                Özellikler
                            </v-tab>
                            <v-tab value="stok">
                                <v-icon left>mdi-package-variant</v-icon>
                                Stok
                            </v-tab>
                            <v-tab value="uretim">
                                <v-icon left>mdi-factory</v-icon>
                                Üretim & Reçete
                            </v-tab>
                        </v-tabs>

                        <v-window v-model="activeTab" class="mt-4">
                            <!-- Genel Bilgiler -->
                            <v-window-item value="genel">
                                <v-row>
                                    <v-col cols="12">
                                        <h2 class="text-h5 font-weight-bold mb-2">{{ urun.ad }}</h2>
                                        <p v-if="urun.kisaAciklama" class="text-subtitle-1 text-grey-600 mb-4">
                                            {{ urun.kisaAciklama }}
                                        </p>
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Ürün Kodu" :value="urun.kodu" icon="mdi-barcode" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Stok Kodu" :value="urun.stokKodu" icon="mdi-tag" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Barkod" :value="urun.barkod" icon="mdi-barcode-scan" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Satış Birimi" :value="urun.satisaBirimi" icon="mdi-scale" />
                                    </v-col>

                                    <v-col cols="12" v-if="urun.aciklama">
                                        <DetailItem label="Açıklama" :value="urun.aciklama" icon="mdi-text" />
                                    </v-col>

                                    <v-col cols="12" v-if="urun.anahtarKelimeler && urun.anahtarKelimeler.length">
                                        <div class="mb-2">
                                            <v-icon class="mr-2" size="20">mdi-tag-multiple</v-icon>
                                            <span class="text-subtitle-2">Anahtar Kelimeler</span>
                                        </div>
                                        <div>
                                            <v-chip v-for="kelime in urun.anahtarKelimeler" :key="kelime" size="small"
                                                class="mr-1 mb-1" variant="outlined">
                                                {{ kelime }}
                                            </v-chip>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-window-item>

                            <!-- Özellikler -->
                            <v-window-item value="ozellikler">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <DetailItem label="Ağırlık"
                                            :value="urun.agirlik ? `${urun.agirlik} gram` : null" icon="mdi-weight" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Ana Malzeme" :value="urun.malzeme"
                                            icon="mdi-package-variant-closed" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Menşei" :value="urun.mensei" icon="mdi-earth" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Renk" :value="urun.renk" icon="mdi-palette" />
                                    </v-col>

                                    <v-col cols="12" v-if="urun.boyutlar">
                                        <DetailItem label="Boyutlar" :value="urun.boyutlar" icon="mdi-ruler" />
                                    </v-col>

                                    <v-col cols="12" v-if="urun.saklamaKosullari">
                                        <DetailItem label="Saklama Koşulları" :value="urun.saklamaKosullari"
                                            icon="mdi-fridge" />
                                    </v-col>
                                </v-row>
                            </v-window-item>

                            <!-- Stok Bilgileri -->
                            <v-window-item value="stok">
                                <v-row>
                                    <v-col cols="12" md="4">
                                        <DetailItem label="Min. Stok Miktarı" :value="urun.minStokMiktari"
                                            icon="mdi-arrow-down-bold" />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <DetailItem label="Max. Stok Miktarı" :value="urun.maxStokMiktari"
                                            icon="mdi-arrow-up-bold" />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <DetailItem label="Kritik Stok Seviyesi" :value="urun.kritikStokSeviye"
                                            icon="mdi-alert" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Min. Satış Miktarı" :value="urun.minSatisMiktari"
                                            icon="mdi-cart-arrow-down" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Max. Satış Miktarı" :value="urun.maxSatisMiktari"
                                            icon="mdi-cart-arrow-up" />
                                    </v-col>
                                </v-row>
                            </v-window-item>

                            <!-- Üretim ve Reçete Bilgileri -->
                            <v-window-item value="uretim">
                                <v-row>
                                    <!-- Üretim Bilgileri -->
                                    <v-col cols="12">
                                        <h3 class="text-h6 mb-3 d-flex align-center">
                                            <v-icon class="mr-2">mdi-factory</v-icon>
                                            Üretim Bilgileri
                                        </h3>
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Üretim Süresi"
                                            :value="urun.uretimSuresi ? `${urun.uretimSuresi} dakika` : null"
                                            icon="mdi-clock" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Raf Ömrü"
                                            :value="urun.rafOmru ? `${urun.rafOmru} gün` : null"
                                            icon="mdi-calendar-clock" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Maliyet Fiyatı"
                                            :value="urun.maliyetFiyati ? formatFiyat(urun.maliyetFiyati) : null"
                                            icon="mdi-currency-try" />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <DetailItem label="Kar Marjı"
                                            :value="urun.karMarji ? `%${urun.karMarji}` : null" icon="mdi-percent" />
                                    </v-col>

                                    <!-- Reçete ve Maliyet Analizi -->
                                    <v-col cols="12" class="mt-4">
                                        <v-divider class="mb-4" />
                                        <h3 class="text-h6 mb-3 d-flex align-center">
                                            <v-icon class="mr-2">mdi-book-open-variant</v-icon>
                                            Reçete ve Maliyet Analizi
                                            <v-spacer />
                                            <v-btn @click="receteMaliyetYukle" :loading="receteYukleniyor" size="small"
                                                variant="outlined">
                                                <v-icon left>mdi-refresh</v-icon>
                                                Yenile
                                            </v-btn>
                                        </h3>

                                        <!-- Maliyet Özeti -->
                                        <v-card v-if="maliyetAnalizi" class="mb-4" variant="outlined">
                                            <v-card-text>
                                                <v-row>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="primary" variant="tonal"
                                                            class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ formatFiyat(maliyetAnalizi.toplamMaliyet) }}
                                                            </div>
                                                            <div class="text-caption">Toplam Maliyet</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="success" variant="tonal"
                                                            class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ maliyetAnalizi.gramMaliyeti.toFixed(2) }} kr
                                                            </div>
                                                            <div class="text-caption">Gram Maliyeti</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="info" variant="tonal" class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ maliyetAnalizi.receteSayisi }}
                                                            </div>
                                                            <div class="text-caption">Reçete Sayısı</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="warning" variant="tonal"
                                                            class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ maliyetAnalizi.malzemeSayisi }}
                                                            </div>
                                                            <div class="text-caption">Toplam Malzeme</div>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>

                                                <!-- Karlılık Analizi -->
                                                <v-row v-if="maliyetAnalizi.karlilik" class="mt-2">
                                                    <v-col cols="12">
                                                        <v-alert type="info" variant="tonal">
                                                            <div class="text-subtitle-2 mb-2">Karlılık Analizi</div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Hesaplanan Maliyet:</span>
                                                                <strong>{{
                                                                    formatFiyat(maliyetAnalizi.karlilik.hesaplananMaliyet)
                                                                    }}</strong>
                                                            </div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Tanımlı Maliyet:</span>
                                                                <strong>{{
                                                                    formatFiyat(maliyetAnalizi.karlilik.maliyetFiyati)
                                                                    }}</strong>
                                                            </div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Fark:</span>
                                                                <strong
                                                                    :class="maliyetAnalizi.karlilik.farkYuzdesi >= 0 ? 'text-success' : 'text-error'">
                                                                    %{{ maliyetAnalizi.karlilik.farkYuzdesi.toFixed(1)
                                                                    }}
                                                                </strong>
                                                            </div>
                                                        </v-alert>
                                                    </v-col>
                                                </v-row>
                                            </v-card-text>
                                        </v-card>

                                        <!-- Reçeteler -->
                                        <div v-if="receteler && receteler.length > 0">
                                            <v-expansion-panels v-model="acikRecete" multiple>
                                                <v-expansion-panel v-for="(recete, index) in receteler"
                                                    :key="recete.id">
                                                    <v-expansion-panel-title>
                                                        <div class="d-flex align-center w-100">
                                                            <v-icon class="mr-3">mdi-book-open-variant</v-icon>
                                                            <div class="flex-grow-1">
                                                                <div class="text-subtitle-1 font-weight-medium">{{
                                                                    recete.name }}</div>
                                                                <div class="text-caption text-grey-600">
                                                                    {{ recete.ozet.malzemeSayisi }} malzeme •
                                                                    {{ recete.ozet.toplamGram }}g •
                                                                    {{ formatFiyat(recete.ozet.toplamMaliyet) }}
                                                                </div>
                                                            </div>
                                                            <v-chip size="small"
                                                                :color="recete.ozet.eksikMalzeme > 0 ? 'warning' : 'success'">
                                                                {{ recete.ozet.gramMaliyeti.toFixed(2) }} kr/g
                                                            </v-chip>
                                                        </div>
                                                    </v-expansion-panel-title>
                                                    <v-expansion-panel-text>
                                                        <v-data-table :headers="malzemeHeaders"
                                                            :items="recete.malzemeler" density="compact"
                                                            hide-default-footer>
                                                            <template v-slot:item.malzemeAdi="{ item }">
                                                                <div class="d-flex align-center">
                                                                    <v-icon :color="item.mevcut ? 'success' : 'error'"
                                                                        size="16" class="mr-2">
                                                                        {{ item.mevcut ? 'mdi-check-circle' :
                                                                        'mdi-alert-circle' }}
                                                                    </v-icon>
                                                                    <div>
                                                                        <div>{{ item.malzemeAdi || 'Bilinmeyen Malzeme'
                                                                            }}</div>
                                                                        <div class="text-caption text-grey-600">{{
                                                                            item.stokKod }}</div>
                                                                    </div>
                                                                </div>
                                                            </template>
                                                            <template v-slot:item.malzemeTipi="{ item }">
                                                                <v-chip size="x-small"
                                                                    :color="item.malzemeTipi === 'Hammadde' ? 'blue' : 'purple'">
                                                                    {{ item.malzemeTipi }}
                                                                </v-chip>
                                                            </template>
                                                            <template v-slot:item.miktarGram="{ item }">
                                                                {{ item.miktarGram }}g
                                                            </template>
                                                            <template v-slot:item.birimMaliyet="{ item }">
                                                                {{ item.birimMaliyet.toFixed(3) }} kr/g
                                                            </template>
                                                            <template v-slot:item.toplamMaliyet="{ item }">
                                                                <strong>{{ formatFiyat(item.toplamMaliyet) }}</strong>
                                                            </template>
                                                        </v-data-table>
                                                    </v-expansion-panel-text>
                                                </v-expansion-panel>
                                            </v-expansion-panels>
                                        </div>

                                        <!-- Reçete Yok Mesajı -->
                                        <v-alert v-else-if="!receteYukleniyor" type="info" variant="tonal">
                                            <div class="text-center">
                                                <v-icon size="48" class="mb-2">mdi-book-open-variant</v-icon>
                                                <div class="text-h6 mb-2">Reçete Bulunamadı</div>
                                                <div class="text-body-2">Bu ürün için henüz reçete tanımlanmamış.</div>
                                            </div>
                                        </v-alert>

                                        <!-- Yükleniyor -->
                                        <div v-if="receteYukleniyor" class="text-center py-8">
                                            <v-progress-circular indeterminate color="primary" size="48" />
                                            <div class="mt-2">Reçete ve maliyet bilgileri yükleniyor...</div>
                                        </div>
                                    </v-col>

                                    <!-- Tarih Bilgileri -->
                                    <v-col cols="12" class="mt-4">
                                        <v-divider class="mb-4" />
                                        <v-row>
                                            <v-col cols="12" md="6">
                                                <DetailItem label="Oluşturulma Tarihi"
                                                    :value="formatTarih(urun.createdAt)" icon="mdi-calendar-plus" />
                                            </v-col>

                                            <v-col cols="12" md="6">
                                                <DetailItem label="Güncellenme Tarihi"
                                                    :value="formatTarih(urun.updatedAt)" icon="mdi-calendar-edit" />
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-window-item>
                        </v-window>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn @click="$emit('update:modelValue', false)" variant="text">
                    Kapat
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { apiCall } from '@/utils/api'

// Detail Item Component
const DetailItem = {
    props: {
        label: String,
        value: [String, Number],
        icon: String
    },
    template: `
    <div v-if="value" class="mb-3">
      <div class="d-flex align-center mb-1">
        <v-icon class="mr-2" size="20" color="grey-darken-1">{{ icon }}</v-icon>
        <span class="text-subtitle-2 text-grey-600">{{ label }}</span>
      </div>
      <div class="text-body-1 ml-7">{{ value }}</div>
    </div>
  `
}

export default {
    name: 'UrunDetayDialog',
    components: {
        DetailItem
    },
    props: {
        modelValue: Boolean,
        urun: {
            type: Object,
            default: null
        }
    },
    emits: ['update:modelValue'],
    setup(props) {
        const activeTab = ref('genel')
        const receteYukleniyor = ref(false)
        const receteler = ref([])
        const maliyetAnalizi = ref(null)
        const acikRecete = ref([])

        const malzemeHeaders = [
            { title: 'Malzeme', key: 'malzemeAdi', sortable: false },
            { title: 'Tip', key: 'malzemeTipi', sortable: false },
            { title: 'Miktar', key: 'miktarGram', sortable: false },
            { title: 'Birim Maliyet', key: 'birimMaliyet', sortable: false },
            { title: 'Toplam Maliyet', key: 'toplamMaliyet', sortable: false }
        ]

        const formatFiyat = (fiyat) => {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(fiyat)
        }

        const formatTarih = (tarih) => {
            if (!tarih) return null
            return new Date(tarih).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const receteMaliyetYukle = async () => {
            if (!props.urun?.id) return

            receteYukleniyor.value = true
            try {
                const response = await apiCall(`/urunler/${props.urun.id}/recete-maliyet`)
                receteler.value = response.receteler || []
                maliyetAnalizi.value = response.maliyetAnalizi || null
            } catch (error) {
                console.error('Reçete maliyet yükleme hatası:', error)
            } finally {
                receteYukleniyor.value = false
            }
        }

        // Dialog açıldığında reçete bilgilerini yükle
        watch(() => props.modelValue, (newVal) => {
            if (newVal && props.urun?.id) {
                receteMaliyetYukle()
            }
        })

        return {
            activeTab,
            receteYukleniyor,
            receteler,
            maliyetAnalizi,
            acikRecete,
            malzemeHeaders,
            formatFiyat,
            formatTarih,
            receteMaliyetYukle
        }
    }
}
</script>

<style scoped>
.fill-height {
    height: 100%;
}
</style>