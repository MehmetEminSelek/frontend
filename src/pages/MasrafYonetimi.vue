<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <h1 class="text-h5 font-weight-bold">Masraf Yönetimi</h1>
        <div class="text-grey-600">Tüm giderleri (personel, kira, vb.) görüntüleyin ve yeni masraf/fatura oluşturun</div>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn color="primary" class="mr-2" @click="dialogMasraf = true" prepend-icon="mdi-cash-minus">Masraf Ekle</v-btn>
        <v-btn color="indigo" class="mr-2" @click="olusturTopluMaas" prepend-icon="mdi-cash">Ayın Maaşlarını Oluştur</v-btn>
        <v-btn color="success" @click="dialogFatura = true" prepend-icon="mdi-receipt">Fatura Oluştur</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card class="pa-4" color="blue-lighten-5"><div class="text-caption">Toplam</div><div class="text-h6">{{ formatTL(toplam) }}</div></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" color="indigo-lighten-5"><div class="text-caption">Maaş Toplamı</div><div class="text-h6">{{ formatTL(toplamMaas) }}</div></v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" color="orange-lighten-5"><div class="text-caption">Kira Toplamı</div><div class="text-h6">{{ formatTL(toplamKira) }}</div></v-card>
      </v-col>
    </v-row>

    <v-card class="mb-4 pa-4">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.start" type="date" label="Başlangıç" density="compact" />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="filters.end" type="date" label="Bitiş" density="compact" />
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filters.kategoriId" :items="kategoriOptions" item-title="ad" item-value="id" label="Kategori" clearable density="compact" />
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn color="primary" @click="fetchMasraflar" :loading="loading" block>Listele</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <span>Masraflar</span>
        <span class="text-h6">Toplam: {{ formatTL(toplam) }} • Maaş: {{ formatTL(toplamMaas) }} • Kira: {{ formatTL(toplamKira) }}</span>
      </v-card-title>
      <v-data-table :headers="headers" :items="masraflar" :loading="loading" class="elevation-0">
        <template #item.tarih="{ item }">{{ formatDate(item.tarih) }}</template>
        <template #item.tutar="{ item }"><span class="font-weight-medium">{{ formatTL(item.tutar) }}</span></template>
        <template #item.tur="{ item }">
          <v-chip :color="item.maasMi ? 'indigo' : (item.kiraMi ? 'orange' : 'grey')" size="small" variant="tonal">
            {{ item.maasMi ? 'Maaş' : (item.kiraMi ? 'Kira' : 'Diğer') }}
          </v-chip>
        </template>
        <template #item.personel="{ item }">{{ item.personel?.ad || '-' }}</template>
        <template #item.actions="{ item }">
          <v-btn icon size="small" color="primary" variant="text" @click="edit(item)"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon size="small" color="error" variant="text" @click="sil(item)"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Masraf Dialog -->
    <v-dialog v-model="dialogMasraf" max-width="520">
      <v-card>
        <v-card-title>Masraf</v-card-title>
        <v-card-text>
          <v-select v-model="form.kategoriId" :items="kategoriOptions" item-title="ad" item-value="id" label="Kategori" required />
          <v-text-field v-model.number="form.tutar" type="number" label="Tutar" required />
          <v-text-field v-model="form.tarih" type="date" label="Tarih" />
          <v-textarea v-model="form.aciklama" label="Açıklama" />
          <v-switch v-model="form.kiraMi" label="Kira" inset />
          <v-switch v-model="form.maasMi" label="Maaş" inset />
          <v-autocomplete v-model="form.personelId" :items="personelOptions" item-title="ad" item-value="id" label="Personel (Maaş için)" clearable />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogMasraf = false">İptal</v-btn>
          <v-btn color="primary" @click="kaydetMasraf" :loading="saving">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Fatura Dialog -->
    <v-dialog v-model="dialogFatura" max-width="520">
      <v-card>
        <v-card-title>Masraf Faturası</v-card-title>
        <v-card-text>
          <v-text-field v-model="fatura.faturaNo" label="Fatura No" required />
          <v-text-field v-model="fatura.tarih" type="date" label="Tarih" />
          <v-text-field v-model.number="fatura.toplamTutar" type="number" label="Toplam Tutar" required />
          <v-textarea v-model="fatura.aciklama" label="Açıklama" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogFatura = false">İptal</v-btn>
          <v-btn color="success" @click="olusturFatura" :loading="saving">Oluştur</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { apiCall } from '@/utils/api'

