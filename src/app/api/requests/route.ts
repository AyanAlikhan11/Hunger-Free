import { NextRequest, NextResponse } from 'next/server';
import { mockRequests } from '@/lib/mock-data';
import type { PickupRequest } from '@/lib/types';

let requests = [...mockRequests];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ngoId = searchParams.get('ngoId');
  const volunteerId = searchParams.get('volunteerId');
  
  let filtered = [...requests];
  
  if (ngoId) {
    filtered = filtered.filter(r => r.ngoId === ngoId);
  }
  if (volunteerId) {
    filtered = filtered.filter(r => r.volunteerId === volunteerId);
  }
  
  return NextResponse.json({ requests: filtered });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newRequest: PickupRequest = {
    id: `r${Date.now()}`,
    donationId: body.donationId,
    ngoId: body.ngoId || '2',
    ngoName: body.ngoName || 'Unknown NGO',
    volunteerId: body.volunteerId,
    volunteerName: body.volunteerName,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  requests.unshift(newRequest);
  
  return NextResponse.json({ request: newRequest }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }
  
  requests[index] = { ...requests[index], ...updates, updatedAt: new Date().toISOString() };
  
  return NextResponse.json({ request: requests[index] });
}
