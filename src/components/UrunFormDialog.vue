<template>
    <v-dialog v-model="dialog" max-width="800px">
        <v-card>
            <v-card-title>
                <span class="text-h5">{{ isEdit ? 'Ürün Düzenle' : 'Yeni Ürün' }}</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="urunData.ad" label="Ürün Adı" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="urunData.kodu" label="Ürün Kodu" required></v-text-field>
                        </v-col>
                        <!-- Kategori alanını kaldırıldı -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="urunData.fiyat" label="Fiyat" type="number" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="urunData.stok" label="Stok" type="number" required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="urunData.birim" label="Birim" required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea v-model="urunData.aciklama" label="Açıklama" rows="3"></v-textarea>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-switch v-model="urunData.aktif" label="Aktif" color="success"></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-switch v-model="urunData.ozelUrun" label="Özel Ürün" color="purple"></v-switch>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="text" @click="closeDialog">
                    İptal
                </v-btn>
                <v-btn color="primary" variant="text" @click="saveProduct" :loading="loading">
                    Kaydet
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    // kategoriler kaldırıldı
    urun: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['update:modelValue', 'kaydet'])

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.urun)

const loading = ref(false)

const urunData = ref({
    ad: '',
    kodu: '',
    kategoriId: null,
    fiyat: 0,
    stok: 0,
    birim: 'Adet',
    aciklama: '',
    aktif: true,
    ozelUrun: false
})

watch(() => props.urun, (newUrun) => {
    if (newUrun) {
        urunData.value = { ...newUrun }
    } else {
        urunData.value = {
            ad: '',
            kodu: '',
            kategoriId: null,
            fiyat: 0,
            stok: 0,
            birim: 'Adet',
            aciklama: '',
            aktif: true,
            ozelUrun: false
        }
    }
}, { immediate: true })

const closeDialog = () => {
    dialog.value = false
}

const saveProduct = async () => {
    loading.value = true
    try {
        await emit('kaydet', { ...urunData.value })
        closeDialog()
    } finally {
        loading.value = false
    }
}
</script>