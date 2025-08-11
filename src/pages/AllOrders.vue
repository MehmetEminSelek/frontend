<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>📚 Tüm Siparişler</span>
        <div class="d-flex align-center gap-2">
          <v-text-field v-model="search" label="Ara (Müşteri, ID...)" prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" hide-details clearable style="max-width: 300px;"></v-text-field>
          <v-btn icon="mdi-currency-try" variant="text" @click="refreshPrices" title="Fiyatları Yenile"
            color="blue"></v-btn>
          <v-btn icon="mdi-refresh" variant="text" @click="fetchOrders" title="Listeyi Yenile"></v-btn>
        </div>
      </v-card-title>

      <v-alert type="error" v-if="error" class="mb-4" closable>{{ error }}</v-alert>

      <v-data-table v-model:items-per-page="itemsPerPage" v-model:expanded="expanded" :headers="tableHeaders"
        :items="allOrders" :loading="loading" :search="search" item-value="id" class="elevation-1" hover
        :density="isMobile ? 'compact' : 'comfortable'" items-per-page-text="Sayfa başına sipariş:"
        no-data-text="Gösterilecek sipariş bulunamadı." loading-text="Siparişler yükleniyor..."
        :show-expand="!isSmallDevice" @click:row="onRowClick">
        <template v-slot:item.tarih="{ item }"> {{ formatDate(item.tarih, true) }} </template>
        <template v-slot:item.musteri="{ item }"> {{ item.gorunecekAd || item.gonderenAdi }} </template>
        <template v-slot:item.teslimat="{ item }"> {{ item.teslimatTuru?.ad }} <span v-if="item.sube">({{ item.sube.ad
        }})</span> </template>

        <template v-slot:item.siparisDurumu="{ item }">
          <v-chip v-if="!item.onaylandiMi" color="warning" :size="isMobile ? 'x-small' : 'small'" label variant="tonal"> <v-icon start
              size="small">mdi-clock-alert-outline</v-icon> Bekliyor </v-chip>
          <v-chip v-else-if="item.hazirlanmaDurumu === 'Hazırlandı'" color="indigo-lighten-1" :size="isMobile ? 'x-small' : 'small'" label
            variant="flat"> <v-icon start size="small">mdi-package-variant-closed-check</v-icon> Hazırlandı </v-chip>
          <v-chip v-else color="success" :size="isMobile ? 'x-small' : 'small'" label variant="tonal"> <v-icon start
              size="small">mdi-check-circle</v-icon> Onaylandı </v-chip>
        </template>

        <template v-slot:item.odemeDurumu="{ item }">
          <v-chip :color="getPaymentStatus(item).color" :size="isMobile ? 'x-small' : 'small'" label variant="tonal">
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
                @click.stop="openOrderDetail(item, true)"></v-btn> </template>
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
                                    @ {{ kalem.birimFiyat?.toFixed(2) || '?' }} ₺/{{ kalem.birim === 'Gram' ? 'KG' :
                                      kalem.birim }}
                                    <span v-if="getActivePrice(kalem) !== null" :class="getPriceDifferenceClass(kalem)"
                                      class="font-weight-medium">
                                      | Güncel: {{ getActivePrice(kalem) }} ₺
                                      <span v-if="hasPriceDifference(kalem)" class="text-caption">
                                        ({{ getPriceDifferenceText(kalem) }})
                                      </span>
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
                    <h4 class="text-subtitle-1 mb-3">Teslimat ve Kargo</h4>
                    <v-list density="compact" class="mb-3 elevation-1 rounded">
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Teslimat Türü</v-list-item-title>
                        <template v-slot:append>{{ item.teslimatTuru?.ad || '-' }}</template>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Teslim Adresi</v-list-item-title>
                        <v-list-item-subtitle class="text-wrap">{{ item.teslimatAdresi || '-' }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Teslim Şehir/İlçe</v-list-item-title>
                        <template v-slot:append>{{ [item.il, item.ilce].filter(Boolean).join(' / ') || '-' }}</template>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Teslim Tarih/Saat</v-list-item-title>
                        <template v-slot:append>{{ item.teslimTarihi ? formatDate(item.teslimTarihi, true) : '-' }} {{
                          item.teslimSaati || '' }}</template>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Kargo Durumu</v-list-item-title>
                        <template v-slot:append>{{ item.kargoDurumu || '-' }}</template>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title class="text-body-2">Kargo Şirketi/Takip</v-list-item-title>
                        <template v-slot:append>{{ [item.kargoSirketi, item.kargoTakipNo].filter(Boolean).join(' - ') ||
                          '-' }}</template>
                      </v-list-item>
                      <v-list-item v-if="item.subeNereden || item.subeNereye">
                        <v-list-item-title class="text-body-2">Şube Transfer</v-list-item-title>
                        <v-list-item-subtitle>{{ item.subeNereden?.ad || '-' }} → {{ item.subeNereye?.ad || '-'
                        }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                    <h4 class="text-subtitle-1 mb-3">Ödemeler ve Toplamlar</h4>
                    <v-list density="compact" class="mb-2 elevation-1 rounded">
                      <v-list-subheader>Yapılan Ödemeler</v-list-subheader>
                      <v-list-item v-for="odeme in item.odemeler" :key="odeme.id">
                        <v-list-item-title>{{ odeme.tutar.toFixed(2) }} ₺</v-list-item-title>
                        <v-list-item-subtitle>{{ formatDate(odeme.odemeTarihi, true) }} - {{ odeme.odemeYontemi || 'Belirtilmemiş' }}</v-list-item-subtitle>
                        <template #append>
                          <v-btn
                            v-if="canManagePayments"
                            icon="mdi-delete"
                            variant="text"
                            size="x-small"
                            color="error"
                            @click.stop="deletePayment(item.id, odeme.id)"
                            :title="'Ödemeyi Sil'"
                          />
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
                      <v-list-item class="text-caption"> <v-list-item-title class="text-right">KDV
                          Toplamı:</v-list-item-title>
                        <template v-slot:append>{{ (item.kdvToplam || calculateKdvTotal(item.kalemler)).toFixed(2) }}
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

    <!-- Order Detail Dialog (mobile/tablet only) -->
    <v-dialog v-model="orderDetailDialog" :fullscreen="isMobile" :max-width="isMobile ? 600 : 960">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-subtitle-1">Sipariş Detayı (ID: {{ selectedOrder?.id }})</span>
          <div class="d-flex align-center">
            <v-tooltip text="Ödeme Ekle" location="bottom">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-cash-plus" variant="text" color="teal"
                      @click.stop="openPaymentDialog(selectedOrder)" />
              </template>
            </v-tooltip>
            <v-tooltip text="Düzenle/Onayla" location="bottom">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-pencil" variant="text" color="primary"
                      @click.stop="isEditMode = true" />
              </template>
            </v-tooltip>
            <v-tooltip text="Sil" location="bottom">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-delete" variant="text" color="error"
                      @click.stop="selectedOrder && deleteOrder(selectedOrder.id)" />
              </template>
            </v-tooltip>
            <v-btn icon="mdi-close" variant="text" class="ml-1" @click="orderDetailDialog = false" />
          </div>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-3 order-dialog-content">
          <v-row dense>
            <v-col cols="12" md="8">
              <v-form>
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="editModel.tarih" type="date" label="Tarih" density="compact" :disabled="!isEditMode" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field :model-value="formatDate(selectedOrder?.tarih, true)" label="Görünen Tarih" density="compact" readonly />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field :model-value="selectedOrder?.gonderenAdi" label="Gönderen" density="compact" disabled />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field :model-value="selectedOrder?.gonderenTel" label="Gönderen Tel" density="compact" disabled />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field :model-value="selectedOrder?.aliciAdi || selectedOrder?.gorunecekAd" label="Alıcı" density="compact" disabled />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field :model-value="selectedOrder?.aliciTel" label="Alıcı Tel" density="compact" disabled />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea v-model="editModel.adres" label="Adres" rows="2" density="compact" :disabled="!isEditMode" />
                  </v-col>
                </v-row>
              </v-form>

              <v-divider class="my-2" />
              <h4 class="text-subtitle-2 mb-2">Kalemler</h4>
              <v-row dense>
                <v-col v-for="(paket, index) in groupItemsByPackage(selectedOrder?.kalemler || [])" :key="`dlg-paket-${selectedOrder?.id}-${index}`" cols="12">
                  <v-card variant="tonal">
                    <v-card-title class="text-body-2 d-flex align-center">
                      <v-icon start size="small">{{ getAmbalajIcon(paket.ambalajAdi) }}</v-icon>
                      <span>{{ paket.ambalajAdi }} {{ paket.specificPackageName ? `(${paket.specificPackageName})` : '' }}</span>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-list density="compact" class="bg-transparent py-0">
                      <v-list-item v-for="kalem in paket.urunler" :key="kalem.id">
                        <template #prepend><v-icon size="x-small" class="mr-2">{{ getUrunIcon(kalem.urun?.ad) }}</v-icon></template>
                        <v-list-item-title class="text-body-2 truncate">{{ kalem.urun?.ad }}</v-list-item-title>
                        <template #append>
                          <div v-if="isEditMode" class="d-flex align-center" style="gap:8px;">
                            <v-text-field
                              v-model.number="editedKalemler[kalem.id]"
                              type="number" min="0" step="0.1" hide-details density="compact"
                              style="max-width:90px"/>
                            <span class="text-caption">{{ kalem.birim }}</span>
                            <span class="text-caption">=
                              {{ (getEditedQty(kalem) * (Number(kalem.birimFiyat) || Number(getActivePrice(kalem)) || 0)).toFixed(2) }} ₺
                            </span>
                          </div>
                          <span v-else class="text-caption">{{ kalem.miktar }} {{ kalem.birim }} = {{ calculateItemTotal(kalem).toFixed(2) }} ₺</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="4">
              <h4 class="text-subtitle-2 mb-2">Ödemeler</h4>
              <v-list density="compact" class="mb-2">
                <v-list-item v-for="odeme in (selectedOrder?.odemeler || [])" :key="odeme.id">
                  <v-list-item-title>{{ odeme.tutar.toFixed(2) }} ₺</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(odeme.odemeTarihi, true) }} - {{ odeme.odemeYontemi || 'Belirtilmemiş' }}</v-list-item-subtitle>
                  <template #append>
                    <v-btn v-if="canManagePayments" icon="mdi-delete" variant="text" size="x-small" color="error"
                           @click.stop="selectedOrder && deletePayment(selectedOrder.id, odeme.id)" />
                  </template>
                </v-list-item>
                <v-list-item v-if="!selectedOrder?.odemeler || selectedOrder?.odemeler.length === 0">
                  <v-list-item-subtitle>Henüz ödeme yok.</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-divider class="my-1" />
              <div class="d-flex justify-space-between text-body-2"><span>Toplam</span><strong>{{ calculateGrandTotal(selectedOrder).toFixed(2) }} ₺</strong></div>
              <div class="d-flex justify-space-between text-body-2"><span>Ödenen</span><strong>{{ calculateTotalPaid(selectedOrder?.odemeler).toFixed(2) }} ₺</strong></div>
              <div class="d-flex justify-space-between text-body-2"><span>Kalan</span><strong>{{ (calculateGrandTotal(selectedOrder) - calculateTotalPaid(selectedOrder?.odemeler)).toFixed(2) }} ₺</strong></div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3" v-if="isEditMode">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="isEditMode = false">Vazgeç</v-btn>
          <v-btn color="primary" @click="saveOrderEdits" :loading="savingEdits">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, provide, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { apiCall } from '../utils/api';
