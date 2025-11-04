'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Zap, Clock, Target, Share2, X } from 'lucide-react';
import { calculateTotalVolume, formatWorkoutSummary } from '@/lib/utils/workoutParsing';
import type { ParsedSet } from '@/lib/utils/workoutParsing';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface Exercise {
  name: string;
  sets: ParsedSet[];
  isPR?: boolean;
}

interface WorkoutSessionSummaryProps {
  exercises: Exercise[];
  duration?: number; // in minutes
  volumeChange?: number; // percentage
  prsAchieved?: number;
  recoveryTip?: string;
  onClose: () => void;
  onShare?: () => void;
}

export default function WorkoutSessionSummary({
  exercises,
  duration,
  volumeChange,
  prsAchieved = 0,
  recoveryTip,
  onClose,
  onShare,
}: WorkoutSessionSummaryProps) {
  
  const totalVolume = exercises.reduce((sum, ex) => sum + calculateTotalVolume(ex.sets), 0);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const bestLift = exercises.reduce((max, ex) => {
    const maxWeight = Math.max(...ex.sets.map(s => s.weight));
    return maxWeight > max.weight ? { name: ex.name, weight: maxWeight, isPR: ex.isPR || false } : max;
  }, { name: '', weight: 0, isPR: false });

  // Trigger confetti if PRs achieved
  useEffect(() => {
    if (prsAchieved > 0) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#14F1C0', '#E14EFF', '#FF005C'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#14F1C0', '#E14EFF', '#FF005C'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [prsAchieved]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="card max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold">Session Complete! 🦖</h2>
              <p className="text-sm text-muted">Great work today</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover-device:hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PR Badge (if achieved) */}
        {prsAchieved > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-4 p-4 bg-gradient-to-r from-warning to-accent rounded-lg text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xl font-bold">
              {prsAchieved} New Personal Record{prsAchieved > 1 ? 's' : ''}! 🎉
            </p>
          </motion.div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted">Total Volume</p>
            </div>
            <p className="text-3xl font-bold font-mono text-primary">
              {totalVolume.toLocaleString()}
              <span className="text-sm ml-1">kg</span>
            </p>
            {volumeChange !== undefined && volumeChange !== 0 && (
              <p className={`text-xs mt-1 ${volumeChange > 0 ? 'text-positive' : 'text-negative'}`}>
                {volumeChange > 0 ? '↑' : '↓'} {Math.abs(volumeChange)}% from last session
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-secondary" />
              <p className="text-xs text-muted">Best Lift</p>
            </div>
            <p className="text-3xl font-bold font-mono text-secondary">
              {bestLift.weight}
              <span className="text-sm ml-1">kg</span>
            </p>
            {bestLift.isPR && (
              <p className="text-xs mt-1 text-warning">🏆 New PR!</p>
            )}
            <p className="text-xs text-muted truncate">{bestLift.name}</p>
          </motion.div>

          {duration && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" />
                <p className="text-xs text-muted">Duration</p>
              </div>
              <p className="text-3xl font-bold font-mono text-warning">
                {duration}
                <span className="text-sm ml-1">min</span>
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-accent" />
              <p className="text-xs text-muted">Total Sets</p>
            </div>
            <p className="text-3xl font-bold font-mono text-accent">{totalSets}</p>
            <p className="text-xs text-muted">{exercises.length} exercises</p>
          </motion.div>
        </div>

        {/* Recovery Tip */}
        {recoveryTip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-surface/50 border border-white/10 rounded-lg mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Recovery Tip</p>
                <p className="text-sm text-muted">{recoveryTip}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Exercise Breakdown */}
        <div className="mb-6">
          <p className="text-sm font-semibold mb-3">Session Breakdown</p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {exercises.map((exercise, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="p-3 bg-surface/30 rounded-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      {exercise.name}
                      {exercise.isPR && <span className="text-warning text-xs">🏆 PR</span>}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {formatWorkoutSummary(exercise.sets)}
                    </p>
                  </div>
                  <p className="text-xs text-muted font-mono">
                    {calculateTotalVolume(exercise.sets)}kg
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 btn-ghost flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 btn-primary"
          >
            Finish
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
