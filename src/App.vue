<template>
  <div id="app">
    <Suspense>
      <template #default>
        <router-view />
      </template>
      <template #fallback>
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>