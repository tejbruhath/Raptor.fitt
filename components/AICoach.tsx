"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useHoverCapability } from "@/lib/hooks/useHoverCapability";

export default function AICoach() {
  const canHover = useHoverCapability();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || !session?.user?.id) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          message: userMessage,
        }),
      });

      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
      }
    } catch (error) {
      console.error('AI Coach error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Sorry, I had trouble processing that. Please try again!' 
      }]);
    } finally {
      setLoading(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <>
      {/* AI Coach Button */}
      <motion.button
        whileHover={canHover ? { scale: 1.05 } : {}}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary rounded-lg transition-all hover-device:hover:shadow-lg hover-device:hover:shadow-primary/50"
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-medium text-sm">AI Coach</span>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-positive rounded-full animate-pulse"></div>
      </motion.button>

      {/* AI Coach Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[999] p-4"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 0 }}
              className="relative z-10 w-full max-w-lg sm:max-w-2xl max-h-[85vh] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{ margin: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-heading font-bold">AI Coach</h2>
                    <p className="text-xs text-muted">Personalized fitness guidance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-colors hover-device:hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">Hey! I'm your AI Coach 🦖</h3>
                      <p className="text-muted mb-6">Ask me anything about:</p>
                      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                        <button
                          onClick={() => setInput("Give me a workout plan")}
                          className="p-3 bg-white/5 rounded-lg text-sm transition-colors hover-device:hover:bg-white/10"
                        >
                          💪 Workout Plans
                        </button>
                        <button
                          onClick={() => setInput("What should I eat?")}
                          className="p-3 bg-white/5 rounded-lg text-sm transition-colors hover-device:hover:bg-white/10"
                        >
                          🍖 Nutrition Advice
                        </button>
                        <button
                          onClick={() => setInput("How do I get stronger?")}
                          className="p-3 bg-white/5 rounded-lg text-sm transition-colors hover-device:hover:bg-white/10"
                        >
                          📈 Strength Tips
                        </button>
                        <button
                          onClick={() => setInput("I need motivation")}
                          className="p-3 bg-white/5 rounded-lg text-sm transition-colors hover-device:hover:bg-white/10"
                        >
                          🔥 Motivation
                        </button>
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-primary text-background'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary transition-colors"
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className="px-6 py-3 bg-primary text-background rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center hover-device:hover:bg-primary-light"
                  >
                    <Send className="w-4 h-4" />
                    <span className="font-medium">Send</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
