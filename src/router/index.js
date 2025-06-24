import { createRouter, createWebHistory } from 'vue-router'

// PAGE COMPONENTS
import Login from '../pages/Login.vue'
import Form from '../pages/Form.vue' // Sipariş Ekleme Formu
import Orders from '../pages/OnayBekleyen.vue' // Onay Bekleyenler Sayfası
import AllOrders from '../pages/AllOrders.vue' // Tüm Siparişler Sayfası
import Hazirlanacaklar from '../pages/Hazırlanacak.vue' // <<< YENİ: Hazırlanacaklar sayfası component importu
import MainLayout from '../layouts/MainLayout.vue'
import FiyatYönetimi from '../pages/FiyatYonetimi.vue'
import StokYonetimi from '../pages/StokYonetimi.vue'
import KullaniciYonetimi from '../pages/KullaniciYonetimi.vue'
import UretimPlani from '../pages/UretimPlani.vue'
import CariYonetimi from '../pages/CariYonetimi.vue'
import KargoOperasyon from '../pages/KargoOperasyon.vue'
import UrunYonetimi from '../pages/UrunYonetimi.vue'
import SatisRaporu from '../pages/SatisRaporu.vue'
import MalzemeFiyatlari from '../pages/MalzemeFiyatlari.vue'
import CrmRaporlama from '../pages/CrmRaporlama.vue'

// ROUTER SETUP


const routes = [
  {
    path: '/',
    redirect: '/main/form'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/main',
    component: MainLayout,
    children: [
      {
        path: 'form', // /main/form
        name: 'SiparisFormu',
        component: Form
      },
      {
        path: 'FiyatYonetimi',
        name: 'FiyatYönetimi',
        component: FiyatYönetimi // /main/form
      },
      {
        path: 'MalzemeFiyatlari',
        name: 'MalzemeFiyatlari',
        component: MalzemeFiyatlari,
        meta: { requiresAuth: true, adminOnly: true }
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
        path: 'kullanici-yonetimi',
        name: 'KullaniciYonetimi',
        component: KullaniciYonetimi,
        meta: { requiresAuth: true, adminOnly: true }
      },
      {
        path: 'recete-yonetimi',
        name: 'ReceteYonetimi',
        component: () => import('../pages/ReceteYonetimi.vue'),
        meta: { requiresAuth: true, adminOnly: true }
      },
      {
        path: 'uretim-plani',
        name: 'UretimPlani',
        component: UretimPlani,
        meta: { requiresAuth: true, adminOnly: true }
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
      },
      {
        path: '',
        redirect: { name: 'SiparisFormu' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/main/stok-yonetimi' }
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  // Login sayfasına erişim kontrolü
  if (to.name === 'Login' && token) {
    next('/main/form')
    return
  }

  // Auth gerektiren sayfalar için kontrol
  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // Admin only sayfalar için kontrol
  if (to.meta.adminOnly && userRole !== 'admin') {
    next('/main/form')
    return
  }

  next()
})

export default router
