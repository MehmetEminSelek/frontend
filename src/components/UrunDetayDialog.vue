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

                        <!-- Maliyet Özeti -->
                        <v-card v-if="maliyetAnalizi" class="mb-4" color="success" variant="tonal">
                            <v-card-text class="pa-3">
                                <!-- Gramaj Seçici -->
                                <v-select v-model="selectedGramaj" :items="gramajSecenekleri" label="Gramaj Seçin"
                                    @update:model-value="receteMaliyetYukle" class="mb-3" density="compact"
                                    prepend-icon="mdi-scale" variant="outlined"></v-select>

                                <div class="text-subtitle-2 text-grey-600 mb-1">Maliyet Analizi ({{ selectedGramaj }}g)
                                </div>
                                <div class="text-h6 font-weight-bold">
                                    {{ formatFiyat(maliyetAnalizi.toplamMaliyet) }}
                                </div>
                                <div class="text-caption">
                                    {{ maliyetAnalizi.kgMaliyeti?.toFixed(2) || '0.00' }}₺/KG
                                </div>

                                <!-- Kar Bilgisi -->
                                <div class="mt-2">
                                    <div class="text-caption">
                                        Satış: {{ formatFiyat(maliyetAnalizi.araGramajSatisFiyati || 0) }} •
                                        Kar: {{ formatFiyat(maliyetAnalizi.karMiktari || 0) }}
                                        <span :class="maliyetAnalizi.karMarji >= 0 ? 'text-success' : 'text-error'">
                                            (%{{ maliyetAnalizi.karMarji?.toFixed(1) || '0.0' }})
                                        </span>
                                    </div>
                                </div>

                                <v-chip size="x-small" color="info" class="mt-1">
                                    {{ maliyetAnalizi.receteSayisi || 0 }} reçete
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
                                                            <div class="text-caption">Toplam Maliyet ({{ selectedGramaj
                                                                }}g)</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="success" variant="tonal"
                                                            class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ maliyetAnalizi.kgMaliyeti?.toFixed(2) || '0.00' }}₺
                                                            </div>
                                                            <div class="text-caption">KG Maliyeti</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="info" variant="tonal" class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold">
                                                                {{ formatFiyat(maliyetAnalizi.karMiktari || 0) }}
                                                            </div>
                                                            <div class="text-caption">Kar ({{ selectedGramaj }}g)</div>
                                                        </v-card>
                                                    </v-col>
                                                    <v-col cols="12" md="3">
                                                        <v-card color="warning" variant="tonal"
                                                            class="text-center pa-3">
                                                            <div class="text-h6 font-weight-bold"
                                                                :class="maliyetAnalizi.karMarji >= 0 ? 'text-success' : 'text-error'">
                                                                %{{ maliyetAnalizi.karMarji?.toFixed(1) || '0.0' }}
                                                            </div>
                                                            <div class="text-caption">Kar Marjı</div>
                                                        </v-card>
                                                    </v-col>
                                                </v-row>

                                                <!-- Karlılık Analizi -->
                                                <v-row class="mt-2">
                                                    <v-col cols="12">
                                                        <v-alert type="info" variant="tonal">
                                                            <div class="text-subtitle-2 mb-2">Fiyat Analizi ({{
                                                                selectedGramaj }}g)</div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Satış Fiyatı:</span>
                                                                <strong>{{
                                                                    formatFiyat(maliyetAnalizi.araGramajSatisFiyati ||
                                                                        0) }}</strong>
                                                            </div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Maliyet:</span>
                                                                <strong>{{ formatFiyat(maliyetAnalizi.toplamMaliyet ||
                                                                    0) }}</strong>
                                                            </div>
                                                            <div class="d-flex justify-space-between">
                                                                <span>Kar:</span>
                                                                <strong
                                                                    :class="maliyetAnalizi.karMiktari >= 0 ? 'text-success' : 'text-error'">
                                                                    {{ formatFiyat(maliyetAnalizi.karMiktari || 0) }}
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
                                                                    {{ recete.malzemeler?.length || 0 }} malzeme •
                                                                    {{ recete.toplamGram }}g •
                                                                    {{ formatFiyat(recete.toplamMaliyet) }}
                                                                </div>
                                                            </div>
                                                            <v-chip size="small" color="success">
                                                                {{ formatFiyat(recete.araGramajMaliyeti || 0) }} ({{
                                                                    selectedGramaj }}g)
                                                            </v-chip>
                                                        </div>
                                                    </v-expansion-panel-title>
                                                    <v-expansion-panel-text>
                                                        <v-data-table :headers="malzemeHeaders"
                                                            :items="recete.malzemeler" density="compact"
                                                            hide-default-footer>
                                                            <template v-slot:item.stokKod="{ item }">
                                                                <div class="font-weight-medium">{{ item.stokKod }}</div>
                                                            </template>
                                                            <template v-slot:item.miktarGram="{ item }">
                                                                {{ item.miktarGram }}g
                                                            </template>
                                                            <template v-slot:item.birimMaliyet="{ item }">
                                                                {{ item.birimMaliyet }}₺/KG
                                                            </template>
                                                            <template v-slot:item.toplamMaliyet="{ item }">
                                                                <strong>{{ formatFiyat(item.toplamMaliyet) }}</strong>
                                                            </template>
                                                            <template v-slot:item.yuzde="{ item }">
                                                                %{{ item.yuzde || 0 }}
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
        const selectedGramaj = ref(1000)
        const gramajSecenekleri = [
            { title: '250g', value: 250 },
            { title: '500g', value: 500 },
            { title: '750g', value: 750 },
            { title: '1000g (1KG)', value: 1000 },
            { title: '1250g', value: 1250 },
            { title: '1500g', value: 1500 },
            { title: '2000g (2KG)', value: 2000 },
            { title: '2500g', value: 2500 },
            { title: '3000g (3KG)', value: 3000 }
        ]

        const malzemeHeaders = [
            { title: 'Stok Kodu', key: 'stokKod', sortable: false },
            { title: 'Miktar', key: 'miktarGram', sortable: false },
            { title: 'Birim Maliyet', key: 'birimMaliyet', sortable: false },
            { title: 'Toplam Maliyet', key: 'toplamMaliyet', sortable: false },
            { title: 'Yüzde', key: 'yuzde', sortable: false }
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
                const response = await apiCall(`/urunler/${props.urun.id}/recete-maliyet?gramaj=${selectedGramaj.value}`)

                // Yeni API yapısına göre verileri ayarla
                if (response.receteler) {
                    receteler.value = response.receteler
                }

                if (response.maliyet) {
                    maliyetAnalizi.value = {
                        toplamMaliyet: response.maliyet.toplamMaliyet,
                        kgMaliyeti: response.maliyet.kgMaliyeti,
                        gramMaliyeti: response.maliyet.gramMaliyeti,
                        karMiktari: response.maliyet.karMiktari,
                        karMarji: response.maliyet.karMarji,
                        araGramajSatisFiyati: response.urun.araGramajSatisFiyati,
                        receteSayisi: response.receteler?.length || 0,
                        malzemeSayisi: response.receteler?.reduce((total, recete) => total + (recete.malzemeler?.length || 0), 0) || 0
                    }
                }

                console.log('Reçete maliyet analizi yüklendi:', { receteler: receteler.value, maliyet: maliyetAnalizi.value })
            } catch (error) {
                console.error('Reçete maliyet analizi yüklenirken hata:', error)
            } finally {
                receteYukleniyor.value = false
            }
        }

        // Ürün değiştiğinde reçete maliyetini yükle
        watch(() => props.urun?.id, (newId) => {
            if (newId) {
                receteMaliyetYukle()
            }
        }, { immediate: true })

        return {
            activeTab,
            receteYukleniyor,
            receteler,
            maliyetAnalizi,
            acikRecete,
            selectedGramaj,
            gramajSecenekleri,
            malzemeHeaders,
            formatFiyat,
            formatTarih,
            receteMaliyetYukle
        }
    }
}
</script>

<style scoped>
.v-card {
    border-radius: 12px;
}

.v-chip {
    border-radius: 8px;
}

.v-btn {
    border-radius: 8px;
}

.v-alert {
    border-radius: 8px;
}

.v-expansion-panel {
    border-radius: 8px !important;
}

.v-expansion-panel-title {
    border-radius: 8px !important;
}
</style>