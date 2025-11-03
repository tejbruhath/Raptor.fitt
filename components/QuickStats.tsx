"use client";

import { motion } from "framer-motion";

interface QuickStatsProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: "primary" | "secondary" | "positive" | "negative" | "warning";
}

export default function QuickStats({
  icon,
  label,
  value,
  subtext,
  color,
}: QuickStatsProps) {
  const colorClasses = {
    primary: "text-primary border-primary/30 bg-primary/5",
    secondary: "text-secondary border-secondary/30 bg-secondary/5",
    positive: "text-positive border-positive/30 bg-positive/5",
    negative: "text-negative border-negative/30 bg-negative/5",
    warning: "text-warning border-warning/30 bg-warning/5",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all cursor-pointer min-w-[140px]`}
    >
      <div className={`mb-3 ${colorClasses[color].split(" ")[0]}`}>{icon}</div>
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono mb-1 ${colorClasses[color].split(" ")[0]}`}>
        {value}
      </p>
      <p className="text-xs text-muted">{subtext}</p>
    </motion.div>
  );
}