import { createCustomVuetify } from '../plugins/vuetify';
import { formatDate } from '../utils/date';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

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
const isMobile = ref(false);
const isSmallDevice = ref(false);
const baseHeaders = [
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
];
const compactHeaders = [
  { title: 'ID', key: 'id', align: 'start', sortable: true },
  { title: 'Tarih', key: 'tarih', sortable: true },
  { title: 'Müşteri', key: 'musteri', value: item => item.gorunecekAd || item.gonderenAdi, sortable: true },
  { title: 'Toplam', key: 'genelToplam', value: item => calculateGrandTotal(item), sortable: true, align: 'end' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
];
const tableHeaders = computed(() => (isMobile.value ? compactHeaders : baseHeaders));
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

// Active Prices Map
const activePricesMap = ref({});
function normalizeUnit(u) {
  const s = String(u || '').toLowerCase();
  if (s === 'kg' || s === 'kilogram') return 'KG';
  if (s === 'gram' || s === 'gr' || s === 'g') return 'Gram';
  if (s === 'adet' || s === 'piece') return 'ADET';
  if (s === 'paket') return 'PAKET';
  if (s === 'kutu') return 'KUTU';
  if (s === 'tepsi') return 'TEPSI';
  if (s === 'litre' || s === 'ltr' || s === 'lt') return 'LITRE';
  if (s === 'ml' || s === 'mililitre') return 'ML';
  return u;
}

// Fetch active prices (latest for each product/unit)
async function fetchActivePrices() {
  try {
    const resp = await apiCall('/fiyatlar', { method: 'GET', useCache: false });
    const pricing = Array.isArray(resp?.pricing)
      ? resp.pricing
      : Array.isArray(resp?.data?.pricing)
        ? resp.data.pricing
        : Array.isArray(resp) ? resp : [];

    const latestByProduct = new Map();
    pricing.forEach(p => {
      if (!p || !p.urunId) return;
      const existing = latestByProduct.get(p.urunId);
      const thisStart = p.baslangicTarihi ? new Date(p.baslangicTarihi).getTime() : 0;
      const existStart = existing?.baslangicTarihi ? new Date(existing.baslangicTarihi).getTime() : -1;
      if (!existing || thisStart > existStart) latestByProduct.set(p.urunId, p);
    });

    const latestMap = {};
    latestByProduct.forEach(p => {
      const urunId = p.urunId;
      const kgPrice = Number(p.kgFiyati) || 0;
      // Anahtarları KG ve Gram için yaz
      latestMap[`${urunId}-KG`] = { urunId, birim: 'KG', fiyat: kgPrice, ad: p.urun?.ad };
      latestMap[`${urunId}-Gram`] = { urunId, birim: 'Gram', fiyat: kgPrice / 1000, ad: p.urun?.ad };
      // Eğer fiyat birimi ADET ise onu da ekle
      const unit = normalizeUnit(p.birim);
      if (unit === 'ADET' && kgPrice > 0) {
        latestMap[`${urunId}-ADET`] = { urunId, birim: 'ADET', fiyat: kgPrice, ad: p.urun?.ad };
      }
    });

    activePricesMap.value = latestMap;
    console.log('✅ Aktif ürün fiyatları yüklendi:', Object.keys(latestMap).length);
  } catch (err) {
    console.error('❌ Aktif fiyatlar çekilemedi:', err);
    activePricesMap.value = {};
  }
}

// API'den TÜM veriyi çekme fonksiyonu
async function fetchOrders() {
  loading.value = true; error.value = null; console.log('Fetching all orders...');
  try {
    const response = await apiCall('/orders');
    allOrders.value = Array.isArray(response?.orders) ? response.orders
      : Array.isArray(response) ? response
        : [];
    console.log('All orders loaded:', JSON.parse(JSON.stringify(allOrders.value)));
  } catch (err) { console.error('❌ Tüm Siparişler çekilemedi:', err.response?.data || err.message || err); error.value = `Siparişler yüklenirken bir hata oluştu: ${err.response?.data?.message || err.message}`; allOrders.value = []; }
  finally { loading.value = false; }
}

function updateIsMobile() {
  isMobile.value = window.matchMedia('(max-width: 600px)').matches;
  isSmallDevice.value = window.matchMedia('(max-width: 1264px)').matches;
}

onMounted(() => {
  fetchOrders();
  fetchActivePrices();
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
});
// Optional: cleanup (script setup runs once per mount)
// onUnmounted(() => window.removeEventListener('resize', updateIsMobile));

// Order detail dialog state and handlers
const orderDetailDialog = ref(false);
const selectedOrder = ref(null);
const isEditMode = ref(false);
const savingEdits = ref(false);
const editModel = reactive({
  tarih: '', adres: ''
});
const editedKalemler = reactive({});

function onRowClick(event, { item }) {
  if (isSmallDevice.value) {
    openOrderDetail(item,false);
  }
}

function openOrderDetail(order, edit = false) {
  selectedOrder.value = order;
  // initialize edit model
  editModel.tarih = (order?.tarih ? new Date(order.tarih).toISOString().slice(0,10) : '');
  editModel.adres = order?.adres || order?.teslimatAdresi || '';
  // init edited quantities map
  editedKalemlerClear();
  (order?.kalemler || []).forEach(k => { editedKalemler[k.id] = k.miktar; });
  isEditMode.value = !!edit;
  orderDetailDialog.value = true;
}

async function saveOrderEdits() {
  if (!selectedOrder.value) return;
  try {
    savingEdits.value = true;
    const payload = {
      tarih: editModel.tarih,
      adres: editModel.adres,
      kalemler: Object.entries(editedKalemler).map(([id, miktar]) => ({ id: Number(id), miktar: Number(miktar) }))
    };
    await apiCall(`/siparis/${selectedOrder.value.id}`, payload, 'PUT');
    // Reflect updates locally (do not overwrite kalemler structure)
    selectedOrder.value.tarih = payload.tarih;
    selectedOrder.value.adres = payload.adres;
    (selectedOrder.value.kalemler || []).forEach(k => {
      if (editedKalemler[k.id] !== undefined) {
        k.miktar = Number(editedKalemler[k.id]);
      }
    });
    const idx = allOrders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (idx > -1) {
      allOrders.value[idx].tarih = payload.tarih;
      allOrders.value[idx].adres = payload.adres;
      (allOrders.value[idx].kalemler || []).forEach(k => {
        if (editedKalemler[k.id] !== undefined) {
          k.miktar = Number(editedKalemler[k.id]);
        }
      });
    }
    isEditMode.value = false;
    showSnackbar('Sipariş güncellendi', 'success');
  } catch (err) {
    console.error('Order update failed:', err);
    showSnackbar(`Sipariş güncellenemedi: ${err?.response?.data?.error || err.message}`, 'error');
  } finally {
    savingEdits.value = false;
  }
}

function editedKalemlerClear() {
  Object.keys(editedKalemler).forEach(k => delete editedKalemler[k]);
}

function getEditedQty(kalem) {
  const val = editedKalemler[kalem.id];
  return typeof val === 'number' ? val : kalem.miktar;
}

// Fiyatları yenileme fonksiyonu
async function refreshPrices() {
  try {
    await fetchActivePrices();
    showSnackbar('Fiyatlar başarıyla yenilendi!', 'success');
  } catch (err) {
    showSnackbar('Fiyatlar yenilenirken hata oluştu!', 'error');
  }
}
// Ödeme silme yetkisi (RBAC): roleLevel >= 70 ödeme yönetimi için yeterli
const auth = useAuthStore();
const { roleLevel } = storeToRefs(auth);
const canManagePayments = computed(() => roleLevel.value >= 70);

async function deletePayment(orderId, paymentId) {
  if (!canManagePayments.value) {
    showSnackbar('Ödeme silme için yetkiniz yok (roleLevel ≥ 70 gerekir).', 'error');
    return;
  }
  try {
    await apiCall(`/siparis/${orderId}/odemeler/${paymentId}`, {}, 'DELETE');
    const orderIndex = allOrders.value.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
      const payIndex = (allOrders.value[orderIndex].odemeler || []).findIndex(p => p.id === paymentId);
      if (payIndex > -1) {
        allOrders.value[orderIndex].odemeler.splice(payIndex, 1);
      }
    }
    showSnackbar('Ödeme silindi.', 'success');
  } catch (err) {
    console.error('❌ Ödeme silinemedi:', err.response?.data || err.message || err);
    showSnackbar(`Ödeme silinirken hata: ${err.response?.data?.error || err.message}`, 'error');
  }
}


