import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// PAGE COMPONENTS
import Login from '../pages/Login.vue'
import Form from '../pages/Form.vue' // Sipariş Ekleme Formu
import Orders from '../pages/OnayBekleyen.vue' // Onay Bekleyenler Sayfası
import AllOrders from '../pages/AllOrders.vue' // Tüm Siparişler Sayfası
import Hazirlanacaklar from '../pages/Hazırlanacak.vue' // <<< YENİ: Hazırlanacaklar sayfası component importu
import MainLayout from '../layouts/MainLayout.vue'
import FiyatYönetimi from '../pages/FiyatYonetimi.vue'
import StokYonetimi from '../pages/StokYonetimi.vue'
import PersonelYonetimi from '../pages/KullaniciYonetimi.vue' // Personel Yönetimi olarak değiştirildi
import UretimPlani from '../pages/UretimPlani.vue'
import CariYonetimi from '../pages/CariYonetimi.vue'
import KargoOperasyon from '../pages/KargoOperasyon.vue'
import UrunYonetimi from '../pages/UrunYonetimi.vue'
import SatisRaporu from '../pages/SatisRaporu.vue'
import CrmRaporlama from '../pages/CrmRaporlama.vue'
import ReceteYonetimi from '../pages/ReceteYonetimi.vue'

// ROUTER SETUP

