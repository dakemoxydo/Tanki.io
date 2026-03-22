import { Server, Socket } from 'socket.io';
import { GameEngine } from '../game/GameEngine.js';

export class SocketServer {
  io: Server;
  game: GameEngine;

  constructor(io: Server, game: GameEngine) {
    this.io = io;
    this.game = game;

    this.game.onStateUpdate = (state) => {
      this.io.emit('stateUpdate', state);
    };

    this.game.onEvent = (event, data) => {
      this.io.emit(event, data);
    };

    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (data) => {
        this.game.addPlayer(socket.id, data.name || 'Player', data.color || '#4ade80');
        socket.emit('init', { obstacles: this.game.obstacles.map(o => o.serialize()) });
        socket.emit('stateUpdate', this.game.serializeState());
      });

      socket.on('move', (data) => {
        this.game.movePlayer(socket.id, data.x, data.z, data.rotation, data.turretRotation);
      });

      socket.on('shoot', (data) => {
        this.game.addBullet(socket.id, data.x, data.z, data.vx, data.vz);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        this.game.removePlayer(socket.id);
        this.io.emit('playerLeft', socket.id);
      });
    });
  }
}
