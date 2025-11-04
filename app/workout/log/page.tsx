"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, X, Minus, Check, Timer, Calculator, TrendingUp } from "lucide-react";
import Link from "next/link";
import DatePicker from "@/components/DatePicker";
import { MUSCLE_GROUP_EXERCISES, MUSCLE_GROUP_COLORS } from "@/lib/exerciseDatabase";
import RestTimer from "@/components/RestTimer";
import PlateCalculator from "@/components/PlateCalculator";
import WorkoutRecommendationCard from "@/components/WorkoutRecommendationCard";
import { useHoverCapability } from "@/lib/hooks/useHoverCapability";
import RecentExerciseChips from "@/components/RecentExerciseChips";
import PRGlowInput from "@/components/PRGlowInput";
import VolumeToast from "@/components/VolumeToast";
import WorkoutSessionSummary from "@/components/WorkoutSessionSummary";
import AchievementUnlockModal from "@/components/AchievementUnlockModal";
import { useOfflineQueue } from "@/lib/hooks/useOfflineQueue";
import { parseQuickWorkout, isQuickAddFormat, calculateTotalVolume, compareVolume } from "@/lib/utils/workoutParsing";
import { fetchRecentExercises, fetchSuggestedExercises, fetchUserPRs } from "@/lib/utils/dataFetching";

interface Set {
  reps: number;
  weight: number;
  rpe?: number;
  isPR?: boolean;
}

interface Exercise {
  name: string;
  muscleGroup: string;
  sets: Set[];
}

type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms';

