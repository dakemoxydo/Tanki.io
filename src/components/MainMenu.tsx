import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { Play, Users, Settings, Zap, Search, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { useNetworkSync } from '../hooks/useNetworkSync';
import { Modal } from './ui/Modal';

import { UserProfile } from '../../shared/types';
import { profileService } from '../services/profileService';

import { LeaderboardView } from './menu/LeaderboardView';
import { ProfileSection } from './menu/ProfileSection';
import { SettingsModal } from './menu/SettingsModal';
import { RoomListModal } from './menu/RoomListModal';
import { GameModeSelection } from './menu/GameModeSelection';
import { AnimatePresence } from 'motion/react';

import { io, Socket } from 'socket.io-client';

export default function MainMenu() {
  const { setMode, user, setUser, profile, setProfile, language, setLanguage, setSelectedRoomId } = useGameStore();
  const { t, i18n } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [roomList, setRoomList] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { createRoom } = useNetworkSync();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = profileService.subscribeToLeaderboard((data) => {
      setLeaderboard(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showRoomSelection) {
      const url = import.meta.env.VITE_APP_URL || window.location.origin;
      const newSocket = io(url);
      
      newSocket.on('connect', () => {
        newSocket.emit('listRooms');
      });

      newSocket.on('roomList', (data) => {
        setRoomList(data);
        setIsLoadingRooms(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [showRoomSelection]);

  const handleLogout = async () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: t('Logout'),
      message: t('Are you sure you want to perform this action?'),
      onConfirm: async () => {
        try {
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setMode('menu');
        } catch (error) {
          console.error(error);
        }
        setModalConfig(null);
      }
    });
  };

  const handleSaveName = async (newName: string) => {
    let trimmedName = newName.trim();
    if (!trimmedName) {
      trimmedName = 'Player' + Math.floor(10000 + Math.random() * 90000);
    }
    if (!user) return;
    
    const nameRegex = /^[a-zA-Z0-9а-яА-ЯёЁ\s]{1,20}$/;
    if (!nameRegex.test(trimmedName)) {
      alert(t('Nickname must be 1-20 characters and contain only letters and numbers'));
      return;
    }

    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), { displayName: trimmedName });
      if (profile) setProfile({ ...profile, displayName: trimmedName });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users/' + user.uid);
    }
  };

  const handleResetDatabase = async () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: t('Reset All Profiles'),
      message: t('Are you sure you want to delete ALL user profiles? This action cannot be undone.'),
      onConfirm: async () => {
        try {
          await profileService.resetAllProfiles();
          setModalConfig({
            isOpen: true,
            type: 'alert',
            title: t('Success'),
            message: t('Database reset successful. Please refresh the page.'),
            onConfirm: () => window.location.reload()
          });
        } catch (e) {
          console.error('Reset failed:', e);
          setModalConfig({
            isOpen: true,
            type: 'alert',
            title: t('Error'),
            message: t('Reset failed: ') + (e instanceof Error ? e.message : String(e)),
            onConfirm: () => setModalConfig(null)
          });
        }
      }
    });
  };

  const handleStopAllRooms = async () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: t('Stop All Servers'),
      message: t('Are you sure you want to stop ALL game servers? All players will be kicked to the main menu.'),
      onConfirm: async () => {
        try {
          const response = await fetch('/api/stop-all-rooms', { method: 'POST' });
          if (response.ok) {
            setModalConfig({
              isOpen: true,
              type: 'alert',
              title: t('Success'),
              message: t('All servers stopped successfully.'),
              onConfirm: () => setModalConfig(null)
            });
          }
        } catch (e) {
          console.error('Failed to stop rooms:', e);
          setModalConfig({
            isOpen: true,
            type: 'alert',
            title: t('Error'),
            message: t('Failed to stop rooms'),
            onConfirm: () => setModalConfig(null)
          });
        }
      }
    });
  };

  const handleForceReloadAll = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: t('Force Reload All'),
      message: t('This will force all connected players to reload their page. Continue?'),
      onConfirm: () => {
        if (socket) {
          socket.emit('forceReloadAll');
        }
        setModalConfig(null);
      }
    });
  };

  const fetchRooms = () => {
    if (socket) {
      setIsLoadingRooms(true);
      socket.emit('listRooms');
    }
  };

  const handleQuickPlay = () => {
    setIsSearching(true);
    setSelectedRoomId('quickPlay');
    setTimeout(() => {
      startGame('multiplayer');
    }, 1500);
  };

  const handleJoinRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    startGame('multiplayer');
  };

  const handleCreateRoom = (name: string, maxPlayers: number) => {
    createRoom(name, maxPlayers);
  };

  const startGame = async (newMode: 'multiplayer' | 'bots') => {
    if (user) {
      try {
        const { doc, updateDoc, increment } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', user.uid), { matchesPlayed: increment(1) });
        if (profile) {
          setProfile({ ...profile, matchesPlayed: (profile.matchesPlayed || 0) + 1 });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users/' + user.uid);
      }
    }
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-4">
        {user && profile && (
          <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition border border-slate-700">
            <Users size={20} />
            <span className="hidden sm:inline">{t('Profile')}</span>
          </button>
        )}
        <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition border border-slate-700">
          <Settings size={24} />
        </button>
      </div>

      {showSettings && (
        <SettingsModal 
          user={user}
          language={language}
          setLanguage={setLanguage}
          onResetDatabase={handleResetDatabase}
          onStopAllRooms={handleStopAllRooms}
          onForceReloadAll={handleForceReloadAll}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showProfile && user && profile && (
        <ProfileSection 
          user={user}
          profile={profile}
          onSaveName={handleSaveName}
          onLogout={handleLogout}
          onClose={() => setShowProfile(false)}
        />
      )}

      {isSearching && (
        <div className="fixed top-0 left-0 w-full h-1 bg-slate-900 z-[100]">
          <div className="h-full bg-green-500 animate-loading-bar"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest shadow-lg animate-bounce">
            {t('Searching for game')}...
          </div>
        </div>
      )}

      {showRoomSelection && (
        <RoomListModal 
          roomList={roomList}
          isLoadingRooms={isLoadingRooms}
          onFetchRooms={fetchRooms}
          onJoinRoom={handleJoinRoom}
          onCreateRoom={handleCreateRoom}
          onClose={() => setShowRoomSelection(false)}
        />
      )}

      <h1 className="text-6xl font-black mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        {t('Tanks.io')}
      </h1>

      <GameModeSelection 
        onQuickPlay={handleQuickPlay}
        onShowRoomSelection={() => { setShowRoomSelection(true); fetchRooms(); }}
        onPlayVsBots={() => startGame('bots')}
      />

      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => setShowLeaderboard(true)}
          className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 shadow-lg"
        >
          <Trophy size={24} className="text-yellow-400" />
          {t('Leaderboard')}
        </button>
      </div>

      {showLeaderboard && (
        <LeaderboardView 
          leaderboard={leaderboard} 
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}


      {modalConfig && (
        <Modal
          isOpen={modalConfig.isOpen}
          type={modalConfig.type}
          title={modalConfig.title}
          message={modalConfig.message}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig(null)}
        />
      )}
    </div>
  );
}
