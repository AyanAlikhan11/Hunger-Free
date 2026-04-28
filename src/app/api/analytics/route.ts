
import { NextResponse, type NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { requireUid } from '@/lib/firebase/auth-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Require auth (optional but recommended)
    await requireUid(req);

    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    // Donations
    const donationsSnap = await db.collection(COLLECTIONS.donations).get();
    const donations = donationsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    const totalDonations = donations.length;

    const totalFoodSaved = donations.reduce((sum, d) => {
      const parsed = parseInt(String(d.quantity ?? '0'), 10);
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    const totalPeopleServed = totalFoodSaved * 3;

    // Users
    const usersSnap = await db.collection(COLLECTIONS.users).get();
    const users = usersSnap.docs.map(u => u.data() as any);

    const totalFarmersConnected = users.filter(u => u.role === 'farmer').length;
    const totalActiveVolunteers = users.filter(u => u.role === 'volunteer').length;

    // Donations by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const thresholdIso = twelveMonthsAgo.toISOString();

    const donationsByMonth: Record<string, number> = {};
    for (const d of donations) {
      const createdAt = d.createdAt;
      if (!createdAt || String(createdAt) < thresholdIso) continue;

      const dt = new Date(createdAt);
      if (isNaN(dt.getTime())) continue;

      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      donationsByMonth[key] = (donationsByMonth[key] || 0) + 1;
    }

    // Food by category
    const foodByCategory: Record<string, number> = {};
    for (const d of donations) {
      const cat = d.category || 'Other';
      foodByCategory[cat] = (foodByCategory[cat] || 0) + 1;
    }

    // Top 5 donors
    const donorCounts = new Map<string, { donorId: string; donorName: string; count: number }>();
    for (const d of donations) {
      const id = d.donorId || 'unknown';
      const name = d.donorName || 'Unknown';
      const key = `${id}::${name}`;
      const cur = donorCounts.get(key) || { donorId: id, donorName: name, count: 0 };
      cur.count += 1;
      donorCounts.set(key, cur);
    }
    const topDonors = Array.from(donorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity: last 10 donations + last 10 requests
    const recentDonationsSnap = await db
      .collection(COLLECTIONS.donations)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentDonations = recentDonationsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    const recentRequestsSnap = await db
      .collection(COLLECTIONS.requests)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentRequestsRaw = recentRequestsSnap.docs.map(r => ({ id: r.id, ...(r.data() as any) }));

    // join donation foodName for requests
    const donationIds = Array.from(new Set(recentRequestsRaw.map(r => r.donationId).filter(Boolean)));
    const donationRefs = donationIds.map(id => db.collection(COLLECTIONS.donations).doc(id));
    const donationSnaps = donationRefs.length ? await db.getAll(...donationRefs) : [];
    const donationMap = new Map(donationSnaps.map(s => [s.id, s.exists ? (s.data() as any) : null]));

    const recentActivity = [
      ...recentDonations.map((d) => ({
        id: d.id,
        type: 'donation' as const,
        description: `${d.donorName} donated ${d.foodName}`,
        status: d.status,
        createdAt: new Date(d.createdAt),
      })),
      ...recentRequestsRaw.map((r) => {
        const donation = r.donationId ? donationMap.get(r.donationId) : null;
        return {
          id: r.id,
          type: 'request' as const,
          description: `${r.ngoName} requested ${donation?.foodName || 'food'}`,
          status: r.status,
          createdAt: new Date(r.createdAt),
        };
      }),
    ]
      .filter(a => !isNaN(a.createdAt.getTime()))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map(a => ({ ...a, createdAt: a.createdAt.toISOString() }));

    const analytics = {
      totalDonations,
      totalFoodSaved,
      totalPeopleServed,
      totalFarmersConnected,
      totalActiveVolunteers,
      donationsByMonth,
      foodByCategory,
      topDonors,
      recentActivity,
    };

    return NextResponse.json({ analytics });
  } catch (error: any) {
    const code = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ error: code === 401 ? 'Unauthorized' : 'Internal server error' }, { status: code });
  }
}