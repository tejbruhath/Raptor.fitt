"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show prompt if user hasn't dismissed it before
      const hasSeenPrompt = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasSeenPrompt) {
        // Show after 10 seconds
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
    
    if (outcome === 'dismissed') {
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96"
      >
        <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 backdrop-blur-xl">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-8 h-8 text-background" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg mb-1">
                Install Raptor.Fitt
              </h3>
              <p className="text-sm text-muted mb-4">
                Get the full app experience with offline access, faster loading, and home screen shortcut.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
                <button
                  onClick={handleDismiss}
                  className="btn-ghost px-4"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-primary font-bold mb-1">⚡</div>
                <div className="text-muted">Faster</div>
              </div>
              <div>
                <div className="text-primary font-bold mb-1">📱</div>
                <div className="text-muted">Native Feel</div>
              </div>
              <div>
                <div className="text-primary font-bold mb-1">🔒</div>
                <div className="text-muted">Offline</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
