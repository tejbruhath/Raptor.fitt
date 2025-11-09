'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSleepStore } from '@/lib/store/sleepStore';

export function SleepTracker() {
  const { todayEntry, addSleepEntry, recoveryMetrics } = useSleepStore();
  
  const [hoursSlept, setHoursSlept] = useState(todayEntry?.hoursSlept || 7);
  const [quality, setQuality] = useState(todayEntry?.quality || 7);
  const [soreness, setSoreness] = useState(todayEntry?.soreness || 3);
  const [stress, setStress] = useState(todayEntry?.stress || 3);
  const [notes, setNotes] = useState(todayEntry?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const entry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hoursSlept,
      quality,
      soreness,
      stress,
      notes,
      timestamp: new Date(),
    };

    addSleepEntry(entry);

    // Save to backend
    try {
      await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to save sleep entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTrendIcon = () => {
    if (!recoveryMetrics) return <Minus className="text-muted" size={20} />;
    
    switch (recoveryMetrics.trend) {
      case 'improving':
        return <TrendingUp className="text-positive" size={20} />;
      case 'declining':
        return <TrendingDown className="text-negative" size={20} />;
      default:
        return <Minus className="text-muted" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent/20 rounded-xl">
          <Moon className="text-accent" size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading">Sleep & Recovery</h2>
          <p className="text-sm text-muted">Track your rest and recovery</p>
        </div>
      </div>

      {/* Recovery Metrics Card */}
      {recoveryMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-accent/10 to-primary/5 rounded-2xl border border-accent/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Recovery Score</h3>
            {getTrendIcon()}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl font-mono font-bold">{recoveryMetrics.recoveryScore}</span>
              <span className="text-sm text-muted">/100</span>
            </div>
            <div className="w-full h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  recoveryMetrics.recoveryScore >= 70
                    ? 'bg-gradient-to-r from-positive to-primary'
                    : recoveryMetrics.recoveryScore >= 40
                    ? 'bg-gradient-to-r from-warning to-secondary'
                    : 'bg-gradient-to-r from-negative to-accent'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${recoveryMetrics.recoveryScore}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-mono font-bold">{recoveryMetrics.avgSleep7Days}h</p>
              <p className="text-xs text-muted">Avg Sleep</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold">{recoveryMetrics.avgQuality7Days}</p>
              <p className="text-xs text-muted">Avg Quality</p>
            </div>
            <div>
              <p className="text-2xl font-mono font-bold">{recoveryMetrics.avgSoreness7Days}</p>
              <p className="text-xs text-muted">Avg Soreness</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sleep Input Form */}
      <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral space-y-6">
        <h3 className="font-bold text-lg">How was your sleep?</h3>

        {/* Hours Slept */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted">Hours Slept</label>
            <span className="text-2xl font-mono font-bold">{hoursSlept}h</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={hoursSlept}
            onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
            className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-accent [&::-webkit-slider-thumb]:to-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>0h</span>
            <span>12h</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted">Quality</label>
            <span className="text-2xl font-mono font-bold">{quality}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-secondary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Soreness Level */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted">Soreness</label>
            <span className="text-2xl font-mono font-bold">{soreness}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={soreness}
            onChange={(e) => setSoreness(parseInt(e.target.value))}
            className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-warning [&::-webkit-slider-thumb]:to-negative [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>None</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Stress Level */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-muted">Stress</label>
            <span className="text-2xl font-mono font-bold">{stress}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={stress}
            onChange={(e) => setStress(parseInt(e.target.value))}
            className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-accent [&::-webkit-slider-thumb]:to-accent-dark [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>Relaxed</span>
            <span>High</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm text-muted block mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How do you feel? Any observations?"
            className="w-full bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-accent to-accent-dark text-white font-bold rounded-xl hover:shadow-glow-accent transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Sleep Log'}
        </button>
      </div>

      {/* Tips Card */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-start gap-3">
        <AlertCircle className="text-primary flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-semibold mb-1">Recovery Tip</p>
          <p className="text-xs text-muted">
            Aim for 7-9 hours of quality sleep. Recovery happens during rest, not training.
          </p>
        </div>
      </div>
    </div>
  );
}
