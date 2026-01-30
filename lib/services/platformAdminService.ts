import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Platform Admin Management
export class PlatformAdminService {
  private platformAdminsDoc = doc(db, 'system', 'platformAdmins');

  async isPlatformAdmin(userId: string): Promise<boolean> {
    try {
      const docSnap = await getDoc(this.platformAdminsDoc);
      if (!docSnap.exists()) {
        return false;
      }
      const data = docSnap.data();
      return data.adminIds?.includes(userId) || false;
    } catch (error) {
      console.error('Error checking platform admin:', error);
      return false;
    }
  }

  async addPlatformAdmin(userId: string): Promise<void> {
    const docSnap = await getDoc(this.platformAdminsDoc);
    
    if (!docSnap.exists()) {
      await setDoc(this.platformAdminsDoc, {
        adminIds: [userId],
        createdAt: new Date(),
      });
    } else {
      const data = docSnap.data();
      const adminIds = data.adminIds || [];
      if (!adminIds.includes(userId)) {
        await updateDoc(this.platformAdminsDoc, {
          adminIds: [...adminIds, userId],
        });
      }
    }
  }

  async removePlatformAdmin(userId: string): Promise<void> {
    const docSnap = await getDoc(this.platformAdminsDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const adminIds = (data.adminIds || []).filter((id: string) => id !== userId);
      await updateDoc(this.platformAdminsDoc, {
        adminIds,
      });
    }
  }

  async listPlatformAdmins(): Promise<string[]> {
    const docSnap = await getDoc(this.platformAdminsDoc);
    if (!docSnap.exists()) {
      return [];
    }
    return docSnap.data().adminIds || [];
  }
}

export const platformAdminService = new PlatformAdminService();
