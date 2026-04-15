// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const ngoId = searchParams.get('ngoId');
//     const volunteerId = searchParams.get('volunteerId');
//     const status = searchParams.get('status');

//     const where: Record<string, unknown> = {};

//     if (ngoId) {
//       where.ngoId = ngoId;
//     }
//     if (volunteerId) {
//       where.volunteerId = volunteerId;
//     }
//     if (status) {
//       where.status = status;
//     }

//     const requests = await db.pickupRequest.findMany({
//       where,
//       include: {
//         donation: true,
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json({ requests });
//   } catch (error) {
//     console.error('Requests GET error:', error);
//     return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { donationId, ngoId, ngoName, volunteerId, volunteerName } = body;

//     if (!donationId || !ngoId) {
//       return NextResponse.json({ error: 'donationId and ngoId are required' }, { status: 400 });
//     }

//     const newRequest = await db.pickupRequest.create({
//       data: {
//         donationId,
//         ngoId,
//         ngoName: ngoName || 'Unknown NGO',
//         volunteerId: volunteerId || null,
//         volunteerName: volunteerName || null,
//         status: 'pending',
//       },
//       include: { donation: true },
//     });

//     // Also update the donation status to 'claimed'
//     await db.foodDonation.update({
//       where: { id: donationId },
//       data: { status: 'claimed', claimedBy: ngoId },
//     });

//     return NextResponse.json({ request: newRequest }, { status: 201 });
//   } catch (error) {
//     console.error('Requests POST error:', error);
//     return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, ...updates } = body;

//     if (!id) {
//       return NextResponse.json({ error: 'Request id is required' }, { status: 400 });
//     }

//     const updatedRequest = await db.pickupRequest.update({
//       where: { id },
//       data: updates,
//       include: { donation: true },
//     });

//     // Cascade status changes to the linked donation
//     if (updates.status === 'delivered' && updatedRequest.donationId) {
//       await db.foodDonation.update({
//         where: { id: updatedRequest.donationId },
//         data: { status: 'delivered', volunteerId: updatedRequest.volunteerId },
//       });
//     } else if (updates.status === 'in_transit' && updatedRequest.donationId) {
//       await db.foodDonation.update({
//         where: { id: updatedRequest.donationId },
//         data: { status: 'picked_up' },
//       });
//     }

//     return NextResponse.json({ request: updatedRequest });
//   } catch (error) {
//     console.error('Requests PATCH error:', error);
//     return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { requireUid } from '@/lib/firebase/auth-server';
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

