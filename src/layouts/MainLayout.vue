<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="260" :scrim="isMobile ? 'rgba(0,0,0,0.35)' : false"
        :touchless="!isMobile" @click:outside="onDrawerOutsideClick" @update:model-value="onDrawerUpdate">
        <v-list nav density="comfortable">
          <v-list-item title="OGS Panel" class="text-h6 font-weight-bold mb-1" /> <v-divider class="mb-2"></v-divider>

          <v-list-item to="/main/form" title="Sipariş Formu" link prepend-icon="mdi-clipboard-edit-outline"
            :active="isActive('/main/form')" class="main-nav-item" @click="onMenuClick"></v-list-item>

          <v-list-group value="Siparisler">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-cart-outline" title="Sipariş Yönetimi" class="main-nav-item"
                @click="onMenuClick"></v-list-item>
            </template>

            <v-list-item to="/main/orders" title="Onay Bekleyenler" link prepend-icon="mdi-clock-alert-outline"
              :active="isActive('/main/orders')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
            <v-list-item to="/main/hazirlanacak" title="Hazırlanacaklar" link prepend-icon="mdi-food-fork-drink"
              :active="isActive('/main/hazirlanacak')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
            <v-list-item to="/main/allorders" title="Tüm Siparişler" link prepend-icon="mdi-format-list-bulleted"
              :active="isActive('/main/allorders')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
          </v-list-group>

          <v-list-item to="/main/cari-yonetimi" title="Cari Yönetimi" link prepend-icon="mdi-account-cash"
            :active="isActive('/main/cari-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>

          <v-list-item to="/main/stok-yonetimi" title="Stok Yönetimi" link prepend-icon="mdi-warehouse"
            :active="isActive('/main/stok-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/kullanici-yonetimi" title="Kullanıcı Yönetimi" link
            prepend-icon="mdi-account-group" :active="isActive('/main/kullanici-yonetimi')" class="main-nav-item"
            @click="onMenuClick"></v-list-item>
          <v-list-item to="/main/fiyatyonetimi" title="Fiyat Yönetimi" link prepend-icon="mdi-clipboard-edit-outline"
            :active="isActive('/main/fiyatlar')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/recete-yonetimi" title="Reçete Yönetimi" link
            prepend-icon="mdi-food-apple" :active="isActive('/main/recete-yonetimi')" class="main-nav-item"
            @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/uretim-plani" title="Üretim Planı" link prepend-icon="mdi-factory"
            :active="isActive('/main/uretim-plani')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/satis-raporu" title="Satış Raporu" link prepend-icon="mdi-chart-bar"
            :active="isActive('/main/satis-raporu')" class="main-nav-item" @click="onMenuClick"></v-list-item>

        </v-list>
      </v-navigation-drawer>

      <v-main class="bg-grey-lighten-4">
        <v-container fluid class="pa-4">
          <v-app-bar-nav-icon class="d-md-none mb-2" @click="drawer = !drawer" v-if="isMobile"></v-app-bar-nav-icon>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in" appear>
              <component :is="Component" />
            </transition>
          </router-view>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const drawer = ref(true);
const isMobile = ref(false);
const route = useRoute();
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user && user.role === 'admin';

function updateScreen() {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 960;
  if (wasMobile !== isMobile.value) {
    drawer.value = !isMobile.value;
  }
}

function isActive(path) {
  // Aktif rotayı kontrol et (başlangıç kontrolü kaldırıldı, tam eşleşme veya alt rota kontrolü)
  return route.path === path || route.path.startsWith(path + '/');
}

function onDrawerOutsideClick() {
  if (isMobile.value) drawer.value = false;
}

function onDrawerUpdate(val) {
  // Drawer açılıp kapanınca odak kaybı veya başka bir şey yapılacaksa burada yönetilebilir
}

function onMenuClick() {
  if (isMobile.value) drawer.value = false;
}

onMounted(() => {
  updateScreen();
  window.addEventListener('resize', updateScreen);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen);
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-main {
  background: linear-gradient(135deg, #F4F8F3 0%, #E9D8A6 100%);
  min-height: 100vh;
  /* Hafif baklava deseni için SVG background (isteğe bağlı) */
  /* background-image: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="40" height="40" fill="%23F4F8F3"/><path d="M0 20L20 0L40 20L20 40L0 20Z" fill="%23E9D8A6" fill-opacity="0.08"/></svg>'); */
}

.v-navigation-drawer {
  background: linear-gradient(135deg, #7BAE7F 0%, #A3C9A8 100%);
  color: #fff;
}

.v-card {
  background: #FFFFFFCC;
  /* Hafif transparan beyaz, kartları yumuşatır */
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(123, 174, 127, 0.08);
}

.main-nav-item .v-list-item-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.sub-nav-item .v-list-item-title {
  font-size: 0.85rem;
}

.v-list-item:not(.v-list-item--active):not(.v-list-group__header) .v-icon {
  color: rgba(255, 255, 255, 0.6) !important;
  opacity: 0.8;
}

.v-list-item--active .v-icon {
  color: #E9D8A6 !important;
}

.sub-nav-item {
  padding-inline-start: 32px !important;
}
</style>
