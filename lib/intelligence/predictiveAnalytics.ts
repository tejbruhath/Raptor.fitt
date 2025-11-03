/**
 * Predictive Analytics 2.0
 * Uses EWMA (Exponential Weighted Moving Average) for smoother predictions
 * Includes confidence intervals for volatility visualization
 */

interface DataPoint {
  date: string;
  value: number;
}

interface PredictionResult {
  predicted: DataPoint[];
  observed: DataPoint[];
  future: DataPoint[];
  confidence: {
    upper: DataPoint[];
    lower: DataPoint[];
  };
  currentSI: number;
  projectedSI: number;
  weeklyGrowth: number;
  volatility: number;
  confidence_score: number; // 0-100, higher = more confident
}

/**
 * Calculate EWMA (Exponential Weighted Moving Average)
 * Alpha determines smoothing: 0.3 = more smooth, 0.7 = more reactive
 */
function calculateEWMA(data: number[], alpha: number = 0.3): number[] {
  if (data.length === 0) return [];
  
  const ewma: number[] = [data[0]];
  
  for (let i = 1; i < data.length; i++) {
    const smoothed = alpha * data[i] + (1 - alpha) * ewma[i - 1];
    ewma.push(smoothed);
  }
  
  return ewma;
}

/**
 * Calculate standard deviation for confidence intervals
 */
function calculateStdDev(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

/**
 * Calculate linear regression for trend
 */
function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

/**
 * Enhanced prediction with EWMA smoothing and confidence intervals
 */
export function predictGrowthWithConfidence(
  historicalData: DataPoint[],
  futureDays: number = 45
): PredictionResult {
  if (historicalData.length < 3) {
    throw new Error('Need at least 3 data points for prediction');
  }

  // Extract values and dates
  const values = historicalData.map(d => d.value);
  const dates = historicalData.map(d => d.date);
  
  // Apply EWMA smoothing (alpha = 0.3 for smooth progression)
  const smoothedValues = calculateEWMA(values, 0.3);
  
  // Calculate linear trend from smoothed data
  const { slope, intercept } = linearRegression(smoothedValues);
  
  // Calculate volatility (standard deviation of residuals)
  const residuals = smoothedValues.map((v, i) => v - (intercept + slope * i));
  const stdDev = calculateStdDev(residuals);
  
  // Generate predicted values (expected trend line)
  const predicted: DataPoint[] = historicalData.map((d, i) => ({
    date: d.date,
    value: intercept + slope * i,
  }));
  
  // Observed values (actual with EWMA smoothing)
  const observed: DataPoint[] = historicalData.map((d, i) => ({
    date: d.date,
    value: smoothedValues[i],
  }));
  
  // Future predictions
  const lastValue = smoothedValues[smoothedValues.length - 1];
  const lastDate = new Date(dates[dates.length - 1]);
  const future: DataPoint[] = [];
  const upperBound: DataPoint[] = [];
  const lowerBound: DataPoint[] = [];
  
  for (let i = 1; i <= futureDays; i++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + i);
    
    // Use EWMA trend for future prediction
    const trendValue = intercept + slope * (values.length + i - 1);
    
    // Confidence interval widens over time (sqrt of time for uncertainty growth)
    const uncertaintyFactor = Math.sqrt(i / 7); // Weekly basis
    const confidenceMultiplier = 1.96; // 95% confidence interval
    
    future.push({
      date: futureDate.toISOString(),
      value: Math.max(50, trendValue), // Floor at 50
    });
    
    upperBound.push({
      date: futureDate.toISOString(),
      value: Math.max(50, trendValue + confidenceMultiplier * stdDev * uncertaintyFactor),
    });
    
    lowerBound.push({
      date: futureDate.toISOString(),
      value: Math.max(50, trendValue - confidenceMultiplier * stdDev * uncertaintyFactor),
    });
  }
  
  // Calculate confidence score (0-100)
  // Lower volatility + more data points = higher confidence
  const volatilityScore = Math.max(0, 100 - (stdDev / lastValue) * 100);
  const dataScore = Math.min(100, (historicalData.length / 30) * 100); // 30 days = 100%
  const confidence_score = Math.round((volatilityScore * 0.6 + dataScore * 0.4));
  
  // Weekly growth rate
  const weeklyGrowth = slope * 7; // slope is per-day
  
  return {
    predicted,
    observed,
    future,
    confidence: {
      upper: upperBound,
      lower: lowerBound,
    },
    currentSI: lastValue,
    projectedSI: future[future.length - 1].value,
    weeklyGrowth,
    volatility: stdDev,
    confidence_score,
  };
}

/**
 * Detect if user needs deload (SI < expected trend by significant margin)
 */
export function detectDeloadNeed(
  currentSI: number,
  expectedSI: number,
  threshold: number = 0.1 // 10% below expected
): { needsDeload: boolean; reason: string } {
  const deviation = (expectedSI - currentSI) / expectedSI;
  
  if (deviation > threshold) {
    return {
      needsDeload: true,
      reason: `SI is ${(deviation * 100).toFixed(1)}% below expected trend. Consider a deload week.`,
    };
  }
  
  return {
    needsDeload: false,
    reason: 'Progress is on track',
  };
}

/**
 * Calculate fatigue factor based on training intensity
 * Returns 0.6-1.0 multiplier for recommendations
 */
export function calculateFatigueFactor(
  recentWorkouts: number,
  avgIntensity: number, // 0-10 scale
  recoveryScore: number // 0-100
): number {
  // More workouts = more fatigue
  const frequencyFactor = Math.max(0.6, 1 - (recentWorkouts / 7) * 0.1);
  
  // Higher intensity = more fatigue
  const intensityFactor = Math.max(0.7, 1 - (avgIntensity / 10) * 0.2);
  
  // Lower recovery = more fatigue
  const recoveryFactor = recoveryScore / 100;
  
  // Weighted combination
  return (frequencyFactor * 0.3 + intensityFactor * 0.3 + recoveryFactor * 0.4);
}
