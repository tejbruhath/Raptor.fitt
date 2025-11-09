'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Apple,
  Moon,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
  Award,
} from 'lucide-react';
import { QuickLog } from './QuickLog';
import Link from 'next/link';

interface DashboardSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  expanded: boolean;
}

interface DashboardData {
  streak: number;
  todayWorkout: boolean;
  todayNutrition: number; // calories
  todaySleep: number | null;
  aiInsight: string;
  weeklyVolume: number;
  strengthIndex: number;
  recoveryScore: number;
}

interface ProgressiveDashboardProps {
  data: DashboardData;
}

export function ProgressiveDashboard({ data }: ProgressiveDashboardProps) {
  const [sections, setSections] = useState<DashboardSection[]>([
    { id: 'workout', title: 'Workout', icon: Dumbbell, color: 'primary', expanded: false },
    { id: 'nutrition', title: 'Nutrition', icon: Apple, color: 'secondary', expanded: false },
    { id: 'sleep', title: 'Sleep', icon: Moon, color: 'accent', expanded: false },
    { id: 'insights', title: 'Insights', icon: TrendingUp, color: 'primary', expanded: false },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Hero Quick Log Area */}
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30 mb-4">
            <Zap className="text-primary" size={20} />
            <span className="font-mono text-2xl font-bold">{data.streak}</span>
            <span className="text-sm text-muted">day streak</span>
          </div>
          <h1 className="text-4xl font-bold font-heading bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Quick Log
          </h1>
          <p className="text-muted">
            {data.aiInsight || "Let's log today's progress 💪"}
          </p>
        </motion.div>

        {/* Quick Action Buttons */}
        <div className="flex gap-3 justify-center mb-6">
          <Link
            href="/workout"
            className="flex-1 max-w-[140px] p-4 bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 border border-primary/50 rounded-2xl transition-all active:scale-95"
          >
            <Dumbbell className="text-primary mx-auto mb-2" size={28} />
            <p className="text-sm font-semibold text-primary">Workout</p>
          </Link>
          <Link
            href="/nutrition"
            className="flex-1 max-w-[140px] p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 hover:from-secondary/30 hover:to-secondary/10 border border-secondary/50 rounded-2xl transition-all active:scale-95"
          >
            <Apple className="text-secondary mx-auto mb-2" size={28} />
            <p className="text-sm font-semibold text-secondary">Nutrition</p>
          </Link>
          <Link
            href="/recovery"
            className="flex-1 max-w-[140px] p-4 bg-gradient-to-br from-accent/20 to-accent/5 hover:from-accent/30 hover:to-accent/10 border border-accent/50 rounded-2xl transition-all active:scale-95"
          >
            <Moon className="text-accent mx-auto mb-2" size={28} />
            <p className="text-sm font-semibold text-accent">Sleep</p>
          </Link>
        </div>
      </div>

      {/* Today's Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Strength Index */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl border border-primary/30 text-center"
        >
          <Target className="text-primary mx-auto mb-2" size={24} />
          <p className="text-2xl font-mono font-bold">{data.strengthIndex}</p>
          <p className="text-xs text-muted">SI Index</p>
        </motion.div>

        {/* Recovery Score */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl border border-accent/30 text-center"
        >
          <Zap className="text-accent mx-auto mb-2" size={24} />
          <p className="text-2xl font-mono font-bold">{data.recoveryScore}</p>
          <p className="text-xs text-muted">Recovery</p>
        </motion.div>

        {/* Weekly Volume */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="p-4 bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl border border-secondary/30 text-center"
        >
          <Award className="text-secondary mx-auto mb-2" size={24} />
          <p className="text-2xl font-mono font-bold">{Math.round(data.weeklyVolume / 1000)}k</p>
          <p className="text-xs text-muted">Volume</p>
        </motion.div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            layout
            className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-neutral overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-background/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-${section.color}/20 border border-${section.color}/30`}
                >
                  <section.icon className={`text-${section.color}`} size={20} />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{section.title}</p>
                  <p className="text-xs text-muted">
                    {section.id === 'workout' &&
                      (data.todayWorkout ? 'Logged today ✓' : 'Not logged')}
                    {section.id === 'nutrition' &&
                      `${data.todayNutrition || 0} calories logged`}
                    {section.id === 'sleep' &&
                      (data.todaySleep ? `${data.todaySleep}h logged` : 'Not logged')}
                    {section.id === 'insights' && 'View analytics'}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: section.expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="text-muted" size={20} />
              </motion.div>
            </button>

            {/* Expandable Content */}
            <AnimatePresence>
              {section.expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-neutral"
                >
                  <div className="p-4">
                    {section.id === 'workout' && (
                      <div className="space-y-3">
                        <Link
                          href="/workout"
                          className="block p-4 bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Start Session</span>
                            <ChevronRight className="text-primary" size={20} />
                          </div>
                        </Link>
                        <Link
                          href="/log"
                          className="block p-4 bg-background hover:bg-neutral rounded-xl border border-neutral transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Quick Log</span>
                            <ChevronRight className="text-muted" size={20} />
                          </div>
                        </Link>
                      </div>
                    )}

                    {section.id === 'nutrition' && (
                      <div className="space-y-3">
                        <Link
                          href="/nutrition"
                          className="block p-4 bg-secondary/10 hover:bg-secondary/20 rounded-xl border border-secondary/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Log Food</span>
                            <ChevronRight className="text-secondary" size={20} />
                          </div>
                        </Link>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-lg font-mono font-bold">{data.todayNutrition}</p>
                            <p className="text-xs text-muted">Calories</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-lg font-mono font-bold">--</p>
                            <p className="text-xs text-muted">Protein</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg">
                            <p className="text-lg font-mono font-bold">--</p>
                            <p className="text-xs text-muted">Carbs</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'sleep' && (
                      <div className="space-y-3">
                        <Link
                          href="/recovery"
                          className="block p-4 bg-accent/10 hover:bg-accent/20 rounded-xl border border-accent/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Log Sleep</span>
                            <ChevronRight className="text-accent" size={20} />
                          </div>
                        </Link>
                        <div className="p-4 bg-background rounded-xl">
                          <p className="text-sm text-muted mb-2">Recovery Score</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-accent to-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${data.recoveryScore}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                            <span className="font-mono font-bold text-lg">
                              {data.recoveryScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.id === 'insights' && (
                      <div className="space-y-3">
                        <Link
                          href="/insights"
                          className="block p-4 bg-primary/10 hover:bg-primary/20 rounded-xl border border-primary/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">View Analytics</span>
                            <ChevronRight className="text-primary" size={20} />
                          </div>
                        </Link>
                        <Link
                          href="/chat"
                          className="block p-4 bg-background hover:bg-neutral rounded-xl border border-neutral transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">Chat with Raptor</span>
                            <ChevronRight className="text-muted" size={20} />
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Social Crew Section */}
      <Link
        href="/social"
        className="block p-6 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl border border-primary/30 hover:border-primary/50 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-background rounded-xl">
            <Users className="text-primary" size={28} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold font-heading text-lg">Training Crews</h3>
            <p className="text-sm text-muted">Share progress with your crew</p>
          </div>
          <ChevronRight className="text-muted" size={24} />
        </div>
      </Link>
    </div>
  );
}
