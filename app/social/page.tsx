"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, TrendingUp, Heart, MessageCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Social() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFeed();
    }
  }, [session]);

  async function fetchFeed() {
    try {
      const userId = session?.user?.id;
      const response = await fetch(`/api/social/feed?userId=${userId}`);
      const { activities } = await response.json();
      setActivities(activities);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
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
          <h1 className="text-2xl font-heading font-bold">Social Feed</h1>
          <Link href="/leaderboard" className="text-warning hover:text-warning-light">
            <Trophy className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h2 className="text-2xl font-heading font-bold mb-2">No Activity Yet</h2>
            <p className="text-muted mb-6">
              Start following athletes to see their workouts
            </p>
            <Link href="/leaderboard" className="btn-primary inline-block">
              Find Athletes
            </Link>
          </motion.div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold">
                    {activity.userId?.name?.charAt(0) || "?"}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-heading font-bold">
                      {activity.userId?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-bold mb-2">
                    {activity.title}
                  </h3>
                  <p className="text-muted mb-4">{activity.description}</p>

                  {activity.metadata?.value && (
                    <div className="inline-block bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 mb-4">
                      <span className="text-2xl font-bold font-mono text-primary">
                        {activity.metadata.value}
                      </span>
                      {activity.metadata.exercise && (
                        <span className="text-sm text-muted ml-2">
                          {activity.metadata.exercise}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-6 text-sm text-muted">
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" />
                      {activity.likes?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {activity.comments?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </main>
    </div>
  );
}
