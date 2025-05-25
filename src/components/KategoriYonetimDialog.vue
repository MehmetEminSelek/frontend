<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="700"
        persistent>
        <v-card>
            <v-card-title class="text-h5 pa-4">
                <v-icon class="mr-2" color="primary">mdi-folder-cog</v-icon>
                Kategori Yönetimi
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4">
                <!-- Yeni Kategori Ekleme -->
                <v-card class="mb-4" variant="tonal" color="primary">
                    <v-card-title class="text-h6 pa-3">
                        <v-icon class="mr-2">mdi-plus</v-icon>
                        Yeni Kategori Ekle
                    </v-card-title>
                    <v-card-text class="pt-0">
                        <v-form ref="form" v-model="formValid">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="yeniKategori.ad" label="Kategori Adı *"
                                        :rules="[rules.required]" variant="outlined" density="compact" />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="yeniKategori.siraNo" label="Sıra No" type="number"
                                        variant="outlined" density="compact" />
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea v-model="yeniKategori.aciklama" label="Açıklama" variant="outlined"
                                        rows="2" density="compact" />
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="yeniKategori.renk" :items="renkSecenekleri" label="Renk"
                                        variant="outlined" density="compact">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props">
                                                <template v-slot:prepend>
                                                    <v-icon :color="item.value">mdi-circle</v-icon>
                                                </template>
                                            </v-list-item>
                                        </template>
                                        <template v-slot:selection="{ item }">
                                            <v-icon :color="item.value" class="mr-2">mdi-circle</v-icon>
                                            {{ item.title }}
                                        </template>
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="yeniKategori.ikon" :items="ikonSecenekleri" label="İkon"
                                        variant="outlined" density="compact">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props">
                                                <template v-slot:prepend>
                                                    <v-icon>{{ item.value }}</v-icon>
                                                </template>
                                            </v-list-item>
                                        </template>
                                        <template v-slot:selection="{ item }">
                                            <v-icon class="mr-2">{{ item.value }}</v-icon>
                                            {{ item.title }}
                                        </template>
                                    </v-select>
                                </v-col>
                                <v-col cols="12">
                                    <v-btn color="primary" @click="kategoriEkle" :loading="eklemeYukleniyor"
                                        :disabled="!formValid" block>
                                        <v-icon left>mdi-plus</v-icon>
                                        Kategori Ekle
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>

                <!-- Mevcut Kategoriler -->
                <v-card>
                    <v-card-title class="text-h6 pa-3">
                        <v-icon class="mr-2">mdi-view-list</v-icon>
                        Mevcut Kategoriler ({{ kategoriler.length }})
                    </v-card-title>
                    <v-card-text class="pa-0">
                        <v-list v-if="kategoriler.length">
                            <template v-for="(kategori, index) in kategoriler" :key="kategori.id">
                                <v-list-item class="px-4 py-2">
                                    <template v-slot:prepend>
                                        <v-avatar :color="kategori.renk" size="40">
                                            <v-icon color="white">{{ kategori.ikon }}</v-icon>
                                        </v-avatar>
                                    </template>

                                    <v-list-item-title class="font-weight-medium">
                                        {{ kategori.ad }}
                                    </v-list-item-title>

                                    <v-list-item-subtitle>
                                        {{ kategori.aciklama || 'Açıklama yok' }}
                                        <br>
                                        <v-chip size="x-small" variant="outlined" class="mt-1">
                                            {{ kategori.urunSayisi }} ürün
                                        </v-chip>
                                        <v-chip v-if="kategori.siraNo" size="x-small" variant="outlined"
                                            class="mt-1 ml-1">
                                            Sıra: {{ kategori.siraNo }}
                                        </v-chip>
                                        <v-chip :color="kategori.aktif ? 'success' : 'error'" size="x-small"
                                            variant="tonal" class="mt-1 ml-1">
                                            {{ kategori.aktif ? 'Aktif' : 'Pasif' }}
                                        </v-chip>
                                    </v-list-item-subtitle>

                                    <template v-slot:append>
                                        <v-btn-group variant="text" density="compact">
                                            <v-btn icon="mdi-pencil" size="small" @click="kategoriDuzenle(kategori)"
                                                color="warning" />
                                            <v-btn icon="mdi-delete" size="small" @click="kategoriSil(kategori)"
                                                color="error" :disabled="kategori.urunSayisi > 0" />
                                        </v-btn-group>
                                    </template>
                                </v-list-item>
                                <v-divider v-if="index < kategoriler.length - 1" />
                            </template>
                        </v-list>
                        <div v-else class="text-center pa-8 text-grey-500">
                            <v-icon size="64" class="mb-4">mdi-folder-open</v-icon>
                            <div>Henüz kategori eklenmemiş</div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn @click="$emit('update:modelValue', false)" variant="text">
                    Kapat
                </v-btn>
            </v-card-actions>
        </v-card>

        <!-- Düzenleme Dialog -->
        <v-dialog v-model="duzenleDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h6">
                    <v-icon class="mr-2" color="warning">mdi-pencil</v-icon>
                    Kategori Düzenle
                </v-card-title>
                <v-card-text>
                    <v-form ref="duzenleForm" v-model="duzenleFormValid">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="duzenlenecekKategori.ad" label="Kategori Adı *"
                                    :rules="[rules.required]" variant="outlined" density="compact" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="duzenlenecekKategori.aciklama" label="Açıklama" variant="outlined"
                                    rows="2" density="compact" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select v-model="duzenlenecekKategori.renk" :items="renkSecenekleri" label="Renk"
                                    variant="outlined" density="compact">
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props">
                                            <template v-slot:prepend>
                                                <v-icon :color="item.value">mdi-circle</v-icon>
                                            </template>
                                        </v-list-item>
                                    </template>
                                    <template v-slot:selection="{ item }">
                                        <v-icon :color="item.value" class="mr-2">mdi-circle</v-icon>
                                        {{ item.title }}
                                    </template>
                                </v-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select v-model="duzenlenecekKategori.ikon" :items="ikonSecenekleri" label="İkon"
                                    variant="outlined" density="compact">
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props">
                                            <template v-slot:prepend>
                                                <v-icon>{{ item.value }}</v-icon>
                                            </template>
                                        </v-list-item>
                                    </template>
                                    <template v-slot:selection="{ item }">
                                        <v-icon class="mr-2">{{ item.value }}</v-icon>
                                        {{ item.title }}
                                    </template>
                                </v-select>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="duzenlenecekKategori.siraNo" label="Sıra No" type="number"
                                    variant="outlined" density="compact" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-switch v-model="duzenlenecekKategori.aktif" label="Aktif" color="success"
                                    density="compact" />
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="duzenleDialog = false">İptal</v-btn>
                    <v-btn color="warning" @click="kategoriGuncelle" :loading="guncellemeYukleniyor"
                        :disabled="!duzenleFormValid">
                        Güncelle
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Silme Onay Dialog -->
        <v-dialog v-model="silmeDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">
                    <v-icon color="error" class="mr-2">mdi-delete</v-icon>
                    Kategori Sil
                </v-card-title>
                <v-card-text>
                    <strong>{{ silinecekKategori?.ad }}</strong> kategorisini silmek istediğinizden emin misiniz?
                    <br><br>
                    <v-alert type="warning" variant="tonal" class="mt-2">
                        Bu işlem geri alınamaz!
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="silmeDialog = false">İptal</v-btn>
                    <v-btn color="error" @click="kategoriSilOnayla" :loading="silmeYukleniyor">
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
    </v-dialog>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { apiCall, API_BASE_URL } from '@/utils/api'

