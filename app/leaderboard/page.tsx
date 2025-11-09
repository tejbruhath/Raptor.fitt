"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, Crown } from "lucide-react";
import Link from "next/link";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Leaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const response = await fetch("/api/social/leaderboard");
      const { leaderboard } = await response.json();
      setLeaderboard(leaderboard);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Leaderboard</h1>
          <Trophy className="w-6 h-6 text-warning" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.userId === session?.user?.id;
            const rank = user.rank;

            return (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`card flex items-center gap-4 ${
                  isCurrentUser ? "border-2 border-primary" : ""
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-16 text-center">
                  {rank <= 3 ? (
                    <div className="text-3xl">
                      {rank === 1 && "🥇"}
                      {rank === 2 && "🥈"}
                      {rank === 3 && "🥉"}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold font-mono text-muted">
                      {rank}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-lg">
                    {user.username}
                    {isCurrentUser && (
                      <span className="text-sm text-primary ml-2">(You)</span>
                    )}
                  </h3>
                  <div className="flex gap-4 text-sm text-muted mt-1">
                    <span>{user.totalWorkouts} workouts</span>
                    <span>{user.weeklyVolume.toLocaleString()} kg/week</span>
                  </div>
                </div>

                {/* SI */}
                <div className="text-right">
                  <div className="text-3xl font-bold font-mono text-primary">
                    {user.strengthIndex.toFixed(1)}
                  </div>
                  <div className="flex items-center gap-1 justify-end text-sm">
                    {user.change > 0 && (
                      <>
                        <TrendingUp className="w-4 h-4 text-positive" />
                        <span className="text-positive">+{user.change.toFixed(1)}</span>
                      </>
                    )}
                    {user.change < 0 && (
                      <>
                        <TrendingDown className="w-4 h-4 text-negative" />
                        <span className="text-negative">{user.change.toFixed(1)}</span>
                      </>
                    )}
                    {user.change === 0 && (
                      <>
                        <Minus className="w-4 h-4 text-muted" />
                        <span className="text-muted">0</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
