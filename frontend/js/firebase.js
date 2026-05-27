import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6c6Kc71JxchrCNs6pOEt1D_pTI1fzb2c",
  authDomain: "hotelhub-bae68.firebaseapp.com",
  projectId: "hotelhub-bae68",
  storageBucket: "hotelhub-bae68.firebasestorage.app",  
  messagingSenderId: "962391942418",
  appId: "1:962391942418:web:3b0afef4d342179a987fcb" ,
  measurementId: "G-5WH8Y67RWF"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };