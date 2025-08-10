<template>
  <v-app class="main-app">
    <v-layout class="main-layout">
      <!-- Left Sidebar - Classic Fixed Position -->
      <v-navigation-drawer v-model="drawer" app :permanent="!isMobile" :temporary="isMobile"
        class="sidebar-pastel text-dark" width="280" :scrim="isMobile ? 'rgba(0,0,0,0.35)' : false"
        :touchless="!isMobile" @click:outside="onDrawerOutsideClick" @update:model-value="onDrawerUpdate"
        style="background: linear-gradient(180deg, #D4A574 0%, #B8956A 100%); box-shadow: 2px 0 12px rgba(0,0,0,0.1);">

        <v-list nav density="comfortable" class="pa-2">
          <!-- Header -->
          <v-list-item class="mb-3"
            style="background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%); border-radius: 12px; color: white;">
            <template v-slot:prepend>
              <v-avatar color="rgba(255,255,255,0.2)" size="36">
                <v-icon color="white">mdi-factory</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="text-h6 font-weight-bold">OGS Panel</v-list-item-title>
            <v-list-item-subtitle style="color: rgba(255,255,255,0.8);">Ömer Güllü Sistemi</v-list-item-subtitle>
          </v-list-item>

          <!-- Navigation Items -->
          <v-list-item title="Sipariş Formu" link prepend-icon="mdi-clipboard-text-outline"
            :active="isActive('/main/form')" class="modern-nav-item mb-1" @click="() => safeNavigate('/main/form')"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-clipboard-text-outline</v-icon>
            </template>
          </v-list-item>

          <!-- Sipariş Yönetimi Group -->
          <v-list-group value="Siparisler" class="mb-2">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-layers-outline" title="Sipariş Yönetimi"
                class="modern-nav-item" @click="onMenuClick" style="border-radius: 8px; color: white;">
                <template v-slot:prepend>
                  <v-icon color="rgba(255,255,255,0.9)">mdi-layers-outline</v-icon>
                </template>
              </v-list-item>
            </template>

            <v-list-item to="/main/orders" title="Onay Bekleyenler" link prepend-icon="mdi-clock-outline"
              :active="isActive('/main/orders')" class="sub-nav-item ml-4" @click="onMenuClick"
              style="border-radius: 6px; color: rgba(255,255,255,0.8);">
              <template v-slot:prepend>
                <v-icon color="rgba(255,255,255,0.7)" size="20">mdi-clock-outline</v-icon>
              </template>
            </v-list-item>
            <v-list-item to="/main/hazirlanacak" title="Hazırlanacaklar" link prepend-icon="mdi-chef-hat"
              :active="isActive('/main/hazirlanacak')" class="sub-nav-item ml-4" @click="onMenuClick"
              style="border-radius: 6px; color: rgba(255,255,255,0.8);">
              <template v-slot:prepend>
                <v-icon color="rgba(255,255,255,0.7)" size="20">mdi-chef-hat</v-icon>
              </template>
            </v-list-item>
            <v-list-item to="/main/allorders" title="Tüm Siparişler" link prepend-icon="mdi-format-list-text"
              :active="isActive('/main/allorders')" class="sub-nav-item ml-4" @click="onMenuClick"
              style="border-radius: 6px; color: rgba(255,255,255,0.8);">
              <template v-slot:prepend>
                <v-icon color="rgba(255,255,255,0.7)" size="20">mdi-format-list-text</v-icon>
              </template>
            </v-list-item>
          </v-list-group>

          <!-- Other Navigation Items -->
          <v-list-item :to="{ name: 'CariYonetimi' }" title="Cari Yönetimi" link prepend-icon="mdi-account-cash-outline"
            :active="isActive('/main/cari-yonetimi')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-account-cash-outline</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/urun-yonetimi" title="Ürün Yönetimi" link prepend-icon="mdi-package-variant"
            :active="isActive('/main/urun-yonetimi')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-package-variant</v-icon>
            </template>
          </v-list-item>

          <v-list-item title="Stok Yönetimi" link prepend-icon="mdi-archive-outline"
            :active="isActive('/main/stok-yonetimi')" class="modern-nav-item mb-1"
            @click="() => safeNavigate('/main/stok-yonetimi')" style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-archive-outline</v-icon>
            </template>
          </v-list-item>

          <v-list-item title="Kargo Operasyon" link prepend-icon="mdi-truck-outline"
            :active="isActive('/main/kargo-operasyon')" class="modern-nav-item mb-1"
            @click="() => safeNavigate('/main/kargo-operasyon')" style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-truck-outline</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/personel-yonetimi" title="Personel Yönetimi" link prepend-icon="mdi-account-tie"
            :active="isActive('/main/personel-yonetimi')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-account-tie</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/fiyat-yonetimi" title="Fiyat Yönetimi" link prepend-icon="mdi-currency-usd"
            :active="isActive('/main/fiyat-yonetimi')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-currency-usd</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/recete-yonetimi" title="Reçete Yönetimi" link prepend-icon="mdi-receipt-text-outline"
            :active="isActive('/main/recete-yonetimi')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-receipt-text-outline</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/uretim-plani" title="Üretim Planı" link prepend-icon="mdi-factory"
            :active="isActive('/main/uretim-plani')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-factory</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/satis-raporu" title="Satış Raporu" link prepend-icon="mdi-chart-line"
            :active="isActive('/main/satis-raporu')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-chart-line</v-icon>
            </template>
          </v-list-item>

          <v-list-item to="/main/crm-raporlama" title="CRM Raporlama" link prepend-icon="mdi-chart-box"
            :active="isActive('/main/crm-raporlama')" class="modern-nav-item mb-1" @click="onMenuClick"
            style="border-radius: 8px; color: white;">
            <template v-slot:prepend>
              <v-icon color="rgba(255,255,255,0.9)">mdi-chart-box</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Top App Bar -->
      <v-app-bar v-if="currentUser" app elevation="0" height="64"
        style="background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%); border-bottom: 1px solid #E0E7ED;">
        <v-app-bar-nav-icon class="d-md-none" @click="drawer = !drawer" color="#8D6E63"></v-app-bar-nav-icon>

        <v-toolbar-title class="d-none d-md-flex align-center">
          <img src="../logos/omergullulogo.png" height="40" class="mr-3" alt="Logo" />
          <span class="text-h6 font-weight-medium" style="color: #5D4037;">{{ getCurrentPageTitle() }}</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <!-- Header Actions -->
        <div class="d-flex align-center">
          <!-- Real-time Connection Status -->
          <v-chip :color="realtimeStore.isConnected ? '#C8E6C9' : '#FFCDD2'" size="small" class="mr-3" variant="flat"
            :style="{ color: realtimeStore.isConnected ? '#2E7D32' : '#C62828' }">
            <v-icon start size="16" :color="realtimeStore.isConnected ? '#2E7D32' : '#C62828'">
              {{ realtimeStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}
            </v-icon>
            {{ realtimeStore.isConnected ? 'Canlı' : 'Offline' }}
          </v-chip>



          <!-- User Menu -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text" class="mr-2" style="color: #8D6E63;">
                <v-avatar color="#A1887F" size="36">
                  <span class="text-white">{{ currentUser.ad?.charAt(0).toUpperCase() }}</span>
                </v-avatar>
                <span class="ml-2 d-none d-sm-inline">{{ currentUser.ad }}</span>
                <v-icon class="ml-1" color="#8D6E63">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list style="background: #FFFFFF; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <v-list-item>
                <v-list-item-title style="color: #5D4037;">{{ currentUser.ad }}</v-list-item-title>
                <v-list-item-subtitle style="color: #8D6E63;">{{ currentUser.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="handleLogout" style="color: #8D6E63;">
                <template v-slot:prepend>
                  <v-icon color="#8D6E63">mdi-logout</v-icon>
                </template>
                <v-list-item-title>Çıkış Yap</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-app-bar>

      <!-- Main Content -->
      <v-main class="main-content-background scrollable-main">
        <v-container fluid class="main-container pa-4">
          <Suspense>
            <template #default>
              <router-view :key="$route.fullPath" />
            </template>
            <template #fallback>
              <div class="d-flex justify-center align-center" style="height: 60vh;">
                <div class="text-center">
                  <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                  <p class="mt-4 text-h6">Sayfa yükleniyor...</p>
                </div>
              </div>
            </template>
          </Suspense>
        </v-container>
      </v-main>

      <!-- Floating Notification Drawer Button -->
      <div v-if="currentUser && !drawerPinned" class="floating-drawer-button" :style="{
        right: notificationDrawer ? '420px' : '24px',
        transform: notificationDrawer ? 'translateX(0)' : 'translateX(0)'
      }">
        <v-btn fab color="#8D6E63" size="large" elevation="6" class="notification-trigger"
          :class="{ 'notification-shake': shouldShakeNotification }" @click="toggleNotificationDrawer"
          style="background: linear-gradient(135deg, #8D6E63 0%, #A1887F 100%); color: white;">
          <v-icon :color="hasUnreadNotifications ? '#FFD54F' : 'white'" size="28">
            {{ hasUnreadNotifications ? 'mdi-bell-ring' : 'mdi-bell-outline' }}
          </v-icon>
          <v-badge v-if="unreadNotificationCount > 0"
            :content="unreadNotificationCount > 99 ? '99+' : unreadNotificationCount" color="error" offset-x="8"
            offset-y="8" class="notification-badge" />
        </v-btn>
      </div>

      <!-- Notification Drawer -->
      <v-navigation-drawer v-model="notificationDrawer" location="right" :temporary="!drawerPinned"
        :permanent="drawerPinned && notificationDrawer" width="400" class="notification-drawer"
        style="background: linear-gradient(180deg, #F5F7FA 0%, #E8F1F8 100%); box-shadow: -4px 0 20px rgba(0,0,0,0.15);"
        @click:outside="handleDrawerOutsideClick">
        <!-- Drawer Header -->
        <v-card-title class="notification-drawer-header d-flex justify-space-between align-center pa-4">
          <div>
            <h3 class="text-h6 font-weight-bold" style="color: #5D4037;">
              <v-icon class="mr-2" color="#8D6E63">mdi-bell</v-icon>
              Bildirimler
            </h3>
            <div class="text-caption" style="color: #8D6E63;">
              {{ realtimeStore.notifications.length }} bildirim • {{ unreadNotificationCount }} okunmamış
            </div>
          </div>
          <div class="d-flex">
            <v-btn icon size="small" variant="text" @click="markAllAsRead" style="color: #8D6E63;" class="mr-1"
              v-tooltip:bottom="'Tümünü Okundu İşaretle'">
              <v-icon>mdi-check-all</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="clearAll" style="color: #8D6E63;" class="mr-1"
              v-tooltip:bottom="'Tümünü Temizle'">
              <v-icon>mdi-delete-sweep</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="toggleDrawerPin" style="color: #8D6E63;" class="mr-1"
              v-tooltip:bottom="drawerPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'">
              <v-icon>{{ drawerPinned ? 'mdi-pin-off' : 'mdi-pin' }}</v-icon>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="closeNotificationDrawer" style="color: #8D6E63;"
              v-if="!drawerPinned">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <!-- Drawer Content -->
        <div class="notification-drawer-content">
          <NotificationList :notifications="realtimeStore.notifications" :embedded="true"
            @notification-click="handleNotificationClick" @remove-notification="removeNotification" />
        </div>
      </v-navigation-drawer>

      <!-- Login fallback for non-authenticated users -->
      <div v-if="!currentUser">
        <!-- Login button -->
        <div style="position:fixed;left:24px;bottom:24px;z-index:2000;">
          <v-btn icon size="large"
            style="background: linear-gradient(135deg, #A1887F 0%, #8D6E63 100%); color: white; box-shadow: 0 4px 12px rgba(161, 136, 127, 0.3);"
            @click="loginDialog = true">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </div>

        <!-- Login Dialog -->
        <v-dialog v-model="loginDialog" max-width="400">
          <v-card style="border-radius: 16px; overflow: hidden;">
            <v-card-title class="text-h6"
              style="background: linear-gradient(135deg, #A1887F 0%, #8D6E63 100%); color: white;">Giriş
              Yap</v-card-title>
            <v-card-text class="pa-6">
              <v-text-field v-model="loginForm.email" label="Kullanıcı Adı veya Email"
                placeholder="Kullanıcı Adı veya Email" prepend-inner-icon="mdi-account" required autofocus
                variant="outlined" color="#8D6E63" />
              <v-text-field v-model="loginForm.password" label="Şifre" placeholder="Şifre" prepend-inner-icon="mdi-lock"
                type="password" required variant="outlined" color="#8D6E63" />
              <v-alert v-if="loginError" type="error" dense class="mt-2" style="border-radius: 8px;">{{ loginError
              }}</v-alert>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn variant="text" @click="loginDialog = false" style="color: #8D6E63;">İptal</v-btn>
              <v-btn @click="handleLogin" :loading="loginLoading" style="background: #8D6E63; color: white;">GİRİŞ
                YAP</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-layout>

    <!-- Global Toast Notification System -->
    <ToastNotification ref="toastNotification" />
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiCall } from '../utils/api.js';
import { useRealtimeStore } from '../stores/realtime.js';
import { useAuthStore } from '../stores/auth.js';
import NotificationList from '../components/NotificationList.vue';
import ToastNotification from '../components/ToastNotification.vue';

const drawer = ref(true);
const isMobile = ref(false);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const realtimeStore = useRealtimeStore();

// Auth store'dan reactive user bilgisi
const currentUser = computed(() => authStore.user);
const isAdmin = computed(() => authStore.userRole === 'ADMIN' || authStore.userRole === 'GENEL_MUDUR');

const loginDialog = ref(false);
const loginForm = ref({ email: '', password: '' });
const loginError = ref('');
const loginLoading = ref(false);
const toastNotification = ref(null);

// Notification Drawer State
const notificationDrawer = ref(false);
const shouldShakeNotification = ref(false);
const lastNotificationCount = ref(0);
const drawerPinned = ref(localStorage.getItem('drawerPinned') === 'true');

// Computed
const hasUnreadNotifications = computed(() => realtimeStore.unreadNotifications > 0);
const unreadNotificationCount = computed(() => realtimeStore.unreadNotifications);

// Get current page title
const getCurrentPageTitle = () => {
  const path = route.path;
  const titleMap = {
    '/main/form': 'Sipariş Formu',
    '/main/orders': 'Onay Bekleyen Siparişler',
    '/main/hazirlanacak': 'Hazırlanacak Siparişler',
    '/main/allorders': 'Tüm Siparişler',
    '/main/cari-yonetimi': 'Cari Yönetimi',
    '/main/urun-yonetimi': 'Ürün Yönetimi',
    '/main/stok-yonetimi': 'Stok Yönetimi',
    '/main/kargo-operasyon': 'Kargo Operasyon',
    '/main/personel-yonetimi': 'Personel Yönetimi',
    '/main/fiyat-yonetimi': 'Fiyat Yönetimi',
    '/main/recete-yonetimi': 'Reçete Yönetimi',
    '/main/uretim-plani': 'Üretim Planı',
    '/main/satis-raporu': 'Satış Raporu',
    '/main/crm-raporlama': 'CRM Raporlama'
  };
  return titleMap[path] || 'Ana Sayfa';
};

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
  // Handle drawer updates
}

