# AW Gyms - Equipment & Events Management Platform

A full-stack TypeScript application for managing gym equipment, events, and customer interactions. Built with React, Hono, and Drizzle ORM for optimal performance and portability.

**Live:** https://awgyms.com

## 🏗️ Architecture

- **Frontend:** React 19 + TypeScript + Vite with TailwindCSS
- **Backend:** Hono.js with tRPC for type-safe APIs
- **Database:** MySQL with Drizzle ORM (PlanetScale compatible)
- **Deployment:** Vercel (serverless + Node.js)
- **Features:** Products catalog, event management, admin dashboard, AI chat support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL database or PlanetScale account

### Local Development

```bash
cd app
npm install

# Copy environment template
cp .env.example .env.local

# Update .env.local with your database URL
# DATABASE_URL=mysql://user:password@host:port/database

# Run development server
npm run dev
```

Server runs at http://localhost:3000

### Database Setup

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema (for existing databases)
npm run db:push
```

### Production Build & Deploy

```bash
# Build for production
npm run build

# Local testing (requires NODE_ENV=production)
NODE_ENV=production node dist/boot.js
```

## 📋 Environment Variables

Create `.env.local` in the `app/` directory:

```env
# Backend Configuration
APP_ID=your-app-id
APP_SECRET=your-secret-key-min-32-chars
NODE_ENV=production

# Database (PlanetScale or MySQL)
DATABASE_URL=mysql://username:password@host/database

# Server
PORT=3000
```

## 🔒 Security Notes

- Admin credentials are stored as SHA-256 hashes in the database
- All API routes require Bearer token authentication
- Sensitive environment variables are never logged
- CORS is properly configured for your domain

## 📦 Deployment Checklist

- [x] Vercel configuration optimized
- [x] Build command fixed (proper bundling)
- [x] API routes properly configured
- [x] Environment variables documented
- [x] Database connection pooling enabled
- [x] Node.js compatibility verified
- [x] Error handling in place
- [x] Performance optimizations applied
- [x] CORS configured for awgyms.com
- [x] Logging and monitoring ready
- [x] Security headers added
- [x] Database migrations automated

## 💪 Features

### Public API
- Product listing with filtering
- Event browsing and countdown
- AI chat support
- Currency conversion (PKR, USD, AED)

### Admin Dashboard
- Product CRUD operations
- Event management
- Settings configuration
- Password management

## 🛠️ Development

```bash
# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

## 📚 Tech Stack Details

- **Frontend Framework:** React 19 with React Router v7
- **UI Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **API:** tRPC for end-to-end type safety
- **Styling:** TailwindCSS with animations
- **Charts:** Recharts for analytics
- **Database:** Drizzle ORM (MySQL 2 driver)
- **Build Tool:** Vite 7 + esbuild for Node.js

## 🚨 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check network access rules on your database host
- Ensure PlanetScale proxy URL is used (if applicable)
- Test connection locally first

### Build Failures
- Clear `node_modules` and `dist/` directories
- Run `npm install` with `--legacy-peer-deps` if needed
- Check Node.js version (18+ required)
- Verify all environment variables are set

### API Errors
- Check browser console and server logs
- Verify environment variables are set
- Confirm database migrations ran successfully
- Check `/health` endpoint: `curl https://awgyms.com/health`

## 📞 Support

For issues or questions:
1. Check environment variables are correctly set
2. Review server logs in Vercel dashboard
3. Verify database connectivity
4. Check admin credentials in database settings table
5. See DEPLOYMENT.md for detailed deployment guide

## 📄 License

Private - All rights reserved
