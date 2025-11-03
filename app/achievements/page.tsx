"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import Link from "next/link";
import { ACHIEVEMENTS } from "@/lib/constants/achievements";

export default function Achievements() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [prs, setPRs] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAchievements();
    }
  }, [session]);

  async function fetchAchievements() {
    try {
      const userId = session?.user?.id;
      const response = await fetch(`/api/achievements?userId=${userId}`);
      const { achievements } = await response.json();
      
      // Separate PRs from regular achievements
      const prAchievements = achievements.filter((a: any) => a.isPR);
      const regularAchievements = achievements.filter((a: any) => !a.isPR);
      
      const ids = new Set<string>(regularAchievements.map((a: any) => a.achievementId));
      setUnlockedIds(ids);
      setPRs(prAchievements.sort((a: any, b: any) => 
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      ));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-muted">Loading achievements...</p>
        </div>
      </div>
    );
  }

  const unlocked = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id));

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Achievements</h1>
          <div className="text-sm text-muted">
            {unlocked.length}/{ACHIEVEMENTS.length}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-3xl font-bold font-mono text-primary">
              {unlocked.length}
            </div>
            <div className="text-sm text-muted mt-1">Unlocked</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold font-mono text-warning">
              {prs.length}
            </div>
            <div className="text-sm text-muted mt-1">PRs</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold font-mono text-muted">
              {Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}%
            </div>
            <div className="text-sm text-muted mt-1">Complete</div>
          </div>
        </div>

        {/* Personal Records */}
        {prs.length > 0 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-4">Personal Records 🏆</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prs.map((pr, index) => (
                <motion.div
                  key={pr._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card bg-gradient-to-br from-warning/10 to-primary/10 border-2 border-warning/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg mb-1">
                        {pr.exerciseName}
                      </h3>
                      <p className="text-sm text-muted">{pr.description}</p>
                      <div className="flex gap-2 mt-2">
                        <div className="inline-block px-3 py-1 bg-warning/20 rounded-full text-xs font-mono text-warning">
                          {pr.muscleGroup}
                        </div>
                        <div className="inline-block px-3 py-1 bg-primary/20 rounded-full text-xs font-mono text-primary">
                          {new Date(pr.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <div>
            <h2 className="text-xl font-heading font-bold mb-4">Unlocked</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlocked.map((ach, index) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{ach.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-lg mb-1">
                        {ach.title}
                      </h3>
                      <p className="text-sm text-muted">{ach.description}</p>
                      <div className="mt-2 inline-block px-3 py-1 bg-primary/20 rounded-full text-xs font-mono text-primary">
                        {ach.category}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        <div>
          <h2 className="text-xl font-heading font-bold mb-4">Locked</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locked.map((ach, index) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="card opacity-50"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl grayscale">{ach.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold text-lg">
                        {ach.title}
                      </h3>
                      <Lock className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-muted">{ach.description}</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-surface rounded-full text-xs font-mono text-muted">
                      {ach.category}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
