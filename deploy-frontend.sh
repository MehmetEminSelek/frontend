#!/bin/bash

# Ömer Güllü Sipariş Sistemi - Frontend Deployment Script
# Bu script /home/ogsiparis.com/frontend dizininde çalıştırılmalıdır

set -e

echo "🎨 Ömer Güllü Frontend Deployment Başlıyor..."

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Çalışma dizini kontrolü
EXPECTED_DIR="/home/ogsiparis.com/frontend"
CURRENT_DIR=$(pwd)

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo -e "${YELLOW}⚠️  Uyarı: Bu script $EXPECTED_DIR dizininde çalıştırılmalı${NC}"
    echo -e "${YELLOW}Şu anki dizin: $CURRENT_DIR${NC}"
    read -p "Devam etmek istiyor musunuz? (e/h): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ee]$ ]]; then
        exit 1
    fi
fi

# Gerekli dizinleri oluştur
echo "📁 Frontend dizinleri oluşturuluyor..."
mkdir -p certs
mkdir -p logs
mkdir -p dist

# Environment dosyası kontrolü
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production dosyası bulunamadı. Örnek dosya oluşturuluyor...${NC}"
    cat > .env.production << EOL
# OG Frontend - Production Environment
VITE_API_BASE_URL=https://ogsiparis.com/api
# NODE_ENV=production - Vite config'de set edilir
EOL
    echo -e "${GREEN}✅ .env.production oluşturuldu. Lütfen düzenleyin!${NC}"
fi

# Index.html dosyası kontrolü
if [ ! -f "index.html" ]; then
    echo -e "${YELLOW}⚠️  index.html dosyası bulunamadı. Landing page oluşturuluyor...${NC}"
    cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ömer Güllü Sipariş Sistemi</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 50px;
            background-color: #f0f2f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logo { width: 150px; height: auto; margin-bottom: 20px; }
        .loading { margin: 20px 0; }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .btn {
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="/src/logos/omergullulogo.png" alt="Ömer Güllü Logo" class="logo" onerror="this.style.display='none'">
        <h1>Ömer Güllü Sipariş Sistemi</h1>
        <div class="loading">
            <div class="spinner"></div>
            <p>Frontend yükleniyor...</p>
        </div>
        <div style="margin-top: 20px;">
            <a href="/" class="btn">Sisteme Giriş</a>
        </div>
    </div>
</body>
</html>
EOL
    echo -e "${GREEN}✅ Frontend index.html oluşturuldu${NC}"
fi

# Docker kurulum kontrolü
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker kurulu değil! Lütfen önce Docker'ı kurun.${NC}"
    exit 1
fi

# Modern Docker Compose kontrol
if ! docker compose version &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose kurulu değil! Lütfen önce Docker Compose'u kurun.${NC}"
        echo "Kurulum için: sudo apt install docker-compose-plugin -y"
        exit 1
    fi
fi

# Docker servis kontrolü
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker servisi çalışmıyor!${NC}"
    echo "Başlatmak için: sudo systemctl start docker"
    exit 1
fi

# Docker Compose komut belirleme
DOCKER_COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# Mevcut container'ları durdur
echo "🛑 Mevcut frontend container'ları durduruluyor..."
$DOCKER_COMPOSE_CMD down || true

# Docker image'ları build et
echo "🔨 Frontend Docker image'ı build ediliyor..."
$DOCKER_COMPOSE_CMD build --no-cache

# Frontend servisini başlat
echo "🚀 Frontend servisi başlatılıyor..."
$DOCKER_COMPOSE_CMD up -d

# Container durumlarını kontrol et
echo "📊 Container durumları kontrol ediliyor..."
sleep 10
$DOCKER_COMPOSE_CMD ps

# Health check
echo "🏥 Frontend health check yapılıyor..."
for i in {1..30}; do
    if curl -s http://localhost > /dev/null; then
        echo -e "${GREEN}✅ Frontend çalışıyor!${NC}"
        break
    else
        echo "⏳ Frontend başlatılıyor... ($i/30)"
        sleep 2
    fi
done

# SSL Sertifikası hatırlatması
echo ""
echo -e "${YELLOW}📌 SSL Sertifikası Kurulumu:${NC}"
echo "1. Let's Encrypt ile ücretsiz SSL:"
echo "   sudo certbot certonly --webroot -w /var/www/certbot -d ogsiparis.com -d www.ogsiparis.com"
echo ""
echo "2. Sertifikaları certs/ dizinine kopyalayın:"
echo "   sudo cp /etc/letsencrypt/live/ogsiparis.com/fullchain.pem ./certs/"
echo "   sudo cp /etc/letsencrypt/live/ogsiparis.com/privkey.pem ./certs/"
echo ""

echo ""
echo -e "${GREEN}🎉 Frontend Deployment tamamlandı!${NC}"
echo ""
echo "📝 Frontend Bilgileri:"
echo "   - Frontend URL: http://localhost (HTTP)"
echo "   - Frontend URL: https://ogsiparis.com (HTTPS)"
echo "   - Health Check: http://localhost/health"
echo ""
echo "🔧 Yönetim Komutları:"
echo "   - Logları görüntüle: $DOCKER_COMPOSE_CMD logs -f"
echo "   - Restart: $DOCKER_COMPOSE_CMD restart"
echo "   - Durdur: $DOCKER_COMPOSE_CMD down"
echo ""
echo "🔒 Güvenlik Önerileri:"
echo "   1. SSL sertifikası kurun"
echo "   2. .env.production dosyasını güncelleyin"
echo "   3. Domain DNS ayarlarını kontrol edin"
echo ""