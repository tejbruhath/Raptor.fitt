'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown, Droplets, Check, X } from 'lucide-react';

const FEELINGS = [
  { value: 'great', label: '😊 Great', icon: Smile, color: 'positive' },
  { value: 'good', label: '🙂 Good', icon: Smile, color: 'primary' },
  { value: 'okay', label: '😐 Okay', icon: Meh, color: 'warning' },
  { value: 'tired', label: '😮‍💨 Tired', icon: Frown, color: 'secondary' },
  { value: 'exhausted', label: '😫 Exhausted', icon: Frown, color: 'negative' },
] as const;

const DEFAULT_HABITS = [
  { name: 'Drink 3L water', completed: false },
  { name: 'Morning stretch', completed: false },
  { name: 'Track meals', completed: false },
  { name: 'Get sunlight', completed: false },
];

interface DailyCheckInProps {
  onComplete?: (data: any) => void;
}

export function DailyCheckIn({ onComplete }: DailyCheckInProps) {
  const [step, setStep] = useState(1);
  const [feeling, setFeeling] = useState<typeof FEELINGS[number]['value']>('good');
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [waterIntake, setWaterIntake] = useState(false);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleHabit = (index: number) => {
    setHabits((prev) =>
      prev.map((habit, i) =>
        i === index ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const checkInData = {
      date: new Date().toISOString().split('T')[0],
      feeling,
      mood,
      energy,
      motivation,
      waterIntake,
      habits,
      notes,
    };

    try {
      await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData),
      });

      onComplete?.(checkInData);
    } catch (error) {
      console.error('Failed to save check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-all ${
              s <= step
                ? 'bg-gradient-to-r from-primary to-secondary'
                : 'bg-background'
            }`}
          />
        ))}
      </div>

      {/* Step 1: How do you feel? */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading mb-2">How do you feel today?</h2>
            <p className="text-muted">Quick 10-second check-in</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FEELINGS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFeeling(f.value)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  feeling === f.value
                    ? `border-${f.color} bg-${f.color}/10`
                    : 'border-neutral bg-surface hover:bg-neutral'
                }`}
              >
                <div className="text-4xl mb-2">{f.label.split(' ')[0]}</div>
                <p className="text-sm font-semibold">{f.label.split(' ')[1]}</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all"
          >
            Next
          </button>
        </motion.div>
      )}

      {/* Step 2: Rate your day */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading mb-2">Rate your day</h2>
            <p className="text-muted">How are you really doing?</p>
          </div>

          <div className="bg-surface/80 rounded-2xl p-6 space-y-6">
            {/* Mood */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm">Mood</label>
                <div className="flex items-center gap-2">
                  {mood <= 3 && <span className="text-negative">😔</span>}
                  {mood > 3 && mood <= 7 && <span className="text-warning">😐</span>}
                  {mood > 7 && <span className="text-positive">😊</span>}
                  <span className="text-xl font-mono font-bold">{mood}</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-secondary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Energy */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm">Energy</label>
                <div className="flex items-center gap-2">
                  {energy <= 3 && <span className="text-negative">🔋</span>}
                  {energy > 3 && energy <= 7 && <span className="text-warning">⚡</span>}
                  {energy > 7 && <span className="text-positive">⚡⚡</span>}
                  <span className="text-xl font-mono font-bold">{energy}</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-accent [&::-webkit-slider-thumb]:to-primary [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Motivation */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm">Motivation</label>
                <div className="flex items-center gap-2">
                  {motivation <= 3 && <span className="text-negative">😴</span>}
                  {motivation > 3 && motivation <= 7 && <span className="text-warning">💪</span>}
                  {motivation > 7 && <span className="text-positive">🔥</span>}
                  <span className="text-xl font-mono font-bold">{motivation}</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motivation}
                onChange={(e) => setMotivation(parseInt(e.target.value))}
                className="w-full h-3 bg-background rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-secondary [&::-webkit-slider-thumb]:to-accent [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Microhabits */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading mb-2">Daily Habits</h2>
            <p className="text-muted">Did you complete these today?</p>
          </div>

          <div className="bg-surface/80 rounded-2xl p-6 space-y-4">
            {/* Water Intake */}
            <button
              onClick={() => setWaterIntake(!waterIntake)}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                waterIntake
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral bg-background hover:bg-neutral'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                waterIntake ? 'bg-primary' : 'bg-background'
              }`}>
                {waterIntake ? (
                  <Check className="text-background" size={20} />
                ) : (
                  <Droplets className="text-muted" size={20} />
                )}
              </div>
              <span className="flex-1 text-left font-semibold">Drank enough water</span>
            </button>

            {/* Other Habits */}
            {habits.map((habit, index) => (
              <button
                key={index}
                onClick={() => toggleHabit(index)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  habit.completed
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral bg-background hover:bg-neutral'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  habit.completed ? 'bg-primary' : 'bg-background'
                }`}>
                  {habit.completed && <Check className="text-background" size={20} />}
                </div>
                <span className="flex-1 text-left font-semibold">{habit.name}</span>
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-muted block mb-2">Anything else? (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes, observations, wins..."
              className="w-full bg-surface border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-background font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete Check-In'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
