import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { requireUid } from '@/lib/firebase/auth-server';
import { getUserProfile } from '@/lib/firebase/user-server';
import { COLLECTIONS } from '@/lib/firebase/collections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'Profile missing' }, { status: 400 });

    if (profile.role !== 'ngo' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    let q: FirebaseFirestore.Query = db
      .collection(COLLECTIONS.beneficiaries)
      .where('isActive', '==', true);

    // NGOs see only their verified beneficiaries; admin sees all
    if (profile.role === 'ngo') q = q.where('verifiedByNgoId', '==', uid);

    const snap = await q.get();
    const beneficiaries = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ beneficiaries });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: 'Failed to fetch beneficiaries' }, { status: code });
  }
}

export async function POST(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'Profile missing' }, { status: 400 });

    if (profile.role !== 'ngo' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await req.json();
    const { fullName, phone, address, lat, lng } = body;

    if (!fullName || !address) {
      return NextResponse.json({ error: 'fullName and address are required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const doc = await db.collection(COLLECTIONS.beneficiaries).add({
      fullName,
      phone: phone || null,
      address,
      lat: lat != null ? Number(lat) : null,
      lng: lng != null ? Number(lng) : null,

      verifiedByNgoId: uid,
      verifiedByNgoName: profile.name,

      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const snap = await doc.get();
    return NextResponse.json({ beneficiary: { id: snap.id, ...snap.data() } }, { status: 201 });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: 'Failed to create beneficiary' }, { status: code });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'Profile missing' }, { status: 400 });

    if (profile.role !== 'ngo' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    if (profile.role === 'ngo') {
      const snap = await db.collection(COLLECTIONS.beneficiaries).doc(id).get();
      if (!snap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const b = snap.data() as any;
      if (b.verifiedByNgoId !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    delete (updates as any).verifiedByNgoId;
    delete (updates as any).verifiedByNgoName;

    await db.collection(COLLECTIONS.beneficiaries).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const snap = await db.collection(COLLECTIONS.beneficiaries).doc(id).get();
    return NextResponse.json({ beneficiary: { id: snap.id, ...snap.data() } });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: 'Failed to update beneficiary' }, { status: code });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const uid = await requireUid(req);
    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'Profile missing' }, { status: 400 });

    if (profile.role !== 'ngo' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    // soft delete
    await db.collection(COLLECTIONS.beneficiaries).doc(id).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: 'Failed to delete beneficiary' }, { status: code });
  }
}