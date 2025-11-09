import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface CrewMember {
  id: string;
  name: string;
  avatar?: string;
  streakDays: number;
  lastWorkout?: Date;
  consistencyIndex: number;
  weeklyVolume?: number;
}

export interface Crew {
  id: string;
  name: string;
  emoji?: string;
  members: CrewMember[];
  createdAt: Date;
  ownerId: string;
  inviteCode: string;
}

export interface CrewChallenge {
  id: string;
  crewId: string;
  title: string;
  description: string;
  type: 'volume' | 'consistency' | 'prs' | 'custom';
  startDate: Date;
  endDate: Date;
  leaderboard: {
    userId: string;
    score: number;
  }[];
}

export interface WorkoutShare {
  id: string;
  userId: string;
  userName: string;
  crewId: string;
  exercises: string[];
  volume: number;
  timestamp: Date;
  reactions: {
    userId: string;
    emoji: string;
  }[];
}

interface SocialStore {
  // State
  myCrews: Crew[];
  activeCrewId: string | null;
  challenges: CrewChallenge[];
  recentShares: WorkoutShare[];
  isConnected: boolean;
  
  // Actions
  addCrew: (crew: Crew) => void;
  removeCrew: (crewId: string) => void;
  setActiveCrew: (crewId: string) => void;
  updateCrewMember: (crewId: string, memberId: string, updates: Partial<CrewMember>) => void;
  addChallenge: (challenge: CrewChallenge) => void;
  updateChallengeLeaderboard: (challengeId: string, leaderboard: CrewChallenge['leaderboard']) => void;
  addWorkoutShare: (share: WorkoutShare) => void;
  addReaction: (shareId: string, userId: string, emoji: string) => void;
  setConnected: (status: boolean) => void;
  reset: () => void;
}

export const useSocialStore = create<SocialStore>()(
  devtools(
    persist(
      (set, get) => ({
        myCrews: [],
        activeCrewId: null,
        challenges: [],
        recentShares: [],
        isConnected: false,

        addCrew: (crew) => set((state) => ({
          myCrews: [...state.myCrews, crew],
        })),

        removeCrew: (crewId) => set((state) => ({
          myCrews: state.myCrews.filter(c => c.id !== crewId),
          activeCrewId: state.activeCrewId === crewId ? null : state.activeCrewId,
        })),

        setActiveCrew: (crewId) => set({ activeCrewId: crewId }),

        updateCrewMember: (crewId, memberId, updates) => set((state) => ({
          myCrews: state.myCrews.map(crew =>
            crew.id === crewId
              ? {
                  ...crew,
                  members: crew.members.map(member =>
                    member.id === memberId ? { ...member, ...updates } : member
                  ),
                }
              : crew
          ),
        })),

        addChallenge: (challenge) => set((state) => ({
          challenges: [challenge, ...state.challenges],
        })),

        updateChallengeLeaderboard: (challengeId, leaderboard) => set((state) => ({
          challenges: state.challenges.map(c =>
            c.id === challengeId ? { ...c, leaderboard } : c
          ),
        })),

        addWorkoutShare: (share) => set((state) => ({
          recentShares: [share, ...state.recentShares].slice(0, 50),
        })),

        addReaction: (shareId, userId, emoji) => set((state) => ({
          recentShares: state.recentShares.map(share =>
            share.id === shareId
              ? {
                  ...share,
                  reactions: [
                    ...share.reactions.filter(r => r.userId !== userId),
                    { userId, emoji },
                  ],
                }
              : share
          ),
        })),

        setConnected: (status) => set({ isConnected: status }),

        reset: () => set({
          myCrews: [],
          activeCrewId: null,
          challenges: [],
          recentShares: [],
          isConnected: false,
        }),
      }),
      {
        name: 'social-store',
        partialize: (state) => ({
          myCrews: state.myCrews,
          activeCrewId: state.activeCrewId,
        }),
      }
    )
  )
);
