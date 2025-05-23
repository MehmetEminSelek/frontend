<template>
  <v-container class="login-bg fill-height d-flex align-center justify-center">
    <v-card class="pa-8 login-card" max-width="2000" elevation="4">
      <v-card-title class="text-h4 font-weight-bold mb-6 text-center">Giriş Yap</v-card-title>
      <v-form @submit.prevent="login" class="login-form-flex">
        <v-text-field v-model="email" label="Kullanıcı Adı veya Email" placeholder="Kullanıcı Adı veya Email"
          prepend-inner-icon="mdi-account" required class="mb-5 login-input" density="comfortable" hide-details />
        <v-text-field v-model="password" label="Şifre" placeholder="Şifre" prepend-inner-icon="mdi-lock" type="password"
          required class="mb-5 login-input" density="comfortable" hide-details />
        <v-alert v-if="error" type="error" dense class="mb-5 text-center">{{ error }}</v-alert>
        <v-btn color="success" type="submit" :loading="loading" block size="x-large" class="login-btn">GİRİŞ YAP</v-btn>
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
<style scoped>
.login-bg {
  background: linear-gradient(135deg, #f4f8f3 0%, #e9d8a6 100%);
  min-height: 100vh;
}

.login-card {
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(123, 174, 127, 0.12);
  width: 100%;
  max-width: 2000px;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-form-flex {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-input {
  width: 80%;
  font-size: 1.3em;
}

.login-btn {
  font-size: 1.3em;
  font-weight: bold;
  letter-spacing: 0.04em;
  padding: 18px 0;
  width: 80%;
}

.v-card-title {
  font-size: 2.5em !important;
  letter-spacing: 0.02em;
  width: 100%;
}

@media (max-width: 900px) {
  .login-card {
    min-width: 90vw;
    max-width: 98vw;
  }

  .login-input,
  .login-btn {
    width: 98%;
  }
}
</style>