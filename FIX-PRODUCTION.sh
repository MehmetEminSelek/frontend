#!/bin/bash

# OG Frontend - Production URL Fix Script
# Bu script'i sunucuda çalıştırın

echo "🔧 Frontend URL'lerini düzeltiyorum..."

# Frontend dizinine git
cd /home/ogsiparis.com/public_html

# Tüm JS dosyalarında localhost:3000'i ogsiparis.com:3000 ile değiştir
find assets -name "*.js" -exec sed -i 's/http:\/\/localhost:3000\/api/http:\/\/ogsiparis.com:3000\/api/g' {} \;

echo "✅ URL'ler güncellendi!"

# Cache temizleme için timestamp ekle
echo "🔄 Cache temizleniyor..."
for file in assets/index-*.js; do
    if [ -f "$file" ]; then
        # Dosya adına timestamp ekle
        timestamp=$(date +%s)
        newname="${file%.js}-${timestamp}.js"
        mv "$file" "$newname"
        
        # index.html'i güncelle
        sed -i "s|${file}|${newname}|g" index.html
        
        echo "📝 Güncellendi: $file -> $newname"
    fi
done

echo "✅ İşlem tamamlandı!"
echo ""
echo "🌐 Şimdi https://ogsiparis.com adresini ziyaret edin"
echo "💡 Browser cache'ini temizlemeyi unutmayın (Ctrl+Shift+R)" 