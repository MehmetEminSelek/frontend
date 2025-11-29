<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-0 border"
        style="background: #F5F7FA; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.05;">
          <v-icon size="120" color="error">mdi-cash-register</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="6">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="error">mdi-cash-register</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1 text-primary">Masraf Yönetimi</h1>
                <p class="text-h6 mb-0 text-secondary">Tüm giderleri görüntüleyin ve yeni masraf/fatura oluşturun</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="error" variant="tonal" size="small" class="mr-2">
                <v-icon start size="16">mdi-cash-minus</v-icon>
                Gider Takibi
              </v-chip>
              <v-chip color="success" variant="tonal" size="small">
                <v-icon start size="16">mdi-receipt-text-outline</v-icon>
                Fatura Yönetimi
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <!-- Hızlı İşlemler Bölümü -->
            <v-card class="pa-4 rounded-lg" elevation="0" style="background: rgba(255,255,255,0.7); backdrop-filter: blur(10px);">
              <div class="text-subtitle-2 text-grey-darken-1 mb-3 d-flex align-center">
                <v-icon size="18" class="mr-2">mdi-lightning-bolt</v-icon>
                Hızlı İşlemler
              </div>
              <div class="d-flex flex-wrap gap-2">
                <!-- Ana İşlemler -->
                <v-btn color="primary" variant="flat" class="rounded-lg flex-grow-1" @click="dialogMasraf = true" prepend-icon="mdi-plus-circle-outline">
                  Masraf Ekle
                </v-btn>
                <v-btn color="success" variant="outlined" class="rounded-lg flex-grow-1" @click="dialogFatura = true" prepend-icon="mdi-receipt-text-outline">
                  Fatura Oluştur
                </v-btn>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="d-flex flex-wrap gap-2">
                <!-- Araçlar -->
                <v-btn color="indigo" variant="tonal" size="small" class="rounded-lg" @click="olusturTopluMaas" prepend-icon="mdi-account-cash-outline">
                  Ayın Maaşları
                </v-btn>
                <v-btn color="purple" variant="tonal" size="small" class="rounded-lg" @click="dialogFaturaPdf = true" prepend-icon="mdi-file-pdf-box">
                  PDF Yükle
                </v-btn>
                <v-btn color="grey-darken-1" variant="tonal" size="small" class="rounded-lg" @click="openKategoriYonetimi" prepend-icon="mdi-folder-cog-outline">
                  Kategoriler
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- İstatistik Kartları -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl border" elevation="0">
          <div class="d-flex align-center">
            <v-avatar color="error" variant="tonal" size="48" class="mr-3">
              <v-icon size="28" color="error">mdi-cash-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-error">{{ formatTL(toplam) }}</div>
              <div class="text-subtitle-2 text-grey">Toplam</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl border" elevation="0">
          <div class="d-flex align-center">
            <v-avatar color="indigo" variant="tonal" size="48" class="mr-3">
              <v-icon size="28" color="indigo">mdi-account-cash-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-indigo">{{ formatTL(toplamMaas) }}</div>
              <div class="text-subtitle-2 text-grey">Maaş Toplamı</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl border" elevation="0">
          <div class="d-flex align-center">
            <v-avatar color="warning" variant="tonal" size="48" class="mr-3">
              <v-icon size="28" color="warning">mdi-home-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-warning">{{ formatTL(toplamKira) }}</div>
              <div class="text-subtitle-2 text-grey">Kira Toplamı</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4 rounded-xl border d-flex align-center justify-center" elevation="0">
          <v-switch v-model="filters.includePayroll" inset label="Maaşları dahil et" color="indigo" hide-details />
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mb-4 rounded-xl border" elevation="0">
      <v-card-title class="pa-4 bg-grey-lighten-4">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="36" class="mr-3">
            <v-icon size="20">mdi-filter-outline</v-icon>
          </v-avatar>
          <span class="text-body-1 font-weight-medium">Filtrele & Listele</span>
        </div>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.start" type="date" label="Başlangıç" density="compact" variant="outlined" color="primary" hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field v-model="filters.end" type="date" label="Bitiş" density="compact" variant="outlined" color="primary" hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select v-model="filters.kategoriId" :items="kategoriOptions" item-title="ad" item-value="id" label="Kategori" clearable density="compact" variant="outlined" color="primary" hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select v-model="filters.subeId" :items="subeOptions" item-title="ad" item-value="id" label="Şube" clearable density="compact" variant="outlined" color="primary" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="primary" variant="flat" @click="fetchMasraflar" :loading="loading" block class="rounded-lg" size="large" prepend-icon="mdi-magnify">
              Listele
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="rounded-xl border" elevation="0">
      <v-card-title class="pa-4 bg-error text-white">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
              <v-icon color="white">mdi-table</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Masraf Listesi</h3>
              <p class="text-body-2 opacity-80 ma-0">Toplam: {{ formatTL(toplam) }}</p>
            </div>
          </div>
          <v-btn icon="mdi-refresh" variant="flat" color="rgba(255,255,255,0.2)" @click="fetchMasraflar" title="Yenile"></v-btn>
        </div>
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
          <v-btn icon size="small" color="primary" variant="text" @click="edit(item)"><v-icon>mdi-pencil-outline</v-icon></v-btn>
          <v-btn icon size="small" color="error" variant="text" @click="sil(item)"><v-icon>mdi-delete-outline</v-icon></v-btn>
        </template>
      </v-data-table>
      <div class="d-flex justify-end align-center px-4 pb-4">
        <v-pagination v-model="pagination.page" :length="pagination.totalPages" total-visible="7" @update:modelValue="fetchMasraflar" />
        <v-select class="ml-4" :items="pageSizes" v-model="pagination.pageSize" label="Sayfa" density="compact" style="max-width:120px" @update:modelValue="onPageSizeChange" />
      </div>
    </v-card>

    <!-- Masraf Dialog -->
    <v-dialog v-model="dialogMasraf" max-width="720">
      <v-card>
        <v-card-title>Masraf</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="kaydetMasraf">
            <v-row dense>
              <v-col cols="12" md="7">
                <v-select v-model="form.kategoriId" :items="kategoriOptions" item-title="ad" item-value="id" label="Kategori" :rules="[rules.required]" density="comfortable" hide-details="auto" clearable />
              </v-col>
              <v-col cols="12" md="5">
                <v-text-field v-model.number="form.tutar" type="number" label="Tutar" :rules="[rules.required, rules.positive]" prefix="₺" step="0.01" min="0" density="comfortable" hide-details="auto" />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="form.tarih" type="date" label="Tarih" density="comfortable" hide-details="auto" />
              </v-col>
              <v-col cols="12" md="6">
                <v-file-input v-model="belgeFile" label="Belge (opsiyonel)" prepend-icon="mdi-paperclip" accept="image/*,.pdf" @change="onBelgeSelected" density="comfortable" variant="outlined" show-size hide-details="auto" />
                <div v-if="form.belgeUrl" class="mt-2">
                  <a :href="fileUrl(form.belgeUrl)" target="_blank">Yüklü belgeyi aç</a>
                </div>
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="form.aciklama" label="Açıklama" auto-grow rows="2" density="comfortable" />
              </v-col>

              <v-col cols="12" md="3">
                <v-switch v-model="form.kiraMi" label="Kira" color="orange" density="compact" hide-details="auto" class="switch-compact mr-6" />
              </v-col>
              <v-col cols="12" md="3">
                <v-switch v-model="form.maasMi" label="Maaş" color="indigo" density="compact" hide-details="auto" class="switch-compact" />
              </v-col>
              <v-col cols="12" md="6" v-if="form.maasMi">
                <v-autocomplete v-model="form.personelId" :items="personelOptions" item-title="ad" item-value="id" label="Personel (Maaş için)" :rules="[rules.requiredIfMaas]" clearable density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.subeId" :items="subeOptions" item-title="ad" item-value="id" label="Şube" clearable density="comfortable" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogMasraf = false">İptal</v-btn>
          <v-btn color="primary" :disabled="!isFormValid || saving" @click="kaydetMasraf" :loading="saving">Kaydet</v-btn>
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

    <!-- Kategori Yönetimi Dialog -->
    <v-dialog v-model="dialogKategoriler" max-width="640">
      <v-card>
        <v-card-title>Kategori Yönetimi</v-card-title>
        <v-card-text>
          <v-row class="mb-3" dense>
            <v-col cols="12" md="8">
              <v-text-field v-model="yeniKategoriAd" label="Yeni kategori adı" density="comfortable" />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-end">
              <v-btn color="primary" block @click="ekleKategori" :disabled="!yeniKategoriAd">Ekle</v-btn>
            </v-col>
          </v-row>
          <v-list density="compact" lines="one">
            <v-list-item v-for="k in kategoriYonetimItems" :key="k.id">
              <template #prepend>
                <v-icon icon="mdi-folder" class="mr-2" />
              </template>
              <v-text-field v-model="k.ad" hide-details density="comfortable" />
              <template #append>
                <v-btn size="small" variant="text" color="primary" icon="mdi-content-save" @click="guncelleKategori(k)" />
                <v-btn size="small" variant="text" color="error" icon="mdi-delete" @click="silKategori(k)" />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogKategoriler = false">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PDF Fatura Yükle Dialog -->
    <v-dialog v-model="dialogFaturaPdf" max-width="520">
      <v-card>
        <v-card-title>PDF Fatura Yükle</v-card-title>
        <v-card-text>
          <v-file-input v-model="pdfFile" accept="application/pdf" label="PDF Dosyası" prepend-icon="mdi-file-pdf-box" />
          <v-select v-model="kategoriOverride" :items="kategoriOptions" item-title="ad" item-value="ad" label="Kategori (opsiyonel, tahmini geçersiz kıl)" clearable />
          <v-select v-model="pdfSubeId" :items="subeOptions" item-title="ad" item-value="id" label="Şube (opsiyonel)" clearable />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogFaturaPdf = false">İptal</v-btn>
          <v-btn color="purple" :loading="saving" :disabled="!pdfFile" @click="yuklePdfFatura">Yükle</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { apiCall } from '@/utils/api'

