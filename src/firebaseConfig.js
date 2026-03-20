import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUSGnBx79fM8lSTaqgugap3h7LOkCF_cA",
  authDomain: "notasapp-e04da.firebaseapp.com",
  projectId: "notasapp-e04da",
  storageBucket: "notasapp-e04da.firebasestorage.app",
  messagingSenderId: "405473313790",
  appId: "1:405473313790:web:2090d549c2cc1c1647b6af"
};

let app;
let auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
