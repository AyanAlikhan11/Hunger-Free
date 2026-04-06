// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get('status');
//     const category = searchParams.get('category');
//     const donorId = searchParams.get('donorId');

//     const where: Record<string, unknown> = {};

//     if (status) {
//       where.status = status;
//     }
//     if (category) {
//       where.category = category;
//     }
//     if (donorId) {
//       where.donorId = donorId;
//     }

//     const donations = await db.foodDonation.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json({ donations });
//   } catch (error) {
//     console.error('Donations GET error:', error);
//     return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { donorId, donorName, foodName, description, quantity, unit, expiryTime, category, imageUrl, address, lat, lng } = body;

//     if (!foodName || !donorId || !donorName) {
//       return NextResponse.json({ error: 'foodName, donorId, and donorName are required' }, { status: 400 });
//     }

//     const donation = await db.foodDonation.create({
//       data: {
//         donorId,
//         donorName,
//         foodName,
//         description: description || '',
//         quantity: String(quantity || '0'),
//         unit: unit || 'servings',
//         expiryTime: expiryTime ? new Date(expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
//         category: category || 'Other',
//         imageUrl: imageUrl || null,
//         address: address || '',
//         lat: lat ? Number(lat) : null,
//         lng: lng ? Number(lng) : null,
//         status: 'available',
//       },
//     });

//     return NextResponse.json({ donation }, { status: 201 });
//   } catch (error) {
//     console.error('Donations POST error:', error);
//     return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, ...updates } = body;

//     if (!id) {
//       return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
//     }

//     const donation = await db.foodDonation.update({
//       where: { id },
//       data: updates,
//     });

//     return NextResponse.json({ donation });
//   } catch (error) {
//     console.error('Donations PATCH error:', error);
//     return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
//     }

//     await db.foodDonation.delete({ where: { id } });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Donations DELETE error:', error);
//     return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { requireUid } from '@/lib/firebase/auth-server';
import { getUserProfile } from '@/lib/firebase/user-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const donorId = searchParams.get('donorId');

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.donations);

    if (status) q = q.where('status', '==', status);
    if (category) q = q.where('category', '==', category);
    if (donorId) q = q.where('donorId', '==', donorId);

    // You may need Firestore indexes for combinations of filters + orderBy
    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    const donations = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Donations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'User profile missing' }, { status: 400 });

    const body = await request.json();
    const { foodName, description, quantity, unit, expiryTime, category, imageUrl, address, lat, lng } = body;

    if (!foodName) {
      return NextResponse.json({ error: 'foodName is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const expiryIso =
      expiryTime ? new Date(expiryTime).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const docRef = await db.collection(COLLECTIONS.donations).add({
      donorId: uid,
      donorName: profile.name,
      foodName,
      description: description || '',
      quantity: String(quantity || '0'),
      unit: unit || 'servings',
      expiryTime: expiryIso,
      category: category || 'Other',
      imageUrl: imageUrl || null,
      address: address || '',
      lat: lat !== undefined && lat !== null ? Number(lat) : null,
      lng: lng !== undefined && lng !== null ? Number(lng) : null,
      status: 'available',
      claimedBy: null,
      volunteerId: null,
      createdAt: now,
      updatedAt: now,
    });

    const donationSnap = await docRef.get();
    return NextResponse.json({ donation: { id: donationSnap.id, ...donationSnap.data() } }, { status: 201 });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to create donation' }, { status: code });
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

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    const ref = db.collection(COLLECTIONS.donations).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Donation not found' }, { status: 404 });

    const donation = snap.data() as any;
    const isOwner = donation.donorId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // prevent changing ownership fields
    delete (updates as any).donorId;
    delete (updates as any).donorName;

    await ref.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

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

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

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