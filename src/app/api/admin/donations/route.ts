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

    const status = req.nextUrl.searchParams.get('status');
    const category = req.nextUrl.searchParams.get('category');
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 50), 200);

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.donations);
    if (status) q = q.where('status', '==', status);
    if (category) q = q.where('category', '==', category);

    let donations: any[] = [];
    try {
      const snap = await q.orderBy('createdAt', 'desc').limit(limit).get();
      donations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (!isIndexError(err)) throw err;
      const snap = await q.limit(limit).get();
      donations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      donations.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return NextResponse.json({ donations });
  } catch (e: any) {
    const code =
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: code });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { uid } = await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Donation id is required' }, { status: 400 });

    delete (updates as any).donorId;
    delete (updates as any).donorName;

    await db.collection(COLLECTIONS.donations).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    await db.collection(COLLECTIONS.auditLogs).add({
      actorId: uid,
      actorRole: 'admin',
      action: 'ADMIN_DONATION_UPDATE',
      entityType: 'donation',
      entityId: id,
      after: updates,
      createdAt: new Date().toISOString(),
    });

    const snap = await db.collection(COLLECTIONS.donations).doc(id).get();
    return NextResponse.json({ donation: { id: snap.id, ...snap.data() } });
  } catch (e: any) {
    const code =
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: 'Failed to update donation' }, { status: code });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Donation id is required' }, { status: 400 });

    await db.collection(COLLECTIONS.donations).doc(id).delete();

    await db.collection(COLLECTIONS.auditLogs).add({
      actorId: uid,
      actorRole: 'admin',
      action: 'ADMIN_DONATION_DELETE',
      entityType: 'donation',
      entityId: id,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const code =
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: code });
  }
}