"use client";

import { motion } from "framer-motion";
import { Trophy, Target, Flame, Star, Award, Zap } from "lucide-react";

interface AchievementBadgeProps {
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_ICONS: Record<string, any> = {
  trophy: Trophy,
  target: Target,
  flame: Flame,
  star: Star,
  award: Award,
  zap: Zap,
};

const RARITY_COLORS = {
  common: 'from-gray-500 to-gray-600',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-600',
  legendary: 'from-warning to-accent',
};

export default function AchievementBadge({
  icon,
  title,
  description,
  earned,
  earnedDate,
  rarity = 'common',
}: AchievementBadgeProps) {
  const IconComponent = BADGE_ICONS[icon] || Trophy;
  const gradientClass = RARITY_COLORS[rarity];

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1 }}
      className={`card p-6 text-center transition-all ${
        earned ? 'opacity-100' : 'opacity-40 grayscale'
      }`}
    >
      <div
        className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center ${
          earned ? 'shadow-lg' : ''
        }`}
      >
        <IconComponent className="w-10 h-10 text-white" />
      </div>
      <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted mb-3">{description}</p>
      {earned && earnedDate && (
        <p className="text-xs text-primary">
          Earned: {new Date(earnedDate).toLocaleDateString()}
        </p>
      )}
      {!earned && (
        <p className="text-xs text-muted">Not earned yet</p>
      )}
    </motion.div>
  );
}

// Predefined achievements list
export const ACHIEVEMENTS = [
  // Beginner (Common)
  { id: 'first_workout', icon: 'target', title: 'First Steps', description: 'Complete your first workout', rarity: 'common' as const, category: 'milestone' },
  { id: '10_workouts', icon: 'zap', title: 'Dedicated', description: '10 workouts completed', rarity: 'common' as const, category: 'milestone' },
  { id: 'first_pr', icon: 'award', title: 'Personal Best', description: 'Hit your first PR', rarity: 'common' as const, category: 'strength' },
  
  // Intermediate (Rare)
  { id: 'week_streak', icon: 'flame', title: 'Week Warrior', description: '7-day workout streak', rarity: 'rare' as const, category: 'consistency' },
  { id: '50_workouts', icon: 'star', title: 'Committed', description: '50 workouts completed', rarity: 'rare' as const, category: 'milestone' },
  { id: 'si_100', icon: 'trophy', title: 'Intermediate', description: 'Reach SI 100', rarity: 'rare' as const, category: 'strength' },
  { id: '5_prs', icon: 'award', title: 'PR Hunter', description: '5 personal records', rarity: 'rare' as const, category: 'strength' },
  
  // Advanced (Epic)
  { id: 'month_streak', icon: 'trophy', title: 'Monthly Master', description: '30-day workout streak', rarity: 'epic' as const, category: 'consistency' },
  { id: '100_workouts', icon: 'trophy', title: 'Centurion', description: '100 workouts completed', rarity: 'epic' as const, category: 'milestone' },
  { id: 'si_150', icon: 'trophy', title: 'Advanced', description: 'Reach SI 150', rarity: 'epic' as const, category: 'strength' },
  { id: '10_prs', icon: 'star', title: 'PR Collector', description: '10 personal records', rarity: 'epic' as const, category: 'strength' },
  { id: 'volume_10k', icon: 'zap', title: 'Volume King', description: '10,000kg total volume', rarity: 'epic' as const, category: 'volume' },
  
  // Elite (Legendary)
  { id: 'si_200', icon: 'trophy', title: 'Elite', description: 'Reach SI 200', rarity: 'legendary' as const, category: 'strength' },
  { id: 'quarter_streak', icon: 'star', title: 'Quarter Champion', description: '90-day workout streak', rarity: 'legendary' as const, category: 'consistency' },
  { id: '500_workouts', icon: 'trophy', title: 'Apex Predator', description: '500 workouts completed', rarity: 'legendary' as const, category: 'milestone' },
  { id: '25_prs', icon: 'trophy', title: 'PR Legend', description: '25 personal records', rarity: 'legendary' as const, category: 'strength' },
  { id: 'volume_50k', icon: 'zap', title: 'Volume God', description: '50,000kg total volume', rarity: 'legendary' as const, category: 'volume' },
  { id: 'year_streak', icon: 'flame', title: 'Year of the Raptor', description: '365-day workout streak', rarity: 'legendary' as const, category: 'consistency' },
];
