// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const category = searchParams.get('category');
//     const organic = searchParams.get('organic');
//     const farmerId = searchParams.get('farmerId');

//     const where: Record<string, unknown> = {};

//     if (category) {
//       where.category = category;
//     }
//     if (organic === 'true') {
//       where.isOrganic = true;
//     }
//     if (farmerId) {
//       where.farmerId = farmerId;
//     }

//     const products = await db.farmerProduct.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//     });

//     return NextResponse.json({ products });
//   } catch (error) {
//     console.error('Products GET error:', error);
//     return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { farmerId, farmerName, productName, description, price, unit, quantity, category, imageUrl, address, lat, lng, isOrganic } = body;

//     if (!productName || !farmerId || !farmerName) {
//       return NextResponse.json({ error: 'productName, farmerId, and farmerName are required' }, { status: 400 });
//     }

//     const product = await db.farmerProduct.create({
//       data: {
//         farmerId,
//         farmerName,
//         productName,
//         description: description || '',
//         price: Number(price) || 0,
//         unit: unit || 'kg',
//         quantity: Number(quantity) || 0,
//         category: category || 'Other',
//         imageUrl: imageUrl || null,
//         address: address || '',
//         lat: lat ? Number(lat) : null,
//         lng: lng ? Number(lng) : null,
//         isOrganic: Boolean(isOrganic),
//       },
//     });

//     return NextResponse.json({ product }, { status: 201 });
//   } catch (error) {
//     console.error('Products POST error:', error);
//     return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { id, ...updates } = body;

//     if (!id) {
//       return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
//     }

//     const product = await db.farmerProduct.update({
//       where: { id },
//       data: updates,
//     });

//     return NextResponse.json({ product });
//   } catch (error) {
//     console.error('Products PATCH error:', error);
//     return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
//     }

//     await db.farmerProduct.delete({ where: { id } });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Products DELETE error:', error);
//     return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
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
    const category = searchParams.get('category');
    const organic = searchParams.get('organic');
    const farmerId = searchParams.get('farmerId');

    let q: FirebaseFirestore.Query = db.collection(COLLECTIONS.products);

    if (category) q = q.where('category', '==', category);
    if (organic === 'true') q = q.where('isOrganic', '==', true);
    if (farmerId) q = q.where('farmerId', '==', farmerId);

    q = q.orderBy('createdAt', 'desc');

    const snap = await q.get();
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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
    const { productName, description, price, unit, quantity, category, imageUrl, address, lat, lng, isOrganic } = body;

    if (!productName) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const docRef = await db.collection(COLLECTIONS.products).add({
      farmerId: uid,
      farmerName: profile.name,
      productName,
      description: description || '',
      price: Number(price) || 0,
      unit: unit || 'kg',
      quantity: Number(quantity) || 0,
      category: category || 'Other',
      imageUrl: imageUrl || null,
      address: address || '',
      lat: lat !== undefined && lat !== null ? Number(lat) : null,
      lng: lng !== undefined && lng !== null ? Number(lng) : null,
      isOrganic: Boolean(isOrganic),
      createdAt: now,
      updatedAt: now,
    });

    const productSnap = await docRef.get();
    return NextResponse.json({ product: { id: productSnap.id, ...productSnap.data() } }, { status: 201 });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to create product' }, { status: code });
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const ref = db.collection(COLLECTIONS.products).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const product = snap.data() as any;
    const isOwner = product.farmerId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    delete (updates as any).farmerId;
    delete (updates as any).farmerName;

    await ref.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updated = (await ref.get()).data();
    return NextResponse.json({ product: { id, ...updated } });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to update product' }, { status: code });
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
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const ref = db.collection(COLLECTIONS.products).doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const product = snap.data() as any;
    const isOwner = product.farmerId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Failed to delete product' }, { status: code });
  }
}