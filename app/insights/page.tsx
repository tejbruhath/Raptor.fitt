"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle, TrendingUp, Moon, Activity } from "lucide-react";
import Link from "next/link";

export default function Insights() {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [exerciseRecs, setExerciseRecs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecommendations();
    }
  }, [session]);

  async function fetchRecommendations() {
    try {
      const res = await fetch('/api/recommendations');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setExerciseRecs(data.exerciseRecommendations || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <p className="text-muted">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-negative border-negative/30";
      case "medium": return "text-warning border-warning/30";
      case "low": return "text-primary border-primary/30";
      default: return "text-muted border-muted/30";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "deload": return <AlertTriangle className="w-5 h-5" />;
      case "recovery": return <Moon className="w-5 h-5" />;
      case "volume": return <TrendingUp className="w-5 h-5" />;
      case "consistency": return <Activity className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-primary hover:text-primary-light mb-2 block">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">AI Insights & Recommendations</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* General Recommendations */}
        <section>
          <h2 className="text-xl font-heading font-bold mb-4">General Recommendations</h2>
          {recommendations.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-muted">Great job! No critical recommendations at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card border-2 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={getPriorityColor(rec.priority)}>
                      {getIcon(rec.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{rec.title}</h3>
                      <p className="text-sm text-muted mb-2">{rec.description}</p>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {rec.action}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Exercise-Specific Recommendations */}
        {exerciseRecs.length > 0 && (
          <section>
            <h2 className="text-xl font-heading font-bold mb-4">Progressive Overload Recommendations</h2>
            <div className="space-y-3">
              {exerciseRecs.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{rec.exercise}</h3>
                      <p className="text-xs text-muted capitalize">{rec.muscleGroup}</p>
                    </div>
                    <Link 
                      href={`/exercises/${encodeURIComponent(rec.exercise)}`}
                      className="text-xs text-primary hover:underline"
                    >
                      View History →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-surface/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted">Last Session</p>
                      <p className="font-mono text-sm">{rec.lastWeight}kg × {rec.lastReps}</p>
                      <p className="text-xs text-muted">RPE: {rec.lastRPE}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">Recommended</p>
                      <p className="font-mono text-sm text-primary">{rec.suggestedWeight}kg × {rec.suggestedReps}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted">{rec.recommendation}</p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Stats Summary */}
        {stats && (
          <section className="card bg-gradient-to-br from-surface to-neutral">
            <h2 className="text-xl font-heading font-bold mb-4">Your Stats (Last 30 Days)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted uppercase">Workouts</p>
                <p className="text-2xl font-bold font-mono text-primary">{stats.workoutsThisMonth}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Avg Sleep</p>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {stats.avgSleep ? Math.round(stats.avgSleep * 10) / 10 : 0}h
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase">Avg Soreness</p>
                <p className="text-2xl font-bold font-mono text-warning">
                  {stats.avgSoreness ? Math.round(stats.avgSoreness * 10) / 10 : 0}/10
                </p>
              </div>
            </div>
            
            {stats.needsDeload && (
              <div className="mt-4 p-3 bg-negative/10 border border-negative/30 rounded-lg">
                <p className="text-sm font-bold text-negative">⚠️ Deload Week Recommended</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
