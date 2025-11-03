# Getting Started with Raptor.fitt

## Quick Start

### 1. Install Node.js
Download and install Node.js (v18+) from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://padeco1113_db_user:Q5i0O0nH9AMObNh7@iron.l2nlwuj.mongodb.net/?appName=iron
NEXTAUTH_SECRET=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Steps

1. **Explore the Landing Page** - Check out the hero section and features
2. **Navigate to Dashboard** - Click "Enter the Den"
3. **Log a Workout** - Add your first exercise and sets
4. **Track Nutrition** - Log meals and macros
5. **View Analytics** - See your progress visualized

## Key Features

- **Workout Logging** - Track exercises, sets, reps, weight, and RPE
- **Nutrition Tracking** - Log meals with macro breakdown
- **Strength Index** - Unified metric for total strength
- **Analytics** - Visual charts and progress tracking
- **Dark Mode** - Eye-friendly UI for gym use
- **PWA Support** - Install as native app

## Next Steps

- Read [API_REFERENCE.md](./API_REFERENCE.md) for backend integration
- Check [FEATURES.md](./FEATURES.md) for full feature list
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
