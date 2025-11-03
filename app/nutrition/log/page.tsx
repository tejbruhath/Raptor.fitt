"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export default function LogNutrition() {
  const { data: session } = useSession();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentMeal, setCurrentMeal] = useState<Meal>({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-load last nutrition log when page opens
  useEffect(() => {
    if (session?.user?.id) {
      loadLastNutrition();
    }
  }, [session]);

  async function loadLastNutrition() {
    try {
      const res = await fetch(`/api/nutrition?userId=${session?.user?.id}`);
      const data = await res.json();
      if (data.nutrition && data.nutrition.length > 0) {
        // Get the most recent nutrition log
        const lastLog = data.nutrition[data.nutrition.length - 1];
        setMeals(lastLog.meals || []);
      }
    } catch (error) {
      console.error("Failed to load last nutrition:", error);
    } finally {
      setLoading(false);
    }
  }

  const addMeal = () => {
    if (currentMeal.name && currentMeal.calories > 0) {
      setMeals([...meals, currentMeal]);
      setCurrentMeal({ name: "", calories: 0, protein: 0, carbs: 0, fats: 0 });
    }
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const saveNutrition = async () => {
    if (!session?.user?.id) {
      alert("Please sign in to save nutrition");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          date: new Date().toISOString(),
          meals,
          totals,
        }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to save nutrition");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving nutrition");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Track Nutrition</h1>
          <button
            onClick={saveNutrition}
            className="btn-primary text-sm px-4 py-2"
            disabled={meals.length === 0 || saving}
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Macro Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-surface to-neutral"
        >
          <h2 className="text-xl font-heading font-bold mb-6 text-center">
            Today's Totals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label="Calories" value={totals.calories} unit="kcal" color="primary" />
            <MacroCard label="Protein" value={totals.protein} unit="g" color="positive" />
            <MacroCard label="Carbs" value={totals.carbs} unit="g" color="warning" />
            <MacroCard label="Fats" value={totals.fats} unit="g" color="secondary" />
          </div>
        </motion.div>

        {/* Add Meal Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">Add Meal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Meal name..."
              value={currentMeal.name}
              onChange={(e) =>
                setCurrentMeal({ ...currentMeal, name: e.target.value })
              }
              className="input md:col-span-2"
            />
            <input
              type="number"
              placeholder="Calories"
              value={currentMeal.calories || ""}
              onChange={(e) =>
                setCurrentMeal({
                  ...currentMeal,
                  calories: Number(e.target.value),
                })
              }
              className="input"
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={currentMeal.protein || ""}
              onChange={(e) =>
                setCurrentMeal({
                  ...currentMeal,
                  protein: Number(e.target.value),
                })
              }
              className="input"
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={currentMeal.carbs || ""}
              onChange={(e) =>
                setCurrentMeal({ ...currentMeal, carbs: Number(e.target.value) })
              }
              className="input"
            />
            <input
              type="number"
              placeholder="Fats (g)"
              value={currentMeal.fats || ""}
              onChange={(e) =>
                setCurrentMeal({ ...currentMeal, fats: Number(e.target.value) })
              }
              className="input"
            />
          </div>
          <button onClick={addMeal} className="btn-primary w-full">
            <Plus className="w-5 h-5 inline mr-2" />
            Add Meal
          </button>
        </motion.div>

        {/* Meals List */}
        {meals.map((meal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-bold">{meal.name}</h3>
              <button
                onClick={() => removeMeal(index)}
                className="text-negative hover:text-accent transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-mono text-primary">
                  {meal.calories}
                </p>
                <p className="text-xs text-muted">kcal</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-positive">
                  {meal.protein}g
                </p>
                <p className="text-xs text-muted">protein</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-warning">
                  {meal.carbs}g
                </p>
                <p className="text-xs text-muted">carbs</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-secondary">
                  {meal.fats}g
                </p>
                <p className="text-xs text-muted">fats</p>
              </div>
            </div>
          </motion.div>
        ))}

        {meals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted text-lg">No meals logged yet</p>
            <p className="text-muted text-sm mt-2">
              Start adding meals to track your nutrition
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function MacroCard({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  const colorClasses = {
    primary: "text-primary border-primary/30",
    positive: "text-positive border-positive/30",
    warning: "text-warning border-warning/30",
    secondary: "text-secondary border-secondary/30",
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <p className="text-xs text-muted uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold font-mono ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]}`}>
        {value}
      </p>
      <p className="text-xs text-muted mt-1">{unit}</p>
    </div>
  );
}
