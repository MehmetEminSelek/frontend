<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="bg-grey-darken-4 text-white" width="260" :scrim="isMobile ? 'rgba(0,0,0,0.35)' : false"
        :touchless="!isMobile" @click:outside="onDrawerOutsideClick" @update:model-value="onDrawerUpdate">
        <v-list nav density="comfortable">
          <v-list-item title="OGS Panel" class="text-h6 font-weight-bold mb-1" /> <v-divider class="mb-2"></v-divider>

          <v-list-item to="/main/form" title="Sipariş Formu" link prepend-icon="mdi-clipboard-text-outline"
            :active="isActive('/main/form')" class="main-nav-item" @click="onMenuClick"></v-list-item>

          <v-list-group value="Siparisler">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-layers-outline" title="Sipariş Yönetimi"
                class="main-nav-item" @click="onMenuClick"></v-list-item>
            </template>

            <v-list-item to="/main/orders" title="Onay Bekleyenler" link prepend-icon="mdi-clock-outline"
              :active="isActive('/main/orders')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
            <v-list-item to="/main/hazirlanacak" title="Hazırlanacaklar" link prepend-icon="mdi-chef-hat"
              :active="isActive('/main/hazirlanacak')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
            <v-list-item to="/main/allorders" title="Tüm Siparişler" link prepend-icon="mdi-format-list-text"
              :active="isActive('/main/allorders')" class="sub-nav-item" @click="onMenuClick"></v-list-item>
          </v-list-group>

          <v-list-item :to="{ name: 'CariYonetimi' }" title="Cari Yönetimi" link prepend-icon="mdi-account-cash-outline"
            :active="isActive('/main/cari-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>

          <v-list-item to="/main/urun-yonetimi" title="Ürün Yönetimi" link prepend-icon="mdi-package-variant"
            :active="isActive('/main/urun-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>

          <v-list-item to="/main/stok-yonetimi" title="Stok Yönetimi" link prepend-icon="mdi-archive-outline"
            :active="isActive('/main/stok-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item to="/main/kargo-yonetimi" title="Kargo Yönetimi" link prepend-icon="mdi-truck-outline"
            :active="isActive('/main/kargo-yonetimi')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/kullanici-yonetimi" title="Kullanıcı Yönetimi" link
            prepend-icon="mdi-account-group-outline" :active="isActive('/main/kullanici-yonetimi')"
            class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item to="/main/fiyatyonetimi" title="Fiyat Yönetimi" link prepend-icon="mdi-currency-usd"
            :active="isActive('/main/fiyatlar')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/recete-yonetimi" title="Reçete Yönetimi" link
            prepend-icon="mdi-receipt-text-outline" :active="isActive('/main/recete-yonetimi')" class="main-nav-item"
            @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/uretim-plani" title="Üretim Planı" link prepend-icon="mdi-factory"
            :active="isActive('/main/uretim-plani')" class="main-nav-item" @click="onMenuClick"></v-list-item>
          <v-list-item v-if="isAdmin" to="/main/satis-raporu" title="Satış Raporu" link prepend-icon="mdi-chart-line"
            :active="isActive('/main/satis-raporu')" class="main-nav-item" @click="onMenuClick"></v-list-item>

        </v-list>
      </v-navigation-drawer>

      <!-- Top App Bar -->
      <v-app-bar v-if="currentUser" app color="white" elevation="1" height="64">
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title class="d-none d-md-flex align-center">
          <img src="../logos/omergullulogo.png" height="40" class="mr-3" alt="Logo" />
          <span class="text-h6 font-weight-medium">Ömer Güllü Sistemi</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Real-time Status & Notifications -->
        <div class="d-flex align-center">
          <!-- Real-time Connection Status -->
          <v-chip :color="realtimeStore.isConnected ? 'success' : 'error'" size="small" class="mr-3" variant="flat">
            <v-icon start size="16">
              {{ realtimeStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}
            </v-icon>
            {{ realtimeStore.isConnected ? 'Canlı' : 'Offline' }}
          </v-chip>

          <!-- Notification Panel -->
          <NotificationPanel class="mr-3" />

          <!-- User Menu -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text" class="mr-2">
                <v-avatar color="primary" size="36">
                  <span class="text-white">{{ currentUser.ad?.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <span class="ml-2 d-none d-sm-inline">{{ currentUser.ad }}</span>
                <v-icon class="ml-1">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item>
                <v-list-item-title>{{ currentUser.ad }}</v-list-item-title>
                <v-list-item-subtitle>{{ currentUser.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="handleLogout">
                <template v-slot:prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
                <v-list-item-title>Çıkış Yap</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-app-bar>

      <v-main class="bg-grey-lighten-4">
        <v-container fluid class="pa-4">
          <!-- Mobile drawer trigger (only when no app bar) -->
          <v-app-bar-nav-icon v-if="!currentUser && isMobile" class="d-md-none mb-2"
            @click="drawer = !drawer"></v-app-bar-nav-icon>

          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in" appear>
              <component :is="Component" />
            </transition>
          </router-view>

          <!-- Login button (only when not logged in) -->
          <div v-if="!currentUser" style="position:fixed;left:24px;bottom:24px;z-index:2000;">
            <v-btn icon size="large" color="primary" @click="loginDialog = true">
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </div>
          <!-- Login Dialog -->
          <v-dialog v-model="loginDialog" max-width="400">
            <v-card>
              <v-card-title class="text-h6">Giriş Yap</v-card-title>
              <v-card-text>
                <v-text-field v-model="loginForm.email" label="Kullanıcı Adı veya Email"
                  placeholder="Kullanıcı Adı veya Email" prepend-inner-icon="mdi-account" required autofocus />
                <v-text-field v-model="loginForm.password" label="Şifre" placeholder="Şifre"
                  prepend-inner-icon="mdi-lock" type="password" required />
                <v-alert v-if="loginError" type="error" dense class="mt-2">{{ loginError }}</v-alert>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn text @click="loginDialog = false">İptal</v-btn>
                <v-btn color="success" @click="handleLogin" :loading="loginLoading">GİRİŞ YAP</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useRealtimeStore } from '../stores/realtime.js';
// import { socketService } from '../composables/useSocket.js'; // Socket.IO disabled
import NotificationPanel from '../components/NotificationPanel.vue';

const drawer = ref(true);
const isMobile = ref(false);
const route = useRoute();
const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = computed(() => user && (user.role === 'admin' || user.role === 'superadmin'));
const loginDialog = ref(false);
const loginForm = ref({ email: '', password: '' });
const loginError = ref('');
const loginLoading = ref(false);
const currentUser = ref(JSON.parse(localStorage.getItem('user') || 'null'));
const realtimeStore = useRealtimeStore();

function updateScreen() {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth < 960;
  if (wasMobile !== isMobile.value) {
    drawer.value = !isMobile.value;
  }
}

function isActive(path) {
  if (!route.path || !path) return false;
  const currentPath = route.path.toLowerCase();
  const targetPath = path.toLowerCase();
  return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
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

async function handleLogin() {
  loginError.value = '';
  loginLoading.value = true;
  try {
    const res = await axios.post('/api/auth/login', loginForm.value);
    if (res.data && res.data.user && res.data.token) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      currentUser.value = res.data.user;
      loginDialog.value = false;

      // Socket.IO temporarily disabled
      // socketService.connect();

      window.location.reload();
    } else {
      loginError.value = 'Giriş başarısız.';
    }
  } catch (e) {
    loginError.value = e.response?.data?.message || 'Giriş başarısız.';
  } finally {
    loginLoading.value = false;
  }
}

function handleLogout() {
  // Socket.IO temporarily disabled
  // socketService.disconnect();

  localStorage.removeItem('user');
  localStorage.removeItem('token');
  currentUser.value = null;
  window.location.reload();
}

onMounted(() => {
  updateScreen();
  window.addEventListener('resize', updateScreen);

  // Socket.IO temporarily disabled
  // if (currentUser.value) {
  //   socketService.connect();
  // }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen);
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.v-main {
  background: linear-gradient(135deg, #F8F4E6 0%, #E5C297 50%, #D4A574 100%);
  min-height: 100vh;
  /* Baklava layers pattern için SVG background */
  background-image: url('data:image/svg+xml;utf8,<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="60" height="60" fill="%23F8F4E6"/><path d="M0 30L30 0L60 30L30 60L0 30Z" fill="%23D4A574" fill-opacity="0.05"/><path d="M15 30L30 15L45 30L30 45L15 30Z" fill="%23B8956A" fill-opacity="0.03"/></svg>');
  background-size: 60px 60px;
}

.v-navigation-drawer {
  background: linear-gradient(135deg, #D4A574 0%, #B8956A 100%);
  color: #fff;
}

.v-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(212, 165, 116, 0.15);
}

.modern-card {
  border: 1px solid rgba(212, 165, 116, 0.1);
}

.main-nav-item .v-list-item-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.sub-nav-item .v-list-item-title {
  font-size: 0.85rem;
}

.v-list-item:not(.v-list-item--active):not(.v-list-group__header) .v-icon {
  color: rgba(255, 255, 255, 0.7) !important;
  opacity: 0.9;
}

.v-list-item--active .v-icon {
  color: #F5F5DC !important;
  /* Cream color for active items */
}

.v-list-item--active {
  background: rgba(245, 245, 220, 0.15) !important;
  /* Cream background */
  border-radius: 8px !important;
  margin: 2px 8px !important;
}

.sub-nav-item {
  padding-inline-start: 32px !important;
}

/* Hover effects for navigation */
.v-list-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

/* Custom scrollbar for navigation */
.v-navigation-drawer ::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer ::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.v-navigation-drawer ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* Button enhancements */
.v-btn {
  border-radius: 12px !important;
  font-weight: 500 !important;
  text-transform: none !important;
}

/* Input field enhancements */
.v-text-field .v-field {
  border-radius: 12px !important;
}
</style>
