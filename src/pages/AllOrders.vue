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
        density="comfortable" items-per-page-text="Sayfa başına sipariş:" items-per-page="50"
        no-data-text="Gösterilecek sipariş bulunamadı." loading-text="Siparişler yükleniyor..." show-expand>
        <template v-slot:item.tarih="{ item }"> {{ formatDate(item.tarih) }} </template>
        <template v-slot:item.musteri="{ item }"> {{ item.gorunecekAd || item.gonderenAdi }} </template>
        <template v-slot:item.teslimat="{ item }"> {{ item.teslimatTuru?.ad }} <span v-if="item.sube">({{ item.sube.ad
            }})</span> </template>

        <template v-slot:item.siparisDurumu="{ item }">
          <v-chip v-if="!item.onaylandiMi" color="warning" size="small" label variant="tonal">
            <v-icon start size="small">mdi-clock-alert-outline</v-icon>
            Bekliyor
          </v-chip>
          <v-chip v-else-if="item.hazirlanmaDurumu === 'Hazırlandı'" color="info" size="small" label variant="flat">
            <v-icon start size="small">mdi-package-variant-closed-check</v-icon>
            Hazırlandı
          </v-chip>
          <v-chip v-else color="success" size="small" label variant="tonal">
            <v-icon start size="small">mdi-check-circle</v-icon>
            Onaylandı
          </v-chip>
        </template>

        <template v-slot:item.tepsiMaliyeti="{ item }"> <span v-if="item.toplamTepsiMaliyeti > 0">{{
          item.toplamTepsiMaliyeti?.toFixed(2) }} ₺</span> <span v-else class="text-grey-lighten-1">-</span>
        </template>
        <template v-slot:item.genelToplam="{ item }"> <span class="font-weight-medium">{{
          calculateGrandTotal(item).toFixed(2) }} ₺</span> </template>
        <template v-slot:item.actions="{ item }">
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
                <h4 class="text-subtitle-1 mb-3">Sipariş Detayları (ID: {{ item.id }})</h4>
                <v-row dense>
                  <v-col v-for="(paket, index) in groupItemsByPackage(item.kalemler)" :key="`paket-${item.id}-${index}`"
                    cols="12" md="6" lg="4">
                    <v-card class="mb-3 fill-height" variant="tonal">
                      <v-card-title class="text-body-1 font-weight-medium d-flex align-center">
                        <v-icon start size="small">{{ getAmbalajIcon(paket.ambalajAdi) }}</v-icon>
                        <span>{{ paket.ambalajAdi }} {{ paket.specificPackageName ? `(${paket.specificPackageName})` :
                          '' }}</span>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-list density="compact" lines="one" class="bg-transparent">
                        <v-list-item v-for="kalem in paket.urunler" :key="kalem.id" class="px-3">
                          <template v-slot:prepend> <v-icon size="x-small" class="mr-2">{{ getUrunIcon(kalem.urun?.ad)
                              }}</v-icon> </template>
                          <v-list-item-title class="text-body-2">{{ kalem.urun?.ad }}</v-list-item-title>
                          <template v-slot:append>
                            <div class="d-flex flex-column align-end">
                              <span class="text-body-2">{{ kalem.miktar }} {{ kalem.birim }}</span>
                              <span class="text-caption text-grey"> @ {{ kalem.birimFiyat?.toFixed(2) || '?' }} ₺/{{
                                kalem.birim === 'Gram' ? 'KG' : kalem.birim }} = {{ calculateItemTotal(kalem).toFixed(2)
                                }} ₺ </span>
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
                <v-divider class="my-3"></v-divider>
                <v-row dense justify="end">
                  <v-col cols="12" sm="6" md="4">
                    <v-list density="compact" class="bg-transparent">
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
                      <v-list-item class="font-weight-bold"> <v-list-item-title class="text-right">Genel
                          Toplam:</v-list-item-title>
                        <template v-slot:append>{{ calculateGrandTotal(item).toFixed(2) }} ₺</template> </v-list-item>
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
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Data Table State
const itemsPerPage = ref(10);
const headers = ref([ // <<< Header Güncellendi
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Tarih', key: 'tarih', sortable: true },
  { title: 'Müşteri', key: 'musteri', value: item => item.gorunecekAd || item.gonderenAdi, sortable: true },
  { title: 'Teslimat', key: 'teslimat', value: item => item.teslimatTuru?.ad, sortable: true },
  { title: 'Sipariş Durumu', key: 'siparisDurumu', sortable: true }, // <<< Key değişti
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
    console.log('All orders loaded:', JSON.parse(JSON.stringify(allOrders.value)));
    if (allOrders.value.length > 0 && allOrders.value[0].kalemler && allOrders.value[0].kalemler.length > 0) {
      console.log('First order items sample (raw):', JSON.parse(JSON.stringify(allOrders.value[0].kalemler[0])));
      // Hazırlanma durumunu da kontrol et
      console.log('First order sample (check hazirlanmaDurumu):', allOrders.value[0]);
    }
  } catch (err) { /* ... hata yönetimi ... */ }
  finally { loading.value = false; }
}

