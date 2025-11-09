'use client';

import { useState } from 'react';
import { Play, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface WarmUpExercise {
  name: string;
  sets: number;
  reps: number;
  duration?: number;
}

interface WarmUpBuilderProps {
  targetMuscles: string[];
  onComplete?: (routine: WarmUpExercise[]) => void;
}

const WARM_UP_LIBRARY: Record<string, WarmUpExercise[]> = {
  chest: [
    { name: 'Arm Circles', sets: 2, reps: 10 },
    { name: 'Shoulder Dislocations', sets: 2, reps: 12 },
    { name: 'Push-up (Light)', sets: 2, reps: 10 },
    { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
  ],
  back: [
    { name: 'Cat-Cow Stretch', sets: 2, reps: 10 },
    { name: 'Band Pull-Aparts', sets: 2, reps: 15 },
    { name: 'Dead Hangs', sets: 2, reps: 10, duration: 10 },
    { name: 'Scapular Pulls', sets: 2, reps: 10 },
  ],
  legs: [
    { name: 'Leg Swings', sets: 2, reps: 10 },
    { name: 'Hip Circles', sets: 2, reps: 10 },
    { name: 'Bodyweight Squats', sets: 2, reps: 12 },
    { name: 'Walking Lunges', sets: 2, reps: 10 },
    { name: 'Glute Bridges', sets: 2, reps: 15 },
  ],
  shoulders: [
    { name: 'Arm Circles', sets: 2, reps: 10 },
    { name: 'Shoulder Dislocations', sets: 2, reps: 12 },
    { name: 'Band External Rotations', sets: 2, reps: 12 },
    { name: 'Face Pulls', sets: 2, reps: 15 },
  ],
  arms: [
    { name: 'Wrist Circles', sets: 2, reps: 10 },
    { name: 'Band Curls (Light)', sets: 2, reps: 15 },
    { name: 'Tricep Extensions (Light)', sets: 2, reps: 15 },
  ],
};

export function WarmUpBuilder({ targetMuscles, onComplete }: WarmUpBuilderProps) {
  const [routine, setRoutine] = useState<WarmUpExercise[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  // Generate routine based on target muscles
  const generateRoutine = () => {
    const exercises: WarmUpExercise[] = [];
    
    targetMuscles.forEach((muscle) => {
      const muscleExercises = WARM_UP_LIBRARY[muscle.toLowerCase()];
      if (muscleExercises) {
        exercises.push(...muscleExercises.slice(0, 2)); // Take 2 exercises per muscle
      }
    });

    // Add general mobility
    exercises.unshift(
      { name: 'Light Cardio (Jog in place)', sets: 1, reps: 1, duration: 120 },
      { name: 'Dynamic Stretching', sets: 1, reps: 8 }
    );

    setRoutine(exercises);
    return exercises;
  };

  const handleStart = () => {
    if (routine.length === 0) {
      generateRoutine();
    }
    setIsStarted(true);
  };

  const handleNextSet = () => {
    if (currentSet < routine[currentExercise].sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExercise < routine.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    } else {
      // Warm-up complete
      setIsStarted(false);
      onComplete?.(routine);
    }
  };

  const handleSkipExercise = () => {
    if (currentExercise < routine.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setCurrentSet(1);
    } else {
      setIsStarted(false);
      onComplete?.(routine);
    }
  };

  if (routine.length === 0 && !isStarted) {
    return (
      <div className="bg-gradient-to-br from-warning/10 to-transparent rounded-2xl p-6 border border-warning/30">
        <h3 className="font-bold text-lg mb-4">Personalized Warm-Up</h3>
        <p className="text-sm text-muted mb-6">
          Based on your workout: {targetMuscles.join(', ')}
        </p>
        <button
          onClick={() => {
            generateRoutine();
            handleStart();
          }}
          className="w-full py-4 bg-gradient-to-r from-warning to-warning/80 text-background font-bold rounded-xl hover:shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <Play size={20} />
          Start Warm-Up ({Math.ceil((generateRoutine().length * 2) / 60)} min)
        </button>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="bg-surface/80 rounded-2xl p-6 border border-neutral space-y-4">
        <h3 className="font-bold text-lg">Warm-Up Routine</h3>
        <div className="space-y-2">
          {routine.map((exercise, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <p className="font-semibold text-sm">{exercise.name}</p>
                <p className="text-xs text-muted">
                  {exercise.sets} sets × {exercise.reps} reps
                  {exercise.duration && ` (${exercise.duration}s)`}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleStart}
          className="w-full py-3 bg-gradient-to-r from-warning to-warning/80 text-background font-bold rounded-xl hover:shadow-glow transition-all"
        >
          Start Warm-Up
        </button>
      </div>
    );
  }

  const exercise = routine[currentExercise];
  const progress = ((currentExercise + (currentSet / exercise.sets)) / routine.length) * 100;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted">
              Exercise {currentExercise + 1} of {routine.length}
            </p>
            <p className="text-sm text-muted">{Math.round(progress)}%</p>
          </div>
          <div className="w-full h-2 bg-neutral rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-warning to-positive"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        <div className="text-center">
          <h2 className="text-4xl font-bold font-heading mb-4">{exercise.name}</h2>
          <p className="text-6xl font-mono font-bold mb-2">
            Set {currentSet}/{exercise.sets}
          </p>
          <p className="text-2xl text-muted">
            {exercise.reps} reps
            {exercise.duration && ` • ${exercise.duration}s`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleSkipExercise}
            className="flex-1 py-4 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
          >
            Skip Exercise
          </button>
          <button
            onClick={handleNextSet}
            className="flex-1 py-4 bg-gradient-to-r from-warning to-positive text-background font-bold rounded-xl hover:shadow-glow transition-all"
          >
            {currentSet < exercise.sets
              ? 'Next Set'
              : currentExercise < routine.length - 1
              ? 'Next Exercise'
              : 'Complete'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
