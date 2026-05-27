import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const provider = new GoogleAuthProvider();


// ==========================
// CADASTRO
// ==========================

const registerForm = document.querySelector("#register-form");

if (registerForm) {

  registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector("#register-email").value;

    const password = document.querySelector("#register-password").value;

    try {

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // DEFINE ADMIN MANUALMENTE PELO EMAIL
      const role =
        email === "admin@gmail.com"
          ? "admin"
          : "user";

      // SALVA NO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
        createdAt: new Date()
      });

      alert("Conta criada!");

      window.location.href = "login.html";

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  });

}


// ==========================
// LOGIN
// ==========================

const loginForm = document.querySelector("#login-form");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector("#login-email").value;

    const password = document.querySelector("#login-password").value;

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login realizado!");

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      alert("Erro no login");

    }

  });

}

const googleButton = document.querySelector("#google-login");

if (googleButton) {

  googleButton.addEventListener("click", async () => {

    try {

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {

        await setDoc(userRef, {
          email: user.email,
          role: "user",
          createdAt: new Date()
        });

      }

      alert("Login com Google realizado!");

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  });

}