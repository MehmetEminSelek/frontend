<template>
  <v-container class="py-6 px-2 px-md-8" fluid>
    <!-- Hero Section -->
    <div class="hero-section mb-6">
      <v-card class="pa-6 rounded-xl elevation-4" 
        style="background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%); color: #4A148C; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.08;">
          <v-icon size="120">mdi-account-tie</v-icon>
        </div>
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center mb-3">
              <v-icon size="48" class="mr-3" color="#6A1B9A">mdi-account-tie</v-icon>
              <div>
                <h1 class="text-h3 font-weight-bold mb-1" style="color: #4A148C;">Personel Yönetimi</h1>
                <p class="text-h6 mb-0" style="color: #6A1B9A; opacity: 0.8;">Şirket personeli ve pozisyon yönetimi</p>
              </div>
            </div>
            <div class="d-flex align-center">
              <v-chip color="rgba(74, 20, 140, 0.15)" size="small" class="mr-2" style="color: #4A148C;">
                <v-icon start size="16" color="#6A1B9A">mdi-office-building</v-icon>
                Şube Bazlı
              </v-chip>
              <v-chip color="rgba(74, 20, 140, 0.15)" size="small" style="color: #4A148C;">
                <v-icon start size="16" color="#6A1B9A">mdi-account-plus</v-icon>
                Personel Ekleme
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-center">
            <v-btn size="x-large" color="white" variant="elevated" @click="openNewPersonelDialog" class="font-weight-bold" 
              style="color: #6A1B9A !important; box-shadow: 0 4px 12px rgba(106, 27, 154, 0.2);">
              <v-icon left size="20">mdi-account-plus</v-icon>
              Yeni Personel
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2" style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white;">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon size="40" class="mr-3">mdi-account-check</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ aktifPersonelSayisi }}</div>
                <div class="text-body-2">Aktif Personel</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2" style="background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%); color: white;">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon size="40" class="mr-3">mdi-account-off</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ pasifPersonelSayisi }}</div>
                <div class="text-body-2">Pasif Personel</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2" style="background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%); color: white;">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon size="40" class="mr-3">mdi-office-building</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ toplamSubeSayisi }}</div>
                <div class="text-body-2">Toplam Şube</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="rounded-xl elevation-2" style="background: linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%); color: white;">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-icon size="40" class="mr-3">mdi-account-group</v-icon>
              <div>
                <div class="text-h6 font-weight-bold">{{ toplamPersonelSayisi }}</div>
                <div class="text-body-2">Toplam Personel</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Section -->
    <v-card class="rounded-xl mb-4" elevation="1" style="border: 1px solid #F3E5F5;">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="3">
            <v-select v-model="selectedSube" :items="subeOptions" label="Şube Filtresi" 
              variant="outlined" density="compact" clearable @update:model-value="filterPersonel">
              <template v-slot:prepend-inner>
                <v-icon color="#AB47BC">mdi-office-building</v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="selectedDurum" :items="durumOptions" label="Durum Filtresi" 
              variant="outlined" density="compact" clearable @update:model-value="filterPersonel">
              <template v-slot:prepend-inner>
                <v-icon color="#AB47BC">mdi-account-check</v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="selectedSgk" :items="sgkOptions" label="SGK Durumu" 
              variant="outlined" density="compact" clearable @update:model-value="filterPersonel">
              <template v-slot:prepend-inner>
                <v-icon color="#AB47BC">mdi-shield-account</v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="search" label="Personel Ara" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="compact" clearable />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Main Content Card -->
    <v-card class="rounded-xl" elevation="2" style="border: 1px solid #F3E5F5;">
      <v-card-title class="pa-4 d-flex justify-space-between align-center" 
        style="background: linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%); color: white;">
        <div class="d-flex align-center">
          <v-avatar color="rgba(255,255,255,0.2)" size="40" class="mr-3">
            <v-icon color="white">mdi-table</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h6 font-weight-bold">Personel Listesi</h3>
            <p class="text-body-2 opacity-80 ma-0">{{ filteredPersonel.length }} personel görüntüleniyor</p>
          </div>
        </div>
        <div class="d-flex align-center">
          <v-btn icon="mdi-refresh" variant="flat" color="rgba(255,255,255,0.2)" @click="fetchPersonel" title="Yenile" class="ml-2"></v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-alert v-if="error" type="error" class="mb-4" closable style="border-radius: 8px;">{{ error }}</v-alert>

        <v-data-table :headers="headers" :items="filteredPersonel" :loading="loading" :search="search" item-value="id"
          class="personel-table rounded-lg" hover density="comfortable" items-per-page-text="Sayfa başına personel:"
          :items-per-page="itemsPerPage" no-data-text="Gösterilecek personel kaydı bulunamadı." 
          loading-text="Personel verileri yükleniyor...">
          
          <template v-slot:item.ad="{ item }">
            <div class="d-flex align-center">
              <v-avatar :color="item.aktif ? '#4CAF50' : '#FF9800'" size="40" class="mr-3">
                <span class="font-weight-bold text-white">{{ getInitials(item.ad) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium" style="color: #4A148C;">{{ item.ad }}</div>
                <div class="text-caption" style="color: #7B1FA2;">{{ item.email }}</div>
              </div>
            </div>
          </template>

          <template v-slot:item.sube="{ item }">
            <div v-if="item.sube">
              <v-chip color="#E3F2FD" size="small" style="color: #1976D2;">
                <v-icon start size="16">mdi-office-building</v-icon>
                {{ item.sube.ad }}
              </v-chip>
            </div>
            <span v-else class="text-grey">Şubesiz</span>
          </template>

          <template v-slot:item.aktif="{ item }">
            <v-chip :color="item.aktif ? 'success' : 'warning'" size="small" variant="flat">
              <v-icon start size="16">{{ item.aktif ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
              {{ item.aktif ? 'Aktif' : 'Pasif' }}
            </v-chip>
          </template>

          <template v-slot:item.sgkDurumu="{ item }">
            <v-chip :color="item.sgkDurumu === 'VAR' ? 'primary' : 'error'" size="small" variant="flat">
              <v-icon start size="16">{{ item.sgkDurumu === 'VAR' ? 'mdi-shield-check' : 'mdi-shield-off' }}</v-icon>
              {{ item.sgkDurumu === 'VAR' ? 'SGK Var' : 'SGK Yok' }}
            </v-chip>
          </template>

          <template v-slot:item.gunlukUcret="{ item }">
            <div class="text-right">
              <span class="font-weight-bold" style="color: #2E7D32;">{{ formatCurrency(item.gunlukUcret) }}</span>
              <div class="text-caption text-grey">TL/gün</div>
            </div>
          </template>

          <template v-slot:item.girisYili="{ item }">
            <span class="text-body-2">{{ item.girisYili }}</span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-eye" size="small" color="#2196F3" variant="text" @click="viewPersonel(item)" title="Görüntüle"></v-btn>
            <v-btn icon="mdi-pencil" size="small" color="#7B1FA2" variant="text" @click="editPersonel(item)" title="Düzenle"></v-btn>
            <v-btn icon="mdi-delete" size="small" color="#E91E63" variant="text" @click="deletePersonel(item)" title="Sil"></v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Personel Detail Dialog -->
    <v-dialog v-model="personelDetailDialog" max-width="600px">
      <v-card v-if="selectedPersonel" style="border-radius: 16px; overflow: hidden;">
        <v-card-title class="text-h6 pa-4" style="background: linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%); color: white;">
          <v-avatar :color="selectedPersonel.aktif ? '#4CAF50' : '#FF9800'" size="40" class="mr-3">
            <span class="font-weight-bold text-white">{{ getInitials(selectedPersonel.ad) }}</span>
          </v-avatar>
          {{ selectedPersonel.ad }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Email</div>
                <div class="font-weight-medium">{{ selectedPersonel.email }}</div>
              </div>
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Kullanıcı Adı</div>
                <div class="font-weight-medium">{{ selectedPersonel.username }}</div>
              </div>
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Şube</div>
                <v-chip v-if="selectedPersonel.sube" color="#E3F2FD" size="small" style="color: #1976D2;">
                  <v-icon start size="16">mdi-office-building</v-icon>
                  {{ selectedPersonel.sube.ad }}
                </v-chip>
                <span v-else class="text-grey">Şubesiz</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Durum</div>
                <v-chip :color="selectedPersonel.aktif ? 'success' : 'warning'" size="small" variant="flat">
                  <v-icon start size="16">{{ selectedPersonel.aktif ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
                  {{ selectedPersonel.aktif ? 'Aktif' : 'Pasif' }}
                </v-chip>
              </div>
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">SGK Durumu</div>
                <v-chip :color="selectedPersonel.sgkDurumu === 'VAR' ? 'primary' : 'error'" size="small" variant="flat">
                  <v-icon start size="16">{{ selectedPersonel.sgkDurumu === 'VAR' ? 'mdi-shield-check' : 'mdi-shield-off' }}</v-icon>
                  {{ selectedPersonel.sgkDurumu === 'VAR' ? 'SGK Var' : 'SGK Yok' }}
                </v-chip>
              </div>
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Günlük Ücret</div>
                <div class="font-weight-bold text-h6" style="color: #2E7D32;">{{ formatCurrency(selectedPersonel.gunlukUcret) }} TL/gün</div>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Giriş Yılı</div>
                <div class="font-weight-medium">{{ selectedPersonel.girisYili }}</div>
              </div>
              <div class="mb-4">
                <div class="text-caption text-grey mb-1">Rol</div>
                <v-chip color="#F3E5F5" size="small" style="color: #7B1FA2;">
                  <v-icon start size="16">mdi-account-tie</v-icon>
                  {{ getRoleText(selectedPersonel.role) }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="personelDetailDialog = false" style="color: #7B1FA2;">Kapat</v-btn>
          <v-btn @click="editPersonel(selectedPersonel)" style="background: #AB47BC; color: white;">
            <v-icon left>mdi-pencil</v-icon>
            Düzenle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Personel Dialog -->
    <v-dialog v-model="personelDialog" persistent max-width="600px">
      <v-card style="border-radius: 16px; overflow: hidden;">
        <v-card-title class="text-h6" style="background: linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%); color: white;">
          {{ editingPersonel ? 'Personel Düzenle' : 'Yeni Personel Ekle' }}
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="personelFormRef" v-model="validForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="personelForm.ad" label="Ad Soyad" :rules="[rules.required]" 
                  variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="personelForm.email" label="Email" :rules="[rules.required, rules.email]" 
                  variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="personelForm.username" label="Kullanıcı Adı" :rules="[rules.required]" 
                  variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-if="!editingPersonel" v-model="personelForm.password" label="Şifre" type="password" 
                  :rules="[rules.required, rules.minLength]" variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="personelForm.subeId" :items="subeOptions" label="Şube" 
                  variant="outlined" color="#AB47BC" clearable />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="personelForm.role" :items="roleOptions" item-title="text" item-value="value" 
                  label="Rol" :rules="[rules.required]" variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="personelForm.gunlukUcret" label="Günlük Ücret (TL)" type="number" 
                  variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="personelForm.sgkDurumu" :items="sgkOptions" label="SGK Durumu" 
                  variant="outlined" color="#AB47BC" />
              </v-col>
              <v-col cols="12">
                <v-switch v-model="personelForm.aktif" label="Aktif Personel" color="#AB47BC" />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="closePersonelDialog" style="color: #7B1FA2;">İptal</v-btn>
          <v-btn @click="savePersonel" :loading="personelDialogLoading" :disabled="!validForm" 
            style="background: #AB47BC; color: white;">
            {{ editingPersonel ? 'Güncelle' : 'Ekle' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, provide, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createCustomVuetify } from '../plugins/vuetify';
import { apiCall } from '@/utils/api';

// Personel yönetimi modülüne özel tema ile Vuetify instance'ı oluştur
const personelTheme = {
  dark: false,
  colors: {
    primary: '#8e24aa', // Mor
    secondary: '#ede7f6', // Açık lila
    accent: '#ce93d8',
    error: '#D32F2F',
    info: '#8e24aa',
    success: '#388E3C',
    warning: '#FBC02D',
    background: '#f8f5fc',
    surface: '#FFFFFF',
  },
};
const personelVuetify = createCustomVuetify({ themeName: 'personelTheme', extraThemes: { personelTheme } });
provide('vuetify', personelVuetify);

const headers = [
  { title: 'Personel', key: 'ad', sortable: true },
  { title: 'Şube', key: 'sube', sortable: true },
  { title: 'Durum', key: 'aktif', sortable: true },
  { title: 'SGK', key: 'sgkDurumu', sortable: true },
  { title: 'Günlük Ücret', key: 'gunlukUcret', sortable: true },
  { title: 'Giriş Yılı', key: 'girisYili', sortable: true },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
];

const personel = ref([]);
const subeler = ref([]);
const loading = ref(true);
const error = ref(null);
const search = ref('');
const selectedSube = ref(null);
const selectedDurum = ref(null);
const selectedSgk = ref(null);
const personelDialog = ref(false);
const personelDetailDialog = ref(false);
const personelDialogLoading = ref(false);
const editingPersonel = ref(null);
const selectedPersonel = ref(null);
const validForm = ref(false);
const itemsPerPage = ref(15);

const personelForm = ref({ 
  ad: '', 
  email: '', 
  username: '', 
  password: '', 
  role: 'ADMIN',
  subeId: null,
  gunlukUcret: 0,
  sgkDurumu: 'VAR',
  aktif: true
});

const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);

const router = useRouter();

// Form validation rules
const rules = {
  required: value => !!value || 'Bu alan gereklidir',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Geçerli bir email adresi giriniz';
  },
  minLength: value => value?.length >= 6 || 'En az 6 karakter olmalıdır'
};

// Options
const roleOptions = [
  { text: 'Admin', value: 'ADMIN' },
  { text: 'Müdür', value: 'MANAGER' },
  { text: 'Kullanıcı', value: 'USER' },
  { text: 'Üretim', value: 'PRODUCTION' },
  { text: 'Satış', value: 'SALES' },
  { text: 'Muhasebe', value: 'ACCOUNTING' }
];

const durumOptions = [
  { title: 'Aktif', value: true },
  { title: 'Pasif', value: false }
];

const sgkOptions = [
  { title: 'SGK Var', value: 'VAR' },
  { title: 'SGK Yok', value: 'YOK' }
];

// Computed properties
const subeOptions = computed(() => {
  return subeler.value.map(sube => ({
    title: sube.ad,
    value: sube.id
  }));
});

const filteredPersonel = computed(() => {
  let filtered = [...personel.value];
  
  if (selectedSube.value) {
    filtered = filtered.filter(p => p.subeId === selectedSube.value);
  }
  
  if (selectedDurum.value !== null) {
    filtered = filtered.filter(p => p.aktif === selectedDurum.value);
  }
  
  if (selectedSgk.value) {
    filtered = filtered.filter(p => p.sgkDurumu === selectedSgk.value);
  }
  
  return filtered;
});

const toplamPersonelSayisi = computed(() => personel.value.length);
const aktifPersonelSayisi = computed(() => personel.value.filter(p => p.aktif).length);
const pasifPersonelSayisi = computed(() => personel.value.filter(p => !p.aktif).length);
const toplamSubeSayisi = computed(() => subeler.value.length);

// Methods
function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}

function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function getRoleText(role) {
  const roleMap = {
    'ADMIN': 'Admin',
    'MANAGER': 'Müdür',
    'USER': 'Kullanıcı',
    'PRODUCTION': 'Üretim',
    'SALES': 'Satış',
    'ACCOUNTING': 'Muhasebe'
  };
  return roleMap[role] || role;
}

async function fetchPersonel() {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await apiCall('/auth/users', {}, 'GET');
    personel.value = response.data;
    
  } catch (err) {
    console.error('Personel verileri yüklenirken hata:', err);
    error.value = 'Personel verileri yüklenirken bir hata oluştu';
    showSnackbar('Personel verileri yüklenirken hata oluştu', 'error');
  } finally {
    loading.value = false;
  }
}

async function fetchSubeler() {
  try {
    const response = await apiCall('/dropdown', {}, 'GET');
    subeler.value = response.data.subeler || [];
  } catch (err) {
    console.error('Şube verileri yüklenirken hata:', err);
  }
}

function filterPersonel() {
  // Filtering is handled by computed property
}

function openNewPersonelDialog() {
  editingPersonel.value = null;
  personelForm.value = { 
    ad: '', 
    email: '', 
    username: '', 
    password: '', 
    role: 'ADMIN',
    subeId: null,
    gunlukUcret: 0,
    sgkDurumu: 'VAR',
    aktif: true
  };
  personelDialog.value = true;
}

function viewPersonel(item) {
  selectedPersonel.value = item;
  personelDetailDialog.value = true;
}

function editPersonel(item) {
  editingPersonel.value = item;
  personelForm.value = {
    ad: item.ad,
    email: item.email,
    username: item.username,
    password: '',
    role: item.role,
    subeId: item.subeId,
    gunlukUcret: item.gunlukUcret || 0,
    sgkDurumu: item.sgkDurumu || 'VAR',
    aktif: item.aktif
  };
  personelDetailDialog.value = false;
  personelDialog.value = true;
}

function closePersonelDialog() {
  personelDialog.value = false;
  editingPersonel.value = null;
  personelForm.value = { 
    ad: '', 
    email: '', 
    username: '', 
    password: '', 
    role: 'ADMIN',
    subeId: null,
    gunlukUcret: 0,
    sgkDurumu: 'VAR',
    aktif: true
  };
}

async function savePersonel() {
  try {
    personelDialogLoading.value = true;
    
    const data = { ...personelForm.value };
    
    if (editingPersonel.value) {
      // Update existing personel
      await apiCall(`/auth/users/${editingPersonel.value.id}`, data, 'PUT');
      showSnackbar('Personel başarıyla güncellendi', 'success');
    } else {
      // Create new personel
      await apiCall('/auth/users', data, 'POST');
      showSnackbar('Yeni personel başarıyla eklendi', 'success');
    }
    
    closePersonelDialog();
    await fetchPersonel();
    
  } catch (err) {
    console.error('Personel kaydedilirken hata:', err);
    showSnackbar('Personel kaydedilirken hata oluştu', 'error');
  } finally {
    personelDialogLoading.value = false;
  }
}

async function deletePersonel(item) {
  if (confirm(`${item.ad} adlı personeli silmek istediğinizden emin misiniz?`)) {
    try {
      await apiCall(`/auth/users/${item.id}`, {}, 'DELETE');
      showSnackbar('Personel başarıyla silindi', 'success');
      await fetchPersonel();
    } catch (err) {
      console.error('Personel silinirken hata:', err);
      showSnackbar('Personel silinirken hata oluştu', 'error');
    }
  }
}

onMounted(async () => {
  await Promise.all([
    fetchPersonel(),
    fetchSubeler()
  ]);
});
</script>

<style scoped>
.hero-section {
  margin-bottom: 24px;
}

.personel-table {
  background: white;
  border-radius: 12px;
}

.personel-table :deep(.v-data-table__td) {
  border-bottom: 1px solid #F3E5F5 !important;
}

.personel-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #4A148C;
}

.personel-table :deep(.v-data-table__tr:hover) {
  background-color: #F9F5FF !important;
}
</style>