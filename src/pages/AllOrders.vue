<template>
  <v-container class="py-6 px-4" max-width="xl">
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
        <template v-slot:item.tarih="{ item }">
          {{ formatDate(item.tarih) }}
        </template>

        <template v-slot:item.musteri="{ item }">
          {{ item.gorunecekAd || item.gonderenAdi }}
        </template>

        <template v-slot:item.teslimat="{ item }">
          {{ item.teslimatTuru?.ad }}
          <span v-if="item.sube">({{ item.sube.ad }})</span>
        </template>

        <template v-slot:item.onaylandiMi="{ item }">
          <v-chip :color="item.onaylandiMi ? 'success' : 'warning'" size="small" label variant="tonal">
            <v-icon start size="small">{{ item.onaylandiMi ? 'mdi-check-circle' : 'mdi-clock-alert-outline' }}</v-icon>
            {{ item.onaylandiMi ? 'Onaylandı' : 'Bekliyor' }}
          </v-chip>
        </template>

        <template v-slot:item.tepsiMaliyeti="{ item }">
          <span v-if="item.toplamTepsiMaliyeti > 0">{{ item.toplamTepsiMaliyeti?.toFixed(2) }} ₺</span>
          <span v-else class="text-grey-lighten-1">-</span>
        </template>

        <template v-slot:item.genelToplam="{ item }">
          <span class="font-weight-medium">{{ calculateGrandTotal(item).toFixed(2) }} ₺</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip location="top" text="Düzenle/Onayla">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" v-bind="props"
                @click.stop="editOrder(item.id)"></v-btn>
            </template>
          </v-tooltip>
          <v-tooltip location="top" text="Sil">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" v-bind="props"
                @click.stop="deleteOrder(item.id)"></v-btn>
            </template>
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="pa-0">
              <v-card flat color="grey-lighten-4" class="ma-2 pa-3">
                <h4 class="text-subtitle-2 mb-2">Sipariş Detayları (ID: {{ item.id }})</h4>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th class="text-left">Ürün</th>
                      <th class="text-left">Ambalaj</th>
                      <th class="text-right">Miktar</th>
                      <th class="text-left">Birim</th>
                      <th class="text-right">Birim Fiyat (₺)</th>
                      <th class="text-right">Satır Toplamı (₺)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="kalem in item.kalemler" :key="kalem.id">
                      <td>{{ kalem.urun?.ad }}</td>
                      <td> {{ kalem.ambalaj?.ad }} <span v-if="kalem.kutu"> ({{ kalem.kutu.ad }})</span> <span
                          v-if="kalem.tepsiTava"> ({{ kalem.tepsiTava.ad }})</span> </td>
                      <td class="text-right">{{ kalem.miktar }}</td>
                      <td class="text-left">{{ kalem.birim }}</td>
                      <td class="text-right">{{ kalem.birimFiyat?.toFixed(2) || '0.00' }}</td>
                      <td class="text-right font-weight-medium">{{ calculateItemTotal(kalem).toFixed(2) }}</td>
                    </tr>
                    <tr v-if="!item.kalemler || item.kalemler.length === 0">
                      <td :colspan="6" class="text-center text-grey">Bu siparişe ait ürün bulunamadı.</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5" class="text-right font-weight-bold">Ürün Toplamı:</td>
                      <td class="text-right font-weight-bold">{{ calculateProductTotal(item.kalemler).toFixed(2) }} ₺
                      </td>
                    </tr>
                    <tr v-if="item.toplamTepsiMaliyeti > 0">
                      <td colspan="5" class="text-right">Tepsi/Tava Maliyeti:</td>
                      <td class="text-right">{{ item.toplamTepsiMaliyeti?.toFixed(2) }} ₺</td>
                    </tr>
                    <tr v-if="item.kargoUcreti > 0">
                      <td colspan="5" class="text-right">Kargo Ücreti:</td>
                      <td class="text-right">{{ item.kargoUcreti?.toFixed(2) }} ₺</td>
                    </tr>
                    <tr v-if="item.digerHizmetTutari > 0">
                      <td colspan="5" class="text-right">Diğer Hizmet:</td>
                      <td class="text-right">{{ item.digerHizmetTutari?.toFixed(2) }} ₺</td>
                    </tr>
                    <tr>
                      <td colspan="5" class="text-right font-weight-bold text-h6">Genel Toplam:</td>
                      <td class="text-right font-weight-bold text-h6">{{ calculateGrandTotal(item).toFixed(2) }} ₺</td>
                    </tr>
                  </tfoot>
                </v-table>
              </v-card>
            </td>
          </tr>
        </template>

        <template v-slot:loading> <v-skeleton-loader type="table-row@10"></v-skeleton-loader> </template>

      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Data Table State
