"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, X } from "lucide-react";

interface RestTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RestTimer({ isOpen, onClose }: RestTimerProps) {
  const [seconds, setSeconds] = useState(90); // Default 90 seconds
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(90);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsRunning(false);
      // Play notification sound (optional)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Rest Complete!', {
            body: 'Time to hit your next set! 💪',
            icon: '/raptor-logo.svg',
          });
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, seconds]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsRunning(false);
    }
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const presetTimes = [30, 60, 90, 120, 180];

  const handleReset = () => {
    setSeconds(initialTime);
    setIsRunning(false);
  };

  const handlePreset = (time: number) => {
    setSeconds(time);
    setInitialTime(time);
    setIsRunning(false);
  };

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
            className="card max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold">Rest Timer</h2>
              <button onClick={onClose} className="text-muted hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#1E1E1E"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#14F1C0"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 88 * (1 - seconds / initialTime)
                    }`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-6xl font-bold font-mono text-primary">
                    {formatTime(seconds)}
                  </p>
                  <p className="text-sm text-muted mt-2">
                    {seconds === 0 ? "Time's up!" : isRunning ? 'Resting...' : 'Ready'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="btn-primary px-8 py-3"
                  disabled={seconds === 0}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 inline mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 inline mr-2" />
                      Start
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="btn-ghost px-6 py-3"
                >
                  <RotateCcw className="w-5 h-5 inline mr-2" />
                  Reset
                </button>
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-2">
              <p className="text-sm text-muted mb-2">Quick Presets:</p>
              <div className="grid grid-cols-5 gap-2">
                {presetTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => handlePreset(time)}
                    className={`p-3 rounded-lg text-center transition-all ${
                      initialTime === time
                        ? 'bg-primary text-background'
                        : 'bg-surface hover:bg-neutral'
                    }`}
                  >
                    <p className="font-bold">{time}s</p>
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