export default {
    name: 'KategoriYonetimDialog',
    props: {
        modelValue: Boolean
    },
    emits: ['update:modelValue', 'guncelle'],
    setup(props, { emit }) {
        const form = ref(null)
        const duzenleForm = ref(null)
        const formValid = ref(false)
        const duzenleFormValid = ref(false)

        const kategoriler = ref([])
        const eklemeYukleniyor = ref(false)
        const guncellemeYukleniyor = ref(false)
        const silmeYukleniyor = ref(false)

        const duzenleDialog = ref(false)
        const silmeDialog = ref(false)

        const silinecekKategori = ref(null)

        // Form data
        const yeniKategori = reactive({
            ad: '',
            aciklama: '',
            renk: '#2196F3',
            ikon: 'mdi-package-variant',
            siraNo: null,
            aktif: true
        })

        const duzenlenecekKategori = reactive({
            id: null,
            ad: '',
            aciklama: '',
            renk: '#2196F3',
            ikon: 'mdi-package-variant',
            siraNo: null,
            aktif: true
        })

        // Snackbar
        const snackbar = reactive({
            show: false,
            text: '',
            color: 'success'
        })

        // Validation rules
        const rules = {
            required: value => !!value || 'Bu alan zorunludur'
        }

        // Renk seçenekleri
        const renkSecenekleri = [
            { title: 'Mavi', value: '#2196F3' },
            { title: 'Kırmızı', value: '#F44336' },
            { title: 'Yeşil', value: '#4CAF50' },
            { title: 'Turuncu', value: '#FF9800' },
            { title: 'Mor', value: '#9C27B0' },
            { title: 'Pembe', value: '#E91E63' },
            { title: 'Kahverengi', value: '#795548' },
            { title: 'Gri', value: '#607D8B' },
            { title: 'İndigo', value: '#3F51B5' },
            { title: 'Teal', value: '#009688' }
        ]

        // İkon seçenekleri
        const ikonSecenekleri = [
            { title: 'Paket', value: 'mdi-package-variant' },
            { title: 'Kurabiye', value: 'mdi-cookie' },
            { title: 'Kek', value: 'mdi-cake' },
            { title: 'Börek', value: 'mdi-food-croissant' },
            { title: 'Tatlı', value: 'mdi-candy' },
            { title: 'Ekmek', value: 'mdi-bread-slice' },
            { title: 'Pizza', value: 'mdi-pizza' },
            { title: 'Hamburger', value: 'mdi-hamburger' },
            { title: 'İçecek', value: 'mdi-cup' },
            { title: 'Dondurma', value: 'mdi-ice-cream' },
            { title: 'Meyve', value: 'mdi-fruit-grapes' },
            { title: 'Sebze', value: 'mdi-carrot' },
            { title: 'Et', value: 'mdi-food-steak' },
            { title: 'Balık', value: 'mdi-fish' },
            { title: 'Süt', value: 'mdi-bottle-soda' },
            { title: 'Yumurta', value: 'mdi-egg' }
        ]

        // Methods
        const snackbarGoster = (text, color = 'success') => {
            snackbar.text = text
            snackbar.color = color
            snackbar.show = true
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

        const formSifirla = () => {
            yeniKategori.ad = ''
            yeniKategori.aciklama = ''
            yeniKategori.renk = '#2196F3'
            yeniKategori.ikon = 'mdi-package-variant'
            yeniKategori.siraNo = null
            yeniKategori.aktif = true
        }

        const kategoriEkle = async () => {
            if (!formValid.value) return

            eklemeYukleniyor.value = true
            try {
                const response = await fetch(`${API_BASE_URL}/kategoriler`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(yeniKategori)
                })

                if (response.ok) {
                    snackbarGoster('Kategori başarıyla eklendi')
                    formSifirla()
                    kategorileriYukle()
                    emit('guncelle')
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Kategori eklenirken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Kategori ekleme hatası:', error)
                snackbarGoster('Kategori eklenirken hata oluştu', 'error')
            } finally {
                eklemeYukleniyor.value = false
            }
        }

        const kategoriDuzenle = (kategori) => {
            duzenlenecekKategori.id = kategori.id
            duzenlenecekKategori.ad = kategori.ad
            duzenlenecekKategori.aciklama = kategori.aciklama || ''
            duzenlenecekKategori.renk = kategori.renk
            duzenlenecekKategori.ikon = kategori.ikon
            duzenlenecekKategori.siraNo = kategori.siraNo
            duzenlenecekKategori.aktif = kategori.aktif
            duzenleDialog.value = true
        }

        const kategoriGuncelle = async () => {
            if (!duzenleFormValid.value) return

            guncellemeYukleniyor.value = true
            try {
                const { id, ...updateData } = duzenlenecekKategori

                const response = await fetch(`${API_BASE_URL}/kategoriler?id=${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                })

                if (response.ok) {
                    snackbarGoster('Kategori başarıyla güncellendi')
                    duzenleDialog.value = false
                    kategorileriYukle()
                    emit('guncelle')
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Kategori güncellenirken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Kategori güncelleme hatası:', error)
                snackbarGoster('Kategori güncellenirken hata oluştu', 'error')
            } finally {
                guncellemeYukleniyor.value = false
            }
        }

        const kategoriSil = (kategori) => {
            silinecekKategori.value = kategori
            silmeDialog.value = true
        }

        const kategoriSilOnayla = async () => {
            silmeYukleniyor.value = true
            try {
                const response = await fetch(`${API_BASE_URL}/kategoriler?id=${silinecekKategori.value.id}`, {
                    method: 'DELETE'
                })

                if (response.ok) {
                    snackbarGoster('Kategori başarıyla silindi')
                    silmeDialog.value = false
                    kategorileriYukle()
                    emit('guncelle')
                } else {
                    const error = await response.json()
                    snackbarGoster(error.error || 'Kategori silinirken hata oluştu', 'error')
                }
            } catch (error) {
                console.error('Kategori silme hatası:', error)
                snackbarGoster('Kategori silinirken hata oluştu', 'error')
            } finally {
                silmeYukleniyor.value = false
            }
        }

        // Watchers
        watch(() => props.modelValue, (newVal) => {
            if (newVal) {
                kategorileriYukle()
            }
        })

        return {
            form,
            duzenleForm,
            formValid,
            duzenleFormValid,
            kategoriler,
            eklemeYukleniyor,
            guncellemeYukleniyor,
            silmeYukleniyor,
            duzenleDialog,
            silmeDialog,
            yeniKategori,
            duzenlenecekKategori,
            silinecekKategori,
            snackbar,
            rules,
            renkSecenekleri,
            ikonSecenekleri,
            kategoriEkle,
            kategoriDuzenle,
            kategoriGuncelle,
            kategoriSil,
            kategoriSilOnayla
        }
    }
}
</script>