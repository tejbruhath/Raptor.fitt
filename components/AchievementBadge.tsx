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

const BADGE_ICONS: Record<string, any> = {
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
  {
    id: 'first-workout',
    icon: 'star',
    title: 'First Steps',
    description: 'Complete your first workout',
    rarity: 'common' as const,
  },
  {
    id: '10-workouts',
    icon: 'target',
    title: 'Dedicated',
    description: 'Complete 10 workouts',
    rarity: 'common' as const,
  },
  {
    id: '50-workouts',
    icon: 'flame',
    title: 'Committed',
    description: 'Complete 50 workouts',
    rarity: 'rare' as const,
  },
  {
    id: '100-workouts',
    icon: 'trophy',
    title: 'Centurion',
    description: 'Complete 100 workouts',
    rarity: 'epic' as const,
  },
  {
    id: '7-day-streak',
    icon: 'flame',
    title: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    rarity: 'rare' as const,
  },
  {
    id: '30-day-streak',
    icon: 'zap',
    title: 'Monthly Master',
    description: 'Maintain a 30-day workout streak',
    rarity: 'epic' as const,
  },
  {
    id: 'first-pr',
    icon: 'award',
    title: 'Personal Best',
    description: 'Set your first PR',
    rarity: 'common' as const,
  },
  {
    id: '100-si',
    icon: 'star',
    title: 'Intermediate',
    description: 'Reach SI of 100',
    rarity: 'rare' as const,
  },
  {
    id: '150-si',
    icon: 'trophy',
    title: 'Advanced',
    description: 'Reach SI of 150',
    rarity: 'epic' as const,
  },
  {
    id: '200-si',
    icon: 'zap',
    title: 'Elite',
    description: 'Reach SI of 200',
    rarity: 'legendary' as const,
  },
];