function onMenuClick() {
  if (isMobile.value) drawer.value = false;
}

// Güvenli navigasyon fonksiyonu - vnode hatalarını önler
function safeNavigate(path) {
  try {
    console.log(`🧭 Safe Navigate: ${route.path} → ${path}`);

    // Mevcut component'in temizlenmesini bekle
    if (route.path !== path) {
      // Navigation öncesi cleanup
      if (window.vueVnodeError) {
        console.warn('🔧 Vnode error flag aktif, sayfa yenileniyor...')
        window.location.href = path
        return
      }

      // Mobile drawer kapat
      if (isMobile.value) drawer.value = false

      // Router push
      router.push(path).catch(error => {
        console.error('🚨 Navigation Error:', error)

        if (error.message && error.message.includes('vnode')) {
          console.warn('🔧 Vnode navigation hatası, direct navigate yapılıyor...')
          window.location.href = path
        }
      })
    }
  } catch (error) {
    console.error('🚨 Safe Navigate Error:', error)

    // Fallback - direct navigation
    window.location.href = path
  }
}

// Notification Drawer Functions
function toggleNotificationDrawer() {
  notificationDrawer.value = !notificationDrawer.value;
  if (notificationDrawer.value) {
    shouldShakeNotification.value = false; // Stop shaking when opened
  }
}

