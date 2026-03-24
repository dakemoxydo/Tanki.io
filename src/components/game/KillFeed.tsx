import React from 'react';

interface KillFeedProps {
  messages: { id: string, message: string }[];
}

export const KillFeed: React.FC<KillFeedProps> = ({ messages }) => {
  return (
    <div className="absolute top-20 right-4 z-10 flex flex-col items-end gap-1 pointer-events-none">
      {messages.map(msg => (
        <div key={msg.id} className="bg-slate-800/80 text-white px-3 py-1 rounded text-sm font-medium animate-fade-in">
          {msg.message}
        </div>
      ))}
    </div>
  );
};
