// firebase-init.js

import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZhX_W-xqhLcBsBLTzGqmhyHuglO5w2xo",
  authDomain: "mindlymaster.firebaseapp.com",
  projectId: "mindlymaster",
  storageBucket: "mindlymaster.firebaseapp.com",
  messagingSenderId: "615736887816",
  appId: "1:615736887816:web:c047349a873344a0535fbd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);