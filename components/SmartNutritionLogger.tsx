'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, Scale, Utensils, X, Check } from 'lucide-react';
import { detectFood, scaleMacros, searchFoods, getCategoryEmoji, parseQuickAdd } from '@/lib/utils/smartFoodDetection';
import type { FoodItem, ScaledMacros } from '@/lib/utils/smartFoodDetection';
import { useHoverCapability } from '@/lib/hooks/useHoverCapability';

interface SmartNutritionLoggerProps {
  onSave: (data: NutritionLog) => void;
  onCancel: () => void;
}

interface NutritionLog {
  type: 'smart' | 'manual';
  foodName: string;
  quantity: number;
  unit: string;
  macros: ScaledMacros;
  mealType?: string;
}

export default function SmartNutritionLogger({ onSave, onCancel }: SmartNutritionLoggerProps) {
  const canHover = useHoverCapability();
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');
  const [input, setInput] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [detectedFood, setDetectedFood] = useState<FoodItem | null>(null);
  const [scaledMacros, setScaledMacros] = useState<ScaledMacros | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);

  // Manual mode fields
  const [manualMeal, setManualMeal] = useState('');
  const [manualProtein, setManualProtein] = useState<number>(0);
  const [manualCarbs, setManualCarbs] = useState<number>(0);
  const [manualFats, setManualFats] = useState<number>(0);

  // Detect food as user types
  useEffect(() => {
    if (!input.trim()) {
      setDetectedFood(null);
      setScaledMacros(null);
      setMode('smart');
      return;
    }

    // Try quick-add parse first (e.g., "chicken 200")
    const quickParse = parseQuickAdd(input);
    if (quickParse) {
      setDetectedFood(quickParse.food);
      setQuantity(quickParse.quantity);
      const macros = scaleMacros(quickParse.food, quickParse.quantity);
      setScaledMacros(macros);
      setMode('smart');
      return;
    }

    // Regular food detection
    const food = detectFood(input);
    
    if (food) {
      setDetectedFood(food);
      const macros = scaleMacros(food, quantity);
      setScaledMacros(macros);
      setMode('smart');
    } else {
      setDetectedFood(null);
      setScaledMacros(null);
      // Switch to manual if it looks like a meal name
      const mealNames = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (mealNames.some(meal => input.toLowerCase().includes(meal))) {
        setMode('manual');
        setManualMeal(input);
      }
    }

    // Update suggestions
    const results = searchFoods(input);
    setSuggestions(results.slice(0, 5));
  }, [input, quantity]);

  // Recalculate macros when quantity changes
  useEffect(() => {
    if (detectedFood) {
      const macros = scaleMacros(detectedFood, quantity);
      setScaledMacros(macros);
    }
  }, [quantity, detectedFood]);

  function handleSave() {
    if (mode === 'smart' && detectedFood && scaledMacros) {
      onSave({
        type: 'smart',
        foodName: detectedFood.name,
        quantity,
        unit: detectedFood.unit,
        macros: scaledMacros,
      });
    } else if (mode === 'manual') {
      const calories = manualProtein * 4 + manualCarbs * 4 + manualFats * 9;
      onSave({
        type: 'manual',
        foodName: manualMeal || input,
        quantity: 1,
        unit: 'serving',
        macros: {
          protein: manualProtein,
          carbs: manualCarbs,
          fats: manualFats,
          calories: Math.round(calories),
        },
        mealType: manualMeal,
      });
    }
  }

  function selectSuggestion(food: FoodItem) {
    setInput(food.name);
    setDetectedFood(food);
    setShowSuggestions(false);
  }

  const canSave = mode === 'smart' 
    ? (detectedFood && quantity > 0)
    : (manualProtein > 0 || manualCarbs > 0 || manualFats > 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card max-w-lg w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold">Log Nutrition</h2>
            <p className="text-xs text-muted">
              {mode === 'smart' ? '⚡ Smart Mode' : '✍️ Manual Entry'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-lg transition-colors hover-device:hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('smart')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            mode === 'smart'
              ? 'bg-primary text-background'
              : 'bg-surface text-muted hover-device:hover:bg-surface/70'
          }`}
        >
          ⚡ Smart
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
            mode === 'manual'
              ? 'bg-primary text-background'
              : 'bg-surface text-muted hover-device:hover:bg-surface/70'
          }`}
        >
          ✍️ Manual
        </button>
      </div>

      {/* Input Field */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={mode === 'smart' ? "Type food name (e.g., 'chicken 200g')" : "Meal name..."}
            className="input w-full pl-10"
            autoFocus
          />
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && input.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-lg overflow-hidden z-10 shadow-lg"
            >
              {suggestions.map((food) => (
                <button
                  key={food.name}
                  onClick={() => selectSuggestion(food)}
                  className="w-full text-left p-3 transition-colors hover-device:hover:bg-primary/20 border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryEmoji(food.category)}</span>
                      <span className="font-semibold">{food.name}</span>
                    </div>
                    <span className="text-xs text-muted">{food.unit}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Smart Mode - Detected Food */}
      <AnimatePresence mode="wait">
        {mode === 'smart' && detectedFood && (
          <motion.div
            key="smart-mode"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Food Info Card */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Food Detected</span>
              </div>
              <p className="text-lg font-bold capitalize">{detectedFood.name}</p>
              <p className="text-xs text-muted">Base: {detectedFood.unit}</p>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="text-sm text-muted mb-2 block flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Quantity (g)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input w-full text-center text-2xl font-mono font-bold"
                min="1"
                step="10"
              />
            </div>

            {/* Auto-Filled Macros */}
            {scaledMacros && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted mb-1">Protein</p>
                  <p className="text-2xl font-bold font-mono text-primary">{scaledMacros.protein}g</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-xs text-muted mb-1">Carbs</p>
                  <p className="text-2xl font-bold font-mono text-warning">{scaledMacros.carbs}g</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="text-xs text-muted mb-1">Fats</p>
                  <p className="text-2xl font-bold font-mono text-accent">{scaledMacros.fats}g</p>
                </div>
                <div className="p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                  <p className="text-xs text-muted mb-1">Calories</p>
                  <p className="text-2xl font-bold font-mono text-secondary">{scaledMacros.calories}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <motion.div
            key="manual-mode"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-muted mb-2 block">Meal Name</label>
              <input
                type="text"
                value={manualMeal || input}
                onChange={(e) => setManualMeal(e.target.value)}
                placeholder="e.g., Breakfast"
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-primary mb-2 block">Protein (g)</label>
                <input
                  type="number"
                  value={manualProtein || ''}
                  onChange={(e) => setManualProtein(Number(e.target.value))}
                  className="input w-full text-center"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm text-warning mb-2 block">Carbs (g)</label>
                <input
                  type="number"
                  value={manualCarbs || ''}
                  onChange={(e) => setManualCarbs(Number(e.target.value))}
                  className="input w-full text-center"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="text-sm text-accent mb-2 block">Fats (g)</label>
                <input
                  type="number"
                  value={manualFats || ''}
                  onChange={(e) => setManualFats(Number(e.target.value))}
                  className="input w-full text-center"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Calculated Calories */}
            <div className="p-3 bg-surface/50 rounded-lg text-center">
              <p className="text-xs text-muted mb-1">Total Calories</p>
              <p className="text-3xl font-bold font-mono gradient-text">
                {Math.round(manualProtein * 4 + manualCarbs * 4 + manualFats * 9)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 btn-ghost"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex-1 btn-primary flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          Save
        </button>
      </div>
    </motion.div>
  );
}
