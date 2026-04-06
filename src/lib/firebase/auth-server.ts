import type { NextRequest } from 'next/server';
import { getFirebaseAdmin } from './server';

export async function getUidFromRequest(req: NextRequest): Promise<string | null> {
  const { auth } = getFirebaseAdmin();
  if (!auth) return null;

  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) return null;

  try {
    const decoded = await auth.verifyIdToken(match[1]);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function requireUid(req: NextRequest): Promise<string> {
  const uid = await getUidFromRequest(req);
  if (!uid) throw new Error('UNAUTHORIZED');
  return uid;
}