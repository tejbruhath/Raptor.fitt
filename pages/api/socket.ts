import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/lib/socket/server';
import { initializeSocket } from '@/lib/socket/server';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    initializeSocket(res.socket.server);
  }

  res.end();
}
