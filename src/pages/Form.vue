<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-4" 
        style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%); color: #1B5E20; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
          <v-icon size="120">mdi-clipboard-check</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="#2E7D32">mdi-clipboard-text-outline</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1" style="color: #1B5E20;">Sipariş Formu</h1>
                <p class="text-h6 mb-0" style="color: #2E7D32; opacity: 0.8;">Yeni sipariş oluşturma ve paket yönetimi</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="rgba(27, 94, 32, 0.15)" size="small" class="mr-2" style="color: #1B5E20;">
                <v-icon start size="16" color="#2E7D32">mdi-speedometer</v-icon>
                Hızlı İşlem
              </v-chip>
              <v-chip color="rgba(27, 94, 32, 0.15)" size="small" style="color: #1B5E20;">
                <v-icon start size="16" color="#2E7D32">mdi-package-variant</v-icon>
                Paket Yönetimi
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-btn size="x-large" color="white" variant="elevated" @click="() => {}" class="font-weight-bold" 
              style="color: #2E7D32 !important; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);">
              <v-icon left size="20">mdi-plus-circle</v-icon>
              Hızlı Sipariş
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Form Card -->
    <v-card class="rounded-xl" elevation="2" style="border: 1px solid #E8F5E9;">
      <v-card-title class="pa-4" style="background: linear-gradient(135deg, #A5D6A7 0%, #81C784 100%); color: white;">
        <div class="d-flex align-center">
          <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
            <v-icon color="white">mdi-form-select</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold">Sipariş Bilgileri</h3>
            <p class="text-body-2 opacity-80 ma-0">Müşteri ve teslimat detayları</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="valid">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.tarih" label="Sipariş Tarihi" type="date" :rules="[rules.required]"
                @change="onDateChange" variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.fullTarih" label="Gün" readonly placeholder="Tarih seçiniz..." 
                variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.teslimatTuruId" :items="dropdowns.teslimatTurleri" item-title="ad" item-value="id"
                label="Teslimat Türü" :rules="[rules.required]" @update:modelValue="handleTeslimatChange" 
                variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6" v-if="showSube">
              <v-select v-model="form.subeId" :items="dropdowns.subeler" item-title="ad" item-value="id" label="Şube"
                :rules="[rules.required]" variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" v-if="selectedTeslimatTuru?.ad === 'Şubeden Şubeye'">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select v-model="form.subeNeredenId" :items="dropdowns.subeler" item-title="ad" item-value="id"
                    label="Nereden Şube" :rules="[rules.required]" variant="outlined" color="#388E3C" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="form.subeNereyeId" :items="dropdowns.subeler" item-title="ad" item-value="id"
                    label="Nereye Şube" :rules="[rules.required]" variant="outlined" color="#388E3C" />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-select v-model="form.gonderenTipiId" :items="dropdowns.aliciTipleri" item-title="ad" item-value="id"
                label="Gönderen Tipi" @update:modelValue="handleGonderenChange" variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.gonderenAdi" label="Gönderen Adı" :rules="[rules.required]" 
                variant="outlined" color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.gonderenTel" label="Gönderen Tel" maxlength="11" :rules="[rules.phone]"
                placeholder="5xxxxxxxxx" variant="outlined" color="#388E3C" />
            </v-col>
            <template v-if="showAliciFields">
              <v-col cols="12" md="6">
                <v-autocomplete v-model="selectedCari" :items="dropdowns.cariler" item-title="ad" item-value="id"
                  label="Alıcı Adı" :search-input.sync="aliciSearch" :filter="customCariFilter" clearable hide-no-data
                  @update:modelValue="onCariSelected" @blur="onCariBlur" variant="outlined" color="#388E3C" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field ref="aliciTelRef" :key="selectedCari" :value="form.aliciTel"
                  @update:modelValue="onAliciTelInput" label="Alıcı Tel" maxlength="11" :rules="[rules.optionalPhone]"
                  persistent-placeholder variant="outlined" color="#388E3C" placeholder="5xxxxxxxxx" />
              </v-col>
            </template>
            <v-col cols="12">
              <template v-if="cariAdresler.length > 1">
                <div class="adresler-row-group">
                  <v-row dense>
                    <v-col v-for="(adres, i) in cariAdresler" :key="i" cols="12" md="6" lg="4">
                      <v-card :elevation="selectedAdres === adres.adres ? 8 : 2"
                        :class="['adres-row-card', { 'adres-row-selected': selectedAdres === adres.adres }]"
                        @click="selectAdres(adres.adres)" 
                        :style="selectedAdres === adres.adres ? 'border: 2px solid #388E3C; background: #E8F5E9;' : 'border: 1px solid #E0E0E0;'">
                        <div class="d-flex align-center justify-space-between pa-3">
                          <div>
                            <div class="font-weight-bold" style="color: #2E7D32;">{{ adres.tip }}</div>
                            <div class="text-body-2" style="color: #4CAF50;">{{ adres.adres }}</div>
                          </div>
                          <v-radio :model-value="selectedAdres" :value="adres.adres" color="#388E3C" />
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </template>
              <template v-else-if="cariAdresler.length === 1">
                <v-textarea :key="selectedAdres" :value="form.adres" @input="val => form.adres = val" label="Adres"
                  :disabled="!adresEnabled" rows="2" variant="outlined" color="#388E3C" />
              </template>
              <template v-else>
                <v-textarea :key="selectedAdres" :value="form.adres" @input="val => form.adres = val" label="Adres"
                  :disabled="!adresEnabled" rows="2" variant="outlined" color="#388E3C" />
              </template>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.aciklama" label="Açıklama" rows="2" variant="outlined" color="#388E3C" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Package Selection Section -->
    <v-card class="mt-6 rounded-xl" elevation="2" style="border: 1px solid #FFF3E0;">
      <v-card-title class="pa-4" style="background: linear-gradient(135deg, #FFB74D 0%, #FF9800 100%); color: white;">
        <div class="d-flex align-center">
          <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
            <v-icon color="white">mdi-package-variant</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold">Paket Yönetimi</h3>
            <p class="text-body-2 opacity-80 ma-0">Ambalaj türlerini seçin ve içeriklerini düzenleyin</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row>
          <v-col v-for="ambalaj in dropdowns.ambalajlar" :key="ambalaj.id" cols="6" md="3">
            <v-card class="package-card pa-4 text-center" elevation="2" @click="openPackageDialog(ambalaj)"
              style="cursor: pointer; border: 1px solid #FFE0B2; transition: all 0.3s ease; border-radius: 12px;"
              :style="selectedAmbalajId === ambalaj.id ? 'background: #FFF3E0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);' : 'background: white;'">
              <v-icon size="48" :color="selectedAmbalajId === ambalaj.id ? '#E65100' : '#FF9800'" class="mb-3">
                {{ getAmbalajIcon(ambalaj.ad) }}
              </v-icon>
              <h4 class="text-h6 font-weight-bold mb-2" :style="{ color: selectedAmbalajId === ambalaj.id ? '#E65100' : '#FF9800' }">
                {{ ambalaj.ad }}
              </h4>
              <p class="text-body-2" style="color: #757575;">Paketi düzenlemek için tıklayın</p>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Added Packages -->
    <v-card v-if="orderPackages.length > 0" class="mt-6 rounded-xl" elevation="2" style="border: 1px solid #F3E5F5;">
      <v-card-title class="pa-4" style="background: linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%); color: white;">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
              <v-icon color="white">mdi-clipboard-list</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-bold">Eklenen Paketler</h3>
              <p class="text-body-2 opacity-80 ma-0">Sipariş özeti ve detayları</p>
            </div>
          </div>
          <v-chip color="rgba(255,255,255,0.2)" size="small">
            {{ orderPackages.length }} paket
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row dense>
          <v-col v-for="(pkg, index) in orderPackages" :key="index" cols="12" md="6" lg="4">
            <v-card class="package-summary-card h-100" elevation="1" style="border: 1px solid #E1BEE7; border-radius: 12px;">
              <v-card-title class="d-flex justify-space-between text-body-1 font-weight-medium pa-3"
                style="background: #F3E5F5; color: #4A148C; border-radius: 12px 12px 0 0;">
                <span>{{ pkg.ambalajAdi }} {{ pkg.specificPackageName ? `(${pkg.specificPackageName})` : '' }}</span>
                <v-btn icon="mdi-delete" color="#7B1FA2" size="x-small" variant="text"
                  @click="removeOrderPackage(index)"></v-btn>
              </v-card-title>
              <v-divider></v-divider>
              <v-list density="compact" lines="one" class="pa-0">
                <v-list-item v-for="(item, itemIndex) in pkg.urunler" :key="itemIndex" :title="item.urunAdi"
                  class="px-3">
                  <template v-slot:prepend>
                    <v-icon size="x-small" class="mr-2" color="#7B1FA2">{{ getUrunIcon(item.urunAdi) }}</v-icon>
                  </template>
                  <template v-slot:append>
                    <span class="text-body-2 font-weight-bold" style="color: #4A148C;">{{ item.miktar }} {{ item.birim }}</span>
                  </template>
                </v-list-item>
                <v-list-item v-if="!pkg.urunler || pkg.urunler.length === 0">
                  <v-list-item-title class="text-caption" style="color: #9E9E9E;">Paket boş.</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Submit Section -->
    <div class="text-center mt-8">
      <v-btn size="x-large" @click="submitForm" :disabled="orderPackages.length === 0" 
        prepend-icon="mdi-check-circle-outline" class="font-weight-bold px-8"
        style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); color: white; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">
        Siparişi Kaydet
      </v-btn>
    </div>

    <v-dialog v-model="isPackageDialogOpen" persistent max-width="700px" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="bg-primary">
          <span class="text-h6">{{ currentPackage.ambalajAdi }} İçeriği</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container>
            <v-row dense>
              <v-col cols="12" v-if="currentPackage.ambalajAdi === 'Kutu'">
                <v-select v-model="currentPackage.kutuId" :items="dropdowns.kutular" item-title="ad" item-value="id"
                  label="Spesifik Kutu Tipi Seçin" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" v-if="currentPackage.ambalajAdi === 'Tepsi/Tava'">
                <v-select v-model="currentPackage.tepsiTavaId" :items="dropdowns.tepsiTavalar" item-title="ad"
                  item-value="id" label="Spesifik Tepsi/Tava Tipi Seçin" :rules="[rules.required]" />
              </v-col>

              <v-col cols="12" sm="5">
                <v-select v-model="newItemInPackage.urunId" :items="dropdowns.urunler" item-title="ad" item-value="id"
                  label="Ürün" hide-details />
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field v-model.number="newItemInPackage.miktar" label="Miktar" type="number" min="0"
                  hide-details />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select v-model="newItemInPackage.birim" :items="['Gram', 'Adet']" label="Birim" hide-details />
              </v-col>
              <v-col cols="12" sm="1" class="d-flex align-center justify-center">
                <v-btn color="primary" @click="addItemToCurrentPackage"
                  :disabled="!newItemInPackage.urunId || !newItemInPackage.miktar || !newItemInPackage.birim"
                  title="Ürünü Pakete Ekle" size="small" icon>
                  <v-icon>mdi-plus-box-outline</v-icon>
                </v-btn>
              </v-col>

              <v-col cols="12" v-if="currentPackage.urunler.length > 0" class="mt-3">
                <v-divider class="mb-3"></v-divider>
                <h4 class="text-caption text-uppercase text-grey mb-1">Eklenen Ürünler</h4>
                <v-list lines="one" density="compact" class="pa-0">
                  <v-list-item v-for="(item, index) in currentPackage.urunler" :key="index" class="px-1">
                    <v-list-item-title class="text-body-2">
                      <v-icon size="x-small" class="mr-1">{{ getUrunIcon(item.urunAdi) }}</v-icon>
                      {{ item.urunAdi }}
                    </v-list-item-title>
                    <template v-slot:append>
                      <div class="d-flex align-center">
                        <span class="text-body-2 mr-2">{{ item.miktar }} {{ item.birim }}</span>
                        <v-btn icon="mdi-delete-outline" color="error" variant="text" size="x-small"
                          @click="removeItemFromCurrentPackage(index)"></v-btn>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>

            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="cancelPackageDialog">
            İptal
          </v-btn>
          <v-btn color="primary" @click="savePackage"
            :disabled="currentPackage.urunler.length === 0 || !isSpecificPackageSelected()"
            prepend-icon="mdi-content-save-outline">
            Paketi Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="successDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Sipariş Kaydedildi</v-card-title>
        <v-card-text>Sipariş başarıyla kaydedildi!</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="closeSuccessDialog">Tamam</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, provide, nextTick } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';