// --- Hesaplama Fonksiyonları ---
function calculateItemTotal(kalem) {
  if (!kalem || !kalem.birim) return 0;
  const qty = typeof kalem.miktar === 'number' ? kalem.miktar : parseFloat(kalem.miktar) || 0;
  let unitPrice = typeof kalem.birimFiyat === 'number' && kalem.birimFiyat > 0
    ? kalem.birimFiyat
    : (parseFloat(getActivePrice(kalem)) || 0);
  return qty * unitPrice;
}

function calculatePackageProductTotal(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return 0;
  return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0);
}

function calculateProductTotal(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return 0;
  return kalemler.reduce((total, kalem) => total + calculateItemTotal(kalem), 0);
}

function calculateProductSubtotal(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return 0;
  return kalemler.reduce((total, kalem) => {
    return total + (kalem.araToplam || 0);
  }, 0);
}

function calculateKdvTotal(kalemler) {
  if (!kalemler || !Array.isArray(kalemler)) return 0;
  return kalemler.reduce((total, kalem) => {
    return total + (kalem.kdvTutari || 0);
  }, 0);
}

function calculateTotalPaid(odemeler) {
  if (!odemeler || !Array.isArray(odemeler)) return 0;
  return odemeler.reduce((total, odeme) => total + (odeme.tutar || 0), 0);
}
// --- Hesaplama Fonksiyonları Sonu ---

