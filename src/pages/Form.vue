<template>
  <v-container class="py-6 px-4" max-width="xl">
    <v-card class="pa-6" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4">📋 Sipariş Formu</v-card-title>
      <v-form ref="formRef" v-model="valid">
        <v-row dense>
          <!-- Tarih + Gün -->
          <v-col cols="12" md="6">
            <v-text-field v-model="form.tarih" label="Sipariş Tarihi" type="date" required @change="onDateChange" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.fullTarih" label="Gün" readonly placeholder="dd-mm-yy — Gün" />
          </v-col>

          <!-- Teslimat Türü + Şube -->
          <v-col cols="12" md="6">
            <v-select v-model="form.teslimatTuru" :items="dropdowns.teslimatTurleri" label="Teslimat Türü"
              @change="handleTeslimatChange" required />
          </v-col>
          <v-col cols="12" md="6" v-if="showSube">
            <v-select v-model="form.sube" :items="dropdowns.subeler" label="Şube" required />
          </v-col>

          <!-- Gönderen Tipi -->
          <v-col cols="12">
            <v-select v-model="form.gonderenTipi" :items="dropdowns.aliciTipleri" label="Gönderen Tipi"
              @change="handleGonderenChange" />
          </v-col>

          <!-- Gönderen Bilgileri -->
          <v-col cols="12" md="6">
            <v-text-field v-model="form.gonderenAdi" label="Gönderen Adı" :rules="[v => !!v || 'Zorunlu']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.gonderenTel" label="Gönderen Tel" maxlength="11"
              :rules="[v => /^\d{11}$/.test(v) || '11 haneli sayı girin']" />
          </v-col>

          <!-- Alıcı Bilgileri -->
          <template v-if="showAliciFields">
            <v-col cols="12" md="6">
              <v-text-field v-model="form.aliciAdi" label="Alıcı Adı" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.aliciTel" label="Alıcı Tel" maxlength="11"
                :rules="[v => !v || /^\d{11}$/.test(v) || '11 haneli sayı']" />
            </v-col>
          </template>

          <!-- Adres + Açıklama -->
          <v-col cols="12">
            <v-textarea v-model="form.adres" label="Adres" :disabled="!adresEnabled" rows="2" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.aciklama" label="Açıklama" rows="2" />
          </v-col>

          <!-- Ürün Listesi -->
          <v-col cols="12">
            <h3 class="text-lg font-bold mt-4">🛒 Ürünler</h3>
          </v-col>

          <template v-for="(row, index) in form.urunler" :key="index">
            <v-col cols="12" md="2">
              <v-select v-model="row.ambalaj" :items="dropdowns.ambalajlar" label="Ambalaj"
                @change="handleAmbalajChange(row)" />
            </v-col>
            <v-col cols="12" md="2" v-if="row.ambalaj === 'Tepsi'">
              <v-text-field v-model="row.tepsi" label="Tepsi" />
            </v-col>
            <v-col cols="12" md="2" v-if="row.ambalaj === 'Kutu'">
              <v-select v-model="row.kutu" :items="dropdowns.kutular" label="Kutu" />
            </v-col>
            <v-col cols="12" md="3">
              <v-select v-model="row.urun" :items="dropdowns.urunler" label="Ürün"
                :rules="[v => !!v || 'Ürün gerekli']" />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field v-model="row.gramaj" label="Gramaj" :rules="[v => /^\d+$/.test(v) || 'Sadece sayı']" />
            </v-col>
            <v-col cols="12" md="1" class="d-flex align-center">
              <v-btn icon @click="removeRow(index)" color="error">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </template>

          <v-col cols="12">
            <v-btn color="primary" @click="addRow">+ Ürün Satırı Ekle</v-btn>
          </v-col>

          <v-col cols="12" class="text-end mt-6">
            <v-btn color="success" @click="submitForm">Kaydet</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

const valid = ref(true)
const formRef = ref(null)

const form = reactive({
  tarih: '',
  fullTarih: '',
  teslimatTuru: '',
  sube: '',
  gonderenTipi: '',
  gonderenAdi: '',
  gonderenTel: '',
  aliciAdi: '',
  aliciTel: '',
  adres: '',
  aciklama: '',
  urunler: [
    { ambalaj: '', tepsi: '', kutu: '', urun: '', gramaj: '' }
  ]
})

const dropdowns = reactive({
  teslimatTurleri: [],
  subeler: [],
  aliciTipleri: [],
  ambalajlar: [],
  kutular: [],
  urunler: []
})

onMounted(async () => {
  const res = await axios.get('/api/dropdown') // NOT the full http://localhost:3000 version

  Object.assign(dropdowns, res.data)
})

const showSube = computed(() => form.teslimatTuru === 'Şubeden Teslim')
const showAliciFields = computed(() => form.gonderenTipi === 'Gönderen ve Alıcı')
const adresEnabled = computed(() =>
  ['Evine Gönderilecek', 'Mtn', 'Otobüs', 'Yurtiçi Kargo'].includes(form.teslimatTuru)
)

function onDateChange() {
  const date = new Date(form.tarih)
  const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  const gun = gunler[date.getDay()]
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(-2)
  form.fullTarih = `${dd}-${mm}-${yy} — ${gun}`
}

function handleTeslimatChange() {
  form.sube = ''
}

function handleGonderenChange() {
  form.aliciAdi = ''
  form.aliciTel = ''
}

function handleAmbalajChange(row) {
  row.tepsi = ''
  row.kutu = ''
}

function addRow() {
  form.urunler.push({ ambalaj: '', tepsi: '', kutu: '', urun: '', gramaj: '' })
}

function removeRow(index) {
  if (form.urunler.length > 1) {
    form.urunler.splice(index, 1)
  }
}

function submitForm() {
  formRef.value.validate().then(success => {
    if (!success || form.urunler.length === 0) {
      alert('Form hatalı veya ürün satırı eksik.')
      return
    }
    console.log('Form verisi:', form)
    alert('Form başarıyla kaydedildi!')
  })
}
</script>