// Sipariş modülüne özel tema ile Vuetify instance'ı oluştur
const siparisVuetify = createCustomVuetify({ themeName: 'siparisTheme' });
provide('vuetify', siparisVuetify);

const valid = ref(true);
const formRef = ref(null);
const form = reactive({
  tarih: '',
  fullTarih: '',
  teslimatTuruId: null,
  subeId: null,
  gonderenTipiId: null,
  gonderenAdi: '',
  gonderenTel: '',
  aliciAdi: '',
  aliciTel: '',
  adres: '',
  aciklama: '',
  subeNeredenId: null,
  subeNereyeId: null,
});

const rules = {
  required: value => !!value || 'Bu alan zorunludur.',
  phone: value => /^\d{11}$/.test(value) || 'Telefon numarası 11 haneli sayı olmalıdır.',
  optionalPhone: value => !value || /^\d{11}$/.test(value) || 'Telefon numarası 11 haneli sayı olmalıdır.',
};

const dropdowns = reactive({
  teslimatTurleri: [],
  subeler: [],
  aliciTipleri: [],
  ambalajlar: [],
  urunler: [],
  kutular: [],
  tepsiTavalar: [],
  cariler: [],
});

const orderPackages = ref([]);
const isPackageDialogOpen = ref(false);
const selectedAmbalajId = ref(null);

