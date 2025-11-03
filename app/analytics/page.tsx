"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";
import Link from "next/link";
import ComparisonChart from "@/components/ComparisonChart";
import DeloadWarningBanner from "@/components/DeloadWarningBanner";
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
  Area,
  ComposedChart,
} from "recharts";

type AnalyticsTab = 'overview' | 'strength' | 'volume' | 'muscle-balance' | 'trends';

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState<any>(null);
  const [growthPrediction, setGrowthPrediction] = useState<any>(null);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [muscleData, setMuscleData] = useState<any[]>([]);
  const [bodyCompData, setBodyCompData] = useState<any[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  async function fetchAnalytics() {
    try {
      const userId = session?.user?.id;
      if (!userId) return;

      // Fetch strength index for growth chart
      const siRes = await fetch(`/api/strength-index?userId=${userId}`);
      if (siRes.ok) {
        const { strengthIndex } = await siRes.json();
        // Convert to chart format
        const chartData = strengthIndex.map((si: any) => ({
          date: new Date(si.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          si: si.totalSI,
        })).slice(-30);  // Last 30 days
        setGrowthData(chartData);
      }

      // Fetch growth prediction (predicted vs observed vs future) - 45 days
      const predRes = await fetch(`/api/growth-prediction?userId=${userId}&days=45`);
      if (predRes.ok) {
        const predData = await predRes.json();
        if (predData.prediction) {
          setGrowthPrediction(predData);
        }
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
      
      // Guard against division by zero
      const muscleChart = totalSets > 0 
        ? Object.entries(muscleGroups).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: Math.round((value as number / totalSets) * 100), // Convert to percentage
            color: colorMap[name.toLowerCase()] || '#14F1C0',
          }))
        : [];
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

        {/* Deload Warning */}
        {growthPrediction && growthPrediction.currentSI && growthPrediction.projectedSI && (
          (() => {
            const expectedSI = growthPrediction.prediction.predicted[growthPrediction.prediction.predicted.length - 1]?.value || growthPrediction.projectedSI;
            const deviation = ((expectedSI - growthPrediction.currentSI) / expectedSI) * 100;
            
            if (deviation > 10) {
              return (
                <DeloadWarningBanner
                  currentSI={growthPrediction.currentSI}
                  expectedSI={expectedSI}
                  deviation={deviation}
                />
              );
            }
            return null;
          })()
        )}

        {/* Analytics Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'strength', label: 'Strength' },
            { id: 'volume', label: 'Volume' },
            { id: 'muscle-balance', label: 'Balance' },
            { id: 'trends', label: 'Trends' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalyticsTab)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-background'
                  : 'bg-surface hover:bg-neutral'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
        {/* Strength Index Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold">
              Strength Index Growth
            </h2>
            {growthPrediction && (
              <div className="text-sm">
                <span className="mr-4 text-muted">Current: {growthPrediction.currentSI?.toFixed(1)}</span>
                <span className={growthPrediction.projectedSI > growthPrediction.currentSI ? 'text-positive' : 'text-negative'}>
                  Projected (45d): {growthPrediction.projectedSI?.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          
          {growthPrediction?.prediction ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart 
                  data={[
                    ...growthPrediction.prediction.observed,
                    ...(growthPrediction.confidence?.upper || []),
                  ]}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8C8C8C" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickCount={8}
                  />
                  <YAxis stroke="#8C8C8C" domain={[50, 250]} width={40} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid #14F1C0",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: any) => value?.toFixed ? value.toFixed(1) : value}
                  />
                  <Legend />
                  
                  {/* Confidence Interval - Shaded Area */}
                  {growthPrediction.confidence?.upper && growthPrediction.confidence?.lower && (
                    <>
                      <Area
                        data={growthPrediction.confidence.upper}
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#confidenceGradient)"
                        name="95% Confidence"
                      />
                      <Area
                        data={growthPrediction.confidence.lower}
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="#0A0A0A"
                        name=""
                      />
                    </>
                  )}
                  
                  {/* Predicted (Expected) Curve - GREEN */}
                  <Line
                    data={growthPrediction.prediction.predicted}
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="Expected Growth"
                    strokeDasharray="5 5"
                  />
                  
                  {/* Observed (Actual) Curve - BLUE */}
                  <Line
                    data={growthPrediction.prediction.observed}
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", r: 5 }}
                    name="Actual Performance"
                  />
                  
                  {/* Future Projection - PURPLE */}
                  <Line
                    data={growthPrediction.prediction.future}
                    type="monotone"
                    dataKey="value"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="Future Projection"
                    strokeDasharray="3 3"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              {/* Growth Stats */}
              <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-surface/50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted mb-1">Weekly Growth</p>
                  <p className={`text-lg font-bold font-mono ${growthPrediction.weeklyGrowth >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {growthPrediction.weeklyGrowth >= 0 ? '+' : ''}{growthPrediction.weeklyGrowth?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted mb-1">Data Points</p>
                  <p className="text-lg font-bold font-mono">{growthPrediction.dataPoints}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted mb-1">45-Day Gain</p>
                  <p className={`text-lg font-bold font-mono ${(growthPrediction.projectedSI - growthPrediction.currentSI) >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {(growthPrediction.projectedSI - growthPrediction.currentSI) >= 0 ? '+' : ''}{((growthPrediction.projectedSI - growthPrediction.currentSI) || 0).toFixed(1)}
                  </p>
                </div>
              </div>
            </>
          ) : growthData && growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis dataKey="date" stroke="#8C8C8C" />
                <YAxis stroke="#8C8C8C" domain={[50, 250]} />
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
                  name="Strength Index"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No SI data yet. Log workouts to see your progress!</p>
            </div>
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
          </>
        )}

        {/* Strength Tab */}
        {activeTab === 'strength' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">1RM Progress by Exercise</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis 
                    dataKey="exercise" 
                    stroke="#8C8C8C"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid #14F1C0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="max1RM" fill="#14F1C0" name="Max 1RM (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Strength Index History</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis dataKey="date" stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#8C8C8C" domain={[50, 250]} tick={{ fontSize: 12 }} />
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
                    dot={{ fill: "#14F1C0", r: 4 }}
                    name="Strength Index"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {/* Volume Tab */}
        {activeTab === 'volume' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Weekly Training Volume</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis 
                    dataKey="exercise" 
                    stroke="#8C8C8C"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#8C8C8C" label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid #14F1C0",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volume" fill="#fbbf24" name="Total Volume (kg)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted">Average Weekly Volume: <span className="text-primary font-bold">{stats.avgWeeklyVolume.toLocaleString()} kg</span></p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Volume Trend Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis dataKey="exercise" stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid #14F1C0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    dot={{ fill: "#fbbf24", r: 4 }}
                    name="Volume (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}

        {/* Muscle Balance Tab */}
        {activeTab === 'muscle-balance' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Muscle Group Distribution</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={displayMuscleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {displayMuscleData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3 min-w-[200px]">
                  {displayMuscleData.map((group: any) => (
                    <div key={group.name} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="text-sm font-semibold">{group.name}</span>
                      <span className="text-sm font-mono text-muted ml-auto">
                        {group.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Training Balance Score</h2>
              <div className="text-center py-8">
                <div className="text-6xl font-bold font-mono mb-4">
                  <span className="text-primary">
                    {Math.min(100, Math.round(100 - (Math.max(...displayMuscleData.map((g: any) => g.value)) - Math.min(...displayMuscleData.map((g: any) => g.value)))))}
                  </span>
                  <span className="text-muted">/100</span>
                </div>
                <p className="text-muted mb-2">Balance Score</p>
                <p className="text-sm text-muted max-w-md mx-auto">
                  A higher score indicates more balanced training across all muscle groups. Aim for 80+ for optimal development.
                </p>
              </div>
            </motion.div>
          </>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Workout Frequency Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis dataKey="exercise" stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121212",
                      border: "1px solid #14F1C0",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sets" fill="#a855f7" name="Total Sets" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-2xl font-heading font-bold mb-6">Monthly Comparison</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-6 bg-surface rounded-lg text-center">
                  <p className="text-sm text-muted mb-2">This Month</p>
                  <p className="text-3xl font-bold text-primary">{stats.workoutsThisMonth}</p>
                  <p className="text-xs text-muted mt-1">Workouts</p>
                </div>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <p className="text-sm text-muted mb-2">PRs Hit</p>
                  <p className="text-3xl font-bold text-warning">{stats.prsThisMonth}</p>
                  <p className="text-xs text-muted mt-1">Personal Records</p>
                </div>
                <div className="p-6 bg-surface rounded-lg text-center">
                  <p className="text-sm text-muted mb-2">Total Volume</p>
                  <p className="text-3xl font-bold text-positive">{stats.avgWeeklyVolume.toLocaleString()}</p>
                  <p className="text-xs text-muted mt-1">kg/week</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                  <XAxis dataKey="date" stroke="#8C8C8C" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#8C8C8C" domain={[50, 250]} tick={{ fontSize: 12 }} />
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
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="SI Progress"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </>
        )}
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
