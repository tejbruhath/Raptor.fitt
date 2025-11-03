"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, LogOut, Trophy, Camera, Edit } from "lucide-react";
import Link from "next/link";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ si: 0, workouts: 0, streak: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setProfileImage(data.url);
        // Update user profile with image URL
        await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session?.user?.id, profileImage: data.url }),
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  async function fetchUserData() {
    try {
      const userId = session?.user?.id;

      // Fetch user data
      const userRes = await fetch(`/api/user?userId=${userId}`);
      if (userRes.ok) {
        const { user } = await userRes.json();
        setUserData(user);
      }

      // Fetch workouts for stats
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}`);
      const { workouts } = await workoutsRes.json();

      // Fetch SI
      const siRes = await fetch(`/api/strength-index?userId=${userId}`);
      const { strengthIndex } = await siRes.json();
      const latestSI = strengthIndex[strengthIndex.length - 1];

      // Calculate streak
      const sortedWorkouts = workouts.sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      let streak = 0;
      let currentDate = new Date();
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= streak + 1) {
          streak++;
          currentDate = workoutDate;
        } else {
          break;
        }
      }

      setStats({
        si: latestSI?.totalSI || 0,
        workouts: workouts.length,
        streak,
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setLoading(false);
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/auth/signin" });
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background raptor-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Profile</h1>
          <button 
            onClick={handleLogout}
            className="text-negative hover:text-accent transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {profileImage || userData?.profileImage ? (
                <img src={profileImage || userData?.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-background" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary-light transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <Camera className="w-4 h-4 text-background" />
            </label>
            {uploading && (
              <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-heading font-bold mb-1">{userData?.name || session?.user?.name}</h2>
          <p className="text-muted mb-4">{userData?.email || session?.user?.email}</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">{stats.si.toFixed(1)}</p>
              <p className="text-xs text-muted">Strength Index</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-positive">{stats.workouts}</p>
              <p className="text-xs text-muted">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-warning">{stats.streak}</p>
              <p className="text-xs text-muted">Day Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-xl font-heading font-bold mb-4">Body Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted mb-1">Bodyweight</p>
              <p className="text-2xl font-bold font-mono">
                {Array.isArray(userData?.bodyweight) 
                  ? userData.bodyweight[userData.bodyweight.length - 1] || 0 
                  : userData?.bodyweight || 0} kg
              </p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Height</p>
              <p className="text-2xl font-bold font-mono">{userData?.height || 0} cm</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Age</p>
              <p className="text-2xl font-bold font-mono">{userData?.age || 0} years</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-1">Training Age</p>
              <p className="text-2xl font-bold font-mono">{userData?.trainingAge || 0} years</p>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-xl font-heading font-bold mb-4">Settings</h3>
          <div className="space-y-4">
            <Link href="/achievements" className="w-full flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-neutral transition-colors">
              <span className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-warning" />
                <span>Achievements</span>
              </span>
              <span className="text-muted">→</span>
            </Link>
            <Link href="/onboarding" className="w-full flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-neutral transition-colors">
              <span className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-primary" />
                <span>Edit Profile</span>
              </span>
              <span className="text-muted">→</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
