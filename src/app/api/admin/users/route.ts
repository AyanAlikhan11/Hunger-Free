import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { requireAdmin } from '@/lib/firebase/admin-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isIndexError(err: any) {
  const msg = String(err?.message || '');
  return msg.includes('FAILED_PRECONDITION') && msg.toLowerCase().includes('index');
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const role = req.nextUrl.searchParams.get('role');

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.users);
    if (role) q = q.where('role', '==', role);

    let users: any[] = [];
    try {
      const snap = await q.orderBy('createdAt', 'desc').get();
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (!isIndexError(err)) throw err;
      const snap = await q.get();
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      users.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return NextResponse.json({ users });
  } catch (e: any) {
    const code =
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 :
      e?.message === 'DISABLED' ? 403 : 500;

    const msg =
      code === 401 ? 'Unauthorized' :
      code === 403 ? 'Forbidden' :
      'Failed to fetch users';

    return NextResponse.json({ error: msg }, { status: code });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { uid } = await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await req.json();
    const { targetUserId, updates } = body as { targetUserId: string; updates: Record<string, any> };

    if (!targetUserId || !updates) {
      return NextResponse.json({ error: 'targetUserId and updates are required' }, { status: 400 });
    }

    delete (updates as any).id;
    delete (updates as any).createdAt;

    await db.collection(COLLECTIONS.users).doc(targetUserId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await db.collection(COLLECTIONS.auditLogs).add({
      actorId: uid,
      actorRole: 'admin',
      action: 'ADMIN_USER_UPDATE',
      entityType: 'user',
      entityId: targetUserId,
      after: updates,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const code =
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 : 500;

    return NextResponse.json({ error: 'Failed to update user' }, { status: code });
  }
}