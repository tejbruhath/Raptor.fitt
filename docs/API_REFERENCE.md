# API Reference

## Base URL
`http://localhost:3000/api`

## Endpoints

### Workouts

#### GET /api/workouts
Get user's workouts
```
Query params:
  - userId: string (required)
  
Response: { workouts: Workout[] }
```

#### POST /api/workouts
Create new workout
```json
{
  "userId": "string",
  "date": "2024-01-01",
  "exercises": [{
    "name": "Bench Press",
    "muscleGroup": "chest",
    "sets": [
      { "reps": 8, "weight": 100, "rpe": 7 }
    ]
  }]
}
```

### Nutrition

#### GET /api/nutrition
Get nutrition logs
```
Query params:
  - userId: string (required)
  - date: string (optional)
```

#### POST /api/nutrition
Create nutrition log
```json
{
  "userId": "string",
  "date": "2024-01-01",
  "meals": [{
    "name": "Chicken & Rice",
    "calories": 500,
    "protein": 40,
    "carbs": 50,
    "fats": 15
  }]
}
```

### Strength Index

#### GET /api/strength-index
Get SI history
```
Query params:
  - userId: string (required)
```

#### POST /api/strength-index
Calculate new SI
```json
{
  "userId": "string"
}
```

## Data Models

### Workout
```typescript
{
  userId: string;
  date: Date;
  exercises: Array<{
    name: string;
    muscleGroup: string;
    sets: Array<{
      reps: number;
      weight: number;
      rpe?: number;
    }>;
  }>;
}
```

### Nutrition
```typescript
{
  userId: string;
  date: Date;
  meals: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
}
```

### Strength Index
```typescript
{
  userId: string;
  date: Date;
  totalSI: number;
  breakdown: {
    chest: number;
    back: number;
    legs: number;
    shoulders: number;
    arms: number;
  };
}
```
