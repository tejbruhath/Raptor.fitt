'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useEffect } from 'react';

interface VolumeToastProps {
  volume: number;
  volumeChange?: number;
  onClose: () => void;
  duration?: number;
}

export default function VolumeToast({
  volume,
  volumeChange,
  onClose,
  duration = 2000,
}: VolumeToastProps) {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const isIncrease = volumeChange && volumeChange > 0;
  const isDecrease = volumeChange && volumeChange < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150]"
    >
      <div className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-lg flex items-center gap-3 border ${
        isIncrease 
          ? 'bg-positive/20 border-positive/50'
          : isDecrease
          ? 'bg-warning/20 border-warning/50'
          : 'bg-primary/20 border-primary/50'
      }`}>
        {isIncrease && <TrendingUp className="w-5 h-5 text-positive" />}
        {isDecrease && <TrendingDown className="w-5 h-5 text-warning" />}
        {!volumeChange && <Zap className="w-5 h-5 text-primary" />}
        
        <div>
          <p className="text-sm font-semibold">
            🔥 +{volume}kg total volume
          </p>
          {volumeChange && (
            <p className={`text-xs ${
              isIncrease ? 'text-positive' : 'text-warning'
            }`}>
              {isIncrease ? '↑' : '↓'} {Math.abs(volumeChange)}% from last session
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
