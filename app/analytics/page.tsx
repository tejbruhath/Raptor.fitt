"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";
import Link from "next/link";
import ComparisonChart from "@/components/ComparisonChart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<any>(null);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [muscleData, setMuscleData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgWeeklyVolume: 0,
    workoutsThisMonth: 0,
    prsThisMonth: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnalytics();
    }
  }, [session]);

  async function fetchAnalytics() {
    try {
      const userId = session?.user?.id;
      if (!userId) return;

      // Fetch strength index for growth chart
      const siRes = await fetch(`/api/strength-index?userId=${userId}`);
      if (siRes.ok) {
        const { strengthIndex } = await siRes.json();
        // Limit to last 60 days for mobile
        const last60Days = strengthIndex.slice(-60);
        setGrowthData(last60Days);
      }

      // Fetch workouts for volume chart
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}`);
      if (!workoutsRes.ok) {
        console.error('Failed to fetch workouts');
        setLoading(false);
        return;
      }
      const { workouts } = await workoutsRes.json();

      // Calculate weekly volume
      const weeklyVolume: any = {};
      workouts.forEach((w: any) => {
        const week = new Date(w.date).toISOString().slice(0, 10);
        const volume = w.exercises.reduce((sum: number, ex: any) => {
          return sum + ex.sets.reduce((s: number, set: any) => s + set.reps * set.weight, 0);
        }, 0);
        weeklyVolume[week] = (weeklyVolume[week] || 0) + volume;
      });

      const volumeChart = Object.entries(weeklyVolume)
        .map(([date, volume]) => ({
          date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          volume,
        }))
        .slice(-30);  // Last 30 days
      setVolumeData(volumeChart);

      // Calculate muscle group distribution
      const muscleGroups: any = {};
      workouts.forEach((w: any) => {
        w.exercises.forEach((ex: any) => {
          muscleGroups[ex.muscleGroup] = (muscleGroups[ex.muscleGroup] || 0) + ex.sets.length;
        });
      });

      // Calculate total sets
      const totalSets = Object.values(muscleGroups).reduce((sum: number, val: any) => sum + val, 0);

      // EXACT colors matching the legend - using the SAME colors as the dashboard cards
      const colorMap: Record<string, string> = {
        'chest': '#14F1C0',      // Cyan - matches dashboard
        'shoulders': '#E14EFF',  // Purple - matches dashboard
        'arms': '#FFC93C',       // Yellow - matches dashboard
        'back': '#00FFA2',       // Green - matches dashboard
        'legs': '#FF005C',       // Red - matches dashboard
        'core': '#14B8A6',       // Teal - matches dashboard
      };
      
      const muscleChart = Object.entries(muscleGroups).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((value as number / totalSets) * 100), // Convert to percentage
        color: colorMap[name.toLowerCase()] || '#14F1C0',
      }));
      setMuscleData(muscleChart);

      // Calculate real stats
      const now = new Date();
      const workoutsThisMonth = workouts.filter((w: any) => {
        const d = new Date(w.date || w.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      // Calculate average weekly volume (last 4 weeks)
      const fourWeeksAgo = new Date();
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
      const recentWorkouts = workouts.filter((w: any) => new Date(w.date || w.createdAt) >= fourWeeksAgo);
      const totalVolume = recentWorkouts.reduce((sum: number, w: any) => {
        return sum + w.exercises.reduce((exSum: number, ex: any) => {
          return exSum + ex.sets.reduce((setSum: number, set: any) => {
            return setSum + set.reps * set.weight;
          }, 0);
        }, 0);
      }, 0);
      const avgWeeklyVolume = recentWorkouts.length > 0 ? Math.round(totalVolume / 4) : 0;

      // Get PRs this month
      const prsRes = await fetch(`/api/achievements?userId=${userId}`);
      const { achievements } = await prsRes.json();
      const prsThisMonth = achievements.filter((a: any) => {
        if (!a.isPR) return false;
        const d = new Date(a.unlockedAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        avgWeeklyVolume,
        workoutsThisMonth,
        prsThisMonth,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-muted">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  // Use real data or fallback to empty arrays
  const displayVolumeData = volumeData.length > 0 ? volumeData : [];
  const displayMuscleData = muscleData.length > 0 ? muscleData : [];

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold gradient-text">
            Analytics
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Avg Weekly Volume"
            value={`${stats.avgWeeklyVolume.toLocaleString()} kg`}
            change=""
            positive
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Workouts This Month"
            value={`${stats.workoutsThisMonth}`}
            change=""
            positive
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="PRs This Month"
            value={`${stats.prsThisMonth}`}
            change=""
            positive
          />
        </div>

        {/* Strength Index Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">
            Strength Index Growth
          </h2>
          {growthData && growthData.observed && growthData.observed.length > 0 ? (
            <ComparisonChart
              expected={growthData.expected || []}
              observed={growthData.observed || []}
              futureProjection={growthData.futureProjection || []}
              title="Strength Index Growth"
              yAxisLabel="SI"
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="date" stroke="#8C8C8C" />
              <YAxis stroke="#8C8C8C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #14F1C0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="si"
                stroke="#14F1C0"
                strokeWidth={3}
                dot={{ fill: "#14F1C0", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          )}
        </motion.div>

        {/* Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">
            Weekly Volume (kg)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="date" stroke="#8C8C8C" />
              <YAxis stroke="#8C8C8C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#121212",
                  border: "1px solid #E14EFF",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="volume" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E14EFF" stopOpacity={1} />
                  <stop offset="100%" stopColor="#14F1C0" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Muscle Group Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-2xl font-heading font-bold mb-6">
            Muscle Group Distribution
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={displayMuscleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {displayMuscleData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {displayMuscleData.map((group: any) => (
                <div key={group.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="text-sm">{group.name}</span>
                  <span className="text-sm font-mono text-muted ml-auto">
                    {group.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="card">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-primary">{icon}</div>
        <span className="text-sm text-muted uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold font-mono gradient-text">{value}</p>
        <span
          className={`text-sm font-semibold ${
            positive ? "text-positive" : "text-negative"
          }`}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
}
