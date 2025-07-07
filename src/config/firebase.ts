import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Configuration Firebase optimisée
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "ton-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "ton-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "ton-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "ton-storage-bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "ton-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "ton-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services avec optimisations
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration optimisée pour le développement
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase configuré pour InShape');
}

export default app; 