// Strength Index Tier System
// Color-coded progress tiers from Rookie to Apex

export interface SITier {
  name: string;
  minSI: number;
  maxSI: number;
  color: string;
  gradient: string;
  glow: string;
  emoji: string;
}

export const SI_TIERS: SITier[] = [
  {
    name: "Rookie",
    minSI: 0,
    maxSI: 99,
    color: "#ef4444", // red
    gradient: "from-red-500 to-red-600",
    glow: "shadow-red-500/50",
    emoji: "🔴",
  },
  {
    name: "Intermediate",
    minSI: 100,
    maxSI: 149,
    color: "#eab308", // yellow
    gradient: "from-yellow-500 to-yellow-600",
    glow: "shadow-yellow-500/50",
    emoji: "🟡",
  },
  {
    name: "Advanced",
    minSI: 150,
    maxSI: 199,
    color: "#22c55e", // green
    gradient: "from-green-500 to-green-600",
    glow: "shadow-green-500/50",
    emoji: "🟢",
  },
  {
    name: "Elite",
    minSI: 200,
    maxSI: 249,
    color: "#3b82f6", // blue
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/50",
    emoji: "🔵",
  },
  {
    name: "Apex",
    minSI: 250,
    maxSI: Infinity,
    color: "#a855f7", // purple
    gradient: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/50",
    emoji: "🟣",
  },
];

/**
 * Get the tier for a given SI value
 */
export function getSITier(si: number): SITier {
  return SI_TIERS.find(tier => si >= tier.minSI && si <= tier.maxSI) || SI_TIERS[0];
}

/**
 * Calculate progress within current tier (0-100%)
 */
export function getTierProgress(si: number): number {
  const tier = getSITier(si);
  if (tier.maxSI === Infinity) return 100;
  
  const range = tier.maxSI - tier.minSI;
  const progress = si - tier.minSI;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

/**
 * Get next tier info
 */
export function getNextTier(si: number): SITier | null {
  const currentTier = getSITier(si);
  const currentIndex = SI_TIERS.indexOf(currentTier);
  
  if (currentIndex === SI_TIERS.length - 1) return null;
  return SI_TIERS[currentIndex + 1];
}

/**
 * Calculate SI needed to reach next tier
 */
export function getPointsToNextTier(si: number): number {
  const nextTier = getNextTier(si);
  if (!nextTier) return 0;
  return Math.max(0, nextTier.minSI - si);
}
