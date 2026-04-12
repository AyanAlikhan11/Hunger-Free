import type { NextRequest } from 'next/server';
import { requireUid } from './auth-server';
import { getUserProfile } from './user-server';

export async function requireAdmin(req: NextRequest) {
  const uid = await requireUid(req);
  const profile = await getUserProfile(uid);

  if (!profile) throw new Error('PROFILE_MISSING');
  if (profile.isActive === false) throw new Error('DISABLED');
  if (profile.role !== 'admin') throw new Error('FORBIDDEN');

  return { uid, profile };
}