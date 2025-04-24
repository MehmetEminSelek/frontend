<template>
  <v-container>
    <v-card elevation="2" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold">💰 Fiyat Yönetimi</v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedUrun"
              :items="urunler"
              item-title="name"
              item-value="id"
              label="Ürün Seç"
              dense
            />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="newFiyat" type="number" label="Fiyat (₺)" dense />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="newBaslangic" type="date" label="Başlangıç" dense />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="newBitis" type="date" label="Bitiş" dense />
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-end">
            <v-btn color="primary" @click="ekleFiyat">Ekle</v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-data-table
          :headers="headers"
          :items="fiyatlar"
          item-value="id"
          class="elevation-1"
          :loading="loading"
          no-data-text="Fiyat verisi bulunamadı"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const urunler = ref([])
const fiyatlar = ref([])
const loading = ref(false)

const selectedUrun = ref(null)
const newFiyat = ref(null)
const newBaslangic = ref('')
const newBitis = ref('')

const headers = [
  { title: 'Ürün', key: 'urun.name' },
  { title: 'Fiyat (₺)', key: 'fiyat' },
  { title: 'Başlangıç', key: 'baslangic' },
  { title: 'Bitiş', key: 'bitis' }
]

onMounted(async () => {
  await fetchUrunler()
  await fetchFiyatlar()
})

async function fetchUrunler() {
  const { data } = await axios.get('/api/urunler')
  urunler.value = data
}

async function fetchFiyatlar() {
  loading.value = true
  const { data } = await axios.get('/api/fiyatlar')
  fiyatlar.value = data
  loading.value = false
}

async function ekleFiyat() {
  if (!selectedUrun.value || !newFiyat.value || !newBaslangic.value || !newBitis.value) {
    alert('Tüm alanlar doldurulmalı')
    return
  }

  await axios.post('/api/fiyatlar', {
    urunId: selectedUrun.value,
    fiyat: newFiyat.value,
    baslangic: newBaslangic.value,
    bitis: newBitis.value
  })

  await fetchFiyatlar()
  newFiyat.value = null
  newBaslangic.value = ''
  newBitis.value = ''
}
</script>

<style scoped>
.v-data-table {
  font-size: 0.9rem;
}
</style>
