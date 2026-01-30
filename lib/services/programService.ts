import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Program, CreateProgramInput } from '../organizationTypes';

export class ProgramService {
  private programsCollection = collection(db, 'programs');

  async createProgram(
    organizationId: string, 
    data: CreateProgramInput, 
    createdBy: string
  ): Promise<Program> {
    const programRef = doc(this.programsCollection);
    const now = Timestamp.now();
    
    const program: Program = {
      id: programRef.id,
      organizationId,
      name: data.name,
      description: data.description,
      startDate: Timestamp.fromDate(data.startDate),
      endDate: Timestamp.fromDate(data.endDate),
      status: 'active',
      participantIds: [],
      createdAt: now,
      updatedAt: now,
      createdBy,
    };

    await setDoc(programRef, program);
    return program;
  }

  async getProgram(programId: string): Promise<Program | null> {
    const programRef = doc(this.programsCollection, programId);
    const programSnap = await getDoc(programRef);
    
    if (!programSnap.exists()) {
      return null;
    }
    
    return programSnap.data() as Program;
  }

  async updateProgram(programId: string, updates: Partial<Program>): Promise<Program> {
    const programRef = doc(this.programsCollection, programId);
    
    await updateDoc(programRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    const updated = await this.getProgram(programId);
    if (!updated) {
      throw new Error('Program not found after update');
    }
    
    return updated;
  }

  async deleteProgram(programId: string): Promise<void> {
    const programRef = doc(this.programsCollection, programId);
    await deleteDoc(programRef);
  }

  async listPrograms(organizationId: string): Promise<Program[]> {
    const q = query(
      this.programsCollection,
      where('organizationId', '==', organizationId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Program);
  }

  async addParticipant(programId: string, userId: string): Promise<void> {
    const programRef = doc(this.programsCollection, programId);
    await updateDoc(programRef, {
      participantIds: arrayUnion(userId),
      updatedAt: Timestamp.now(),
    });
  }

  async removeParticipant(programId: string, userId: string): Promise<void> {
    const programRef = doc(this.programsCollection, programId);
    await updateDoc(programRef, {
      participantIds: arrayRemove(userId),
      updatedAt: Timestamp.now(),
    });
  }
}

export const programService = new ProgramService();
