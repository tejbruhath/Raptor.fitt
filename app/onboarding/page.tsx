"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

export default function Onboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    // Screen 1: Body Blueprint
    bodyweight: 70,
    height: 170,
    age: 25,
    gender: "male" as "male" | "female" | "other",
    
    // Screen 2: Training Habits
    trainingAge: 0,
    weeklyWorkouts: 3,
    preferredSplit: "ppl" as "ppl" | "upper_lower" | "full_body" | "bro_split",
    
    // Screen 3: Nutrition & Sleep
    avgCalories: 2500,
    avgProtein: 150,
    avgSleep: 7,
    
    // Screen 4: Body Behavior
    recoveryType: "moderate" as "fast" | "moderate" | "slow",
    injuryHistory: false,
    
    // Screen 5: Goals & Priorities
    goal: "strength" as "muscle_gain" | "fat_loss" | "strength" | "endurance",
    targetBodyweight: 75,
    
    // Screen 6: Calibration (optional)
    benchPress1RM: 0,
    squat1RM: 0,
    deadlift1RM: 0,
  });

  // Load existing user data if editing profile
  useEffect(() => {
    async function loadUserData() {
      if (!session?.user?.id) return;
      
      try {
        const res = await fetch(`/api/user?userId=${session.user.id}`);
        const { user } = await res.json();
        
        if (user) {
          setData({
            bodyweight: user.bodyweight?.[user.bodyweight.length - 1] || 70,
            height: user.height || 170,
            age: user.age || 25,
            gender: user.gender || "male",
            trainingAge: user.trainingAge || 0,
            weeklyWorkouts: 3,
            preferredSplit: "ppl",
            avgCalories: 2500,
            avgProtein: 150,
            avgSleep: 7,
            recoveryType: user.recoveryType || "moderate",
            injuryHistory: false,
            goal: user.goal || "strength",
            targetBodyweight: user.bodyweight?.[user.bodyweight.length - 1] + 5 || 75,
            benchPress1RM: 0,
            squat1RM: 0,
            deadlift1RM: 0,
          });
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [session]);

  const screens = [
    {
      title: "Welcome to Raptor Fitness",
      subtitle: "Let's set up your personalized training experience",
      emoji: "🦖",
    },
    {
      title: "Body Blueprint",
      subtitle: "Tell us about your physical stats",
      fields: ["bodyweight", "height", "age", "gender"],
    },
    {
      title: "Training Habits",
      subtitle: "Your current training experience",
      fields: ["trainingAge", "weeklyWorkouts", "preferredSplit"],
    },
    {
      title: "Nutrition & Sleep",
      subtitle: "Fuel and recovery baselines",
      fields: ["avgCalories", "avgProtein", "avgSleep"],
    },
    {
      title: "Body Behavior",
      subtitle: "How your body responds to training",
      fields: ["recoveryType", "injuryHistory"],
    },
    {
      title: "Goals & Priorities",
      subtitle: "What are you working toward?",
      fields: ["goal", "targetBodyweight"],
    },
    {
      title: "System Calibration",
      subtitle: "Optional: Enter your current 1RM lifts",
      fields: ["benchPress1RM", "squat1RM", "deadlift1RM"],
    },
  ];

  function updateData(field: string, value: any) {
    setData({ ...data, [field]: value });
  }

  async function handleComplete() {
    if (!session?.user?.id) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          ...data,
        }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Failed to save onboarding data");
      }
    } catch (error) {
      console.error("Onboarding save error:", error);
      alert("Error saving onboarding data");
    } finally {
      setSaving(false);
    }
  }

  const currentScreen = screens[step];
  const isLast = step === screens.length - 1;

  return (
    <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted">
              Step {step + 1} of {screens.length}
            </p>
            <p className="text-sm text-primary font-mono">
              {Math.round(((step + 1) / screens.length) * 100)}%
            </p>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / screens.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                {currentScreen.emoji && (
                  <div className="text-6xl mb-4">{currentScreen.emoji}</div>
                )}
                <h1 className="text-3xl font-heading font-bold mb-2">
                  {currentScreen.title}
                </h1>
                <p className="text-muted">{currentScreen.subtitle}</p>
              </div>

              {/* Fields */}
              <div className="space-y-6">
                {step === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg mb-4">
                      We'll ask you a few questions to personalize your experience.
                    </p>
                    <p className="text-muted">This takes about 2 minutes.</p>
                  </div>
                ) : (
                  <>
                    {currentScreen.fields?.includes("bodyweight") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Bodyweight (kg)
                        </label>
                        <input
                          type="number"
                          value={data.bodyweight}
                          onChange={(e) => updateData("bodyweight", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("height") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Height (cm)
                        </label>
                        <input
                          type="number"
                          value={data.height}
                          onChange={(e) => updateData("height", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("age") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">Age</label>
                        <input
                          type="number"
                          value={data.age}
                          onChange={(e) => updateData("age", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("gender") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">Gender</label>
                        <select
                          value={data.gender}
                          onChange={(e) => updateData("gender", e.target.value)}
                          className="input w-full"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}

                    {currentScreen.fields?.includes("trainingAge") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Training Age (years)
                        </label>
                        <input
                          type="number"
                          value={data.trainingAge}
                          onChange={(e) => updateData("trainingAge", Number(e.target.value))}
                          className="input w-full"
                          step="0.5"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("weeklyWorkouts") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Workouts per week
                        </label>
                        <input
                          type="number"
                          value={data.weeklyWorkouts}
                          onChange={(e) => updateData("weeklyWorkouts", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("preferredSplit") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Preferred Split
                        </label>
                        <select
                          value={data.preferredSplit}
                          onChange={(e) => updateData("preferredSplit", e.target.value)}
                          className="input w-full"
                        >
                          <option value="ppl">Push/Pull/Legs</option>
                          <option value="upper_lower">Upper/Lower</option>
                          <option value="full_body">Full Body</option>
                          <option value="bro_split">Bro Split</option>
                        </select>
                      </div>
                    )}

                    {currentScreen.fields?.includes("avgCalories") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Average Daily Calories
                        </label>
                        <input
                          type="number"
                          value={data.avgCalories}
                          onChange={(e) => updateData("avgCalories", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("avgProtein") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Average Daily Protein (g)
                        </label>
                        <input
                          type="number"
                          value={data.avgProtein}
                          onChange={(e) => updateData("avgProtein", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("avgSleep") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Average Sleep (hours)
                        </label>
                        <input
                          type="number"
                          value={data.avgSleep}
                          onChange={(e) => updateData("avgSleep", Number(e.target.value))}
                          className="input w-full"
                          step="0.5"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("recoveryType") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Recovery Speed
                        </label>
                        <select
                          value={data.recoveryType}
                          onChange={(e) => updateData("recoveryType", e.target.value)}
                          className="input w-full"
                        >
                          <option value="fast">Fast (ready next day)</option>
                          <option value="moderate">Moderate (2-3 days)</option>
                          <option value="slow">Slow (3+ days)</option>
                        </select>
                      </div>
                    )}

                    {currentScreen.fields?.includes("injuryHistory") && (
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.injuryHistory}
                            onChange={(e) => updateData("injuryHistory", e.target.checked)}
                            className="w-5 h-5 accent-primary"
                          />
                          <span className="text-sm">I have a history of injuries</span>
                        </label>
                      </div>
                    )}

                    {currentScreen.fields?.includes("goal") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Primary Goal
                        </label>
                        <select
                          value={data.goal}
                          onChange={(e) => updateData("goal", e.target.value)}
                          className="input w-full"
                        >
                          <option value="muscle_gain">Muscle Gain</option>
                          <option value="fat_loss">Fat Loss</option>
                          <option value="strength">Strength</option>
                          <option value="endurance">Endurance</option>
                        </select>
                      </div>
                    )}

                    {currentScreen.fields?.includes("targetBodyweight") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Target Bodyweight (kg)
                        </label>
                        <input
                          type="number"
                          value={data.targetBodyweight}
                          onChange={(e) => updateData("targetBodyweight", Number(e.target.value))}
                          className="input w-full"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("benchPress1RM") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Bench Press 1RM (kg) - Optional
                        </label>
                        <input
                          type="number"
                          value={data.benchPress1RM}
                          onChange={(e) => updateData("benchPress1RM", Number(e.target.value))}
                          className="input w-full"
                          placeholder="0"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("squat1RM") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Squat 1RM (kg) - Optional
                        </label>
                        <input
                          type="number"
                          value={data.squat1RM}
                          onChange={(e) => updateData("squat1RM", Number(e.target.value))}
                          className="input w-full"
                          placeholder="0"
                        />
                      </div>
                    )}

                    {currentScreen.fields?.includes("deadlift1RM") && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Deadlift 1RM (kg) - Optional
                        </label>
                        <input
                          type="number"
                          value={data.deadlift1RM}
                          onChange={(e) => updateData("deadlift1RM", Number(e.target.value))}
                          className="input w-full"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-ghost flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {isLast ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : "Complete"}
              </button>
            ) : (
              <button
                onClick={() => setStep(Math.min(screens.length - 1, step + 1))}
                className="btn-primary flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
