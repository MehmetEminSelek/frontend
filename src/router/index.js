import { createRouter, createWebHistory } from 'vue-router'

// PAGE COMPONENTS
import Login from '../pages/Login.vue'
import Form from '../pages/Form.vue'
import Orders from '../pages/Orders.vue'
import MainLayout from '../layouts/MainLayout.vue'



const routes = [
  {
    pPath: '/',
    redirect: '/main/form'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/main',
    component: MainLayout,
    children: [
      {
        path: 'form',
        component: Form
      },
      {
        path: 'orders',
        component: Orders
      },
      {
        path: '',
        redirect: 'form'
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
