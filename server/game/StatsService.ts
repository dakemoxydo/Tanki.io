import { getAdminDb } from '../firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export class StatsService {
  static async incrementKills(userId: string) {
    const db = getAdminDb();
    if (!db) return;
    try {
      await db.collection('users').doc(userId).update({
        kills: FieldValue.increment(1)
      });
    } catch (e) {
      console.error('Failed to update kills:', e);
    }
  }

  static async incrementDeaths(userId: string) {
    const db = getAdminDb();
    if (!db) return;
    try {
      await db.collection('users').doc(userId).update({
        deaths: FieldValue.increment(1)
      });
    } catch (e) {
      console.error('Failed to update deaths:', e);
    }
  }
}
