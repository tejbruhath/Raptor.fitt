"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react";
import { getSITier, getTierProgress, getNextTier, getPointsToNextTier } from "@/lib/siTiers";

interface StrengthIndexRingProps {
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

export default function StrengthIndexRing({
  value,
  change,
  trend,
}: StrengthIndexRingProps) {
  const circumference = 2 * Math.PI * 90;
  const tier = getSITier(value);
  const tierProgress = getTierProgress(value);
  const nextTier = getNextTier(value);
  const pointsToNext = getPointsToNextTier(value);
  
  const progress = (value / 300) * 100; // Display progress out of 300
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const trendIcon = {
    up: <TrendingUp className="w-6 h-6 text-positive" />,
    down: <TrendingDown className="w-6 h-6 text-negative" />,
    stable: <Minus className="w-6 h-6 text-muted" />,
  };

  const trendColor = {
    up: "text-positive",
    down: "text-negative",
    stable: "text-muted",
  };

  return (
    <div className="relative">
      {/* SVG Ring */}
      <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          className="text-surface"
        />
        
        {/* Progress ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="drop-shadow-glow"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={tier.color} stopOpacity="1" />
            <stop offset="100%" stopColor={tier.color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="text-center"
        >
          {/* Tier Badge */}
          <motion.div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-xs font-bold mb-2 ${tier.glow} shadow-lg`}
            animate={{
              boxShadow: [
                `0 0 20px ${tier.color}40`,
                `0 0 30px ${tier.color}60`,
                `0 0 20px ${tier.color}40`,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span>{tier.emoji}</span>
            <span>{tier.name}</span>
            {!nextTier && <Trophy className="w-3 h-3" />}
          </motion.div>

          <div className="text-5xl font-bold font-mono mb-1" style={{ color: tier.color }}>
            {value.toFixed(1)}
          </div>
          <p className="text-xs text-muted uppercase tracking-wide mb-2">
            Strength Index
          </p>
          
          <div className={`flex items-center gap-2 justify-center ${trendColor[trend]}`}>
            {trendIcon[trend]}
            <span className="font-mono font-semibold text-sm">
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
          
          {nextTier && (
            <p className="text-xs text-muted mt-2">
              {pointsToNext.toFixed(1)} pts to {nextTier.name}
            </p>
          )}
        </motion.div>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
