"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, LogOut, Trophy, Camera, Edit } from "lucide-react";
import Link from "next/link";
import { PageLoadingSkeleton } from "@/components/LoadingSkeleton";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState({ si: 0, workouts: 0, streak: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState({
    chest: 0,
    waist: 0,
    arms: 0,
    thighs: 0,
    calves: 0,
    shoulders: 0,
  });
  const [editingMeasurements, setEditingMeasurements] = useState(false);

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
      const timestamp = Date.now(); // Prevent caching

      // Fetch user data
      const userRes = await fetch(`/api/user?userId=${userId}&t=${timestamp}`);
      if (userRes.ok) {
        const { user } = await userRes.json();
        setUserData(user);
      }

      // Fetch workouts for stats
      const workoutsRes = await fetch(`/api/workouts?userId=${userId}&t=${timestamp}`);
      const { workouts } = await workoutsRes.json();

      // Fetch SI
      const siRes = await fetch(`/api/strength-index?userId=${userId}&t=${timestamp}`);
      const { strengthIndex } = await siRes.json();
      
      // CRITICAL: Sort SI data by date to get the actual latest value
      const sortedSI = strengthIndex && strengthIndex.length > 0 
        ? [...strengthIndex].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];
      const latestSI = sortedSI.length > 0 ? sortedSI[sortedSI.length - 1] : null;

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

  async function saveMeasurements() {
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: session?.user?.id, 
          measurements 
        }),
      });
      setEditingMeasurements(false);
    } catch (error) {
      console.error('Failed to save measurements:', error);
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

        {/* Body Measurements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-heading font-bold">Body Measurements</h3>
            <button
              onClick={() => editingMeasurements ? saveMeasurements() : setEditingMeasurements(true)}
              className="btn-ghost text-sm"
            >
              {editingMeasurements ? 'Save' : 'Edit'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(measurements).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted mb-1 capitalize">{key}</p>
                {editingMeasurements ? (
                  <input
                    type="number"
                    step="0.5"
                    value={value || ''}
                    onChange={(e) => setMeasurements({ ...measurements, [key]: Number(e.target.value) })}
                    className="input text-center"
                    placeholder="0"
                  />
                ) : (
                  <p className="text-xl font-bold font-mono">{value || 0} cm</p>
                )}
              </div>
            ))}
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
