<template>
  <v-container class="py-6 px-4" max-width="xl">
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>📚 Tüm Siparişler</span>
        <v-text-field v-model="search" label="Siparişlerde Ara (Müşteri, ID...)" prepend-inner-icon="mdi-magnify"
          variant="outlined" density="compact" hide-details clearable style="max-width: 300px;"></v-text-field>
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

        <template v-slot:item.toplamTutar="{ item }">
          <span class="font-weight-medium">{{ calculateOrderTotal(item.kalemler).toFixed(2) }} ₺</span>
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
                <h4 class="text-subtitle-2 mb-2">Sipariş Kalemleri (ID: {{ item.id }})</h4>
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
                      <td>
                        {{ kalem.ambalaj?.ad }}
                        <span v-if="kalem.kutu"> ({{ kalem.kutu.ad }})</span>
                        <span v-if="kalem.tepsiTava"> ({{ kalem.tepsiTava.ad }})</span>
                      </td>
                      <td class="text-right">{{ kalem.miktar }}</td>
                      <td class="text-left">{{ kalem.birim }}</td>
                      <td class="text-right">{{ getStaticPrice(kalem.urun?.id, kalem.birim).toFixed(2) }}</td>
                      <td class="text-right font-weight-medium">{{ (kalem.miktar * getStaticPrice(kalem.urun?.id,
                        kalem.birim)).toFixed(2) }}</td>
                    </tr>
                    <tr v-if="!item.kalemler || item.kalemler.length === 0">
                      <td :colspan="6" class="text-center text-grey">Bu siparişe ait ürün bulunamadı.</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="5" class="text-right font-weight-bold">Genel Toplam:</td>
                      <td class="text-right font-weight-bold">{{ calculateOrderTotal(item.kalemler).toFixed(2) }} ₺</td>
                    </tr>
                  </tfoot>
                </v-table>
              </v-card>
            </td>
          </tr>
        </template>

        <template v-slot:loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Data Table State
const itemsPerPage = ref(10); // Sayfa başına öğe sayısı
const headers = ref([ // Headerlar tanımlandı
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Tarih', key: 'tarih', sortable: true },
  { title: 'Müşteri', key: 'musteri', value: item => item.gorunecekAd || item.gonderenAdi, sortable: true },
  { title: 'Teslimat', key: 'teslimat', value: item => item.teslimatTuru?.ad, sortable: true },
  { title: 'Durum', key: 'onaylandiMi', sortable: true },
  { title: 'Toplam Tutar (₺)', key: 'toplamTutar', value: item => calculateOrderTotal(item.kalemler), sortable: true, align: 'end' },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
]);
const allOrders = ref([]); // TÜM siparişleri tutacak dizi
const loading = ref(true);
const search = ref(''); // Arama modeli
const error = ref(null);
const expanded = ref([]); // Genişletilmiş satırları takip eder

// --- Statik Fiyatlar (Demo Amaçlı) ---
// ID'leri kendi veritabanınızdaki Urun ID'leri ile eşleştirin
const staticPrices = {
  // Örnek KG/Litre fiyatları
  1: 250.50, // Antep Peynirli Su Böreği (KG)
  2: 300.00, // Bayram Tepsisi (KG?) - Belki bu adet olmalı?
  3: 180.75, // Cevizli Bülbül Yuvası (KG)
  4: 220.00, // Cevizli Eski Usûl Dolama (KG)
  5: 280.00, // Cevizli Özel Kare Baklava (KG)
  9: 150.00, // Düz Kadayıf (KG)
  11: 450.00, // Fıstık Ezmesi (KG)
  // Örnek Adet fiyatları
  'adet_2': 35.00, // Bayram Tepsisi Adet fiyatı (ID: 2 için özel anahtar)
  'adet_8': 40.00, // Doğum Günü Tepsisi Adet fiyatı (ID: 8 varsayıldı)
  'adet_10': 25.00, // Fındıklı Çikolatalı Midye Baklava Adet (ID: 10 varsayıldı)
  // ... diğer ürün ID'leri ve fiyatları ...
};

function getStaticPrice(urunId, birim) {
  let priceKey = urunId;
  // Eğer birim 'Adet' ise, özel adet fiyatı anahtarını kullanmayı dene
  if (birim && birim.toLowerCase() === 'adet') {
    priceKey = `adet_${urunId}`;
  }
  // Fiyatı bul veya 0 dön
  return staticPrices[priceKey] || staticPrices[urunId] || 0;
}

// Siparişin toplam tutarını hesapla
function calculateOrderTotal(kalemler) {
  if (!kalemler) return 0;
  return kalemler.reduce((total, kalem) => {
    const price = getStaticPrice(kalem.urun?.id, kalem.birim);
    // Gram ise KG fiyatını 1000'e böl
    const unitPrice = (kalem.birim && kalem.birim.toLowerCase() === 'gram') ? price / 1000 : price;
    return total + (kalem.miktar * unitPrice);
  }, 0);
}
// --- Statik Fiyatlar Sonu ---


// API'den TÜM veriyi çekme fonksiyonu
async function fetchOrders() {
  loading.value = true;
  error.value = null;
  console.log('Fetching all orders for v-data-table...');

  try {
    const response = await axios.get('/api/orders'); // Doğru endpoint
    allOrders.value = response.data;
    console.log('All orders loaded:', allOrders.value);
  } catch (err) {
    console.error('❌ Tüm Siparişler çekilemedi:', err.response?.data || err.message || err);
    error.value = `Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`;
    allOrders.value = [];
  } finally {
    loading.value = false;
  }
}

// Sayfa yüklendiğinde veriyi çek
onMounted(() => {
  fetchOrders();
});


// Tarihi formatlama
function formatDate(dateString) {
  if (!dateString) return '';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Geçersiz Tarih'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}.${month}.${year}`; } catch (e) { console.error("Tarih formatlama hatası:", e); return 'Hatalı Tarih'; }
}

// İşlem Butonları Fonksiyonları
function editOrder(id) { console.log('Düzenle ID:', id); alert(`Sipariş ${id} düzenleme/onaylama sayfasına gidilecek (henüz eklenmedi).`); }
async function deleteOrder(id) {
  console.log('Sil ID:', id); if (!confirm(`${id} ID'li siparişi silmek istediğinizden emin misiniz?`)) return;
  const itemIndex = allOrders.value.findIndex(item => item.id === id);
  try {
    await axios.delete(`/api/siparis/${id}`); // Silme için doğru endpoint
    alert('Sipariş başarıyla silindi.');
    if (itemIndex > -1) {
      allOrders.value.splice(itemIndex, 1); // Listeden kaldır
    }
  } catch (err) {
    console.error('❌ Sipariş silinemedi:', err.response?.data || err.message || err);
    alert(`Sipariş silinirken hata oluştu: ${err.response?.data?.message || err.message}`);
  }
}

</script>

<style scoped>
/* Genişletilmiş satır içeriği için stil */
.v-data-table__expanded__content td {
  padding: 0 !important;
  box-shadow: inset 0px 5px 5px -5px rgba(0, 0, 0, 0.2), inset 0px -5px 5px -5px rgba(0, 0, 0, 0.2);
}
</style>
