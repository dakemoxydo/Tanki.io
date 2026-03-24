import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { RoomManager } from './server/game/RoomManager';
import { SocketServer } from './server/network/SocketServer';
import { createApiRouter } from './server/api';

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const roomManager = new RoomManager();
  new SocketServer(io, roomManager);

  // API routes
  app.use('/api', createApiRouter(roomManager, io));

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
