import { createRouter, createWebHistory } from 'vue-router'

// PAGE COMPONENTS
import Login from '../pages/Login.vue'
import Form from '../pages/Form.vue' // Sipariş Ekleme Formu
import Orders from '../pages/Orders.vue' // Onay Bekleyenler Sayfası
import AllOrders from '../pages/AllOrders.vue' // Tüm Siparişler Sayfası
import Hazirlanacaklar from '../pages/Hazırlanacak.vue' // <<< YENİ: Hazırlanacaklar sayfası component importu
import MainLayout from '../layouts/MainLayout.vue'

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
        path: '',
        redirect: { name: 'SiparisFormu' }
      }
    ]
  },
  // { path: '/:catchAll(.*)*', name: 'NotFound', component: () => import('../pages/NotFound.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
