# 🦖 Raptor.fitt - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** (optional, for version control)

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js 15
- React 18
- TypeScript
- TailwindCSS
- Framer Motion
- MongoDB/Mongoose
- Recharts
- Lucide Icons
- NextAuth
- And more...

### 2. Configure Environment Variables

The `.env.local` file is already created with your MongoDB URI. Verify it contains:

```env
MONGODB_URI=mongodb+srv://padeco1113_db_user:Q5i0O0nH9AMObNh7@iron.l2nlwuj.mongodb.net/?appName=iron
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=raptor-fitt-secret-key-change-in-production
OPENAI_API_KEY=your_openai_api_key_here
```

**Important:** 
- Change `NEXTAUTH_SECRET` to a random string in production
- Add your OpenAI API key if you want AI features (optional for MVP)

### 3. Set Up Fonts (Optional but Recommended)

Download the **Urbanist** font family from [Google Fonts](https://fonts.google.com/specimen/Urbanist):

1. Download the font
2. Extract the `.ttf` files
3. Place these files in `public/fonts/`:
   - `Urbanist-Bold.ttf`
   - `Urbanist-SemiBold.ttf`

> Note: The app will still work without custom fonts, falling back to system fonts.

### 4. Run Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:3000**

## Project Structure

```
raptor-fitt/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── dashboard/         # Dashboard pages
│   ├── workout/           # Workout logging
│   ├── nutrition/         # Nutrition tracking
│   ├── analytics/         # Charts & analytics
│   └── api/               # API routes
│       ├── workouts/
│       ├── nutrition/
│       └── strength-index/
├── components/            # Reusable UI components
│   ├── StrengthIndexRing.tsx
│   ├── QuickStats.tsx
│   └── TodaysSummary.tsx
├── lib/                   # Core logic & utilities
│   ├── models/           # MongoDB schemas
│   │   ├── User.ts
│   │   ├── Workout.ts
│   │   ├── Nutrition.ts
│   │   ├── Recovery.ts
│   │   └── StrengthIndex.ts
│   ├── mongodb.ts        # Database connection
│   ├── strengthIndex.ts  # SI calculation engine
│   ├── exercises.ts      # Exercise library
│   └── utils.ts          # Helper functions
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   └── fonts/            # Custom fonts
├── tailwind.config.ts    # Tailwind configuration
├── next.config.js        # Next.js config + PWA
└── package.json          # Dependencies
```

## Database Setup

Your MongoDB connection is already configured. The database will be created automatically when you first save data.

**Collections created automatically:**
- `users` - User profiles
- `workouts` - Workout logs
- `nutritions` - Food logs
- `recoveries` - Sleep/recovery data
- `strengthindexes` - SI snapshots

## Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
```

Upload the `.next` folder and `public` directory to your hosting provider.

## PWA Installation

Once deployed, users can install Raptor.fitt as a Progressive Web App:

**Mobile:**
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. Use like a native app

**Desktop:**
1. Open in Chrome/Edge
2. Click install icon in address bar
3. App opens in standalone window

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### MongoDB Connection Issues

- Verify your IP is whitelisted in MongoDB Atlas
- Check connection string is correct
- Ensure network connectivity

### TypeScript Errors

```bash
# Regenerate types
npm run build
```

### Missing Dependencies

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Key Features Status

✅ **Implemented:**
- Landing page with animations
- Dashboard with Strength Index
- Workout logging system
- Nutrition tracking
- Analytics with charts
- MongoDB integration
- PWA configuration
- Responsive design
- Dark mode UI

🚧 **To Implement:**
- User authentication (NextAuth setup needed)
- AI Coach (requires OpenAI API key)
- Recovery tracking page
- Expected Growth Curve prediction
- Profile settings page
- Exercise templates

## Development Tips

1. **Hot Reload:** Changes auto-refresh in dev mode
2. **Component Testing:** Each page is self-contained
3. **API Testing:** Use tools like Postman or Thunder Client
4. **Styling:** All styles use Tailwind utility classes
5. **Icons:** Lucide React provides all icons

## Next Steps

1. **Add Authentication:**
   - Configure NextAuth providers
   - Protect API routes
   - Add sign in/up pages

2. **Implement AI Features:**
   - Add OpenAI API key
   - Create AI coach endpoint
   - Build chat interface

3. **Polish UI:**
   - Add loading states
   - Improve error handling
   - Add toast notifications

4. **Deploy:**
   - Push to GitHub
   - Deploy to Vercel
   - Share with testers!

## Support

For issues or questions:
- Check the README.md
- Review Next.js documentation
- Open an issue on GitHub

---

**Built with ❤️ for the fitness community**

🦖 **Raptor.fitt** — Hunt Your Potential