const loading = ref(false)
const saving = ref(false)
const masraflar = ref([])
const toplam = ref(0)
const toplamMaas = ref(0)
const toplamKira = ref(0)
const kategoriOptions = ref([])
const subeOptions = ref([])
const personelOptions = ref([])

const filters = reactive({ start: '', end: '', kategoriId: null, subeId: null, includePayroll: true })
const form = reactive({ id: null, kategoriId: null, tutar: null, tarih: '', aciklama: '', kiraMi: false, maasMi: false, belgeUrl: '', personelId: null, subeId: null })
const fatura = reactive({ faturaNo: '', tarih: '', toplamTutar: null, aciklama: '' })

const belgeFile = ref(null)

const dialogMasraf = ref(false)
const dialogFatura = ref(false)
const dialogKategoriler = ref(false)
const yeniKategoriAd = ref('')
const kategoriYonetimItems = ref([])
const dialogFaturaPdf = ref(false)
const pdfFile = ref(null)
const kategoriOverride = ref(null)
const pdfSubeId = ref(null)
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

const pagination = reactive({ page: 1, pageSize: 50, totalCount: 0, totalPages: 1 })
const pageSizes = [25, 50, 100, 200]

function onPageSizeChange(){ pagination.page = 1; fetchMasraflar() }

