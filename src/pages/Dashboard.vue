<template>
  <div class="dashboard-container">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          Hoş Geldiniz, <span class="user-name">{{ userName }}</span>! 👋
        </h1>
        <p class="welcome-subtitle">
          {{ currentDate }} • {{ greeting }}
        </p>
      </div>
      <div class="quick-stats">
        <div class="stat-pill" v-if="stats.pendingOrders > 0">
          <span class="stat-icon">📋</span>
          <span class="stat-value">{{ stats.pendingOrders }}</span>
          <span class="stat-label">Bekleyen</span>
        </div>
        <div class="stat-pill warning" v-if="stats.criticalStock > 0">
          <span class="stat-icon">⚠️</span>
          <span class="stat-value">{{ stats.criticalStock }}</span>
          <span class="stat-label">Kritik Stok</span>
        </div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="cards-grid">
      <!-- Sipariş Formu -->
      <div 
        class="dashboard-card card-primary" 
        @click="navigateTo('SiparisFormu')"
        v-if="canAccess('siparis-formu')"
      >
        <div class="card-icon">
          <span>📝</span>
        </div>
        <div class="card-content">
          <h3>Sipariş Ekle</h3>
          <p>Yeni sipariş oluştur</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Onay Bekleyenler -->
      <div 
        class="dashboard-card card-warning" 
        @click="navigateTo('OnayBekleyenler')"
        v-if="canAccess('onay-bekleyenler')"
      >
        <div class="card-icon">
          <span>⏳</span>
        </div>
        <div class="card-content">
          <h3>Onay Bekleyenler</h3>
          <p>{{ stats.pendingOrders }} sipariş bekliyor</p>
        </div>
        <div class="card-badge" v-if="stats.pendingOrders > 0">{{ stats.pendingOrders }}</div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Hazırlanacaklar -->
      <div 
        class="dashboard-card card-info" 
        @click="navigateTo('Hazirlanacaklar')"
        v-if="canAccess('hazirlanacak')"
      >
        <div class="card-icon">
          <span>🍳</span>
        </div>
        <div class="card-content">
          <h3>Hazırlanacaklar</h3>
          <p>Üretim kuyruğu</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Tüm Siparişler -->
      <div 
        class="dashboard-card card-secondary" 
        @click="navigateTo('TumSiparisler')"
        v-if="canAccess('tum-siparisler')"
      >
        <div class="card-icon">
          <span>📋</span>
        </div>
        <div class="card-content">
          <h3>Tüm Siparişler</h3>
          <p>Sipariş geçmişi</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Stok Yönetimi -->
      <div 
        class="dashboard-card card-danger" 
        @click="navigateTo('StokYonetimi')"
        v-if="canAccess('stok-yonetimi')"
      >
        <div class="card-icon">
          <span>📦</span>
        </div>
        <div class="card-content">
          <h3>Stok Yönetimi</h3>
          <p v-if="stats.criticalStock > 0" class="text-warning">{{ stats.criticalStock }} kritik malzeme</p>
          <p v-else>Malzeme takibi</p>
        </div>
        <div class="card-badge danger" v-if="stats.criticalStock > 0">{{ stats.criticalStock }}</div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Cari Yönetimi -->
      <div 
        class="dashboard-card card-purple" 
        @click="navigateTo('CariYonetimi')"
        v-if="canAccess('cari-yonetimi')"
      >
        <div class="card-icon">
          <span>👥</span>
        </div>
        <div class="card-content">
          <h3>Cari Yönetimi</h3>
          <p>Müşteri işlemleri</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Kargo Operasyon -->
      <div 
        class="dashboard-card card-teal" 
        @click="navigateTo('KargoOperasyon')"
        v-if="canAccess('kargo-operasyon')"
      >
        <div class="card-icon">
          <span>🚚</span>
        </div>
        <div class="card-content">
          <h3>Kargo Operasyon</h3>
          <p>Sevkiyat takibi</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Ürün Yönetimi -->
      <div 
        class="dashboard-card card-orange" 
        @click="navigateTo('UrunYonetimi')"
        v-if="canAccess('urun-yonetimi')"
      >
        <div class="card-icon">
          <span>🍰</span>
        </div>
        <div class="card-content">
          <h3>Ürün Yönetimi</h3>
          <p>Ürün katalog</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Reçete Yönetimi -->
      <div 
        class="dashboard-card card-pink" 
        @click="navigateTo('ReceteYonetimi')"
        v-if="canAccess('recete-yonetimi')"
      >
        <div class="card-icon">
          <span>📖</span>
        </div>
        <div class="card-content">
          <h3>Reçete Yönetimi</h3>
          <p>Üretim reçeteleri</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Masraf Yönetimi -->
      <div 
        class="dashboard-card card-green" 
        @click="navigateTo('MasrafYonetimi')"
        v-if="canAccess('masraf-yonetimi')"
      >
        <div class="card-icon">
          <span>💰</span>
        </div>
        <div class="card-content">
          <h3>Masraf Yönetimi</h3>
          <p>Gider takibi</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Satış Raporu -->
      <div 
        class="dashboard-card card-indigo" 
        @click="navigateTo('SatisRaporu')"
        v-if="canAccess('satis-raporu')"
      >
        <div class="card-icon">
          <span>📊</span>
        </div>
        <div class="card-content">
          <h3>Satış Raporu</h3>
          <p>Analiz ve raporlar</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Fiyat Yönetimi -->
      <div 
        class="dashboard-card card-cyan" 
        @click="navigateTo('FiyatYönetimi')"
        v-if="canAccess('fiyat-yonetimi')"
      >
        <div class="card-icon">
          <span>💵</span>
        </div>
        <div class="card-content">
          <h3>Fiyat Yönetimi</h3>
          <p>Fiyat güncellemeleri</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Üretim Planı -->
      <div 
        class="dashboard-card card-amber" 
        @click="navigateTo('UretimPlani')"
        v-if="canAccess('uretim-plani')"
      >
        <div class="card-icon">
          <span>🏭</span>
        </div>
        <div class="card-content">
          <h3>Üretim Planı</h3>
          <p>Günlük üretim</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>

      <!-- Personel Yönetimi -->
      <div 
        class="dashboard-card card-slate" 
        @click="navigateTo('PersonelYonetimi')"
        v-if="canAccess('kullanici-yonetimi')"
      >
        <div class="card-icon">
          <span>👤</span>
        </div>
        <div class="card-content">
          <h3>Personel Yönetimi</h3>
          <p>Kullanıcı işlemleri</p>
        </div>
        <div class="card-arrow">→</div>
        <div class="card-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../utils/api.js'

