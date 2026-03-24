import { auth } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut
} from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  signInWithGoogle: () => signInWithPopup(auth, googleProvider),
  signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
  registerWithEmail: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  signInAsGuest: () => signInAnonymously(auth),
  signOut: () => signOut(auth),
};
