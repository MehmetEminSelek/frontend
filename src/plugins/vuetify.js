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

// --- Tema Tanımlamaları ---
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

// Sipariş modülü için örnek tema
const siparisTheme = {
    dark: false,
    colors: {
        primary: '#1976D2', // Mavi
        secondary: '#FFC107', // Sarı
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};

// createVuetify fonksiyonunu dışarıdan tema parametresi alacak şekilde güncelliyorum
export function createCustomVuetify({ themeName = 'baklavaGreenTheme', extraThemes = {} } = {}) {
    return createVuetify({
        theme: {
            defaultTheme: themeName,
            themes: {
                baklavaGreenTheme,
                siparisTheme,
                ...extraThemes,
            },
        },
        components: {
            ...components,
        },
        directives,
        defaults: {
            VCard: { elevation: 2, rounded: 'lg' },
            VTextField: { variant: 'filled', density: 'comfortable' },
            VTextarea: { variant: 'filled', density: 'comfortable' },
            VSelect: { variant: 'filled', density: 'comfortable' },
            VBtn: { variant: 'flat', color: 'secondary' },
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
    });
}

// Varsayılan olarak baklavaGreenTheme ile export
const vuetify = createCustomVuetify();
export default vuetify;
