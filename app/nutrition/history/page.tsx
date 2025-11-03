"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Apple, Calendar } from "lucide-react";
import Link from "next/link";

export default function NutritionHistory() {
  const { data: session } = useSession();
  const router = useRouter();
  const [nutrition, setNutrition] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNutrition();
    }
  }, [session]);

  async function fetchNutrition() {
    try {
      const res = await fetch(`/api/nutrition?userId=${session?.user?.id}`);
      const data = await res.json();
      setNutrition(data.nutrition || []);
    } catch (error) {
      console.error("Failed to fetch nutrition:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍖</div>
          <p className="text-muted">Loading nutrition...</p>
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
          <h1 className="text-2xl font-heading font-bold">Nutrition History</h1>
          <Link href="/nutrition/log" className="btn-primary text-sm px-4 py-2">
            + New
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {nutrition.length === 0 ? (
          <div className="card text-center py-12">
            <Apple className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h2 className="text-xl font-bold mb-2">No Nutrition Logs Yet</h2>
            <p className="text-muted mb-6">Start tracking your nutrition to see it here</p>
            <Link href="/nutrition/log" className="btn-primary inline-block">
              Log First Meal
            </Link>
          </div>
        ) : (
          nutrition.map((log, idx) => (
            <motion.div
              key={log._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-surface/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-primary">{log.totalCalories}</p>
                  <p className="text-xs text-muted">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-positive">{log.totalProtein}g</p>
                  <p className="text-xs text-muted">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-warning">{log.totalCarbs}g</p>
                  <p className="text-xs text-muted">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-secondary">{log.totalFats}g</p>
                  <p className="text-xs text-muted">Fats</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-sm text-muted">Meals:</h3>
                {log.meals.map((meal: any, mealIdx: number) => (
                  <div key={mealIdx} className="bg-surface/30 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-sm font-mono text-muted">{meal.calories} kcal</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted">
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fats}g</span>
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
