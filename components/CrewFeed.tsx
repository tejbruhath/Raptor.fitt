'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Copy, Check, TrendingUp, Flame } from 'lucide-react';
import { useSocialStore } from '@/lib/store/socialStore';
import { useSocket } from '@/lib/hooks/useSocket';

interface CrewFeedProps {
  userId: string;
  userName: string;
}

export function CrewFeed({ userId, userName }: CrewFeedProps) {
  const { myCrews, activeCrewId, recentShares, setActiveCrew, addWorkoutShare, addReaction } =
    useSocialStore();
  const { isConnected, joinCrew, leaveCrew, onWorkoutUpdate, onReaction, offWorkoutUpdate, offReaction } =
    useSocket();

  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [showJoinCrew, setShowJoinCrew] = useState(false);
  const [newCrewName, setNewCrewName] = useState('');
  const [newCrewEmoji, setNewCrewEmoji] = useState('🦖');
  const [inviteCode, setInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCrew = myCrews.find((c) => c.id === activeCrewId);

  // Socket.io real-time updates
  useEffect(() => {
    if (activeCrewId && isConnected) {
      joinCrew(activeCrewId);

      onWorkoutUpdate((data: any) => {
        addWorkoutShare({
          id: Date.now().toString(),
          userId: data.userId,
          userName: data.userName,
          crewId: activeCrewId,
          exercises: data.exercises,
          volume: data.volume,
          timestamp: new Date(data.timestamp),
          reactions: [],
        });
      });

      onReaction((data: any) => {
        addReaction(data.shareId, data.userId, data.emoji);
      });

      return () => {
        leaveCrew(activeCrewId);
        offWorkoutUpdate();
        offReaction();
      };
    }
  }, [activeCrewId, isConnected]);

  const handleCreateCrew = async () => {
    try {
      const response = await fetch('/api/crews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCrewName,
          emoji: newCrewEmoji,
        }),
      });

      const data = await response.json();
      
      // Add to Zustand store
      // In production, refetch crews from API
      setShowCreateCrew(false);
      setNewCrewName('');
      setNewCrewEmoji('🦖');
    } catch (error) {
      console.error('Failed to create crew:', error);
    }
  };

  const handleJoinCrew = async () => {
    try {
      const response = await fetch('/api/crews/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to join crew');
        return;
      }

      setShowJoinCrew(false);
      setInviteCode('');
      // Refetch crews
    } catch (error) {
      console.error('Failed to join crew:', error);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
            <Users className="text-primary" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading">Training Crews</h2>
            <p className="text-sm text-muted">
              {isConnected ? '🟢 Live' : '🔴 Connecting...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinCrew(true)}
            className="px-4 py-2 bg-background border border-neutral rounded-lg hover:bg-neutral transition-all text-sm font-semibold"
          >
            Join Crew
          </button>
          <button
            onClick={() => setShowCreateCrew(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-background rounded-lg hover:shadow-glow transition-all text-sm font-bold flex items-center gap-2"
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* My Crews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myCrews.map((crew) => (
          <motion.div
            key={crew.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveCrew(crew.id)}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              activeCrewId === crew.id
                ? 'border-primary bg-primary/10'
                : 'border-neutral bg-surface hover:bg-neutral'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{crew.emoji || '🦖'}</span>
                <div>
                  <h3 className="font-bold">{crew.name}</h3>
                  <p className="text-xs text-muted">{crew.members.length} members</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyInviteCode(crew.inviteCode);
                }}
                className="p-2 hover:bg-background rounded-lg transition-all"
              >
                {copiedCode === crew.inviteCode ? (
                  <Check size={16} className="text-positive" />
                ) : (
                  <Copy size={16} className="text-muted" />
                )}
              </button>
            </div>

            {/* Members */}
            <div className="flex -space-x-2">
              {crew.members.slice(0, 5).map((member, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background flex items-center justify-center text-xs font-bold"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Crew Feed */}
      {activeCrew && (
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl border border-neutral overflow-hidden">
          <div className="p-4 bg-background/50 border-b border-neutral">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>{activeCrew.emoji}</span>
              {activeCrew.name}
            </h3>
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {recentShares
              .filter((share) => share.crewId === activeCrewId)
              .map((share) => (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-background rounded-xl border border-neutral"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold">
                      {share.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{share.userName}</p>
                      <p className="text-xs text-muted">
                        {new Date(share.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Flame className="text-accent" size={16} />
                      <span className="font-mono">{Math.round(share.volume / 1000)}k</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted mb-2">Completed:</p>
                    <div className="flex flex-wrap gap-2">
                      {share.exercises.map((ex, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-lg text-xs font-semibold"
                        >
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    {['💪', '🔥', '👏', '🎯', '⚡'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          addReaction(share.id, userId, emoji)
                        }
                        className={`px-3 py-1 rounded-lg transition-all text-sm ${
                          share.reactions.some((r) => r.userId === userId && r.emoji === emoji)
                            ? 'bg-primary/20 border border-primary'
                            : 'bg-background hover:bg-neutral border border-neutral'
                        }`}
                      >
                        {emoji}
                        {share.reactions.filter((r) => r.emoji === emoji).length > 0 && (
                          <span className="ml-1 text-xs">
                            {share.reactions.filter((r) => r.emoji === emoji).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

            {recentShares.filter((s) => s.crewId === activeCrewId).length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto mb-4 text-muted" size={48} />
                <p className="text-muted">No activity yet. Complete a workout to share!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Crew Modal */}
      <AnimatePresence>
        {showCreateCrew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCreateCrew(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface rounded-2xl border border-neutral p-6 space-y-4"
            >
              <h3 className="text-2xl font-bold font-heading">Create Training Crew</h3>

              <div>
                <label className="text-sm text-muted block mb-2">Crew Name</label>
                <input
                  type="text"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  placeholder="Beast Mode Squad"
                  className="w-full bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted block mb-2">Emoji</label>
                <div className="grid grid-cols-6 gap-2">
                  {['🦖', '💪', '🔥', '⚡', '🎯', '🦁', '🐺', '🚀', '⭐', '💎', '👑', '🏆'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewCrewEmoji(emoji)}
                      className={`text-3xl p-3 rounded-lg transition-all ${
                        newCrewEmoji === emoji
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-background hover:bg-neutral border-2 border-neutral'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateCrew(false)}
                  className="flex-1 py-3 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCrew}
                  disabled={!newCrewName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                >
                  Create Crew
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Crew Modal */}
      <AnimatePresence>
        {showJoinCrew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowJoinCrew(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface rounded-2xl border border-neutral p-6 space-y-4"
            >
              <h3 className="text-2xl font-bold font-heading">Join Training Crew</h3>

              <div>
                <label className="text-sm text-muted block mb-2">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full bg-background border border-neutral rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center text-2xl"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowJoinCrew(false)}
                  className="flex-1 py-3 bg-background border border-neutral rounded-xl font-semibold hover:bg-neutral transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinCrew}
                  disabled={inviteCode.length !== 6}
                  className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-background font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50"
                >
                  Join Crew
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {myCrews.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-muted" size={64} />
          <h3 className="text-xl font-bold mb-2">No Crews Yet</h3>
          <p className="text-muted mb-6">Create or join a crew to train with friends!</p>
        </div>
      )}
    </div>
  );
}
