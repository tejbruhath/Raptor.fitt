import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export function initializeSocket(server: NetServer): SocketIOServer {
  if ((server as any).io) {
    console.log('Socket.io already initialized');
    return (server as any).io;
  }

  const io = new SocketIOServer(server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  (server as any).io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join crew room
    socket.on('join-crew', (crewId: string) => {
      socket.join(`crew:${crewId}`);
      console.log(`Socket ${socket.id} joined crew:${crewId}`);
    });

    // Leave crew room
    socket.on('leave-crew', (crewId: string) => {
      socket.leave(`crew:${crewId}`);
      console.log(`Socket ${socket.id} left crew:${crewId}`);
    });

    // Broadcast workout completion to crew
    socket.on('workout-completed', (data: {
      crewId: string;
      userId: string;
      userName: string;
      exercises: string[];
      volume: number;
    }) => {
      io.to(`crew:${data.crewId}`).emit('crew-workout-update', {
        userId: data.userId,
        userName: data.userName,
        exercises: data.exercises,
        volume: data.volume,
        timestamp: new Date().toISOString(),
      });
      console.log(`Workout broadcast to crew:${data.crewId}`);
    });

    // Real-time reactions
    socket.on('react-to-workout', (data: {
      crewId: string;
      shareId: string;
      userId: string;
      emoji: string;
    }) => {
      io.to(`crew:${data.crewId}`).emit('workout-reaction', data);
    });

    // Challenge leaderboard updates
    socket.on('challenge-update', (data: {
      crewId: string;
      challengeId: string;
      leaderboard: any[];
    }) => {
      io.to(`crew:${data.crewId}`).emit('challenge-leaderboard-update', data);
    });

    // Typing indicator
    socket.on('crew-typing', (data: {
      crewId: string;
      userId: string;
      userName: string;
    }) => {
      socket.to(`crew:${data.crewId}`).emit('user-typing', {
        userName: data.userName,
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket.io server initialized');
  return io;
}
