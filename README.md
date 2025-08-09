# Propellic Pulse - Employee Net Promoter Score Survey

A production-ready web application for collecting anonymous monthly eNPS (Employee Net Promoter Score) and pulse feedback from employees.

![Propellic Pulse](public/brand/propellic-logo-light.svg)

## 🌟 Features

- **Anonymous Surveys**: Collect monthly eNPS scores (0-10) with optional name and department
- **Pulse Questions**: 1-3 dynamic questions per survey cycle
- **Admin Dashboard**: Month-over-month trends, distribution charts, and text analytics
- **Data Export**: CSV export functionality for analysis
- **Brand Consistency**: Follows Propellic brand guidelines with custom colors and typography
- **Security**: Google SSO with domain restriction, spam protection, and rate limiting

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Propellic Brand Theme
- **Database**: PostgreSQL with Prisma ORM (SQLite for local development)
- **Authentication**: NextAuth with Google SSO
- **Charts**: Chart.js (react-chartjs-2)
- **Validation**: Zod schemas
- **Deployment**: Vercel-ready

## 🏗️ Architecture

### Data Model
- **Cycles**: Monthly survey periods with start/end dates
- **Questions**: 1-3 pulse questions per cycle
- **Responses**: Anonymous submissions with optional identity
- **Departments**: Organizational structure for analytics

### Security & Anonymity
- Admin access restricted to `@propellic.com` emails
- Optional employee identification
- Submission hash prevents duplicate responses
- Honeypot spam protection

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database (or SQLite for local development)
- Google OAuth credentials (for admin access)

### Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/pixelcutlabs/propellic-pulse.git
   cd propellic-pulse
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and OAuth credentials
   ```

3. **Database setup**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/propellic_pulse"

# NextAuth Configuration  
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Domain Restriction
ALLOWED_EMAIL_DOMAIN="propellic.com"
```

## 📊 Usage

### Public Access
- **Homepage**: Landing page with survey information
- **Survey Form**: Anonymous eNPS and pulse question submission

### Admin Access (Google SSO Required)
- **Dashboard**: Analytics, trends, and response insights
- **Cycle Management**: Create and manage survey periods
- **Settings**: Department management and data export

### API Endpoints
- `POST /api/submit` - Submit survey response
- `GET /api/stats` - Analytics data
- `GET /api/cycles` - Survey cycle management
- `GET /api/export.csv` - Data export

## 🎨 Branding

The application follows Propellic brand guidelines:

- **Primary Color**: Pink `#E21A6B`
- **Secondary Color**: Midnight `#152534`
- **Typography**: Proxima Nova (fallback: Montserrat)
- **Components**: Custom branded UI elements

## 🚀 Deployment

### Vercel Deployment

1. **Database Setup**:
   - Set up PostgreSQL (Supabase/Neon recommended)
   - Update `DATABASE_URL` in environment variables

2. **Deploy to Vercel**:
   ```bash
   npm run build
   # Deploy via Vercel CLI or GitHub integration
   ```

3. **Environment Variables**:
   - Configure all required environment variables in Vercel dashboard
   - Ensure `NEXTAUTH_URL` points to your production domain

### Production Considerations
- Use PostgreSQL for production (update schema.prisma)
- Set up proper Google OAuth credentials
- Configure domain allowlist for admin access
- Enable database connection pooling for scale

## 📁 Project Structure

```
propellic-pulse/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   └── survey/             # Public survey page
│   ├── components/             # React components
│   └── lib/                    # Utilities and configurations
├── prisma/                     # Database schema and migrations
├── public/                     # Static assets
└── scripts/                    # Development scripts
```

## 🧪 Database Schema

```sql
-- Core survey cycle management
Cycle: id, year, month, startsAt, endsAt, isActive
Question: id, cycleId, order, text
Department: id, name
Response: id, cycleId, enpsScore, q1, q2, q3, name, departmentId

-- NextAuth tables for admin authentication
User, Account, Session, VerificationToken
```

## 📈 Analytics & Insights

The admin dashboard provides:
- **eNPS Calculation**: Automatic promoter/passive/detractor categorization
- **Trend Analysis**: Month-over-month score tracking
- **Distribution Charts**: Score breakdown visualization
- **Text Analytics**: Word frequency analysis from responses
- **Department Insights**: Performance by organizational unit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary to Propellic. All rights reserved.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Review the [Next.js documentation](https://nextjs.org/docs)
- Check [Prisma documentation](https://www.prisma.io/docs) for database issues

---

Built with ❤️ for Propellic by the Engineering Team