export default function LogWorkout() {
  const canHover = useHoverCapability();
  const { data: session } = useSession();
  const router = useRouter();
  const { isOnline, addToQueue } = useOfflineQueue();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  
  // Smart logging states
  const [recentExercises, setRecentExercises] = useState<any[]>([]);
  const [suggestedExercises, setSuggestedExercises] = useState<any[]>([]);
  const [userPRs, setUserPRs] = useState<Record<string, number>>({});
  const [showVolumeToast, setShowVolumeToast] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [volumeChange, setVolumeChange] = useState(0);
  const [showSessionSummary, setShowSessionSummary] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState<string>('0:00');
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [quickAddInput, setQuickAddInput] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Modal states
  const [showMuscleGroupModal, setShowMuscleGroupModal] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  const [showSetModal, setShowSetModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<Record<string, Set[]>>({});
  
  // Utility modals
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");
  
  // Recommendations
  const [exerciseRecommendation, setExerciseRecommendation] = useState<any>(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  async function loadLastWorkout() {
    try {
      if (!session?.user?.id) return;

      setLoadingLastWorkout(true);

      const res = await fetch(`/api/workouts?userId=${session.user.id}`);
      const data = await res.json();
      if (data.workouts && data.workouts.length > 0) {
        // Sort by date descending and get most recent
        const sorted = data.workouts.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExercises(sorted[0].exercises || []);
      }
    } catch (error) {
      console.error("Failed to load last workout:", error);
    } finally {
      setLoadingLastWorkout(false);
    }
  }

  async function fetchRecentWorkouts() {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/workouts?userId=${session.user.id}`);
      const data = await res.json();
      setRecentWorkouts(data.workouts?.slice(0, 5) || []);
    } catch (e) {
      console.error('Failed to fetch recent workouts', e);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecentWorkouts();
      loadSmartData();
      setSessionStartTime(new Date()); // Track session start
    }
  }, [session]);

  // Update session duration every minute
  useEffect(() => {
    if (!sessionStartTime) return;
    
    const updateDuration = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setSessionDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateDuration(); // Initial update
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  async function loadSmartData() {
    if (!session?.user?.id) return;
    const [recent, suggested, prs] = await Promise.all([
      fetchRecentExercises(session.user.id),
      fetchSuggestedExercises(session.user.id),
      fetchUserPRs(session.user.id),
    ]);
    setRecentExercises(recent);
    setSuggestedExercises(suggested);
    setUserPRs(prs);
  }

  async function deleteWorkout(id: string) {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/workouts?id=${id}&userId=${session.user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentWorkouts(prev => prev.filter((w) => w._id !== id));
      }
    } catch (e) {
      console.error('Delete workout failed', e);
    }
  }

  // Load exercise history for default values
  useEffect(() => {
    if (session?.user?.id) {
      loadExerciseHistory();
    }
  }, [session]);

  async function loadExerciseHistory() {
    try {
      const res = await fetch(`/api/workouts?userId=${session?.user?.id}`);
      const data = await res.json();
      if (data.workouts) {
        const history: Record<string, Set[]> = {};
        data.workouts.forEach((workout: any) => {
          workout.exercises.forEach((ex: Exercise) => {
            if (!history[ex.name] || workout.date > history[ex.name][0]) {
              history[ex.name] = ex.sets;
            }
          });
        });
        setExerciseHistory(history);
      }
    } catch (error) {
      console.error("Failed to load exercise history:", error);
    }
  }

  // Handle muscle group selection
  const handleMuscleGroupClick = (muscleGroup: MuscleGroup) => {
    setSelectedMuscleGroup(muscleGroup);
    setShowExerciseModal(true);
  };

  // Handle exercise selection
  const handleExerciseClick = async (exerciseName: string) => {
    setSelectedExerciseName(exerciseName);
    setShowExerciseModal(false);
    
    // Get previous sets for this exercise or default
    const previousSets = exerciseHistory[exerciseName] || [
      { reps: 10, weight: 20, rpe: 7, isPR: false }
    ];
    
    const newExercise = {
      name: exerciseName,
      muscleGroup: selectedMuscleGroup || 'chest',
      sets: previousSets.map(s => ({ ...s, isPR: false })),
    };
    
    setCurrentExercise(newExercise);
    setShowSetModal(true);
    
    // Fetch recommendation for this exercise
    if (session?.user?.id) {
      setLoadingRecommendation(true);
      const requestedExercise = exerciseName;
      
      try {
        const res = await fetch(`/api/recommendations?userId=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          const rec = data.exerciseRecommendations?.find(
            (r: any) => r.exercise === exerciseName
          );
          
          // Only update if still on the same exercise
          setCurrentExercise(current => {
            if (current?.name === requestedExercise) {
              setExerciseRecommendation(rec || null);
            }
            return current;
          });
        }
      } catch (error) {
        console.error('Failed to fetch recommendation:', error);
      } finally {
        setLoadingRecommendation(false);
      }
    }
  };

  // Save exercise to workout
  const saveExerciseToWorkout = () => {
    if (currentExercise) {
      // Calculate volume for this exercise
      const exerciseVolume = calculateTotalVolume(currentExercise.sets);
      
      // Show volume toast
      setCurrentVolume(exerciseVolume);
      setVolumeChange(0); // Could fetch previous session to compare
      setShowVolumeToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowVolumeToast(false), 3000);
      
      // Auto-start rest timer if enabled
      setShowRestTimer(true);
      
      setExercises([...exercises, currentExercise]);
      setShowSetModal(false);
      setCurrentExercise(null);
      setSelectedMuscleGroup(null);
    }
  };

  // Add set to current exercise
  const addSetToCurrentExercise = () => {
    if (currentExercise && currentExercise.sets.length > 0) {
      const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
      setCurrentExercise({
        ...currentExercise,
        sets: [...currentExercise.sets, { ...lastSet, isPR: false }],
      });
    }
  };

  // Update current exercise set
  const updateCurrentSet = (setIndex: number, field: keyof Set, value: number | boolean) => {
    if (currentExercise) {
      const newSets = [...currentExercise.sets];
      (newSets[setIndex] as any)[field] = value;
      setCurrentExercise({ ...currentExercise, sets: newSets });
    }
  };

  // Increment/decrement weight
  const adjustWeight = (setIndex: number, delta: number) => {
    if (currentExercise) {
      const newSets = [...currentExercise.sets];
      newSets[setIndex].weight = Math.max(0, newSets[setIndex].weight + delta);
      setCurrentExercise({ ...currentExercise, sets: newSets });
    }
  };

  const addSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, rpe: 7 });
    setExercises(newExercises);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "rpe",
    value: number
  ) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const togglePR = (exerciseIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex].isPR = !newExercises[exerciseIndex].sets[setIndex].isPR;
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (!session?.user?.id) {
      alert("Please sign in to save workouts");
      return;
    }

    setSaving(true);
    try {
      const duration = sessionStartTime ? Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000 / 60) : undefined;
      const workoutData = {
        userId: session.user.id,
        date: new Date(date).toISOString(),
        exercises,
        notes: workoutNotes,
        duration,
      };

      // Offline support
      if (!isOnline) {
        addToQueue('workout', workoutData);
        alert('Workout saved offline. Will sync when online.');
        router.push("/dashboard");
        return;
      }

      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        const data = await response.json();
        const workoutId = data.workout?._id;

        // Track PRs via new API and update exercise templates
        const prPromises: Promise<any>[] = [];
        const templatePromises: Promise<any>[] = [];
        let prCount = 0;

        exercises.forEach((exercise) => {
          // Update exercise template
          const avgWeight = exercise.sets.reduce((sum, s) => sum + s.weight, 0) / exercise.sets.length;
          const avgReps = exercise.sets.reduce((sum, s) => sum + s.reps, 0) / exercise.sets.length;
          
          templatePromises.push(
            fetch("/api/exercise-templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: session.user.id,
                name: exercise.name,
                muscleGroup: exercise.muscleGroup,
                weight: avgWeight,
                reps: avgReps,
                sets: exercise.sets.length,
              }),
            })
          );

          exercise.sets.forEach((set) => {
            if (set.isPR || set.weight > (userPRs[exercise.name] || 0)) {
              prCount++;
              prPromises.push(
                fetch("/api/workout-prs", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: session.user.id,
                    exerciseName: exercise.name,
                    weight: set.weight,
                    reps: set.reps,
                    workoutId,
                  }),
                })
              );
            }
          });
        });

        await Promise.all([...prPromises, ...templatePromises]);

        // Recalculate SI
        try {
          await fetch('/api/strength-index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });
        } catch (e) {
          console.warn('SI recalculation failed');
        }

        // Check for new achievements
        try {
          const achRes = await fetch('/api/achievements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });
          const achData = await achRes.json();
          if (achData.newAchievements && achData.newAchievements.length > 0) {
            setNewAchievements(achData.newAchievements);
          }
        } catch (e) {
          console.warn('Achievement check failed');
        }

        // Show session summary instead of redirecting
        const totalVolume = exercises.reduce((sum, ex) => 
          sum + calculateTotalVolume(ex.sets), 0
        );

        setSessionData({
          exercises,
          duration,
          volumeChange: 0, // Could fetch and compare
          prsAchieved: prCount,
          recoveryTip: prCount > 2 ? '48-72h rest recommended after PRs' : 'Great session! Focus on recovery.',
        });
        setShowSessionSummary(true);
      } else {
        alert("Failed to save workout");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover-device:hover:text-primary-light">
            ← Back
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold">Log Workout</h1>
            {sessionStartTime && (
              <p className="text-xs text-primary font-mono">{sessionDuration}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRestTimer(true)}
              className="p-2 rounded-lg transition-colors hover-device:hover:bg-primary/20"
              title="Rest Timer"
            >
              <Timer className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={() => setShowPlateCalc(true)}
              className="p-2 rounded-lg transition-colors hover-device:hover:bg-primary/20"
              title="Plate Calculator"
            >
              <Calculator className="w-5 h-5 text-warning" />
            </button>
            <button
              onClick={saveWorkout}
              className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
              disabled={exercises.length === 0 || saving}
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Quick Actions */}
        {session?.user?.id && (
          <div className="flex gap-3">
            <button
              onClick={loadLastWorkout}
              disabled={loadingLastWorkout}
              className="btn-primary flex-1"
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              {loadingLastWorkout ? "Loading..." : "Repeat Last Session"}
            </button>
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="btn-ghost flex-1"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Quick Add
            </button>
          </div>
        )}

        {/* Quick Add Input */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card overflow-hidden"
            >
              <h3 className="text-lg font-heading font-bold mb-3">Quick Add Exercise</h3>
              <p className="text-sm text-muted mb-3">
                Try: "Squat 120x5x3" or "Bench 100x8"
              </p>
              <input
                type="text"
                value={quickAddInput}
                onChange={(e) => setQuickAddInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickAddInput.trim()) {
                    const parsed = parseQuickWorkout(quickAddInput);
                    if (parsed && parsed.exerciseName) {
                      setCurrentExercise({
                        name: parsed.exerciseName,
                        muscleGroup: 'legs', // Default, user can change
                        sets: parsed.sets.map(s => ({ ...s, rpe: 7 })),
                      });
                      setShowSetModal(true);
                      setQuickAddInput('');
                      setShowQuickAdd(false);
                    } else {
                      alert('Invalid format. Try: "Squat 120x5x3"');
                    }
                  }
                }}
                placeholder="e.g., Squat 120x5x3"
                className="input w-full mb-3"
                autoFocus
              />
              <button
                onClick={() => {
                  if (quickAddInput.trim()) {
                    const parsed = parseQuickWorkout(quickAddInput);
                    if (parsed && parsed.exerciseName) {
                      setCurrentExercise({
                        name: parsed.exerciseName,
                        muscleGroup: 'legs',
                        sets: parsed.sets.map(s => ({ ...s, rpe: 7 })),
                      });
                      setShowSetModal(true);
                      setQuickAddInput('');
                      setShowQuickAdd(false);
                    } else {
                      alert('Invalid format. Try: "Squat 120x5x3"');
                    }
                  }
                }}
                className="btn-primary w-full"
              >
                Add Exercise
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">Workout Date</h2>
          <DatePicker value={date} onChange={setDate} label="Select Date" />
        </motion.div>

        {/* Smart Exercise Suggestions */}
        {(recentExercises.length > 0 || suggestedExercises.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <RecentExerciseChips
              recentExercises={recentExercises}
              suggestedExercises={suggestedExercises}
              onSelect={(exercise) => {
                setCurrentExercise({
                  name: exercise.name,
                  muscleGroup: exercise.muscleGroup,
                  sets: exercise.lastSets
                    ? Array(exercise.lastSets).fill(null).map(() => ({
                        weight: exercise.lastWeight || 0,
                        reps: exercise.lastReps || 0,
                        rpe: 7,
                      }))
                    : [{ weight: 0, reps: 0, rpe: 7 }],
                });
                setShowSetModal(true);
              }}
            />
          </motion.div>
        )}

        {/* Muscle Group Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {(Object.keys(MUSCLE_GROUP_EXERCISES) as MuscleGroup[]).map((muscleGroup) => {
            const colors = MUSCLE_GROUP_COLORS[muscleGroup];
            return (
              <button
                key={muscleGroup}
                onClick={() => handleMuscleGroupClick(muscleGroup)}
                className={`card p-8 text-center transition-all bg-gradient-to-br ${colors.bg} border ${colors.border} hover-device:hover:scale-105`}
              >
                <p className={`font-heading font-extrabold text-2xl capitalize ${colors.text}`}>
                  {muscleGroup}
                </p>
              </button>
            );
          })}
        </motion.div>

        {/* Workout Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-heading font-bold mb-3">Workout Notes</h3>
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            className="input w-full min-h-[100px] resize-y"
            placeholder="How did today's workout feel? Any PRs or observations..."
          />
        </motion.div>

        {/* Exercises List */}
        {exercises.map((exercise, exerciseIndex) => (
          <motion.div
            key={exerciseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-heading font-bold">
                  {exercise.name}
                </h3>
                <p className="text-sm text-muted capitalize">
                  {exercise.muscleGroup}
                </p>
              </div>
              <button
                onClick={() => removeExercise(exerciseIndex)}
                className="text-negative transition-colors hover-device:hover:text-accent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Sets Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-3 text-sm text-muted uppercase tracking-wide">
                <span>Set</span>
                <span>Reps</span>
                <span>Weight (kg)</span>
                <span>RPE</span>
                <span>PR</span>
              </div>

              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="grid grid-cols-5 gap-3">
                  <div className="flex items-center font-mono font-bold text-primary">
                    {setIndex + 1}
                  </div>
                  <input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(
                        exerciseIndex,
                        setIndex,
                        "reps",
                        Number(e.target.value)
                      )
                    }
                    className="input text-center"
                    placeholder="0"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={set.weight || ""}
                    onChange={(e) =>
                      updateSet(
                        exerciseIndex,
                        setIndex,
                        "weight",
                        Number(e.target.value)
                      )
                    }
                    className="input text-center"
                    placeholder="0"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={set.rpe || ""}
                    onChange={(e) =>
                      updateSet(
                        exerciseIndex,
                        setIndex,
                        "rpe",
                        Number(e.target.value)
                      )
                    }
                    className="input text-center"
                    placeholder="7"
                  />
                  <button
                    onClick={() => togglePR(exerciseIndex, setIndex)}
                    className={`flex items-center justify-center rounded-lg transition-all ${
                      set.isPR
                        ? "bg-warning text-background"
                        : "bg-surface text-muted hover-device:hover:bg-neutral"
                    }`}
                    title="Mark as PR"
                  >
                    🏆
                  </button>
                </div>
              ))}

              <button
                onClick={() => addSet(exerciseIndex)}
                className="btn-ghost w-full text-sm"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Set
              </button>
            </div>
          </motion.div>
        ))}

        {exercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="text-6xl mb-4">💪</div>
            <p className="text-muted text-lg font-semibold">No exercises added yet</p>
            <p className="text-muted text-sm mt-2">
              Tap a muscle group above to get started
            </p>
          </motion.div>
        )}

        {/* Recent Workouts (Delete support) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold">Recent Workouts</h2>
            <button className="btn-ghost text-sm" onClick={fetchRecentWorkouts}>Refresh</button>
          </div>
          {recentWorkouts.length === 0 ? (
            <p className="text-muted">No workouts yet.</p>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div>
                    <p className="font-semibold">{new Date(w.date || w.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-muted">{w.exercises?.length || 0} exercises</p>
                  </div>
                  <button className="text-negative hover-device:hover:text-accent" onClick={() => deleteWorkout(w._id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Exercise Selection Modal */}
      <AnimatePresence>
        {showExerciseModal && selectedMuscleGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowExerciseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-heading font-bold capitalize">
                    {selectedMuscleGroup} Exercises
                  </h2>
                  <button
                    onClick={() => {
                      setShowExerciseModal(false);
                      setExerciseSearch("");
                    }}
                    className="text-muted hover-device:hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="input w-full"
                />
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {MUSCLE_GROUP_EXERCISES[selectedMuscleGroup]
                  .filter(exercise => 
                    exercise.toLowerCase().includes(exerciseSearch.toLowerCase())
                  )
                  .map((exercise) => (
                  <button
                    key={exercise}
                    onClick={() => handleExerciseClick(exercise)}
                    className="w-full text-left p-4 rounded-lg bg-surface transition-all border border-transparent hover-device:hover:bg-primary/20 hover-device:hover:border-primary/30"
                  >
                    <p className="font-semibold">{exercise}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set Entry Modal */}
      <AnimatePresence>
        {showSetModal && currentExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => {
              setShowSetModal(false);
              setCurrentExercise(null);
              setExerciseRecommendation(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-heading font-bold">{currentExercise.name}</h2>
                  <p className="text-sm text-muted capitalize">{currentExercise.muscleGroup}</p>
                </div>
                <button
                  onClick={() => {
                    setShowSetModal(false);
                    setCurrentExercise(null);
                    setExerciseRecommendation(null);
                  }}
                  className="text-muted hover-device:hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* AI Recommendation */}
                {loadingRecommendation && (
                  <div className="p-4 bg-surface/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-surface rounded w-3/4 mb-2" />
                    <div className="h-4 bg-surface rounded w-1/2" />
                  </div>
                )}
                
                {!loadingRecommendation && exerciseRecommendation && (
                  <WorkoutRecommendationCard
                    exercise={exerciseRecommendation.exercise}
                    lastWeight={exerciseRecommendation.lastWeight}
                    lastReps={exerciseRecommendation.lastReps}
                    lastSets={exerciseRecommendation.lastSets ?? currentExercise.sets.length}
                    suggestedWeight={exerciseRecommendation.suggestedWeight}
                    suggestedReps={exerciseRecommendation.suggestedReps}
                    suggestedSets={exerciseRecommendation.suggestedSets ?? currentExercise.sets.length}
                    reasoning={exerciseRecommendation.recommendation}
                    confidence={exerciseRecommendation.confidence ?? 85}
                  />
                )}
                
                {/* Sets List */}
                {currentExercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="p-4 bg-surface/50 rounded-lg space-y-3">
                    <p className="font-bold text-primary">Set {setIndex + 1}</p>
                    
                    {/* Weight Control with PR Detection */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustWeight(setIndex, -2.5)}
                        className="p-2 bg-surface rounded-lg hover-device:hover:bg-primary/20 shrink-0"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <PRGlowInput
                          value={set.weight}
                          onChange={(val) => updateCurrentSet(setIndex, 'weight', val)}
                          previousMax={userPRs[currentExercise.name] || 0}
                          label=""
                          placeholder="0"
                          unit="kg"
                        />
                      </div>
                      <button
                        onClick={() => adjustWeight(setIndex, 2.5)}
                        className="p-2 bg-surface rounded-lg hover-device:hover:bg-primary/20 shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Reps */}
                    <div>
                      <label className="text-sm text-muted mb-2 block">Reps</label>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => updateCurrentSet(setIndex, 'reps', Number(e.target.value))}
                        className="input w-full text-center text-lg font-mono"
                      />
                    </div>

                    {/* RPE */}
                    <div>
                      <label className="text-sm text-muted mb-2 block">RPE (1-10)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={set.rpe || 7}
                        onChange={(e) => updateCurrentSet(setIndex, 'rpe', Number(e.target.value))}
                        className="input w-full text-center"
                      />
                    </div>

                    {/* PR Toggle */}
                    <button
                      onClick={() => updateCurrentSet(setIndex, 'isPR', !set.isPR)}
                      className={`w-full p-3 rounded-lg font-semibold transition-all ${
                        set.isPR
                          ? 'bg-warning text-background'
                          : 'bg-surface text-muted hover-device:hover:bg-neutral'
                      }`}
                    >
                      {set.isPR ? '🏆 Personal Record!' : 'Mark as PR'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={addSetToCurrentExercise}
                  className="btn-ghost w-full"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add Another Set
                </button>
                <button
                  onClick={saveExerciseToWorkout}
                  className="btn-primary w-full text-lg py-4"
                >
                  <Check className="w-6 h-6 inline mr-2" />
                  Save Exercise
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest Timer Modal */}
      <RestTimer isOpen={showRestTimer} onClose={() => setShowRestTimer(false)} />

      {/* Plate Calculator Modal */}
      <PlateCalculator isOpen={showPlateCalc} onClose={() => setShowPlateCalc(false)} />

      {/* Volume Toast */}
      <AnimatePresence>
        {showVolumeToast && (
          <VolumeToast
            volume={currentVolume}
            volumeChange={volumeChange}
            onClose={() => setShowVolumeToast(false)}
          />
        )}
      </AnimatePresence>

      {/* Session Summary Modal */}
      <AnimatePresence>
        {showSessionSummary && sessionData && (
          <WorkoutSessionSummary
            {...sessionData}
            onClose={() => {
              setShowSessionSummary(false);
              // Show achievements if any
              if (newAchievements.length > 0) {
                setShowAchievements(true);
              } else {
                router.push("/dashboard");
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {showAchievements && newAchievements.length > 0 && (
          <AchievementUnlockModal
            achievements={newAchievements}
            onClose={() => {
              setShowAchievements(false);
              setNewAchievements([]);
              router.push("/dashboard");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
