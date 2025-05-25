<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="800"
        persistent>
        <v-card>
            <v-card-title class="text-h5 pa-4">
                <v-icon class="mr-2" color="primary">
                    {{ urun ? 'mdi-pencil' : 'mdi-plus' }}
                </v-icon>
                {{ urun ? 'Ürün Düzenle' : 'Yeni Ürün Ekle' }}
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4">
                <v-form ref="form" v-model="formValid">
                    <v-row>
                        <!-- Temel Bilgiler -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3">
                                <v-icon class="mr-2">mdi-information</v-icon>
                                Temel Bilgiler
                            </h3>
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.ad" label="Ürün Adı *" :rules="[rules.required]"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.kodu" label="Ürün Kodu" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select v-model="formData.kategoriId" :items="kategoriSecenekleri" label="Kategori"
                                variant="outlined" density="compact" clearable />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.stokKodu" label="Stok Kodu" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="formData.kisaAciklama" label="Kısa Açıklama" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="formData.aciklama" label="Detaylı Açıklama" variant="outlined" rows="3"
                                density="compact" />
                        </v-col>

                        <!-- Ürün Özellikleri -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3 mt-4">
                                <v-icon class="mr-2">mdi-cog</v-icon>
                                Ürün Özellikleri
                            </h3>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.agirlik" label="Ağırlık (gram)" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.barkod" label="Barkod" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-select v-model="formData.satisaBirimi" :items="birimSecenekleri" label="Satış Birimi"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.malzeme" label="Ana Malzeme" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.mensei" label="Menşei" variant="outlined"
                                density="compact" />
                        </v-col>

                        <!-- Stok Bilgileri -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3 mt-4">
                                <v-icon class="mr-2">mdi-package-variant</v-icon>
                                Stok Bilgileri
                            </h3>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.minStokMiktari" label="Min. Stok Miktarı" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.maxStokMiktari" label="Max. Stok Miktarı" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.kritikStokSeviye" label="Kritik Stok Seviyesi" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.minSatisMiktari" label="Min. Satış Miktarı" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.maxSatisMiktari" label="Max. Satış Miktarı" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <!-- Üretim Bilgileri -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3 mt-4">
                                <v-icon class="mr-2">mdi-factory</v-icon>
                                Üretim Bilgileri
                            </h3>
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.uretimSuresi" label="Üretim Süresi (dakika)" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.rafOmru" label="Raf Ömrü (gün)" type="number"
                                variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-text-field v-model="formData.maliyetFiyati" label="Maliyet Fiyatı (TL)" type="number"
                                step="0.01" variant="outlined" density="compact" />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="formData.saklamaKosullari" label="Saklama Koşulları"
                                variant="outlined" density="compact" />
                        </v-col>

                        <!-- Durum ve Etiketler -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3 mt-4">
                                <v-icon class="mr-2">mdi-tag</v-icon>
                                Durum ve Etiketler
                            </h3>
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-switch v-model="formData.aktif" label="Aktif" color="success" density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-switch v-model="formData.satisaUygun" label="Satışa Uygun" color="primary"
                                density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-switch v-model="formData.ozelUrun" label="Özel Ürün" color="purple" density="compact" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-switch v-model="formData.yeniUrun" label="Yeni Ürün" color="blue" density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-switch v-model="formData.indirimliUrun" label="İndirimli Ürün" color="orange"
                                density="compact" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field v-model="formData.karMarji" label="Kar Marjı (%)" type="number" step="0.1"
                                variant="outlined" density="compact" />
                        </v-col>

                        <!-- SEO ve Arama -->
                        <v-col cols="12">
                            <h3 class="text-h6 mb-3 mt-4">
                                <v-icon class="mr-2">mdi-magnify</v-icon>
                                SEO ve Arama
                            </h3>
                        </v-col>

                        <v-col cols="12">
                            <v-text-field v-model="formData.seoBaslik" label="SEO Başlık" variant="outlined"
                                density="compact" />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea v-model="formData.seoAciklama" label="SEO Açıklama" variant="outlined" rows="2"
                                density="compact" />
                        </v-col>

                        <v-col cols="12">
                            <v-combobox v-model="formData.anahtarKelimeler" label="Anahtar Kelimeler" multiple chips
                                variant="outlined" density="compact" hint="Enter tuşuna basarak kelime ekleyin" />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn @click="$emit('update:modelValue', false)" variant="text">
                    İptal
                </v-btn>
                <v-btn color="primary" @click="kaydet" :loading="yukleniyor" :disabled="!formValid">
                    {{ urun ? 'Güncelle' : 'Kaydet' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue'

export default {
    name: 'UrunFormDialog',
    props: {
        modelValue: Boolean,
        kategoriler: {
            type: Array,
            default: () => []
        },
        urun: {
            type: Object,
            default: null
        }
    },
    emits: ['update:modelValue', 'kaydet'],
    setup(props, { emit }) {
        const form = ref(null)
        const formValid = ref(false)
        const yukleniyor = ref(false)

        // Form data
        const formData = reactive({
            ad: '',
            kodu: '',
            aciklama: '',
            kisaAciklama: '',
            kategoriId: null,
            agirlik: null,
            barkod: '',
            stokKodu: '',
            satisaBirimi: 'KG',
            minStokMiktari: 0,
            maxStokMiktari: null,
            kritikStokSeviye: 10,
            minSatisMiktari: 1,
            maxSatisMiktari: null,
            malzeme: '',
            mensei: '',
            uretimSuresi: null,
            rafOmru: null,
            saklamaKosullari: '',
            maliyetFiyati: null,
            karMarji: null,
            aktif: true,
            satisaUygun: true,
            ozelUrun: false,
            yeniUrun: false,
            indirimliUrun: false,
            seoBaslik: '',
            seoAciklama: '',
            anahtarKelimeler: []
        })

        // Validation rules
        const rules = {
            required: value => !!value || 'Bu alan zorunludur'
        }

        // Computed
        const kategoriSecenekleri = computed(() => {
            return props.kategoriler.map(k => ({
                title: k.ad,
                value: k.id
            }))
        })

        const birimSecenekleri = [
            'KG',
            'Gram',
            'Adet',
            'Dilim',
            'Porsiyon',
            'Litre',
            'ML',
            'Paket',
            'Kutu'
        ]

        // Methods
        const resetForm = () => {
            Object.keys(formData).forEach(key => {
                if (key === 'aktif' || key === 'satisaUygun') {
                    formData[key] = true
                } else if (key === 'satisaBirimi') {
                    formData[key] = 'KG'
                } else if (key === 'minStokMiktari') {
                    formData[key] = 0
                } else if (key === 'kritikStokSeviye') {
                    formData[key] = 10
                } else if (key === 'minSatisMiktari') {
                    formData[key] = 1
                } else if (key === 'anahtarKelimeler') {
                    formData[key] = []
                } else if (typeof formData[key] === 'boolean') {
                    formData[key] = false
                } else {
                    formData[key] = null
                }
            })
        }

        const loadUrunData = () => {
            if (props.urun) {
                Object.keys(formData).forEach(key => {
                    if (props.urun[key] !== undefined) {
                        formData[key] = props.urun[key]
                    }
                })
            }
        }

        const kaydet = async () => {
            if (!formValid.value) return

            yukleniyor.value = true
            try {
                // Sayısal değerleri dönüştür
                const processedData = { ...formData }

                // Boş string'leri null yap
                Object.keys(processedData).forEach(key => {
                    if (processedData[key] === '') {
                        processedData[key] = null
                    }
                })

                emit('kaydet', processedData)
            } finally {
                yukleniyor.value = false
            }
        }

        // Watchers
        watch(() => props.modelValue, (newVal) => {
            if (newVal) {
                if (props.urun) {
                    loadUrunData()
                } else {
                    resetForm()
                }
            }
        })

        return {
            form,
            formValid,
            yukleniyor,
            formData,
            rules,
            kategoriSecenekleri,
            birimSecenekleri,
            kaydet
        }
    }
}
</script>