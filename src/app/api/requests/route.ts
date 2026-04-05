import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    const volunteerId = searchParams.get('volunteerId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (ngoId) {
      where.ngoId = ngoId;
    }
    if (volunteerId) {
      where.volunteerId = volunteerId;
    }
    if (status) {
      where.status = status;
    }

    const requests = await db.pickupRequest.findMany({
      where,
      include: {
        donation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Requests GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donationId, ngoId, ngoName, volunteerId, volunteerName } = body;

    if (!donationId || !ngoId) {
      return NextResponse.json({ error: 'donationId and ngoId are required' }, { status: 400 });
    }

    const newRequest = await db.pickupRequest.create({
      data: {
        donationId,
        ngoId,
        ngoName: ngoName || 'Unknown NGO',
        volunteerId: volunteerId || null,
        volunteerName: volunteerName || null,
        status: 'pending',
      },
      include: { donation: true },
    });

    // Also update the donation status to 'claimed'
    await db.foodDonation.update({
      where: { id: donationId },
      data: { status: 'claimed', claimedBy: ngoId },
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Requests POST error:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request id is required' }, { status: 400 });
    }

    const updatedRequest = await db.pickupRequest.update({
      where: { id },
      data: updates,
      include: { donation: true },
    });

    // Cascade status changes to the linked donation
    if (updates.status === 'delivered' && updatedRequest.donationId) {
      await db.foodDonation.update({
        where: { id: updatedRequest.donationId },
        data: { status: 'delivered', volunteerId: updatedRequest.volunteerId },
      });
    } else if (updates.status === 'in_transit' && updatedRequest.donationId) {
      await db.foodDonation.update({
        where: { id: updatedRequest.donationId },
        data: { status: 'picked_up' },
      });
    }

    return NextResponse.json({ request: updatedRequest });
  } catch (error) {
    console.error('Requests PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
