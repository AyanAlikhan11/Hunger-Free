import { NextRequest, NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, role } = body;
  
  // Simulated auth - check if user exists in mock data
  const user = mockUsers.find(u => u.email === email);
  
  if (user && password === 'password') {
    return NextResponse.json({ user });
  }
  
  // Demo login - accept any email/password combo with a role
  const newUser = {
    id: `user_${Date.now()}`,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email,
    role: role || 'donor',
    createdAt: new Date().toISOString(),
  };
  
  return NextResponse.json({ user: newUser });
}