const itemsPerPage = ref(10);
const headers = ref([
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Tarih', key: 'tarih', sortable: true },
  { title: 'Müşteri', key: 'musteri', value: item => item.gorunecekAd || item.gonderenAdi, sortable: true },
  { title: 'Teslimat', key: 'teslimat', value: item => item.teslimatTuru?.ad, sortable: true },
  { title: 'Durum', key: 'onaylandiMi', sortable: true },
  { title: 'Tepsi Maliyeti (₺)', key: 'tepsiMaliyeti', value: item => item.toplamTepsiMaliyeti || 0, sortable: true, align: 'end' },
  { title: 'Genel Toplam (₺)', key: 'genelToplam', value: item => calculateGrandTotal(item), sortable: true, align: 'end' },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
]);
const allOrders = ref([]);
const loading = ref(true);
const search = ref('');
const error = ref(null);
const expanded = ref([]);

// API'den TÜM veriyi çekme fonksiyonu
async function fetchOrders() {
  loading.value = true; error.value = null; console.log('Fetching all orders...');
  try {
    const response = await axios.get('/api/orders');
    allOrders.value = response.data;
    console.log('All orders loaded:', allOrders.value);

    // <<< DEBUG: İlk siparişin kalemlerini logla >>>
    if (allOrders.value.length > 0 && allOrders.value[0].kalemler) {
      console.log('İlk siparişin kalemleri:', JSON.parse(JSON.stringify(allOrders.value[0].kalemler)));
    }
    // <<< DEBUG SONU >>>

  } catch (err) {
    console.error('❌ Tüm Siparişler çekilemedi:', err.response?.data || err.message || err);
    error.value = `Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`;
    allOrders.value = [];
  } finally { loading.value = false; }
}

onMounted(() => { fetchOrders(); });

// --- Hesaplama Fonksiyonları ---
function calculateItemTotal(kalem) {
  // <<< DEBUG: Hesaplama için gelen kalem verisini logla >>>
  console.log('Calculating item total for:', { id: kalem?.id, miktar: kalem?.miktar, birim: kalem?.birim, birimFiyat: kalem?.birimFiyat });
  // <<< DEBUG SONU >>>

  if (!kalem || !kalem.miktar || kalem.birimFiyat == null || kalem.birimFiyat === undefined) {
    console.warn(`Hesaplama atlandı - Eksik veri:`, kalem);
    return 0;
  }
  const unitPrice = (kalem.birim && kalem.birim.toLowerCase() === 'gram')
    ? (kalem.birimFiyat / 1000)
    : kalem.birimFiyat;
  const total = kalem.miktar * unitPrice;
  console.log(` -> Calculated item total: ${total}`);
  return total;
}
function calculateProductTotal(kalemler) {
  if (!kalemler) return 0;
  return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0);
}
function calculateGrandTotal(order) {
  if (!order) return 0;
  const productTotal = calculateProductTotal(order.kalemler);
  const tepsiTotal = order.toplamTepsiMaliyeti || 0;
  const kargoTotal = order.kargoUcreti || 0;
  const digerTotal = order.digerHizmetTutari || 0;
  return productTotal + tepsiTotal + kargoTotal + digerTotal;
}
// --- Hesaplama Fonksiyonları Sonu ---

function formatDate(dateString) { /* ... aynı ... */ }
function editOrder(id) { /* ... aynı ... */ }
async function deleteOrder(id) { /* ... aynı ... */ }

</script>

<style scoped>
.v-data-table__expanded__content td {
  /* ... aynı ... */
}
</style>
