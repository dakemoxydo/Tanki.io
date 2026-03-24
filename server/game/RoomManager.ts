import { Room } from './Room';

export class RoomManager {
  rooms: Record<string, Room> = {};

  constructor() {
    // No default room by default
  }

  createRoom(id: string, maxPlayers: number = 10) {
    if (this.rooms[id]) return this.rooms[id];
    const room = new Room(id, maxPlayers);
    this.rooms[id] = room;
    return room;
  }

  getRoom(id: string) {
    return this.rooms[id];
  }

  removeRoom(id: string) {
    if (this.rooms[id]) {
      delete this.rooms[id];
      console.log(`Room ${id} removed due to being empty.`);
    }
  }

  findQuickPlayRoom() {
    // Find a room with space
    for (const id in this.rooms) {
      const room = this.rooms[id];
      if (Object.keys(room.players).length < room.maxPlayers) {
        return room;
      }
    }
    // Create new room if all full
    const newId = `Room ${Object.keys(this.rooms).length + 1}`;
    return this.createRoom(newId);
  }

  getRoomList() {
    return Object.values(this.rooms).map(room => ({
      id: room.id,
      players: Object.keys(room.players).length,
      maxPlayers: room.maxPlayers
    }));
  }

  update(delta: number, onStateUpdate: (roomId: string, state: any) => void, onEvent: (roomId: string, event: string, data: any) => void) {
    for (const id in this.rooms) {
      const room = this.rooms[id];
      room.onStateUpdate = (state) => onStateUpdate(id, state);
      room.onEvent = (event, data) => {
        if (event === 'roomEmptyTimeout') {
          this.removeRoom(id);
        }
        onEvent(id, event, data);
      };
      room.update(delta);
    }
  }
}
