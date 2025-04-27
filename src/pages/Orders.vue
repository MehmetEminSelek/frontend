<template>
    <v-container class="py-6 px-4">
        <v-card elevation="2" class="pa-6">
            <v-card-title class="text-h5 font-weight-bold">📦 Sipariş Detayı</v-card-title>

            <v-card-text v-if="siparis">
                <v-row dense>
                    <v-col cols="12" md="6">
                        <strong>Tarih:</strong> {{ formatDate(siparis.tarih) }}
                    </v-col>
                    <v-col cols="12" md="6">
                        <strong>Gönderen:</strong> {{ siparis.gonderenAdi }} ({{ siparis.gonderenTel }})
                    </v-col>
                    <v-col cols="12" md="6" v-if="siparis.aliciAdi">
                        <strong>Alıcı:</strong> {{ siparis.aliciAdi }} ({{ siparis.aliciTel }})
                    </v-col>
                    <v-col cols="12">
                        <strong>Adres:</strong> {{ siparis.adres }}<br />
                        <strong>Açıklama:</strong> {{ siparis.aciklama }}
                    </v-col>
                </v-row>

                <v-divider class="my-4" />

                <h3 class="text-subtitle-1 font-weight-bold mb-2">🧾 Ürünler</h3>
                <v-list>
                    <v-list-item v-for="(u, i) in siparis.urunler" :key="i">
                        <v-list-item-content>
                            <v-list-item-title class="font-weight-bold">
                                {{ u.ambalaj }}
                            </v-list-item-title>
                            <v-list-item-subtitle v-if="u.icerik">
                                <div v-for="item in u.icerik.urunler" :key="item.urunId">
                                    • Ürün ID: {{ item.urunId }} — {{ item.kilo }} g
                                </div>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle v-else>
                                Ürün ID: {{ u.urunId }} — {{ u.kilo }} g
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>

            <v-card-text v-else class="text-center">
                <v-progress-circular indeterminate color="primary" />
                <p>Yükleniyor...</p>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const siparis = ref(null)

onMounted(async () => {
    const id = route.params.id
    const { data } = await axios.get(`/api/siparis/${id}`)
    siparis.value = data
})

function formatDate(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR')
}
</script>