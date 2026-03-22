/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useGameStore } from './store';
import MainMenu from './components/MainMenu';
import { Game } from './components/Game';
import './i18n';
import { db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  const { mode } = useGameStore();

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <>
      {mode === 'menu' ? <MainMenu /> : <Game />}
    </>
  );
}
