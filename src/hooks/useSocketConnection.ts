import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkClient } from '../game/network/NetworkClient';
import { useGameStore } from '../store';

export const useSocketConnection = () => {
  const { t } = useTranslation();
  const { user, profile, selectedRoomId, setSelectedRoomId, setMode } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [socketId, setSocketId] = useState<string>('');
  const networkRef = useRef<NetworkClient | null>(null);
  if (!networkRef.current) {
    networkRef.current = new NetworkClient();
  }
  const network = networkRef.current;
  const skipNextReconnectRef = useRef(false);

  useEffect(() => {
    if (skipNextReconnectRef.current) {
      skipNextReconnectRef.current = false;
      return;
    }

    const name = profile?.displayName || `Player${Math.floor(10000 + Math.random() * 90000)}`;
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const url = import.meta.env.VITE_APP_URL || window.location.origin;

    setIsLoading(true);

    const onInit = (data: any) => {
      if (data.roomId && data.roomId !== selectedRoomId) {
        skipNextReconnectRef.current = true;
        setSelectedRoomId(data.roomId);
      }
      setIsLoading(false);
      setIsJoined(true);
      if (network.socket?.id) {
        setSocketId(network.socket.id);
      }
    };

    const onError = (data: any) => {
      alert(t(data.message || 'An error occurred'));
      setMode('menu');
    };

    const onServerShutdown = () => {
      alert(t('Server was stopped by administrator'));
      setMode('menu');
    };

    const onForceUpdate = () => {
      window.location.reload();
    };

    const onPlayerKicked = (data: any) => {
      if (data.id === network.socket?.id) {
        alert(t(`You were kicked from the match. Reason: ${data.reason}`));
        setMode('menu');
      }
    };

    network.on('init', onInit);
    network.on('error', onError);
    network.on('serverShutdown', onServerShutdown);
    network.on('forceUpdate', onForceUpdate);
    network.on('playerKicked', onPlayerKicked);

    network.connect(url, name, color, selectedRoomId, user?.uid);

    return () => {
      network.off('init', onInit);
      network.off('error', onError);
      network.off('serverShutdown', onServerShutdown);
      network.off('forceUpdate', onForceUpdate);
      network.off('playerKicked', onPlayerKicked);
      
      if (!skipNextReconnectRef.current) {
        network.disconnect();
      }
    };
  }, [user?.uid, profile?.displayName, selectedRoomId, setMode, setSelectedRoomId]);

  const createRoom = (roomName: string, maxPlayers: number) => {
    const network = networkRef.current;
    const name = profile?.displayName || `Player${Math.floor(10000 + Math.random() * 90000)}`;
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const url = import.meta.env.VITE_APP_URL || window.location.origin;

    network.disconnect();
    network.createRoom(url, roomName, maxPlayers, name, color, user?.uid);
    setSelectedRoomId(roomName);
    setMode('multiplayer');
  };

  return {
    network: networkRef.current,
    socketId,
    isLoading,
    isJoined,
    createRoom
  };
};