const router = useRouter()
const authStore = useAuthStore()

// Stats
const stats = ref({
  pendingOrders: 0,
  criticalStock: 0,
  todayOrders: 0
})

// User name
const userName = computed(() => {
  return authStore.user?.ad || 'Kullanıcı'
})

// Current date
const currentDate = computed(() => {
  const now = new Date()
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return now.toLocaleDateString('tr-TR', options)
})

// Greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Günaydın ☀️'
  if (hour < 18) return 'İyi günler 🌤️'
  return 'İyi akşamlar 🌙'
})

// Permission check
const canAccess = (page) => {
  return authStore.canAccess(page)
}

// Navigation
const navigateTo = (routeName) => {
  router.push({ name: routeName })
}

// Load stats
const loadStats = async () => {
  try {
    // Stok uyarıları
    const stokRes = await api.get('/stok/alerts')
    if (stokRes.data?.success) {
      stats.value.criticalStock = stokRes.data.toplamUyari || 0
    }
  } catch (e) {
    console.log('Stats yüklenemedi:', e)
  }

  try {
    // Bekleyen siparişler - basit count
    const ordersRes = await api.get('/siparis?durum=ONAY_BEKLEYEN&limit=1')
    if (ordersRes.data?.pagination?.total) {
      stats.value.pendingOrders = ordersRes.data.pagination.total
    }
  } catch (e) {
    console.log('Sipariş stats yüklenemedi:', e)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
/* ========== DASHBOARD STYLES ========== */
.dashboard-container {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}

/* ========== WELCOME SECTION ========== */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(93, 135, 255, 0.08) 0%, rgba(73, 190, 255, 0.08) 100%);
  border: 1px solid rgba(93, 135, 255, 0.15);
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1e293b;
}

.user-name {
  background: linear-gradient(135deg, #5D87FF 0%, #49BEFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 14px;
  margin: 0;
  color: #64748b;
}

.quick-stats {
  display: flex;
  gap: 12px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(99, 102, 241, 0.12);
  border-radius: 30px;
  border: 1px solid rgba(99, 102, 241, 0.25);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.stat-pill:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.stat-pill.warning {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}

.stat-icon {
  font-size: 18px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Dashboard Card */
.dashboard-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
}

.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: rgba(93, 135, 255, 0.2);
}

.dashboard-card:hover .card-glow {
  opacity: 0.8;
}

.dashboard-card:hover .card-arrow {
  transform: translateX(3px);
  opacity: 1;
}

.dashboard-card:hover .card-icon span {
  transform: scale(1.08);
}

/* Card Icon */
.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  margin-right: 16px;
}

