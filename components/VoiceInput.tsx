'use client';

import { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '@/lib/hooks/useVoiceInput';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onProcessing?: (processing: boolean) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceInput({
  onTranscript,
  onProcessing,
  placeholder = 'Press and hold to speak',
  className = '',
  size = 'md',
}: VoiceInputProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
  } = useVoiceInput({
    onResult: async (text) => {
      setIsProcessing(true);
      onProcessing?.(true);
      
      try {
        await onTranscript(text);
      } finally {
        setIsProcessing(false);
        onProcessing?.(false);
      }
    },
    onError: (err) => {
      console.error('Voice input error:', err);
      setIsProcessing(false);
      onProcessing?.(false);
    },
  });

  if (!isSupported) {
    return (
      <div className={`text-center p-4 bg-surface/50 rounded-lg ${className}`}>
        <p className="text-sm text-muted">
          Voice input not supported in this browser
        </p>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Voice Input Button */}
      <motion.button
        type="button"
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={stopListening}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 ${
          isListening
            ? 'bg-gradient-to-br from-accent to-accent-dark shadow-glow-accent scale-110'
            : isProcessing
            ? 'bg-gradient-to-br from-primary to-primary-dark animate-pulse'
            : 'bg-gradient-to-br from-primary to-primary-dark hover:shadow-glow active:scale-95'
        }`}
        disabled={isProcessing}
        aria-label={isListening ? 'Recording...' : 'Press to speak'}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 size={iconSizes[size]} className="text-background animate-spin" />
            </motion.div>
          ) : isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <MicOff size={iconSizes[size]} className="text-background" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Mic size={iconSizes[size]} className="text-background" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Status Text */}
      <AnimatePresence>
        {(isListening || interimTranscript || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center max-w-md"
          >
            {isProcessing ? (
              <p className="text-sm text-primary animate-pulse">Processing...</p>
            ) : isListening ? (
              <>
                <p className="text-sm text-primary mb-2">Listening...</p>
                {interimTranscript && (
                  <p className="text-xs text-muted italic">{interimTranscript}</p>
                )}
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder Text */}
      {!isListening && !isProcessing && !interimTranscript && (
        <p className="text-xs text-muted text-center max-w-xs">{placeholder}</p>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-negative text-center max-w-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Feedback - Waveform */}
      {isListening && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: [8, 20, 8],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
