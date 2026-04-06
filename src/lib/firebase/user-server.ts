import { getFirebaseAdmin } from './server';
import { COLLECTIONS } from './collections';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { db } = getFirebaseAdmin();
  if (!db) return null;

  const snap = await db.collection(COLLECTIONS.users).doc(uid).get();
  if (!snap.exists) return null;

  return { id: snap.id, ...(snap.data() as any) } as UserProfile;
}