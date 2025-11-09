'use client';

import { useState } from 'react';
import { Camera, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface BodyEntry {
  id: string;
  date: string;
  weight: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
    thighs?: number;
    calves?: number;
    shoulders?: number;
  };
  photos: {
    url: string;
    view: 'front' | 'side' | 'back';
  }[];
}

interface BodyProgressTrackerProps {
  entries: BodyEntry[];
  onNewEntry?: (entry: any) => void;
}

export function BodyProgressTracker({ entries, onNewEntry }: BodyProgressTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
    calves: '',
    shoulders: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [selectedView, setSelectedView] = useState<'timeline' | 'comparison'>('timeline');

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      const response = await fetch('/api/upload/body-photos', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Photos uploaded:', data);
      // Handle uploaded photo URLs
    } catch (error) {
      console.error('Photo upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const entry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: {
        chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
        waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
        arms: measurements.arms ? parseFloat(measurements.arms) : undefined,
        thighs: measurements.thighs ? parseFloat(measurements.thighs) : undefined,
        calves: measurements.calves ? parseFloat(measurements.calves) : undefined,
        shoulders: measurements.shoulders ? parseFloat(measurements.shoulders) : undefined,
      },
      photos: [],
    };

    try {
      const response = await fetch('/api/body-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      const data = await response.json();
      onNewEntry?.(data.entry);
      setShowForm(false);

      // Reset form
      setWeight('');
      setBodyFat('');
      setMeasurements({
        chest: '',
        waist: '',
        arms: '',
        thighs: '',
        calves: '',
        shoulders: '',
      });
    } catch (error) {
      console.error('Failed to save body tracking:', error);
    }
  };

  const getWeightTrend = () => {
    if (entries.length < 2) return 'stable';
    const latest = entries[0].weight;
    const previous = entries[1].weight;
    if (latest > previous + 0.5) return 'up';
    if (latest < previous - 0.5) return 'down';
    return 'stable';
  };

  const trend = getWeightTrend();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl p-6 border border-secondary/30">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-heading">Body Composition</h2>
          {trend === 'up' && <TrendingUp className="text-primary" size={24} />}
          {trend === 'down' && <TrendingDown className="text-accent" size={24} />}
          {trend === 'stable' && <Minus className="text-muted" size={24} />}
        </div>

        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-mono font-bold">{entries[0].weight}</p>
              <p className="text-xs text-muted">Weight (kg)</p>
            </div>
            {entries[0].bodyFat && (
              <div>
                <p className="text-3xl font-mono font-bold">{entries[0].bodyFat}%</p>
                <p className="text-xs text-muted">Body Fat</p>
              </div>
            )}
            {entries.length >= 2 && (
              <div>
                <p className="text-3xl font-mono font-bold">
                  {trend === 'up' && '+'}
                  {(entries[0].weight - entries[1].weight).toFixed(1)}
                </p>
                <p className="text-xs text-muted">Change</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl border border-neutral">
        <button
          onClick={() => setSelectedView('timeline')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            selectedView === 'timeline'
              ? 'bg-primary text-background'
              : 'text-muted hover:text-white'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setSelectedView('comparison')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            selectedView === 'comparison'
              ? 'bg-primary text-background'
              : 'text-muted hover:text-white'
          }`}
        >
          Comparison
        </button>
      </div>

      {/* Add New Entry Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary rounded-xl flex items-center justify-center gap-2 transition-all"
      >
        <Camera size={20} className="text-primary" />
        <span className="text-primary font-semibold">Log Progress</span>
      </button>

      {/* Entry Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-surface/80 rounded-2xl p-6 border border-neutral space-y-4"
        >
          <h3 className="font-bold text-lg">New Progress Entry</h3>

          {/* Weight */}
          <div>
            <label className="text-sm text-muted block mb-2">Weight (kg)*</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.0"
              className="w-full bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Body Fat */}
          <div>
            <label className="text-sm text-muted block mb-2">Body Fat % (optional)</label>
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="15.0"
              className="w-full bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Measurements Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(measurements).map((key) => (
              <div key={key}>
                <label className="text-sm text-muted block mb-2 capitalize">{key} (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={measurements[key as keyof typeof measurements]}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, [key]: e.target.value })
                  }
                  placeholder="0.0"
                  className="w-full bg-background border border-neutral rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm text-muted block mb-2">Progress Photos (optional)</label>
            <label
              className={`block w-full p-6 bg-background hover:bg-neutral border-2 border-dashed border-neutral rounded-xl text-center cursor-pointer transition-all ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Camera className="mx-auto mb-2 text-muted" size={32} />
              <p className="text-sm text-muted">
                {isUploading ? 'Uploading...' : 'Click to upload photos'}
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!weight}
              className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Entry
            </button>
          </div>
        </motion.div>
      )}

      {/* Entries Timeline */}
      {selectedView === 'timeline' && (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-surface/80 rounded-2xl p-4 border border-neutral"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">{new Date(entry.date).toLocaleDateString()}</p>
                <div className="flex gap-4 text-sm">
                  <span className="font-mono">{entry.weight}kg</span>
                  {entry.bodyFat && <span className="text-muted">{entry.bodyFat}% BF</span>}
                </div>
              </div>

              {entry.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {entry.photos.map((photo, i) => (
                    <div key={i} className="aspect-[3/4] relative rounded-lg overflow-hidden">
                      <Image
                        src={photo.url}
                        alt={`${photo.view} view`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-12">
          <Camera className="mx-auto mb-4 text-muted" size={48} />
          <p className="text-muted">No progress entries yet. Start tracking!</p>
        </div>
      )}
    </div>
  );
}
