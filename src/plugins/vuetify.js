// plugins/vuetify.js

import { createVuetify } from 'vuetify';

// --- Gerekli Stiller ve İkonlar ---
// Vuetify'ın temel stillerini import et
import 'vuetify/styles';
// Material Design Icons (MDI) ikon setini import et (veya başka bir set kullanıyorsan onu import et)
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css'; // MDI fontunu import et

// --- Tema Tanımlaması ---
// Kendi açık temanızı tanımlayın (renkleri buradan değiştirebilirsin)
const myCustomLightTheme = {
    dark: false, // Bu temanın açık tema olduğunu belirtir
    colors: {
        // Ana Renkler
        primary: '#0D47A1', // <<< DEĞİŞTİRMEK İSTEDİĞİN ANA RENK (Örnek: Koyu Mavi)
        'primary-darken-1': '#0B3A80', // Primary'nin biraz koyusu (isteğe bağlı)
        secondary: '#424242', // İkincil Renk (Örnek: Koyu Gri)
        'secondary-darken-1': '#212121',

        accent: '#82B1FF', // Vurgu Rengi (isteğe bağlı)

        // Durum Renkleri
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',

        // Arka Plan ve Yüzey Renkleri
        background: '#F5F5F5', // Genel sayfa arka planı
        surface: '#FFFFFF',    // Kartlar, dialoglar vb. yüzeyler

        // Kendi özel renklerini de ekleyebilirsin:
        // 'on-primary': '#FFFFFF', // Primary rengin üzerindeki metin rengi (genellikle beyaz)
        // 'my-custom-color': '#FFC107',
    },
    // Değişkenler (CSS değişkenleri olarak kullanılabilir)
    // variables: {
    //   'border-color': '#000000',
    // }
};

// --- Vuetify Örneğini Oluşturma ---
const vuetify = createVuetify({
    // 1. TEMA AYARLARI
    theme: {
        defaultTheme: 'myCustomLightTheme', // Uygulamanın varsayılan temasını ayarla
        themes: {
            myCustomLightTheme, // Tanımladığın temayı Vuetify'a tanıt
            // İstersen koyu tema da ekleyebilirsin:
            // myCustomDarkTheme: { dark: true, colors: { primary: '#...', ... } }
        },
    },

    // 2. VARSAYILAN BİLEŞEN PROPLARI (Defaults)
    // Tüm uygulamadaki bileşenler için varsayılan ayarlar
    defaults: {
        global: {
            // Genel varsayılanlar
            // ripple: false, // Tüm bileşenlerde dalga efektini kapat
        },
        // Belirli bileşenler için varsayılanlar
        VCard: {
            elevation: 2,      // Tüm kartların varsayılan gölgesi
            rounded: 'lg',     // Tüm kartların varsayılan köşe yuvarlatması
        },
        VTextField: {
            variant: 'filled', // Tüm text field'lar varsayılan olarak 'filled' stilinde olsun
            density: 'comfortable',
        },
        VTextarea: {
            variant: 'filled',
            density: 'comfortable',

        },
        VSelect: {
            variant: 'filled',
            density: 'comfortable',
        },
        VBtn: {
            variant: 'flat', // Tüm butonlar varsayılan olarak 'flat' olsun
            color: 'primary', // Tüm butonlar varsayılan olarak primary renkte olsun
            rounded: 'pill', // Tüm butonlar hap şeklinde olsun
        }
        // Diğer bileşenler için de varsayılanlar ekleyebilirsin...
        // VChip: { ... },
        // VDialog: { ... },
    },

    // 3. İKON AYARLARI
    icons: {
        defaultSet: 'mdi', // Varsayılan ikon setini MDI olarak ayarla
        aliases,
        sets: {
            mdi, // MDI ikon setini tanıt
        },
    },

    // Diğer Vuetify ayarları (SSR, locale vb.) buraya eklenebilir
});

// Oluşturulan Vuetify örneğini dışa aktar
export default vuetify;