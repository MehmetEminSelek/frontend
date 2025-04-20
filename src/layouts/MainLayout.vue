<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="220">
        <v-list nav dense>
          <v-list-item title="OGS Panel" class="text-h6 font-weight-bold" />
          <v-list-item to="/main/form" title="📋 Sipariş Formu" link />
          <v-list-item to="/main/orders" title="📦 Siparişler" link />
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main>
        <v-container fluid class="pa-0">
          <v-btn icon class="d-md-none mt-2 ml-2" @click="drawer = !drawer" v-if="isMobile">
            <v-icon>mdi-menu</v-icon>
          </v-btn>

          <!-- SLIDING CONTENT ONLY -->
          <transition name="slide" mode="out-in">
            <router-view v-slot="{ Component }">
              <component :is="Component" />
            </router-view>
          </transition>
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
  drawer.value = !isMobile.value
}

onMounted(() => {
  updateScreen()
  window.addEventListener('resize', updateScreen)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease;
  position: relative;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
