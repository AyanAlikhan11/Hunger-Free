import { initializeApp, cert, getApps, getApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function normalizePrivateKey(key: string) {
  return key.replace(/\\n/g, '\n');
}

export function getFirebaseAdmin() {
  if (adminApp && adminAuth && adminDb) return { app: adminApp, auth: adminAuth, db: adminDb };

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) return { app: null, auth: null, db: null };

  const parsed = JSON.parse(serviceAccountKey);
  if (parsed.private_key) parsed.private_key = normalizePrivateKey(parsed.private_key);

  adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(parsed) });
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);

  return { app: adminApp, auth: adminAuth, db: adminDb };
}