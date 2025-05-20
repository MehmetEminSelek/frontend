<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-6" max-width="400" elevation="2">
      <v-card-title class="text-h5 font-weight-bold mb-4">Giriş Yap</v-card-title>
      <v-form @submit.prevent="login">
        <v-text-field v-model="email" label="Email" type="email" required prepend-inner-icon="mdi-email" class="mb-3" />
        <v-text-field v-model="password" label="Şifre" type="password" required prepend-inner-icon="mdi-lock"
          class="mb-3" />
        <v-btn color="primary" type="submit" :loading="loading" block>Giriş Yap</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const router = useRouter();
async function login() {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post('http://localhost:3000/api/auth/login', { email: email.value, password: password.value });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    router.push({ name: 'StokYonetimi' });
  } catch (err) {
    error.value = err.response?.data?.message || 'Giriş başarısız.';
  } finally {
    loading.value = false;
  }
}
</script>