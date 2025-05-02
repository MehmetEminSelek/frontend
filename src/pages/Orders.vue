<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4">⏳ Onay Bekleyen Siparişler</v-card-title>

      <v-progress-linear indeterminate color="primary" v-if="loading"></v-progress-linear>

      <div v-if="!loading && orders.length === 0 && !error">
        <v-alert type="info" variant="tonal">Onay bekleyen sipariş bulunmamaktadır.</v-alert>
      </div>

      <v-expansion-panels v-if="!loading && orders.length > 0" variant="accordion">
        <v-expansion-panel v-for="(order, orderIndex) in orders" :key="order.id" elevation="1" class="mb-2">
          <v-expansion-panel-title>
            <v-row no-gutters align="center">
              <v-col cols="12" sm="3">
                <strong>Sipariş ID:</strong> {{ order.id }}
              </v-col>
              <v-col cols="12" sm="4">
                <strong>Tarih:</strong> {{ formatDate(order.tarih) }}
              </v-col>
              <v-col cols="12" sm="5">
                <strong>Müşteri:</strong> {{ order.gorunecekAd || order.gonderenAdi }}
              </v-col>
            </v-row>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-card variant="outlined" class="pa-3">
              <v-row dense>
                <v-col cols="12" md="6">
                  <p><strong>Gönderen:</strong> {{ order.gonderenAdi }} ({{ order.gonderenTel }})</p>
                  <p v-if="order.aliciAdi"><strong>Alıcı:</strong> {{ order.aliciAdi }} {{ order.aliciTel ?
                    `(${order.aliciTel})` : '' }}</p>
                  <p><strong>Teslimat:</strong> {{ order.teslimatTuru?.ad || 'Bilinmiyor' }} {{ order.sube ?
                    `(${order.sube.ad})` : '' }}</p>
                </v-col>
                <v-col cols="12" md="6">
                  <p v-if="order.adres"><strong>Adres:</strong> {{ order.adres }}</p>
                  <p v-if="order.aciklama"><strong>Açıklama:</strong> {{ order.aciklama }}</p>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <h4 class="text-subtitle-1 font-weight-medium mb-2">Sipariş İçeriği (Kalemler):</h4>
              <v-list lines="two" dense>
                <v-list-item v-for="item in order.kalemler" :key="item.id" class="mb-1" border>
                  <template v-slot:prepend>
                    <v-icon>{{ getAmbalajIcon(item.ambalaj?.ad) }}</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">{{ item.urun?.ad || 'Bilinmeyen Ürün'
                  }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.miktar }} {{ item.birim }}
                    <span v-if="item.ambalaj?.ad !== 'Özel'">
                      - {{ item.ambalaj?.ad }}
                      <span v-if="item.kutu">({{ item.kutu.ad }})</span>
                      <span v-if="item.tepsiTava">({{ item.tepsiTava.ad }})</span>
                    </span>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="!order.kalemler || order.kalemler.length === 0">
                  <v-list-item-title>Bu siparişe ait ürün bulunamadı.</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-card-actions class="mt-3">
                <v-spacer></v-spacer>
                <v-btn color="primary" variant="outlined" @click="openEditDialog(order)">
                  İçeriği Düzenle
                </v-btn>
                <v-btn color="success" class="ml-2" @click="approveOrder(order.id, orderIndex)"> Siparişi Onayla
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-dialog v-model="editDialog" persistent max-width="800px">
      <v-card :loading="editLoading">
        <v-card-title>Sipariş İçeriğini Düzenle (ID: {{ editingOrder?.id }})</v-card-title>
        <v-card-text>
          <v-container v-if="editingOrder">
            <v-row dense v-for="(item, index) in editingOrder.kalemler" :key="item.id || `edit-${index}`">
              <v-col cols="12" sm="5" class="d-flex align-center">
                <v-icon size="small" class="mr-2">{{ getAmbalajIcon(item.ambalaj?.ad) }}</v-icon>
                <span>{{ item.urun?.ad || 'Bilinmeyen Ürün' }}</span>
                <span class="text-caption ml-1" v-if="item.ambalaj?.ad !== 'Özel'">
                  ({{ item.ambalaj?.ad }}
                  <span v-if="item.kutu"> - {{ item.kutu.ad }}</span>
                  <span v-if="item.tepsiTava"> - {{ item.tepsiTava.ad }}</span>)
                </span>
              </v-col>
              <v-col cols="12" sm="3">
                <v-text-field v-model.number="item.miktar" label="Miktar" type="number" dense min="0" variant="outlined"
                  hide-details />
              </v-col>
              <v-col cols="12" sm="3">
                <v-select v-model="item.birim" :items="['Gram', 'Adet', 'KG', 'Litre', 'Diğer']" label="Birim" dense
                  variant="outlined" hide-details />
              </v-col>
              <v-col cols="12" sm="1" class="d-flex align-center">
                <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small"
                  @click="removeItemFromEditingOrder(index)"></v-btn>
              </v-col>
            </v-row>
            <v-row v-if="!editingOrder.kalemler || editingOrder.kalemler.length === 0">
              <v-col>
                <p class="text-center text-grey">Bu siparişte düzenlenecek ürün bulunmuyor.</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="editDialog = false">İptal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveOrderChanges" :disabled="editLoading">Değişiklikleri
            Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Siparişi Onayla</v-card-title>
        <v-card-text>
          ID: <strong>{{ orderToConfirm.id }}</strong> <br />
          Bu siparişi onaylamak istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="confirmDialog = false" :disabled="confirmLoading">
            İptal
          </v-btn>
          <v-btn color="success" variant="flat" @click="confirmApproval" :loading="confirmLoading">
            Evet, Onayla
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line
      elevation="24">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn :color="snackbarColor === 'error' || snackbarColor === 'warning' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false">
          Kapat
        </v-btn>
      </template>
    </v-snackbar>

  </v-container>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axios from 'axios';

