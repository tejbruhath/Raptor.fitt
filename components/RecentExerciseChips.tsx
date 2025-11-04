'use client';

import { motion } from 'framer-motion';
import { Clock, TrendingUp, Dumbbell } from 'lucide-react';
import { useHoverCapability } from '@/lib/hooks/useHoverCapability';

interface ExerciseTemplate {
  name: string;
  muscleGroup: string;
  lastWeight?: number;
  lastReps?: number;
  lastSets?: number;
  suggestedWeight?: number;
  timesLogged?: number;
}

interface RecentExerciseChipsProps {
  recentExercises: ExerciseTemplate[];
  suggestedExercises?: ExerciseTemplate[];
  onSelect: (exercise: ExerciseTemplate) => void;
}

export default function RecentExerciseChips({
  recentExercises,
  suggestedExercises = [],
  onSelect,
}: RecentExerciseChipsProps) {
  const canHover = useHoverCapability();

  if (recentExercises.length === 0 && suggestedExercises.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Recent Exercises */}
      {recentExercises.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Recent Exercises</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentExercises.map((exercise, idx) => (
              <motion.button
                key={exercise.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={canHover ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(exercise)}
                className="px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 rounded-full transition-all hover-device:hover:shadow-glow"
              >
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">{exercise.name}</p>
                    {exercise.lastWeight && exercise.lastReps && (
                      <p className="text-xs text-muted font-mono">
                        {exercise.lastWeight}kg × {exercise.lastReps}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Exercises */}
      {suggestedExercises.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <p className="text-sm font-semibold text-secondary">Suggested Based on Last Session</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedExercises.map((exercise, idx) => (
              <motion.button
                key={exercise.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
                whileHover={canHover ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(exercise)}
                className="px-4 py-2 bg-gradient-to-r from-secondary/20 to-secondary/10 border border-secondary/30 rounded-full transition-all hover-device:hover:shadow-glow-secondary"
              >
                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-sm font-semibold">{exercise.name}</p>
                    {exercise.suggestedWeight && (
                      <p className="text-xs text-secondary font-mono">
                        Try {exercise.suggestedWeight}kg
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-3 bg-surface/30 border border-white/10 rounded-lg"
      >
        <p className="text-xs text-muted">
          💡 <span className="font-semibold">Quick Tip:</span> Type{' '}
          <code className="px-1 py-0.5 bg-surface rounded text-primary font-mono">
            Bench 100x8
          </code>{' '}
          for instant logging
        </p>
      </motion.div>
    </div>
  );
}
