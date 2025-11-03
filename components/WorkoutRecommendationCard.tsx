"use client";

import { motion } from "framer-motion";
import { TrendingUp, Target, Zap, Info } from "lucide-react";

interface RecommendationProps {
  exercise: string;
  lastWeight?: number;
  lastReps?: number;
  lastSets?: number;
  suggestedWeight: number;
  suggestedReps: number;
  suggestedSets: number;
  reasoning?: string;
  confidence?: number;
}

export default function WorkoutRecommendationCard({
  exercise,
  lastWeight,
  lastReps,
  lastSets,
  suggestedWeight,
  suggestedReps,
  suggestedSets,
  reasoning,
  confidence = 75,
}: RecommendationProps) {
  const weightChange = lastWeight ? ((suggestedWeight - lastWeight) / lastWeight) * 100 : 0;
  const isIncrease = weightChange > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-sm">AI Recommendation</h4>
        </div>
        {confidence && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted">{confidence}%</span>
            <div className="w-12 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Suggestion */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary">
              {suggestedWeight}
            </span>
            <span className="text-sm text-muted">kg</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono text-muted">
              {suggestedSets} × {suggestedReps}
            </span>
            {isIncrease && weightChange > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-positive/20 rounded-full">
                <TrendingUp className="w-3 h-3 text-positive" />
                <span className="text-xs font-mono text-positive">
                  +{weightChange.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {lastWeight && (
          <div className="text-right">
            <p className="text-xs text-muted mb-1">Last time</p>
            <div className="font-mono text-sm text-muted">
              {lastWeight}kg
            </div>
            <div className="font-mono text-xs text-muted">
              {lastSets} × {lastReps}
            </div>
          </div>
        )}
      </div>

      {/* Reasoning */}
      {reasoning && (
        <div className="flex items-start gap-2 p-2 bg-surface/50 rounded-lg">
          <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-2 bg-primary hover:bg-primary-light text-background text-xs font-semibold rounded-lg transition-colors">
          Use Suggestion
        </button>
        <button className="px-3 py-2 bg-surface hover:bg-neutral text-xs rounded-lg transition-colors">
          <Zap className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