const orders = ref([]);
const loading = ref(false);
const error = ref(null);

const editDialog = ref(false);
const editLoading = ref(false);
const editingOrder = ref(null);

// --- Snackbar State ---
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

// --- Onay Dialogu State ---
const confirmDialog = ref(false);
const orderToConfirm = reactive({ id: null, index: null });
const confirmLoading = ref(false);

// Snackbar'ı göstermek için yardımcı fonksiyon
function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}

async function fetchPendingOrders() {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/orders', { params: { status: 'pending' } });
    orders.value = response.data;
    console.log('Onay bekleyen siparişler:', orders.value);
  } catch (err) {
    console.error('❌ Siparişler çekilemedi:', err.response?.data || err.message || err);
    showSnackbar(`Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchPendingOrders();
});

function formatDate(dateString) {
  if (!dateString) return '';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Geçersiz Tarih'; const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}.${month}.${year}`; } catch (e) { console.error("Tarih formatlama hatası:", e); return 'Hatalı Tarih'; }
}

function getAmbalajIcon(ambalajAdi) {
  if (ambalajAdi === 'Kutu') return 'mdi-package-variant-closed';
  if (ambalajAdi === 'Tepsi/Tava') return 'mdi-silverware-fork-knife';
  if (ambalajAdi === 'Özel') return 'mdi-star-outline';
  return 'mdi-help-box-outline';
}

function openEditDialog(order) {
  editingOrder.value = JSON.parse(JSON.stringify(order));
  console.log('Düzenlenecek Sipariş:', editingOrder.value);
  editDialog.value = true;
}

function removeItemFromEditingOrder(index) {
  if (editingOrder.value && editingOrder.value.kalemler) {
    editingOrder.value.kalemler.splice(index, 1);
  }
}

async function saveOrderChanges() {
  if (!editingOrder.value) return;
  editLoading.value = true;
  const orderId = editingOrder.value.id;
  const orderIndex = orders.value.findIndex(o => o.id === orderId);

  const payload = {
    kalemler: editingOrder.value.kalemler.map(item => ({
      ambalajId: item.ambalaj?.id,
      urunId: item.urun?.id,
      miktar: item.miktar,
      birim: item.birim,
      kutuId: item.kutu?.id || null,
      tepsiTavaId: item.tepsiTava?.id || null
    }))
  };

  for (const kalem of payload.kalemler) {
    if (!kalem.ambalajId || !kalem.urunId) {
      showSnackbar(`Kalem için Ambalaj veya Ürün ID eksik! Lütfen veriyi kontrol edin.`, 'error');
      editLoading.value = false;
      return;
    }
  }

  console.log(`PUT /api/siparis/${orderId} gönderiliyor:`, payload);

  try {
    const response = await axios.put(`/api/siparis/${orderId}`, payload);
    const updatedOrderData = response.data;

    if (orderIndex > -1) {
      orders.value[orderIndex] = updatedOrderData;
      console.log('Sipariş yerinde güncellendi:', orders.value[orderIndex]);
    } else {
      fetchPendingOrders();
    }

    showSnackbar('Sipariş başarıyla güncellendi!', 'success');
    editDialog.value = false;

  } catch (err) {
    console.error('❌ Sipariş güncellenemedi:', err.response?.data || err.message || err);
    showSnackbar(`Sipariş güncellenirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally {
    editLoading.value = false;
  }
}

// Siparişi Onayla Butonuna Tıklanınca Çalışır (Dialogu Açar)
function approveOrder(orderId, index) {
  orderToConfirm.id = orderId;
  orderToConfirm.index = index;
  confirmDialog.value = true; // Onay dialogunu aç
}

// Onay Dialogundaki "Evet" Butonuna Tıklanınca Çalışır
async function confirmApproval() {
  if (!orderToConfirm.id) return;

  confirmLoading.value = true;
  loading.value = true; // Ana liste için loading (isteğe bağlı)
  const payload = { onaylandiMi: true };
  const orderId = orderToConfirm.id;
  const index = orderToConfirm.index;

  console.log(`PUT /api/siparis/${orderId} gönderiliyor (Onay):`, payload);

  try {
    await axios.put(`/api/siparis/${orderId}`, payload);
    showSnackbar('Sipariş başarıyla onaylandı!', 'success');

    if (index > -1) {
      orders.value.splice(index, 1); // Onaylanan öğeyi listeden sil
    } else {
      fetchPendingOrders(); // Index bulunamazsa listeyi yenile
    }
    confirmDialog.value = false; // Dialogu kapat

  } catch (err) {
    console.error('❌ Sipariş onaylanamadı:', err.response?.data || err.message || err);
    showSnackbar(`Sipariş onaylanırken hata oluştu: ${err.response?.data?.message || err.message}`, 'error', 6000);
  } finally {
    confirmLoading.value = false;
    loading.value = false;
    orderToConfirm.id = null;
    orderToConfirm.index = null;
  }
}

</script>

<style scoped>
.v-expansion-panel-title {
  font-size: 0.95rem;
}

.v-expansion-panel-text .v-card {
  background-color: #f9f9f9;
}
</style>
