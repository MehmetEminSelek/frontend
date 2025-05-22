<template>
  <v-container class="py-6 px-4" fluid>
    <v-card class="pa-4 rounded-lg" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4 d-flex justify-space-between align-center">
        <span>Kullanıcı Yönetimi</span>
        <v-btn color="primary" @click="openUserDialog()">Yeni Kullanıcı</v-btn>
      </v-card-title>
      <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
      <v-data-table :headers="headers" :items="users" :loading="loading" item-value="id" class="elevation-1" hover
        density="comfortable" items-per-page="50" no-data-text="Kullanıcı yok."
        loading-text="Kullanıcılar yükleniyor...">
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
  </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
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
function showSnackbar(text, color = 'info', timeout = 4000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}
function checkAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user || user.role !== 'admin') {
    showSnackbar('Bu sayfaya erişim için admin olmalısınız.', 'error');
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
    const res = await axios.get('http://localhost:3000/api/auth/users', { headers: { Authorization: 'Bearer ' + token } });
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
      await axios.patch('http://localhost:3000/api/auth/users', { id: editingUser.value.id, ...userForm.value }, { headers: { Authorization: 'Bearer ' + token } });
      showSnackbar('Kullanıcı güncellendi!', 'success');
    } else {
      await axios.post('http://localhost:3000/api/auth/users', userForm.value, { headers: { Authorization: 'Bearer ' + token } });
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
    await axios.delete('http://localhost:3000/api/auth/users', { data: { id: user.id }, headers: { Authorization: 'Bearer ' + token } });
    showSnackbar('Kullanıcı silindi!', 'success');
    fetchUsers();
  } catch (err) {
    showSnackbar('Kullanıcı silinirken hata oluştu.', 'error');
  }
}
onMounted(fetchUsers);
</script>