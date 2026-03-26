export interface Vector2 { x: number; z: number; }
export interface ObstacleData { id: string; x: number; z: number; width: number; depth: number; }
export interface PlayerData { id: string; name: string; x: number; z: number; rotation: number; turretRotation: number; health: number; score: number; kills?: number; deaths?: number; isBot: boolean; color: string; isDead?: boolean; deathTime?: number; isVisible?: boolean; }
export interface BulletData { id: string; ownerId: string; x: number; z: number; vx: number; vz: number; createdAt: number; }
export interface GameState { 
  players: Record<string, PlayerData>; 
  bullets: Record<string, BulletData>; 
  bots: Record<string, PlayerData>; 
  obstacles: ObstacleData[]; 
  time: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  authType: 'google' | 'email' | 'guest';
  role: 'user' | 'admin';
  createdAt: string;
  kills: number;
  deaths: number;
  matchesPlayed: number;
  gameData: {
    level: number;
    coins: number;
  };
}
