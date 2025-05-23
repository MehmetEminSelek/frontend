// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import './plugins/vuetify.js'
import '@mdi/font/css/materialdesignicons.css'

import vuetify from './plugins/vuetify.js'

// Toast notifications
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
const pinia = createPinia()

// Toast configuration
const toastOptions = {
    position: 'top-right',
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false
}

app
    .use(pinia)
    .use(router)
    .use(vuetify)
    .use(Toast, toastOptions)
    .mount('#app')
