// src/firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "너의_API_KEY",
  authDomain: "너의_PROJECT_ID.firebaseapp.com",
  projectId: "너의_PROJECT_ID",
  storageBucket: "너의_PROJECT_ID.appspot.com",
  messagingSenderId: "너의_ID",
  appId: "너의_APP_ID"
};

const app = initializeApp(firebaseConfig);

export default app;
