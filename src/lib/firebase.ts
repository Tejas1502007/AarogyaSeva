import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIv_FdNLdtKdLZdP4cctY5CNSOjTB3vak",
  authDomain: "med-seva-f584a.firebaseapp.com",
  projectId: "med-seva-f584a",
  storageBucket: "med-seva-f584a.firebasestorage.app",
  messagingSenderId: "666321516268",
  appId: "1:666321516268:web:43592915a655ef83acd7c9",
  measurementId: "G-XZS03WYPKX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Only connect if not already connected
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099');
    }
    if (!db._delegate._databaseId.projectId.includes('demo-')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    console.log('Emulators not available, using production Firebase');
  }
}

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firestore persistence failed: multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        console.warn('Firestore persistence not available in this browser.');
      } else {
        console.warn('Firestore persistence error:', err);
      }
    });
}

export { app, auth, db };
