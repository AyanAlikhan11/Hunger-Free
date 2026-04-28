
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

function toNumberOrNull(v: unknown) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseBoolean(v: unknown) {
  // handles true/false boolean and "true"/"false" strings safely
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return false;
}

// -----------------------------------------------------------------------------
// GET /api/products
// Public: used by marketplace. Supports optional filters.
// -----------------------------------------------------------------------------
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

    let products: any[] = [];

    try {
      // This may require a composite index (farmerId + createdAt)
      const snap = await q.orderBy('createdAt', 'desc').get();
      products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      if (isFirestoreIndexError(err)) {
        // fallback: no orderBy; sort in-memory to avoid 500 in dev/demo
        const snap = await q.get();
        products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        products = sortByCreatedAtDesc(products);
      } else {
        throw err;
      }
    }

    return NextResponse.json(
      { products },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// -----------------------------------------------------------------------------
// POST /api/products
// Farmer/Admin only
// -----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const uid = await requireUid(request);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const profile = await getUserProfile(uid);
    if (!profile) return NextResponse.json({ error: 'User profile missing' }, { status: 400 });

    if (profile.role !== 'farmer' && profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only farmers can add products' }, { status: 403 });
    }

    const body = await request.json();
    const {
      productName,
      description,
      price,
      unit,
      quantity,
      category,
      imageUrl,
      address,
      lat,
      lng,
      isOrganic,
    } = body;

    const name = String(productName || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const payload = {
      farmerId: uid,
      farmerName: profile.name || 'Farmer',

      productName: name,
      description: String(description || ''),
      price: Number(price) || 0,
      unit: String(unit || 'kg'),
      quantity: Number(quantity) || 0,
      category: String(category || 'Other'),

      imageUrl: imageUrl || null,
      address: String(address || ''),
      lat: toNumberOrNull(lat),
      lng: toNumberOrNull(lng),

      isOrganic: parseBoolean(isOrganic),

      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.products).add(payload);
    const productSnap = await docRef.get();

    return NextResponse.json(
      { product: { id: productSnap.id, ...productSnap.data() } },
      { status: 201, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: code === 401 ? 'Unauthorized' : 'Failed to create product' },
      { status: code, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// -----------------------------------------------------------------------------
// PATCH /api/products
// Owner/Admin only
// -----------------------------------------------------------------------------
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

    const ref = db.collection(COLLECTIONS.products).doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const product = snap.data() as any;
    const isOwner = product.farmerId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // prevent spoofing ownership fields
    delete (updates as any).farmerId;
    delete (updates as any).farmerName;

    // normalize optional fields if present
    if ('lat' in updates) (updates as any).lat = toNumberOrNull((updates as any).lat);
    if ('lng' in updates) (updates as any).lng = toNumberOrNull((updates as any).lng);
    if ('isOrganic' in updates) (updates as any).isOrganic = parseBoolean((updates as any).isOrganic);

    await ref.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updated = (await ref.get()).data();
    return NextResponse.json(
      { product: { id: ref.id, ...updated } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: code === 401 ? 'Unauthorized' : 'Failed to update product' },
      { status: code, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// -----------------------------------------------------------------------------
// DELETE /api/products?id=...
// Owner/Admin only
// -----------------------------------------------------------------------------
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

    const ref = db.collection(COLLECTIONS.products).doc(String(id));
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const product = snap.data() as any;
    const isOwner = product.farmerId === uid;
    const isAdmin = profile.role === 'admin';
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await ref.delete();
    return NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json(
      { error: code === 401 ? 'Unauthorized' : 'Failed to delete product' },
      { status: code, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}