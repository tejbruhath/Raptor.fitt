"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator } from "lucide-react";

interface PlateCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlateCalculator({ isOpen, onClose }: PlateCalculatorProps) {
  const [targetWeight, setTargetWeight] = useState(60);
  const [barWeight, setBarWeight] = useState(20); // Standard Olympic bar

  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];

  const calculatePlates = (target: number, bar: number) => {
    const weightPerSide = (target - bar) / 2;
    if (weightPerSide <= 0) return [];

    const plates: number[] = [];
    let remaining = weightPerSide;

    for (const plate of availablePlates) {
      while (remaining >= plate) {
        plates.push(plate);
        remaining -= plate;
      }
    }

    return plates;
  };

  const plates = calculatePlates(targetWeight, barWeight);
  const actualWeight = barWeight + plates.reduce((sum, p) => sum + p, 0) * 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                <Calculator className="w-6 h-6 text-primary" />
                Plate Calculator
              </h2>
              <button onClick={onClose} className="text-muted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-muted mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  step="2.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="input w-full text-center text-2xl font-bold"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Bar Weight (kg)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 15, 10].map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setBarWeight(weight)}
                      className={`p-3 rounded-lg font-semibold transition-all ${
                        barWeight === weight
                          ? 'bg-primary text-background'
                          : 'bg-surface hover:bg-neutral'
                      }`}
                    >
                      {weight} kg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="p-6 bg-surface rounded-lg mb-4">
              <p className="text-sm text-muted mb-2">Per Side:</p>
              {plates.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {plates.map((plate, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 rounded-lg font-bold font-mono"
                      style={{
                        backgroundColor: `hsl(${(plate / 25) * 120}, 70%, 50%)`,
                        color: plate >= 10 ? '#000' : '#fff',
                      }}
                    >
                      {plate}kg
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-4">Just the bar!</p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <p className="text-muted">Total Weight:</p>
                <p className="text-3xl font-bold font-mono text-primary">
                  {actualWeight.toFixed(1)} kg
                </p>
              </div>
              {Math.abs(actualWeight - targetWeight) > 0.1 && (
                <p className="text-xs text-warning mt-2">
                  ⚠️ Closest possible: {actualWeight.toFixed(1)} kg
                </p>
              )}
            </div>

            {/* Quick Sets */}
            <div className="space-y-2">
              <p className="text-sm text-muted mb-2">Quick Sets:</p>
              <div className="grid grid-cols-4 gap-2">
                {[60, 80, 100, 120, 140, 160, 180, 200].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setTargetWeight(weight)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      targetWeight === weight
                        ? 'bg-primary text-background'
                        : 'bg-surface hover:bg-neutral'
                    }`}
                  >
                    <p className="font-bold text-sm">{weight}kg</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