const loading = ref(false)
const saving = ref(false)
const masraflar = ref([])
const toplam = ref(0)
const toplamMaas = ref(0)
const toplamKira = ref(0)
const kategoriOptions = ref([])
const personelOptions = ref([])

const filters = reactive({ start: '', end: '', kategoriId: null })
const form = reactive({ id: null, kategoriId: null, tutar: null, tarih: '', aciklama: '', kiraMi: false, maasMi: false })
const fatura = reactive({ faturaNo: '', tarih: '', toplamTutar: null, aciklama: '' })

const dialogMasraf = ref(false)
const dialogFatura = ref(false)
const snackbar = reactive({ show: false, text: '', color: 'success' })

const headers = [
  { title: 'Tarih', key: 'tarih' },
  { title: 'Tür', key: 'tur' },
  { title: 'Kategori', key: 'kategori.ad' },
  { title: 'Personel', key: 'personel' },
  { title: 'Açıklama', key: 'aciklama' },
  { title: 'Tutar', key: 'tutar', align: 'end' },
  { title: 'İşlemler', key: 'actions', align: 'center', sortable: false },
]

function formatDate(d){ try { return new Date(d).toLocaleDateString('tr-TR') } catch { return '-' } }
function formatTL(v){ return new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY' }).format(Number(v||0)) }

async function fetchKategoriler(){
  const res = await apiCall('/expenses/categories', { method: 'GET' })
  kategoriOptions.value = res.items || []
}

async function fetchPersoneller(){
  try {
    const res = await apiCall('/personel', { method: 'GET' })
    personelOptions.value = res.items || []
  } catch { personelOptions.value = [] }
}

async function fetchMasraflar(){
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.start) params.append('start', filters.start)
    if (filters.end) params.append('end', filters.end)
    if (filters.kategoriId) params.append('kategoriId', filters.kategoriId)
    params.append('includePayroll', 'true')
    const res = await apiCall(`/expenses?${params.toString()}`, { method: 'GET' })
    masraflar.value = res.items || []
    toplam.value = res.toplam || 0
    toplamMaas.value = masraflar.value.filter(m => m.maasMi).reduce((a,b)=>a+(b.tutar||0),0)
    toplamKira.value = masraflar.value.filter(m => m.kiraMi).reduce((a,b)=>a+(b.tutar||0),0)
  } finally {
    loading.value = false
  }
}

function edit(item){
  Object.assign(form, { id: item.id, kategoriId: item.kategoriId, tutar: item.tutar, tarih: item.tarih?.slice(0,10) || '', aciklama: item.aciklama || '', kiraMi: item.kiraMi, maasMi: item.maasMi })
  dialogMasraf.value = true
}

async function sil(item){
  await apiCall('/expenses', { id: item.id }, 'DELETE')
  show('Masraf silindi')
  fetchMasraflar()
}

async function kaydetMasraf(){
  saving.value = true
  try {
    const payload = { kategoriId: form.kategoriId, tutar: form.tutar, tarih: form.tarih || undefined, aciklama: form.aciklama, kiraMi: form.kiraMi, maasMi: form.maasMi }
    if (form.id) await apiCall('/expenses', { id: form.id, ...payload }, 'PUT')
    else await apiCall('/expenses', payload, 'POST')
    show('Masraf kaydedildi')
    dialogMasraf.value = false
    Object.assign(form, { id:null, kategoriId:null, tutar:null, tarih:'', aciklama:'', kiraMi:false, maasMi:false })
    fetchMasraflar()
  } finally { saving.value = false }
}

async function olusturFatura(){
  saving.value = true
  try {
    await apiCall('/expenses/invoices', { ...fatura }, 'POST')
    show('Fatura oluşturuldu')
    dialogFatura.value = false
    Object.assign(fatura, { faturaNo:'', tarih:'', toplamTutar:null, aciklama:'' })
  } finally { saving.value = false }
}

async function olusturTopluMaas(){
  saving.value = true
  try {
    await apiCall('/expenses/payroll', { start: filters.start, end: filters.end }, 'POST')
    show('Maaşlar oluşturuldu')
    await fetchMasraflar()
  } catch (e) {
    show(e?.response?.data?.error || 'Maaşlar oluşturulamadı', 'error')
  } finally { saving.value = false }
}

function show(text, color='success'){ snackbar.text = text; snackbar.color = color; snackbar.show = true }

onMounted(async () => {
  await Promise.all([fetchKategoriler(), fetchPersoneller()])
  await fetchMasraflar()
})
</script>

<style scoped>
</style>

