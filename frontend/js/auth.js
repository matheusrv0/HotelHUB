import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

// ==========================
// CADASTRO
// ==========================

function showMessage(message) {
  const messageBox = document.querySelector("#auth-message");

  if (!messageBox) return;

  messageBox.innerText = message;

  messageBox.style.display = "block";
}

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
        password,
      );

      const user = userCredential.user;

      // DEFINE ADMIN MANUALMENTE PELO EMAIL
      const role = email === "admin@gmail.com" ? "admin" : "user";

      // SALVA NO FIRESTORE
      await setDoc(doc(db, "users", user.uid), {
        email,
        role,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);

      await signOut(auth);

      showMessage("Conta criada! Verifique seu email.");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      console.error(error);

      showMessage(error.message);
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        showMessage("Verifique seu email antes de entrar.");

        return;
      }

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error(error);

      showMessage("Erro no login");
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
          createdAt: new Date(),
        });
      }

      showMessage("Login com Google realizado!");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error(error);

      showMessage(error.message);
    }
  });
}

const googleRegister = document.querySelector("#google-register");

if (googleRegister) {
  googleRegister.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userRef = doc(db, "users", user.uid);

      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: "user",
          createdAt: new Date(),
        });
      }

      showMessage("Conta Google criada com sucesso!");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error(error);

      showMessage("Erro ao cadastrar com Google");
    }
  });
}
