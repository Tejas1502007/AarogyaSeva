import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "secure-seva",
  appId: "1:72805484139:web:19f633f980474ca1fe532e",
  storageBucket: "secure-seva.firebasestorage.app",
  apiKey: "AIzaSyCwYlfrYQNl7SaiDoKqoU5Sc5jfvb52mqM",
  authDomain: "secure-seva.firebaseapp.com",
  messagingSenderId: "72805484139",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a time.
      console.warn('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the
      // features required to enable persistence.
      console.warn('Firestore persistence not available in this browser.');
    }
  });


export { app, auth, db, storage };
