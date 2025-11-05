"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Save } from "lucide-react";
import Link from "next/link";
import AchievementUnlockModal from "@/components/AchievementUnlockModal";

export default function LogRecovery() {
  const { data: session } = useSession();
  const router = useRouter();
  const [recovery, setRecovery] = useState({
    sleepHours: 7,
    sleepQuality: 7,
    soreness: 5,
    stress: 5,
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [showAchievements, setShowAchievements] = useState(false);

  // Auto-load last recovery log when page opens
  useEffect(() => {
    if (session?.user?.id) {
      loadLastRecovery();
      loadHistory();
    }
  }, [session]);

  async function loadLastRecovery() {
    try {
      const res = await fetch('/api/recovery');
      const data = await res.json();
      if (data.recovery && data.recovery.length > 0) {
        // Get the most recent recovery log
        const lastLog = data.recovery[data.recovery.length - 1];
        setRecovery({
          sleepHours: lastLog.sleepHours || 7,
          sleepQuality: lastLog.sleepQuality || 7,
          soreness: lastLog.soreness || 5,
          stress: lastLog.stress || 5,
          notes: lastLog.notes || "",
        });
      }
    } catch (error) {
      console.error("Failed to load last recovery:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/recovery');
      const data = await res.json();
      if (data.recovery) {
        setHistory(data.recovery.slice(0, 10)); // Show last 10 entries
      }
    } catch (error) {
      console.error("Failed to load recovery history:", error);
    }
  }

  const saveRecovery = async () => {
    if (!session?.user?.id) {
      alert("Please sign in to save recovery");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          date: new Date().toISOString(),
          ...recovery,
        }),
      });

      if (response.ok) {
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
            return; // Don't redirect yet
          }
        } catch (e) {
          console.warn('Achievement check failed');
        }

        router.push("/dashboard");
      } else {
        alert("Failed to save recovery");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving recovery");
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
          <h1 className="text-2xl font-heading font-bold">Log Recovery</h1>
          <button onClick={saveRecovery} className="btn-primary text-sm px-4 py-2" disabled={saving}>
            <Save className="w-4 h-4 inline mr-2" />
            Save
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <Moon className="w-16 h-16 mx-auto mb-4 text-secondary" />
          <h2 className="text-2xl font-heading font-bold mb-2">
            How did you recover?
          </h2>
          <p className="text-muted">
            Track your sleep, soreness, and stress to optimize training
          </p>
        </motion.div>

        {/* Sleep Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <label className="block mb-4">
            <span className="text-lg font-heading font-bold mb-2 block">
              Sleep Hours
            </span>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={recovery.sleepHours}
                onChange={(e) =>
                  setRecovery({ ...recovery, sleepHours: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="text-3xl font-bold font-mono text-primary w-24 text-right">
                {recovery.sleepHours.toFixed(1)}h
              </span>
            </div>
          </label>
        </motion.div>

        {/* Sleep Quality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <label className="block">
            <span className="text-lg font-heading font-bold mb-4 block">
              Sleep Quality (1-10)
            </span>
            <div className="grid grid-cols-10 gap-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setRecovery({ ...recovery, sleepQuality: i + 1 })
                  }
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    recovery.sleepQuality > i
                      ? "bg-primary border-primary text-background"
                      : "border-neutral text-muted hover:border-primary/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </label>
        </motion.div>

        {/* Soreness */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <label className="block">
            <span className="text-lg font-heading font-bold mb-4 block">
              Soreness Level (1-10)
            </span>
            <div className="grid grid-cols-10 gap-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRecovery({ ...recovery, soreness: i + 1 })}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    recovery.soreness > i
                      ? "bg-warning border-warning text-background"
                      : "border-neutral text-muted hover:border-warning/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted mt-2">
              1 = No soreness, 10 = Extremely sore
            </p>
          </label>
        </motion.div>

        {/* Stress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <label className="block">
            <span className="text-lg font-heading font-bold mb-4 block">
              Stress Level (1-10)
            </span>
            <div className="grid grid-cols-10 gap-2">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRecovery({ ...recovery, stress: i + 1 })}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    recovery.stress > i
                      ? "bg-negative border-negative text-white"
                      : "border-neutral text-muted hover:border-negative/50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted mt-2">
              1 = Very relaxed, 10 = Very stressed
            </p>
          </label>
        </motion.div>

        {/* Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <label className="block">
            <span className="text-lg font-heading font-bold mb-4 block">
              Notes (Optional)
            </span>
            <textarea
              value={recovery.notes}
              onChange={(e) =>
                setRecovery({ ...recovery, notes: e.target.value })
              }
              placeholder="How do you feel? Any issues?"
              className="input min-h-[120px] resize-none"
            />
          </label>
        </motion.div>

        {/* Recovery Score Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-gradient-to-br from-surface to-neutral text-center"
        >
          <h3 className="text-lg font-heading font-bold mb-2">
            Recovery Score
          </h3>
          <div className="text-6xl font-bold font-mono gradient-text mb-2">
            {Math.round(
              ((recovery.sleepHours / 8) * 40 +
                (recovery.sleepQuality / 10) * 30 +
                ((11 - recovery.soreness) / 10) * 15 +
                ((11 - recovery.stress) / 10) * 15) *
                10
            ) / 10}
          </div>
          <p className="text-muted text-sm">
            Based on sleep, quality, soreness, and stress
          </p>
        </motion.div>

        {/* Recovery History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card"
          >
            <h3 className="text-xl font-heading font-bold mb-4">Recovery History</h3>
            <div className="space-y-3">
              {history.map((log: any, idx: number) => (
                <div key={log._id || idx} className="p-4 bg-surface/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">
                      {new Date(log.date || log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted">
                      {new Date(log.date || log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted">Sleep</p>
                      <p className="font-mono font-semibold text-primary">{log.sleepHours}h</p>
                    </div>
                    <div>
                      <p className="text-muted">Quality</p>
                      <p className="font-mono font-semibold text-primary">{log.sleepQuality}/10</p>
                    </div>
                    <div>
                      <p className="text-muted">Soreness</p>
                      <p className="font-mono font-semibold text-warning">{log.soreness}/10</p>
                    </div>
                    <div>
                      <p className="text-muted">Stress</p>
                      <p className="font-mono font-semibold text-negative">{log.stress}/10</p>
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted mt-2 italic">"{log.notes}"</p>
                  )}
                </div>
              ))}
            </div>
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
