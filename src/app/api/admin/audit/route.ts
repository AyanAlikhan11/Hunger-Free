import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { requireAdmin } from '@/lib/firebase/admin-guard';
import { COLLECTIONS } from '@/lib/firebase/collections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || 50), 200);

    const snap = await db.collection(COLLECTIONS.auditLogs).orderBy('createdAt', 'desc').limit(limit).get();
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ logs });
  } catch (e: any) {
    const code = e?.message === 'UNAUTHORIZED' ? 401 : e?.message === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: code });
  }
}