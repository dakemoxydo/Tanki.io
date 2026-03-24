import { Router } from 'express';
import { RoomManager } from './game/RoomManager';
import { Server } from 'socket.io';

export const createApiRouter = (roomManager: RoomManager, io: Server) => {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/rooms', (req, res) => {
    res.json(roomManager.getRoomList());
  });

  router.post('/add-bot', (req, res) => {
    const { roomId } = req.body;
    const room = roomManager.getRoom(roomId || 'Default Room');
    if (room) {
      const botId = room.addBot();
      res.json({ success: true, botId });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  });

  router.post('/clear-bots', (req, res) => {
    const { roomId } = req.body;
    const room = roomManager.getRoom(roomId || 'Default Room');
    if (room) {
      room.clearBots();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Room not found' });
    }
  });

  router.post('/stop-all-rooms', (req, res) => {
    io.emit('serverShutdown');
    roomManager.rooms = {};
    roomManager.createRoom('Default Room');
    io.emit('roomList', roomManager.getRoomList());
    res.json({ success: true });
  });

  return router;
};
