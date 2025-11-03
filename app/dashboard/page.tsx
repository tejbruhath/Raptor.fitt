"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Apple, Moon, Plus, Zap, User } from "lucide-react";
import Link from "next/link";
import StrengthIndexRing from "@/components/StrengthIndexRing";
import QuickStats from "@/components/QuickStats";
import TodaysSummary from "@/components/TodaysSummary";
import AICoach from "@/components/AICoach";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [strengthIndex, setStrengthIndex] = useState({
    value: 0,
    change: 0,
    trend: "stable" as "up" | "down" | "stable",
  });
  const [stats, setStats] = useState({
    workouts: 0,
    weeklyVolume: 0,
    avgCalories: 0,
    avgSleep: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  async function fetchDashboardData() {
    try {
      const userId = session?.user?.id;

      // Fetch workouts
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}`);
      const { workouts } = await workoutsRes.json();

      // Fetch nutrition
      const nutritionRes = await fetch(`/api/nutrition?userId=${userId}`);
      const { nutrition } = await nutritionRes.json();

      // Fetch recovery
      const recoveryRes = await fetch(`/api/recovery?userId=${userId}`);
      const { recovery } = await recoveryRes.json();

      // Fetch strength index
      const siRes = await fetch(`/api/strength-index?userId=${userId}`);
      const { strengthIndex: siData } = await siRes.json();
      const latestSI = siData[siData.length - 1];

      // Calculate stats
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const recentWorkouts = workouts.filter(
        (w: any) => new Date(w.date) >= last7Days
      );

      const weeklyVolume = recentWorkouts.reduce((sum: number, w: any) => {
        return (
          sum +
          w.exercises.reduce((exSum: number, ex: any) => {
            return (
              exSum +
              ex.sets.reduce((setSum: number, set: any) => {
                return setSum + set.reps * set.weight;
              }, 0)
            );
          }, 0)
        );
      }, 0);

      const recentNutrition = nutrition.filter(
        (n: any) => new Date(n.date) >= last7Days
      );
      const avgCalories =
        recentNutrition.length > 0
          ? recentNutrition.reduce((sum: number, n: any) => {
              return (
                sum +
                n.meals.reduce((mSum: number, m: any) => mSum + m.calories, 0)
              );
            }, 0) / recentNutrition.length
          : 0;

      const recentRecovery = recovery.filter(
        (r: any) => new Date(r.date) >= last7Days
      );
      const avgSleep =
        recentRecovery.length > 0
          ? recentRecovery.reduce(
              (sum: number, r: any) => sum + r.sleepHours,
              0
            ) / recentRecovery.length
          : 0;

      // Calculate streak
      const sortedWorkouts = [...workouts].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor(
          (checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= currentStreak + 1) {
          currentStreak++;
          checkDate = workoutDate;
        } else {
          break;
        }
      }

      // Use the latestSI already declared above
      const previousSI = siData[siData.length - 2];

      setStreak(currentStreak);
      setStrengthIndex({
        value: latestSI?.totalSI || 0,
        change: latestSI?.totalSI - (previousSI?.totalSI || 0) || 0,
        trend:
          latestSI?.totalSI - previousSI?.totalSI > 0
            ? "up"
            : latestSI?.totalSI - previousSI?.totalSI < 0
            ? "down"
            : "stable",
      });
      setStats({
        workouts: workouts.length,
        weeklyVolume: Math.round(weeklyVolume),
        avgCalories: Math.round(avgCalories),
        avgSleep: Math.round(avgSleep * 10) / 10,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦖</div>
          <p className="text-muted">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-32">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/raptor-logo.svg" alt="Raptor.Fitt" className="h-12 w-auto" style={{ maxWidth: '200px' }} />
          </div>
          
          {/* Streak & AI Coach */}
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2 bg-surface/80 px-4 py-2 rounded-full border border-primary/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-lg font-bold font-mono text-primary">{streak}</p>
                <p className="text-xs text-muted">day streak</p>
              </div>
            </motion.div>
            <AICoach />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Strength Index Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated text-center py-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            {/* SI Ring */}
            <StrengthIndexRing
              value={strengthIndex.value}
              change={strengthIndex.change}
              trend={strengthIndex.trend}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <QuickStats
                icon={<Activity className="w-6 h-6" />}
                label="Workouts"
                value="23"
                subtext="this month"
                color="primary"
              />
              <QuickStats
                icon={<Apple className="w-6 h-6" />}
                label="Nutrition"
                value="92%"
                subtext="on target"
                color="positive"
              />
              <QuickStats
                icon={<Moon className="w-6 h-6" />}
                label="Recovery"
                value="8.2h"
                subtext="avg sleep"
                color="secondary"
              />
              <QuickStats
                icon={<Zap className="w-6 h-6" />}
                label="Readiness"
                value="87%"
                subtext="train hard"
                color="warning"
              />
            </div>
          </div>

          {/* AI Insight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-primary font-semibold mb-1">
                💡 Today's Insight
              </p>
              <p className="text-muted">
                Your bench volume is up 12% this week. Keep protein above 160g to
                maintain growth rate.
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Today's Summary */}
        <TodaysSummary />

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <ActionCard
            href="/workout/log"
            icon={<Activity className="w-8 h-8" />}
            title="Log Workout"
            gradient="from-primary to-primary-light"
          />
          <ActionCard
            href="/nutrition/log"
            icon={<Apple className="w-8 h-8" />}
            title="Track Food"
            gradient="from-positive to-primary"
          />
          <ActionCard
            href="/recovery/log"
            icon={<Moon className="w-8 h-8" />}
            title="Log Recovery"
            gradient="from-secondary to-accent"
          />
          <ActionCard
            href="/analytics"
            icon={<TrendingUp className="w-8 h-8" />}
            title="Analytics"
            gradient="from-accent to-warning"
          />
        </motion.section>

        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <ActivityItem
              type="workout"
              title="Push Day - Upper Body"
              time="2 hours ago"
              metrics="12 exercises • 45 min • 8,240 kg volume"
            />
            <ActivityItem
              type="nutrition"
              title="Nutrition Log"
              time="5 hours ago"
              metrics="2,340 cal • 165g protein • 245g carbs"
            />
            <ActivityItem
              type="recovery"
              title="Recovery Log"
              time="Yesterday"
              metrics="7.5h sleep • Quality: 8/10 • Low soreness"
            />
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="card-elevated text-center cursor-pointer group"
      >
        <div
          className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-background group-hover:shadow-glow transition-all`}
        >
          {icon}
        </div>
        <h3 className="font-heading font-semibold">{title}</h3>
      </motion.div>
    </Link>
  );
}

function ActivityItem({
  type,
  title,
  time,
  metrics,
}: {
  type: "workout" | "nutrition" | "recovery";
  title: string;
  time: string;
  metrics: string;
}) {
  const iconMap = {
    workout: <Activity className="w-5 h-5 text-primary" />,
    nutrition: <Apple className="w-5 h-5 text-positive" />,
    recovery: <Moon className="w-5 h-5 text-secondary" />,
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-surface/50 rounded-lg hover:bg-surface transition-all">
      <div className="p-2 bg-background rounded-lg">{iconMap[type]}</div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted mt-1">{metrics}</p>
      </div>
      <span className="text-xs text-muted">{time}</span>
    </div>
  );
}

function NavButton({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.9 }}
        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
          active ? "text-primary" : "text-muted hover:text-white"
        }`}
      >
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </motion.div>
    </Link>
  );
}
