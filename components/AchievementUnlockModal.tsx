"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy } from "lucide-react";
import { BADGE_ICONS } from "./AchievementBadge";
import confetti from "canvas-confetti";

interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  earned?: boolean; // For manual viewing from profile
}

interface AchievementUnlockModalProps {
  achievements: Achievement[];
  onClose: () => void;
  isUnlockNotification?: boolean; // true when showing newly unlocked, false for manual view
}

export default function AchievementUnlockModal({ achievements, onClose, isUnlockNotification = true }: AchievementUnlockModalProps) {
  // Fire confetti only for unlocked achievements or unlock notifications
  useEffect(() => {
    // Check if there are any unlocked achievements to show confetti for
    const hasUnlockedAchievements = isUnlockNotification || achievements.some(a => a.earned);
    
    if (!hasUnlockedAchievements) return;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, [achievements, isUnlockNotification]);

  const categoryColors: Record<string, string> = {
    milestone: "from-warning to-primary",
    consistency: "from-accent to-warning",
    strength: "from-primary to-secondary",
    volume: "from-positive to-primary",
    social: "from-secondary to-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="card-elevated max-w-lg w-full max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isUnlockNotification || achievements.some(a => a.earned)
                ? 'bg-gradient-to-br from-warning to-primary'
                : 'bg-neutral grayscale'
            }`}
          >
            <Trophy className="w-10 h-10 text-background" />
          </motion.div>
          <h2 className="text-3xl font-heading font-bold mb-2">
            {isUnlockNotification
              ? achievements.length === 1 ? "Achievement Unlocked!" : "Achievements Unlocked!"
              : achievements.length === 1 ? "Achievement" : "Achievements"}
          </h2>
          <p className="text-muted">
            {isUnlockNotification
              ? achievements.length === 1 
                ? "You've earned a new achievement!" 
                : `You've earned ${achievements.length} new achievements!`
              : achievements.length === 1
                ? achievements[0].earned ? "Click for celebration!" : "Keep working to unlock!"
                : `${achievements.filter(a => a.earned).length} unlocked, ${achievements.filter(a => !a.earned).length} locked`}
          </p>
        </div>

        <div className="space-y-4">
          {achievements.map((achievement, index) => {
            const isLocked = !isUnlockNotification && !achievement.earned;
            return (
              <motion.div
                key={achievement.achievementId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative overflow-hidden rounded-lg p-6 ${
                  isLocked
                    ? 'bg-neutral grayscale opacity-60'
                    : `bg-gradient-to-br ${
                        categoryColors[achievement.category] || "from-primary to-secondary"
                      }`
                }`}
              >
                <div className="flex items-start gap-4">
                  {(() => {
                    const IconComp = BADGE_ICONS[achievement.icon] || Trophy;
                    return (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isLocked ? 'bg-surface' : 'bg-background/20'
                      }`}>
                        <IconComp className={`w-7 h-7 ${
                          isLocked ? 'text-muted' : 'text-background'
                        }`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <h3 className={`text-xl font-heading font-bold mb-1 ${
                      isLocked ? 'text-muted' : 'text-background'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${
                      isLocked ? 'text-muted/60' : 'text-background/80'
                    }`}>{achievement.description}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                      isLocked ? 'bg-surface text-muted' : 'bg-background/20 text-background'
                    }`}>
                      {achievement.category}
                    </span>
                  </div>
                </div>

                {/* Shimmer effect - only for unlocked */}
                {!isLocked && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        <button onClick={onClose} className="btn-primary w-full mt-6">
          {isUnlockNotification ? 'Awesome!' : 'Close'}
        </button>
      </motion.div>
    </motion.div>
  );
}
