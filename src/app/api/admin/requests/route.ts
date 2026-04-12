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
    const ngoId = req.nextUrl.searchParams.get('ngoId');
    const volunteerId = req.nextUrl.searchParams.get('volunteerId');
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 50), 200);

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.requests);
    if (status) q = q.where('status', '==', status);
    if (ngoId) q = q.where('ngoId', '==', ngoId);
    if (volunteerId) q = q.where('volunteerId', '==', volunteerId);

    let raw: any[] = [];
    try {
      const snap = await q.orderBy('createdAt', 'desc').limit(limit).get();
      raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (!isIndexError(err)) throw err;
      const snap = await q.limit(limit).get();
      raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      raw.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    // join donation
    const donationIds = Array.from(new Set(raw.map(r => r.donationId).filter(Boolean)));
    const donationRefs = donationIds.map(id => db.collection(COLLECTIONS.donations).doc(id));
    const donationSnaps = donationRefs.length ? await db.getAll(...donationRefs) : [];
    const donationMap = new Map(donationSnaps.map(s => [s.id, s.exists ? { id: s.id, ...s.data() } : null]));

    const requests = raw.map(r => ({
      ...r,
      donation: r.donationId ? donationMap.get(r.donationId) : null,
    }));

    return NextResponse.json({ requests });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: code });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { uid } = await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Request id is required' }, { status: 400 });

    const reqRef = db.collection(COLLECTIONS.requests).doc(id);
    const now = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists) throw new Error('REQUEST_NOT_FOUND');

      const reqData = reqSnap.data() as any;

      // Volunteer assignment from dropdown (secure name lookup)
      if (updates.volunteerId) {
        const vSnap = await tx.get(db.collection(COLLECTIONS.users).doc(String(updates.volunteerId)));
        if (!vSnap.exists) throw new Error('VOLUNTEER_NOT_FOUND');
        const v = vSnap.data() as any;

        updates.volunteerName = v.name || 'Volunteer';
        if (!updates.status && reqData.status === 'pending') updates.status = 'accepted';
      }

      tx.update(reqRef, { ...updates, updatedAt: now });

      // cascade donation
      if (reqData.donationId) {
        const donationRef = db.collection(COLLECTIONS.donations).doc(reqData.donationId);

        if (updates.volunteerId) {
          tx.update(donationRef, { volunteerId: updates.volunteerId, updatedAt: now });
        }

        if (updates.status === 'delivered') {
          tx.update(donationRef, { status: 'delivered', updatedAt: now });
        } else if (updates.status === 'in_transit') {
          tx.update(donationRef, { status: 'picked_up', updatedAt: now });
        } else if (updates.status === 'cancelled') {
          tx.update(donationRef, {
            status: 'available',
            claimedBy: null,
            volunteerId: null,
            requestId: null,
            updatedAt: now,
          });
        }
      }
    });

    await db.collection(COLLECTIONS.auditLogs).add({
      actorId: uid,
      actorRole: 'admin',
      action: 'ADMIN_REQUEST_UPDATE',
      entityType: 'request',
      entityId: id,
      after: updates,
      createdAt: now,
    });

    const updated = await reqRef.get();
    return NextResponse.json({ request: { id: updated.id, ...updated.data() } });
  } catch (e: any) {
    const code =
      e?.message === 'REQUEST_NOT_FOUND' ? 404 :
      e?.message === 'VOLUNTEER_NOT_FOUND' ? 404 :
      e?.message === 'UNAUTHORIZED' ? 401 :
      e?.message === 'FORBIDDEN' ? 403 : 500;

    return NextResponse.json({ error: 'Failed to update request' }, { status: code });
  }
}