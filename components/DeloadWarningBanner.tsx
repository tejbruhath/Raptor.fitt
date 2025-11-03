"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, TrendingDown } from "lucide-react";
import { useState } from "react";

interface DeloadWarningProps {
  currentSI: number;
  expectedSI: number;
  deviation: number; // percentage
  onDismiss?: () => void;
}

export default function DeloadWarningBanner({
  currentSI,
  expectedSI,
  deviation,
  onDismiss,
}: DeloadWarningProps) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card bg-gradient-to-r from-warning/20 to-negative/20 border-2 border-warning/40 relative overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 10px, transparent 10px, transparent 20px)',
            }} />
          </div>

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-bold text-lg">Deload Recommended</h3>
                <div className="flex items-center gap-1 px-2 py-1 bg-negative/20 rounded-full">
                  <TrendingDown className="w-3 h-3 text-negative" />
                  <span className="text-xs font-mono text-negative">
                    -{deviation.toFixed(1)}%
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted mb-3">
                Your Strength Index is <span className="text-warning font-semibold">{deviation.toFixed(1)}% below expected</span>. 
                Your body may need recovery to prevent overtraining.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-surface/50 rounded-lg">
                  <p className="text-xs text-muted mb-1">Current SI</p>
                  <p className="text-xl font-bold font-mono text-negative">
                    {currentSI.toFixed(1)}
                  </p>
                </div>
                <div className="p-3 bg-surface/50 rounded-lg">
                  <p className="text-xs text-muted mb-1">Expected SI</p>
                  <p className="text-xl font-bold font-mono text-primary">
                    {expectedSI.toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <span>💡</span>
                  Recommended Actions:
                </p>
                <ul className="space-y-1 text-xs text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>Reduce all weights to 60-70% of working weight</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>Cut volume by 30-50% (fewer sets)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>Focus on technique and movement quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning">•</span>
                    <span>Take 1-2 extra rest days this week</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button className="btn-warning flex-1 py-2">
                  Start Deload Week
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-surface hover:bg-neutral rounded-lg text-sm transition-colors"
                >
                  I'll Monitor It
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-surface rounded transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