// --- Ödeme Durumu Hesaplama ---
function getPaymentStatus(order) {
  if (!order) return { text: 'Bilinmiyor', color: 'grey', icon: 'mdi-help-circle-outline', textColor: 'text-grey' };
  const grandTotal = calculateGrandTotal(order);
  const totalPaid = calculateTotalPaid(order.odemeler);
  const remaining = grandTotal - totalPaid;
  const epsilon = 0.01;

  // Özel durumlar: toplam tutar yoksa veya ürün kalemi yoksa “Ödenmedi” göster
  if (grandTotal <= epsilon) {
    return { text: 'Ödenmedi', color: 'grey', icon: 'mdi-help-circle-outline', textColor: 'text-grey' };
  }

  if (totalPaid <= epsilon && grandTotal > epsilon) {
    return { text: 'Ödenmedi', color: 'error', icon: 'mdi-credit-card-off-outline', textColor: 'text-error' };
  }
  else if (remaining > epsilon) {
    return { text: 'Kısmen Ödendi', color: 'warning', icon: 'mdi-alert-circle-outline', textColor: 'text-warning' };
  }
  else {
    return { text: 'Ödeme Alındı', color: 'success', icon: 'mdi-check-decagram-outline', textColor: 'text-success' };
  }
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

function closePaymentDialog() {
  paymentDialog.value = false;
  orderForPayment.value = null;
}
async function savePayment() {
  if (!orderForPayment.value) return;
  const { valid: paymentFormIsValid } = await paymentFormRef.value.validate();
  if (!paymentFormIsValid) { showSnackbar('Lütfen ödeme tutarını doğru girin.', 'warning'); return; }

  paymentLoading.value = true;
  const orderId = orderForPayment.value.id;
  const payload = { tutar: newPayment.tutar, odemeYontemi: 'NAKIT', aciklama: newPayment.aciklama };
  console.log(`POST /api/siparis/${orderId}/odemeler gönderiliyor:`, payload);

  try {
    const resp = await apiCall(`/siparis/${orderId}/odemeler`, payload, 'POST');
    const yeniOdeme = resp?.payment || resp;
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
function editOrder(id) {
  console.log('Düzenle ID:', id);
  try {
    router.push({ name: 'SiparisFormu', query: { edit: '1', id: String(id) } });
  } catch (e) {
    showSnackbar('Sayfaya yönlendirme başarısız.', 'error');
  }
}
async function deleteOrder(id) {
  console.log('Sil ID:', id); /* Vue dialog ile onay alınmalı! */
  // if (!confirm(`${id} ID'li siparişi silmek istediğinizden emin misiniz?`)) return;
  const itemIndex = allOrders.value.findIndex(item => item.id === id);
  try {
    // Force delete if user has sufficient roleLevel (>= 70)
    const auth = useAuthStore();
    const { roleLevel } = storeToRefs(auth);
    const forceQuery = roleLevel.value >= 70 ? '?force=true' : '';
    await apiCall(`/siparis/${id}${forceQuery}`, {}, 'DELETE');
    showSnackbar('Sipariş başarıyla silindi.', 'success'); // Snackbar kullanıldı
    if (itemIndex > -1) { allOrders.value.splice(itemIndex, 1); }
  } catch (err) {
    console.error('❌ Sipariş silinemedi:', err.response?.data || err.message || err);
    const status = err?.response?.status;
    const message = err?.response?.data?.error || err?.response?.data?.message || err.message;
    if (status === 409) {
      showSnackbar('Bu siparişe ait ödemeler var. Yönetici yetkisi (roleLevel ≥ 70) ile tekrar deneyin ya da ödemeleri kaldırın.', 'warning', 6000);
    } else if (status === 403) {
      showSnackbar('Yetkisiz işlem. Force silme için roleLevel ≥ 70 gerekir.', 'error', 6000);
    } else {
      showSnackbar(`Sipariş silinirken hata oluştu: ${message}`, 'error');
    }
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
  // Aynı kutuId, tepsiTavaId olan kalemleri grupla
  const grouped = {};
  kalemler.forEach((kalem) => {
    const key = `${kalem.kutuId || 'none'}-${kalem.tepsiTavaId || 'none'}`;
    if (!grouped[key]) {
      // Ambalaj türünü belirle
      let ambalajAdi = 'Bilinmiyor';
      if (kalem.kutu?.ad) ambalajAdi = 'Kutu';
      else if (kalem.tepsiTava?.ad) ambalajAdi = 'Tepsi/Tava';

      grouped[key] = {
        key,
        ambalajAdi,
        specificPackageName: kalem.kutu?.ad || kalem.tepsiTava?.ad || '',
        tepsiTavaFiyat: 0, // Tepsi fiyatı artık ayrı tabloda
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

function getActivePrice(kalem) {
  const urunId = kalem?.urunId || kalem?.urun?.id;
  if (!urunId || !kalem?.birim) return null;
  const unit = normalizeUnit(kalem.birim);
  const directKey = `${urunId}-${unit}`;
  let priceObj = activePricesMap.value[directKey];
  if (!priceObj) {
    // KG/Gram dönüşümü dene
    if (unit === 'Gram') priceObj = activePricesMap.value[`${urunId}-KG`]?.fiyat ? { fiyat: activePricesMap.value[`${urunId}-KG`].fiyat / 1000 } : null;
    else if (unit === 'KG') priceObj = activePricesMap.value[`${urunId}-Gram`]?.fiyat ? { fiyat: activePricesMap.value[`${urunId}-Gram`].fiyat * 1000 } : null;
  }
  return priceObj ? Number(priceObj.fiyat).toFixed(2) : null;
}

function getPriceDifferenceClass(kalem) {
  if (!kalem.birimFiyat || !getActivePrice(kalem)) return 'text-blue-darken-2';
  const currentPrice = parseFloat(getActivePrice(kalem));
  const oldPrice = parseFloat(kalem.birimFiyat);
  const difference = currentPrice - oldPrice;
  if (Math.abs(difference) < 0.01) return 'text-blue-darken-2';
  if (difference > 0) return 'text-success';
  if (difference < 0) return 'text-error';
  return 'text-blue-darken-2';
}

function getPriceDifferenceText(kalem) {
  if (!kalem.birimFiyat || !getActivePrice(kalem)) return '';
  const currentPrice = parseFloat(getActivePrice(kalem));
  const oldPrice = parseFloat(kalem.birimFiyat);
  const difference = currentPrice - oldPrice;
  if (Math.abs(difference) < 0.01) return '';
  if (difference > 0) return `+${difference.toFixed(2)} ₺`;
  if (difference < 0) return `-${Math.abs(difference).toFixed(2)} ₺`;
  return '';
}

function hasPriceDifference(kalem) {
  if (!kalem.birimFiyat || !getActivePrice(kalem)) return false;
  const currentPrice = parseFloat(getActivePrice(kalem));
  const oldPrice = parseFloat(kalem.birimFiyat);
  const difference = currentPrice - oldPrice;
  return Math.abs(difference) > 0.01;
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

/* Order detail dialog improvements */
.order-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.order-dialog-content .v-text-field,
.order-dialog-content .v-textarea {
  margin-bottom: 8px;
}
</style>