const routes = [
  {
    path: '/',
    redirect: '/main'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/main',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'Dashboard' }
      },
      {
        path: 'dashboard', // /main/dashboard
        name: 'Dashboard',
        component: Form, // Geçici olarak Form component'ini kullan
        meta: { requiresAuth: true, page: 'dashboard' }
      },
      {
        path: 'form', // /main/form
        name: 'SiparisFormu',
        component: Form,
        meta: { requiresAuth: true, page: 'siparis-formu' }
      },
      {
        path: 'FiyatYonetimi',
        name: 'FiyatYönetimi',
        component: FiyatYönetimi,
        meta: { requiresAuth: true, page: 'fiyat-yonetimi' }
      },
      {
        path: 'orders', // /main/orders - Onay Bekleyenler
        name: 'OnayBekleyenler',
        component: Orders
      },
      {
        path: 'allorders', // /main/allorders
        name: 'TumSiparisler',
        component: AllOrders
      },
      { // <<< YENİ ROTA TANIMI >>>
        path: 'hazirlanacak', // /main/hazirlanacak
        name: 'Hazirlanacaklar',
        component: Hazirlanacaklar // Yeni oluşturulan bileşeni bağla
      },
      {
        path: 'cari-yonetimi',
        name: 'CariYonetimi',
        component: CariYonetimi,
        meta: { requiresAuth: true }
      },
      {
        path: 'urun-yonetimi',
        name: 'UrunYonetimi',
        component: UrunYonetimi,
        meta: { requiresAuth: true }
      },
      {
        path: 'stok-yonetimi',
        name: 'StokYonetimi',
        component: StokYonetimi,
        meta: { requiresAuth: true }
      },
      {
        path: 'personel-yonetimi', // URL değiştirildi
        name: 'PersonelYonetimi', // İsim değiştirildi
        component: PersonelYonetimi,
        meta: { requiresAuth: true, page: 'kullanici-yonetimi' }
      },
      {
        path: 'recete-yonetimi',
        name: 'ReceteYonetimi',
        component: ReceteYonetimi,
        meta: { requiresAuth: true, page: 'recete-yonetimi' }
      },
      {
        path: 'uretim-plani',
        name: 'UretimPlani',
        component: UretimPlani,
        meta: { requiresAuth: true, page: 'uretim-plani' }
      },
      {
        path: 'satis-raporu',
        name: 'SatisRaporu',
        component: SatisRaporu,
        meta: { requiresAuth: true }
      },
      {
        path: 'crm-raporlama',
        name: 'CrmRaporlama',
        component: CrmRaporlama,
        meta: { requiresAuth: true, adminOnly: true }
      },
      {
        path: 'kargo-operasyon',
        name: 'KargoOperasyon',
        component: KargoOperasyon,
        meta: { requiresAuth: true }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/main' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  // ogsiparis.com için scroll behavior
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Güçlendirilmiş navigation guard'lar
router.beforeEach(async (to, from, next) => {
  console.log(`🧭 Navigation START: ${from.path} → ${to.path}`);

  try {
    const token = localStorage.getItem('token')

    // Login sayfasına erişim kontrolü
    if (to.name === 'Login' && token) {
      next('/main/form')
      return
    }

    // Auth gerektiren sayfalar için kontrol
    if (to.meta.requiresAuth && !token) {
      console.warn('🔒 Authentication required, redirecting to login')
      next('/login')
      return
    }

    // Permission kontrolü (token varsa)
    if (token && to.meta.page) {
      try {
        const authStore = useAuthStore()

        // Store'u initialize et
        if (!authStore.isAuthenticated) {
          await authStore.initializeAuth()
        }

        // Permission kontrolü
        if (!authStore.canAccess(to.meta.page)) {
          console.warn(`🚫 Access denied to ${to.meta.page} for role: ${authStore.userRole}`)

          // Eğer zaten access denied page'e gidiyorsa infinite loop'u önle
          if (to.path.includes('error=access_denied')) {
            console.warn('🔄 Preventing infinite redirect loop')
            next(false) // Cancel navigation
            return
          }

          // Role'e göre uygun sayfaya yönlendir
          const fallbackRoutes = {
            'GENEL_MUDUR': '/main/dashboard',
            'SUBE_MUDURU': '/main/dashboard',
            'URETIM_MUDURU': '/main/dashboard',
            'SEVKIYAT_MUDURU': '/main/dashboard',
            'PERSONEL': '/main/dashboard',
            'VIEWER': '/main/dashboard'
          }

          const fallbackRoute = fallbackRoutes[authStore.userRole] || '/main/dashboard'
          console.log(`🔄 Redirecting to fallback route: ${fallbackRoute}`)
          next(`${fallbackRoute}?error=access_denied&denied_page=${to.meta.page}`)
          return
        }
      } catch (authError) {
        console.error('🚨 Auth Store Error:', authError)
        // Auth hatası durumunda login'e yönlendir
        next('/login')
        return
      }
    }

    // Vnode hatası durumunda force refresh
    if (window.vueVnodeError) {
      console.warn('🔧 Vnode hatası tespit edildi, sayfa yenileniyor...')
      window.location.reload()
      return
    }

    next()
  } catch (error) {
    console.error('🚨 Navigation Error:', error)

    // Kritik hata durumunda ana sayfaya yönlendir
    if (error.message && error.message.includes('vnode')) {
      window.location.href = '/main/form'
      return
    }

    next()
  }
})

router.afterEach((to, from) => {
  console.log(`🧭 Navigation COMPLETE: ${from.path} → ${to.path}`);

  // Navigation sonrası cleanup
  try {
    // DOM cleanup
    const staleElements = document.querySelectorAll('[data-vue-stale]')
    staleElements.forEach(el => el.remove())

    // Memory cleanup
    if (window.gc && typeof window.gc === 'function') {
      setTimeout(() => window.gc(), 1000)
    }

    // Vue DevTools için
    if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('router:transition-end', {
        from: from.path,
        to: to.path
      });
    }
  } catch (error) {
    console.error('🚨 AfterEach Error:', error)
  }
})

// Router error handler
router.onError((error) => {
  console.error('🚨 Router Error:', error)

  if (error.message && error.message.includes('vnode')) {
    console.warn('🔧 Router vnode hatası, flag set ediliyor...')
    window.vueVnodeError = true

    // 2 saniye sonra flag'i temizle
    setTimeout(() => {
      window.vueVnodeError = false
    }, 2000)
  }
})

// Eski beforeEach kaldırıldı - yukarıdaki güçlendirilmiş version kullanılıyor

export default router
