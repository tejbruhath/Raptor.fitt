'use client';

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { Play, Pause, X, Plus, Trash2, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickLog } from './QuickLog';

export function WorkoutSessionMode() {
  const {
    currentSession,
    sessionMode,
    restTimer,
    lastExercise,
    startSession,
    endSession,
    addSet,
    removeSet,
    updateSet,
    removeExercise,
    startRestTimer,
    stopRestTimer,
    tickRestTimer,
  } = useWorkoutStore();

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer.isActive && restTimer.remaining > 0) {
      const interval = setInterval(() => {
        tickRestTimer();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [restTimer.isActive, restTimer.remaining, tickRestTimer]);

  // Vibrate when rest timer completes
  useEffect(() => {
    if (restTimer.isActive && restTimer.remaining === 0) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [restTimer.remaining, restTimer.isActive]);

  const handleStartSession = () => {
    startSession();
    setShowQuickLog(true);
  };

  const handleEndSession = async () => {
    if (!confirm('End workout session?')) return;

    const session = currentSession;
    endSession();

    // Save to backend
    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercises: session.exercises,
          duration: session.duration,
          notes: session.notes,
        }),
      });
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const handleAddSet = (exerciseId: string) => {
    const exercise = currentSession.exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet = {
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      rpe: lastSet?.rpe,
      timestamp: new Date(),
      completed: false,
    };

    addSet(exerciseId, newSet);
    startRestTimer(90); // Auto-start rest timer
  };

  const handleCopyLastSet = (exerciseId: string, setIndex: number) => {
    const exercise = currentSession.exercises.find((e) => e.id === exerciseId);
    if (!exercise || !exercise.sets[setIndex]) return;

    const setCopy = { ...exercise.sets[setIndex], completed: false };
    addSet(exerciseId, setCopy);
    startRestTimer(90);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateVolume = () => {
    return currentSession.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + set.weight * set.reps;
        }, 0)
      );
    }, 0);
  };

  if (!sessionMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading mb-2">Ready to Train?</h2>
          <p className="text-muted">Start a session to track your workout in real-time</p>
        </div>
        <button
          onClick={handleStartSession}
          className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all active:scale-[0.98] flex items-center gap-3"
        >
          <Play size={24} />
          Start Workout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Session Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-neutral pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading">Active Session</h2>
            <p className="text-sm text-muted">
              {currentSession.exercises.length} exercises • {calculateVolume()}kg volume
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg transition-all flex items-center gap-2"
          >
            <X size={18} />
            End
          </button>
        </div>

        {/* Rest Timer */}
        <AnimatePresence>
          {restTimer.isActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4 p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-primary"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary">Rest Timer</span>
                <button
                  onClick={stopRestTimer}
                  className="text-xs text-muted hover:text-white"
                >
                  Skip
                </button>
              </div>
              <div className="text-4xl font-mono font-bold text-center my-2">
                {formatTime(restTimer.remaining)}
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: '100%' }}
                  animate={{
                    width: `${(restTimer.remaining / restTimer.duration) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Add Exercise */}
      <button
        onClick={() => setShowQuickLog(!showQuickLog)}
        className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={20} className="text-primary" />
        <span className="text-primary font-semibold">Add Exercise</span>
      </button>

      {showQuickLog && (
        <QuickLog type="workout" onSubmit={() => setShowQuickLog(false)} />
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        {currentSession.exercises.map((exercise, exerciseIndex) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: exerciseIndex * 0.1 }}
            className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-neutral overflow-hidden"
          >
            {/* Exercise Header */}
            <div className="p-4 bg-background/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-heading text-lg">{exercise.name}</h3>
                <p className="text-xs text-muted">{exercise.muscleGroup}</p>
              </div>
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-2 hover:bg-negative/20 rounded-lg transition-all"
              >
                <Trash2 size={18} className="text-negative" />
              </button>
            </div>

            {/* Sets */}
            <div className="p-4 space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    set.completed
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-neutral'
                  }`}
                >
                  {/* Set Number */}
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-mono text-sm">
                    {setIndex + 1}
                  </div>

                  {/* Weight */}
                  <div className="flex-1">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(exercise.id, setIndex, {
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-transparent border-none focus:outline-none font-mono text-center"
                      placeholder="Weight"
                    />
                    <span className="text-xs text-muted block text-center">kg</span>
                  </div>

                  <span className="text-muted">×</span>

                  {/* Reps */}
                  <div className="flex-1">
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(exercise.id, setIndex, {
                          reps: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-transparent border-none focus:outline-none font-mono text-center"
                      placeholder="Reps"
                    />
                    <span className="text-xs text-muted block text-center">reps</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLastSet(exercise.id, setIndex)}
                      className="p-2 hover:bg-background rounded-lg transition-all"
                      title="Copy set"
                    >
                      <Copy size={16} className="text-muted" />
                    </button>
                    <button
                      onClick={() =>
                        updateSet(exercise.id, setIndex, { completed: !set.completed })
                      }
                      className={`p-2 rounded-lg transition-all ${
                        set.completed
                          ? 'bg-primary text-background'
                          : 'bg-background hover:bg-neutral'
                      }`}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => removeSet(exercise.id, setIndex)}
                      className="p-2 hover:bg-negative/20 rounded-lg transition-all"
                    >
                      <X size={16} className="text-negative" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Set Button */}
              <button
                onClick={() => handleAddSet(exercise.id)}
                className="w-full p-3 bg-background hover:bg-neutral border border-dashed border-neutral rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                <Plus size={16} className="text-muted" />
                <span className="text-sm text-muted">Add Set</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {currentSession.exercises.length === 0 && !showQuickLog && (
        <div className="text-center py-12">
          <p className="text-muted">No exercises yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
