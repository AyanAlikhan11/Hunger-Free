import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Total donations count
    const totalDonations = await db.foodDonation.count();

    // Total food saved (sum of quantities parsed as int)
    const allDonations = await db.foodDonation.findMany({
      select: { quantity: true },
    });
    const totalFoodSaved = allDonations.reduce((sum, d) => {
      const parsed = parseInt(d.quantity, 10);
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    // Estimate: 1 unit serves 3 people
    const totalPeopleServed = totalFoodSaved * 3;

    // Total farmers connected
    const totalFarmersConnected = await db.user.count({
      where: { role: 'farmer' },
    });

    // Total active volunteers
    const totalActiveVolunteers = await db.user.count({
      where: { role: 'volunteer' },
    });

    // Donations by month (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const donationsLastYear = await db.foodDonation.findMany({
      where: { createdAt: { gte: twelveMonthsAgo } },
      select: { createdAt: true },
    });

    const donationsByMonth: Record<string, number> = {};
    donationsLastYear.forEach((d) => {
      const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, '0')}`;
      donationsByMonth[key] = (donationsByMonth[key] || 0) + 1;
    });

    // Food by category
    const allDonationsWithCategory = await db.foodDonation.findMany({
      select: { category: true },
    });
    const foodByCategory: Record<string, number> = {};
    allDonationsWithCategory.forEach((d) => {
      foodByCategory[d.category] = (foodByCategory[d.category] || 0) + 1;
    });

    // Top 5 donors by donation count
    const topDonors = await db.foodDonation.groupBy({
      by: ['donorId', 'donorName'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Recent activity (last 10 donations and requests combined)
    const recentDonations = await db.foodDonation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        donorName: true,
        foodName: true,
        status: true,
      },
    });

    const recentRequests = await db.pickupRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { donation: { select: { foodName: true } } },
    });

    const recentActivity = [
      ...recentDonations.map((d) => ({
        id: d.id,
        type: 'donation' as const,
        description: `${d.donorName} donated ${d.foodName}`,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...recentRequests.map((r) => ({
        id: r.id,
        type: 'request' as const,
        description: `${r.ngoName} requested ${r.donation.foodName}`,
        status: r.status,
        createdAt: r.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    const analytics = {
      totalDonations,
      totalFoodSaved,
      totalPeopleServed,
      totalFarmersConnected,
      totalActiveVolunteers,
      donationsByMonth,
      foodByCategory,
      topDonors: topDonors.map((d) => ({
        donorId: d.donorId,
        donorName: d.donorName,
        count: d._count.id,
      })),
      recentActivity,
    };

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
