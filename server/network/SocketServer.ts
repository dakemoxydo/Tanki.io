import { Server, Socket } from 'socket.io';
import { RoomManager } from '../game/RoomManager';
import { Room } from '../game/Room';
import { GAME_TICK_RATE } from '../../shared/constants';
import { handleListRooms, handleJoinRoom, handleCreateRoom } from './handlers/roomHandlers';
import { handleMove, handleShoot } from './handlers/playerHandlers';

export class SocketServer {
  io: Server;
  roomManager: RoomManager;

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;

    this.init();
    this.startLoop();
  }

  private init() {
    this.io.on('connection', (socket: Socket) => {
      console.log('User connected:', socket.id);
      
      let currentRoom: Room | null = null;
      const setCurrentRoom = (room: Room) => { currentRoom = room; };

      socket.on('listRooms', () => handleListRooms(socket, this.roomManager));

      socket.on('join', (data) => handleJoinRoom(this.io, socket, this.roomManager, data, setCurrentRoom, currentRoom));

      socket.on('createRoom', (data) => handleCreateRoom(this.io, socket, this.roomManager, data, setCurrentRoom, currentRoom));

      socket.on('forceReloadAll', () => {
        this.io.emit('forceUpdate');
      });

      socket.on('move', (data) => handleMove(socket, currentRoom, data));

      socket.on('shoot', (data) => handleShoot(socket, currentRoom, data));

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (currentRoom) {
          currentRoom.removePlayer(socket.id);
          this.io.to(currentRoom.id).emit('playerLeft', socket.id);
          
          // Broadcast updated room list to everyone
          this.io.emit('roomList', this.roomManager.getRoomList());
        }
      });
    });
  }

  private startLoop() {
    let lastTime = performance.now();
    
    setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000; // delta in seconds
      lastTime = now;

      this.roomManager.update(
        delta,
        (roomId, state) => this.io.to(roomId).emit('stateUpdate', state),
        (roomId, event, data) => {
          this.io.to(roomId).emit(event, data);
          if (event === 'roomEmptyTimeout') {
            this.io.emit('roomList', this.roomManager.getRoomList());
          }
        }
      );
    }, 1000 / GAME_TICK_RATE);
  }
}