function closeNotificationDrawer() {
  notificationDrawer.value = false;
}

function toggleDrawerPin() {
  drawerPinned.value = !drawerPinned.value;
  localStorage.setItem('drawerPinned', drawerPinned.value.toString());

  if (drawerPinned.value) {
    // When pinning, ensure drawer is open
    notificationDrawer.value = true;
  }
}

function handleDrawerOutsideClick() {
  if (!drawerPinned.value) {
    closeNotificationDrawer();
  }
}

function handleNotificationClick(notification) {
  console.log('🔔 Notification tıklandı:', notification);

  markAsRead(notification.id);

  if (notification.navigationAction) {
    console.log('🧭 Navigation action var, yönlendiriliyor...');
    navigateToAction(notification);
  }
}

function navigateToAction(notification) {
  if (notification.navigationAction) {
    try {
      console.log('🧭 Navigating to:', notification.navigationAction);

      // Don't close drawer if it's pinned
      if (!drawerPinned.value) {
        notificationDrawer.value = false;
      }

      // Navigate immediately
      router.push(notification.navigationAction)
        .then(() => {
          console.log('✅ Navigation successful');
        })
        .catch((error) => {
          console.error('❌ Router navigation failed:', error);
          // Fallback to window.location
          window.location.href = notification.navigationAction;
        });
    } catch (error) {
      console.error('❌ Navigation exception:', error);
      window.location.href = notification.navigationAction;
    }
  }
}

