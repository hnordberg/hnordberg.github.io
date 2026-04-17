import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore,
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  // If the API key is missing during build, substitute a dummy string so the build doesn't crash, 
  // but be aware that if it's missing the client won't work in production.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "fallback-key-for-ssr",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if it hasn't been initialized already (important for Next.js SSR/HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use modern Firestore initialization with tab-synchronized offline caching
// We gracefully fallback to standard getFirestore on the server because persistent cache uses window.indexedDB
export const db = typeof window !== "undefined"
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : getFirestore(app);

