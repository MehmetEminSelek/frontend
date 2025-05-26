#!/bin/bash

# OG Frontend - Static Deployment Script
echo "🚀 OG Frontend - Static Deployment Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Frontend Static Deployment Checklist${NC}"
echo "=================================================="

# 1. Environment kontrolü
echo -e "${YELLOW}1. Environment dosyası kontrol ediliyor...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}💡 Production environment dosyasını kopyalıyorum...${NC}"
    cp .env.production .env
    echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"
else
    echo -e "${GREEN}✅ Environment dosyası mevcut${NC}"
fi

# 2. API URL kontrolü
echo -e "${YELLOW}2. API URL kontrol ediliyor...${NC}"
if grep -q "api.ogsiparis.com" .env; then
    echo -e "${GREEN}✅ API URL doğru (api.ogsiparis.com)${NC}"
else
    echo -e "${YELLOW}⚠️  API URL güncelleniyor...${NC}"
    sed -i 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://api.ogsiparis.com/api|' .env
    echo -e "${GREEN}✅ API URL güncellendi${NC}"
fi

# 3. Node.js version kontrolü
echo -e "${YELLOW}3. Node.js version kontrol ediliyor...${NC}"
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# 4. Dependencies install
echo -e "${YELLOW}4. Dependencies yükleniyor...${NC}"
npm install

# 5. Production build
echo -e "${YELLOW}5. Production build yapılıyor...${NC}"
npm run build

# 6. Build kontrolü
echo -e "${YELLOW}6. Build dosyaları kontrol ediliyor...${NC}"
if [ -d "dist" ]; then
    BUILD_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ Build başarılı - Boyut: $BUILD_SIZE${NC}"
    echo -e "${BLUE}📁 Build içeriği:${NC}"
    ls -la dist/
else
    echo -e "${RED}❌ Build başarısız - dist klasörü bulunamadı!${NC}"
    exit 1
fi

# 7. Index.html kontrolü
echo -e "${YELLOW}7. Index.html kontrol ediliyor...${NC}"
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ index.html mevcut${NC}"
else
    echo -e "${RED}❌ index.html bulunamadı!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Frontend build tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📌 Deployment Seçenekleri:${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}🌐 Option 1: CyberPanel/Hostinger${NC}"
echo "Method A - Local Upload:"
echo "1. dist/ klasörünün İÇERİĞİNİ kopyalayın (dist/ klasörünü değil!)"
echo "2. FTP/SFTP ile /home/ogsiparis.com/public_html/ klasörüne upload edin"
echo "3. SSL sertifikası aktifleştirin"
echo ""
echo "Method B - Sunucuda Build (Önerilen):"
echo "1. SSH: ssh root@your-server-ip"
echo "2. cd /home/ogsiparis.com/public_html"
echo "3. rm -rf * (mevcut dosyaları temizle)"
echo "4. git clone https://github.com/your-username/og-frontend.git ."
echo "5. npm install && npm run build"
echo "6. mv dist/* . && rm -rf dist/ node_modules/ src/ *.json *.js *.md"
echo ""
echo -e "${YELLOW}☁️  Option 2: Netlify${NC}"
echo "1. Netlify'a giriş yapın"
echo "2. 'New site from Git' seçin"
echo "3. Build command: npm run build"
echo "4. Publish directory: dist"
echo ""
echo -e "${YELLOW}⚡ Option 3: Vercel${NC}"
echo "1. Vercel'e giriş yapın"
echo "2. Repository'yi import edin"
echo "3. Framework: Vue.js"
echo "4. Build command: npm run build"
echo "5. Output directory: dist"
echo ""
echo -e "${BLUE}🔧 Environment Variables (Production):${NC}"
echo "=================================="
echo "VITE_API_BASE_URL=https://api.ogsiparis.com/api"
echo "NODE_ENV=production"
echo "VITE_BUILD_MODE=production"
echo ""
echo -e "${BLUE}🧪 Test URL'leri:${NC}"
echo "=================================="
echo "Frontend: https://ogsiparis.com"
echo "API Health: https://api.ogsiparis.com/api/dropdown"
echo ""
echo -e "${YELLOW}⚠️  Önemli Notlar:${NC}"
echo "• Frontend tamamen static dosyalar"
echo "• Backend API ayrı subdomain'de çalışıyor"
echo "• CORS backend'de ogsiparis.com için ayarlanmış"
echo "• Recipe cost calculation: 15.01₺/KG"
echo "• Build size: ~2MB (gzipped)" 