function markAsRead(notificationId) {
  realtimeStore.markAsRead(notificationId);
}

function markAllAsRead() {
  realtimeStore.markAllAsRead();
}

function removeNotification(notificationId) {
  realtimeStore.removeNotification(notificationId);
}

function clearAll() {
  realtimeStore.clearAll();
}

// Notification shake animation trigger
function triggerNotificationShake(importance) {
  shouldShakeNotification.value = true;

  // Duration based on importance
  const duration = importance === 'critical' ? 5000 : (importance === 'warning' ? 3000 : 2000);

  setTimeout(() => {
    shouldShakeNotification.value = false;
  }, duration);
}

// Watch for new notifications
watch(
  () => realtimeStore.notifications.length,
  (newCount, oldCount) => {
    if (newCount > oldCount && oldCount > 0) {
      const newestNotification = realtimeStore.notifications[0];
      const importance = newestNotification.type;

      // Trigger shake animation
      triggerNotificationShake(importance);
    }
  }
);

async function handleLogin() {
  loginError.value = '';
  loginLoading.value = true;
  try {
    // Auth store'un login metodunu kullan
    await authStore.login({
      email: loginForm.value.email,
      password: loginForm.value.password
    });

    loginDialog.value = false;
    // Auth store zaten state'i güncelleyecek, reload'a gerek yok
    router.push('/main/form');
  } catch (e) {
    loginError.value = e.response?.data?.message || e.message || 'Giriş başarısız.';
  } finally {
    loginLoading.value = false;
  }
}

