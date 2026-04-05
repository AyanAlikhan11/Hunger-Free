import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function userToResponse(user: { id: string; name: string; email: string; role: string; phone?: string | null; address?: string | null; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? undefined,
    address: user.address ?? undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name, role, phone } = body;

    // --- LOGIN ---
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { email } });

      if (!user) {
        return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
      }

      if (user.password !== password) {
        return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
      }

      const token = generateToken();
      // Store token in user record (simple approach - in production use a separate session table)
      await db.user.update({
        where: { id: user.id },
        data: { phone: user.phone }, // trigger updatedAt
      });

      return NextResponse.json({
        user: userToResponse(user),
        token,
      });
    }

    // --- SIGNUP ---
    if (action === 'signup') {
      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
      }

      if (!role) {
        return NextResponse.json({ error: 'Please select a role.' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
      }

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 409 });
      }

      const user = await db.user.create({
        data: {
          name,
          email,
          password,
          role,
          phone: phone || null,
        },
      });

      const token = generateToken();

      return NextResponse.json({
        user: userToResponse(user),
        token,
      });
    }

    // --- LOGOUT ---
    if (action === 'logout') {
      // Clear auth cookie if present
      const response = NextResponse.json({ success: true });
      response.cookies.delete('hf_token');
      return response;
    }

    // --- Unknown action ---
    return NextResponse.json({ error: 'Invalid action. Use login, signup, or logout.' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
