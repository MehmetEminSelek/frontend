<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-6 rounded-lg" elevation="3">
      <v-card-title class="text-h5 font-weight-bold mb-5" color="primary">
        📋 Sipariş Formu
      </v-card-title>
      <v-form ref="formRef" v-model="valid">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.tarih" label="Sipariş Tarihi" type="date" :rules="[rules.required]"
              @change="onDateChange" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.fullTarih" label="Gün" readonly placeholder="Tarih seçiniz..." />
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="form.teslimatTuruId" :items="dropdowns.teslimatTurleri" item-title="ad" item-value="id"
              label="Teslimat Türü" :rules="[rules.required]" @update:modelValue="handleTeslimatChange" />
          </v-col>
          <v-col cols="12" md="6" v-if="showSube">
            <v-select v-model="form.subeId" :items="dropdowns.subeler" item-title="ad" item-value="id" label="Şube"
              :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" v-if="selectedTeslimatTuru?.ad === 'Şubeden Şubeye'">
            <v-row>
              <v-col cols="12" md="6">
                <v-select v-model="form.subeNeredenId" :items="dropdowns.subeler" item-title="ad" item-value="id"
                  label="Nereden Şube" :rules="[rules.required]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.subeNereyeId" :items="dropdowns.subeler" item-title="ad" item-value="id"
                  label="Nereye Şube" :rules="[rules.required]" />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-select v-model="form.gonderenTipiId" :items="dropdowns.aliciTipleri" item-title="ad" item-value="id"
              label="Gönderen Tipi" @update:modelValue="handleGonderenChange" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.gonderenAdi" label="Gönderen Adı" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.gonderenTel" label="Gönderen Tel" maxlength="11" :rules="[rules.phone]"
              placeholder="5xxxxxxxxx" />
          </v-col>
          <template v-if="showAliciFields">
            <v-col cols="12" md="6">
              <v-autocomplete v-model="selectedCari" :items="dropdowns.cariler" item-title="ad" item-value="id"
                label="Alıcı Adı" clearable no-filter @update:model-value="onCariSelected" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field ref="aliciTelRef" :key="selectedCari" v-model="form.aliciTel" label="Alıcı Tel"
                maxlength="11" :rules="[rules.optionalPhone]" persistent-placeholder variant="outlined" color="primary"
                placeholder="5xxxxxxxxx" />
            </v-col>
          </template>
          <v-col cols="12">
            <template v-if="cariAdresler.length > 1">
              <div class="adresler-row-group">
                <v-row dense>
                  <v-col v-for="(adres, i) in cariAdresler" :key="i" cols="12" md="6" lg="4">
                    <v-card :elevation="selectedAdres === adres.adres ? 8 : 2"
                      :class="['adres-row-card', { 'adres-row-selected': selectedAdres === adres.adres }]"
                      @click="selectAdres(adres.adres)">
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <div class="adres-row-baslik">{{ adres.tip }}</div>
                          <div class="adres-row-tip">{{ adres.adres }}</div>
                        </div>
                        <v-radio v-model="selectedAdres" :value="adres.adres" color="primary" />
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </template>
            <template v-else-if="cariAdresler.length === 1">
              <v-textarea v-model="form.adres" label="Adres" :disabled="!adresEnabled" rows="2" />
            </template>
            <template v-else>
              <v-textarea v-model="form.adres" label="Adres" :disabled="!adresEnabled" rows="2" />
            </template>
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="form.aciklama" label="Açıklama" rows="2" />
          </v-col>


          <v-col cols="12"> <v-divider class="my-4"></v-divider> </v-col>

          <v-col cols="12">
            <h3 class="text-subtitle-1 font-weight-medium mb-3">📦 Paket Ekle</h3>
            <v-item-group mandatory>
              <v-chip-group mandatory v-model="selectedAmbalajId" column>
                <v-chip v-for="ambalaj in dropdowns.ambalajlar" :key="ambalaj.id" :value="ambalaj.id"
                  @click="openPackageDialog(ambalaj)" color="primary" size="large" class="ma-1" label>
                  <v-icon start :icon="getAmbalajIcon(ambalaj.ad)"></v-icon>
                  {{ ambalaj.ad }} Ekle
                </v-chip>
              </v-chip-group>
            </v-item-group>
          </v-col>

          <v-col cols="12" v-if="orderPackages.length > 0" class="mt-5">
            <v-divider class="mb-4"></v-divider>
            <h3 class="text-subtitle-1 font-weight-medium mb-3">📝 Eklenen Paketler</h3>
            <v-row dense>
              <v-col v-for="(pkg, index) in orderPackages" :key="index" cols="12" md="6" lg="4">
                <v-card class="mb-3 fill-height">
                  <v-card-title class="d-flex justify-space-between text-body-1 font-weight-medium">
                    <span>{{ pkg.ambalajAdi }} {{ pkg.specificPackageName ? `(${pkg.specificPackageName})` : ''
                    }}</span>
                    <v-btn icon="mdi-delete" color="error" size="x-small" variant="text"
                      @click="removeOrderPackage(index)"></v-btn>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-list density="compact" lines="one" class="pa-0">
                    <v-list-item v-for="(item, itemIndex) in pkg.urunler" :key="itemIndex" :title="item.urunAdi"
                      class="px-3">
                      <template v-slot:prepend>
                        <v-icon size="x-small" class="mr-2">{{ getUrunIcon(item.urunAdi) }}</v-icon>
                      </template>
                      <template v-slot:append>
                        <span class="text-body-2">{{ item.miktar }} {{ item.birim }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item v-if="!pkg.urunler || pkg.urunler.length === 0">
                      <v-list-item-title class="text-caption text-grey">Paket boş.</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12"> <v-divider class="my-4"></v-divider> </v-col>

          <v-col cols="12" class="text-end mt-4">
            <v-btn color="success" @click="submitForm" :disabled="orderPackages.length === 0" size="large"
              prepend-icon="mdi-check-circle-outline">
              Siparişi Kaydet
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
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
import { apiClient } from '@/utils/api'
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
const cariAdresler = ref([]);
const selectedAdres = ref('');
const aliciTelRef = ref(null);
const successDialog = ref(false);

onMounted(async () => {
  try {
    const { data } = await apiClient.get('/dropdown');
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

function onCariSelected(cariId) {
  console.log('🔍 onCariSelected çağrıldı, cariId:', cariId);

  const cari = dropdowns.cariler.find(c => c.id === cariId);
  console.log('📋 Bulunan cari:', cari);

  if (cari) {
    form.aliciAdi = cari.ad;
    form.aliciTel = cari.telefon || '';

    console.log('📍 Cari adresler:', cari.adresler);

    // Adresleri ata
    if (cari.adresler && cari.adresler.length > 0) {
      cariAdresler.value = cari.adresler.map(a => {
        console.log('🔄 Adres dönüştürülüyor:', a);
        return {
          adres: a.adres,
          tip: a.tip,
          adresGosterim: a.tip ? `${a.tip}: ${a.adres}` : a.adres
        };
      });

      console.log('✅ Dönüştürülen adresler:', cariAdresler.value);

      selectedAdres.value = cariAdresler.value[0].adres;
      form.adres = cariAdresler.value[0].adres;

      console.log('🎯 Seçilen adres:', selectedAdres.value);
      console.log('📝 Form adres:', form.adres);

    } else {
      cariAdresler.value = [];
      selectedAdres.value = '';
      form.adres = '';
      console.log('❌ Adres bulunamadı');
    }

    nextTick(() => {
      if (aliciTelRef.value) {
        aliciTelRef.value.focus();
        aliciTelRef.value.blur();
      }
    });
  } else {
    console.log('❌ Cari bulunamadı');
  }
}

function onAdresSelected(adres) {
  form.adres = adres;
}

function showSnackbar(message, color = 'info') {
  console.log(`${color.toUpperCase()}: ${message}`);
  // Burada toast notification sistemi kullanabilirsiniz
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
    const { data } = await apiClient.post('/siparis', payload);
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
  cariAdresler.value = [];
  selectedAdres.value = '';
}

</script>

<style scoped>
.v-chip-group .v-chip {
  margin: 4px !important;
  transition: transform 0.1s ease-in-out;
}

.v-chip-group .v-chip:hover {
  transform: translateY(-2px);
}

.v-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
  background: #fff;
  transition: box-shadow 0.2s;
}

.v-card:hover {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.16);
}

.v-btn {
  transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.10);
}

.v-avatar {
  font-weight: bold;
  font-size: 1.2em;
}

.v-list-item:not(:last-child) {
  border-bottom: 1px solid #e0e0e0;
}

.v-card-title.bg-primary {
  background: #1976D2 !important;
  color: #fff !important;
  border-radius: 12px 12px 0 0;
}

.adresler-row-group {
  margin-bottom: 12px;
}

.adres-row-card {
  cursor: pointer;
  border-radius: 12px;
  transition: box-shadow 0.2s, border 0.2s;
  border: 2px solid #e0e0e0;
  padding: 18px 20px;
  margin-bottom: 8px;
}

.adres-row-selected {
  border: 2px solid #1976d2;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
}

.adres-row-baslik {
  font-size: 1.1em;
  font-weight: bold;
  color: #263238;
  margin-bottom: 2px;
  word-break: break-word;
}

.adres-row-tip {
  font-size: 0.98em;
  color: #607d8b;
  font-weight: 500;
}
</style>
