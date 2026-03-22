import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { GameEngine } from './server/game/GameEngine.js';
import { SocketServer } from './server/network/SocketServer.js';
import { GAME_TICK_RATE } from './shared/constants.js';

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const gameEngine = new GameEngine();
  new SocketServer(io, gameEngine);

  setInterval(() => {
    gameEngine.update();
  }, 1000 / GAME_TICK_RATE);

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/add-bot', (req, res) => {
    const botId = gameEngine.addBot();
    res.json({ success: true, botId });
  });

  app.post('/api/clear-bots', (req, res) => {
    gameEngine.clearBots();
    res.json({ success: true });
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
