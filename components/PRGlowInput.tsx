'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PRGlowInputProps {
  value: number;
  onChange: (value: number) => void;
  previousMax: number;
  placeholder?: string;
  label?: string;
  unit?: string;
}

export default function PRGlowInput({
  value,
  onChange,
  previousMax,
  placeholder = '0',
  label = 'Weight',
  unit = 'kg',
}: PRGlowInputProps) {
  const [isPR, setIsPR] = useState(false);

  useEffect(() => {
    setIsPR(value > previousMax && value > 0);
  }, [value, previousMax]);

  return (
    <div className="relative">
      {label && (
        <label className="text-sm text-muted mb-2 block">{label}</label>
      )}
      
      <div className="relative">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={placeholder}
          step="0.5"
          className={`input w-full text-center text-2xl font-mono font-bold transition-all ${
            isPR
              ? 'border-warning shadow-glow-accent ring-2 ring-warning/30'
              : ''
          }`}
        />
        
        {unit && !isPR && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-mono">
            {unit}
          </span>
        )}

        <AnimatePresence>
          {isPR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Trophy className="w-6 h-6 text-warning drop-shadow-glow" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isPR && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-warning font-semibold mt-2 flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            New PR! Previous best: {previousMax}{unit}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
