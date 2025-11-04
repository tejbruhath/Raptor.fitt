"use client";

import { useState, useEffect, useCallback } from "react";
import { driver, DriveStep } from "driver.js";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingTourProps {
  page?: 'dashboard' | 'log' | 'analytics';
}

export default function OnboardingTour({ page = 'dashboard' }: OnboardingTourProps) {
  const [showHelpButton, setShowHelpButton] = useState(true);

  const startTour = useCallback(() => {
    const steps = page === 'dashboard' ? dashboardSteps : page === 'log' ? logSteps : analyticsSteps;
    
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: steps,
      onDestroyStarted: () => {
        localStorage.setItem(`tour-${page}-completed`, 'true');
        driverObj.destroy();
      },
    });
    
    driverObj.drive();
  }, [page]);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem(`tour-${page}-completed`);
    
    // Auto-start tour for first-time users after a short delay
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [page, startTour]);

  const dashboardSteps: DriveStep[] = [
    {
      element: "body",
      popover: {
        title: "Welcome to Raptor.Fitt! 🦖",
        description: "Let's take a quick tour to help you get started with your fitness journey.",
      },
    },
    {
      element: "[data-tour='recovery-score']",
      popover: {
        title: "Recovery Score",
        description: "Track your readiness before training. A higher score means you're ready to push hard!",
      },
    },
    {
      element: "[data-tour='nav-ai']",
      popover: {
        title: "AI Coach 🤖",
        description: "Your intelligent fitness assistant. Use this tab anytime to ask questions and get personalized guidance.",
      },
    },
    {
      element: "[data-tour='strength-index']",
      popover: {
        title: "Strength Index",
        description: "Your overall strength metric. Watch it grow as you progress!",
      },
    },
    {
      element: "[data-tour='nav-log']",
      popover: {
        title: "Log Tab",
        description: "Central hub to log workouts, nutrition, and recovery. Everything in one place!",
      },
    },
    {
      element: "[data-tour='nav-stats']",
      popover: {
        title: "Analytics & Stats",
        description: "View your progress, charts, and detailed analytics here.",
      },
    },
    {
      element: "body",
      popover: {
        title: "You're all set! 🚀",
        description: "Start logging your first workout or chat with your AI coach to begin your journey! Tip: Tap the ? button anytime to replay this tour.",
      },
    },
  ];

  const logSteps: DriveStep[] = [
    {
      element: "body",
      popover: {
        title: "Log Hub 📝",
        description: "This is your action center. Everything you need to track your progress is here!",
      },
    },
    {
      element: "[data-tour='log-workout']",
      popover: {
        title: "Log Workout",
        description: "Track your training sessions: exercises, sets, reps, and weight.",
      },
    },
    {
      element: "[data-tour='log-nutrition']",
      popover: {
        title: "Log Nutrition",
        description: "Record your meals, calories, and macros to fuel your gains!",
      },
    },
    {
      element: "[data-tour='log-recovery']",
      popover: {
        title: "Log Recovery",
        description: "Track sleep hours, soreness levels, and overall readiness.",
      },
    },
  ];

  const analyticsSteps: DriveStep[] = [
    {
      element: "body",
      popover: {
        title: "Analytics Dashboard 📊",
        description: "Visualize your progress with detailed charts and insights.",
      },
    },
  ];

  return (
    <AnimatePresence>
      {showHelpButton && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={startTour}
          className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/50 flex items-center justify-center text-background"
        >
          <HelpCircle className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
