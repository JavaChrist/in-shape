import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Vérification des variables d'environnement Firebase
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ Variables d\'environnement Firebase manquantes:', missingEnvVars);
  console.warn('📝 Vérifiez votre fichier .env.local avec les variables Firebase requises');
}

const firebaseConfig = {
  // Configuration Firebase
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "demo-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "demo-storage-bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "demo-app-id"
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
  if (missingEnvVars.length === 0) {
    console.log('✅ Configuration Firebase chargée depuis .env.local');
  } else {
    console.warn('⚠️ Mode développement: utilisation de la configuration Firebase de démonstration');
    console.warn('📝 Pour utiliser Firebase, vérifiez votre fichier .env.local');
  }
}

export default app; 