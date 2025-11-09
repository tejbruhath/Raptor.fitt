"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Lock } from "lucide-react";
import Link from "next/link";
import AchievementBadge, { ACHIEVEMENTS } from "@/components/AchievementBadge";
import StreakCalendar from "@/components/StreakCalendar";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Achievements() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [prs, setPRs] = useState<any[]>([]);
  const [workoutDates, setWorkoutDates] = useState<string[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

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

      // Fetch workouts for streak data
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}`);
      if (workoutsRes.ok) {
        const { workouts } = await workoutsRes.json();
        const dates = workouts.map((w: any) => w.date);
        setWorkoutDates(dates);
        
        // Calculate streaks
        const sorted = workouts.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        let lastDate = new Date();
        
        for (const workout of sorted) {
          const wDate = new Date(workout.date);
          const diffDays = Math.floor((lastDate.getTime() - wDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            tempStreak++;
            if (current === 0) current = tempStreak;
          } else {
            if (tempStreak > longest) longest = tempStreak;
            tempStreak = 0;
          }
          lastDate = wDate;
        }
        
        setCurrentStreak(current);
        setLongestStreak(Math.max(longest, current));
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return <PageLoadingSkeleton />;
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

        {/* Streak Calendar */}
        <StreakCalendar
          workoutDates={workoutDates}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />

        {/* All Achievements */}
        <div>
          <h2 className="text-xl font-heading font-bold mb-4">All Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((ach) => (
              <AchievementBadge
                key={ach.id}
                icon={ach.icon}
                title={ach.title}
                description={ach.description}
                earned={unlockedIds.has(ach.id)}
                rarity={ach.rarity}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
