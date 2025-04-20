<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="220">
        <v-list nav dense>
          <v-list-item title="OGS Panel" class="text-h10 font-weight-bold" />
          <v-list-item to="/main/form" title="📋 Sipariş Formu" link />
          <v-list-item to="/main/orders" title="📦 Siparişler" link />
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main>
        <v-container fluid class="py-4 px-4">
          <v-btn icon class="d-md-none mb-4" @click="drawer = !drawer" v-if="isMobile">
            <v-icon>mdi-menu</v-icon>
          </v-btn>
          <router-view />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const drawer = ref(true)
const isMobile = ref(false)

function updateScreen() {
  isMobile.value = window.innerWidth < 960
  drawer.value = !isMobile.value // Close by default on mobile
}

onMounted(() => {
  updateScreen()
  window.addEventListener('resize', updateScreen)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen)
})
</script>