let stockMonitoringInterval = null;
let lastStockState = null;

function startStockMonitoring() {
  if (stockMonitoringInterval) {
    console.log('⏭️ Stok monitoring zaten aktif');
    return;
  }

  console.log('🚀 Stok monitoring başlatılıyor...');
  checkStockStatus();
  stockMonitoringInterval = setInterval(checkStockStatus, 2 * 60 * 1000);
}

function stopStockMonitoring() {
  if (stockMonitoringInterval) {
    console.log('🛑 Stok monitoring durduruluyor...');
    clearInterval(stockMonitoringInterval);
    stockMonitoringInterval = null;
  }
}

async function checkStockStatus() {
  try {
    const response = await apiCall('/stok/alerts');

    if (response.success) {
      const newState = {
        criticalCount: response.kritikUyariSayisi || 0,
        warningCount: response.dusukStokSayisi || 0,
        negativeStocks: response.uyarilar?.negatifStoklar?.length || 0,
        totalAlerts: response.toplamUyari || 0
      };

      if (!lastStockState) {
        lastStockState = newState;
        if (newState.totalAlerts > 0) {
          const initialChanges = [{
            type: 'initial_warning',
            count: newState.totalAlerts,
            critical: newState.criticalCount,
            warning: newState.warningCount,
            negative: newState.negativeStocks
          }];
          showStockNotifications(initialChanges, response.uyarilar);
        }
        return;
      }

      const changes = detectStockChanges(lastStockState, newState);

      if (changes.length > 0) {
        showStockNotifications(changes, response.uyarilar);
      }

      lastStockState = newState;
    }
  } catch (error) {
    console.error('❌ Stok durumu kontrol edilemedi:', error);
  }
}

