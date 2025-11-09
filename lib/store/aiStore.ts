import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'insight' | 'recommendation' | 'warning' | 'motivation' | 'chat';
}

export interface AIInsight {
  id: string;
  type: 'strength' | 'recovery' | 'nutrition' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
}

export interface AIRecommendation {
  id: string;
  category: 'deload' | 'rest' | 'focus' | 'nutrition' | 'volume';
  title: string;
  description: string;
  actionable: boolean;
  timestamp: Date;
}

interface AIStore {
  // State
  chatHistory: AIMessage[];
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  dailySummary: string | null;
  isProcessing: boolean;
  raptorPersonality: 'hype' | 'coach' | 'scientist';
  
  // Actions
  addMessage: (message: AIMessage) => void;
  addInsight: (insight: AIInsight) => void;
  markInsightRead: (insightId: string) => void;
  addRecommendation: (recommendation: AIRecommendation) => void;
  dismissRecommendation: (recommendationId: string) => void;
  setDailySummary: (summary: string) => void;
  setProcessing: (status: boolean) => void;
  setPersonality: (personality: 'hype' | 'coach' | 'scientist') => void;
  clearChat: () => void;
  clearOldInsights: () => void;
}

export const useAIStore = create<AIStore>()(
  devtools(
    (set, get) => ({
      chatHistory: [],
      insights: [],
      recommendations: [],
      dailySummary: null,
      isProcessing: false,
      raptorPersonality: 'hype',

      addMessage: (message) => set((state) => ({
        chatHistory: [...state.chatHistory, message].slice(-50), // Keep last 50 messages
      })),

      addInsight: (insight) => set((state) => {
        // Check for duplicates
        const exists = state.insights.some(i => 
          i.type === insight.type && 
          i.title === insight.title &&
          Date.now() - i.timestamp.getTime() < 86400000 // 24 hours
        );
        
        if (exists) return state;
        
        return {
          insights: [insight, ...state.insights].slice(0, 20), // Keep last 20 insights
        };
      }),

      markInsightRead: (insightId) => set((state) => ({
        insights: state.insights.map(i =>
          i.id === insightId ? { ...i, read: true } : i
        ),
      })),

      addRecommendation: (recommendation) => set((state) => {
        // Check for duplicates
        const exists = state.recommendations.some(r =>
          r.category === recommendation.category &&
          r.title === recommendation.title
        );
        
        if (exists) return state;
        
        return {
          recommendations: [recommendation, ...state.recommendations].slice(0, 10),
        };
      }),

      dismissRecommendation: (recommendationId) => set((state) => ({
        recommendations: state.recommendations.filter(r => r.id !== recommendationId),
      })),

      setDailySummary: (summary) => set({ dailySummary: summary }),

      setProcessing: (status) => set({ isProcessing: status }),

      setPersonality: (personality) => set({ raptorPersonality: personality }),

      clearChat: () => set({ chatHistory: [] }),

      clearOldInsights: () => set((state) => {
        const oneDayAgo = Date.now() - 86400000;
        return {
          insights: state.insights.filter(i => 
            i.timestamp.getTime() > oneDayAgo || !i.read
          ),
        };
      }),
    })
  )
);
