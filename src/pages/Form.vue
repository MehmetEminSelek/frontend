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

          <!-- Order Input Section -->
          <v-row class="mb-4" dense>
            <v-col cols="12" md="3">
              <v-select v-model="newOrderItem.urun" :items="dropdowns.urunler" label="Ürün" />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field v-model.number="newOrderItem.miktar" label="Miktar (kg)" type="number" />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field v-model.number="newOrderItem.kiloFiyat" label="Kilo Fiyatı (₺)" type="number" />
            </v-col>
            <v-col cols="6" md="2">
              <v-select v-model="newOrderItem.discountType" :items="['%', '₺']" label="İndirim Türü" />
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field v-model.number="newOrderItem.discountValue" label="İndirim" type="number" />
            </v-col>
            <v-col cols="12" md="1" class="d-flex align-end">
              <v-btn color="primary" @click="addOrderItem">Ekle</v-btn>
            </v-col>
          </v-row>

          <!-- Orders Table -->
          <v-table dense>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th>Miktar (kg)</th>
                <th>Kilo Fiyatı</th>
                <th>Toplam</th>
                <th>İndirimli Fiyat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in orderItems" :key="i">
                <td>{{ item.urun }}</td>
                <td>{{ item.miktar }}</td>
                <td>{{ item.kiloFiyat.toFixed(2) }} ₺</td>
                <td>{{ (item.miktar * item.kiloFiyat).toFixed(2) }} ₺</td>
                <td>{{ discountedRowPrice(item).toFixed(2) }} ₺</td>
                <td>
                  <v-btn icon color="error" @click="removeOrderItem(i)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- Order Summary + Total Discount -->
          <v-row class="mt-4" dense>
            <v-col cols="12" md="4">
              <v-select v-model="globalDiscountType" :items="['%', '₺']" label="Toplam İndirim Türü" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model.number="globalDiscountValue" label="Toplam İndirim" type="number" />
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <div class="text-h6">Ara Toplam: {{ subtotal.toFixed(2) }} ₺</div>
              <div class="text-h6">Toplam İndirimli: {{ totalAfterGlobalDiscount.toFixed(2) }} ₺</div>
            </v-col>
          </v-row>

          <!-- Submit -->
          <v-col cols="12" class="text-end mt-6">
            <v-btn color="success" @click="submitForm">Kaydet</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted,watch } from 'vue'
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
  urunler: []
})

const dropdowns = reactive({
  teslimatTurleri: [],
  subeler: [],
  aliciTipleri: [],
  ambalajlar: [],
  kutular: [],
  urunler: []
})

const orderInputs = {
  urunler: ['Baklava', 'Künefe', 'Lokum']
}

const orderItems = ref([])

const newOrderItem = ref({
  urun: '',
  miktar: 0,
  kiloFiyat: 0,
  discountType: '%',
  discountValue: 0
})

function addOrderItem() {
  if (newOrderItem.value.urun && newOrderItem.value.miktar && newOrderItem.value.kiloFiyat) {
    orderItems.value.push({ ...newOrderItem.value })
    newOrderItem.value = {
      urun: '',
      miktar: 0,
      kiloFiyat: 0,
      discountType: '%',
      discountValue: 0
    }
  }
}

function removeOrderItem(index) {
  orderItems.value.splice(index, 1)
}

function discountedRowPrice(item) {
  const total = item.miktar * item.kiloFiyat
  if (item.discountType === '%') {
    return total - (total * item.discountValue) / 100
  } else {
    return total - item.discountValue
  }
}

const subtotal = computed(() =>
  orderItems.value.reduce((acc, item) => acc + (item.miktar * item.kiloFiyat), 0)
)

const globalDiscountType = ref('%')
const globalDiscountValue = ref(0)

const totalAfterGlobalDiscount = computed(() => {
  let total = orderItems.value.reduce((acc, item) => acc + discountedRowPrice(item), 0)
  if (globalDiscountType.value === '%') {
    total -= (total * globalDiscountValue.value) / 100
  } else {
    total -= globalDiscountValue.value
  }
  return total
})

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/dropdown')
    console.log('response:', data)
    console.log('data field:', data.data)
    if (data && typeof data === 'object') {
      Object.assign(dropdowns, data)
    } else {
      console.warn('Dropdown API boş döndü:', data)
    }
  } catch (err) {
    console.error('❌ Dropdown API hatası:', err)
  }
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


async function submitForm() {
  const isValid = await formRef.value.validate()
  if (!isValid || orderItems.value.length === 0) {
    alert('Form hatalı veya ürün girilmedi.')
    return
  }

  // Order item'ları form.urunler'e yaz
  form.urunler = orderItems.value.map(item => ({
    urun: item.urun,
    miktar: item.miktar,
    kiloFiyat: item.kiloFiyat,
    toplam: item.miktar * item.kiloFiyat,
    indirimTipi: item.discountType,
    indirimDegeri: item.discountValue,
    indirimliFiyat: discountedRowPrice(item)
  }))

  const serializedUrunler = form.urunler.map(row => {
    if (row.icerik && row.icerik.urunler) {
      return {
        ambalaj: row.ambalaj,
        icerik: {
          tepsiId: row.icerik.tepsiId,
          urunler: row.icerik.urunler.map(u => ({ urunId: u.id, kilo: u.kilo }))
        }
      }
    } else {
      return {
        ambalaj: row.ambalaj,
        urunId: row.urunId,
        kilo: row.kilo
      }
    }
  })

  try {
    const payload = {
      tarih: form.tarih,
      gonderenAdi: form.gonderenAdi,
      gonderenTel: form.gonderenTel,
      aliciAdi: form.aliciAdi,
      aliciTel: form.aliciTel,
      adres: form.adres,
      aciklama: form.aciklama,
      urunler: serializedUrunler
    }

    const { data } = await axios.post('/api/siparis', payload)
    console.log('✅ Sipariş kaydedildi:', data)
    alert('Sipariş başarıyla kaydedildi!')
  } catch (err) {
    console.error('❌ Sipariş gönderilemedi:', err)
    alert('Sipariş gönderilirken hata oluştu.')
  }



    // Merge orderItems into form.urunler for submission
    form.urunler = orderItems.value.map(item => ({
      urun: item.urun,
      miktar: item.miktar,
      kiloFiyat: item.kiloFiyat,
      toplam: item.miktar * item.kiloFiyat,
      indirimTipi: item.discountType,
      indirimDegeri: item.discountValue,
      indirimliFiyat: discountedRowPrice(item)
    }))

    console.log('Form verisi:', form)
    alert('Form başarıyla kaydedildi!')
  }
watch([() => newOrderItem.value.urun, () => form.tarih], async () => {
  const urun = newOrderItem.value.urun
  const tarih = form.tarih

  if (!urun || !tarih) return

  try {
    const { data } = await axios.get('/api/prices', {
      params: { product: urun, date: tarih }
    })
    newOrderItem.value.kiloFiyat = data.price
  } catch (err) {
    console.error('Fiyat alınamadı:', err)
    newOrderItem.value.kiloFiyat = 0
  }
})
</script>
