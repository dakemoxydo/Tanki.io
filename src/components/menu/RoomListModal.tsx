import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { WindowContainer } from '../ui/WindowContainer';

interface RoomListModalProps {
  roomList: any[];
  isLoadingRooms: boolean;
  onFetchRooms: () => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string, maxPlayers: number) => void;
  onClose: () => void;
}

export const RoomListModal: React.FC<RoomListModalProps> = ({ 
  roomList, 
  isLoadingRooms, 
  onFetchRooms, 
  onJoinRoom, 
  onCreateRoom,
  onClose 
}) => {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(10);

  const handleCreate = () => {
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName, maxPlayers);
    }
  };

  return (
    <WindowContainer 
      isOpen={true} 
      onClose={onClose} 
      title={isCreating ? t('Create Server') : t('Server List')}
      maxWidth="max-w-2xl"
    >
      {!isCreating ? (
        <>
          <div className="flex justify-end items-center mb-6 gap-2">
            <button 
              onClick={() => setIsCreating(true)}
              className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition text-white"
              title={t('Create Server')}
            >
              <Plus size={20} />
            </button>
            <button onClick={onFetchRooms} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <Loader2 className={isLoadingRooms ? 'animate-spin' : ''} size={20} />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {roomList.map((room) => (
              <div key={room.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between hover:border-blue-500/50 transition-colors">
                <div>
                  <div className="font-bold text-lg">{room.id}</div>
                  <div className="text-sm text-slate-500">{room.players} / {room.maxPlayers} {t('Players')}</div>
                </div>
                <button 
                  onClick={() => onJoinRoom(room.id)}
                  disabled={room.players >= room.maxPlayers}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                >
                  {t('Join')}
                </button>
              </div>
            ))}
            {roomList.length === 0 && !isLoadingRooms && (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">{t('No servers available. Create one!')}</p>
                <button 
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} /> {t('Create Server')}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setIsCreating(false)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <h3 className="text-2xl font-bold">{t('Create Server')}</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {t('Server Name')}
              </label>
              <input 
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder={t('Enter server name...')}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={20}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-400">
                  {t('Max Players')}
                </label>
                <span className="text-blue-400 font-bold">{maxPlayers}</span>
              </div>
              <input 
                type="range"
                min="2"
                max="20"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button 
              onClick={handleCreate}
              disabled={!newRoomName.trim()}
              className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold rounded-xl transition-colors text-lg"
            >
              {t('Create')}
            </button>
          </div>
        </>
      )}
    </WindowContainer>
  );
};
