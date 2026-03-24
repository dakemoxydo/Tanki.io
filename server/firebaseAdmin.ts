import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let db: FirebaseFirestore.Firestore | null = null;

export function getAdminDb() {
  if (db) return db;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    let serviceAccount: any = null;
    
    const localKeyPath = path.join(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(localKeyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf-8'));
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }
    
    if (!serviceAccount) {
      console.warn('Firebase Service Account Key is missing. Server-side stats updates will be disabled.');
      return null;
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: config.projectId,
      });
    }

    db = getFirestore(config.firestoreDatabaseId || '(default)');
    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return null;
  }
}
