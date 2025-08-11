// plugins/vuetify.js

import { createVuetify } from 'vuetify';

// --- Gerekli Stiller ve İkonlar ---
import 'vuetify/styles';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// --- Sadece Kullanılan ve Mevcut Bileşenleri Import Et ---
import {
    VApp,
    VAppBar,
    VMain,
    VContainer,
    VRow,
    VCol,
    VCard,
    VCardText,
    VCardTitle,
    VCardActions,
    VCardSubtitle,
    VBtn,
    VBtnGroup,
    VIcon,
    VTextField,
    VTextarea,
    VSelect,
    VTable,
    VChip,
    VAlert,
    VDialog,
    VMenu,
    VList,
    VListItem,
    VListItemTitle,
    VNavigationDrawer,
    VTabsWindowItem,
    VTabs,
    VTab,
    VDivider,
    VCheckbox,
    VSwitch,
    VProgressCircular,
    VProgressLinear,
    VSnackbar,
    VTooltip,
    VSheet,
    VExpansionPanels,
    VExpansionPanel,
    VExpansionPanelTitle,
    VExpansionPanelText,
    VAvatar,
    VBadge,
    VBreadcrumbs,
    VDataTable,
    VPagination,
    VAutocomplete,
    VCombobox,
    VDatePicker,
    VFileInput,
    VRadioGroup,
    VRadio,
    VSlider,
    VRangeSlider,
    VRating,
    VSpacer,
    VSystemBar,
    VToolbar,
    VToolbarTitle,
    VFadeTransition,
    VExpandTransition,
    VSlideXTransition,
    VSlideYTransition,
    VImg,
    VForm,
    VWindow,
    VWindowItem,
    VListItemSubtitle,
    VListGroup,
    VAppBarNavIcon,
    VLayout
} from 'vuetify/components';

// Note: We use stable VDataTable from components; no labs import required

import * as directives from 'vuetify/directives';

// --- Baklava Business Theme ---
const baklavaBusinessTheme = {
    dark: false,
    colors: {
        primary: '#D4A574', // Honey gold - baklava rengi
        'primary-darken-1': '#B8956A',
        'primary-lighten-1': '#E5C297',
        secondary: '#8B4513', // Walnut brown - ceviz rengi
        'secondary-darken-1': '#6D340F',
        'secondary-lighten-1': '#A0572B',
        accent: '#F5F5DC', // Cream - kaymak rengi
        error: '#D32F2F',
        info: '#4A90E2',
        success: '#228B22', // Pistachio green - antep fıstığı yeşili
        warning: '#FFB74D',
        background: '#F8F4E6', // Warm honey background
        surface: '#FFFFFF',
        'surface-variant': '#F5F5DC',
        'on-surface': '#5D4037',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        // Custom baklava colors
        'honey-gold': '#D4A574',
        'walnut-brown': '#8B4513',
        'cream': '#F5F5DC',
        'pistachio-green': '#228B22',
        'warm-honey': '#F8F4E6',
        'baklava-layers': '#E5C297',
    },
};

// Professional Light Theme (Alternative)
const professionalTheme = {
    dark: false,
    colors: {
        primary: '#1976D2',
        'primary-darken-1': '#1565C0',
        secondary: '#424242',
        'secondary-darken-1': '#212121',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        background: '#F5F7FA',
        surface: '#FFFFFF',
    },
};

// Dark Pastry Theme
const darkPastryTheme = {
    dark: true,
    colors: {
        primary: '#D4A574',
        'primary-darken-1': '#B8956A',
        secondary: '#A0572B',
        'secondary-darken-1': '#8B4513',
        accent: '#F5F5DC',
        error: '#FF6B6B',
        info: '#4ECDC4',
        success: '#51CF66',
        warning: '#FFD93D',
        background: '#2C1810',
        surface: '#3E2723',
        'surface-variant': '#4E342E',
        'on-surface': '#F5F5DC',
        'on-primary': '#2C1810',
        'on-secondary': '#F5F5DC',
    },
};

// createVuetify fonksiyonunu güncelliyorum
export function createCustomVuetify({ themeName = 'professionalTheme', extraThemes = {} } = {}) {
    return createVuetify({
        display: {
            mobileBreakpoint: 'sm',
            thresholds: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }
        },
        theme: {
            defaultTheme: themeName,
            themes: {
                baklavaBusinessTheme,
                professionalTheme,
                darkPastryTheme,
                ...extraThemes,
            },
        },
        components: {
            VApp,
            VAppBar,
            VMain,
            VContainer,
            VRow,
            VCol,
            VCard,
            VCardText,
            VCardTitle,
            VCardActions,
            VBtn,
            VIcon,
            VTextField,
            VTextarea,
            VSelect,
            VTable,
            VChip,
            VAlert,
            VDialog,
            VMenu,
            VList,
            VListItem,
            VListItemTitle,
            VNavigationDrawer,
            VTabsWindowItem,
            VTabs,
            VTab,
            VDivider,
            VCheckbox,
            VSwitch,
            VProgressCircular,
            VProgressLinear,
            VSnackbar,
            VTooltip,
            VSheet,
            VExpansionPanels,
            VExpansionPanel,
            VExpansionPanelTitle,
            VExpansionPanelText,
            VAvatar,
            VBadge,
            VBreadcrumbs,
            VDataTable,
            VPagination,
            VAutocomplete,
            VCombobox,
            VDatePicker,
            VFileInput,
            VRadioGroup,
            VRadio,
            VSlider,
            VRangeSlider,
            VRating,
            VSpacer,
            VSystemBar,
            VToolbar,
            VToolbarTitle,
            VFadeTransition,
            VExpandTransition,
            VSlideXTransition,
            VSlideYTransition,
            VImg,
            VForm,
            VWindow,
            VWindowItem,
            VListItemSubtitle,
            VListGroup,
            VAppBarNavIcon,
            VLayout
        },
        directives,
        defaults: {
            // Global compact defaults for small screens
            global: {
                ripple: true,
                density: 'comfortable'
            },
            VCard: {
                elevation: 2,
                rounded: 'lg',
                class: 'modern-card'
            },
            VTextField: {
                variant: 'outlined',
                density: 'compact',
                color: 'primary'
            },
            VTextarea: {
                variant: 'outlined',
                density: 'compact',
                color: 'primary'
            },
            VSelect: {
                variant: 'outlined',
                density: 'compact',
                color: 'primary'
            },
            VBtn: {
                variant: 'flat',
                color: 'primary',
                class: 'text-none'
            },
            VChip: {
                variant: 'flat',
                rounded: 'lg'
            },
            VAlert: {
                variant: 'tonal',
                rounded: 'lg'
            },
            VDataTable: {
                density: 'compact'
            }
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
    });
}

// Varsayılan olarak professionalTheme ile export
const vuetify = createCustomVuetify({ themeName: 'professionalTheme' });
export default vuetify;
