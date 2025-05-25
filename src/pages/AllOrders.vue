<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>📚 Tüm Siparişler</span>
        <v-text-field v-model="search" label="Ara (Müşteri, ID...)" prepend-inner-icon="mdi-magnify" variant="outlined"
          density="compact" hide-details clearable style="max-width: 300px;"></v-text-field>
        <v-btn icon="mdi-refresh" variant="text" @click="fetchOrders" title="Listeyi Yenile"></v-btn>
      </v-card-title>

      <v-alert type="error" v-if="error" class="mb-4" closable>{{ error }}</v-alert>

      <v-data-table v-model:items-per-page="itemsPerPage" v-model:expanded="expanded" :headers="headers"
        :items="allOrders" :loading="loading" :search="search" item-value="id" class="elevation-1" hover
        density="comfortable" items-per-page-text="Sayfa başına sipariş:"
        no-data-text="Gösterilecek sipariş bulunamadı." loading-text="Siparişler yükleniyor..." show-expand>
        <template v-slot:item.tarih="{ item }"> {{ formatDate(item.tarih, true) }} </template>
        <template v-slot:item.musteri="{ item }"> {{ item.gorunecekAd || item.gonderenAdi }} </template>
        <template v-slot:item.teslimat="{ item }"> {{ item.teslimatTuru?.ad }} <span v-if="item.sube">({{ item.sube.ad
        }})</span> </template>

        <template v-slot:item.siparisDurumu="{ item }">
          <v-chip v-if="!item.onaylandiMi" color="warning" size="small" label variant="tonal"> <v-icon start
              size="small">mdi-clock-alert-outline</v-icon> Bekliyor </v-chip>
          <v-chip v-else-if="item.hazirlanmaDurumu === 'Hazırlandı'" color="indigo-lighten-1" size="small" label
            variant="flat"> <v-icon start size="small">mdi-package-variant-closed-check</v-icon> Hazırlandı </v-chip>
          <v-chip v-else color="success" size="small" label variant="tonal"> <v-icon start
              size="small">mdi-check-circle</v-icon> Onaylandı </v-chip>
        </template>

        <template v-slot:item.odemeDurumu="{ item }">
          <v-chip :color="getPaymentStatus(item).color" size="small" label variant="tonal">
            <v-icon start size="small">{{ getPaymentStatus(item).icon }}</v-icon>
            {{ getPaymentStatus(item).text }}
          </v-chip>
        </template>

        <template v-slot:item.genelToplam="{ item }"> <span class="font-weight-medium">{{
          calculateGrandTotal(item).toFixed(2) }} ₺</span> </template>
        <template v-slot:item.kalanTutar="{ item }">
          <span :class="getPaymentStatus(item).textColor + ' font-weight-medium'">
            {{ (calculateGrandTotal(item) - calculateTotalPaid(item.odemeler)).toFixed(2) }} ₺
          </span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top" text="Ödeme Ekle">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-cash-plus" variant="text" size="small" color="teal" v-bind="props"
                @click.stop="openPaymentDialog(item)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="top" text="Düzenle/Onayla"> <template v-slot:activator="{ props }"> <v-btn
                icon="mdi-pencil" variant="text" size="small" color="primary" v-bind="props"
                @click.stop="editOrder(item.id)"></v-btn> </template>
          </v-tooltip>
          <v-tooltip location="top" text="Sil"> <template v-slot:activator="{ props }"> <v-btn icon="mdi-delete"
                variant="text" size="small" color="error" v-bind="props" @click.stop="deleteOrder(item.id)"></v-btn>
            </template>
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-0">
              <div class="bg-grey-lighten-4 pa-3">
                <v-row dense>
                  <v-col cols="12" md="8">
                    <h4 class="text-subtitle-1 mb-3">Sipariş Detayları (ID: {{ item.id }})</h4>
                    <v-row dense>
                      <v-col v-for="(paket, index) in groupItemsByPackage(item.kalemler)"
                        :key="`paket-${item.id}-${index}`" cols="12" lg="6">
                        <v-card class="mb-3 fill-height" variant="tonal">
                          <v-card-title class="text-body-1 font-weight-medium d-flex align-center">
                            <v-icon start size="small">{{ getAmbalajIcon(paket.ambalajAdi) }}</v-icon>
                            <span>{{ paket.ambalajAdi }} {{ paket.specificPackageName ? `(${paket.specificPackageName})`
                              : '' }}</span>
                          </v-card-title>
                          <v-divider></v-divider>
                          <v-list density="compact" lines="one" class="bg-transparent py-0">
                            <v-list-item v-for="kalem in paket.urunler" :key="kalem.id" class="px-3">
                              <template v-slot:prepend> <v-icon size="x-small" class="mr-2">{{
                                getUrunIcon(kalem.urun?.ad) }}</v-icon> </template>
                              <v-list-item-title class="text-body-2">{{ kalem.urun?.ad }}</v-list-item-title>
                              <template v-slot:append>
                                <div class="d-flex flex-column align-end">
                                  <span class="text-body-2">{{ kalem.miktar }} {{ kalem.birim }}</span>
                                  <span class="text-caption text-grey">
                                    @ {{ getBirimFiyatDisplay(kalem) }} ₺/{{ kalem.birim === 'Gram' ? 'g' : kalem.birim
                                    }}
                                    <span v-if="getActivePrice(kalem) !== null"> | Güncel: {{ getActivePrice(kalem) }}
                                      ₺/{{ kalem.birim === 'Gram' ? 'g' : kalem.birim }}</span>
                                    <span v-if="getRecipeCost(kalem)" class="text-blue-grey cursor-pointer"
                                      @click.stop="showRecipeDetails(kalem)">
                                      | Maliyet: {{ getRecipeCost(kalem).oranlanmisMaliyet.toFixed(2) }} ₺
                                      <v-icon size="x-small" class="ml-1">mdi-information-outline</v-icon>
                                    </span>
                                    = {{ calculateItemTotal(kalem).toFixed(2) }} ₺
                                  </span>
                                </div>
                              </template>
                            </v-list-item>
                            <v-list-item v-if="!paket.urunler || paket.urunler.length === 0"> <v-list-item-title
                                class="text-caption text-grey">Paket boş.</v-list-item-title> </v-list-item>
                          </v-list>
                          <v-divider
                            v-if="paket.tepsiTavaFiyat > 0 || calculatePackageProductTotal(paket.urunler) > 0"></v-divider>
                          <v-card-text class="text-right text-body-2 font-weight-medium pa-2"> Ürün Toplamı: {{
                            calculatePackageProductTotal(paket.urunler).toFixed(2) }} ₺ <span
                              v-if="paket.tepsiTavaFiyat > 0" class="ml-2 text-blue-grey-darken-1">(+ {{
                                paket.tepsiTavaFiyat.toFixed(2) }} ₺ Tepsi)</span> </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" md="4">
                    <h4 class="text-subtitle-1 mb-3">Ödemeler ve Toplamlar</h4>
                    <v-list density="compact" class="mb-2 elevation-1 rounded">
                      <v-list-subheader>Yapılan Ödemeler</v-list-subheader>
                      <v-list-item v-for="odeme in item.odemeler" :key="odeme.id">
                        <v-list-item-title>{{ odeme.tutar.toFixed(2) }} ₺</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(odeme.odemeTarihi, true) }} - {{ odeme.odemeYontemi ||
                          'Belirtilmemiş'
                        }}</v-list-item-subtitle> <template v-slot:append>
                        </template>
                      </v-list-item>
                      <v-list-item v-if="!item.odemeler || item.odemeler.length === 0">
                        <v-list-item-subtitle class="text-center">Henüz ödeme yapılmamış.</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <v-list density="compact" class="elevation-1 rounded">
                      <v-list-item> <v-list-item-title class="text-right">Toplam Ürün Tutarı:</v-list-item-title>
                        <template v-slot:append>{{ calculateProductTotal(item.kalemler).toFixed(2) }} ₺</template>
                      </v-list-item>
                      <v-list-item v-if="item.toplamTepsiMaliyeti > 0"> <v-list-item-title class="text-right">Toplam
                          Tepsi/Tava
                          Maliyeti:</v-list-item-title> <template v-slot:append>{{ item.toplamTepsiMaliyeti?.toFixed(2)
                          }} ₺</template>
                      </v-list-item>
                      <v-list-item v-if="item.kargoUcreti > 0"> <v-list-item-title class="text-right">Kargo
                          Ücreti:</v-list-item-title>
                        <template v-slot:append>{{ item.kargoUcreti?.toFixed(2) }} ₺</template> </v-list-item>
                      <v-list-item v-if="item.digerHizmetTutari > 0"> <v-list-item-title class="text-right">Diğer
                          Hizmet:</v-list-item-title> <template v-slot:append>{{ item.digerHizmetTutari?.toFixed(2) }}
                          ₺</template>
                      </v-list-item>
                      <v-divider class="my-1"></v-divider>
                      <v-list-item class="font-weight-bold"> <v-list-item-title
                          class="text-right text-subtitle-1">Sipariş
                          Toplamı:</v-list-item-title> <template v-slot:append class="text-subtitle-1">{{
                            calculateGrandTotal(item).toFixed(2) }} ₺</template> </v-list-item>
                      <v-list-item> <v-list-item-title class="text-right">Toplam Ödenen:</v-list-item-title> <template
                          v-slot:append>{{ calculateTotalPaid(item.odemeler).toFixed(2) }} ₺</template> </v-list-item>
                      <v-divider class="my-1"></v-divider>
                      <v-list-item :class="getPaymentStatus(item).textColor + ' font-weight-bold'">
                        <v-list-item-title class="text-right text-subtitle-1">Kalan Bakiye:</v-list-item-title>
                        <template v-slot:append class="text-subtitle-1">{{ (calculateGrandTotal(item) -
                          calculateTotalPaid(item.odemeler)).toFixed(2) }} ₺</template>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </div>
            </td>
          </tr>
        </template>

        <template v-slot:loading> <v-skeleton-loader type="table-row@10"></v-skeleton-loader> </template>

      </v-data-table>
    </v-card>

    <v-dialog v-model="paymentDialog" persistent max-width="500px">
      <v-card :loading="paymentLoading">
        <v-card-title class="text-h6">Ödeme Ekle (Sipariş ID: {{ orderForPayment?.id }})</v-card-title>
        <v-card-text>
          <p class="mb-1">Müşteri: <strong>{{ orderForPayment?.gorunecekAd || orderForPayment?.gonderenAdi }}</strong>
          </p>
          <p class="mb-1">Sipariş Toplamı: <strong>{{ calculateGrandTotal(orderForPayment).toFixed(2) }} ₺</strong></p>
          <p class="mb-4">Toplam Ödenen: <strong>{{ calculateTotalPaid(orderForPayment?.odemeler).toFixed(2) }}
              ₺</strong>
          </p>
          <v-form ref="paymentFormRef">
            <v-text-field v-model.number="newPayment.tutar" label="Ödeme Tutarı" type="number"
              :rules="[rules.required, rules.positiveNumber]" required prefix="₺" class="mb-3" variant="outlined"
              density="comfortable"></v-text-field>
            <v-select v-model="newPayment.odemeYontemi" :items="['Nakit', 'Kredi Kartı', 'Havale/EFT', 'Diğer']"
              label="Ödeme Yöntemi (Opsiyonel)" clearable class="mb-3" variant="outlined" density="comfortable"
              hide-details></v-select>
            <v-textarea v-model="newPayment.aciklama" label="Ödeme Açıklaması (Opsiyonel)" rows="2" variant="outlined"
              density="comfortable" hide-details></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closePaymentDialog" :disabled="paymentLoading"> İptal
          </v-btn>
          <v-btn color="teal" variant="flat" @click="savePayment" :loading="paymentLoading"> Ödemeyi Kaydet </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line
      elevation="24">
      {{ snackbarText }}
      <template v-slot:actions> <v-btn
          :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false"> Kapat </v-btn> </template>
    </v-snackbar>

    <!-- Reçete Detay Dialog -->
    <v-dialog v-model="recipeDialog" max-width="800px">
      <v-card v-if="selectedRecipe">
        <v-card-title class="text-h6 bg-blue-grey-lighten-5 d-flex justify-space-between align-center">
          <div>
            {{ selectedRecipe.receteAdi }}
            <div class="text-caption text-grey">{{ selectedRecipe.malzemeSayisi }} malzeme • {{
              selectedRecipe.toplamGram
            }}g</div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="recipeDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <!-- Özet Bilgiler -->
            <v-col cols="12">
              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-caption text-grey">Toplam Maliyet (1000g)</div>
                    <div class="text-h6">₺{{ selectedRecipe.binGramMaliyet }}</div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-caption text-grey">KG Maliyeti</div>
                    <div class="text-h6">{{ selectedRecipe.kgMaliyeti }}₺</div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-caption text-grey">Kar (1000g)</div>
                    <div class="text-h6">₺{{ selectedRecipe.binGramKar }}</div>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-caption text-grey">Kar Marjı</div>
                    <div class="text-h6">%{{ selectedRecipe.karMarji }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <!-- Fiyat Analizi -->
            <v-col cols="12">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">Fiyat Analizi (1000g)</div>
                <v-row dense>
                  <v-col cols="12" sm="4">
                    <div class="text-caption text-grey">Satış Fiyatı:</div>
                    <div class="text-body-1">₺{{ selectedRecipe.fiyatAnalizi.satisFiyati }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <div class="text-caption text-grey">Maliyet:</div>
                    <div class="text-body-1">₺{{ selectedRecipe.fiyatAnalizi.maliyet }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <div class="text-caption text-grey">Kar:</div>
                    <div class="text-body-1">₺{{ selectedRecipe.fiyatAnalizi.kar }}</div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <!-- Reçete Detayları -->
            <v-col cols="12">
              <div class="text-subtitle-2 mb-2">Reçete Detayları</div>
              <v-table density="comfortable">
                <thead>
                  <tr>
                    <th>Stok Kodu</th>
                    <th>Malzeme</th>
                    <th>Miktar</th>
                    <th>Birim Maliyet</th>
                    <th class="text-right">Toplam Maliyet</th>
                    <th class="text-right">Yüzde</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(detay, index) in selectedRecipe.malzemeler" :key="index">
                    <td>{{ detay.stokKodu }}</td>
                    <td>
                      {{ detay.malzemeAdi }}
                      <span class="text-caption text-grey">({{ detay.malzemeTipi }})</span>
                    </td>
                    <td>{{ detay.miktar }}{{ detay.birim }}</td>
                    <td>{{ detay.birimFiyat.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2, maximumFractionDigits: 2
                    })
                    }}₺/{{ detay.birimFiyatBirim }}</td>
                    <td class="text-right">₺{{ detay.toplamMaliyet }}</td>
                    <td class="text-right">%{{ detay.yuzde }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" class="text-right text-subtitle-2">Toplam:</td>
                    <td class="text-right font-weight-bold">₺{{ selectedRecipe.binGramMaliyet }}</td>
                    <td class="text-right font-weight-bold">%100</td>
                  </tr>
                </tfoot>
              </v-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, provide, reactive } from 'vue';
import axios from 'axios';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';
import { apiClient } from '@/utils/api'

// Tüm Siparişler modülüne özel tema ile Vuetify instance'ı oluştur
const allOrdersTheme = {
  dark: false,
  colors: {
    primary: '#1976D2', // Mavi
    secondary: '#B0BEC5', // Gri
    accent: '#64B5F6',
    error: '#D32F2F',
    info: '#1976D2',
    success: '#388E3C',
    warning: '#FBC02D',
    background: '#F5F7FA',
    surface: '#FFFFFF',
  },
};
const allOrdersVuetify = createCustomVuetify({ themeName: 'allOrdersTheme', customTheme: allOrdersTheme });
provide('vuetify', allOrdersVuetify);

// Data Table State
const itemsPerPage = ref(10);
const headers = ref([
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Tarih', key: 'tarih', sortable: true },
  { title: 'Müşteri', key: 'musteri', value: item => item.gorunecekAd || item.gonderenAdi, sortable: true },
  { title: 'Teslimat', key: 'teslimat', value: item => item.teslimatTuru?.ad, sortable: true },
  { title: 'Sipariş Durumu', key: 'siparisDurumu', sortable: true },
  { title: 'Ödeme Durumu', key: 'odemeDurumu', sortable: false, align: 'center' },
  { title: 'Tepsi Maliyeti (₺)', key: 'tepsiMaliyeti', value: item => item.toplamTepsiMaliyeti || 0, sortable: true, align: 'end' },
  { title: 'Genel Toplam (₺)', key: 'genelToplam', value: item => calculateGrandTotal(item), sortable: true, align: 'end' },
  { title: 'Kalan Tutar (₺)', key: 'kalanTutar', value: item => calculateGrandTotal(item) - calculateTotalPaid(item.odemeler), sortable: true, align: 'end' },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
]);
const allOrders = ref([]);
const loading = ref(true);
const search = ref('');
const error = ref(null);
const expanded = ref([]);

// Ödeme Dialog State
const paymentDialog = ref(false);
const paymentLoading = ref(false);
const orderForPayment = ref(null);
const paymentFormRef = ref(null);
const newPayment = reactive({ tutar: null, odemeYontemi: null, aciklama: '' });

// Snackbar State
const snackbar = ref(false); const snackbarText = ref(''); const snackbarColor = ref('info'); const snackbarTimeout = ref(4000);
function showSnackbar(text, color = 'info', timeout = 4000) { snackbarText.value = text; snackbarColor.value = color; snackbarTimeout.value = timeout; snackbar.value = true; }

// Validasyon Kuralları
const rules = { required: value => !!value || 'Bu alan zorunludur.', positiveNumber: value => (typeof value === 'number' && value > 0) || 'Tutar 0 dan büyük bir sayı olmalıdır.' };

// Active Prices Map ve Recipe Costs Map
const activePricesMap = ref({});
const recipeCostsMap = ref({});

// Reçete Detay Dialog
const recipeDialog = ref(false);
const selectedRecipe = ref(null);

// Fetch active prices and recipe costs
async function fetchPricesAndCosts() {
  try {
    // 1. Aktif fiyatları çek
    const response = await apiClient.get('/fiyatlar');
    const allPrices = response.data;
    const latestMap = {};

    allPrices.forEach(price => {
      // Hem orijinal birim hem de eşdeğer birimler için kaydet
      const originalKey = `${price.urunId}-${price.birim}`;

      // GR fiyatını KG olarak da kaydet (gram siparişleri için)
      if (price.birim === 'GR') {
        const kgKey = `${price.urunId}-KG`;
        if (!latestMap[kgKey] || new Date(price.gecerliTarih) > new Date(latestMap[kgKey].gecerliTarih)) {
          latestMap[kgKey] = price;
        }
      }

      // Orijinal birim için de kaydet
      if (!latestMap[originalKey] || new Date(price.gecerliTarih) > new Date(latestMap[originalKey].gecerliTarih)) {
        latestMap[originalKey] = price;
      }
    });

    activePricesMap.value = latestMap;
    console.log('💰 Aktif fiyatlar yüklendi:', Object.keys(latestMap).length, 'adet');

    // 2. Recipe maliyetlerini çek
    for (const order of allOrders.value) {
      for (const kalem of order.kalemler) {
        if (kalem.urun?.recipes && kalem.urun.recipes.length > 0) {
          try {
            const recipeId = kalem.urun.recipes[0].id; // İlk recipe'yi al
            const recipeResponse = await apiClient.get(`/receteler/maliyet?recipeId=${recipeId}&miktar=${kalem.miktar}`);
            const key = `${recipeId}-${kalem.miktar}`;
            recipeCostsMap.value[key] = recipeResponse.data;
          } catch (err) {
            console.error(`❌ Recipe maliyeti çekilemedi (Recipe ID: ${kalem.urun.recipes[0]?.id}):`, err);
          }
        }
      }
    }
    console.log('📋 Recipe maliyetleri yüklendi:', Object.keys(recipeCostsMap.value).length, 'adet');

  } catch (err) {
    console.error('❌ Fiyat ve maliyet bilgileri çekilemedi:', err);
    activePricesMap.value = {};
    recipeCostsMap.value = {};
  }
}

// API'den TÜM veriyi çekme fonksiyonu
async function fetchOrders() {
  loading.value = true; error.value = null; console.log('Fetching all orders...');
  try {
    const response = await apiClient.get('/orders'); // Ödemeleri de içermeli
    allOrders.value = response.data;
    console.log('All orders loaded:', JSON.parse(JSON.stringify(allOrders.value)));
    await fetchPricesAndCosts(); // Fiyat ve maliyet bilgilerini çek
  } catch (err) { console.error('❌ Tüm Siparişler çekilemedi:', err.response?.data || err.message || err); error.value = `Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`; allOrders.value = []; }
  finally { loading.value = false; }
}

onMounted(() => { fetchOrders(); });

// --- Hesaplama Fonksiyonları ---
function calculateItemTotal(kalem) {
  if (!kalem || typeof kalem.miktar !== 'number' || typeof kalem.birimFiyat !== 'number' || !kalem.birim) return 0;

  let unitPrice = kalem.birimFiyat;

  // Eğer birim 'Gram' ise ve birimFiyat KG bazındaysa (>100), gram bazına çevir
  // NOT: GR biriminde kaydedilmiş fiyatlar zaten gram bazındadır
  if (kalem.birim.toLowerCase() === 'gram' && unitPrice > 100) {
    unitPrice = unitPrice / 1000; // KG fiyatını gram fiyatına çevir
  }

  return kalem.miktar * unitPrice;
}
function calculatePackageProductTotal(kalemler) { if (!kalemler || !Array.isArray(kalemler)) return 0; return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0); }
function calculateProductTotal(kalemler) { if (!kalemler || !Array.isArray(kalemler)) return 0; return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0); }
function calculateTotalPaid(odemeler) { if (!odemeler || !Array.isArray(odemeler)) return 0; return odemeler.reduce((total, odeme) => total + (odeme.tutar || 0), 0); }
// --- Hesaplama Fonksiyonları Sonu ---

