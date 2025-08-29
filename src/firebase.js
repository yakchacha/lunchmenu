// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8mqTmsrPpZ78TnlG2futeve5hEc3aEFI",            // 복사해온 값 붙여넣기
  authDomain: "lunchroulette-4758c.firebaseapp.com",
  projectId: "lunchroulette-4758c",
  storageBucket: "lunchroulette-4758c.firebasestorage.app",
  messagingSenderId: "312740196547",
  appId: "1:312740196547:web:c05ecc89cfeaae16453276"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