function formatDate(d){ try { return new Date(d).toLocaleDateString('tr-TR') } catch { return '-' } }
function formatTL(v){ return new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY' }).format(Number(v||0)) }
function fileUrl(u){
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  const noApi = base.replace(/\/api$/, '')
  if (u.startsWith('/')) return `${noApi}${u}`
  return `${noApi}/${u}`
}

const rules = {
  required: v => !!v || 'Zorunlu alan',
  positive: v => (v !== null && v !== '' && Number(v) > 0) || 'Pozitif sayı girin',
  requiredIfMaas: v => (form.maasMi ? (!!v || 'Personel seçin') : true)
}

const isFormValid = computed(() => {
  if (!form.kategoriId) return false
  if (!(form.tutar !== null && form.tutar !== '' && Number(form.tutar) > 0)) return false
  if (form.maasMi && !form.personelId) return false
  return true
})

// Sync toggles with selected category and vice versa to avoid ambiguity
watch(() => form.kategoriId, (newId) => {
  const cat = (kategoriOptions.value || []).find(k => k.id === newId)
  const name = (cat?.ad || '').toString().toLowerCase()
  // Kira category implies kiraMi
  if (name === 'kira') form.kiraMi = true
  else if (form.kiraMi) form.kiraMi = false
  // Personel/Maaş category implies maasMi
  if (/^(personel|maaş|maas)$/.test(name)) {
    form.maasMi = true
  } else if (form.maasMi) {
    form.maasMi = false
    form.personelId = null
  }
})

watch(() => form.kiraMi, (val) => {
  if (!val) return
  const kiraCat = (kategoriOptions.value || []).find(k => (k.ad || '').toString().toLowerCase() === 'kira')
  if (kiraCat && form.kategoriId !== kiraCat.id) form.kategoriId = kiraCat.id
})

watch(() => form.maasMi, (val) => {
  if (!val) { form.personelId = null; return }
  const personelCat = (kategoriOptions.value || []).find(k => /^(personel|maaş|maas)$/i.test(k.ad || ''))
  if (personelCat && form.kategoriId !== personelCat.id) form.kategoriId = personelCat.id
})

async function fetchKategoriler(){
  const res = await apiCall('/expenses/categories', { method: 'GET' })
  kategoriOptions.value = res.items || []
}
async function fetchSubeler(){
  try {
    const res = await apiCall('/subeler', { method: 'GET' })
    subeOptions.value = res || []
  } catch { subeOptions.value = [] }
}
function openKategoriYonetimi(){
  dialogKategoriler.value = true
  kategoriYonetimItems.value = (kategoriOptions.value || []).map(k => ({ ...k }))
}
async function ekleKategori(){
  if (!yeniKategoriAd.value) return
  const res = await apiCall('/expenses/categories', { ad: yeniKategoriAd.value }, 'POST')
  yeniKategoriAd.value = ''
  await fetchKategoriler()
  kategoriYonetimItems.value = (kategoriOptions.value || []).map(k => ({ ...k }))
  show('Kategori eklendi')
}
async function guncelleKategori(k){
  await apiCall('/expenses/categories', { id: k.id, ad: k.ad }, 'PUT')
  await fetchKategoriler()
  show('Kategori güncellendi')
}
async function silKategori(k){
  await apiCall('/expenses/categories', { id: k.id }, 'DELETE')
  await fetchKategoriler()
  kategoriYonetimItems.value = (kategoriOptions.value || []).map(x => ({ ...x }))
  show('Kategori silindi')
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
    if (filters.subeId) params.append('subeId', filters.subeId)
    params.append('includePayroll', String(!!filters.includePayroll))
    params.append('page', String(pagination.page))
    params.append('pageSize', String(pagination.pageSize))
    const res = await apiCall(`/expenses?${params.toString()}`, { method: 'GET' })
    masraflar.value = res.items || []
    toplam.value = res.toplam || 0
    toplamMaas.value = res.toplamMaas ?? (masraflar.value.filter(m => m.maasMi).reduce((a,b)=>a+(b.tutar||0),0))
    toplamKira.value = res.toplamKira ?? (masraflar.value.filter(m => m.kiraMi).reduce((a,b)=>a+(b.tutar||0),0))
    pagination.totalCount = res.totalCount || (res.items?.length || 0)
    pagination.totalPages = Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize))
  } finally {
    loading.value = false
  }
}