const currentPackage = reactive({
  ambalajId: null,
  ambalajAdi: '',
  kutuId: null,
  tepsiTavaId: null,
  urunler: []
});

const newItemInPackage = ref({
  urunId: null,
  urunAdi: '',
  miktar: null,
  birim: 'Gram'
});

const selectedCari = ref(null);
const aliciSearch = ref('');
const cariAdresler = ref([]);
const selectedAdres = ref('');
const aliciTelRef = ref(null);
const successDialog = ref(false);

onMounted(async () => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dropdown`);
    console.log('Dropdown Response:', data);
    if (data && typeof data === 'object') {
      Object.assign(dropdowns, data);
      console.log('Dropdowns populated:', dropdowns);
    } else {
      console.warn('Dropdown API boş veya beklenmeyen formatta döndü:', data);
    }
  } catch (err) {
    console.error('❌ Dropdown API hatası:', err.response?.data || err.message || err);
  }
});

const selectedTeslimatTuru = computed(() => dropdowns.teslimatTurleri.find(t => t.id === form.teslimatTuruId));
const showSube = computed(() => selectedTeslimatTuru.value?.ad === 'Şubeden Teslim');

const selectedGonderenTipi = computed(() => dropdowns.aliciTipleri.find(t => t.id === form.gonderenTipiId));
const showAliciFields = computed(() => selectedGonderenTipi.value?.ad === 'Gönderen ve Alıcı');

const adresEnabled = computed(() => {
  const teslimatAdi = selectedTeslimatTuru.value?.ad;
  return ['Evine Gönderilecek', 'Mtn', 'Otobüs', 'Yurtiçi Kargo'].includes(teslimatAdi);
});

function onDateChange() {
  if (!form.tarih) {
    form.fullTarih = '';
    return;
  }
  try {
    const date = new Date(form.tarih);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const gun = gunler[utcDate.getUTCDay()];
    const dd = String(utcDate.getUTCDate()).padStart(2, '0');
    const mm = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
    const Pierce = utcDate.getUTCFullYear();
    form.fullTarih = `${dd}-${mm}-${Pierce} — ${gun}`;
  } catch (e) {
    console.error("Tarih formatlama hatası:", e);
    form.fullTarih = 'Geçersiz Tarih';
  }
}

function handleTeslimatChange() { form.subeId = null; }
function handleGonderenChange() {
  if (selectedGonderenTipi.value?.ad !== 'Gönderen ve Alıcı') {
    form.aliciAdi = '';
    form.aliciTel = '';
  }
}

function openPackageDialog(ambalaj) {
  if (!ambalaj) return;
  currentPackage.ambalajId = ambalaj.id;
  currentPackage.ambalajAdi = ambalaj.ad;
  currentPackage.kutuId = null;
  currentPackage.tepsiTavaId = null;
  currentPackage.urunler = [];
  newItemInPackage.value = { urunId: null, urunAdi: '', miktar: null, birim: 'Gram' };
  isPackageDialogOpen.value = true;
}

function addItemToCurrentPackage() {
  const selectedUrun = dropdowns.urunler.find(u => u.id === newItemInPackage.value.urunId);
  if (selectedUrun && newItemInPackage.value.miktar > 0 && newItemInPackage.value.birim) {
    currentPackage.urunler.push({
      urunId: selectedUrun.id,
      urunAdi: selectedUrun.ad,
      miktar: newItemInPackage.value.miktar,
      birim: newItemInPackage.value.birim
    });
    newItemInPackage.value = { urunId: null, urunAdi: '', miktar: null, birim: 'Gram' };
  } else {
    showSnackbar('Lütfen ürün, miktar ve birim seçiniz.', 'warning');
  }
}

function removeItemFromCurrentPackage(index) { currentPackage.urunler.splice(index, 1); }
function cancelPackageDialog() { isPackageDialogOpen.value = false; }
function isSpecificPackageSelected() {
  if (currentPackage.ambalajAdi === 'Kutu') return !!currentPackage.kutuId;
  if (currentPackage.ambalajAdi === 'Tepsi/Tava') return !!currentPackage.tepsiTavaId;
  return true;
}

function savePackage() {
  if (currentPackage.urunler.length === 0) {
    showSnackbar('Pakete en az bir ürün eklemelisiniz.', 'warning');
    return;
  }
  if (!isSpecificPackageSelected()) {
    showSnackbar('Lütfen spesifik Kutu veya Tepsi/Tava tipini seçiniz.', 'warning');
    return;
  }
  let specificName = '';
  if (currentPackage.kutuId) { specificName = dropdowns.kutular.find(k => k.id === currentPackage.kutuId)?.ad || ''; }
  else if (currentPackage.tepsiTavaId) { specificName = dropdowns.tepsiTavalar.find(t => t.id === currentPackage.tepsiTavaId)?.ad || ''; }
  const packageToAdd = JSON.parse(JSON.stringify(currentPackage));
  packageToAdd.specificPackageName = specificName;
  orderPackages.value.push(packageToAdd);
  isPackageDialogOpen.value = false;
  showSnackbar('Sipariş başarıyla kaydedildi!', 'success');
}

function removeOrderPackage(index) { orderPackages.value.splice(index, 1); }
function getAmbalajIcon(ambalajAdi) {
  if (ambalajAdi === 'Kutu') return 'mdi-package-variant-closed';
  if (ambalajAdi === 'Tepsi/Tava') return 'mdi-silverware-fork-knife';
  if (ambalajAdi === 'Özel') return 'mdi-star-outline';
  return 'mdi-help-box-outline';
}

function getUrunIcon(urunAdi) {
  if (!urunAdi) return 'mdi-help-circle-outline';
  if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone';
  if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie';
  if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles';
  return 'mdi-food-variant';
}

function customCariFilter(item, queryText, itemText) {
  const text = itemText.toLocaleLowerCase('tr-TR');
  const query = queryText.toLocaleLowerCase('tr-TR');
  return text.includes(query);
}

function onCariSelected(cariId) {
  const cari = dropdowns.cariler.find(c => c.id === cariId);
  if (cari) {
    form.aliciAdi = cari.ad;
    form.aliciTel = cari.telefon || '';
    // Adresleri ata
    if (cari.adresler && cari.adresler.length > 0) {
      cariAdresler.value = cari.adresler.map(a => ({
        adres: a.adres,
        tip: a.tip,
        adresGosterim: a.tip ? `${a.tip}: ${a.adres}` : a.adres
      }));
      selectedAdres.value = cariAdresler.value[0].adres;
      form.adres = cariAdresler.value[0].adres;
    } else {
      cariAdresler.value = [];
      selectedAdres.value = '';
      form.adres = '';
    }
    nextTick(() => {
      if (aliciTelRef.value) {
        aliciTelRef.value.focus();
        aliciTelRef.value.blur();
      }
    });
  }
}

function onAdresSelected(adres) {
  form.adres = adres;
}

async function onCariBlur() {
  // Eğer yazılan isim mevcut carilerde yoksa yeni müşteri oluştur
  const girilenAd = aliciSearch.value?.trim();
  if (!girilenAd) return;
  const mevcutCari = dropdowns.cariler.find(c => c.ad.toLocaleLowerCase('tr-TR') === girilenAd.toLocaleLowerCase('tr-TR'));
  if (!mevcutCari) {
    // Yeni müşteri oluştur
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cari`, { ad: girilenAd });
      if (data && data.id) {
        dropdowns.cariler.push(data);
        selectedCari.value = data.id;
        form.aliciAdi = data.ad;
        form.aliciTel = data.telefon || '';
        cariAdresler.value = data.adresler?.map(a => ({
          adres: a.adres,
          tip: a.tip,
          adresGosterim: a.tip ? `${a.tip}: ${a.adres}` : a.adres
        })) || [];
        if (cariAdresler.value.length > 0) {
          selectedAdres.value = cariAdresler.value[0].adres;
          form.adres = cariAdresler.value[0].adres;
        } else {
          selectedAdres.value = '';
          form.adres = '';
        }
        showSnackbar('Yeni müşteri oluşturuldu ve seçildi.', 'success');
      }
    } catch (err) {
      showSnackbar('Yeni müşteri oluşturulamadı: ' + (err.response?.data?.message || err.message), 'error');
    }
  }
}

