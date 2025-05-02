<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="260">
        <v-list nav density="comfortable">
          <v-list-item title="OGS Panel" class="text-h6 font-weight-bold mb-1" /> <v-divider class="mb-2"></v-divider>

          <v-list-item to="/main/form" title="Sipariş Formu" link prepend-icon="mdi-clipboard-edit-outline"
            :active="isActive('/main/form')" class="main-nav-item"></v-list-item>

          <v-list-group value="Siparisler">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-cart-outline" title="Sipariş Yönetimi"
                class="main-nav-item"></v-list-item>
            </template>

            <v-list-item to="/main/orders" title="Onay Bekleyenler" link prepend-icon="mdi-clock-alert-outline"
              :active="isActive('/main/orders')" class="sub-nav-item"></v-list-item>
            <v-list-item to="/main/hazirlanacak" title="Hazırlanacaklar" link prepend-icon="mdi-food-fork-drink"
              :active="isActive('/main/hazirlanacak')" class="sub-nav-item"></v-list-item>
            <v-list-item to="/main/allorders" title="Tüm Siparişler" link prepend-icon="mdi-format-list-bulleted"
              :active="isActive('/main/allorders')" class="sub-nav-item"></v-list-item>
          </v-list-group>

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
  background-color: #f5f5f5;
}

/* Sidebar Link Stilleri */
.main-nav-item .v-list-item-title {
  font-size: 0.9rem;
  /* Ana linklerin yazı boyutunu biraz küçült */
  font-weight: 500;
  /* Orta kalınlık */
}

.sub-nav-item .v-list-item-title {
  font-size: 0.85rem;
  /* Alt linklerin yazı boyutunu biraz daha küçült */
}

/* Aktif olmayan ikon rengi (Grup başlığı hariç) */
.v-list-item:not(.v-list-item--active):not(.v-list-group__header) .v-icon {
  color: rgba(255, 255, 255, 0.6) !important;
  /* Biraz daha soluk */
  opacity: 0.8;
}

/* Aktif linkin ikon rengi */
.v-list-item--active .v-icon {
  color: white !important;
  /* Aktifken tam beyaz */
}

/* Grup içindeki linklerin girintisi */
.sub-nav-item {
  padding-inline-start: 32px !important;
  /* Girintiyi biraz azalt */
}
</style>
