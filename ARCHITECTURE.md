# 🏗️ Architecture - Raptor.Fitt

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualizations

### Backend
- **Next.js API Routes** - Serverless endpoints
- **MongoDB** - Database with Mongoose ODM
- **NextAuth.js** - Authentication

### Features
- **PWA** - Offline support with next-pwa
- **Offline Queue** - Local storage + auto-sync

## Project Structure

```
fitness-app/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth pages (signin, signup)
│   ├── api/                 # API routes
│   │   ├── workouts/        # Workout CRUD
│   │   ├── nutrition/       # Nutrition CRUD
│   │   ├── recovery/        # Recovery CRUD
│   │   ├── strength-index/  # SI calculation
│   │   ├── achievements/    # Achievement system
│   │   └── growth-prediction/
│   ├── dashboard/           # Main dashboard
│   ├── workout/             # Workout logging
│   ├── nutrition/           # Nutrition logging
│   ├── recovery/            # Recovery logging
│   ├── analytics/           # Charts & insights
│   └── profile/             # User profile
├── components/              # React components
│   ├── SmartNutritionLogger.tsx
│   ├── PRGlowInput.tsx
│   ├── VolumeToast.tsx
│   ├── WorkoutSessionSummary.tsx
│   └── ...
├── lib/                     # Utilities & configs
│   ├── models/              # Mongoose schemas
│   ├── utils/               # Helper functions
│   ├── hooks/               # Custom React hooks
│   └── constants/           # App constants
└── public/                  # Static assets

```

## Data Models

### User
- Authentication (email/password)
- Profile (name, bodyweight, age)
- Settings (units, notifications)

### Workout
- User reference
- Date, exercises array
- Each exercise: name, muscle group, sets
- Each set: weight, reps, RPE, isPR

### Nutrition
- User reference
- Date, meals array
- Each meal: name, calories, protein, carbs, fats

### Recovery
- User reference
- Date, sleep hours, quality, soreness, stress
- Calculated recovery score

### StrengthIndex
- User reference
- Date, totalSI
- Auto-calculated from workouts + nutrition + recovery

### WorkoutPR
- User reference
- Exercise name, max weight, achieved date

### Achievement
- User reference
- Achievement ID, unlocked date

## Key Features

### Smart Logging
- **Quick-add syntax**: "Squat 120x5x3"
- **Food detection**: "chicken 200g" → auto-macros
- **PR detection**: Real-time gold glow on new records

### Real-Time Updates
- Dashboard stats calculate from DB queries
- SI recalculates after every log
- Cache-busting timestamps prevent stale data

### Offline Support
- Logs queue in localStorage when offline
- Auto-syncs when connection restored
- Visual indicator shows network status

### Growth Predictions
- Linear regression on SI history
- 45-day future projections
- Exercise-specific predictions

## API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/workouts` | GET, POST, DELETE | Workout CRUD |
| `/api/nutrition` | GET, POST | Nutrition CRUD |
| `/api/recovery` | GET, POST | Recovery CRUD |
| `/api/strength-index` | GET, POST | SI calculations |
| `/api/achievements` | GET, POST | Achievement checks |
| `/api/workout-prs` | GET, POST | PR tracking |
| `/api/growth-prediction` | GET | ML predictions |
| `/api/auth/[...nextauth]` | * | Authentication |

## Performance

- **Bundle size**: 102 kB shared
- **Static generation**: 20 pages pre-rendered
- **Dynamic imports**: Heavy components lazy-loaded
- **Image optimization**: Next.js Image component

## Security

- Passwords hashed with bcrypt
- Sessions managed by NextAuth
- API routes protected with authentication
- MongoDB connection pooling
