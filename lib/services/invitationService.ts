import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Invitation, OrganizationMembership } from '../organizationTypes';

export class InvitationService {
  private invitationsCollection = collection(db, 'invitations');
  private membershipsCollection = collection(db, 'organizationMemberships');

  private generateToken(): string {
    // Generate a random token using Web Crypto API (works in both browser and Node.js)
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.randomBytes(32).toString('hex');
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async createInvitation(
    organizationId: string,
    email: string,
    invitedBy: string,
    programId?: string
  ): Promise<Invitation> {
    // Check for duplicate
    const existing = await this.checkDuplicateInvitation(organizationId, email);
    if (existing) {
      throw new Error('Invitation already exists for this email');
    }

    const invitationRef = doc(this.invitationsCollection);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const invitation: Invitation = {
      id: invitationRef.id,
      organizationId,
      programId,
      email,
      status: 'pending',
      invitedBy,
      invitedAt: now,
      expiresAt,
      token: this.generateToken(),
    };

    await setDoc(invitationRef, invitation);
    return invitation;
  }

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const q = query(
      this.invitationsCollection,
      where('token', '==', token)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    return snapshot.docs[0].data() as Invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<OrganizationMembership> {
    const invitation = await this.getInvitationByToken(token);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }
    
    if (invitation.status !== 'pending') {
      throw new Error('Invitation is not pending');
    }
    
    if (invitation.expiresAt.toMillis() < Date.now()) {
      throw new Error('Invitation has expired');
    }

    // Update invitation status
    const invitationRef = doc(this.invitationsCollection, invitation.id);
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });

    // Create membership
    const membershipRef = doc(this.membershipsCollection);
    const membership: OrganizationMembership = {
      id: membershipRef.id,
      userId,
      organizationId: invitation.organizationId,
      role: 'participant',
      programIds: invitation.programId ? [invitation.programId] : [],
      joinedAt: Timestamp.now(),
      invitationId: invitation.id,
      status: 'active',
    };

    await setDoc(membershipRef, membership);
    return membership;
  }

  async listInvitations(organizationId: string): Promise<Invitation[]> {
    const q = query(
      this.invitationsCollection,
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Invitation);
  }

  async resendInvitation(invitationId: string): Promise<void> {
    const invitationRef = doc(this.invitationsCollection, invitationId);
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 30 * 24 * 60 * 60 * 1000);
    
    await updateDoc(invitationRef, {
      status: 'pending',
      invitedAt: now,
      expiresAt,
      token: this.generateToken(),
    });
  }

  async revokeInvitation(invitationId: string): Promise<void> {
    const invitationRef = doc(this.invitationsCollection, invitationId);
    await updateDoc(invitationRef, {
      status: 'revoked',
    });
  }

  private async checkDuplicateInvitation(organizationId: string, email: string): Promise<boolean> {
    const q = query(
      this.invitationsCollection,
      where('organizationId', '==', organizationId),
      where('email', '==', email),
      where('status', 'in', ['pending', 'accepted'])
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  async getUserMemberships(userId: string): Promise<OrganizationMembership[]> {
    const q = query(
      this.membershipsCollection,
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as OrganizationMembership);
  }
}

export const invitationService = new InvitationService();
