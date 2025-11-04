'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CloudOff, CheckCircle } from 'lucide-react';
import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue';

export default function OfflineIndicator() {
  const { isOnline, hasPending, pendingItems } = useOfflineQueue();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-[200]"
        >
          <div className="px-4 py-2 bg-warning/20 border border-warning/50 rounded-lg shadow-lg backdrop-blur-lg flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold text-warning">Offline Mode</span>
          </div>
        </motion.div>
      )}

      {hasPending && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-4 z-[200]"
        >
          <div className="px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg shadow-lg backdrop-blur-lg flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">
              {pendingItems.length} log{pendingItems.length > 1 ? 's' : ''} pending sync
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && hasPending && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-4 z-[200]"
        >
          <div className="px-4 py-2 bg-positive/20 border border-positive/50 rounded-lg shadow-lg backdrop-blur-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-positive" />
            <span className="text-sm font-semibold text-positive">Syncing...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
