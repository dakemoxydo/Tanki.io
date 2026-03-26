import { Socket } from 'socket.io';
import { Room } from '../../game/Room.js';
import { BULLET_SPEED } from '../../../shared/constants.js';

export const handleMove = (socket: Socket, currentRoom: Room | null, data: any) => {
  if (currentRoom) {
    currentRoom.movePlayer(socket.id, data.x, data.z, data.rotation, data.turretRotation, data.sequence, data.vx, data.vz);
  }
};

export const handleShoot = (socket: Socket, currentRoom: Room | null, data: any) => {
  if (currentRoom) {
    // Normalize velocity to prevent speed hacks
    const len = Math.hypot(data.vx, data.vz);
    let vx = data.vx;
    let vz = data.vz;
    if (len > 0) {
      vx = (data.vx / len) * BULLET_SPEED;
      vz = (data.vz / len) * BULLET_SPEED;
    }
    currentRoom.addBullet(socket.id, data.x, data.z, vx, vz);
  }
};
