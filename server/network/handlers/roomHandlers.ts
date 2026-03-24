import { Server, Socket } from 'socket.io';
import { RoomManager } from '../../game/RoomManager.js';
import { Room } from '../../game/Room.js';

export const handleListRooms = (socket: Socket, roomManager: RoomManager) => {
  socket.emit('roomList', roomManager.getRoomList());
};

export const handleJoinRoom = (
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
  data: any,
  setCurrentRoom: (room: Room) => void,
  currentRoom: Room | null
) => {
  const roomId = data.roomId;
  let room: Room;

  if (currentRoom) {
    currentRoom.removePlayer(socket.id);
    io.to(currentRoom.id).emit('playerLeft', socket.id);
  }

  if (roomId === 'quickPlay') {
    room = roomManager.findQuickPlayRoom();
  } else {
    room = roomManager.getRoom(roomId) || roomManager.createRoom(roomId);
  }

  if (Object.keys(room.players).length >= room.maxPlayers) {
    socket.emit('error', { message: 'Room is full' });
    return;
  }

  setCurrentRoom(room);
  socket.join(room.id);
  
  room.addPlayer(socket.id, data.name || 'Player', data.color || '#4ade80', data.userId);
  
  socket.emit('init', { 
    roomId: room.id,
    obstacles: room.obstacles.map(o => o.serialize()) 
  });
  
  socket.emit('stateUpdate', room.serializeState());
  
  // Broadcast updated room list to everyone
  io.emit('roomList', roomManager.getRoomList());
};

export const handleCreateRoom = (
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
  data: any,
  setCurrentRoom: (room: Room) => void,
  currentRoom: Room | null
) => {
  const { name, maxPlayers, playerName, playerColor } = data;
  
  if (currentRoom) {
    currentRoom.removePlayer(socket.id);
    io.to(currentRoom.id).emit('playerLeft', socket.id);
  }

  if (!name || name.trim() === '') {
    socket.emit('error', { message: 'Room name is required' });
    return;
  }

  if (roomManager.getRoom(name)) {
    socket.emit('error', { message: 'Room already exists' });
    return;
  }

  const room = roomManager.createRoom(name, maxPlayers);
  setCurrentRoom(room);
  socket.join(room.id);
  
  room.addPlayer(socket.id, playerName || 'Player', playerColor || '#4ade80', data.userId);
  
  socket.emit('init', { 
    roomId: room.id,
    obstacles: room.obstacles.map(o => o.serialize()) 
  });
  
  socket.emit('stateUpdate', room.serializeState());
  
  // Broadcast updated room list to everyone
  io.emit('roomList', roomManager.getRoomList());
};
