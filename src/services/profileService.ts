import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, orderBy, limit, onSnapshot, getDocs, where, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '../../shared/types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export const profileService = {
  getProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const publicRef = doc(db, 'users', uid);
      const privateRef = doc(db, 'users_private', uid);
      
      const [publicSnap, privateSnap] = await Promise.all([
        getDoc(publicRef),
        getDoc(privateRef)
      ]);
      
      if (!publicSnap.exists()) return null;
      
      const publicData = publicSnap.data();
      const privateData = privateSnap.exists() ? privateSnap.data() : {};
      
      return {
        ...publicData,
        ...privateData,
        uid
      } as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
      return null;
    }
  },
  
  createProfile: async (uid: string, data: Partial<UserProfile>) => {
    try {
      const publicRef = doc(db, 'users', uid);
      const privateRef = doc(db, 'users_private', uid);
      
      const createdAt = new Date().toISOString();
      const role = 'user'; // Default role
      
      const publicProfile = {
        uid,
        displayName: data.displayName || 'Player',
        photoURL: data.photoURL || '',
        role,
        createdAt,
        kills: 0,
        deaths: 0,
        matchesPlayed: 0,
        gameData: { level: 1, coins: 0 }
      };
      
      const privateProfile = {
        email: data.email || '',
        authType: data.authType || 'guest'
      };
      
      await Promise.all([
        setDoc(publicRef, publicProfile),
        setDoc(privateRef, privateProfile)
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${uid}`);
    }
  },
  
  updateProfile: async (uid: string, data: Partial<UserProfile>) => {
    try {
      const publicRef = doc(db, 'users', uid);
      const privateRef = doc(db, 'users_private', uid);
      
      const publicUpdates: any = {};
      const privateUpdates: any = {};
      
      const publicFields = ['displayName', 'photoURL', 'role', 'kills', 'deaths', 'matchesPlayed', 'gameData'];
      const privateFields = ['email', 'authType'];
      
      Object.keys(data).forEach(key => {
        if (publicFields.includes(key)) publicUpdates[key] = (data as any)[key];
        if (privateFields.includes(key)) privateUpdates[key] = (data as any)[key];
      });
      
      const promises = [];
      if (Object.keys(publicUpdates).length > 0) promises.push(updateDoc(publicRef, publicUpdates));
      if (Object.keys(privateUpdates).length > 0) promises.push(updateDoc(privateRef, privateUpdates));
      
      await Promise.all(promises);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  subscribeToLeaderboard: (callback: (data: UserProfile[]) => void) => {
    const q = query(collection(db, 'users'), orderBy('kills', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const leaderboard = snapshot.docs.map(doc => doc.data() as UserProfile);
      callback(leaderboard);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  },

  resetAllProfiles: async () => {
    try {
      const publicSnapshot = await getDocs(collection(db, 'users'));
      const privateSnapshot = await getDocs(collection(db, 'users_private'));
      
      const deletePromises = [
        ...publicSnapshot.docs.map(d => deleteDoc(doc(db, 'users', d.id))),
        ...privateSnapshot.docs.map(d => deleteDoc(doc(db, 'users_private', d.id)))
      ];
      
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'users');
    }
  },

  deleteProfile: async (uid: string) => {
    try {
      await Promise.all([
        deleteDoc(doc(db, 'users', uid)),
        deleteDoc(doc(db, 'users_private', uid))
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
    }
  },

  resetProfileStats: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        kills: 0,
        deaths: 0,
        matchesPlayed: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  isNicknameAvailable: async (nickname: string, currentUid?: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('displayName', '==', nickname.trim())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return true;
      
      if (currentUid) {
        return querySnapshot.docs.every(doc => doc.id === currentUid);
      }
      
      return false;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      return false;
    }
  }
};
