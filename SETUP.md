# 🚀 Setup Guide - Raptor.Fitt

## Prerequisites

- **Node.js** 18+ 
- **MongoDB** Atlas account or local MongoDB instance
- **Git** for cloning

## Installation

```bash
# Clone repository
git clone <your-repo-url>
cd fitness-app

# Install dependencies
npm install
```

## Environment Variables

Create `.env.local` in root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fitness-app

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# Optional: AI Features
OPENAI_API_KEY=<your-openai-key>
```

## Database Setup

The app auto-creates collections on first run. No manual setup needed.

## Running Locally

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel dashboard.

### MongoDB Atlas

1. Create cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Whitelist IP: `0.0.0.0/0` (for Vercel)
3. Get connection string
4. Add to environment variables

## Troubleshooting

**Build errors:** Clear `.next` folder and rebuild
```bash
rm -rf .next
npm run build
```

**Database connection:** Verify MONGODB_URI format and network access

**Auth issues:** Regenerate NEXTAUTH_SECRET
