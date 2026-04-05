import { NextRequest, NextResponse } from 'next/server';
import { mockDonations } from '@/lib/mock-data';
import type { FoodDonation } from '@/lib/types';

let donations = [...mockDonations];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  
  let filtered = [...donations];
  
  if (status) {
    filtered = filtered.filter(d => d.status === status);
  }
  if (category) {
    filtered = filtered.filter(d => d.category === category);
  }
  
  return NextResponse.json({ donations: filtered });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newDonation: FoodDonation = {
    id: `d${Date.now()}`,
    donorId: body.donorId || '1',
    donorName: body.donorName || 'Anonymous Donor',
    foodName: body.foodName,
    description: body.description,
    quantity: body.quantity,
    unit: body.unit,
    expiryTime: body.expiryTime,
    category: body.category,
    imageUrl: body.imageUrl,
    location: body.location,
    status: 'available',
    createdAt: new Date().toISOString(),
  };
  
  donations.unshift(newDonation);
  
  return NextResponse.json({ donation: newDonation }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  
  const index = donations.findIndex(d => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
  }
  
  donations[index] = { ...donations[index], ...updates };
  
  return NextResponse.json({ donation: donations[index] });
}
