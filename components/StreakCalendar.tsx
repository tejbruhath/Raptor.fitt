"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakCalendarProps {
  workoutDates: string[]; // Array of ISO date strings
  currentStreak: number;
  longestStreak: number;
}

export default function StreakCalendar({
  workoutDates,
  currentStreak,
  longestStreak,
}: StreakCalendarProps) {
  // Generate last 90 days
  const today = new Date();
  const days: Date[] = [];
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }

  const workoutDateSet = new Set(
    workoutDates.map(d => new Date(d).toDateString())
  );

  const getIntensity = (date: Date): number => {
    const dateStr = date.toDateString();
    if (workoutDateSet.has(dateStr)) {
      return 1;
    }
    return 0;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Group days by week
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  // Add empty cells for days before the first date
  const firstDayOfWeek = days[0].getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(new Date(0)); // Placeholder
  }

  days.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(new Date(0)); // Placeholder
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-heading font-bold">Workout Streak</h3>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-primary flex items-center gap-2">
              <Flame className="w-6 h-6 text-warning" />
              {currentStreak}
            </p>
            <p className="text-xs text-muted">Current Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold font-mono text-muted">
              {longestStreak}
            </p>
            <p className="text-xs text-muted">Longest Streak</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(name => (
              <div key={name} className="text-xs text-muted text-center w-8">
                {name[0]}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  const isPlaceholder = day.getTime() === 0;
                  const intensity = isPlaceholder ? 0 : getIntensity(day);
                  const isToday = !isPlaceholder && day.toDateString() === today.toDateString();

                  return (
                    <motion.div
                      key={dayIndex}
                      whileHover={{ scale: isPlaceholder ? 1 : 1.2 }}
                      title={
                        isPlaceholder
                          ? ''
                          : `${day.toLocaleDateString()} ${intensity > 0 ? '✓ Workout' : ''}`
                      }
                      className={`w-8 h-8 rounded-md transition-all ${
                        isPlaceholder
                          ? 'bg-transparent'
                          : intensity > 0
                          ? 'bg-primary cursor-pointer'
                          : 'bg-surface/30'
                      } ${isToday ? 'ring-2 ring-warning' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Month markers */}
          <div className="flex justify-between mt-4 text-xs text-muted">
            {[0, 30, 60].map(offset => {
              const markerDate = new Date(today);
              markerDate.setDate(today.getDate() - (89 - offset));
              return (
                <span key={offset}>
                  {monthNames[markerDate.getMonth()]}
                </span>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted">
            <span>Less</span>
            <div className="w-4 h-4 rounded-sm bg-surface/30" />
            <div className="w-4 h-4 rounded-sm bg-primary/50" />
            <div className="w-4 h-4 rounded-sm bg-primary" />
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