onMounted(() => { fetchOrders(); });

// --- Hesaplama Fonksiyonları ---
function calculateItemTotal(kalem) {
  if (!kalem || typeof kalem.miktar !== 'number' || typeof kalem.birimFiyat !== 'number' || !kalem.birim) {
    return 0;
  }
  let unitPrice = kalem.birimFiyat;
  if (kalem.birim.toLowerCase() === 'gram' && unitPrice > 0) {
    unitPrice = unitPrice / 1000;
  }
  return kalem.miktar * unitPrice;
}
function calculatePackageProductTotal(kalemler) { // Sadece ürünlerin toplamı (paket için)
  if (!kalemler || !Array.isArray(kalemler)) return 0;
  return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0);
}
function calculateProductTotal(kalemler) { // Tüm ürünlerin toplamı (sipariş için)
  if (!kalemler || !Array.isArray(kalemler)) return 0;
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

// --- Gruplama Fonksiyonu ---
function groupItemsByPackage(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return [];
  const grouped = {};
  kalemler.forEach(kalem => {
    const ambalajAdi = kalem.ambalaj?.ad || 'Bilinmiyor';
    const specificPackageName = kalem.kutu?.ad || kalem.tepsiTava?.ad || '';
    // Tepsi/Tava fiyatını backend'den gelen veriden almalıyız, bu yüzden burada hesaplamaya gerek yok
    // const tepsiTavaFiyat = kalem.tepsiTava?.fiyat || 0; // Bu bilgi artık Siparis modelinde
    const paketKey = `${ambalajAdi}-${kalem.kutuId || 'none'}-${kalem.tepsiTavaId || 'none'}`;

    if (!grouped[paketKey]) {
      grouped[paketKey] = {
        ambalajAdi: ambalajAdi,
        specificPackageName: specificPackageName,
        // Tepsi/Tava fiyatını pakete ekleyelim (sadece Tepsiliyse)
        tepsiTavaFiyat: kalem.tepsiTavaId ? (kalem.tepsiTava?.fiyat || 0) : 0,
        urunler: []
      };
    }
    grouped[paketKey].urunler.push(kalem); // Kalemin tüm verisini ekle (birimFiyat dahil)
  });
  return Object.values(grouped);
}
// --- Gruplama Sonu ---

function formatDate(dateString) {
  if (!dateString) return '';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Geçersiz Tarih'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}.${month}.${year}`; } catch (e) { console.error("Tarih formatlama hatası:", e); return 'Hatalı Tarih'; }
}
function editOrder(id) { console.log('Düzenle ID:', id); alert(`Sipariş ${id} düzenleme/onaylama sayfasına gidilecek (henüz eklenmedi).`); }
async function deleteOrder(id) {
  console.log('Sil ID:', id); if (!confirm(`${id} ID'li siparişi silmek istediğinizden emin misiniz?`)) return;
  const itemIndex = allOrders.value.findIndex(item => item.id === id);
  try {
    await axios.delete(`/api/siparis/${id}`);
    alert('Sipariş başarıyla silindi.');
    if (itemIndex > -1) { allOrders.value.splice(itemIndex, 1); }
  } catch (err) {
    console.error('❌ Sipariş silinemedi:', err.response?.data || err.message || err);
    alert(`Sipariş silinirken hata oluştu: ${err.response?.data?.message || err.message}`);
  }
}

// --- Yardımcı İkon Fonksiyonları ---
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
// --- Yardımcı İkon Fonksiyonları Sonu ---

</script>

<style scoped>
.v-data-table__expanded__content td {
  padding: 0 !important;
  background-color: #f5f5f5;
}
</style>
