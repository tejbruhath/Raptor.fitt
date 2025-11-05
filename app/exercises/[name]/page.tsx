"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, BarChart3, Target } from "lucide-react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ExerciseHistory() {
  const { data: session } = useSession();
  const params = useParams();
  const exerciseName = decodeURIComponent(params.name as string);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session]);

  async function fetchHistory() {
    try {
      const res = await fetch(
        `/api/exercises/history?name=${encodeURIComponent(exerciseName)}`
      );
      const data = await res.json();
      setHistory(data.history || []);
      setStats(data.stats || {});
      setPrs(data.prs || []);
    } catch (error) {
      console.error("Failed to fetch exercise history:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-muted">Loading history...</p>
        </div>
      </div>
    );
  }

  const chartData = history.slice(-20).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    "1RM": entry.estimated1RM,
    volume: Math.round(entry.totalVolume / 100) * 100,
  }));

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/analytics" className="text-primary hover:text-primary-light mb-2 block">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">{exerciseName}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-xs text-muted uppercase mb-1">Sessions</p>
              <p className="text-3xl font-bold font-mono text-primary">{stats.totalSessions}</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase mb-1">Current Max</p>
              <p className="text-3xl font-bold font-mono text-positive">{stats.currentMax}kg</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase mb-1">All-Time Max</p>
              <p className="text-3xl font-bold font-mono text-warning">{stats.allTimeMax}kg</p>
            </div>
            <div className="card">
              <p className="text-xs text-muted uppercase mb-1">Volume Trend</p>
              <p className="text-3xl font-bold font-mono text-secondary">
                {stats.volumeTrend > 0 ? "+" : ""}{Math.round(stats.volumeTrend)}%
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="card">
          <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progression
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" style={{ fontSize: 12 }} />
                <YAxis stroke="#888" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="1RM"
                  stroke="#14F1C0"
                  strokeWidth={3}
                  dot={{ fill: "#14F1C0", r: 4 }}
                  name="Estimated 1RM"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted py-8">No data to display</p>
          )}
        </div>

        {/* PRs */}
        {prs.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Personal Records
            </h2>
            <div className="space-y-2">
              {prs.map((pr, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent p-3 rounded-lg"
                >
                  <div>
                    <p className="font-bold font-mono">{pr.estimated1RM}kg</p>
                    <p className="text-xs text-muted">Est. 1RM</p>
                  </div>
                  <p className="text-sm text-muted">
                    {new Date(pr.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div className="card">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Session History
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice().reverse().map((entry, i) => (
              <div key={i} className="bg-surface/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-primary">1RM: {entry.estimated1RM}kg</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted">Sets</p>
                    <p className="font-mono">{entry.sets}</p>
                  </div>
                  <div>
                    <p className="text-muted">Volume</p>
                    <p className="font-mono">{Math.round(entry.totalVolume)}kg</p>
                  </div>
                  <div>
                    <p className="text-muted">Avg RPE</p>
                    <p className="font-mono">{entry.avgRPE}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
