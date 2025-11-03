"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function PRHistory() {
  const { data: session } = useSession();
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPRs();
    }
  }, [session]);

  async function fetchPRs() {
    try {
      const res = await fetch(`/api/achievements?userId=${session?.user?.id}`);
      const data = await res.json();
      const prList = data.achievements.filter((a: any) => a.isPR);
      setPrs(prList);
    } catch (error) {
      console.error("Failed to fetch PRs:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-muted">Loading PRs...</p>
        </div>
      </div>
    );
  }

  // Group PRs by exercise
  const prsByExercise = prs.reduce((acc: any, pr: any) => {
    const name = pr.exerciseName;
    if (!acc[name]) acc[name] = [];
    acc[name].push(pr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Personal Records</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {prs.length === 0 ? (
          <div className="card text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h2 className="text-xl font-bold mb-2">No PRs Yet</h2>
            <p className="text-muted mb-6">Mark your first PR during a workout!</p>
            <Link href="/workout/log" className="btn-primary inline-block">
              Log Workout
            </Link>
          </div>
        ) : (
          Object.entries(prsByExercise).map(([exercise, exercisePRs]: [string, any], idx) => {
            const sorted = exercisePRs.sort((a: any, b: any) => 
              new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
            );
            const latest = sorted[0];

            return (
              <motion.div
                key={exercise}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold">{exercise}</h3>
                    <p className="text-sm text-muted capitalize">{latest.muscleGroup}</p>
                  </div>
                  <Trophy className="w-6 h-6 text-warning" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg mb-4">
                  <p className="text-xs text-muted mb-1">Current PR</p>
                  <p className="text-3xl font-bold font-mono text-primary">
                    {latest.weight}kg × {latest.reps}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(latest.unlockedAt).toLocaleDateString()}
                  </p>
                </div>

                {sorted.length > 1 && (
                  <div>
                    <p className="text-xs text-muted uppercase mb-2 flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" />
                      History ({sorted.length} PRs)
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {sorted.slice(1).map((pr: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-surface/30 p-2 rounded">
                          <span className="text-sm font-mono">{pr.weight}kg × {pr.reps}</span>
                          <span className="text-xs text-muted">
                            {new Date(pr.unlockedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
}
