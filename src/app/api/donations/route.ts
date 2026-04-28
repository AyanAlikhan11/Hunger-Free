


import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { requireUid, getUidFromRequest } from '@/lib/firebase/auth-server';
import { getUserProfile } from '@/lib/firebase/user-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isFirestoreIndexError(err: any) {
  const msg = String(err?.message || '');
  return (
    msg.includes('FAILED_PRECONDITION') &&
    (msg.toLowerCase().includes('index') || msg.toLowerCase().includes('create it here'))
  );
}

function sortByCreatedAtDesc(items: any[]) {
  return items.sort((a, b) => {
    const at = new Date(a.createdAt || 0).getTime();
    const bt = new Date(b.createdAt || 0).getTime();
    return bt - at;
  });
}

function maskAddress(address?: string) {
  if (!address) return '';
  // show only last part (city/state) to keep it public-safe
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return 'Nearby';
  return parts.slice(-2).join(', ');
}

function normalizeAddress(input: unknown) {
  return String(input ?? '')
    .replace(/\r?\n/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toNumberOrNull(v: unknown) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    // Optional auth (public can still read)
    const uid = await getUidFromRequest(request);
    const profile = uid ? await getUserProfile(uid) : null;

    const canSeeExact =
      profile?.role === 'admin' ||
      profile?.role === 'ngo' ||
      profile?.role === 'volunteer' ||
      profile?.role === 'donor';

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const donorId = searchParams.get('donorId');

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.donations);

    if (status) q = q.where('status', '==', status);
    if (category) q = q.where('category', '==', category);
    if (donorId) q = q.where('donorId', '==', donorId);

    let donations: any[] = [];
    try {
      const snap = await q.orderBy('createdAt', 'desc').get();
      donations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (isFirestoreIndexError(err)) {
        const snap = await q.get();
        donations = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        donations = sortByCreatedAtDesc(donations);
      } else {
        throw err;
      }
    }

    // Mask address for public viewers
    const safe = donations.map((d) => {
      if (canSeeExact) return d;
      return {
        ...d,
        address: maskAddress(d.address),
        // you may also optionally hide donor name publicly:
        // donorName: 'Donor',
      };
    });

    return NextResponse.json({ donations: safe });
  } catch (error) {
    console.error('Donations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    const profile = await getUserProfile(uid);
    if (!profile) {
      return NextResponse.json({ error: 'User profile missing' }, { status: 400 });
    }

    // ✅ block disabled users
    if ((profile as any).isActive === false) {
      return NextResponse.json({ error: 'Account disabled. Contact support.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      foodName,
      description,
      quantity,
      unit,
      expiryTime,
      category,
      imageUrl,
      address,
      lat,
      lng,
      deliveryMode,
    } = body;

    if (!foodName || String(foodName).trim().length === 0) {
      return NextResponse.json({ error: 'foodName is required' }, { status: 400 });
    }

    // ✅ normalize + validate address (works for 1-line, 2-line, pasted multiline)
    const cleanAddress = normalizeAddress(address);
    if (!cleanAddress) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // ✅ require valid pickup coordinates (for routing & smooth NGO/volunteer flow)
    const cleanLat = toNumberOrNull(lat);
    const cleanLng = toNumberOrNull(lng);

    if (cleanLat === null || cleanLng === null) {
      return NextResponse.json(
        { error: 'Pickup location (lat/lng) is required. Please pick location on the map.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const expiryIso = expiryTime
      ? new Date(expiryTime).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const mode = deliveryMode === 'direct' ? 'direct' : 'ngo';

    const docRef = await db.collection(COLLECTIONS.donations).add({
      donorId: uid,
      donorName: profile.name,

      foodName: String(foodName).trim(),
      description: description ? String(description) : '',
      quantity: String(quantity || '0'),
      unit: unit || 'servings',
      expiryTime: expiryIso,
      category: category || 'Other',
      imageUrl: imageUrl || null,

      address: cleanAddress,
      lat: cleanLat,
      lng: cleanLng,

      deliveryMode: mode,

      status: 'available',
      claimedBy: null,
      volunteerId: null,
      requestId: null, // ✅ helps link requests smoothly later

      createdAt: now,
      updatedAt: now,
    });

    const donationSnap = await docRef.get();
    return NextResponse.json(
      { donation: { id: donationSnap.id, ...donationSnap.data() } },
      { status: 201 }
    );
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: code === 401 ? 'Unauthorized' : 'Failed to create donation' },
      { status: code }
    );
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'User profile missing' }, { status: 400 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });

    const ref = db.collection(COLLECTIONS.donations).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });

    const donation = snap.data() as any;
    const isOwner = donation.donorId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    delete (updates as any).donorId;
    delete (updates as any).donorName;

    await ref.update({ ...updates, updatedAt: new Date().toISOString() });

    const updated = (await ref.get()).data();
    return NextResponse.json({ donation: { id, ...updated } });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to update donation' }, { status: code });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'User profile missing' }, { status: 400 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });

    const ref = db.collection(COLLECTIONS.donations).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });

    const donation = snap.data() as any;
    const isOwner = donation.donorId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to delete donation' }, { status: code });
  }
}