import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Organization, CreateOrganizationInput } from '../organizationTypes';

export class OrganizationService {
  private organizationsCollection = collection(db, 'organizations');

  async createOrganization(data: CreateOrganizationInput): Promise<Organization> {
    const orgRef = doc(this.organizationsCollection);
    const now = Timestamp.now();
    
    const organization: Organization = {
      id: orgRef.id,
      ...data,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(orgRef, organization);
    return organization;
  }

  async getOrganization(orgId: string): Promise<Organization | null> {
    const orgRef = doc(this.organizationsCollection, orgId);
    const orgSnap = await getDoc(orgRef);
    
    if (!orgSnap.exists()) {
      return null;
    }
    
    return orgSnap.data() as Organization;
  }

  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<Organization> {
    const orgRef = doc(this.organizationsCollection, orgId);
    
    await updateDoc(orgRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    const updated = await this.getOrganization(orgId);
    if (!updated) {
      throw new Error('Organization not found after update');
    }
    
    return updated;
  }

  async addAdmin(orgId: string, userId: string): Promise<void> {
    const orgRef = doc(this.organizationsCollection, orgId);
    await updateDoc(orgRef, {
      adminIds: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  }

  async removeAdmin(orgId: string, userId: string): Promise<void> {
    const org = await this.getOrganization(orgId);
    if (!org) {
      throw new Error('Organization not found');
    }
    
    // Prevent removing last admin
    if (org.adminIds.length <= 1) {
      throw new Error('Cannot remove the last admin from organization');
    }
    
    const orgRef = doc(this.organizationsCollection, orgId);
    await updateDoc(orgRef, {
      adminIds: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const q = query(
      this.organizationsCollection,
      where('adminIds', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Organization);
  }

  async isUserAdmin(userId: string, orgId: string): Promise<boolean> {
    const org = await this.getOrganization(orgId);
    return org ? org.adminIds.includes(userId) : false;
  }
}

export const organizationService = new OrganizationService();
