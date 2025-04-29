<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="220">
        <v-list nav dense>
          <v-list-item title="OGS Panel" class="text-h6 font-weight-bold" />
          <v-divider class="my-2"></v-divider> <v-list-item to="/main/form" title="📋 Sipariş Formu" link
            prepend-icon="mdi-clipboard-edit-outline"></v-list-item> <v-list-item to="/main/orders"
            title="📦 Siparişler" link prepend-icon="mdi-package-variant-closed"></v-list-item><v-list-item
            to="/main/allorders" title="📚 Tüm Siparişler" link prepend-icon="mdi-book-open-page-variant"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main class="bg-grey-lighten-4"> <v-container fluid class="pa-4"> <v-app-bar-nav-icon class="d-md-none mb-2"
            @click="drawer = !drawer" v-if="isMobile"></v-app-bar-nav-icon>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'

const drawer = ref(true) // Başlangıçta açık (masaüstü için)
const isMobile = ref(false)

function updateScreen() {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 960; // Vuetify'ın md breakpoint'i
  // Sadece mobil/masaüstü geçişinde drawer durumunu ayarla
  if (wasMobile !== isMobile.value) {
    drawer.value = !isMobile.value;
  }
}

onMounted(() => {
  updateScreen(); // İlk yüklemede durumu ayarla
  window.addEventListener('resize', updateScreen);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen);
})
</script>

<style scoped>
/* İsteğe bağlı: Sayfa içeriği için hafif fade efekti */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Main content alanına hafif bir arka plan */
.v-main {
  background-color: #f30000;
  /* Vuetify'ın grey-lighten-4 rengi gibi */
}
</style>