function detectStockChanges(oldState, newState) {
  const changes = [];

  if (newState.totalAlerts > oldState.totalAlerts) {
    changes.push({
      type: 'total_alerts_increase',
      count: newState.totalAlerts - oldState.totalAlerts,
      newTotal: newState.totalAlerts
    });
  }

  if (newState.criticalCount > oldState.criticalCount) {
    changes.push({
      type: 'critical_increase',
      count: newState.criticalCount - oldState.criticalCount
    });
  }

  if (newState.negativeStocks > oldState.negativeStocks) {
    changes.push({
      type: 'negative_increase',
      count: newState.negativeStocks - oldState.negativeStocks
    });
  }

  if (newState.warningCount > oldState.warningCount) {
    changes.push({
      type: 'warning_increase',
      count: newState.warningCount - oldState.warningCount
    });
  }

  return changes;
}

function showStockNotifications(changes, stockData) {
  changes.forEach((change, index) => {
    let notification = {};

    switch (change.type) {
      case 'initial_warning':
        notification = {
          type: 'warning',
          title: '⚠️ Stok Durumu Bildirimi',
          message: `${change.count} ürün için stok uyarısı var`,
          details: `Kritik: ${change.critical}, Düşük: ${change.warning}, Negatif: ${change.negative}`,
          navigationAction: '/main/stok-yonetimi',
          actionText: 'Stok Sayfası',
          icon: 'mdi-alert-circle',
          duration: 10000,
          autoRemove: true
        };
        break;

      case 'total_alerts_increase':
        notification = {
          type: 'warning',
          title: '📈 Stok Uyarısı Artışı',
          message: `${change.count} yeni stok uyarısı! Toplam: ${change.newTotal}`,
          details: 'Stok seviyelerini kontrol edin',
          navigationAction: '/main/stok-yonetimi',
          actionText: 'Stok Sayfası',
          icon: 'mdi-trending-up',
          duration: 8000,
          autoRemove: true
        };
        break;

      case 'critical_increase':
        notification = {
          type: 'critical',
          title: '🚨 Kritik Stok Uyarısı',
          message: `${change.count} yeni kritik seviye stok tespit edildi!`,
          details: 'Acil müdahale gerekebilir',
          navigationAction: '/main/stok-yonetimi',
          actionText: 'Stok Sayfası',
          icon: 'mdi-alert-circle',
          duration: 12000,
          autoRemove: false
        };
        break;

      case 'negative_increase':
        notification = {
          type: 'critical',
          title: '❌ Negatif Stok Uyarısı',
          message: `${change.count} üründe stok eksikliği!`,
          details: 'Stok seviyesi 0\'ın altına düştü',
          navigationAction: '/main/stok-yonetimi',
          actionText: 'Kontrol Et',
          icon: 'mdi-close-circle',
          duration: 15000,
          autoRemove: false
        };
        break;

      case 'warning_increase':
        notification = {
          type: 'warning-snake',
          title: '⚠️ Düşük Stok Bildirimi',
          message: `${change.count} üründe stok azaldı`,
          details: 'Kritik seviyeye yaklaşıldı',
          navigationAction: '/main/stok-yonetimi',
          actionText: 'İncele',
          icon: 'mdi-alert',
          duration: 8000,
          autoRemove: true
        };
        break;
    }

    if (toastNotification.value) {
      toastNotification.value.addNotification(notification);
    }

    realtimeStore.addNotification(notification);
  });
}

function handleLogout() {
  stopStockMonitoring();
  authStore.logout();
  router.push('/login');
}

