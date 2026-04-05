import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const donorId = searchParams.get('donorId');

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (donorId) {
      where.donorId = donorId;
    }

    const donations = await db.foodDonation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Donations GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { donorId, donorName, foodName, description, quantity, unit, expiryTime, category, imageUrl, address, lat, lng } = body;

    if (!foodName || !donorId || !donorName) {
      return NextResponse.json({ error: 'foodName, donorId, and donorName are required' }, { status: 400 });
    }

    const donation = await db.foodDonation.create({
      data: {
        donorId,
        donorName,
        foodName,
        description: description || '',
        quantity: String(quantity || '0'),
        unit: unit || 'servings',
        expiryTime: expiryTime ? new Date(expiryTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        category: category || 'Other',
        imageUrl: imageUrl || null,
        address: address || '',
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        status: 'available',
      },
    });

    return NextResponse.json({ donation }, { status: 201 });
  } catch (error) {
    console.error('Donations POST error:', error);
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    const donation = await db.foodDonation.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ donation });
  } catch (error) {
    console.error('Donations PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    await db.foodDonation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Donations DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}
