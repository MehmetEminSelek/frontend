// plugins/vuetify.js

import { createVuetify } from 'vuetify';

// --- Gerekli Stiller ve İkonlar ---
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

// --- Bileşenleri ve Direktifleri Import Et ---
// Bu satırlar TÜM ana Vuetify bileşenlerini ve direktiflerini import eder
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
// Eğer v-data-table-server gibi labs bileşenleri de kullanacaksan bu da gerekli:
// import * as labsComponents from 'vuetify/labs/components';

// --- Tema Tanımlaması ---
const baklavaGreenTheme = {
    dark: false,
    colors: {
        primary: '#7BAE7F', // Soluk yeşil
        'primary-darken-1': '#5C8D5A',
        secondary: '#E9D8A6', // Pastel altın/krem
        'secondary-darken-1': '#C9B37C',
        accent: '#F6C177', // Hafif altın vurgusu
        error: '#D32F2F',
        info: '#7BAE7F', // Bilgi için de yeşil
        success: '#A3C9A8', // Açık yeşil
        warning: '#F6C177', // Hafif altın
        background: '#F4F8F3', // Çok açık yeşil/krem arka plan
        surface: '#FFFFFF',
        'baklava-gold': '#E9D8A6', // Ekstra vurgu için
        'baklava-green': '#7BAE7F',
    },
};

// --- Vuetify Örneğini Oluşturma ---
const vuetify = createVuetify({
    // 1. TEMA AYARLARI
    theme: {
        defaultTheme: 'baklavaGreenTheme',
        themes: {
            baklavaGreenTheme,
        },
    },

    // 2. BİLEŞENLER VE DİREKTİFLER
    // Vuetify'a hangi bileşenleri ve direktifleri kullanacağını söyle
    components: {
        ...components,
        // ...labsComponents, // Eğer labs bileşenleri import ettiysen
    },
    directives,

    // 3. VARSAYILAN BİLEŞEN PROPLARI (Defaults)
    defaults: {
        VCard: { elevation: 2, rounded: 'lg' },
        VTextField: { variant: 'filled', density: 'comfortable' },
        VTextarea: { variant: 'filled', density: 'comfortable' },
        VSelect: { variant: 'filled', density: 'comfortable' },
        VBtn: { variant: 'flat', color: 'secondary' }, // Varsayılan buton stili
        // VDataTable: { density: 'compact' } // v-data-table için varsayılanlar (isteğe bağlı)
    },

    // 4. İKON AYARLARI
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
});

export default vuetify;
