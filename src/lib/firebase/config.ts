

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

// Initialize Firebase (only if configured)
let app: ReturnType<typeof getApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

if (isFirebaseConfigured && typeof window !== 'undefined') {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('[Firebase] Failed to initialize:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH SERVICES
// ═══════════════════════════════════════════════════════════════════

export async function firebaseSignUp(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth not configured');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function firebaseSignIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase Auth not configured');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function firebaseSignOutUser() {
  if (!auth) throw new Error('Firebase Auth not configured');
  await firebaseSignOut(auth);
}

export function firebaseOnAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// ═══════════════════════════════════════════════════════════════════
// FIRESTORE SERVICES
// ═══════════════════════════════════════════════════════════════════

const COLLECTIONS = {
  users: 'users',
  donations: 'donations',
  requests: 'requests',
  products: 'products',
  contacts: 'contacts',
} as const;

export async function firebaseGetDocument(collectionName: string, docId: string) {
  if (!db) throw new Error('Firestore not configured');
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function firebaseGetCollection(
  collectionName: string,
  filters?: { field: string; operator: string; value: unknown }[],
  orderField?: string,
  orderDir?: 'asc' | 'desc',
  limitCount?: number
) {
  if (!db) throw new Error('Firestore not configured');
  
  let q = query(collection(db, collectionName));
  
  if (filters) {
    filters.forEach((f) => {
      q = query(q, where(f.field, f.operator as any, f.value));
    });
  }
  
  if (orderField) {
    q = query(q, orderBy(orderField, orderDir || 'desc'));
  }
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function firebaseAddDocument(collectionName: string, data: DocumentData) {
  if (!db) throw new Error('Firestore not configured');
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function firebaseUpdateDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
) {
  if (!db) throw new Error('Firestore not configured');
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function firebaseDeleteDocument(collectionName: string, docId: string) {
  if (!db) throw new Error('Firestore not configured');
  await deleteDoc(doc(db, collectionName, docId));
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE SERVICES
// ═══════════════════════════════════════════════════════════════════

export async function firebaseUploadImage(file: File, path: string) {
  if (!storage) throw new Error('Firebase Storage not configured');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// ═══════════════════════════════════════════════════════════════════
// FIRESTORE SECURITY RULES (for production)
// ═══════════════════════════════════════════════════════════════════

export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if getRole() == 'admin';
    }

    // Donations collection
    match /donations/{donationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.donorId == request.auth.uid || getRole() == 'admin');
      allow delete: if getRole() == 'admin';
    }

    // Requests collection
    match /requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if getRole() == 'admin';
    }

    // Products collection
    match /products/{productId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
        (resource.data.farmerId == request.auth.uid || getRole() == 'admin');
      allow delete: if getRole() == 'admin';
    }

    // Contacts collection
    match /contacts/{contactId} {
      allow create: if !isAuthenticated(); // Anyone can submit contact form
      allow read, update, delete: if getRole() == 'admin';
    }
  }
}
`;

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { COLLECTIONS };
export { app as firebaseApp };
export { auth as firebaseAuth };
export { db as firebaseDb };
export { storage as firebaseStorage };
