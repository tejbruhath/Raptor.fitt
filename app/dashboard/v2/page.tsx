'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ProgressiveDashboard } from '@/components/ProgressiveDashboard';
import { useUserStore } from '@/lib/store/userStore';
import { useAIStore } from '@/lib/store/aiStore';

export default function DashboardV2Page() {
  const { data: session, status } = useSession();
  const { profile } = useUserStore();
  const { dailySummary, insights } = useAIStore();
  const [dashboardData, setDashboardData] = useState({
    streak: 0,
    todayWorkout: false,
    todayNutrition: 0,
    todaySleep: null as number | null,
    aiInsight: '',
    weeklyVolume: 0,
    strengthIndex: 0,
    recoveryScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session, status]);

  const fetchDashboardData = async () => {
    try {
      // Fetch intelligence data
      const intelligenceRes = await fetch('/api/intelligence');
      const intelligenceData = await intelligenceRes.json();

      // Fetch today's data
      const todayRes = await fetch('/api/today-summary');
      const todayData = await todayRes.json();

      setDashboardData({
        streak: todayData.streak || 0,
        todayWorkout: todayData.workoutLogged || false,
        todayNutrition: todayData.caloriesLogged || 0,
        todaySleep: todayData.sleepHours || null,
        aiInsight: intelligenceData.insights?.[0]?.message || dailySummary || "Let's crush today! 💪",
        weeklyVolume: intelligenceData.metrics?.totalVolume30Days || 0,
        strengthIndex: todayData.strengthIndex || 0,
        recoveryScore: todayData.recoveryScore || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <ProgressiveDashboard data={dashboardData} />
    </div>
  );
}
