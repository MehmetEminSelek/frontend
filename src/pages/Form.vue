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
                <p class="text-h6 mb-0" style="color: #2E7D32; opacity: 0.8;">Yeni sipariş oluşturma ve paket yönetimi
                </p>
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
          <v-col cols="12" md="4" class="text-center d-flex flex-column align-center gap-3">
            <!-- Cache Status kaldırıldı -->
            <v-btn size="x-large" color="white" variant="elevated" @click="() => { }" class="font-weight-bold"
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
              <v-text-field v-model="form.gonderenAdi" label="Gönderen Adı" :rules="[rules.required]" variant="outlined"
                color="#388E3C" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.gonderenTel" label="Gönderen Tel" maxlength="11" :rules="[rules.phone]"
                placeholder="5xxxxxxxxx" variant="outlined" color="#388E3C" />
            </v-col>
            <template v-if="showAliciFields">
              <v-col cols="12" md="6">
                <v-autocomplete v-model="selectedCari" v-model:search="searchQuery" :items="filteredCariler"
                  item-title="displayName" item-value="id" return-object label="Alıcı Adı" clearable
                  no-data-text="Müşteri bulunamadı" placeholder="Müşteri adı arayın..."
                  @update:model-value="onCariSelected" @update:search="onSearchInput" variant="outlined"
                  color="#388E3C">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.displayName">
                      <template v-slot:prepend>
                        <v-avatar size="32" color="primary" class="mr-3">
                          <v-icon color="white" size="16">mdi-account</v-icon>
                        </v-avatar>
                      </template>
                      <v-list-item-title>
                        {{ item.raw.displayName }}
                        <v-chip v-if="item.raw.musteriKodu" size="x-small" variant="outlined" class="ml-2">
                          {{ item.raw.musteriKodu }}
                        </v-chip>
                      </v-list-item-title>
                      <v-list-item-subtitle v-if="item.raw.telefon">
                        <v-icon size="x-small" class="mr-1">mdi-phone</v-icon>
                        {{ item.raw.telefon }}
                      </v-list-item-subtitle>
                      <v-list-item-subtitle v-else class="text-grey">Telefon: -</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field ref="aliciTelRef" :key="selectedCari" :value="form.aliciTel"
                  @update:modelValue="onAliciTelInput" label="Alıcı Tel" maxlength="11" :rules="[rules.optionalPhone]"
                  persistent-placeholder variant="outlined" color="#388E3C" placeholder="5xxxxxxxxx" />
              </v-col>
            </template>
            <v-col cols="12">
              <div class="d-flex align-center justify-space-between mb-2">
                <label class="text-subtitle-2 font-weight-medium" style="color: #2E7D32;">Teslimat Adresi</label>
                <v-btn v-if="selectedCari && adresEnabled" size="small" variant="tonal" color="#388E3C"
                  prepend-icon="mdi-plus" @click="openAdresDialog">
                  Yeni Adres Ekle
                </v-btn>
              </div>

              <!-- Çoklu Adres Seçimi -->
              <template v-if="cariAdresler.length > 1">
                <div class="adresler-row-group mb-3">
                  <v-row dense>
                    <v-col v-for="(adres, i) in cariAdresler" :key="i" cols="12" md="6" lg="4">
                      <v-card :elevation="selectedAdres?.id === adres.id ? 8 : 2"
                        :class="['adres-row-card', { 'adres-row-selected': selectedAdres?.id === adres.id }]"
                        @click="selectAdres(adres)"
                        :style="selectedAdres?.id === adres.id ? 'border: 2px solid #388E3C; background: #E8F5E9;' : 'border: 1px solid #E0E0E0;'">
                        <div class="d-flex align-center justify-space-between pa-3">
                          <div class="flex-grow-1">
                            <div class="d-flex align-center mb-1">
                              <v-chip size="x-small" :color="getAdresTipColor(adres.tip)" class="mr-2">
                                {{ getAdresTipText(adres.tip) }}
                              </v-chip>
                              <v-chip v-if="adres.varsayilan" size="x-small" color="primary"
                                variant="tonal">Varsayılan</v-chip>
                            </div>
                            <div class="text-body-2" style="color: #4CAF50;">{{ adres.adres }}</div>
                            <div v-if="adres.tarif" class="text-caption text-grey-darken-1 mt-1">{{ adres.tarif }}</div>
                          </div>
                          <v-radio :model-value="selectedAdres?.id" :value="adres.id" color="#388E3C" />
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>
              </template>

              <!-- Tek Adres veya Manuel Adres Girişi -->
              <template v-else>
                <v-textarea v-model="form.adres" label="Teslimat Adresi" :disabled="!adresEnabled" rows="2"
                  variant="outlined" color="#388E3C"
                  :placeholder="cariAdresler.length === 0 ? 'Adres bilgisi giriniz...' : ''"
                  :hint="cariAdresler.length === 0 ? 'Bu müşteri için kayıtlı adres bulunamadı. Yeni adres eklemek için üstteki butonu kullanabilirsiniz.' : ''" />
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
            <p class="text-body-2 opacity-80 ma-0">Tepsi/Tava veya Kutu seçin ve içeriklerini düzenleyin</p>
          </div>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row>
          <!-- Tepsi/Tava Kartı -->
          <v-col cols="6" md="3">
            <v-card class="package-card pa-4 text-center" elevation="2"
              @click="openPackageDialog({ id: 'tepsi', ad: 'Tepsi/Tava' })"
              style="cursor: pointer; border: 1px solid #FFE0B2; transition: all 0.3s ease; border-radius: 12px;"
              :style="selectedPackageType === 'tepsi' ? 'background: #FFF3E0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);' : 'background: white;'">
              <v-icon size="48" :color="selectedPackageType === 'tepsi' ? '#E65100' : '#FF9800'" class="mb-3">
                mdi-silverware-fork-knife
              </v-icon>
              <h4 class="text-h6 font-weight-bold mb-2"
                :style="{ color: selectedPackageType === 'tepsi' ? '#E65100' : '#FF9800' }">
                Tepsi/Tava
              </h4>
              <p class="text-body-2" style="color: #757575;">Tepsi veya tava paketi oluşturun</p>
            </v-card>
          </v-col>

          <!-- Kutu Kartı -->
          <v-col cols="6" md="3">
            <v-card class="package-card pa-4 text-center" elevation="2"
              @click="openPackageDialog({ id: 'kutu', ad: 'Kutu' })"
              style="cursor: pointer; border: 1px solid #FFE0B2; transition: all 0.3s ease; border-radius: 12px;"
              :style="selectedPackageType === 'kutu' ? 'background: #FFF3E0; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);' : 'background: white;'">
              <v-icon size="48" :color="selectedPackageType === 'kutu' ? '#E65100' : '#FF9800'" class="mb-3">
                mdi-package-variant-closed
              </v-icon>
              <h4 class="text-h6 font-weight-bold mb-2"
                :style="{ color: selectedPackageType === 'kutu' ? '#E65100' : '#FF9800' }">
                Kutu
              </h4>
              <p class="text-body-2" style="color: #757575;">Kutu paketi oluşturun</p>
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
            <v-card class="package-summary-card h-100" elevation="1"
              style="border: 1px solid #E1BEE7; border-radius: 12px;">
              <v-card-title class="d-flex justify-space-between text-body-1 font-weight-medium pa-3"
                style="background: #F3E5F5; color: #4A148C; border-radius: 12px 12px 0 0;">
                <span>{{ pkg.packageName }} {{ pkg.specificPackageName ? `(${pkg.specificPackageName})` : '' }}</span>
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
                    <span class="text-body-2 font-weight-bold" style="color: #4A148C;">{{ item.miktar }} {{ item.birim
                    }}</span>
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
          <span class="text-h6">{{ currentPackage.packageName }} İçeriği</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <v-container>
            <v-row dense>
              <v-col cols="12" v-if="currentPackage.packageType === 'kutu'">
                <v-select v-model="currentPackage.kutuId" :items="dropdowns.kutular" item-title="ad" item-value="id"
                  label="Spesifik Kutu Tipi Seçin" :rules="[rules.required]" variant="outlined" />
              </v-col>
              <v-col cols="12" v-if="currentPackage.packageType === 'tepsi'">
                <v-select v-model="currentPackage.tepsiTavaId" :items="dropdowns.tepsiTavalar" item-title="ad"
                  item-value="id" label="Spesifik Tepsi/Tava Tipi Seçin" :rules="[rules.required]" variant="outlined" />
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

    <!-- Adres Ekleme Dialog -->
    <v-dialog v-model="adresDialog" persistent max-width="600px">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold d-flex align-center" style="background: #E8F5E9; color: #2E7D32;">
          <v-icon left color="#2E7D32">mdi-map-marker-plus</v-icon>
          Yeni Adres Ekle
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form ref="adresFormRef" v-model="adresFormValid">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select v-model="newAdres.tip" :items="adresTipleri" item-title="text" item-value="value"
                  label="Adres Tipi" :rules="[rules.required]" variant="outlined" color="#388E3C">
                  <template v-slot:prepend-inner>
                    <v-icon :color="getAdresTipColor(newAdres.tip)" size="small">
                      {{ getAdresTipIcon(newAdres.tip) }}
                    </v-icon>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="newAdres.varsayilan" label="Varsayılan Adres" color="#388E3C" hide-details
                  class="mt-2" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="newAdres.adres" label="Adres" :rules="[rules.required]" rows="3" variant="outlined"
                  color="#388E3C" placeholder="Tam adres bilgisini giriniz..." />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="newAdres.il" label="İl" variant="outlined" color="#388E3C" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="newAdres.ilce" label="İlçe" variant="outlined" color="#388E3C" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="newAdres.postaKodu" label="Posta Kodu" variant="outlined" color="#388E3C" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="newAdres.mahalle" label="Mahalle" variant="outlined" color="#388E3C" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="newAdres.tarif" label="Ek Açıklama/Tarif (Opsiyonel)" rows="2" variant="outlined"
                  color="#388E3C" placeholder="Adres tarifi, bina numarası, daire no vb..." />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeAdresDialog" :disabled="adresLoading">
            İptal
          </v-btn>
          <v-btn color="#388E3C" variant="flat" @click="saveAdres" :loading="adresLoading"
            prepend-icon="mdi-content-save">
            Adresi Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, provide, nextTick } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth.js';
