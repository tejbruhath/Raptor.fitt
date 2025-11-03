"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
  const progress = (value / 200) * 100; // Assuming max SI of 200
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
            <stop offset="0%" stopColor="#14F1C0" />
            <stop offset="100%" stopColor="#E14EFF" />
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
          <p className="text-sm text-muted uppercase tracking-wide mb-1">
            Strength Index
          </p>
          <div className="text-6xl font-bold font-mono gradient-text mb-2">
            {value.toFixed(1)}
          </div>
          <div className={`flex items-center gap-2 justify-center ${trendColor[trend]}`}>
            {trendIcon[trend]}
            <span className="font-mono font-semibold">
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted mt-2">this week</p>
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
