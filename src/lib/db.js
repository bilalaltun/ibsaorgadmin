import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDq5LYp2EAmDebeIgpKpguDmfAfPbtVrgI",
  authDomain: "ibsa-admin.firebaseapp.com",
  projectId: "ibsa-admin",
  storageBucket: "ibsa-admin.firebasestorage.app",
  messagingSenderId: "670663016193",
  appId: "1:670663016193:web:138189a2c8f8909a616500",
  measurementId: "G-TJH13QZ6D7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
