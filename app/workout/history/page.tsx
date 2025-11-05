"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function WorkoutHistory() {
  const { data: session } = useSession();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkouts();
    }
  }, [session]);

  async function fetchWorkouts() {
    try {
      const res = await fetch('/api/workouts');
      const data = await res.json();
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error("Failed to fetch workouts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💪</div>
          <p className="text-muted">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Workout History</h1>
          <Link href="/workout/log" className="btn-primary text-sm px-4 py-2">
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {workouts.length === 0 ? (
          <div className="card text-center py-12">
            <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h2 className="text-xl font-bold mb-2">No Workouts Yet</h2>
            <p className="text-muted mb-6">Start logging your workouts to see them here</p>
            <Link href="/workout/log" className="btn-primary inline-block">
              Log First Workout
            </Link>
          </div>
        ) : (
          workouts.map((workout, idx) => (
            <motion.div
              key={workout._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm text-muted">
                  {workout.exercises.length} exercises
                </span>
              </div>

              <div className="space-y-3">
                {workout.exercises.map((ex: any, exIdx: number) => (
                  <div key={exIdx} className="bg-surface/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{ex.name}</h3>
                      <span className="text-xs text-muted capitalize">{ex.muscleGroup}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {ex.sets.map((set: any, setIdx: number) => (
                        <div key={setIdx} className="bg-background/50 p-2 rounded text-center">
                          <span className="font-mono">{set.reps} × {set.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