function onAliciTelInput(val) {
  // Eğer değer boşsa, eski numarayı geri yaz
  if (!val) {
    // Hiçbir şey yapma veya eski değeri geri yaz
    form.aliciTel = form.aliciTel || '';
    return;
  }
  // Sadece rakam ise güncelle
  if (/^\d{0,11}$/.test(val)) {
    form.aliciTel = val;
  }
}

async function submitForm() {
  const { valid: formIsValid } = await formRef.value.validate();
  if (!formIsValid || orderPackages.value.length === 0) {
    showSnackbar('Lütfen formdaki tüm zorunlu alanları doldurun ve en az bir paket ekleyin.', 'warning');
    return;
  }
  const aliciGondericiAdi = form.aliciAdi ? form.aliciAdi : form.gonderenAdi;
  // Her paketteki her ürünü düzleştir
  const siparisPayload = orderPackages.value.flatMap(pkg =>
    pkg.urunler.map(item => ({
      ambalajId: pkg.ambalajId,
      urunId: item.urunId,
      miktar: item.miktar,
      birim: item.birim,
      kutuId: pkg.kutuId || null,
      tepsiTavaId: pkg.tepsiTavaId || null
    }))
  );
  const payload = {
    tarih: form.tarih,
    teslimatTuruId: form.teslimatTuruId,
    subeId: form.subeId,
    gonderenTipiId: form.gonderenTipiId,
    gonderenAdi: form.gonderenAdi,
    gonderenTel: form.gonderenTel,
    aliciAdi: form.aliciAdi,
    aliciTel: form.aliciTel,
    adres: form.adres,
    aciklama: form.aciklama,
    siparisler: siparisPayload,
    gorunecekAd: aliciGondericiAdi,
    subeNeredenId: form.subeNeredenId,
    subeNereyeId: form.subeNereyeId
  };
  console.log('Gönderilecek Payload:', JSON.stringify(payload, null, 2));
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/siparis`, payload);
    console.log('✅ Sipariş kaydedildi:', data);
    successDialog.value = true;
  } catch (err) {
    console.error('❌ Sipariş gönderilemedi:', err.response?.data || err.message || err);
    showSnackbar(`Sipariş gönderilirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error');
  }
}

function selectAdres(adres) {
  selectedAdres.value = adres;
  form.adres = adres;
}

function closeSuccessDialog() {
  successDialog.value = false;
  resetForm();
}

function resetForm() {
  form.tarih = '';
  form.fullTarih = '';
  form.teslimatTuruId = null;
  form.subeId = null;
  form.gonderenTipiId = null;
  form.gonderenAdi = '';
  form.gonderenTel = '';
  form.aliciAdi = '';
  form.aliciTel = '';
  form.adres = '';
  form.aciklama = '';
  orderPackages.value = [];
  selectedCari.value = null;
  aliciSearch.value = '';
  cariAdresler.value = [];
  selectedAdres.value = '';
}

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
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(27,94,32,0.08)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  pointer-events: none;
}

.package-card:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(255, 152, 0, 0.2) !important;
}

.package-summary-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.package-summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(116, 39, 116, 0.15) !important;
}

.adres-row-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
}

.adres-row-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(56, 142, 60, 0.15) !important;
}

.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
