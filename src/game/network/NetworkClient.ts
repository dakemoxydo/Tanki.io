import { io, Socket } from 'socket.io-client';

export class NetworkClient {
  socket: Socket | null = null;
  onStateUpdate: (state: any) => void = () => {};
  onInit: (data: any) => void = () => {};
  onPlayerKilled: (data: any) => void = () => {};
  onBotKilled: (data: any) => void = () => {};
  onBulletDestroyed: (bulletId: string) => void = () => {};

  connect(url: string, name: string, color: string) {
    this.socket = io(url);
    this.socket.on('connect', () => {
      this.socket?.emit('join', { name, color });
    });

    this.socket.on('init', (data) => this.onInit(data));
    this.socket.on('stateUpdate', (state) => this.onStateUpdate(state));
    this.socket.on('playerKilled', (data) => this.onPlayerKilled(data));
    this.socket.on('botKilled', (data) => this.onBotKilled(data));
    this.socket.on('bulletDestroyed', (id) => this.onBulletDestroyed(id));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}
