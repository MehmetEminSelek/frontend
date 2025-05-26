#!/bin/bash

# Frontend Deployment Script
echo "🚀 Starting Frontend deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build frontend
echo "🎨 Building frontend..."
npm run build

# 3. Create production .env
echo "📝 Creating production .env..."
cp .env.production .env

echo "✅ Frontend deployment preparation complete!"
echo ""
echo "📌 Next steps:"
echo "1. Upload dist/ folder to public_html/frontend"
echo "2. Configure Nginx/Apache to serve from frontend directory" 