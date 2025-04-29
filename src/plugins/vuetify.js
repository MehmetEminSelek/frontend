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
const myCustomLightTheme = {
    dark: false,
    colors: {
        primary: '#FF9800', // Örnek Turuncu
        'primary-darken-1': '#F57C00',
        secondary: '#607D8B', // Örnek Mavi Gri
        'secondary-darken-1': '#455A64',
        accent: '#FFC107',
        error: '#D32F2F',
        info: '#1976D2',
        success: '#388E3C',
        warning: '#FFA000',
        background: '#ECEFF1',
        surface: '#FFFFFF',
    },
};

// --- Vuetify Örneğini Oluşturma ---
const vuetify = createVuetify({
    // 1. TEMA AYARLARI
    theme: {
        defaultTheme: 'myCustomLightTheme',
        themes: {
            myCustomLightTheme,
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
