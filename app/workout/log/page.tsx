"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

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

export default function LogWorkout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    muscleGroup: "chest",
  });
  const [saving, setSaving] = useState(false);
  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

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
    }
  }, [session]);

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

  const muscleGroups = [
    "chest",
    "back",
    "legs",
    "shoulders",
    "arms",
    "core",
  ];

  const addExercise = () => {
    if (currentExercise.name) {
      setExercises([
        ...exercises,
        {
          ...currentExercise,
          sets: [{ reps: 0, weight: 0, rpe: 7 }],
        },
      ]);
      setCurrentExercise({ name: "", muscleGroup: "chest" });
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
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          date: new Date().toISOString(),
          exercises,
        }),
      });

      if (response.ok) {
        // Save PRs to achievements collection
        const prs: any[] = [];
        exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            if (set.isPR) {
              prs.push({
                userId: session.user.id,
                exerciseName: exercise.name,
                muscleGroup: exercise.muscleGroup,
                weight: set.weight,
                reps: set.reps,
              });
            }
          });
        });

        if (prs.length > 0) {
          await fetch("/api/achievements/pr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prs }),
          });
        }

        // Trigger SI recalculation
        try {
          await fetch('/api/strength-index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: session.user.id }),
          });
        } catch (e) {
          console.warn('SI recalculation failed or not applicable');
        }

        router.push("/dashboard");
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
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Log Workout</h1>
          <button
            onClick={saveWorkout}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
            disabled={exercises.length === 0 || saving}
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Load last workout helper */}
        {session?.user?.id && (
          <div className="flex justify-end">
            <button
              onClick={loadLastWorkout}
              disabled={loadingLastWorkout}
              className="btn-ghost text-sm"
            >
              {loadingLastWorkout ? "Loading previous workout..." : "Load last workout"}
            </button>
          </div>
        )}

        {/* Add Exercise Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">Add Exercise</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Exercise name..."
              value={currentExercise.name}
              onChange={(e) =>
                setCurrentExercise({ ...currentExercise, name: e.target.value })
              }
              className="input md:col-span-2"
            />
            <select
              value={currentExercise.muscleGroup}
              onChange={(e) =>
                setCurrentExercise({
                  ...currentExercise,
                  muscleGroup: e.target.value,
                })
              }
              className="input"
            >
              {muscleGroups.map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <button onClick={addExercise} className="btn-primary mt-4 w-full">
            <Plus className="w-5 h-5 inline mr-2" />
            Add Exercise
          </button>
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
                className="text-negative hover:text-accent transition-colors"
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
                        : "bg-surface text-muted hover:bg-neutral"
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
            className="text-center py-12"
          >
            <p className="text-muted text-lg">No exercises added yet</p>
            <p className="text-muted text-sm mt-2">
              Start adding exercises to log your workout
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
                  <button className="text-negative hover:text-accent" onClick={() => deleteWorkout(w._id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
