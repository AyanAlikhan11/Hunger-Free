// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { name, email, subject, message } = body;

//     if (!name || !email || !subject || !message) {
//       return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
//     }

//     await db.contactMessage.create({
//       data: { name, email, subject, message },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Contact POST error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { db } = getFirebaseAdmin();
    if (!db) return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });

    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    await db.collection(COLLECTIONS.contacts).add({
      name,
      email,
      subject,
      message,
      read: false,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}