"use client";

import { motion } from "framer-motion";
import { Dumbbell, UtensilsCrossed, Moon, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OnboardingTour from "@/components/OnboardingTour";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function LogHub() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ workouts: 0, meals: 0, recovery: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
    }
  }, [session]);

  async function fetchStats() {
    try {
      const userId = session?.user?.id;

      // Get today's date in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // Fetch today's workouts
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}`);
      if (workoutsRes.ok) {
        const data = await workoutsRes.json();
        const todayWorkouts = data.workouts.filter((w: any) => {
          const workoutDate = new Date(w.date);
          workoutDate.setHours(0, 0, 0, 0);
          return workoutDate.getTime() === today.getTime();
        });
        setStats(prev => ({ ...prev, workouts: todayWorkouts.length }));
      } else {
        console.error('Failed to fetch workouts:', workoutsRes.status, workoutsRes.statusText);
      }

      // Fetch today's nutrition
      const nutritionRes = await fetch(`/api/nutrition?userId=${userId}&date=${todayStr}`);
      if (nutritionRes.ok) {
        const data = await nutritionRes.json();
        setStats(prev => ({ ...prev, meals: data.nutrition.length }));
      } else {
        console.error('Failed to fetch nutrition:', nutritionRes.status, nutritionRes.statusText);
      }

      // Fetch today's recovery
      const recoveryRes = await fetch(`/api/recovery?userId=${userId}`);
      if (recoveryRes.ok) {
        const data = await recoveryRes.json();
        const todayRecovery = data.recovery.filter((r: any) => {
          const recoveryDate = new Date(r.date);
          recoveryDate.setHours(0, 0, 0, 0);
          return recoveryDate.getTime() === today.getTime();
        });
        setStats(prev => ({ ...prev, recovery: todayRecovery.length }));
      } else {
        console.error('Failed to fetch recovery:', recoveryRes.status, recoveryRes.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }

  if (status === "loading") {
    return <PageLoadingSkeleton />;
  }

  const logActions = [
    {
      title: "Log Workout",
      description: "Track your training session",
      icon: Dumbbell,
      href: "/workout/log",
      gradient: "from-orange-500 to-red-500",
      glowColor: "orange",
      logged: stats.workouts > 0,
      count: stats.workouts,
      dataTour: "log-workout",
    },
    {
      title: "Log Nutrition",
      description: "Add meals, calories & macros",
      icon: UtensilsCrossed,
      href: "/nutrition/log",
      gradient: "from-green-500 to-emerald-500",
      glowColor: "green",
      logged: stats.meals > 0,
      count: stats.meals,
      dataTour: "log-nutrition",
    },
    {
      title: "Log Recovery",
      description: "Track sleep, soreness & readiness",
      icon: Moon,
      href: "/recovery/log",
      gradient: "from-blue-500 to-purple-500",
      glowColor: "blue",
      logged: stats.recovery > 0,
      count: stats.recovery,
      dataTour: "log-recovery",
    },
  ];

  return (
    <div className="min-h-screen pb-24 pt-8 px-4">
      <OnboardingTour page="log" />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Action Zone</span>
        </div>
        <h1 className="text-4xl font-heading font-bold mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
          What would you like to log?
        </h1>
        <p className="text-muted">
          Track your progress across fitness, nutrition, and recovery
        </p>
      </motion.div>

      {/* Log Action Cards */}
      <div className="max-w-2xl mx-auto space-y-4">
        {logActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Link key={action.href} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, translateY: -4 }}
                whileTap={{ scale: 0.98 }}
                data-tour={action.dataTour}
                className={`card relative overflow-hidden group cursor-pointer`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-20 blur-xl -z-10`}
                  animate={{
                    opacity: action.logged ? [0.1, 0.2, 0.1] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <div className="relative flex items-center gap-6 p-6">
                  {/* Icon */}
                  <motion.div
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-heading font-bold">
                        {action.title}
                      </h3>
                      {action.logged && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40"
                        >
                          <span className="text-xs font-bold text-primary">
                            {action.count} today
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-muted">{action.description}</p>
                  </div>

                  {/* Arrow */}
                  <motion.div
                    className="flex-shrink-0"
                    animate={{
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <TrendingUp className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
                  </motion.div>
                </div>

                {/* Hint Text */}
                <div className="absolute bottom-2 right-4">
                  <p className="text-xs text-muted/60 italic">Tap to log your {action.title.toLowerCase().replace('log ', '')}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-2xl mx-auto mt-8 p-6 card text-center"
      >
        <h3 className="text-sm font-medium text-muted mb-3">Today's Progress</h3>
        <div className="flex justify-around">
          <div>
            <p className="text-2xl font-bold font-mono text-primary">{stats.workouts}</p>
            <p className="text-xs text-muted">Workouts</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold font-mono text-green-500">{stats.meals}</p>
            <p className="text-xs text-muted">Meals</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold font-mono text-blue-500">{stats.recovery}</p>
            <p className="text-xs text-muted">Recovery</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
