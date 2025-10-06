import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// --- Firebase Configuration ---
// IMPORTANT: To protect your API keys, this project is configured to use
// environment variables. You need to create a file named `.env` in the root
// of the project directory (at the same level as `package.json`).
//
// Your `.env` file should look like this (replace with your actual keys):
//
// EXPO_PUBLIC_API_KEY="your-api-key"
// EXPO_PUBLIC_AUTH_DOMAIN="your-auth-domain"
// EXPO_PUBLIC_PROJECT_ID="your-project-id"
// EXPO_PUBLIC_STORAGE_BUCKET="your-storage-bucket"
// EXPO_PUBLIC_MESSAGING_SENDER_ID="your-messaging-sender-id"
// EXPO_PUBLIC_APP_ID="your-app-id"
//
// The `EXPO_PUBLIC_` prefix is required by Expo to expose these variables to
// the client-side application. The `.env` file is already listed in `.gitignore`
// to prevent it from being committed to version control.

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_APP_ID
};

// Initialize Firebase
// Add a check to ensure the config is not empty, preventing crashes.
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase config is missing. Make sure you have a .env file with your Firebase credentials.");
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };