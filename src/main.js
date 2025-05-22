// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import './plugins/vuetify.js'
import '@mdi/font/css/materialdesignicons.css'

import vuetify from './plugins/vuetify.js'

createApp(App)
    .use(router)
    .use(vuetify)
    .mount('#app')
