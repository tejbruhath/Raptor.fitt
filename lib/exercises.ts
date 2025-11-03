// Exercise library with muscle group mappings

export interface Exercise {
  name: string;
  muscleGroup: string;
  equipment: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  compound: boolean;
}

export const EXERCISE_LIBRARY: Exercise[] = [
  // Chest
  { name: "Bench Press", muscleGroup: "chest", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Incline Bench Press", muscleGroup: "chest", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Dumbbell Press", muscleGroup: "chest", equipment: ["dumbbell"], difficulty: "beginner", compound: true },
  { name: "Push Up", muscleGroup: "chest", equipment: ["bodyweight"], difficulty: "beginner", compound: true },
  { name: "Chest Fly", muscleGroup: "chest", equipment: ["dumbbell", "cable"], difficulty: "beginner", compound: false },
  { name: "Dips", muscleGroup: "chest", equipment: ["bodyweight", "dip bar"], difficulty: "intermediate", compound: true },

  // Back
  { name: "Deadlift", muscleGroup: "back", equipment: ["barbell"], difficulty: "advanced", compound: true },
  { name: "Pull Up", muscleGroup: "back", equipment: ["bodyweight", "pull-up bar"], difficulty: "intermediate", compound: true },
  { name: "Chin Up", muscleGroup: "back", equipment: ["bodyweight", "pull-up bar"], difficulty: "intermediate", compound: true },
  { name: "Barbell Row", muscleGroup: "back", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Dumbbell Row", muscleGroup: "back", equipment: ["dumbbell"], difficulty: "beginner", compound: true },
  { name: "Lat Pulldown", muscleGroup: "back", equipment: ["cable"], difficulty: "beginner", compound: true },
  { name: "Cable Row", muscleGroup: "back", equipment: ["cable"], difficulty: "beginner", compound: true },
  { name: "T-Bar Row", muscleGroup: "back", equipment: ["barbell"], difficulty: "intermediate", compound: true },

  // Legs
  { name: "Squat", muscleGroup: "legs", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Front Squat", muscleGroup: "legs", equipment: ["barbell"], difficulty: "advanced", compound: true },
  { name: "Leg Press", muscleGroup: "legs", equipment: ["machine"], difficulty: "beginner", compound: true },
  { name: "Romanian Deadlift", muscleGroup: "legs", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Leg Curl", muscleGroup: "legs", equipment: ["machine"], difficulty: "beginner", compound: false },
  { name: "Leg Extension", muscleGroup: "legs", equipment: ["machine"], difficulty: "beginner", compound: false },
  { name: "Calf Raise", muscleGroup: "legs", equipment: ["machine", "dumbbell"], difficulty: "beginner", compound: false },
  { name: "Lunges", muscleGroup: "legs", equipment: ["bodyweight", "dumbbell"], difficulty: "beginner", compound: true },
  { name: "Bulgarian Split Squat", muscleGroup: "legs", equipment: ["dumbbell"], difficulty: "intermediate", compound: true },

  // Shoulders
  { name: "Overhead Press", muscleGroup: "shoulders", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Military Press", muscleGroup: "shoulders", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Shoulder Press", muscleGroup: "shoulders", equipment: ["dumbbell"], difficulty: "beginner", compound: true },
  { name: "Lateral Raise", muscleGroup: "shoulders", equipment: ["dumbbell", "cable"], difficulty: "beginner", compound: false },
  { name: "Front Raise", muscleGroup: "shoulders", equipment: ["dumbbell", "cable"], difficulty: "beginner", compound: false },
  { name: "Rear Delt Fly", muscleGroup: "shoulders", equipment: ["dumbbell", "cable"], difficulty: "beginner", compound: false },
  { name: "Arnold Press", muscleGroup: "shoulders", equipment: ["dumbbell"], difficulty: "intermediate", compound: true },

  // Arms
  { name: "Bicep Curl", muscleGroup: "arms", equipment: ["dumbbell", "barbell"], difficulty: "beginner", compound: false },
  { name: "Hammer Curl", muscleGroup: "arms", equipment: ["dumbbell"], difficulty: "beginner", compound: false },
  { name: "Tricep Extension", muscleGroup: "arms", equipment: ["dumbbell", "cable"], difficulty: "beginner", compound: false },
  { name: "Tricep Pushdown", muscleGroup: "arms", equipment: ["cable"], difficulty: "beginner", compound: false },
  { name: "Close Grip Bench Press", muscleGroup: "arms", equipment: ["barbell"], difficulty: "intermediate", compound: true },
  { name: "Skull Crusher", muscleGroup: "arms", equipment: ["barbell", "dumbbell"], difficulty: "intermediate", compound: false },
  { name: "Preacher Curl", muscleGroup: "arms", equipment: ["dumbbell", "barbell"], difficulty: "beginner", compound: false },

  // Core
  { name: "Plank", muscleGroup: "core", equipment: ["bodyweight"], difficulty: "beginner", compound: false },
  { name: "Crunches", muscleGroup: "core", equipment: ["bodyweight"], difficulty: "beginner", compound: false },
  { name: "Russian Twist", muscleGroup: "core", equipment: ["bodyweight", "dumbbell"], difficulty: "beginner", compound: false },
  { name: "Leg Raises", muscleGroup: "core", equipment: ["bodyweight"], difficulty: "intermediate", compound: false },
  { name: "Ab Wheel", muscleGroup: "core", equipment: ["ab wheel"], difficulty: "intermediate", compound: false },
  { name: "Cable Crunch", muscleGroup: "core", equipment: ["cable"], difficulty: "beginner", compound: false },
];

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.muscleGroup.toLowerCase().includes(lowerQuery)
  );
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return EXERCISE_LIBRARY.filter(
    (ex) => ex.muscleGroup.toLowerCase() === muscleGroup.toLowerCase()
  );
}

export function getCompoundExercises(): Exercise[] {
  return EXERCISE_LIBRARY.filter((ex) => ex.compound);
}
