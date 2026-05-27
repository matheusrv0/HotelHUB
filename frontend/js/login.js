import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const form = document.querySelector("#login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    const userDoc = await getDoc(
      doc(db, "users", user.uid)
    );

    const userData = userDoc.data();

    if (userData.role === "admin") {

      window.location.href = "admin.html";

    } else {

      window.location.href = "index.html";

    }

  } catch (error) {
    console.error(error);
    alert("Erro no login");
  }
});