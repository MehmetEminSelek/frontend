# 🍯 OG Sipariş Yönetim Sistemi - Frontend

## 📋 Proje Açıklaması
Antep tatlıları için sipariş yönetim sistemi frontend uygulaması. Vue.js 3 ve Vuetify kullanılarak geliştirilmiştir.

## 🛠 Teknolojiler
- **Framework:** Vue.js 3 (Composition API)
- **UI Library:** Vuetify 3
- **Build Tool:** Vite
- **State Management:** Pinia
- **HTTP Client:** Axios
- **PDF Export:** jsPDF
- **Charts:** Chart.js + Vue-ChartJS

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- Backend API (api.ogsiparis.com)

### Development
```bash
# Dependencies yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Development server başlat
npm run dev
```

### Production Build
```bash
# Environment dosyasını hazırla
cp .env.production .env

# Production build
npm run build

# Build dosyaları dist/ klasöründe oluşur
```

## 🌐 Deployment

### Static Hosting (Önerilen)
Frontend tamamen static dosyalar olduğu için herhangi bir static hosting servisinde çalışır:

#### CyberPanel/Hostinger
```bash
# Method 1: Local build + Upload
npm run build
# dist/ klasörünün İÇERİĞİNİ FTP ile /home/ogsiparis.com/public_html/ klasörüne upload edin

# Method 2: Doğrudan sunucuda build (Önerilen)
# SSH ile sunucuya bağlan ve:
cd /home/ogsiparis.com/public_html
rm -rf *  # Mevcut dosyaları temizle
git clone https://github.com/your-username/og-frontend.git .
npm install
npm run build
mv dist/* .
rm -rf dist/ node_modules/ src/ *.json *.js *.md
```

#### Netlify/Vercel
```bash
# Build command
npm run build

# Publish directory
dist
```

## 📱 Özellikler

### 🛍 Sipariş Yönetimi
- ✅ Yeni sipariş oluşturma
- ✅ Sipariş düzenleme/silme
- ✅ Ödeme durumu takibi
- ✅ Hazırlama durumu
- ✅ PDF export
- ✅ Sipariş filtreleme

### 🍯 Ürün Yönetimi
- ✅ Ürün listesi/ekleme/düzenleme
- ✅ Reçete maliyet hesaplama
- ✅ Kategori yönetimi
- ✅ Fiyat yönetimi
- ✅ Stok takibi

### 👥 Müşteri Yönetimi
- ✅ Cari hesap yönetimi
- ✅ Adres yönetimi
- ✅ Müşteri geçmişi
- ✅ İletişim bilgileri

### 📊 Raporlama
- ✅ Satış raporları
- ✅ Maliyet analizi
- ✅ Grafik gösterimleri
- ✅ PDF export

## 🔧 Environment Variables

### Development (.env)
```env
VITE_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://api.ogsiparis.com/api
NODE_ENV=production
VITE_BUILD_MODE=production
VITE_DROP_CONSOLE=true
```

## 📡 API Integration

### Backend Connection
Frontend, backend API'sine şu endpoint'ler üzerinden bağlanır:

- **Base URL:** `https://api.ogsiparis.com/api`
- **Authentication:** JWT token
- **CORS:** Backend'de ogsiparis.com domain'i whitelist'te

### API Endpoints
```javascript
// Products
GET /api/urunler
POST /api/urunler
PUT /api/urunler/:id
DELETE /api/urunler/:id
GET /api/urunler/:id/recete-maliyet

// Orders
GET /api/siparisler
POST /api/siparisler
PUT /api/siparisler/:id
DELETE /api/siparisler/:id

// Customers
GET /api/cariler
POST /api/cariler
PUT /api/cariler/:id

// Dropdown Data
GET /api/dropdown
```

## 🎨 UI Components

### Ana Sayfalar
- **Dashboard** - Genel özet ve istatistikler
- **Sipariş Yönetimi** - Sipariş listesi ve işlemleri
- **Ürün Yönetimi** - Ürün CRUD işlemleri
- **Müşteri Yönetimi** - Cari hesap yönetimi
- **Stok Yönetimi** - Hammadde ve stok takibi

### Özel Bileşenler
- **UrunYonetimi.vue** - Ürün yönetim sayfası
- **UrunFormDialog.vue** - Ürün ekleme/düzenleme
- **UrunDetayDialog.vue** - Ürün detay ve reçete maliyeti
- **KategoriYonetimDialog.vue** - Kategori yönetimi

## 🧪 Test

### Recipe Cost Test
```javascript
// Peynirli Su Böreği maliyeti test
const response = await axios.get('/api/urunler/1/recete-maliyet?miktar=1000');
console.log(response.data.toplamMaliyet); // 15.01
```

### Build Test
```bash
# Production build test
npm run build

# Build dosyaları kontrol
ls -la dist/
```

## 📱 Responsive Design
- ✅ Mobile-first approach
- ✅ Tablet optimizasyonu
- ✅ Desktop full-screen
- ✅ Vuetify responsive grid

## 🚨 Troubleshooting

### Common Issues
1. **API Connection:** Backend URL'i kontrol edin
2. **CORS Errors:** Backend CORS_ORIGIN ayarını kontrol edin
3. **Build Errors:** Node.js version 18+ kullanın
4. **Route Issues:** Vue Router history mode için server config gerekli

### Development
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check API connection
curl https://api.ogsiparis.com/api/dropdown
```

## 📞 Support
- **Frontend URL:** https://ogsiparis.com
- **Backend API:** https://api.ogsiparis.com/api
- **Recipe Cost:** 15.01₺/KG (Peynirli Su Böreği)
- **Build Size:** ~2MB (gzipped)
- **Load Time:** <3s (first load) 