import { io, Socket } from 'socket.io-client';

export class NetworkClient {
  socket: Socket | null = null;
  currentRoomId: string | null = null;
  latency: number = 0;
  private handlers: Record<string, Set<Function>> = {};

  on(event: string, handler: Function) {
    if (!this.handlers[event]) this.handlers[event] = new Set();
    this.handlers[event].add(handler);
    
    // If socket is already connected, attach it now
    if (this.socket) {
      this.socket.on(event, handler as any);
    }
  }

  off(event: string, handler: Function) {
    this.handlers[event]?.delete(handler);
    if (this.socket) {
      this.socket.off(event, handler as any);
    }
  }

  private setupSocketListeners(socket: Socket) {
    Object.entries(this.handlers).forEach(([event, handlers]) => {
      handlers.forEach(handler => {
        socket.on(event, handler as any);
      });
    });

    // Internal listeners for state management
    socket.on('init', (data) => {
      this.currentRoomId = data.roomId;
    });
  }

  connect(url: string, name: string, color: string, roomId: string = 'quickPlay', userId?: string) {
    if (this.socket?.connected && this.currentRoomId === roomId) {
      return;
    }
    
    this.disconnect();
    this.currentRoomId = roomId;
    this.socket = io(url);
    
    this.setupSocketListeners(this.socket);
    
    this.socket.on('connect', () => {
      this.socket?.emit('join', { name, color, roomId, userId });
    });
  }

  createRoom(url: string, roomName: string, maxPlayers: number, playerName: string, playerColor: string, userId?: string) {
    this.disconnect();
    this.currentRoomId = roomName;
    this.socket = io(url);
    
    this.setupSocketListeners(this.socket);
    
    this.socket.on('connect', () => {
      this.socket?.emit('createRoom', { name: roomName, maxPlayers, playerName, playerColor, userId });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentRoomId = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}
