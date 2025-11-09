"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, Droplet, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import DatePicker from "@/components/DatePicker";
import SmartNutritionLogger from "@/components/SmartNutritionLogger";
import AchievementUnlockModal from "@/components/AchievementUnlockModal";
import RecentFoodChips from "@/components/RecentFoodChips";
import { useOfflineQueue } from "@/lib/hooks/useOfflineQueue";
import { fetchRecentFoods } from "@/lib/utils/dataFetching";
import { useToastContext } from "@/components/ToastProvider";

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  type?: 'smart' | 'manual';
  foodName?: string;
  quantity?: number;
  unit?: string;
  mealType?: string;
}

export default function LogNutrition() {
  const { data: session } = useSession();
  const router = useRouter();
  const { isOnline, addToQueue } = useOfflineQueue();
  const { success, error: showError } = useToastContext();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showSmartLogger, setShowSmartLogger] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);
  const [recentFoods, setRecentFoods] = useState<any[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  // Load data on mount
  useEffect(() => {
    if (session?.user?.id) {
      loadTodayNutrition();
      loadRecentFoods();
      loadAutoSavedData();
    }
  }, [session]);

  // Update today's totals when date changes
  useEffect(() => {
    if (session?.user?.id && !initialLoadRef.current) {
      loadTodayNutrition();
    }
  }, [date]);

  // Auto-save with debounce
  useEffect(() => {
    if (!initialLoadRef.current && meals.length > 0) {
      setHasUnsavedChanges(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        autoSaveToLocalStorage();
      }, 2000);
    }
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
    }
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [meals]);

  // Warn on page leave if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && meals.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, meals]);

  // Show toast on route change if unsaved
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasUnsavedChanges && meals.length > 0) {
        showError('You have unsaved logs. Please save your changes!', 5000);
      }
    };
    return () => {
      if (hasUnsavedChanges && meals.length > 0) {
        handleRouteChange();
      }
    };
  }, [hasUnsavedChanges, meals]);

  async function loadRecentFoods() {
    try {
      const foods = await fetchRecentFoods(session?.user?.id || '');
      setRecentFoods(foods.map(f => ({ name: f })));
      // TODO: Load favorites from user preferences
    } catch (error) {
      console.error('Failed to load recent foods:', error);
    }
  }

  function loadAutoSavedData() {
    try {
      const saved = localStorage.getItem(`nutrition_draft_${session?.user?.id}`);
      if (saved) {
        const { meals: savedMeals, date: savedDate } = JSON.parse(saved);
        if (savedDate === date) {
          setMeals(savedMeals);
          setHasUnsavedChanges(true);
        }
      }
    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    } finally {
      setLoading(false);
    }
  }

  function autoSaveToLocalStorage() {
    try {
      localStorage.setItem(`nutrition_draft_${session?.user?.id}`, JSON.stringify({ meals, date }));
    } catch (error) {
      console.error('Failed to auto-save:', error);
    }
  }

  async function loadTodayNutrition() {
    if (!session?.user?.id) return;

    try {
      const params = new URLSearchParams({
        userId: session.user.id,
        date,
      });

      const res = await fetch(`/api/nutrition?${params.toString()}`, {
        cache: 'no-store',
      });

      const data = await res.json();

      if (data?.nutrition && data.nutrition.length > 0) {
        const aggregated = data.nutrition.reduce(
          (acc: typeof todayTotals, entry: any) => {
            const totalsFromEntry = {
              calories: entry.totalCalories ?? 0,
              protein: entry.totalProtein ?? 0,
              carbs: entry.totalCarbs ?? 0,
              fats: entry.totalFats ?? 0,
            };

            // Fallback: derive totals from meals if totals are missing
            if (
              totalsFromEntry.calories === 0 &&
              totalsFromEntry.protein === 0 &&
              totalsFromEntry.carbs === 0 &&
              totalsFromEntry.fats === 0 &&
              Array.isArray(entry.meals)
            ) {
              totalsFromEntry.calories = entry.meals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0);
              totalsFromEntry.protein = entry.meals.reduce((sum: number, meal: any) => sum + (meal.protein || 0), 0);
              totalsFromEntry.carbs = entry.meals.reduce((sum: number, meal: any) => sum + (meal.carbs || 0), 0);
              totalsFromEntry.fats = entry.meals.reduce((sum: number, meal: any) => sum + (meal.fats || 0), 0);
            }

            return {
              calories: acc.calories + totalsFromEntry.calories,
              protein: acc.protein + totalsFromEntry.protein,
              carbs: acc.carbs + totalsFromEntry.carbs,
              fats: acc.fats + totalsFromEntry.fats,
            };
          },
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        setTodayTotals({
          calories: Math.round(aggregated.calories),
          protein: parseFloat(aggregated.protein.toFixed(1)),
          carbs: parseFloat(aggregated.carbs.toFixed(1)),
          fats: parseFloat(aggregated.fats.toFixed(1)),
        });
      } else {
        setTodayTotals({ calories: 0, protein: 0, carbs: 0, fats: 0 });
      }
    } catch (error) {
      console.error("Failed to load today's nutrition:", error);
      setTodayTotals({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    } finally {
      setLoading(false);
    }
  }

  const handleSmartLog = (data: any) => {
    const newMeal: Meal = {
      name: data.foodName || data.mealType || 'Meal',
      calories: data.macros.calories,
      protein: data.macros.protein,
      carbs: data.macros.carbs,
      fats: data.macros.fats,
      type: data.type,
      foodName: data.foodName,
      quantity: data.quantity,
      unit: data.unit,
      mealType: data.mealType,
    };
    setMeals([...meals, newMeal]);
    setShowSmartLogger(false);
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
      showError("Please sign in to save nutrition");
      return;
    }

    setSaving(true);
    try {
      const nutritionData = {
        userId: session.user.id,
        date: new Date(date).toISOString(),
        meals,
      };

      if (!isOnline) {
        addToQueue('nutrition', nutritionData);
        success('Saved offline. Will sync when online.');
        localStorage.removeItem(`nutrition_draft_${session.user.id}`);
        setMeals([]);
        setHasUnsavedChanges(false);
        router.push("/dashboard");
        return;
      }

      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nutritionData),
      });

      if (response.ok) {
        // Clear local storage and state
        localStorage.removeItem(`nutrition_draft_${session.user.id}`);
        setMeals([]);
        setHasUnsavedChanges(false);
        
        // Show success toast
        success('Nutrition logged successfully! ✓', 2000);
        
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
            setShowAchievements(true);
            return;
          }
        } catch (e) {
          console.warn('Achievement check failed');
        }

        // Reload today's totals and redirect
        await loadTodayNutrition();
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        showError("Failed to save nutrition");
      }
    } catch (error) {
      console.error("Save error:", error);
      showError("Error saving nutrition");
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
        {/* Date Picker and Smart Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4"
        >
          <div className="card">
            <DatePicker 
              value={date} 
              onChange={setDate} 
              label="Log Date"
            />
          </div>
          <div className="card">
            <button 
              onClick={() => setShowSmartLogger(true)} 
              className="btn-primary w-full h-full flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Add Food (Smart)
            </button>
            <p className="text-xs text-muted text-center mt-3">
              💡 Try: "chicken 200g" or "eggs 3" for instant macros
            </p>
          </div>
        </motion.div>

        {/* Today's Totals - Saved Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-surface to-neutral"
        >
          <h2 className="text-xl font-heading font-bold mb-6 text-center">
            Today's Totals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label="Calories" value={todayTotals.calories} unit="kcal" color="primary" />
            <MacroCard label="Protein" value={todayTotals.protein} unit="g" color="positive" />
            <MacroCard label="Carbs" value={todayTotals.carbs} unit="g" color="warning" />
            <MacroCard label="Fats" value={todayTotals.fats} unit="g" color="secondary" />
          </div>
        </motion.div>

        {/* Recent Foods */}
        {(recentFoods.length > 0 || favoriteFoods.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <RecentFoodChips
              recentFoods={recentFoods}
              favoriteFoods={favoriteFoods}
              onSelect={(food) => {
                // Pre-fill smart logger with food name
                setShowSmartLogger(true);
                // Note: SmartNutritionLogger would need to accept initial value
              }}
            />
          </motion.div>
        )}


        {/* Smart Nutrition Logger Modal */}
        <AnimatePresence>
          {showSmartLogger && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <SmartNutritionLogger
                onSave={handleSmartLog}
                onCancel={() => setShowSmartLogger(false)}
              />
            </div>
          )}
        </AnimatePresence>

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
