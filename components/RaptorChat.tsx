'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic, Zap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIStore } from '@/lib/store/aiStore';
import { VoiceInput } from './VoiceInput';

export function RaptorChat() {
  const {
    chatHistory,
    isProcessing,
    raptorPersonality,
    addMessage,
    setProcessing,
    setPersonality,
  } = useAIStore();

  const [input, setInput] = useState('');
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          personality: raptorPersonality,
        }),
      });

      const data = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date(),
        type: data.type,
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: "Sorry, I'm having trouble connecting. Let's try again! 💪",
        timestamp: new Date(),
      });
    } finally {
      setProcessing(false);
      inputRef.current?.focus();
    }
  };

  const handleVoiceTranscript = async (transcript: string) => {
    setInput(transcript);
    setShowVoice(false);
    // Auto-send voice input
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const getPersonalityColor = () => {
    switch (raptorPersonality) {
      case 'hype':
        return 'from-primary to-secondary';
      case 'coach':
        return 'from-secondary to-accent';
      case 'scientist':
        return 'from-accent to-primary';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px]">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-sm rounded-t-2xl border border-neutral border-b-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPersonalityColor()} flex items-center justify-center`}>
              <Zap className="text-background" size={24} />
            </div>
            <div>
              <h3 className="font-bold font-heading text-lg">Raptor AI</h3>
              <p className="text-xs text-muted capitalize">{raptorPersonality} mode</p>
            </div>
          </div>
          <button
            onClick={() => setShowVoice(!showVoice)}
            className={`p-2 rounded-lg transition-all ${
              showVoice ? 'bg-primary/20 text-primary' : 'bg-background text-muted hover:text-white'
            }`}
          >
            <Mic size={20} />
          </button>
        </div>

        {/* Personality Selector */}
        <div className="flex gap-2">
          {(['hype', 'coach', 'scientist'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPersonality(p)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                raptorPersonality === p
                  ? 'bg-gradient-to-r ' + getPersonalityColor() + ' text-background'
                  : 'bg-background text-muted hover:text-white'
              }`}
            >
              {p === 'hype' && '🔥 Hype'}
              {p === 'coach' && '💪 Coach'}
              {p === 'scientist' && '🧬 Science'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-background border-x border-neutral overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getPersonalityColor()} flex items-center justify-center`}>
              <Zap className="text-background" size={32} />
            </div>
            <h4 className="font-bold text-lg mb-2">Chat with Raptor</h4>
            <p className="text-sm text-muted mb-6">
              Ask about workouts, nutrition, recovery, or just chat!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  setInput('What should I train today?');
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 bg-surface hover:bg-neutral rounded-lg text-sm transition-all"
              >
                What should I train today?
              </button>
              <button
                onClick={() => {
                  setInput('How am I progressing?');
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 bg-surface hover:bg-neutral rounded-lg text-sm transition-all"
              >
                How am I progressing?
              </button>
              <button
                onClick={() => {
                  setInput('Should I take a rest day?');
                  inputRef.current?.focus();
                }}
                className="px-4 py-2 bg-surface hover:bg-neutral rounded-lg text-sm transition-all"
              >
                Should I take a rest day?
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {chatHistory.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-neutral to-background'
                    : 'bg-gradient-to-br ' + getPersonalityColor()
                }`}
              >
                {message.role === 'user' ? (
                  <User className="text-white" size={20} />
                ) : (
                  <Zap className="text-background" size={20} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 max-w-[80%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary/20 border border-primary/30 rounded-tr-none'
                    : 'bg-surface border border-neutral rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-muted mt-2">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getPersonalityColor()}`}>
              <Zap className="text-background" size={20} />
            </div>
            <div className="flex-1 max-w-[80%] p-4 rounded-2xl bg-surface border border-neutral rounded-tl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input Overlay */}
      <AnimatePresence>
        {showVoice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-x border-neutral bg-surface/95 backdrop-blur-sm p-6"
          >
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              placeholder="Ask Raptor anything..."
              size="lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-surface/80 backdrop-blur-sm rounded-b-2xl border border-neutral border-t-0 p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message Raptor..."
            className="flex-1 bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
