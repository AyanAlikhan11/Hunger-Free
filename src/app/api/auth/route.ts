// import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@/lib/db';

// function generateToken(): string {
//   const bytes = new Uint8Array(32);
//   crypto.getRandomValues(bytes);
//   return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
// }

// function userToResponse(user: { id: string; name: string; email: string; role: string; phone?: string | null; address?: string | null; createdAt: Date }) {
//   return {
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     role: user.role,
//     phone: user.phone ?? undefined,
//     address: user.address ?? undefined,
//     createdAt: user.createdAt.toISOString(),
//   };
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { action, email, password, name, role, phone } = body;

//     // --- LOGIN ---
//     if (action === 'login') {
//       if (!email || !password) {
//         return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
//       }

//       const user = await db.user.findUnique({ where: { email } });

//       if (!user) {
//         return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
//       }

//       if (user.password !== password) {
//         return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
//       }

//       const token = generateToken();
//       // Store token in user record (simple approach - in production use a separate session table)
//       await db.user.update({
//         where: { id: user.id },
//         data: { phone: user.phone }, // trigger updatedAt
//       });

//       return NextResponse.json({
//         user: userToResponse(user),
//         token,
//       });
//     }

//     // --- SIGNUP ---
//     if (action === 'signup') {
//       if (!email || !password || !name) {
//         return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
//       }

//       if (!role) {
//         return NextResponse.json({ error: 'Please select a role.' }, { status: 400 });
//       }

//       if (password.length < 6) {
//         return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
//       }

//       const existingUser = await db.user.findUnique({ where: { email } });
//       if (existingUser) {
//         return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 409 });
//       }

//       const user = await db.user.create({
//         data: {
//           name,
//           email,
//           password,
//           role,
//           phone: phone || null,
//         },
//       });

//       const token = generateToken();

//       return NextResponse.json({
//         user: userToResponse(user),
//         token,
//       });
//     }

//     // --- LOGOUT ---
//     if (action === 'logout') {
//       // Clear auth cookie if present
//       const response = NextResponse.json({ success: true });
//       response.cookies.delete('hf_token');
//       return response;
//     }

//     // --- Unknown action ---
//     return NextResponse.json({ error: 'Invalid action. Use login, signup, or logout.' }, { status: 400 });
//   } catch (error: unknown) {
//     const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }

import { NextResponse, type NextRequest } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase/server';
import { COLLECTIONS } from '@/lib/firebase/collections';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function canBeAdmin(email: string) {
  return ADMIN_EMAILS.includes(email);
}

async function firebaseAuthPost(endpoint: string, body: any) {
  if (!API_KEY) throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY');

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Firebase Auth error');
  return data;
}

function userToResponse(userDoc: any, uid: string) {
  return {
    id: uid,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone ?? undefined,
    address: userDoc.address ?? undefined,
    createdAt: userDoc.createdAt || new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const { db, auth } = getFirebaseAdmin();
    if (!db || !auth) {
      return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
    }

    // ─────────────────────────────────────────────────────────────
    // GOOGLE LOGIN / SIGNUP (client sends Firebase ID token)
    // ─────────────────────────────────────────────────────────────
    if (action === 'login-google') {
      const { idToken, role: clientRole, phone: clientPhone } = body;
      if (!idToken) {
        return NextResponse.json({ error: 'Google ID token required' }, { status: 400 });
      }

      const decoded = await auth.verifyIdToken(idToken);
      const uid = decoded.uid;

      const email = decoded.email || '';
      const name = decoded.name || (email ? email.split('@')[0] : 'User');

      const userRef = db.collection(COLLECTIONS.users).doc(uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        // Need role to create profile
        if (!clientRole) {
          return NextResponse.json({
            status: 'role_required',
            name,
            email,
          });
        }

        // Restrict admin role
        if (clientRole === 'admin' && !canBeAdmin(email)) {
          return NextResponse.json({ error: 'Admin role is restricted.' }, { status: 403 });
        }

        const now = new Date().toISOString();
        await userRef.set({
          name,
          email,
          role: clientRole,
          phone: clientPhone || null,
          address: null,
          lat: null,
          lng: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        return NextResponse.json({
          user: userToResponse({ name, email, role: clientRole, phone: clientPhone, createdAt: now }, uid),
          token: idToken,
        });
      }

      const userDoc = userSnap.data() as any;

      if (userDoc.isActive === false) {
        return NextResponse.json({ error: 'Account disabled. Contact support.' }, { status: 403 });
      }

      return NextResponse.json({
        user: userToResponse(userDoc, uid),
        token: idToken,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // EMAIL/PASSWORD LOGIN
    // ─────────────────────────────────────────────────────────────
    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      const signIn = await firebaseAuthPost('accounts:signInWithPassword', {
        email,
        password,
        returnSecureToken: true,
      });

      const uid = signIn.localId as string;
      const userRef = db.collection(COLLECTIONS.users).doc(uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        // If profile missing, auto-create as donor
        const now = new Date().toISOString();
        await userRef.set({
          name: signIn.displayName || email.split('@')[0],
          email,
          role: 'donor',
          phone: null,
          address: null,
          lat: null,
          lng: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      const userDoc = (await userRef.get()).data() as any;

      if (userDoc.isActive === false) {
        return NextResponse.json({ error: 'Account disabled. Contact support.' }, { status: 403 });
      }

      return NextResponse.json({
        user: userToResponse(userDoc, uid),
        token: signIn.idToken,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // EMAIL/PASSWORD SIGNUP
    // ─────────────────────────────────────────────────────────────
    if (action === 'signup') {
      const { email, password, name, role, phone } = body;

      if (!email || !password || !name || !role) {
        return NextResponse.json({ error: 'All required fields missing' }, { status: 400 });
      }

      if (role === 'admin' && !canBeAdmin(email)) {
        return NextResponse.json({ error: 'Admin role is restricted.' }, { status: 403 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }

      const signUp = await firebaseAuthPost('accounts:signUp', {
        email,
        password,
        returnSecureToken: true,
      });

      const uid = signUp.localId as string;
      const now = new Date().toISOString();

      await db.collection(COLLECTIONS.users).doc(uid).set({
        name,
        email,
        role,
        phone: phone || null,
        address: null,
        lat: null,
        lng: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      return NextResponse.json({
        user: userToResponse({ name, email, role, phone, createdAt: now }, uid),
        token: signUp.idToken,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // LOGOUT (client-side for Firebase; keep endpoint for your store)
    // ─────────────────────────────────────────────────────────────
    if (action === 'logout') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use login, signup, login-google, or logout.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}