// --- Ödeme Durumu Hesaplama ---
function getPaymentStatus(order) {
  if (!order) return { text: 'Bilinmiyor', color: 'grey', icon: 'mdi-help-circle-outline', textColor: 'text-grey' };
  const grandTotal = calculateGrandTotal(order);
  const totalPaid = calculateTotalPaid(order.odemeler);
  const remaining = grandTotal - totalPaid;
  const epsilon = 0.01;

  if (totalPaid <= epsilon && grandTotal > epsilon) { return { text: 'Ödenmedi', color: 'error', icon: 'mdi-credit-card-off-outline', textColor: 'text-error' }; }
  else if (remaining > epsilon) { return { text: 'Kısmen Ödendi', color: 'warning', icon: 'mdi-alert-circle-outline', textColor: 'text-warning' }; }
  else { return { text: 'Ödeme Alındı', color: 'success', icon: 'mdi-check-decagram-outline', textColor: 'text-success' }; }
}
// --- Ödeme Durumu Sonu ---

// --- Ödeme Dialogu Fonksiyonları ---
function openPaymentDialog(order) {
  orderForPayment.value = order;
  // <<< YENİ: Kalan tutarı hesapla ve varsayılan olarak ata >>>
  const grandTotal = calculateGrandTotal(order);
  const totalPaid = calculateTotalPaid(order.odemeler);
  const remainingBalance = grandTotal - totalPaid;
  // Kalan tutar 0'dan büyükse ata, değilse null bırak (veya 0)
  newPayment.tutar = remainingBalance > 0.01 ? parseFloat(remainingBalance.toFixed(2)) : null;
  // <<< YENİ SONU >>>
  newPayment.odemeYontemi = null;
  newPayment.aciklama = '';
  paymentDialog.value = true;
}

