#!/bin/bash

# Propellic Pulse Development Setup Script

echo "🚀 Setting up Propellic Pulse for development..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Check if database URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL not set in .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Generating Prisma client..."
npx prisma generate

echo "📊 Running database migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Setup complete! You can now run:"
echo "   npm run dev    - Start development server"
echo "   npm run db:studio - Open Prisma Studio"
echo ""
echo "📝 Don't forget to:"
echo "   1. Set up Google OAuth credentials in .env"
echo "   2. Update NEXTAUTH_URL for production"
echo "   3. Set ALLOWED_EMAIL_DOMAIN to your organization's domain"
