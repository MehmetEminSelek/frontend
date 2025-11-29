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

import * as directives from 'vuetify/directives';

// --- Modern Pastel Theme (Primary) ---
const modernPastelTheme = {
    dark: false,
    colors: {
        background: '#F5F7FA', // Soft blue-grey background
        surface: '#FFFFFF',
        primary: '#5D87FF',    // Soft Blue
        'primary-darken-1': '#4570EA',
        secondary: '#49BEFF',  // Soft Cyan
        'secondary-darken-1': '#29A8E8',
        accent: '#FFD666',     // Soft Yellow
        error: '#FA896B',      // Soft Red
        info: '#5D87FF',       // Same as primary for consistency
        success: '#13DEB9',    // Soft Teal
        warning: '#FFAE1F',    // Soft Orange
        'on-background': '#2A3547',
        'on-surface': '#2A3547',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#FFFFFF',
        'on-error': '#FFFFFF',
    },
    variables: {
        'border-color': '#EAEFF4',
        'border-opacity': 1,
        'high-emphasis-opacity': 0.87,
        'medium-emphasis-opacity': 0.60,
        'disabled-opacity': 0.38,
        'idle-opacity': 0.04,
        'hover-opacity': 0.04,
        'focus-opacity': 0.12,
        'selected-opacity': 0.08,
        'activated-opacity': 0.12,
        'pressed-opacity': 0.12,
        'dragged-opacity': 0.08,
        'theme-kbd': '#212529',
        'theme-on-kbd': '#FFFFFF',
        'theme-code': '#F5F5F5',
        'theme-on-code': '#000000',
    }
};

// Professional Dark Theme (Updated for Pastel)
const modernDarkTheme = {
    dark: true,
    colors: {
        background: '#2A3447', // Soft Dark Blue
        surface: '#333F55',
        primary: '#5D87FF',
        'primary-darken-1': '#4570EA',
        secondary: '#49BEFF',
        'secondary-darken-1': '#29A8E8',
        accent: '#FFD666',
        error: '#FA896B',
        info: '#5D87FF',
        success: '#13DEB9',
        warning: '#FFAE1F',
        'on-background': '#EAEFF4',
        'on-surface': '#EAEFF4',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-success': '#FFFFFF',
        'on-warning': '#FFFFFF',
        'on-error': '#FFFFFF',
    },
};

export function createCustomVuetify({ themeName = 'modernPastelTheme', extraThemes = {} } = {}) {
    return createVuetify({
        display: {
            mobileBreakpoint: 'sm',
            thresholds: { xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920 }
        },
        theme: {
            defaultTheme: themeName,
            themes: {
                modernPastelTheme,
                modernDarkTheme,
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
            global: {
                ripple: true,
                density: 'comfortable'
            },
            VCard: {
                elevation: 0, // Flat design for pastel theme
                rounded: 'lg',
                class: 'modern-card border' // Add border class
            },
            VTextField: {
                variant: 'outlined',
                density: 'compact',
                color: 'primary',
                hideDetails: 'auto'
            },
            VBtn: {
                variant: 'flat',
                color: 'primary',
                class: 'text-none font-weight-bold',
                rounded: 'lg'
            },
            VChip: {
                variant: 'flat',
                rounded: 'lg'
            },
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
    });
}

const vuetify = createCustomVuetify({ themeName: 'modernPastelTheme' });
export default vuetify;
