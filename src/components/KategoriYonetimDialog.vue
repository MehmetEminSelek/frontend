<template>
    <v-dialog v-model="dialog" max-width="800px">
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span class="text-h5">Kategori Yönetimi</span>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="yeniKategoriDialog = true">
                    Yeni Kategori
                </v-btn>
            </v-card-title>

            <v-card-text>
                <v-data-table :headers="headers" :items="kategoriler" :loading="loading">
                    <template v-slot:item.renk="{ item }">
                        <v-chip :color="item.renk" size="small"></v-chip>
                    </template>
                    <template v-slot:item.ikon="{ item }">
                        <v-icon>{{ item.ikon }}</v-icon>
                    </template>
                    <template v-slot:item.islemler="{ item }">
                        <v-btn-group variant="text" density="compact">
                            <v-btn icon="mdi-pencil" size="small" @click="kategoriDuzenle(item)" color="warning" />
                            <v-btn icon="mdi-delete" size="small" @click="kategoriSil(item)" color="error" />
                        </v-btn-group>
                    </template>
                </v-data-table>
            </v-card-text>

            <!-- Yeni Kategori Dialog -->
            <v-dialog v-model="yeniKategoriDialog" max-width="500px">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">{{ duzenleIndex > -1 ? 'Kategori Düzenle' : 'Yeni Kategori' }}</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="kategoriData.ad" label="Kategori Adı"
                                        required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="kategoriData.ikon" label="İkon (mdi-*)"
                                        required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-color-picker v-model="kategoriData.renk" mode="hex" hide-inputs></v-color-picker>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error" variant="text" @click="yeniKategoriDialog = false">
                            İptal
                        </v-btn>
                        <v-btn color="primary" variant="text" @click="kategoriKaydet" :loading="kaydetYukleniyor">
                            Kaydet
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    modelValue: Boolean,
    kategoriler: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue', 'guncelle'])

const dialog = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const kaydetYukleniyor = ref(false)
const yeniKategoriDialog = ref(false)
const duzenleIndex = ref(-1)

const headers = [
    { title: 'Kategori Adı', key: 'ad' },
    { title: 'İkon', key: 'ikon' },
    { title: 'Renk', key: 'renk' },
    { title: 'İşlemler', key: 'islemler', sortable: false }
]

const kategoriData = ref({
    ad: '',
    ikon: 'mdi-folder',
    renk: '#1976D2'
})

const kategoriDuzenle = (item) => {
    duzenleIndex.value = props.kategoriler.indexOf(item)
    kategoriData.value = { ...item }
    yeniKategoriDialog.value = true
}

const kategoriSil = async (item) => {
    if (confirm(`${item.ad} kategorisini silmek istediğinizden emin misiniz?`)) {
        try {
            await fetch(`/api/kategoriler/${item.id}`, {
                method: 'DELETE'
            })
            emit('guncelle')
        } catch (error) {
            console.error('Kategori silme hatası:', error)
        }
    }
}

const kategoriKaydet = async () => {
    kaydetYukleniyor.value = true
    try {
        const method = duzenleIndex.value > -1 ? 'PUT' : 'POST'
        const url = duzenleIndex.value > -1
            ? `/api/kategoriler/${props.kategoriler[duzenleIndex.value].id}`
            : '/api/kategoriler'

        await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(kategoriData.value)
        })

        yeniKategoriDialog.value = false
        emit('guncelle')
    } catch (error) {
        console.error('Kategori kaydetme hatası:', error)
    } finally {
        kaydetYukleniyor.value = false
    }
}
</script>