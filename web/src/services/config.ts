import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbwGLSc5tyH6m4LHudOrUfpLGIRqiAm6o",
  authDomain: "testecontatos-e5285.firebaseapp.com",
  projectId: "testecontatos-e5285",
  storageBucket: "testecontatos-e5285.firebasestorage.app",
  messagingSenderId: "526189889345",
  appId: "1:526189889345:web:0189d7c50849b064fd03c0"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);