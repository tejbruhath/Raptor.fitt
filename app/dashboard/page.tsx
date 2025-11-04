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
import RecoveryScoreWidget from "@/components/RecoveryScoreWidget";
import OnboardingTour from "@/components/OnboardingTour";

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
  const [readiness, setReadiness] = useState(0);
  const [userOnboarded, setUserOnboarded] = useState<boolean | null>(null);
  const [recent, setRecent] = useState({
    workout: null as null | { time: string; metrics: string; title: string },
    nutrition: null as null | { time: string; metrics: string; title: string },
    recovery: null as null | { time: string; metrics: string; title: string },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      checkOnboarding().then((ok) => {
        if (ok) fetchDashboardData();
      });
    }
  }, [session]);

  async function checkOnboarding() {
    try {
      const res = await fetch(`/api/user?userId=${session?.user?.id}`);
      const { user } = await res.json();
      if (!user?.onboarded) {
        router.push('/onboarding');
        return false;
      }
      setUserOnboarded(true);
      return true;
    } catch {
      return true;
    }
  }

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
      const latestSI = siData && siData.length > 0 ? siData[siData.length - 1] : null;

      // Calculate stats
      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);

      const recentWorkouts = workouts.filter(
        (w: any) => new Date(w.date || w.createdAt) >= last7Days
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

      const recentNutrition = (nutrition || []).filter(
        (n: any) => new Date(n.date || n.createdAt) >= last7Days
      );
      const avgCalories =
        recentNutrition.length > 0
          ? recentNutrition.reduce((sum: number, n: any) => {
              return (
                sum +
                (n.meals || []).reduce((mSum: number, m: any) => mSum + (m.calories || 0), 0)
              );
            }, 0) / recentNutrition.length
          : 0;

      const recentRecovery = (recovery || []).filter(
        (r: any) => new Date(r.date || r.createdAt) >= last7Days
      );
      const avgSleep =
        recentRecovery.length > 0
          ? recentRecovery.reduce(
              (sum: number, r: any) => sum + (r.sleepHours || 0),
              0
            ) / recentRecovery.length
          : 0;

      // Calculate streak
      const sortedWorkouts = [...workouts].sort(
        (a: any, b: any) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
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
      const previousSI = siData && siData.length > 1 ? siData[siData.length - 2] : null;

      setStreak(currentStreak);
      setStrengthIndex({
        value: latestSI?.totalSI || 0,
        change: latestSI && previousSI ? latestSI.totalSI - previousSI.totalSI : 0,
        trend:
          latestSI && previousSI && latestSI.totalSI - previousSI.totalSI > 0
            ? "up"
            : latestSI && previousSI && latestSI.totalSI - previousSI.totalSI < 0
            ? "down"
            : "stable",
      });
      const workoutsThisMonth = workouts.filter((w: any) => {
        const d = new Date(w.date || w.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        workouts: workoutsThisMonth,
        weeklyVolume: Math.round(weeklyVolume),
        avgCalories: Math.round(avgCalories),
        avgSleep: Math.round(avgSleep * 10) / 10,
      });

      const trendBoost = latestSI && previousSI ? (latestSI.totalSI - previousSI.totalSI > 0 ? 10 : (latestSI.totalSI - previousSI.totalSI < 0 ? -10 : 0)) : 0;
      const readinessCalc = Math.max(0, Math.min(100, Math.round(50 + avgSleep * 5 + trendBoost)));
      setReadiness(readinessCalc);
      // Build recent activity
      const lw = sortedWorkouts && sortedWorkouts.length > 0 ? sortedWorkouts[0] : null;
      const lwVolume = lw && lw.exercises
        ? lw.exercises.reduce((sum: number, ex: any) =>
            sum + (ex.sets || []).reduce((s: number, set: any) => s + (set.reps || 0) * (set.weight || 0), 0), 0)
        : 0;
      const nn = recentNutrition.length > 0 ? recentNutrition[recentNutrition.length - 1] : (nutrition && nutrition.length > 0 ? nutrition[0] : null);
      const rn = recentRecovery.length > 0 ? recentRecovery[recentRecovery.length - 1] : (recovery && recovery.length > 0 ? recovery[0] : null);

      const timeAgo = (d: Date) => {
        const diff = Math.max(0, Date.now() - d.getTime());
        const h = Math.floor(diff / (1000 * 60 * 60));
        if (h < 24) return `${h} hours ago`;
        const days = Math.floor(h / 24); return days === 1 ? 'Yesterday' : `${days} days ago`;
      };

      setRecent({
        workout: lw
          ? {
              title: 'Workout Log',
              time: timeAgo(new Date(lw.date || lw.createdAt)),
              metrics: `${lw.exercises?.length || 0} exercises • ${Math.round(lwVolume).toLocaleString()} kg volume`,
            }
          : null,
        nutrition: nn
          ? {
              title: 'Nutrition Log',
              time: timeAgo(new Date(nn.date || nn.createdAt)),
              metrics: `${nn.totalCalories || nn.meals?.reduce((s: number, m: any) => s + (m.calories||0), 0)} cal • ${nn.totalProtein || 0}g protein`,
            }
          : null,
        recovery: rn
          ? {
              title: 'Recovery Log',
              time: timeAgo(new Date(rn.date || rn.createdAt)),
              metrics: `${rn.sleepHours}h sleep • Quality: ${rn.sleepQuality}/10`,
            }
          : null,
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
      <OnboardingTour page="dashboard" />
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/raptor-logo.svg" alt="Raptor.Fitt" className="h-10 w-auto max-w-[180px]" />
          </div>
          
          {/* Streak */}
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Strength Index Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated text-center py-12"
          data-tour="strength-index"
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
                value={`${stats.workouts}`}
                subtext="this month"
                color="primary"
              />
              <QuickStats
                icon={<Apple className="w-6 h-6" />}
                label="Calories"
                value={`${stats.avgCalories}`}
                subtext="avg/day"
                color="positive"
              />
              <QuickStats
                icon={<Moon className="w-6 h-6" />}
                label="Recovery"
                value={`${stats.avgSleep}h`}
                subtext="avg sleep"
                color="secondary"
              />
              <QuickStats
                icon={<Zap className="w-6 h-6" />}
                label="Readiness"
                value={`${readiness}%`}
                subtext={readiness > 70 ? "train hard" : readiness > 50 ? "steady" : "deload"}
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
            {stats.weeklyVolume > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary font-semibold mb-1">💡 Today's Insight</p>
                <p className="text-muted">Weekly volume: {stats.weeklyVolume.toLocaleString()} kg. Aim for protein ≥ 1.6g/kg bodyweight.</p>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Today's Summary */}
        <TodaysSummary />

        {/* Recovery Score Widget */}
        {session?.user?.id && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            data-tour="recovery-score"
          >
            <RecoveryScoreWidget userId={session.user.id} />
          </motion.section>
        )}

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

        {/* Recent Activity (real data) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recent.workout && (
              <ActivityItem
                type="workout"
                title={recent.workout.title}
                time={recent.workout.time}
                metrics={recent.workout.metrics}
              />
            )}
            {recent.nutrition && (
              <ActivityItem
                type="nutrition"
                title={recent.nutrition.title}
                time={recent.nutrition.time}
                metrics={recent.nutrition.metrics}
              />
            )}
            {recent.recovery && (
              <ActivityItem
                type="recovery"
                title={recent.recovery.title}
                time={recent.recovery.time}
                metrics={recent.recovery.metrics}
              />
            )}
            {!recent.workout && !recent.nutrition && !recent.recovery && (
              <p className="text-muted text-center py-8">No recent activity. Start logging!</p>
            )}
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
