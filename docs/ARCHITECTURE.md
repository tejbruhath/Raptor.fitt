# System Architecture

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless functions
- **MongoDB/Mongoose** - Database and ODM
- **NextAuth.js** - Authentication
- **OpenAI API** - AI coach features

### Infrastructure
- **Vercel** - Hosting and deployment
- **MongoDB Atlas** - Managed database
- **PWA** - Progressive Web App support

## Project Structure

```
raptor-fitt/
├── app/                      # Next.js 15 App Router
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout with fonts
│   ├── globals.css          # Global styles + design system
│   ├── dashboard/           # Main dashboard
│   ├── workout/log/         # Workout logging
│   ├── nutrition/log/       # Nutrition tracking
│   ├── recovery/log/        # Recovery logging
│   ├── analytics/           # Charts and insights
│   ├── profile/             # User profile
│   └── api/                 # Backend API routes
│       ├── workouts/        # Workout CRUD
│       ├── nutrition/       # Nutrition CRUD
│       ├── recovery/        # Recovery CRUD
│       ├── strength-index/  # SI calculation
│       └── ai/              # AI coach endpoint
├── components/              # Reusable React components
│   ├── StrengthIndexRing.tsx
│   ├── QuickStats.tsx
│   └── TodaysSummary.tsx
├── lib/                     # Core business logic
│   ├── models/             # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Workout.ts
│   │   ├── Nutrition.ts
│   │   ├── Recovery.ts
│   │   └── StrengthIndex.ts
│   ├── mongodb.ts          # Database connection
│   ├── strengthIndex.ts    # SI calculation engine
│   ├── exercises.ts        # Exercise library
│   └── utils.ts            # Helper functions
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Data Flow

### 1. User Action
```
User logs workout → Form submission
```

### 2. API Request
```
POST /api/workouts
{
  userId, date, exercises: [...]
}
```

### 3. Database
```
Mongoose validates → MongoDB saves → Returns document
```

### 4. SI Calculation
```
New workout triggers SI recalculation
Uses last 30 days of data
Normalizes by bodyweight
Stores snapshot in StrengthIndex collection
```

### 5. UI Update
```
Dashboard fetches updated data
Charts re-render with new values
Animations trigger on changes
```

## Key Algorithms

### Strength Index Calculation
```typescript
SI = Σ(Best1RM × MuscleGroupWeight) / Bodyweight

Where:
- Best1RM = Estimated one-rep max for each exercise
- MuscleGroupWeight = Importance factor (legs: 1.2, arms: 0.7)
- Bodyweight = User's current weight
```

### 1RM Estimation (Epley Formula)
```typescript
1RM = weight × (1 + reps / 30)
```

### Volume Calculation
```typescript
Volume = Σ(sets × reps × weight)
```

### Recovery Score
```typescript
Score = (
  (sleepHours / 8) × 0.40 +
  (sleepQuality / 10) × 0.30 +
  ((11 - soreness) / 10) × 0.15 +
  ((11 - stress) / 10) × 0.15
) × 100
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/workouts` | GET | Fetch user workouts |
| `/api/workouts` | POST | Create workout |
| `/api/nutrition` | GET | Fetch nutrition logs |
| `/api/nutrition` | POST | Create nutrition log |
| `/api/recovery` | GET | Fetch recovery logs |
| `/api/recovery` | POST | Create recovery log |
| `/api/strength-index` | GET | Get SI history |
| `/api/strength-index` | POST | Calculate new SI |
| `/api/ai` | POST | AI coach query |

## Security Considerations

1. **Authentication** - NextAuth.js for user management
2. **API Validation** - Zod schemas for input validation
3. **Environment Variables** - Secrets stored securely
4. **Rate Limiting** - To be implemented
5. **Data Sanitization** - Mongoose schema validation

## Performance Optimization

1. **Server Components** - Default in Next.js 15
2. **API Route Caching** - Strategic use of cache headers
3. **Database Indexing** - userId and date fields indexed
4. **Image Optimization** - Next.js Image component
5. **Code Splitting** - Automatic with Next.js

## Scalability

### Current Capacity
- MongoDB Atlas free tier: 512MB storage
- Vercel free tier: Unlimited hobby projects
- Handles ~1000 users comfortably

### Scaling Path
1. Upgrade MongoDB plan
2. Add Redis for caching
3. Implement CDN for static assets
4. Use Edge Functions for global performance
5. Database sharding if needed
