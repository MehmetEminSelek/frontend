<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>Kullanıcı Yönetimi</span>
        <div>
          <v-btn color="info" class="elevation-1 mr-2" @click="downloadExcelTemplate">
            <v-icon left>mdi-download</v-icon>Excel Şablonunu İndir
          </v-btn>
          <input ref="excelInput" type="file" accept=".xlsx" style="display:none" @change="onExcelFileChange" />
          <v-btn color="success" class="elevation-1 mr-2" @click="triggerExcelInput">
            <v-icon left>mdi-upload</v-icon>Excel'den Yükle
          </v-btn>
          <v-btn color="primary" @click="openUserDialog()">Yeni Kullanıcı</v-btn>
        </div>
      </v-card-title>
      <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
      <v-alert v-if="excelResults.length > 0" type="info" border="left" prominent class="my-2">
        <div v-for="(r, i) in excelResults" :key="i">
          <span v-if="r.status === 'ok'" class="text-success">✔</span>
          <span v-else-if="r.status === 'skipped'" class="text-warning">⏭</span>
          <span v-else class="text-error">✖</span>
          {{ r.email }} - {{ r.ad }} <span v-if="r.message">({{ r.message }})</span>
        </div>
      </v-alert>
      <v-data-table :headers="headers" :items="users" :loading="loading" item-value="id" class="elevation-1" hover
        density="comfortable" items-per-page="50" no-data-text="Kullanıcı yok."
        loading-text="Kullanıcılar yükleniyor..." show-select v-model:selected="selectedUsers">
        <template v-slot:top>
          <v-btn v-if="selectedUsers.length > 0" color="error" class="mb-2" @click="deleteSelectedUsers">
            <v-icon left>mdi-delete</v-icon>Seçilenleri Sil ({{ selectedUsers.length }})
          </v-btn>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" color="primary" variant="text" @click="openUserDialog(item)"
            title="Düzenle"></v-btn>
          <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="deleteUser(item)"
            title="Sil"></v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="userDialog" persistent max-width="400px">
      <v-card>
        <v-card-title class="text-h6">{{ editingUser ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="userForm.ad" label="Ad" required class="mb-2" />
          <v-text-field v-model="userForm.email" label="Email" type="email" required class="mb-2" />
          <v-select v-model="userForm.role" :items="roles" label="Rol" required class="mb-2" />
          <v-text-field v-model="userForm.password" label="Şifre" type="password" :required="!editingUser"
            class="mb-2" />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="closeUserDialog">İptal</v-btn>
          <v-btn color="primary" variant="flat" @click="saveUserDialog" :loading="userDialogLoading">Kaydet</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar" :timeout="snackbarTimeout" :color="snackbarColor" location="bottom right" multi-line>
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn :color="snackbarColor === 'error' ? 'white' : 'primary'" variant="text"
          @click="snackbar = false">Kapat</v-btn>
      </template>
    </v-snackbar>
    <ExcelLoadingScreen 
      :show="loadingExcel"
      title="Kullanıcılar Yükleniyor"
      subtitle="Excel dosyasından kullanıcılar okunuyor ve sisteme ekleniyor..."
      :stats="excelLoadingStats"
    />
  </v-container>
</template>
<script setup>
import { ref, onMounted, provide } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { createCustomVuetify } from '../plugins/vuetify';
import ExcelLoadingScreen from '../components/ExcelLoadingScreen.vue';

// Kullanıcı yönetimi modülüne özel tema ile Vuetify instance'ı oluştur
const kullaniciTheme = {
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
const kullaniciVuetify = createCustomVuetify({ themeName: 'kullaniciTheme', extraThemes: { kullaniciTheme } });
provide('vuetify', kullaniciVuetify);

const headers = [
  { title: 'Ad', key: 'ad', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Oluşturulma', key: 'createdAt', sortable: true },
  { title: 'İşlemler', key: 'actions', sortable: false, align: 'end' },
];
const users = ref([]);
const loading = ref(true);
const error = ref(null);
const roles = ['admin', 'mudur', 'user'];
const userDialog = ref(false);
const userDialogLoading = ref(false);
const editingUser = ref(null);
const userForm = ref({ ad: '', email: '', password: '', role: 'user' });
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const snackbarTimeout = ref(4000);
const router = useRouter();
const excelInput = ref(null);
const excelResults = ref([]);
const loadingExcel = ref(false);
const excelLoadingStats = ref(null);
const selectedUsers = ref([]);
const isAdmin = ref(false);

function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}
function checkAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    showSnackbar('Bu sayfaya erişim için admin veya superadmin olmalısınız.', 'error');
    setTimeout(() => router.push({ name: 'StokYonetimi' }), 1500);
    return false;
  }
  return true;
}
async function fetchUsers() {
  if (!checkAdmin()) return;
  loading.value = true; error.value = null;
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, { headers: { Authorization: 'Bearer ' + token } });
    users.value = res.data;
  } catch (err) {
    error.value = 'Kullanıcılar yüklenirken hata oluştu.';
    users.value = [];
  } finally {
    loading.value = false;
  }
}
function openUserDialog(user = null) {
  editingUser.value = user;
  userForm.value = user ? { ad: user.ad, email: user.email, password: '', role: user.role } : { ad: '', email: '', password: '', role: 'user' };
  userDialog.value = true;
}
function closeUserDialog() {
  userDialog.value = false;
  editingUser.value = null;
  userForm.value = { ad: '', email: '', password: '', role: 'user' };
}
async function saveUserDialog() {
  userDialogLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (editingUser.value) {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, { id: editingUser.value.id, ...userForm.value }, { headers: { Authorization: 'Bearer ' + token } });
      showSnackbar('Kullanıcı güncellendi!', 'success');
    } else {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, userForm.value, { headers: { Authorization: 'Bearer ' + token } });
      showSnackbar('Kullanıcı eklendi!', 'success');
    }
    closeUserDialog();
    fetchUsers();
  } catch (err) {
    showSnackbar('Kullanıcı kaydedilirken hata oluştu.', 'error');
  } finally {
    userDialogLoading.value = false;
  }
}
async function deleteUser(user) {
  // if (!confirm('Kullanıcı silinsin mi?')) return;
  // TODO: Vue dialog ile onay alınmalı!
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, { data: { id: user.id }, headers: { Authorization: 'Bearer ' + token } });
    showSnackbar('Kullanıcı silindi!', 'success');
    fetchUsers();
  } catch (err) {
    showSnackbar('Kullanıcı silinirken hata oluştu.', 'error');
  }
}
function triggerExcelInput() {
  excelInput.value && excelInput.value.click();
}
async function downloadExcelTemplate() {
  try {
    const res = await axios.get('/api/excel/template/kullanici', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kullanici-sablon.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    showSnackbar('Şablon indirilemedi.', 'error');
  }
}
async function onExcelFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  loadingExcel.value = true;
  excelLoadingStats.value = null;
  
  try {
    // Simulate file reading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const res = await axios.post('/api/excel/upload/kullanici', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    
    const results = res.data.results || [];
    excelResults.value = results;
    
    // Calculate stats for loading screen
    const stats = {
      success: results.filter(r => r.status === 'ok').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length
    };
    excelLoadingStats.value = stats;
    
    // Show stats for a moment before closing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    showSnackbar(
      `Excel yükleme tamamlandı! ${stats.success} başarılı, ${stats.skipped} atlandı, ${stats.errors} hata`, 
      stats.errors > 0 ? 'warning' : 'success'
    );
    
    fetchUsers();
  } catch (err) {
    showSnackbar('Excel yüklenemedi: ' + (err.response?.data?.error || err.message), 'error');
    excelResults.value = [];
    excelLoadingStats.value = null;
  } finally {
    loadingExcel.value = false;
    // Reset file input
    if (e.target) e.target.value = '';
  }
}
async function deleteSelectedUsers() {
  if (selectedUsers.value.length === 0) return;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // Kendi id'sini silmeye izin verme
  const idsToDelete = selectedUsers.value.filter(id => id !== user.id);
  if (idsToDelete.length === 0) {
    showSnackbar('Kendi hesabınızı silemezsiniz.', 'error');
    return;
  }
  if (!confirm('Seçili kullanıcılar silinsin mi?')) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, { data: { ids: idsToDelete }, headers: { Authorization: 'Bearer ' + token } });
    showSnackbar('Seçili kullanıcılar silindi!', 'success');
    selectedUsers.value = [];
    fetchUsers();
  } catch (err) {
    showSnackbar('Toplu silme sırasında hata oluştu.', 'error');
  }
}
onMounted(() => {
  fetchUsers();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  isAdmin.value = user && (user.role === 'admin' || user.role === 'superadmin');
});
</script>

<style scoped>
.v-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(142, 36, 170, 0.08);
  background: #fff;
  transition: box-shadow 0.2s;
}

.v-card:hover {
  box-shadow: 0 4px 16px rgba(142, 36, 170, 0.16);
}

.v-btn {
  transition: background 0.2s, box-shadow 0.2s;
}

.v-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 8px rgba(142, 36, 170, 0.10);
}

.v-avatar {
  font-weight: bold;
  font-size: 1.2em;
}

.v-data-table {
  border-radius: 12px;
  background: #fff;
}

.v-data-table th {
  background: #ede7f6 !important;
  color: #8e24aa !important;
  font-weight: bold;
}

.v-chip {
  border-radius: 8px;
  font-weight: 500;
}

.v-card-title.bg-primary {
  background: #8e24aa !important;
  color: #fff !important;
  border-radius: 12px 12px 0 0;
}
</style>