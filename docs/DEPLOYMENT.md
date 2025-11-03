# Deployment Guide

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project

### Step 3: Environment Variables
Add in Vercel dashboard:
```
MONGODB_URI=<your-mongodb-uri>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=https://your-domain.vercel.app
OPENAI_API_KEY=<your-key>
```

### Step 4: Deploy
Click "Deploy" - Done! ✅

## Alternative: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set MONGODB_URI=<uri>

# Deploy
railway up
```

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Random string for auth
- `NEXTAUTH_URL` - Your app URL

### Optional
- `OPENAI_API_KEY` - For AI features

## Post-Deployment

### 1. Test Features
- Create account
- Log workout
- Track nutrition
- View analytics

### 2. Configure Domain
- Add custom domain in Vercel
- Update NEXTAUTH_URL
- Test OAuth flows

### 3. Monitor
- Check Vercel analytics
- Monitor MongoDB usage
- Track errors

## Production Checklist

- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Domain connected
- [ ] SSL certificate active
- [ ] Error monitoring setup
- [ ] Analytics configured
- [ ] SEO metadata added
- [ ] PWA tested on mobile
- [ ] Performance optimized
- [ ] Security headers enabled

## Scaling Considerations

### Database
- Upgrade MongoDB plan as needed
- Add indexes for queries
- Monitor connection limits

### Frontend
- Enable Vercel caching
- Optimize images
- Use CDN for assets

### API
- Rate limiting
- Request validation
- Error handling
