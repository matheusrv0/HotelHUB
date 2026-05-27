import { db, auth } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const CLOUD_NAME = "duubqymnq";

const UPLOAD_PRESET = "hotehub123";

async function uploadImageToCloudinary(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  return data.secure_url;
}

const form = document.querySelector("#hotel-form");

const hotelList = document.querySelector("#hotel-list");

// ======================================
// VERIFICA SE USUÁRIO É ADMIN
// ======================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Faça login primeiro");

    window.location.href = "login.html";

    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Usuário não encontrado");

      window.location.href = "login.html";

      return;
    }

    const userData = userSnap.data();

    if (userData.role !== "admin") {
      alert("Acesso negado");

      window.location.href = "index.html";

      return;
    }

    // se for admin:
    loadHotels();
  } catch (error) {
    console.error(error);

    alert("Erro ao verificar usuário");
  }
});

// ======================================
// CARREGAR HOTÉIS
// ======================================

async function loadHotels() {
  hotelList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "hotels"));

  querySnapshot.forEach((hotelDoc) => {
    const hotel = hotelDoc.data();

    const card = document.createElement("div");

    card.className = "hotel-card";

    card.innerHTML = `
      <img src="${hotel.image}" />

      <h2>${hotel.name}</h2>

      <p><strong>Destino:</strong> ${hotel.destination}</p>

      <p><strong>Preço:</strong> R$ ${hotel.price}</p>

      <p><strong>Avaliação:</strong> ${hotel.rating}</p>

      <p><strong>Hóspedes:</strong> ${hotel.maxGuests}</p>

      <p>${hotel.description}</p>

      <div class="actions">
        <button class="delete-btn" data-id="${hotelDoc.id}">
          Excluir
        </button>
      </div>
    `;

    hotelList.appendChild(card);
  });

  setupDeleteButtons();
}

// ======================================
// CRIAR HOTEL
// ======================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const imageFile = document.querySelector("#image").files[0];

    if (!imageFile) {
      alert("Selecione uma imagem para o hotel.");
      return;
    }

    const imageUrl = await uploadImageToCloudinary(imageFile);

    const hotel = {
      name: document.querySelector("#name").value,
      destination: document.querySelector("#destination").value,
      price: Number(document.querySelector("#price").value),
      rating: Number(document.querySelector("#rating").value),
      maxGuests: Number(document.querySelector("#maxGuests").value),
      image: imageUrl,
      description: document.querySelector("#description").value,
      availableFrom: document.querySelector("#availableFrom").value,
      availableTo: document.querySelector("#availableTo").value,
    };

    await addDoc(collection(db, "hotels"), hotel);

    alert("Hotel criado com sucesso!");

    form.reset();

    loadHotels();
  } catch (error) {
    console.error(error);
    alert("Erro ao criar hotel");
  }
});

// ======================================
// EXCLUIR HOTEL
// ======================================

function setupDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.id;

      const confirmDelete = confirm("Deseja excluir este hotel?");

      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "hotels", id));

        alert("Hotel removido!");

        loadHotels();
      } catch (error) {
        console.error(error);

        alert("Erro ao excluir");
      }
    });
  });
}