function edit(item){
  Object.assign(form, { id: item.id, kategoriId: item.kategoriId, tutar: item.tutar, tarih: item.tarih?.slice(0,10) || '', aciklama: item.aciklama || '', kiraMi: item.kiraMi, maasMi: item.maasMi, belgeUrl: item.belgeUrl || '', personelId: item.personelId || null, subeId: item.subeId || null })
  dialogMasraf.value = true
}

async function sil(item){
  await apiCall('/expenses', { id: item.id }, 'DELETE')
  show('Masraf silindi')
  fetchMasraflar()
}

async function uploadBelgeIfNeeded(){
  if (!belgeFile.value) return null
  const fd = new FormData()
  fd.append('file', belgeFile.value)
  const res = await apiCall('/expenses/upload', { method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } })
  return res.url || null
}

async function kaydetMasraf(){
  saving.value = true
  try {
    let belgeUrl = form.belgeUrl
    if (belgeFile.value) {
      belgeUrl = await uploadBelgeIfNeeded()
    }
    if (!form.maasMi) { form.personelId = null }
    const payload = { kategoriId: form.kategoriId, tutar: form.tutar, tarih: form.tarih || undefined, aciklama: form.aciklama, kiraMi: form.kiraMi, maasMi: form.maasMi, belgeUrl, personelId: form.personelId || undefined, subeId: form.subeId || undefined }
    if (form.id) await apiCall('/expenses', { id: form.id, ...payload }, 'PUT')
    else await apiCall('/expenses', payload, 'POST')
    show('Masraf kaydedildi')
    dialogMasraf.value = false
    Object.assign(form, { id:null, kategoriId:null, tutar:null, tarih:'', aciklama:'', kiraMi:false, maasMi:false, belgeUrl:'', personelId: null, subeId: null })
    belgeFile.value = null
    await fetchMasraflar()
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

function onBelgeSelected(e){
  const f = Array.isArray(e) ? e[0] : (e?.target?.files?.[0] || e)
  belgeFile.value = f || null
}

async function yuklePdfFatura(){
  if (!pdfFile.value) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('file', pdfFile.value)
    if (kategoriOverride.value) fd.append('kategoriAd', kategoriOverride.value)
    if (pdfSubeId.value) fd.append('subeId', String(pdfSubeId.value))
    await apiCall('/expenses/invoices-import', { method: 'POST', data: fd, headers: { 'Content-Type': 'multipart/form-data' } })
    show('PDF fatura içe aktarıldı')
    dialogFaturaPdf.value = false
    pdfFile.value = null
    kategoriOverride.value = null
    pdfSubeId.value = null
    await fetchMasraflar()
  } catch (e) {
    show(e?.response?.data?.error || 'PDF fatura içe aktarılamadı', 'error')
  } finally {
    saving.value = false
  }
}

function show(text, color='success'){ snackbar.text = text; snackbar.color = color; snackbar.show = true }

onMounted(async () => {
  await Promise.all([fetchKategoriler(), fetchPersoneller(), fetchSubeler()])
  await fetchMasraflar()
})
</script>

<style scoped>
.hero-section {
  position: relative;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(244,67,54,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn {
  text-transform: none;
}

/* Compact switch visual fix for consistent sizing/alignment across browsers */
.switch-compact :deep(.v-selection-control) { min-height: 28px; }
.switch-compact :deep(.v-switch) { --v-switch-track-size: 32px; }
.switch-compact :deep(.v-switch .v-switch__track) {
  height: 18px;
  width: 32px;
}
.switch-compact :deep(.v-switch .v-switch__thumb) {
  height: 14px;
  width: 14px;
}
.switch-compact { align-items: center; }
</style>

