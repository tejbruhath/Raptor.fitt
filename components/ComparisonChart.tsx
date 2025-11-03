"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface ComparisonChartProps {
  expected: { date: Date; value: number }[];
  observed: { date: Date; value: number }[];
  futureProjection?: { date: Date; value: number }[];
  title?: string;
  yAxisLabel?: string;
}

export default function ComparisonChart({
  expected,
  observed,
  futureProjection = [],
  title = "Expected vs Observed",
  yAxisLabel = "Value",
}: ComparisonChartProps) {
  // Combine all data points for chart
  const chartData = [];
  const dateMap = new Map();

  // Add observed data
  observed.forEach((point) => {
    const dateKey = format(point.date, 'yyyy-MM-dd');
    dateMap.set(dateKey, {
      date: dateKey,
      observed: point.value,
      displayDate: format(point.date, 'MMM dd'),
    });
  });

  // Add expected data
  expected.forEach((point) => {
    const dateKey = format(point.date, 'yyyy-MM-dd');
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      displayDate: format(point.date, 'MMM dd'),
    };
    existing.expected = point.value;
    dateMap.set(dateKey, existing);
  });

  // Add future projection
  futureProjection.forEach((point) => {
    const dateKey = format(point.date, 'yyyy-MM-dd');
    const existing = dateMap.get(dateKey) || {
      date: dateKey,
      displayDate: format(point.date, 'MMM dd'),
    };
    existing.projected = point.value;
    dateMap.set(dateKey, existing);
  });

  // Convert map to array and sort
  chartData.push(...Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

  return (
    <div className="card">
      <h3 className="text-xl font-heading font-bold mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis
            dataKey="displayDate"
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#666' }}
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#14F1C0' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="#14F1C0"
            strokeWidth={3}
            dot={{ fill: '#14F1C0', r: 4 }}
            name="Observed"
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="expected"
            stroke="#E14EFF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#E14EFF', r: 3 }}
            name="Expected"
            connectNulls
          />
          {futureProjection.length > 0 && (
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#FFC93C"
              strokeWidth={2}
              strokeDasharray="10 5"
              dot={{ fill: '#FFC93C', r: 3 }}
              name="Projected"
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend Info */}
      <div className="mt-4 flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-primary"></div>
          <span className="text-muted">Your Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-secondary"></div>
          <span className="text-muted">Expected Trend</span>
        </div>
        {futureProjection.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-warning"></div>
            <span className="text-muted">Future Projection</span>
          </div>
        )}
      </div>
    </div>
  );
}
