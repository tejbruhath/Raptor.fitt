'use client';

import { useState, useEffect } from 'react';

interface QueueItem {
  id: string;
  type: 'workout' | 'nutrition';
  data: any;
  timestamp: number;
}

/**
 * Hook for offline-first logging with queue management
 * Stores logs locally if offline, syncs when connection restores
 */
export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingItems, setPendingItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Load pending items from localStorage
    loadPendingItems();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingItems();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Load pending items from localStorage
   */
  function loadPendingItems() {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        setPendingItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Add item to offline queue
   */
  function addToQueue(type: 'workout' | 'nutrition', data: any): string {
    const item: QueueItem = {
      id: `${type}_${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
    };

    const updated = [...pendingItems, item];
    setPendingItems(updated);

    // Persist to localStorage
    try {
      localStorage.setItem('offline_queue', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save to offline queue:', error);
    }

    return item.id;
  }

  /**
   * Sync pending items when online
   */
  async function syncPendingItems() {
    if (pendingItems.length === 0) return;

    const successes: string[] = [];

    for (const item of pendingItems) {
      try {
        const endpoint = item.type === 'workout' ? '/api/workouts' : '/api/nutrition';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          successes.push(item.id);
        }
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error);
      }
    }

    // Remove synced items
    if (successes.length > 0) {
      const remaining = pendingItems.filter(item => !successes.includes(item.id));
      setPendingItems(remaining);
      
      try {
        if (remaining.length > 0) {
          localStorage.setItem('offline_queue', JSON.stringify(remaining));
        } else {
          localStorage.removeItem('offline_queue');
        }
      } catch (error) {
        console.error('Failed to update offline queue:', error);
      }
    }
  }

  /**
   * Remove item from queue
   */
  function removeFromQueue(id: string) {
    const updated = pendingItems.filter(item => item.id !== id);
    setPendingItems(updated);

    try {
      if (updated.length > 0) {
        localStorage.setItem('offline_queue', JSON.stringify(updated));
      } else {
        localStorage.removeItem('offline_queue');
      }
    } catch (error) {
      console.error('Failed to update offline queue:', error);
    }
  }

  /**
   * Clear all pending items
   */
  function clearQueue() {
    setPendingItems([]);
    try {
      localStorage.removeItem('offline_queue');
    } catch (error) {
      console.error('Failed to clear offline queue:', error);
    }
  }

  return {
    isOnline,
    pendingItems,
    hasPending: pendingItems.length > 0,
    addToQueue,
    syncPendingItems,
    removeFromQueue,
    clearQueue,
  };
}
