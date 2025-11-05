"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Moon, Globe, Lock, Trash2, Save } from "lucide-react";
import Link from "next/link";

export default function Settings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    units: 'metric',
    language: 'en',
    autoSave: true,
    restTimerDefault: 90,
  });

  useEffect(() => {
    if (session?.user?.id) {
      loadSettings();
    }
  }, [session]);

  async function loadSettings() {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const { user } = await res.json();
        if (user.settings) {
          setSettings({ ...settings, ...user.settings });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id,
          settings,
        }),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background raptor-pattern pb-24">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="text-primary hover:text-primary-light">
            ← Back
          </Link>
          <h1 className="text-2xl font-heading font-bold">Settings</h1>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="btn-primary text-sm px-4 py-2"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-heading font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Enable Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Workout Reminders</span>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-heading font-bold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Dark Mode</span>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
          </div>
        </motion.div>

        {/* Units & Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-heading font-bold">Units & Language</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">Units</label>
              <select
                value={settings.units}
                onChange={(e) => setSettings({ ...settings, units: e.target.value })}
                className="input w-full"
              >
                <option value="metric">Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, in)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="input w-full"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Workout Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="text-xl font-heading font-bold mb-4">Workout Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Auto-save Workouts</span>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
            <div>
              <label className="block text-sm text-muted mb-2">Default Rest Timer (seconds)</label>
              <input
                type="number"
                value={settings.restTimerDefault}
                onChange={(e) => setSettings({ ...settings, restTimerDefault: Number(e.target.value) })}
                className="input w-full"
                min="30"
                max="300"
                step="30"
              />
            </div>
          </div>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-heading font-bold">Privacy & Security</h2>
          </div>
          <div className="space-y-3">
            <Link
              href="/settings/change-password"
              className="block p-4 bg-surface rounded-lg hover:bg-neutral transition-colors"
            >
              Change Password
            </Link>
            <Link
              href="/settings/privacy"
              className="block p-4 bg-surface rounded-lg hover:bg-neutral transition-colors"
            >
              Privacy Settings
            </Link>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card border border-negative/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="w-6 h-6 text-negative" />
            <h2 className="text-xl font-heading font-bold text-negative">Danger Zone</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full p-4 bg-negative/20 text-negative rounded-lg hover:bg-negative/30 transition-colors text-left">
              Delete All Workout Data
            </button>
            <button className="w-full p-4 bg-negative/20 text-negative rounded-lg hover:bg-negative/30 transition-colors text-left">
              Delete Account
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
