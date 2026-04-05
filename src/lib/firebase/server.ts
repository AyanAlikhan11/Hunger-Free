/**
 * Firebase Admin SDK Configuration (Server-Side Only)
 * 
 * This module initializes the Firebase Admin SDK for server-side operations.
 * Used in API routes for server-to-server authentication and Firestore admin operations.
 * 
 * SETUP:
 * Add to your .env.local:
 *   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
 *   Or set FIREBASE_PROJECT_ID and let the Admin SDK discover credentials
 */

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: ReturnType<typeof getApp> | null = null;
let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseAdmin() {
  if (adminApp) {
    return { app: adminApp, auth: adminAuth!, db: adminDb! };
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  
  if (!serviceAccountKey && !projectId) {
    return { app: null, auth: null, db: null };
  }

  try {
    if (getApps().length === 0) {
      if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        adminApp = initializeApp({
          credential: cert(serviceAccount),
        });
      } else if (projectId) {
        adminApp = initializeApp({
          projectId,
        });
      }
    } else {
      adminApp = getApp();
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    
    return { app: adminApp, auth: adminAuth, db: adminDb };
  } catch (error) {
    console.warn('[Firebase Admin] Failed to initialize:', error);
    return { app: null, auth: null, db: null };
  }
}

export { adminAuth, adminDb };