function sortByCreatedAtDesc<T extends { createdAt?: any }>(items: T[]) {
  return items.sort((a, b) => {
    const at = new Date(a.createdAt || 0).getTime();
    const bt = new Date(b.createdAt || 0).getTime();
    return bt - at;
  });
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
    await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    const volunteerId = searchParams.get('volunteerId');
    const status = searchParams.get('status');

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.requests);
    if (ngoId) q = q.where('ngoId', '==', ngoId);
    if (volunteerId) q = q.where('volunteerId', '==', volunteerId);
    if (status) q = q.where('status', '==', status);

    let requestsRaw: any[] = [];

    try {
      const snap = await q.orderBy('createdAt', 'desc').get();
      requestsRaw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (isFirestoreIndexError(err)) {
        const snap = await q.get();
        requestsRaw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        requestsRaw = sortByCreatedAtDesc(requestsRaw);
      } else {
        throw err;
      }
    }

    // include donation (manual join)
    const donationIds = Array.from(new Set(requestsRaw.map((r) => r.donationId).filter(Boolean)));
    const donationRefs = donationIds.map((id) => db.collection(COLLECTIONS.donations).doc(id));
    const donationSnaps = donationRefs.length ? await db.getAll(...donationRefs) : [];
    const donationMap = new Map(donationSnaps.map((s) => [s.id, s.exists ? { id: s.id, ...s.data() } : null]));

    const requests = requestsRaw.map((r) => ({
      ...r,
      donation: r.donationId ? donationMap.get(r.donationId) : null,
    }));

    return NextResponse.json({ requests });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: code === 401 ? 'Unauthorized' : 'Failed to fetch requests' },
      { status: code }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'User profile missing' }, { status: 400 });

    // ✅ block disabled accounts
    if ((profile as any).isActive === false) {
      return NextResponse.json({ error: 'Account disabled. Contact support.' }, { status: 403 });
    }

    if (profile.role !== 'ngo' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only NGOs can request pickups' }, { status: 403 });
    }

    const body = await request.json();
    const donationId = String(body?.donationId || '');
    const beneficiaryId = body?.beneficiaryId ? String(body.beneficiaryId) : null;

    if (!donationId) {
      return NextResponse.json({ error: 'donationId is required' }, { status: 400 });
    }

    const donationRef = db.collection(COLLECTIONS.donations).doc(donationId);
    const requestRef = db.collection(COLLECTIONS.requests).doc();
    const now = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const donationSnap = await tx.get(donationRef);
      if (!donationSnap.exists) throw new Error('DONATION_NOT_FOUND');

      const donation = donationSnap.data() as any;
      if (donation.status !== 'available') throw new Error('DONATION_NOT_AVAILABLE');

      const deliveryMode = donation.deliveryMode === 'direct' ? 'direct' : 'ngo';

      // ✅ pickup snapshot from donation (normalize address)
      const pickupAddress = normalizeAddress(donation.address);
      if (!pickupAddress) throw new Error('PICKUP_ADDRESS_MISSING');

      // coords are optional (but recommended). keep as null if missing
      const pickupLat = toNumberOrNull(donation.lat);
      const pickupLng = toNumberOrNull(donation.lng);

      // ✅ donation snapshot (speed: reduces joins)
      const donationSnapshot = {
        foodName: donation.foodName || 'Food',
        donorName: donation.donorName || 'Donor',
        quantity: String(donation.quantity || '0'),
        unit: donation.unit || '',
        category: donation.category || 'Other',
      };

      // ✅ dropoff decision
      let dropoffType: 'ngo' | 'recipient' = 'ngo';
      let dropoffRecipientId: string | null = null;

      let dropoffAddress = normalizeAddress(profile.address) || 'NGO Address';
      const dropoffLat = toNumberOrNull((profile as any).lat);
      const dropoffLng = toNumberOrNull((profile as any).lng);

      if (deliveryMode === 'direct') {
        if (!beneficiaryId) throw new Error('BENEFICIARY_REQUIRED');

        const bRef = db.collection(COLLECTIONS.beneficiaries).doc(beneficiaryId);
        const bSnap = await tx.get(bRef);
        if (!bSnap.exists) throw new Error('BENEFICIARY_NOT_FOUND');

        const b = bSnap.data() as any;

        // ✅ NGO can only use its own verified beneficiaries (admin can use any)
        if (profile.role !== 'admin' && b.verifiedByNgoId !== uid) {
          throw new Error('BENEFICIARY_FORBIDDEN');
        }

        dropoffType = 'recipient';
        dropoffRecipientId = beneficiaryId;

        dropoffAddress = normalizeAddress(b.address) || 'Recipient Address';
        // overwrite dropoff coords from beneficiary if present
        const bLat = toNumberOrNull(b.lat);
        const bLng = toNumberOrNull(b.lng);

        // store these in request
        tx.set(requestRef, {
          donationId,
          ngoId: uid,
          ngoName: profile.name,

          volunteerId: null,
          volunteerName: null,

          ...donationSnapshot,

          pickupAddress,
          pickupLat,
          pickupLng,

          dropoffType,
          dropoffAddress,
          dropoffLat: bLat,
          dropoffLng: bLng,
          dropoffRecipientId,

          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });
      } else {
        // NGO delivery
        tx.set(requestRef, {
          donationId,
          ngoId: uid,
          ngoName: profile.name,

          volunteerId: null,
          volunteerName: null,

          ...donationSnapshot,

          pickupAddress,
          pickupLat,
          pickupLng,

          dropoffType,
          dropoffAddress,
          dropoffLat,
          dropoffLng,
          dropoffRecipientId: null,

          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });
      }

      // update donation
      tx.update(donationRef, {
        status: 'claimed',
        claimedBy: uid,
        requestId: requestRef.id,
        updatedAt: now,
      });
    });

    const createdRequestSnap = await requestRef.get();
    const donationSnap = await donationRef.get();

    return NextResponse.json(
      {
        request: {
          id: createdRequestSnap.id,
          ...createdRequestSnap.data(),
          donation: { id: donationSnap.id, ...donationSnap.data() },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    const msg =
      error?.message === 'UNAUTHORIZED' ? 'Unauthorized'
      : error?.message === 'DONATION_NOT_FOUND' ? 'Donation not found'
      : error?.message === 'DONATION_NOT_AVAILABLE' ? 'Donation is not available'
      : error?.message === 'PICKUP_ADDRESS_MISSING' ? 'Pickup address is missing for this donation'
      : error?.message === 'BENEFICIARY_REQUIRED' ? 'Beneficiary is required for direct delivery'
      : error?.message === 'BENEFICIARY_NOT_FOUND' ? 'Beneficiary not found'
      : error?.message === 'BENEFICIARY_FORBIDDEN' ? 'You can only use beneficiaries verified by your NGO'
      : 'Failed to create request';

    const code =
      error?.message === 'UNAUTHORIZED' ? 401
      : error?.message === 'DONATION_NOT_FOUND' ? 404
      : error?.message === 'BENEFICIARY_NOT_FOUND' ? 404
      : error?.message === 'DONATION_NOT_AVAILABLE' ? 409
      : error?.message === 'BENEFICIARY_REQUIRED' ? 400
      : error?.message === 'BENEFICIARY_FORBIDDEN' ? 403
      : error?.message === 'PICKUP_ADDRESS_MISSING' ? 400
      : 500;

    return NextResponse.json({ error: msg }, { status: code });
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

    if (!id) return NextResponse.json({ error: 'Request id is required' }, { status: 400 });

    const reqRef = db.collection(COLLECTIONS.requests).doc(id);
    const now = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const reqSnap = await tx.get(reqRef);
      if (!reqSnap.exists) throw new Error('REQUEST_NOT_FOUND');

      const reqData = reqSnap.data() as any;

      const isAdmin = profile.role === 'admin';
      const isNgoOwner = reqData.ngoId === uid;
      const isAssignedVolunteer = reqData.volunteerId && reqData.volunteerId === uid;

      // volunteer can accept pending even if not assigned yet
      const volunteerAccepting =
        profile.role === 'volunteer' &&
        updates.status === 'accepted' &&
        (!reqData.volunteerId || reqData.volunteerId === uid);

      if (!isAdmin && !isNgoOwner && !isAssignedVolunteer && !volunteerAccepting) {
        throw new Error('FORBIDDEN');
      }

      // Secure volunteer identity (prevent spoof)
      if (volunteerAccepting) {
        updates.volunteerId = uid;
        updates.volunteerName = profile.name;
      }

      tx.update(reqRef, { ...updates, updatedAt: now });

      // cascade donation updates
      if (reqData.donationId) {
        const donationRef = db.collection(COLLECTIONS.donations).doc(reqData.donationId);

        if (updates.status === 'delivered') {
          tx.update(donationRef, {
            status: 'delivered',
            volunteerId: updates.volunteerId ?? reqData.volunteerId ?? null,
            updatedAt: now,
          });
        } else if (updates.status === 'in_transit') {
          tx.update(donationRef, { status: 'picked_up', updatedAt: now });
        } else if (updates.status === 'accepted') {
          tx.update(donationRef, {
            volunteerId: updates.volunteerId ?? reqData.volunteerId ?? null,
            updatedAt: now,
          });
        }
      }
    });

    const updatedSnap = await reqRef.get();
    const updatedReq = { id: updatedSnap.id, ...updatedSnap.data() } as any;

    // include donation
    let donation: any = null;
    if (updatedReq.donationId) {
      const dSnap = await db.collection(COLLECTIONS.donations).doc(updatedReq.donationId).get();
      donation = dSnap.exists ? { id: dSnap.id, ...dSnap.data() } : null;
    }

    return NextResponse.json({ request: { ...updatedReq, donation } });
  } catch (error: any) {
    const code =
      error?.message === 'UNAUTHORIZED' ? 401 :
      error?.message === 'FORBIDDEN' ? 403 :
      error?.message === 'REQUEST_NOT_FOUND' ? 404 : 500;

    const msg =
      code === 401 ? 'Unauthorized' :
      code === 403 ? 'Forbidden' :
      code === 404 ? 'Request not found' :
      'Failed to update request';

    return NextResponse.json({ error: msg }, { status: code });
  }
}