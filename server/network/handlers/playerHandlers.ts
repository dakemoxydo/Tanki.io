import { Socket } from 'socket.io';
import { Room } from '../../game/Room.js';

export const handleMove = (socket: Socket, currentRoom: Room | null, data: any) => {
  if (currentRoom) {
    currentRoom.movePlayer(socket.id, data.x, data.z, data.rotation, data.turretRotation);
  }
};

export const handleShoot = (socket: Socket, currentRoom: Room | null, data: any) => {
  if (currentRoom) {
    currentRoom.addBullet(socket.id, data.x, data.z, data.vx, data.vz);
  }
};
