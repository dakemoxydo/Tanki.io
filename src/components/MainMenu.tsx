import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { LogIn, LogOut, Play, Users, Settings, Trophy, MessageSquare, Loader2 } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';
import { askTacticalAdvisor } from '../services/geminiService';

export default function MainMenu() {
  const { setMode, user, setUser, language, setLanguage } = useGameStore();
  const { t, i18n } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorAnswer, setAdvisorAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Player',
              kills: 0,
              deaths: 0,
              matchesPlayed: 0
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users/' + currentUser.uid);
        }
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('kills', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
        });
        setLeaderboard(data);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }
    };
    fetchLeaderboard();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const startGame = async (newMode: 'multiplayer' | 'bots') => {
    setMode(newMode);
    if (user) {
      try {
        const { doc, updateDoc, increment } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', user.uid), {
          matchesPlayed: increment(1)
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, 'users/' + user.uid);
      }
    }
  };

  const handleAskAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuestion.trim()) return;
    
    setIsThinking(true);
    setAdvisorAnswer('');
    const answer = await askTacticalAdvisor(advisorQuestion, language);
    setAdvisorAnswer(answer);
    setIsThinking(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-4">
        <button onClick={() => setShowAdvisor(!showAdvisor)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-500 transition">
          <MessageSquare size={20} />
          <span className="hidden sm:inline">{t('Tactical Advisor')}</span>
        </button>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
          <Settings size={24} />
        </button>
        {user ? (
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <LogOut size={20} />
            <span className="hidden sm:inline">{t('Logout')}</span>
          </button>
        ) : (
          <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-500 transition">
            <LogIn size={20} />
            <span className="hidden sm:inline">{t('Login with Google')}</span>
          </button>
        )}
      </div>

      {showSettings && (
        <div className="absolute top-16 right-4 bg-slate-800 p-4 rounded-xl shadow-xl z-50">
          <h3 className="text-lg font-bold mb-4">{t('Settings')}</h3>
          <div className="flex items-center justify-between gap-4">
            <span>{t('Language')}</span>
            <button onClick={toggleLanguage} className="px-3 py-1 bg-slate-700 rounded hover:bg-slate-600">
              {language === 'ru' ? 'Русский' : 'English'}
            </button>
          </div>
        </div>
      )}

      {showAdvisor && (
        <div className="absolute top-16 right-4 w-96 bg-slate-800 p-6 rounded-xl shadow-2xl z-50 border border-purple-500/30">
          <h3 className="text-xl font-bold mb-4 text-purple-400 flex items-center gap-2">
            <MessageSquare /> {t('Tactical Advisor')}
          </h3>
          <form onSubmit={handleAskAdvisor} className="flex flex-col gap-3">
            <input 
              type="text" 
              value={advisorQuestion}
              onChange={(e) => setAdvisorQuestion(e.target.value)}
              placeholder={t('Ask about tactics...')}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              type="submit" 
              disabled={isThinking || !advisorQuestion.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-2 rounded transition-colors flex justify-center items-center gap-2"
            >
              {isThinking ? <><Loader2 className="animate-spin" size={20} /> {t('Thinking...')}</> : t('Ask Advisor')}
            </button>
          </form>
          {advisorAnswer && (
            <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700 text-sm whitespace-pre-wrap">
              {advisorAnswer}
            </div>
          )}
        </div>
      )}

      <h1 className="text-6xl font-black mb-12 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        {t('Tanks.io')}
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button 
          onClick={() => startGame('multiplayer')}
          className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-400 text-slate-900 font-bold text-xl rounded-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <Users size={28} />
          {t('Play Multiplayer')}
        </button>
        
        <button 
          onClick={() => startGame('bots')}
          className="flex items-center justify-center gap-3 w-full py-4 bg-blue-500 hover:bg-blue-400 text-slate-900 font-bold text-xl rounded-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <Play size={28} />
          {t('Play vs Bots')}
        </button>
      </div>

      <div className="mt-12 w-full max-w-2xl bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          {t('Leaderboard')}
        </h3>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-4 p-3 bg-slate-900 rounded-lg font-bold text-sm text-slate-400">
            <div className="col-span-2">Player</div>
            <div className="text-center">{t('Kills')}</div>
            <div className="text-center">{t('Matches')}</div>
          </div>
          {leaderboard.map((player, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-4 p-3 bg-slate-800/50 hover:bg-slate-700 rounded-lg border border-slate-700/50 transition-colors">
              <div className="col-span-2 font-medium flex items-center gap-3">
                <span className="text-slate-500 w-4">{idx + 1}.</span>
                {player.displayName}
              </div>
              <div className="text-center font-mono text-green-400">{player.kills}</div>
              <div className="text-center font-mono text-blue-400">{player.matchesPlayed}</div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center p-4 text-slate-500">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
