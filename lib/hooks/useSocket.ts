import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
      socket = io(socketUrl, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  const joinCrew = (crewId: string) => {
    if (socket) {
      socket.emit('join-crew', crewId);
    }
  };

  const leaveCrew = (crewId: string) => {
    if (socket) {
      socket.emit('leave-crew', crewId);
    }
  };

  const broadcastWorkout = (data: {
    crewId: string;
    userId: string;
    userName: string;
    exercises: string[];
    volume: number;
  }) => {
    if (socket) {
      socket.emit('workout-completed', data);
    }
  };

  const reactToWorkout = (data: {
    crewId: string;
    shareId: string;
    userId: string;
    emoji: string;
  }) => {
    if (socket) {
      socket.emit('react-to-workout', data);
    }
  };

  const onWorkoutUpdate = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('crew-workout-update', callback);
    }
  };

  const onReaction = (callback: (data: any) => void) => {
    if (socket) {
      socket.on('workout-reaction', callback);
    }
  };

  const offWorkoutUpdate = () => {
    if (socket) {
      socket.off('crew-workout-update');
    }
  };

  const offReaction = () => {
    if (socket) {
      socket.off('workout-reaction');
    }
  };

  return {
    socket,
    isConnected,
    joinCrew,
    leaveCrew,
    broadcastWorkout,
    reactToWorkout,
    onWorkoutUpdate,
    onReaction,
    offWorkoutUpdate,
    offReaction,
  };
}
