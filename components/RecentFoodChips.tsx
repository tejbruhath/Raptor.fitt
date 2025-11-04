'use client';

import { motion } from 'framer-motion';
import { Clock, Star, Apple } from 'lucide-react';
import { useHoverCapability } from '@/lib/hooks/useHoverCapability';

interface FoodItem {
  name: string;
  calories?: number;
  protein?: number;
  favorite?: boolean;
}

interface RecentFoodChipsProps {
  recentFoods: FoodItem[];
  favoriteFoods?: FoodItem[];
  onSelect: (food: FoodItem) => void;
}

export default function RecentFoodChips({
  recentFoods,
  favoriteFoods = [],
  onSelect,
}: RecentFoodChipsProps) {
  const canHover = useHoverCapability();

  if (recentFoods.length === 0 && favoriteFoods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Favorite Foods */}
      {favoriteFoods.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <p className="text-sm font-semibold text-warning">Favorites</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {favoriteFoods.map((food, idx) => (
              <motion.button
                key={food.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={canHover ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(food)}
                className="px-4 py-2 bg-gradient-to-r from-warning/20 to-warning/10 border border-warning/30 rounded-full transition-all hover-device:hover:shadow-glow-accent"
              >
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-warning" />
                  <div className="text-left">
                    <p className="text-sm font-semibold capitalize">{food.name}</p>
                    {food.protein && food.calories && (
                      <p className="text-xs text-muted font-mono">
                        {food.calories}cal • P: {food.protein}g
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Foods */}
      {recentFoods.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-positive" />
            <p className="text-sm font-semibold text-positive">Recent Foods</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentFoods.slice(0, 5).map((food, idx) => (
              <motion.button
                key={food.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 + 0.2 }}
                whileHover={canHover ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(food)}
                className="px-4 py-2 bg-gradient-to-r from-positive/20 to-positive/10 border border-positive/30 rounded-full transition-all hover-device:hover:shadow-glow-positive"
              >
                <div className="flex items-center gap-2">
                  <div className="text-left">
                    <p className="text-sm font-semibold capitalize">{food.name}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-3 bg-surface/30 border border-white/10 rounded-lg"
      >
        <p className="text-xs text-muted">
          💡 <span className="font-semibold">Quick Tip:</span> Type{' '}
          <code className="px-1 py-0.5 bg-surface rounded text-positive font-mono">
            chicken 200g
          </code>{' '}
          for instant macros
        </p>
      </motion.div>
    </div>
  );
}
