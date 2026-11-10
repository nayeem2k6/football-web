import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseWebConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0,
);

export const firebaseAuth = isFirebaseWebConfigured
  ? getAuth(
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig),
    )
  : null;
