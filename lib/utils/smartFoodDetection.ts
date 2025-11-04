import foodsData from '@/data/foods.json';

export interface FoodItem {
  name: string;
  aliases: string[];
  unit: string;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
  category: 'protein' | 'carbs' | 'fats';
  color: 'primary' | 'warning' | 'accent';
}

export interface ScaledMacros {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
}

/**
 * Detects if the input matches a known food item
 * @param input User's search query
 * @returns Matched food item or null
 */
export function detectFood(input: string): FoodItem | null {
  if (!input || input.trim().length < 2) return null;

  const searchTerm = input.toLowerCase().trim();
  
  // Check if it's a meal name (breakfast, lunch, dinner, etc.)
  const mealNames = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];
  if (mealNames.some(meal => searchTerm.includes(meal))) {
    return null; // Return null for meal names - use manual mode
  }

  // Search for matching food
  const match = foodsData.find(food => {
    // Exact match
    if (food.name.toLowerCase() === searchTerm) return true;
    
    // Partial match in name
    if (food.name.toLowerCase().includes(searchTerm)) return true;
    
    // Match in aliases
    return food.aliases.some(alias => 
      alias.toLowerCase().includes(searchTerm) || 
      searchTerm.includes(alias.toLowerCase())
    );
  });

  return match as FoodItem | null;
}

/**
 * Scales macros based on quantity
 * @param baseFood The food item with base macros
 * @param quantity Quantity in grams or units
 * @returns Scaled macros
 */
export function scaleMacros(baseFood: FoodItem, quantity: number): ScaledMacros {
  // Extract base quantity from unit string (e.g., "100g" -> 100)
  const baseQty = parseFloat(baseFood.unit.match(/\d+/)?.[0] || '100');
  
  const factor = quantity / baseQty;

  return {
    protein: parseFloat((baseFood.macros.protein * factor).toFixed(1)),
    carbs: parseFloat((baseFood.macros.carbs * factor).toFixed(1)),
    fats: parseFloat((baseFood.macros.fats * factor).toFixed(1)),
    calories: Math.round(baseFood.macros.calories * factor),
  };
}

/**
 * Get all food items for autocomplete
 */
export function getAllFoods(): FoodItem[] {
  return foodsData as FoodItem[];
}

/**
 * Search foods with fuzzy matching
 * @param query Search query
 * @returns Array of matching foods
 */
export function searchFoods(query: string): FoodItem[] {
  if (!query || query.trim().length < 1) return getAllFoods();

  const searchTerm = query.toLowerCase().trim();
  
  return foodsData.filter(food => {
    // Name match
    if (food.name.toLowerCase().includes(searchTerm)) return true;
    
    // Alias match
    return food.aliases.some(alias => alias.toLowerCase().includes(searchTerm));
  }) as FoodItem[];
}

/**
 * Get category color for UI
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'protein':
      return 'text-primary';
    case 'carbs':
      return 'text-warning';
    case 'fats':
      return 'text-accent';
    default:
      return 'text-white';
  }
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'protein':
      return '🟢'; // Green for protein
    case 'carbs':
      return '🟡'; // Yellow for carbs
    case 'fats':
      return '🔴'; // Red for fats
    default:
      return '⚪';
  }
}

/**
 * Parse quick-add format like "chicken 200g" or "eggs 3"
 * @param input Quick add string
 * @returns Parsed food and quantity or null
 */
export function parseQuickAdd(input: string): { food: FoodItem; quantity: number } | null {
  // Patterns: "chicken 200", "eggs 3", "200 chicken", "3 eggs"
  const match = input.match(/^([\w\s]+?)\s*(\d+\.?\d*)\s*(g|kg|ml|scoop|piece|pieces)?$/i) ||
                input.match(/^(\d+\.?\d*)\s*(g|kg|ml|scoop|piece|pieces)?\s*([\w\s]+)$/i);
  
  if (!match) return null;

  let foodName: string;
  let qty: number;

  if (match[1] && isNaN(Number(match[1]))) {
    // Format: "chicken 200"
    foodName = match[1].trim();
    qty = parseFloat(match[2]);
  } else {
    // Format: "200 chicken"
    qty = parseFloat(match[1]);
    foodName = match[3]?.trim() || '';
  }

  const food = detectFood(foodName);
  if (!food) return null;

  // Handle units
  const unit = match[3]?.toLowerCase();
  if (unit === 'kg') qty *= 1000;

  return { food, quantity: qty };
}
