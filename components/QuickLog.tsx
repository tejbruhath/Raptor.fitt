'use client';

import { useState } from 'react';
import { Send, Loader2, Dumbbell, Apple } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { useNutritionStore } from '@/lib/store/nutritionStore';
import { parseWorkoutInput, parseNutritionInput } from '@/lib/ai/geminiService';

type LogType = 'workout' | 'nutrition';

interface QuickLogProps {
  type: LogType;
  onSubmit?: (data: any) => void;
  className?: string;
}

export function QuickLog({ type, onSubmit, className = '' }: QuickLogProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);

  const { setQuickLogInput: setWorkoutInput, addExercise } = useWorkoutStore();
  const { setQuickLogInput: setNutritionInput, addMeal } = useNutritionStore();

  const handleParse = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setError(null);
    setParsedData(null);

    try {
      if (type === 'workout') {
        const parsed = await parseWorkoutInput(text);
        if (parsed) {
          setParsedData(parsed);
        } else {
          setError('Could not understand workout. Try: "bench 80 3 10"');
        }
      } else {
        const parsed = await parseNutritionInput(text);
        if (parsed) {
          setParsedData(parsed);
        } else {
          setError('Could not understand food. Try: "chicken 200g"');
        }
      }
    } catch (err) {
      setError('Failed to parse input. Please try again.');
      console.error('Parse error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) return;

    try {
      if (type === 'workout') {
        const exercise = {
          id: Date.now().toString(),
          name: parsedData.exercise,
          muscleGroup: parsedData.muscleGroup || 'unknown',
          sets: Array.from({ length: parsedData.sets }, () => ({
            reps: parsedData.reps,
            weight: parsedData.weight,
            rpe: parsedData.rpe,
            timestamp: new Date(),
            completed: true,
          })),
        };
        addExercise(exercise);
        onSubmit?.(exercise);
      } else {
        const meal = {
          id: Date.now().toString(),
          name: parsedData.foodName,
          calories: parsedData.calories || 0,
          protein: parsedData.protein || 0,
          carbs: parsedData.carbs || 0,
          fats: parsedData.fats || 0,
          timestamp: new Date(),
          type: 'smart' as const,
          foodName: parsedData.foodName,
          quantity: parsedData.quantity,
          unit: parsedData.unit,
        };
        addMeal(meal);
        onSubmit?.(meal);
      }

      // Reset
      setInput('');
      setParsedData(null);
      setError(null);
    } catch (err) {
      setError('Failed to save. Please try again.');
      console.error('Submit error:', err);
    }
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setInput(transcript);
    await handleParse(transcript);
  };

  return (
    <div className={`bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-neutral ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {type === 'workout' ? (
          <Dumbbell className="text-primary" size={24} />
        ) : (
          <Apple className="text-secondary" size={24} />
        )}
        <h3 className="text-xl font-bold font-heading">
          Quick Log {type === 'workout' ? 'Workout' : 'Nutrition'}
        </h3>
      </div>

      {/* Input Area */}
      <div className="space-y-4">
        {/* Text Input */}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isProcessing) {
                handleParse(input);
              }
            }}
            placeholder={
              type === 'workout'
                ? 'e.g., "bench 80 3 10" or "squat 100kg 5x5"'
                : 'e.g., "chicken 200g" or "rice 150"'
            }
            className="w-full bg-background border border-neutral rounded-xl px-4 py-3 pr-12 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={isProcessing}
          />
          <button
            onClick={() => handleParse(input)}
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
              <Loader2 size={20} className="text-background animate-spin" />
            ) : (
              <Send size={20} className="text-background" />
            )}
          </button>
        </div>

        {/* Voice Input */}
        <div className="flex justify-center py-2">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            placeholder={type === 'workout' ? 'Say: bench 80 3 10' : 'Say: chicken 200g'}
            size="md"
          />
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-negative/20 border border-negative rounded-lg text-negative text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parsed Data Preview */}
        <AnimatePresence>
          {parsedData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-primary/10 border border-primary rounded-xl space-y-3"
            >
              {type === 'workout' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">Exercise:</span>
                    <span className="text-white font-semibold">{parsedData.exercise}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted text-xs block">Weight</span>
                      <span className="text-white font-mono text-lg">{parsedData.weight}kg</span>
                    </div>
                    <div>
                      <span className="text-muted text-xs block">Sets</span>
                      <span className="text-white font-mono text-lg">{parsedData.sets}</span>
                    </div>
                    <div>
                      <span className="text-muted text-xs block">Reps</span>
                      <span className="text-white font-mono text-lg">{parsedData.reps}</span>
                    </div>
                  </div>
                  {parsedData.rpe && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted text-sm">RPE:</span>
                      <span className="text-white font-semibold">{parsedData.rpe}/10</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">Food:</span>
                    <span className="text-white font-semibold">{parsedData.foodName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted text-sm">Amount:</span>
                    <span className="text-white font-semibold">
                      {parsedData.quantity}{parsedData.unit}
                    </span>
                  </div>
                  {parsedData.calories && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-primary/30">
                      <div>
                        <span className="text-muted text-xs block">Cal</span>
                        <span className="text-white font-mono text-sm">{parsedData.calories}</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">P</span>
                        <span className="text-white font-mono text-sm">{parsedData.protein}g</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">C</span>
                        <span className="text-white font-mono text-sm">{parsedData.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-muted text-xs block">F</span>
                        <span className="text-white font-mono text-sm">{parsedData.fats}g</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full mt-3 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all active:scale-[0.98]"
              >
                Add to {type === 'workout' ? 'Workout' : 'Nutrition'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Examples */}
        {!parsedData && !isProcessing && (
          <div className="flex flex-wrap gap-2">
            {type === 'workout' ? (
              <>
                <button
                  onClick={() => setInput('bench 80 3 10')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  bench 80 3 10
                </button>
                <button
                  onClick={() => setInput('squat 100 5 5')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  squat 100 5 5
                </button>
                <button
                  onClick={() => setInput('deadlift 140 3 8')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  deadlift 140 3 8
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setInput('chicken 200g')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  chicken 200g
                </button>
                <button
                  onClick={() => setInput('rice 150g')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  rice 150g
                </button>
                <button
                  onClick={() => setInput('protein shake 300ml')}
                  className="text-xs px-3 py-1.5 bg-background hover:bg-neutral border border-neutral rounded-lg text-muted hover:text-white transition-all"
                >
                  protein shake 300ml
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
