import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ClientEngine } from '../game/core/ClientEngine';
import { Scene } from '../game/render/Scene';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../store';

import { useNetworkSync } from '../hooks/useNetworkSync';
import { useGameInput } from '../hooks/useGameInput';

import { GameOverlay } from './game/GameOverlay';
import { Modal } from './ui/Modal';

import * as THREE from 'three';

export const Game = () => {
  const { t, i18n } = useTranslation();
  const { language, setLanguage, setMode, selectedRoomId } = useGameStore();
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  
  const { 
    socketId, 
    isLoading, 
    isJoined, 
    killFeed, 
    explosions, 
    respawnTime, 
    network 
  } = useNetworkSync();

  const {
    isLocked,
    isMenuOpen,
    isTabPressed,
    input,
    requestPointerLock
  } = useGameInput();

  const engineRef = useRef<ClientEngine | null>(null);

  useEffect(() => {
    if (network && input) {
      engineRef.current = new ClientEngine(network, input);
    }
  }, [network, input]);

  const toggleLanguage = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleBackToMenu = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    if (network) {
      network.disconnect();
    }
    setMode('menu');
  };

  const addBot = async () => {
    await fetch('/api/add-bot', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoomId })
    });
  };

  const clearBots = async () => {
    await fetch('/api/clear-bots', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoomId })
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 animate-pulse">
          {t('Connecting to server...')}
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-900 relative" onClick={!isLocked ? requestPointerLock : undefined}>
      <GameOverlay 
        socketId={socketId}
        isLocked={isLocked}
        isJoined={isJoined}
        isMenuOpen={isMenuOpen}
        isTabPressed={isTabPressed}
        killFeed={killFeed}
        respawnTime={respawnTime}
        ping={network?.latency || 0}
        language={language}
        toggleLanguage={toggleLanguage}
        requestPointerLock={requestPointerLock}
        addBot={addBot}
        clearBots={clearBots}
        handleBackToMenu={handleBackToMenu}
      />

      <Modal
        isOpen={showExitConfirm}
        type="confirm"
        title={t('Exit to Menu')}
        message={t('Are you sure you want to perform this action?')}
        onConfirm={confirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />

      <Canvas 
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ antialias: true }}
        camera={{ position: [0, 10, 15], fov: 60 }}
      >
        {engineRef.current && (
          <Scene socketId={socketId} engine={engineRef.current} explosions={explosions} />
        )}
      </Canvas>
    </div>
  );
};
