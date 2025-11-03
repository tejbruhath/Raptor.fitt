"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Battery, Moon, Flame, Droplet, Info } from "lucide-react";

interface RecoveryScoreProps {
  userId: string;
}

export default function RecoveryScoreWidget({ userId }: RecoveryScoreProps) {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function fetchRecoveryScore() {
      if (!userId) return;
      
      try {
        const res = await fetch(`/api/recovery-score?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setScore(data.recoveryScore);
        }
      } catch (error) {
        console.error('Failed to fetch recovery score:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecoveryScore();
  }, [userId]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-24 bg-surface rounded" />
      </div>
    );
  }

  if (!score) {
    return (
      <div className="card">
        <p className="text-sm text-muted text-center">
          Log sleep & workouts to see your Recovery Score
        </p>
      </div>
    );
  }

  // Determine color based on score
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-positive';
    if (value >= 65) return 'text-warning';
    return 'text-negative';
  };

  const getRecommendationInfo = (rec: string) => {
    switch (rec) {
      case 'rest':
        return { icon: '🛌', text: 'REST DAY', color: 'text-negative', bg: 'bg-negative/10' };
      case 'light':
        return { icon: '🚶', text: 'Light Session', color: 'text-warning', bg: 'bg-warning/10' };
      case 'moderate':
        return { icon: '💪', text: 'Moderate Session', color: 'text-primary', bg: 'bg-primary/10' };
      case 'heavy':
        return { icon: '🔥', text: 'Go Heavy!', color: 'text-positive', bg: 'bg-positive/10' };
      default:
        return { icon: '💪', text: 'Train', color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  const recInfo = getRecommendationInfo(score.recommendation);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 ${recInfo.bg} opacity-20`} />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold">Recovery Score</h3>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 hover:bg-surface rounded transition-colors"
          >
            <Info className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Main Score */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold font-mono ${getScoreColor(score.overall)}`}>
                {score.overall}
              </span>
              <span className="text-2xl text-muted">/100</span>
            </div>
            <p className="text-sm text-muted mt-1">Ready Score</p>
          </div>
          
          <div className={`px-4 py-2 rounded-lg ${recInfo.bg}`}>
            <div className="text-2xl mb-1">{recInfo.icon}</div>
            <p className={`text-xs font-semibold ${recInfo.color}`}>
              {recInfo.text}
            </p>
          </div>
        </div>

        {/* Component Scores */}
        {!showDetails && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-surface rounded-lg">
              <Moon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className={`text-lg font-bold font-mono ${getScoreColor(score.sleep)}`}>
                {score.sleep}
              </div>
              <p className="text-[10px] text-muted">Sleep</p>
            </div>
            <div className="text-center p-2 bg-surface rounded-lg">
              <Flame className="w-4 h-4 mx-auto mb-1 text-warning" />
              <div className={`text-lg font-bold font-mono ${getScoreColor(score.intensity)}`}>
                {score.intensity}
              </div>
              <p className="text-[10px] text-muted">Intensity</p>
            </div>
            <div className="text-center p-2 bg-surface rounded-lg">
              <Droplet className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className={`text-lg font-bold font-mono ${getScoreColor(score.muscleFatigue)}`}>
                {score.muscleFatigue}
              </div>
              <p className="text-[10px] text-muted">Muscles</p>
            </div>
          </div>
        )}

        {/* Detailed Info */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-3 border-t border-white/10"
          >
            {/* Sleep */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-primary" />
                <span>Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${getScoreColor(score.sleep)}`}>
                  {score.sleep}
                </span>
                {score.details?.sleepDeficit > 0 && (
                  <span className="text-xs text-negative">
                    -{score.details.sleepDeficit.toFixed(1)}h
                  </span>
                )}
              </div>
            </div>

            {/* Intensity */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-warning" />
                <span>Training Load</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono font-bold ${getScoreColor(score.intensity)}`}>
                  {score.intensity}
                </span>
                {score.details?.daysWithoutRest > 3 && (
                  <span className="text-xs text-warning">
                    {score.details.daysWithoutRest} days
                  </span>
                )}
              </div>
            </div>

            {/* Muscle Fatigue */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-primary" />
                <span>Muscle Recovery</span>
              </div>
              <span className={`font-mono font-bold ${getScoreColor(score.muscleFatigue)}`}>
                {score.muscleFatigue}
              </span>
            </div>

            {/* Fatigued Muscles */}
            {score.details?.fatiguedMuscleGroups?.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-muted mb-1">Fatigued:</p>
                <div className="flex flex-wrap gap-1">
                  {score.details.fatiguedMuscleGroups.map((muscle: string) => (
                    <span
                      key={muscle}
                      className="px-2 py-1 bg-negative/20 text-negative text-xs rounded-full"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score.overall}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full ${
                score.overall >= 80
                  ? 'bg-gradient-to-r from-positive to-primary'
                  : score.overall >= 65
                  ? 'bg-gradient-to-r from-warning to-primary'
                  : 'bg-gradient-to-r from-negative to-warning'
              }`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