.card-icon span {
  font-size: 28px;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Card Content */
.card-content {
  flex: 1;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1e293b;
}

.card-content p {
  font-size: 13px;
  margin: 0;
  color: #64748b;
}

.card-content p.text-warning {
  color: #f59e0b !important;
}

/* Card Arrow */
.card-arrow {
  font-size: 20px;
  color: #94a3b8;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Card Badge */
.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #6366f1;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.card-badge.danger {
  background: #ef4444;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* Card Glow Effect */
.card-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  pointer-events: none;
}

/* ========== CARD COLOR VARIANTS ========== */
.card-primary .card-icon { background: rgba(99, 102, 241, 0.15); }
.card-primary:hover { border-color: rgba(99, 102, 241, 0.5) !important; }
.card-primary .card-glow { background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 70%); }

.card-warning .card-icon { background: rgba(245, 158, 11, 0.15); }
.card-warning:hover { border-color: rgba(245, 158, 11, 0.5) !important; }
.card-warning .card-glow { background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 70%); }

.card-info .card-icon { background: rgba(14, 165, 233, 0.15); }
.card-info:hover { border-color: rgba(14, 165, 233, 0.5) !important; }
.card-info .card-glow { background: radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.12) 0%, transparent 70%); }

.card-secondary .card-icon { background: rgba(100, 116, 139, 0.15); }
.card-secondary:hover { border-color: rgba(100, 116, 139, 0.5) !important; }
.card-secondary .card-glow { background: radial-gradient(circle at 50% 50%, rgba(100, 116, 139, 0.12) 0%, transparent 70%); }

.card-danger .card-icon { background: rgba(239, 68, 68, 0.15); }
.card-danger:hover { border-color: rgba(239, 68, 68, 0.5) !important; }
.card-danger .card-glow { background: radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.12) 0%, transparent 70%); }

.card-purple .card-icon { background: rgba(168, 85, 247, 0.15); }
.card-purple:hover { border-color: rgba(168, 85, 247, 0.5) !important; }
.card-purple .card-glow { background: radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12) 0%, transparent 70%); }

.card-teal .card-icon { background: rgba(20, 184, 166, 0.15); }
.card-teal:hover { border-color: rgba(20, 184, 166, 0.5) !important; }
.card-teal .card-glow { background: radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.12) 0%, transparent 70%); }

.card-orange .card-icon { background: rgba(249, 115, 22, 0.15); }
.card-orange:hover { border-color: rgba(249, 115, 22, 0.5) !important; }
.card-orange .card-glow { background: radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.12) 0%, transparent 70%); }

.card-pink .card-icon { background: rgba(236, 72, 153, 0.15); }
.card-pink:hover { border-color: rgba(236, 72, 153, 0.5) !important; }
.card-pink .card-glow { background: radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.12) 0%, transparent 70%); }

.card-green .card-icon { background: rgba(34, 197, 94, 0.15); }
.card-green:hover { border-color: rgba(34, 197, 94, 0.5) !important; }
.card-green .card-glow { background: radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.12) 0%, transparent 70%); }

.card-indigo .card-icon { background: rgba(79, 70, 229, 0.15); }
.card-indigo:hover { border-color: rgba(79, 70, 229, 0.5) !important; }
.card-indigo .card-glow { background: radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.12) 0%, transparent 70%); }

.card-cyan .card-icon { background: rgba(6, 182, 212, 0.15); }
.card-cyan:hover { border-color: rgba(6, 182, 212, 0.5) !important; }
.card-cyan .card-glow { background: radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.12) 0%, transparent 70%); }

.card-amber .card-icon { background: rgba(245, 158, 11, 0.15); }
.card-amber:hover { border-color: rgba(245, 158, 11, 0.5) !important; }
.card-amber .card-glow { background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 70%); }

.card-slate .card-icon { background: rgba(71, 85, 105, 0.15); }
.card-slate:hover { border-color: rgba(71, 85, 105, 0.5) !important; }
.card-slate .card-glow { background: radial-gradient(circle at 50% 50%, rgba(71, 85, 105, 0.12) 0%, transparent 70%); }

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .quick-stats {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>

