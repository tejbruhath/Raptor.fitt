# 🦖 RAPTOR.FITT ONBOARDING SYSTEM - IMPLEMENTATION PLAN

## ✅ COMPLETE 7-SCREEN ONBOARDING FLOW

### Files to Create:
1. `app/onboarding/page.tsx` - Main onboarding component with 7 screens
2. `lib/models/UserProfile.ts` - Extended user model with all fields
3. `lib/calculations/metrics.ts` - Calculation engine for all parameters
4. `app/api/onboarding/route.ts` - API to save onboarding data
5. `app/api/calculate-metrics/route.ts` - Auto-calculation endpoint

### Screen Breakdown:

#### Screen 1: Welcome & Vibe Check
Fields: `goal` (Build Muscle/Burn Fat/Get Stronger/Rebuild)

#### Screen 2: Body Blueprint
Fields: `age`, `sex`, `height`, `weight`, `targetWeight`, `bodyFat`, `trainingExperience`
Calculations: Base Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE)

#### Screen 3: Training Habits
Fields: `trainingDays`, `sessionLength`, `trainingStyle`, `equipment`
Calculations: Weekly Training Volume, Recovery Curve

#### Screen 4: Nutrition & Sleep
Fields: `proteinIntake`, `dietStyle`, `sleepHours`, `sleepQuality`, `stressLevel`
Calculations: System Efficiency Score

#### Screen 5: Body Behavior
Fields: `metabolismType`, `energyLevel`, `recoverySpeed`
Calculations: Physiotype Classification

#### Screen 6: Goals & Priorities
Fields: `priorities`, `timeline`, `progressPhoto`
Calculations: Optimization Focus, Volume Ramp Rate

#### Screen 7: System Calibration Summary
Display: All calculated metrics + CTA to activate plan

### Calculation Formulas:

```typescript
// BMR (Mifflin-St Jeor)
Male: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
Female: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161

// TDEE
TDEE = BMR × Activity Multiplier
- Sedentary: 1.2
- Light (1-3 days): 1.375
- Moderate (3-5 days): 1.55
- Active (6-7 days): 1.725

// Protein Range
Minimum: bodyweight(kg) × 1.6
Maximum: bodyweight(kg) × 2.2

// Recovery Score
= (sleepHours/8 × 0.4) + (sleepQuality/5 × 0.3) + ((5-stressLevel)/5 × 0.3) × 10

// Readiness Index
= (recoveryScore × 0.5) + (systemEfficiency × 0.3) + (trainingLoad × 0.2)
```

### Auto-Calculation Triggers:

1. **After Workout Log:**
   - Update Strength Index
   - Update Weekly Volume
   - Update Recovery Curve
   - Recalculate Readiness Index

2. **After Nutrition Log:**
   - Update Daily Protein Average
   - Update Calorie Trend
   - Recalculate System Efficiency

3. **After Recovery Log:**
   - Update Sleep Average
   - Update Recovery Score
   - Recalculate Readiness Index

4. **After Profile Update:**
   - Recalculate BMR/TDEE
   - Update Protein Range
   - Recalculate all dependent metrics

### Database Schema Updates:

```typescript
UserProfile {
  // Existing
  userId, name, email
  
  // Screen 1
  goal: string
  
  // Screen 2
  age: number
  sex: string
  height: number
  weight: number
  targetWeight: number
  bodyFat: number
  trainingExperience: string
  
  // Screen 3
  trainingDays: number
  sessionLength: number
  trainingStyle: string
  equipment: string
  
  // Screen 4
  proteinIntake: number
  dietStyle: string
  sleepHours: number
  sleepQuality: number
  stressLevel: number
  
  // Screen 5
  metabolismType: string
  energyLevel: string
  recoverySpeed: string
  
  // Screen 6
  priorities: string[]
  timeline: string
  progressPhoto: string
  
  // Calculated Fields
  bmr: number
  tdee: number
  proteinMin: number
  proteinMax: number
  maintenanceCalories: number
  recoveryScore: number
  systemEfficiency: number
  readinessIndex: number
  physiotype: string
  
  // Timestamps
  onboardingCompleted: boolean
  lastCalculated: Date
}
```

### Implementation Priority:

1. ✅ Create onboarding UI component (7 screens)
2. ✅ Update User model with all fields
3. ✅ Create calculation engine
4. ✅ Create onboarding API endpoint
5. ✅ Add redirect after signup to onboarding
6. ✅ Create auto-calculation API
7. ✅ Add calculation triggers to workout/nutrition/recovery logs
8. ✅ Update dashboard to display calculated metrics

### Next Steps:
Run the implementation in phases to avoid token limits.
