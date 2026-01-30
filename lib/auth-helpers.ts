import { auth } from './firebase';

export async function getCurrentUserId(): Promise<string | null> {
  const user = auth.currentUser;
  return user?.uid || null;
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}
