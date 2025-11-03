import dbConnect from '../lib/mongodb';
import User from '../lib/models/User';
import Workout from '../lib/models/Workout';
import Nutrition from '../lib/models/Nutrition';
import Recovery from '../lib/models/Recovery';
import StrengthIndex from '../lib/models/StrengthIndex';
import { calculateStrengthIndex } from '../lib/strengthIndex';
import bcrypt from 'bcryptjs';

async function seedTestUser() {
  try {
    await dbConnect();

    console.log('🦖 Seeding Raptor.fitt test user...');

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);

    let testUser = await User.findOne({ email: 'test@raptor.fitt' });

    if (!testUser) {
      testUser = await User.create({
        email: 'test@raptor.fitt',
        name: 'Test Raptor',
        password: hashedPassword,
        bodyweight: 80,
        height: 180,
        age: 28,
        trainingAge: 3,
        settings: {
          units: 'metric',
          notifications: true,
        },
      });
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user exists');
    }

    const userId = testUser._id;

    // Clear existing data for test user
    await Workout.deleteMany({ userId });
    await Nutrition.deleteMany({ userId });
    await Recovery.deleteMany({ userId });
    await StrengthIndex.deleteMany({ userId });

    console.log('🗑️  Cleared old test data');

    // Generate 60 days of workout data
    const workouts = [];
    const today = new Date();

    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip some days for realism (3-4 workouts per week)
      if (i % 7 === 0 || i % 7 === 3) continue;

      const dayOfWeek = i % 7;
      let exercises;

      // Rotating split
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        // Push day
        exercises = [
          {
            name: 'Bench Press',
            muscleGroup: 'chest',
            sets: [
              { reps: 8, weight: 100 + Math.floor(i / 10), rpe: 7 },
              { reps: 8, weight: 100 + Math.floor(i / 10), rpe: 8 },
              { reps: 7, weight: 100 + Math.floor(i / 10), rpe: 9 },
            ],
          },
          {
            name: 'Overhead Press',
            muscleGroup: 'shoulders',
            sets: [
              { reps: 8, weight: 60 + Math.floor(i / 15), rpe: 7 },
              { reps: 8, weight: 60 + Math.floor(i / 15), rpe: 8 },
              { reps: 7, weight: 60 + Math.floor(i / 15), rpe: 8 },
            ],
          },
          {
            name: 'Tricep Pushdown',
            muscleGroup: 'arms',
            sets: [
              { reps: 12, weight: 30, rpe: 6 },
              { reps: 12, weight: 30, rpe: 7 },
              { reps: 10, weight: 30, rpe: 8 },
            ],
          },
        ];
      } else if (dayOfWeek === 2 || dayOfWeek === 5) {
        // Pull day
        exercises = [
          {
            name: 'Deadlift',
            muscleGroup: 'back',
            sets: [
              { reps: 5, weight: 140 + Math.floor(i / 8), rpe: 7 },
              { reps: 5, weight: 140 + Math.floor(i / 8), rpe: 8 },
              { reps: 4, weight: 140 + Math.floor(i / 8), rpe: 9 },
            ],
          },
          {
            name: 'Barbell Row',
            muscleGroup: 'back',
            sets: [
              { reps: 8, weight: 80 + Math.floor(i / 12), rpe: 7 },
              { reps: 8, weight: 80 + Math.floor(i / 12), rpe: 8 },
              { reps: 7, weight: 80 + Math.floor(i / 12), rpe: 8 },
            ],
          },
          {
            name: 'Bicep Curl',
            muscleGroup: 'arms',
            sets: [
              { reps: 10, weight: 20, rpe: 6 },
              { reps: 10, weight: 20, rpe: 7 },
              { reps: 9, weight: 20, rpe: 8 },
            ],
          },
        ];
      } else {
        // Leg day
        exercises = [
          {
            name: 'Squat',
            muscleGroup: 'legs',
            sets: [
              { reps: 6, weight: 120 + Math.floor(i / 10), rpe: 7 },
              { reps: 6, weight: 120 + Math.floor(i / 10), rpe: 8 },
              { reps: 5, weight: 120 + Math.floor(i / 10), rpe: 9 },
            ],
          },
          {
            name: 'Romanian Deadlift',
            muscleGroup: 'legs',
            sets: [
              { reps: 8, weight: 90 + Math.floor(i / 12), rpe: 7 },
              { reps: 8, weight: 90 + Math.floor(i / 12), rpe: 8 },
              { reps: 7, weight: 90 + Math.floor(i / 12), rpe: 8 },
            ],
          },
          {
            name: 'Leg Press',
            muscleGroup: 'legs',
            sets: [
              { reps: 10, weight: 180, rpe: 7 },
              { reps: 10, weight: 180, rpe: 8 },
              { reps: 9, weight: 180, rpe: 8 },
            ],
          },
        ];
      }

      workouts.push({
        userId,
        date,
        exercises,
      });
    }

    await Workout.insertMany(workouts);
    console.log(`✅ Created ${workouts.length} workouts`);

    // Generate nutrition logs
    const nutritionLogs = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      nutritionLogs.push({
        userId,
        date,
        meals: [
          { name: 'Breakfast', calories: 600, protein: 40, carbs: 60, fats: 20 },
          { name: 'Lunch', calories: 700, protein: 50, carbs: 70, fats: 25 },
          { name: 'Dinner', calories: 650, protein: 45, carbs: 65, fats: 22 },
          { name: 'Snacks', calories: 300, protein: 15, carbs: 30, fats: 13 },
        ],
      });
    }

    await Nutrition.insertMany(nutritionLogs);
    console.log(`✅ Created ${nutritionLogs.length} nutrition logs`);

    // Generate recovery logs
    const recoveryLogs = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      recoveryLogs.push({
        userId,
        date,
        sleepHours: 6.5 + Math.random() * 2,
        sleepQuality: 6 + Math.floor(Math.random() * 4),
        soreness: 3 + Math.floor(Math.random() * 5),
        stress: 3 + Math.floor(Math.random() * 5),
        notes: 'Feeling good',
      });
    }

    await Recovery.insertMany(recoveryLogs);
    console.log(`✅ Created ${recoveryLogs.length} recovery logs`);

    // Calculate Strength Index snapshots
    const allWorkouts = await Workout.find({ userId }).sort({ date: 1 });
    const siSnapshots = [];

    for (let i = 0; i < allWorkouts.length; i += 3) {
      const workoutSubset = allWorkouts.slice(Math.max(0, i - 10), i + 1);
      const si = calculateStrengthIndex(workoutSubset, testUser.bodyweight);

      const prevSI = siSnapshots.length > 0 ? siSnapshots[siSnapshots.length - 1].totalSI : 0;
      const change = si.totalSI - prevSI;
      const changePercent = prevSI > 0 ? (change / prevSI) * 100 : 0;

      siSnapshots.push({
        userId,
        date: allWorkouts[i].date,
        totalSI: si.totalSI,
        breakdown: si.breakdown,
        change,
        changePercent,
      });
    }

    await StrengthIndex.insertMany(siSnapshots);
    console.log(`✅ Created ${siSnapshots.length} SI snapshots`);

    console.log('\n🎉 Test user seeded successfully!\n');
    console.log('📧 Email: test@raptor.fitt');
    console.log('🔑 Password: test123');
    console.log(`💪 Current SI: ${siSnapshots[siSnapshots.length - 1]?.totalSI.toFixed(1) || 'N/A'}`);
    console.log(`🏋️ Total Workouts: ${workouts.length}`);
    console.log(`📊 Data Range: ${workouts[0].date.toLocaleDateString()} - ${workouts[workouts.length - 1].date.toLocaleDateString()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding test user:', error);
    process.exit(1);
  }
}

seedTestUser();