// Cache sistemi kaldırıldı - artık direct API çağrıları kullanılıyor
// import CacheStatus from '../components/CacheStatus.vue';
// Custom Vuetify theme devre dışı (test için)
// import { createCustomVuetify } from '../plugins/vuetify';
// const siparisVuetify = createCustomVuetify({ themeName: 'siparisTheme' });
// provide('vuetify', siparisVuetify);

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

// Dropdown data management - cache kaldırıldı, direct API kullanılıyor
const dropdowns = ref({
  cariler: [],
  urunler: [],
  kategoriler: [],
  teslimatTurleri: [],
  aliciTipleri: [],
  odemeYontemleri: [],
  subeler: [],
  tepsiTavalar: [],
  kutular: []
})

const orderPackages = ref([]);
const isPackageDialogOpen = ref(false);
const selectedPackageType = ref(null); // 'tepsi' veya 'kutu'

const currentPackage = reactive({
  packageType: null, // 'tepsi' veya 'kutu'
  packageName: '',
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
const searchQuery = ref('');
const cariAdresler = ref([]);
const selectedAdres = ref(null);
const aliciTelRef = ref(null);
const successDialog = ref(false);

// Adres Dialog State
const adresDialog = ref(false);
const adresFormRef = ref(null);
const adresFormValid = ref(false);
const adresLoading = ref(false);
const newAdres = reactive({
  tip: 'EV',
  adres: '',
  il: '',
  ilce: '',
  mahalle: '',
  postaKodu: '',
  tarif: '',
  varsayilan: false
});

// Adres Tip Seçenekleri
const adresTipleri = [
  { text: 'Ev', value: 'EV' },
  { text: 'İş', value: 'IS' },
  { text: 'Diğer', value: 'DIGER' }
];

// Snackbar State
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}

// Dropdown refresh function - cache sisteminin yerine
async function refreshDropdowns() {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const authStore = useAuthStore();

    const response = await fetch(`${apiUrl}/dropdown`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Dropdown fetch failed');

    const result = await response.json();
    Object.assign(dropdowns.value, result.data);
    console.log('✅ Dropdown\'lar yenilendi');
  } catch (err) {
    console.error('❌ Dropdown loading error:', err);
  }
}

onMounted(async () => {
  await refreshDropdowns();
})

const selectedTeslimatTuru = computed(() => dropdowns.value.teslimatTurleri.find(t => t.id === form.teslimatTuruId));
const showSube = computed(() => selectedTeslimatTuru.value?.ad === 'Şubeden Teslim');

const selectedGonderenTipi = computed(() => dropdowns.value.aliciTipleri.find(t => t.id === form.gonderenTipiId));
const showAliciFields = computed(() => selectedGonderenTipi.value?.ad === 'Gönderen ve Alıcı');

const adresEnabled = computed(() => {
  const teslimatAdi = selectedTeslimatTuru.value?.ad;
  return ['Evine Gönderilecek', 'Mtn', 'Otobüs', 'Yurtiçi Kargo'].includes(teslimatAdi);
});

// Cari listesi için computed property
const filteredCariler = computed(() => {
  if (!dropdowns.value.cariler || dropdowns.value.cariler.length === 0) return [];

  // Her cari için displayName ekle
  return dropdowns.value.cariler.map(cari => ({
    ...cari,
    displayName: `${cari.ad} ${cari.soyad || ''}`.trim()
  })).filter(cari => {
    if (!searchQuery.value) return true;

    const query = searchQuery.value.toLowerCase();
    const searchFields = [
      cari.ad || '',
      cari.soyad || '',
      cari.displayName || '',
      cari.telefon || '',
      cari.musteriKodu || ''
    ];

    return searchFields.some(field =>
      field.toString().toLowerCase().includes(query)
    );
  });
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

function openPackageDialog(packageInfo) {
  if (!packageInfo) return;
  currentPackage.packageType = packageInfo.id; // 'tepsi' veya 'kutu'
  currentPackage.packageName = packageInfo.ad;
  currentPackage.kutuId = null;
  currentPackage.tepsiTavaId = null;
  currentPackage.urunler = [];
  selectedPackageType.value = packageInfo.id;
  newItemInPackage.value = { urunId: null, urunAdi: '', miktar: null, birim: 'Gram' };
  isPackageDialogOpen.value = true;
}

function addItemToCurrentPackage() {
  const selectedUrun = dropdowns.value.urunler.find(u => u.id === newItemInPackage.value.urunId);
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
  if (currentPackage.packageType === 'kutu') return !!currentPackage.kutuId;
  if (currentPackage.packageType === 'tepsi') return !!currentPackage.tepsiTavaId;
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
  if (currentPackage.kutuId) {
    specificName = dropdowns.value.kutular.find(k => k.id === currentPackage.kutuId)?.ad || '';
  }
  else if (currentPackage.tepsiTavaId) {
    specificName = dropdowns.value.tepsiTavalar.find(t => t.id === currentPackage.tepsiTavaId)?.ad || '';
  }

  const packageToAdd = JSON.parse(JSON.stringify(currentPackage));
  packageToAdd.specificPackageName = specificName;
  orderPackages.value.push(packageToAdd);
  isPackageDialogOpen.value = false;
  selectedPackageType.value = null;
  showSnackbar('Paket başarıyla eklendi!', 'success');
}

function removeOrderPackage(index) { orderPackages.value.splice(index, 1); }

function getUrunIcon(urunAdi) {
  if (!urunAdi) return 'mdi-help-circle-outline';
  if (urunAdi.toLowerCase().includes('baklava')) return 'mdi-diamond-stone';
  if (urunAdi.toLowerCase().includes('börek')) return 'mdi-chart-pie';
  if (urunAdi.toLowerCase().includes('kadayıf')) return 'mdi-noodles';
  return 'mdi-food-variant';
}

function onSearchInput(value) {
  console.log('🔍 Search input:', value);
  searchQuery.value = value || '';
}

function onCariSelected(cari) {
  console.log('🎯 Cari selected:', cari);

  if (cari && typeof cari === 'object') {
    // return-object kullandığımız için cari artık tam bir object
    form.aliciAdi = cari.displayName || `${cari.ad} ${cari.soyad || ''}`.trim();
    form.aliciTel = cari.telefon || '';

    // Adres sistemini yenile
    if (cari.adresler && cari.adresler.length > 0) {
      cariAdresler.value = cari.adresler;

      // Varsayılan adresi seç, yoksa ilkini seç
      const varsayilanAdres = cari.adresler.find(a => a.varsayilan);
      const secilenAdres = varsayilanAdres || cari.adresler[0];

      selectedAdres.value = secilenAdres;
      form.adres = secilenAdres.adres;
    } else {
      cariAdresler.value = [];
      selectedAdres.value = null;
      form.adres = cari.adres || ''; // Fallback olarak ana adres
    }

    // Search query'yi seçilen isimle güncelle
    searchQuery.value = cari.displayName;

    nextTick(() => {
      if (aliciTelRef.value) {
        aliciTelRef.value.focus();
        aliciTelRef.value.blur();
      }
    });
  } else if (!cari) {
    // Temizleme
    form.aliciAdi = '';
    form.aliciTel = '';
    form.adres = '';
    cariAdresler.value = [];
    selectedAdres.value = null;
    searchQuery.value = '';
  }
}

function onAdresSelected(adres) {
  form.adres = adres;
}

async function onCariBlur() {
  // Eğer yazılan isim mevcut carilerde yoksa yeni müşteri oluştur
  const girilenAd = searchQuery.value?.trim();
  if (!girilenAd || selectedCari.value) return; // Zaten seçili bir cari varsa işlem yapma

  // Basit arama - mevcut carilerde var mı kontrol et
  const mevcutCari = filteredCariler.value.find(c =>
    c.displayName.toLowerCase() === girilenAd.toLowerCase() ||
    c.ad.toLowerCase() === girilenAd.toLowerCase()
  );

  if (!mevcutCari) {
    // Yeni müşteri oluştur
    try {
      const authStore = useAuthStore();
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cari`,
        { cariAdi: girilenAd, telefon: '0000000000', musteriKodu: `AUTO-${Date.now()}` },
        {
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (data && data.id) {
        // Tam ad bilgisini oluştur
        const newCariData = {
          ...data,
          displayName: `${data.ad} ${data.soyad || ''}`.trim(),
          adresler: data.adresler || []
        };

        // Dropdown'ları yenile (yeni cari için)
        await refreshDropdowns();

        // Yeni cariyi seç
        selectedCari.value = newCariData;
        form.aliciAdi = newCariData.displayName;
        form.aliciTel = data.telefon || '';

        // Adres sistemini güncelle
        if (data.adresler && data.adresler.length > 0) {
          cariAdresler.value = data.adresler;
          const varsayilanAdres = data.adresler.find(a => a.varsayilan) || data.adresler[0];
          selectedAdres.value = varsayilanAdres;
          form.adres = varsayilanAdres.adres;
        } else {
          cariAdresler.value = [];
          selectedAdres.value = null;
          form.adres = data.adres || '';
        }

        showSnackbar('Yeni müşteri oluşturuldu ve seçildi.', 'success');
      }
    } catch (err) {
      console.error('Yeni müşteri oluşturma hatası:', err);
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
    aliciAdi: form.aliciAdi || '',
    aliciTel: form.aliciTel,
    adres: form.adres,
    aciklama: form.aciklama,
    kalemler: siparisPayload,  // Backend 'kalemler' bekliyor
    gorunecekAd: aliciGondericiAdi || form.gonderenAdi,
    subeNeredenId: form.subeNeredenId,
    subeNereyeId: form.subeNereyeId
  };
  console.log('Gönderilecek Payload:', JSON.stringify(payload, null, 2));
  try {
    console.log('🚀 Sipariş API çağrısı başlıyor...');
    const authStore = useAuthStore();
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/siparis`, payload, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Sipariş kaydedildi:', data);
    successDialog.value = true;
  } catch (err) {
    console.error('❌ SIPARIŞ API HATASI:');
    console.error('Status:', err.response?.status);
    console.error('Response Data:', err.response?.data);
    console.error('Full Error:', err);
    showSnackbar(`Sipariş gönderilirken hata oluştu: ${err.response?.data?.message || err.message}`, 'error');
  }
}

function selectAdres(adres) {
  selectedAdres.value = adres;
  form.adres = adres.adres;
}

// Adres Dialog Fonksiyonları
function openAdresDialog() {
  if (!selectedCari.value) {
    showSnackbar('Önce bir müşteri seçmelisiniz.', 'warning');
    return;
  }

  // Form temizle
  newAdres.tip = 'EV';
  newAdres.adres = '';
  newAdres.il = '';
  newAdres.ilce = '';
  newAdres.mahalle = '';
  newAdres.postaKodu = '';
  newAdres.tarif = '';
  newAdres.varsayilan = cariAdresler.value.length === 0; // İlk adres ise varsayılan yap

  adresDialog.value = true;
}

function closeAdresDialog() {
  adresDialog.value = false;
}

async function saveAdres() {
  const { valid } = await adresFormRef.value.validate();
  if (!valid) {
    showSnackbar('Lütfen zorunlu alanları doldurun.', 'warning');
    return;
  }

  adresLoading.value = true;

  try {
    const authStore = useAuthStore();
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/cari/${selectedCari.value?.id || selectedCari.value}/adres`,
      newAdres,
      {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const yeniAdres = response.data;

    // Adres listesini güncelle
    cariAdresler.value.push(yeniAdres);

    // Eğer varsayılan adres ise diğerlerini güncelle
    if (yeniAdres.varsayilan) {
      cariAdresler.value.forEach(a => {
        if (a.id !== yeniAdres.id) a.varsayilan = false;
      });
    }

    // Yeni adresi seç
    selectedAdres.value = yeniAdres;
    form.adres = yeniAdres.adres;

    // Cari dropdown'ındaki veriyi de güncelle
    const cari = dropdowns.value.cariler.find(c => c.id === selectedCari.value);
    if (cari) {
      if (!cari.adresler) cari.adresler = [];
      cari.adresler.push(yeniAdres);
    }

    showSnackbar('Adres başarıyla eklendi!', 'success');
    closeAdresDialog();

  } catch (error) {
    console.error('Adres ekleme hatası:', error);
    showSnackbar(
      `Adres eklenirken hata oluştu: ${error.response?.data?.error || error.message}`,
      'error'
    );
  } finally {
    adresLoading.value = false;
  }
}

// Adres Tip Yardımcı Fonksiyonları
function getAdresTipText(tip) {
  switch (tip) {
    case 'EV': return 'Ev';
    case 'IS': return 'İş';
    case 'DIGER': return 'Diğer';
    default: return tip;
  }
}

function getAdresTipColor(tip) {
  switch (tip) {
    case 'EV': return 'green';
    case 'IS': return 'blue';
    case 'DIGER': return 'orange';
    default: return 'grey';
  }
}

function getAdresTipIcon(tip) {
  switch (tip) {
    case 'EV': return 'mdi-home';
    case 'IS': return 'mdi-briefcase';
    case 'DIGER': return 'mdi-map-marker';
    default: return 'mdi-map-marker';
  }
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
  searchQuery.value = '';
  cariAdresler.value = [];
  selectedAdres.value = null;
  selectedPackageType.value = null;
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
