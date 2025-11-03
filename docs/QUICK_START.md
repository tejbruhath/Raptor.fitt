# 🚀 Quick Start Guide

## Installation

```bash
npm install
```

## Setup Environment

Make sure your `.env.local` has:

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

## Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Seed Test Data (Optional)

```bash
npm run seed
```

Test credentials:
- Email: `test@raptor.fitt`
- Password: `test123`

---

## 📱 New Features Guide

### Edit/Delete Logs
All workout, nutrition, and recovery logs now support editing and deletion:
- **Edit**: `PUT /api/workouts` (pass `workoutId`, `userId`, updated fields)
- **Delete**: `DELETE /api/workouts?id=X&userId=Y`

### Workout Templates
Save and reuse workout routines:
1. Go to `/templates`
2. Click "New Template"
3. Add exercises and sets
4. Use template: Click "Use" button → auto-fills workout logger

### Exercise History
View progression on specific exercises:
1. Go to `/analytics`
2. Click on any exercise
3. See progression charts, PRs, and volume trends

### AI Insights
Get personalized recommendations:
1. Go to `/insights`
2. View deload suggestions
3. See progressive overload recommendations per exercise

### PR Tracking
View all personal records:
1. Go to `/prs`
2. See latest PRs grouped by exercise
3. View PR history timeline

### Data Export
Export all your data:
1. API: `GET /api/export?userId=X&format=json` or `format=csv`
2. Download complete data backup

### Water Intake
Track hydration in nutrition logs:
1. Go to `/nutrition/log`
2. Enter water intake in liters
3. Tracked alongside meals

### Date Pickers
Log past workouts/meals:
1. All logging forms now have date pickers
2. Select any past date (can't select future)

---

## 🛠️ Developer Guide

### Using Toast Notifications

```tsx
import { useToast } from "@/lib/hooks/useToast";
import ToastContainer from "@/components/ToastContainer";

function MyComponent() {
  const { toasts, removeToast, success, error } = useToast();

  const handleSave = () => {
    try {
      // ... save logic
      success("Saved successfully!");
    } catch (err) {
      error("Failed to save");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

### Using useFetch Hook

```tsx
import { useFetch } from "@/lib/hooks/useFetch";

function MyComponent() {
  const { data, loading, error, execute } = useFetch({
    onSuccess: (data) => console.log("Success!", data),
    onError: (err) => console.error("Error:", err),
  });

  useEffect(() => {
    execute("/api/workouts?userId=123");
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### Adding Loading Skeletons

```tsx
import { WorkoutHistorySkeleton, DashboardSkeleton } from "@/components/LoadingSkeleton";

function MyPage() {
  const [loading, setLoading] = useState(true);

  if (loading) return <WorkoutHistorySkeleton />;

  return <div>Content</div>;
}
```

---

## 🗺️ New Routes

| Route | Description |
|-------|-------------|
| `/templates` | Manage workout templates |
| `/prs` | View personal records |
| `/insights` | AI recommendations & deload detection |
| `/exercises/[name]` | Exercise-specific history |

---

## 🔑 Key API Endpoints

### CRUD Operations
- `PUT /api/workouts` - Edit workout
- `DELETE /api/workouts?id=X&userId=Y` - Delete workout
- `PUT /api/nutrition` - Edit nutrition log
- `DELETE /api/nutrition?id=X&userId=Y` - Delete nutrition log
- `PUT /api/recovery` - Edit recovery log
- `DELETE /api/recovery?id=X&userId=Y` - Delete recovery log

### New Features
- `GET /api/templates?userId=X` - Get templates
- `POST /api/templates` - Create template
- `PUT /api/templates` - Update template
- `DELETE /api/templates?id=X&userId=Y` - Delete template
- `GET /api/exercises/history?userId=X&name=Y` - Exercise progression
- `GET /api/recommendations?userId=X` - AI insights
- `GET /api/export?userId=X&format=json|csv` - Export data
- `POST /api/social/like` - Like activity
- `POST /api/social/comment` - Add comment

---

## 📦 Dependencies Added

```bash
npm install sharp  # Image optimization
```

---

## 🎯 Feature Checklist

### Logging
- [x] Workout logging with date picker
- [x] Nutrition logging with water intake
- [x] Recovery logging
- [x] Edit/delete all log types

### Analytics
- [x] Dashboard with real data
- [x] Analytics charts
- [x] Exercise-specific history
- [x] PR tracking

### AI & Recommendations
- [x] AI coach chat
- [x] Progressive overload recommendations
- [x] Deload detection
- [x] Recovery insights

### Social
- [x] Activity feed
- [x] Leaderboard
- [x] Follow system
- [x] Like/comment (API ready)

### Tools
- [x] Workout templates
- [x] Data export
- [x] Image optimization
- [x] Achievement system

---

## 💡 Tips

1. **Use templates** to save time logging recurring workouts
2. **Check insights page** weekly for deload recommendations
3. **Export data** monthly as backup
4. **Track water intake** for complete nutrition picture
5. **View exercise history** to ensure progressive overload

---

For full documentation, see:
- [IMPLEMENTATION_100_PERCENT.md](./IMPLEMENTATION_100_PERCENT.md) - Complete feature list
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
