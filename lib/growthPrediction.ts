import { linearRegression, linearRegressionLine } from 'simple-statistics';

export interface GrowthDataPoint {
  date: Date;
  value: number;
}

export interface GrowthPrediction {
  expected: GrowthDataPoint[];
  observed: GrowthDataPoint[];
  futureProjection: GrowthDataPoint[];
  rSquared: number;
  slope: number;
  intercept: number;
  anomalies: {
    date: Date;
    observed: number;
    expected: number;
    deviation: number;
    deviationPercent: number;
  }[];
}

/**
 * Calculate expected growth curve using linear regression
 * @param dataPoints Historical data points (Strength Index over time)
 * @param futureDays Number of days to project into future
 * @returns Growth prediction with expected vs observed comparison
 */
export function calculateExpectedGrowthCurve(
  dataPoints: GrowthDataPoint[],
  futureDays: number = 30
): GrowthPrediction {
  if (dataPoints.length < 2) {
    return {
      expected: [],
      observed: dataPoints,
      futureProjection: [],
      rSquared: 0,
      slope: 0,
      intercept: 0,
      anomalies: [],
    };
  }

  // Sort by date
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Convert dates to days since start (x-axis)
  const startTime = sorted[0].date.getTime();
  const dataForRegression = sorted.map((point) => {
    const daysSinceStart = (point.date.getTime() - startTime) / (1000 * 60 * 60 * 24);
    return [daysSinceStart, point.value];
  });

  // Perform linear regression
  const regression = linearRegression(dataForRegression);
  const predict = linearRegressionLine(regression);

  // Calculate R-squared
  const meanY = sorted.reduce((sum, p) => sum + p.value, 0) / sorted.length;
  const ssTotal = sorted.reduce((sum, p) => sum + Math.pow(p.value - meanY, 2), 0);
  const ssResidual = dataForRegression.reduce(
    (sum, [x, y]) => sum + Math.pow(y - predict(x), 2),
    0
  );
  const rSquared = 1 - ssResidual / ssTotal;

  // Generate expected values for observed dates
  const expected = sorted.map((point) => {
    const daysSinceStart = (point.date.getTime() - startTime) / (1000 * 60 * 60 * 24);
    return {
      date: point.date,
      value: predict(daysSinceStart),
    };
  });

  // Detect anomalies (deviations > 10% from expected)
  const anomalies = sorted
    .map((point, i) => {
      const expectedValue = expected[i].value;
      const observedValue = point.value;
      const deviation = observedValue - expectedValue;
      const deviationPercent = (deviation / expectedValue) * 100;

      if (Math.abs(deviationPercent) > 10) {
        return {
          date: point.date,
          observed: observedValue,
          expected: expectedValue,
          deviation,
          deviationPercent,
        };
      }
      return null;
    })
    .filter((a) => a !== null) as GrowthPrediction['anomalies'];

  // Project future values
  const lastDay = (sorted[sorted.length - 1].date.getTime() - startTime) / (1000 * 60 * 60 * 24);
  const futureProjection: GrowthDataPoint[] = [];

  for (let i = 1; i <= futureDays; i++) {
    const futureDay = lastDay + i;
    const futureDate = new Date(startTime + futureDay * 1000 * 60 * 60 * 24);
    futureProjection.push({
      date: futureDate,
      value: predict(futureDay),
    });
  }

  return {
    expected,
    observed: sorted,
    futureProjection,
    rSquared,
    slope: regression.m,
    intercept: regression.b,
    anomalies,
  };
}

/**
 * Calculate fatigue-adjusted Strength Index
 * Uses recovery data to adjust SI based on sleep, soreness, and stress
 */
export function calculateFatigueAdjustedSI(
  strengthIndex: number,
  recoveryScore: number
): { adjustedSI: number; fatigueMultiplier: number; fatigueLevel: string } {
  // Recovery score is 0-100
  // Map to fatigue multiplier: 100% recovery = 1.0x, 0% recovery = 0.7x
  const fatigueMultiplier = 0.7 + (recoveryScore / 100) * 0.3;
  const adjustedSI = strengthIndex * fatigueMultiplier;

  let fatigueLevel = 'normal';
  if (recoveryScore < 40) fatigueLevel = 'high';
  else if (recoveryScore < 60) fatigueLevel = 'moderate';
  else if (recoveryScore > 80) fatigueLevel = 'low';

  return {
    adjustedSI,
    fatigueMultiplier,
    fatigueLevel,
  };
}

/**
 * Detect performance anomalies
 * Identifies unexpected drops or spikes in performance
 */
export function detectAnomalies(
  dataPoints: GrowthDataPoint[],
  threshold: number = 15
): {
  date: Date;
  value: number;
  type: 'spike' | 'drop';
  severity: 'mild' | 'moderate' | 'severe';
  changePercent: number;
}[] {
  if (dataPoints.length < 2) return [];

  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());
  const anomalies: any[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i].value;
    const previous = sorted[i - 1].value;
    const changePercent = ((current - previous) / previous) * 100;

    if (Math.abs(changePercent) > threshold) {
      const type = changePercent > 0 ? 'spike' : 'drop';
      let severity: 'mild' | 'moderate' | 'severe' = 'mild';

      if (Math.abs(changePercent) > 30) severity = 'severe';
      else if (Math.abs(changePercent) > 20) severity = 'moderate';

      anomalies.push({
        date: sorted[i].date,
        value: current,
        type,
        severity,
        changePercent,
      });
    }
  }

  return anomalies;
}

/**
 * Calculate moving average for smoothing data
 */
export function calculateMovingAverage(
  dataPoints: GrowthDataPoint[],
  windowSize: number = 7
): GrowthDataPoint[] {
  if (dataPoints.length < windowSize) return dataPoints;

  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());
  const result: GrowthDataPoint[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(sorted.length, i + Math.ceil(windowSize / 2));
    const window = sorted.slice(start, end);
    const avg = window.reduce((sum, p) => sum + p.value, 0) / window.length;

    result.push({
      date: sorted[i].date,
      value: avg,
    });
  }

  return result;
}