onMounted(async () => {
  // Auth store'u başlat
  await authStore.initializeAuth();

  updateScreen();
  window.addEventListener('resize', updateScreen);

  // Global toast notification functions
  window.showStockAlert = (notification) => {
    if (toastNotification.value) {
      toastNotification.value.addNotification(notification);
    }
  };

  window.showToast = (notification) => {
    if (toastNotification.value) {
      toastNotification.value.addNotification(notification);
    }
  };

  // Test functions
  window.testNotification = () => {
    realtimeStore.addNotification({
      type: 'warning',
      title: '🧪 Navigation Test',
      message: 'Bu notification\'a tıklayın',
      details: 'Stok yönetimi sayfasına yönlendirecek',
      icon: 'mdi-test-tube',
      navigationAction: '/main/stok-yonetimi',
      actionText: 'Stok Sayfası',
      autoRemove: false
    });
  };

  window.forceAddNotification = () => {
    const testNotification = {
      type: 'critical',
      title: '🔧 Zorla Eklenen Test',
      message: 'Bu zorla eklenen bir test notification',
      details: 'Drawer\'da görünmeli',
      icon: 'mdi-hammer-wrench',
      navigationAction: '/main/stok-yonetimi',
      actionText: 'Test Sayfası',
      autoRemove: false
    };

    realtimeStore.addNotification(testNotification);
  };

  window.realtimeStore = realtimeStore;

  // Real-time stock monitoring
  if (currentUser.value) {
    startStockMonitoring();
  }

  // Initialize pinned drawer state
  if (drawerPinned.value) {
    notificationDrawer.value = true;
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreen);
  stopStockMonitoring();

  // Cleanup global functions
  delete window.showStockAlert;
  delete window.showToast;
  delete window.testNotification;
  delete window.forceAddNotification;
  delete window.realtimeStore;
})
</script>

<style scoped>
/* ========= SIDEBAR STYLES ========= */
.sidebar-pastel {
  background: linear-gradient(180deg, #D4A574 0%, #B8956A 100%);
}

.modern-nav-item {
  margin-bottom: 4px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modern-nav-item:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(4px);
}

.modern-nav-item.v-list-item--active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.modern-nav-item.v-list-item--active .v-icon {
  color: white !important;
}

.sub-nav-item {
  transition: all 0.3s ease;
  border-radius: 6px;
  padding-left: 32px !important;
}

.sub-nav-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  transform: translateX(2px);
}