function closePaymentDialog() { paymentDialog.value = false; orderForPayment.value = null; }
async function savePayment() {
  if (!orderForPayment.value) return;
  const { valid: paymentFormIsValid } = await paymentFormRef.value.validate();
  if (!paymentFormIsValid) { showSnackbar('Lütfen ödeme tutarını doğru girin.', 'warning'); return; }

  paymentLoading.value = true;
  const orderId = orderForPayment.value.id;
  const payload = { tutar: newPayment.tutar, odemeYontemi: newPayment.odemeYontemi, aciklama: newPayment.aciklama };
  console.log(`POST /api/siparis/${orderId}/odemeler gönderiliyor:`, payload);

  try {
    const response = await apiClient.post(`/siparis/${orderId}/odemeler`, payload);
    const yeniOdeme = response.data;
    const orderIndex = allOrders.value.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      if (!allOrders.value[orderIndex].odemeler) { allOrders.value[orderIndex].odemeler = []; }
      allOrders.value[orderIndex].odemeler.push(yeniOdeme);
    }
    showSnackbar('Ödeme başarıyla kaydedildi!', 'success');
    closePaymentDialog();
  } catch (err) {
    console.error(`❌ Ödeme kaydedilemedi (Sipariş ${orderId}):`, err.response?.data || err.message || err);
    showSnackbar(`Ödeme kaydedilirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally { paymentLoading.value = false; }
}
// --- Ödeme Dialogu Fonksiyonları Sonu ---

// <<< YARDIMCI FONKSİYONLAR GERİ EKLENDİ >>>
function editOrder(id) { console.log('Düzenle ID:', id); showSnackbar(`Sipariş ${id} düzenleme/onaylama sayfasına gidilecek (henüz eklenmedi).`, 'info'); }
async function deleteOrder(id) {
  console.log('Sil ID:', id); /* Vue dialog ile onay alınmalı! */
  // if (!confirm(`${id} ID'li siparişi silmek istediğinizden emin misiniz?`)) return;
  const itemIndex = allOrders.value.findIndex(item => item.id === id);
  try {
    await apiClient.delete(`/siparis/${id}`);
    showSnackbar('Sipariş başarıyla silindi.', 'success'); // Snackbar kullanıldı
    if (itemIndex > -1) { allOrders.value.splice(itemIndex, 1); }
  } catch (err) {
    console.error('❌ Sipariş silinemedi:', err.response?.data || err.message || err);
    showSnackbar(`Sipariş silinirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error'); // Snackbar kullanıldı
  }
}
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
// --- Gruplama Fonksiyonu (DÜZELTİLDİ) ---
function groupItemsByPackage(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return [];
  // Aynı ambalajId, kutuId, tepsiTavaId olan kalemleri grupla
  const grouped = {};
  kalemler.forEach((kalem) => {
    const key = `${kalem.ambalajId || 'none'}-${kalem.kutuId || 'none'}-${kalem.tepsiTavaId || 'none'}`;
    if (!grouped[key]) {
      grouped[key] = {
        key,
        ambalajAdi: kalem.ambalaj?.ad || 'Bilinmiyor',
        specificPackageName: kalem.kutu?.ad || kalem.tepsiTava?.ad || '',
        tepsiTavaFiyat: kalem.tepsiTavaId ? (kalem.tepsiTava?.fiyat || 0) : 0,
        urunler: []
      };
    }
    grouped[key].urunler.push(kalem);
  });
  return Object.values(grouped);
}
// --- KDV Hesaplama Fonksiyonu ---
function getKdvOrani(order) {
  // Oturma alanı var mı bilgisi yoksa varsayılan %10, yoksa %1
  // TODO: order.oturmaAlaniVar gibi bir alan varsa ona göre ayarla
  // Şimdilik sabit %10 (gerekirse %1 yap)
  return 0.10;
}
function calculateKdv(order) {
  const productTotal = calculateProductTotal(order.kalemler);
  const tepsiTotal = order.toplamTepsiMaliyeti || 0;
  const kargoTotal = order.kargoUcreti || 0;
  const digerTotal = order.digerHizmetTutari || 0;
  const kdvOrani = getKdvOrani(order);
  // KDV matrahı: ürün + tepsi + kargo + hizmet
  const matrah = productTotal + tepsiTotal + kargoTotal + digerTotal;
  return matrah * kdvOrani;
}
// --- Grand Total KDV dahil ---
function calculateGrandTotal(order) {
  if (!order) return 0;
  const productTotal = calculateProductTotal(order.kalemler);
  const tepsiTotal = order.toplamTepsiMaliyeti || 0;
  const kargoTotal = order.kargoUcreti || 0;
  const digerTotal = order.digerHizmetTutari || 0;
  const kdv = calculateKdv(order);
  return productTotal + tepsiTotal + kargoTotal + digerTotal + kdv;
}
// --- Gruplama Fonksiyonu (DÜZELTİLDİ) Sonu ---

function getActivePrice(kalem) {
  if (!kalem.urunId || !kalem.birim) return null;

  // Birim eşleştirmesi - Gram siparişi için KG veya GR fiyatını kontrol et
  let searchKeys = [];
  if (kalem.birim.toLowerCase() === 'gram') {
    searchKeys = [
      `${kalem.urunId}-KG`,  // Önce KG ara
      `${kalem.urunId}-GR`   // Sonra GR ara
    ];
  } else {
    searchKeys = [`${kalem.urunId}-${kalem.birim}`]; // Adet, Porsiyon vb. için direkt ara
  }

  let priceObj = null;

  // İlk bulunan fiyatı kullan
  for (const key of searchKeys) {
    priceObj = activePricesMap.value[key];
    if (priceObj) break;
  }

  if (!priceObj) return null;

  let displayPrice = priceObj.fiyat;

  // Eğer sipariş gram bazındaysa ve fiyat KG/GR bazındaysa, gram fiyatını göster
  if (kalem.birim.toLowerCase() === 'gram') {
    if (priceObj.birim === 'KG') {
      displayPrice = priceObj.fiyat / 1000; // KG fiyatını gram fiyatına çevir
    } else if (priceObj.birim === 'GR') {
      displayPrice = priceObj.fiyat; // GR zaten gram bazında
    }
  }

  return displayPrice?.toFixed(3); // 3 haneli gösterim
}

function getBirimFiyatDisplay(kalem) {
  if (!kalem.birimFiyat || !kalem.birim) return '?';

  let displayPrice = kalem.birimFiyat;

  // Eğer birim 'Gram' ise ve birimFiyat KG bazındaysa (>100), gram fiyatını göster
  // NOT: GR biriminde kaydedilmiş fiyatlar zaten gram bazındadır
  if (kalem.birim.toLowerCase() === 'gram' && kalem.birimFiyat > 100) {
    displayPrice = kalem.birimFiyat / 1000; // KG fiyatını gram fiyatına çevir
    return displayPrice.toFixed(3); // Gram fiyatı için 3 haneli
  }

  return displayPrice.toFixed(2); // Normal fiyat için 2 haneli
}

// Recipe maliyeti gösterimi için yardımcı fonksiyon
function getRecipeCost(kalem) {
  if (!kalem.urun?.recipes || kalem.urun.recipes.length === 0) return null;
  const recipeId = kalem.urun.recipes[0].id;
  const key = `${recipeId}-${kalem.miktar}`;
  return recipeCostsMap.value[key];
}

function showRecipeDetails(kalem) {
  const recipeCost = getRecipeCost(kalem);
  if (recipeCost) {
    selectedRecipe.value = recipeCost;
    recipeDialog.value = true;
  }
}

</script>

<style scoped>
.v-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px #1976d222;
}

.v-btn {
  border-radius: 8px;
  font-weight: 500;
}

.v-chip {
  border-radius: 8px;
}

.v-alert {
  border-radius: 8px;
}

.v-data-table {
  border-radius: 12px;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}

/* Reçete Dialog Stilleri */
.v-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.v-table th {
  background-color: #f5f5f5 !important;
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 600 !important;
}

.v-table td {
  border-bottom: 1px solid #e0e0e0;
}

.v-table tfoot td {
  background-color: #fafafa;
  border-top: 2px solid #e0e0e0;
}
</style>