.sub-nav-item.v-list-item--active {
  background: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

/* ========= FLOATING DRAWER BUTTON ========= */
.floating-drawer-button {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1500;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.floating-drawer-button .v-btn {
  box-shadow: 0 6px 20px rgba(141, 110, 99, 0.3) !important;
  transition: all 0.3s ease !important;
}

.floating-drawer-button .v-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(141, 110, 99, 0.4) !important;
}

/* ========= NOTIFICATION TRIGGER & SHAKE ANIMATION ========= */
.notification-trigger {
  position: relative;
  transition: all 0.3s ease;
}

.notification-trigger:hover {
  transform: translateY(-2px);
}

.notification-shake {
  animation: notificationShake 0.6s ease-in-out infinite;
}

.notification-badge {
  animation: badgePulse 2s ease-in-out infinite;
}

@keyframes badgePulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes notificationShake {

  0%,
  100% {
    transform: translateX(0) translateY(0);
  }

  10% {
    transform: translateX(-3px) translateY(-2px) rotate(-1deg);
  }

  20% {
    transform: translateX(3px) translateY(-1px) rotate(1deg);
  }

  30% {
    transform: translateX(-2px) translateY(-2px) rotate(-1deg);
  }

  40% {
    transform: translateX(2px) translateY(-1px) rotate(1deg);
  }

  50% {
    transform: translateX(-1px) translateY(-1px) rotate(-0.5deg);
  }

  60% {
    transform: translateX(1px) translateY(-1px) rotate(0.5deg);
  }

  70% {
    transform: translateX(-1px) translateY(0) rotate(-0.5deg);
  }

  80% {
    transform: translateX(1px) translateY(0) rotate(0.5deg);
  }

  90% {
    transform: translateX(-0.5px) translateY(0) rotate(-0.25deg);
  }
}

/* ========= NOTIFICATION DRAWER ========= */
.notification-drawer {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px 0 0 16px;
  overflow: hidden;
}

.notification-drawer-header {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.notification-drawer-content {
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 8px;
}

/* ========= DRAWER TRANSITIONS ========= */
.v-navigation-drawer {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
}

.v-navigation-drawer--right {
  transform: translateX(100%);
}

.v-navigation-drawer--right.v-navigation-drawer--active {
  transform: translateX(0);
}

/* ========= FADE TRANSITIONS ========= */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========= APP & LAYOUT BASE STYLES ========= */
.main-app {
  height: 100vh !important;
  overflow: hidden !important;
}

.main-layout {
  height: 100vh !important;
  overflow: hidden !important;
}

/* ========= MAIN CONTENT BACKGROUND ========= */
.main-content-background {
  background: linear-gradient(135deg, #F8F4E6 0%, #E5C297 50%, #D4A574 100%);
  background-image: url('data:image/svg+xml;utf8,%3Csvg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect x="0" y="0" width="60" height="60" fill="%23F8F4E6"/%3E%3Cpath d="M0 30L30 0L60 30L30 60L0 30Z" fill="%23D4A574" fill-opacity="0.05"/%3E%3Cpath d="M15 30L30 15L45 30L30 45L15 30Z" fill="%23B8956A" fill-opacity="0.03"/%3E%3C/svg%3E');
  background-size: 60px 60px;
}

.scrollable-main {
  height: 100vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(212, 165, 116, 0.3) transparent !important;
}

.scrollable-main::-webkit-scrollbar {
  width: 8px;
}

.scrollable-main::-webkit-scrollbar-track {
  background: rgba(212, 165, 116, 0.1);
  border-radius: 4px;
}

.scrollable-main::-webkit-scrollbar-thumb {
  background: rgba(212, 165, 116, 0.3);
  border-radius: 4px;
}

.scrollable-main::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 165, 116, 0.5);
}

.main-container {
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
}

/* ========= CARD ENHANCEMENTS ========= */
.v-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(212, 165, 116, 0.08);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(212, 165, 116, 0.15);
}

/* ========= BUTTON ENHANCEMENTS ========= */
.v-btn {
  border-radius: 12px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  transition: all 0.3s ease !important;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* ========= INPUT FIELD ENHANCEMENTS ========= */
.v-text-field .v-field {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.v-text-field .v-field:hover {
  transform: translateY(-1px);
}

/* ========= NOTIFICATION ENHANCEMENTS ========= */
.v-chip {
  transition: all 0.3s ease !important;
}

.v-chip:hover {
  transform: scale(1.05);
}

/* ========= SCROLLBAR STYLES ========= */
.notification-drawer-content::-webkit-scrollbar {
  width: 6px;
}

.notification-drawer-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.notification-drawer-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.notification-drawer-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* ========= RESPONSIVE DESIGN ========= */
@media (max-width: 768px) {
  .notification-drawer {
    width: 100% !important;
    border-radius: 0;
  }

  .notification-drawer-content {
    height: calc(100vh - 80px);
  }

  .floating-drawer-button {
    right: 16px !important;
    bottom: 80px !important;
    top: auto !important;
    transform: none !important;
  }

  .floating-drawer-button .v-btn {
    width: 56px !important;
    height: 56px !important;
  }
}

/* ========= ACCESSIBILITY IMPROVEMENTS ========= */
.notification-trigger:focus {
  outline: 2px solid rgba(255, 255, 255, 0.3);
  outline-offset: 2px;
}

/* ========= PERFORMANCE OPTIMIZATIONS ========= */
.notification-drawer {
  will-change: transform;
}

.notification-trigger {
  will-change: transform;
}

/* ========= DARK MODE SUPPORT ========= */
@media (prefers-color-scheme: dark) {
  .notification-drawer {
    background: linear-gradient(180deg, #2C2C2C 0%, #1E1E1E 100%);
  }

  .notification-drawer-header {
    background: linear-gradient(135deg, #3C3C3C 0%, #2C2C2C 100%);
  }

  .v-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
