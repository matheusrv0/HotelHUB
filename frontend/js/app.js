import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let hotels = [];

const hotelList = document.querySelector("#hotel-list");
const searchForm = document.querySelector("#hotel-search");
const searchFeedback = document.querySelector("#search-feedback");
const toast = document.querySelector("#toast");
const carouselTrack = document.querySelector("#carousel-track");
const carouselDots = document.querySelector("#carousel-dots");
const carouselPrev = document.querySelector("#carousel-prev");
const carouselNext = document.querySelector("#carousel-next");
const loginButton = document.querySelector('a[href="login.html"]');
const signupButton = document.querySelector('a[href="cadastro.html"]');
const userName = document.querySelector("#user-name");
const adminLink = document.querySelector("#admin-link");
const logoutButton = document.querySelector("#logout-button");
const datePickers = document.querySelectorAll("[data-datepicker]");
const navLinks = document.querySelectorAll(".main-nav a");

let currentSlide = 0;
let carouselTimerId;
const datePickerState = {};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const dateInputs = {
  checkin: document.querySelector("#checkin"),
  checkout: document.querySelector("#checkout"),
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);

  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3000);
}

async function loadHotels() {
  try {
    const querySnapshot = await getDocs(collection(db, "hotels"));

    hotels = [];

    querySnapshot.forEach((docItem) => {
      hotels.push({
        id: docItem.id,
        ...docItem.data(),
      });
    });

    renderHotels(hotels);

    console.log("Hotéis carregados:", hotels);
  } catch (error) {
    console.error("Erro ao carregar hotéis:", error);
    showToast("Erro ao carregar hotéis.");
  }
}

function normalizeSearchTerm(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function resetHotelSearch() {
  searchForm.reset();

  dateInputs.checkin.value = "";
  dateInputs.checkout.value = "";

  delete dateInputs.checkin.dataset.date;
  delete dateInputs.checkout.dataset.date;

  Object.values(datePickerState).forEach((state) => {
    state.selected = null;
  });

  renderHotels(hotels);
  setSearchFeedback("Mostrando sugestões selecionadas para sua viagem.");
}

function renderHotels(items, hasActiveSearch = false) {
  hotelList.innerHTML = "";

  if (items.length === 0) {
    hotelList.innerHTML = `
      <div class="empty-message">
        <p>Nenhum hotel encontrado com esses filtros.</p>
        ${
          hasActiveSearch
            ? '<button class="ghost-button" type="button" data-action="reset-search">Mostrar todas as estadias</button>'
            : ""
        }
      </div>
    `;
    return;
  }

  items.forEach((hotel) => {
    const card = document.createElement("article");
    card.className = "hotel-card";

    card.innerHTML = `
      <img
        src="${hotel.image}"
        alt="Foto ilustrativa do ${hotel.name}"
        loading="lazy"
        decoding="async"
      />

      <div class="hotel-card-content">
        <h3>${hotel.name}</h3>

        <div class="hotel-meta">
          <span>${hotel.destination}</span>
          <strong>${hotel.rating} estrelas</strong>
        </div>

        <span class="hotel-capacity">
          Até ${hotel.maxGuests} hóspede(s)
        </span>

        <p class="hotel-description">
          ${hotel.description}
        </p>

        <div class="hotel-meta">
          <strong>R$ ${hotel.price}</strong>
          <span>por noite</span>
        </div>

        <div class="hotel-actions">
          <button
            class="ghost-button"
            type="button"
            data-action="details"
            data-hotel="${hotel.name}"
          >
            Ver detalhes
          </button>

          <button
            class="secondary-button"
            type="button"
            data-action="book"
            data-hotel="${hotel.name}"
          >
            Reservar
          </button>
        </div>
      </div>
    `;

    hotelList.appendChild(card);
  });
}

function parseDateKey(dateKey) {
  if (!dateKey) return null;

  const [year, month, date] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, date);
}

function getDateInputKey(input) {
  return input.id;
}

function getSelectedDate(inputId) {
  return datePickerState[inputId]?.selected ?? null;
}

function setSearchFeedback(message) {
  searchFeedback.textContent = message;
}

function updateCarousel() {
  carouselTrack.querySelectorAll("img").forEach((image, index) => {
    image.classList.toggle("is-active", index === currentSlide);
  });

  carouselDots.querySelectorAll(".carousel-dot").forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentSlide);
  });
}

function goToSlide(index) {
  const totalSlides = carouselTrack.children.length;

  currentSlide = (index + totalSlides) % totalSlides;

  updateCarousel();
}

function restartCarouselTimer() {
  window.clearInterval(carouselTimerId);

  carouselTimerId = window.setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 6500);
}

function setupCarousel() {
  const totalSlides = carouselTrack.children.length;

  for (let index = 0; index < totalSlides; index += 1) {
    const dot = document.createElement("button");

    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ver imagem ${index + 1}`);

    dot.addEventListener("click", () => {
      goToSlide(index);
      restartCarouselTimer();
    });

    carouselDots.appendChild(dot);
  }

  carouselPrev.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    restartCarouselTimer();
  });

  carouselNext.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    restartCarouselTimer();
  });

  updateCarousel();
  restartCarouselTimer();
}

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function isSameOrBefore(firstDate, secondDate) {
  return toDateKey(firstDate) <= toDateKey(secondDate);
}

function isSameOrAfter(firstDate, secondDate) {
  return toDateKey(firstDate) >= toDateKey(secondDate);
}

function isAfter(firstDate, secondDate) {
  return toDateKey(firstDate) > toDateKey(secondDate);
}

function hotelMatchesDates(hotel, checkinDate, checkoutDate) {
  if (!checkinDate && !checkoutDate) return true;

  const availableFrom = parseDateKey(hotel.availableFrom);
  const availableTo = parseDateKey(hotel.availableTo);
  const startDate = checkinDate ?? checkoutDate;
  const endDate = checkoutDate ?? checkinDate;

  return (
    isSameOrAfter(startDate, availableFrom) &&
    isSameOrBefore(endDate, availableTo)
  );
}

function createCalendar(dateField) {
  const input = dateField.querySelector("[data-date-input]");
  const trigger = dateField.querySelector("[data-date-trigger]");
  const clear = dateField.querySelector("[data-date-clear]");
  const inputKey = getDateInputKey(input);
  const today = new Date();

  const state = {
    selected: null,
    viewDate: new Date(today.getFullYear(), today.getMonth(), 1),
  };

  datePickerState[inputKey] = state;

  const popover = document.createElement("div");

  popover.className = "calendar-popover";

  popover.innerHTML = `
    <div class="calendar-header">
      <button class="calendar-nav" type="button" aria-label="Mês anterior" data-calendar-prev>&lsaquo;</button>
      <strong class="calendar-title" data-calendar-title></strong>
      <button class="calendar-nav" type="button" aria-label="Próximo mês" data-calendar-next>&rsaquo;</button>
    </div>

    <div class="calendar-weekdays" aria-hidden="true">
      <span>Dom</span>
      <span>Seg</span>
      <span>Ter</span>
      <span>Qua</span>
      <span>Qui</span>
      <span>Sex</span>
      <span>Sáb</span>
    </div>

    <div class="calendar-grid" data-calendar-grid></div>
  `;

  dateField.appendChild(popover);

  const title = popover.querySelector("[data-calendar-title]");
  const grid = popover.querySelector("[data-calendar-grid]");
  const previous = popover.querySelector("[data-calendar-prev]");
  const next = popover.querySelector("[data-calendar-next]");

  function getMinimumDate() {
    if (inputKey !== "checkout") return today;

    const checkinDate = getSelectedDate("checkin");

    if (!checkinDate) return today;

    const nextDay = new Date(checkinDate);

    nextDay.setDate(checkinDate.getDate() + 1);

    return nextDay;
  }

  function syncRelatedDates() {
    const checkinDate = getSelectedDate("checkin");
    const checkoutDate = getSelectedDate("checkout");

    if (!checkinDate || !checkoutDate || isAfter(checkoutDate, checkinDate)) {
      return;
    }

    datePickerState.checkout.selected = null;
    dateInputs.checkout.value = "";

    setSearchFeedback("Escolha uma data de saída posterior à entrada.");
  }

  function renderCalendar() {
    const year = state.viewDate.getFullYear();
    const month = state.viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);

    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    title.textContent = monthFormatter.format(state.viewDate);
    grid.innerHTML = "";

    for (let dayIndex = 0; dayIndex < 42; dayIndex += 1) {
      const date = new Date(startDate);

      date.setDate(startDate.getDate() + dayIndex);

      const button = document.createElement("button");
      const dateKey = toDateKey(date);

      button.className = "calendar-day";
      button.type = "button";
      button.textContent = date.getDate();
      button.dataset.date = dateKey;
      button.setAttribute("aria-label", dateFormatter.format(date));
      button.tabIndex = -1;

      if (dateKey < toDateKey(getMinimumDate())) {
        button.disabled = true;
      }

      if (date.getMonth() !== month) {
        button.classList.add("is-muted");
      }

      if (dateKey === toDateKey(today)) {
        button.classList.add("is-today");
      }

      if (state.selected && dateKey === toDateKey(state.selected)) {
        button.classList.add("is-selected");
      }

      const checkinDate = getSelectedDate("checkin");
      const checkoutDate = getSelectedDate("checkout");

      if (
        checkinDate &&
        checkoutDate &&
        dateKey > toDateKey(checkinDate) &&
        dateKey < toDateKey(checkoutDate)
      ) {
        button.classList.add("is-in-range");
      }

      grid.appendChild(button);
    }
  }

  function openCalendar() {
    document.querySelectorAll(".date-field.is-open").forEach((openField) => {
      if (openField !== dateField) {
        openField.classList.remove("is-open");
      }
    });

    dateField.classList.add("is-open");

    renderCalendar();

    const selectedDay = grid.querySelector(
      ".calendar-day.is-selected:not(:disabled)"
    );

    const firstAvailableDay = grid.querySelector(
      ".calendar-day:not(:disabled)"
    );

    (selectedDay ?? firstAvailableDay)?.focus();
  }

  function closeCalendar() {
    dateField.classList.remove("is-open");
  }

  trigger.addEventListener("click", () => {
    if (dateField.classList.contains("is-open")) {
      closeCalendar();
      return;
    }

    openCalendar();
  });

  input.addEventListener("click", openCalendar);

  clear.addEventListener("click", () => {
    state.selected = null;
    input.value = "";

    delete input.dataset.date;

    syncRelatedDates();
    renderCalendar();
  });

  previous.addEventListener("click", () => {
    state.viewDate.setMonth(state.viewDate.getMonth() - 1);
    renderCalendar();
  });

  next.addEventListener("click", () => {
    state.viewDate.setMonth(state.viewDate.getMonth() + 1);
    renderCalendar();
  });

  grid.addEventListener("click", (event) => {
    const day = event.target.closest(".calendar-day");

    if (!day) return;

    const [year, month, date] = day.dataset.date.split("-").map(Number);

    state.selected = new Date(year, month - 1, date);
    state.viewDate = new Date(year, month - 1, 1);
    input.value = dateFormatter.format(state.selected);
    input.dataset.date = day.dataset.date;

    syncRelatedDates();
    renderCalendar();
    closeCalendar();
  });

  grid.addEventListener("keydown", (event) => {
    const activeDay = event.target.closest(".calendar-day");

    if (!activeDay) return;

    const movement = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    }[event.key];

    if (!movement) return;

    event.preventDefault();

    const currentDate = parseDateKey(activeDay.dataset.date);

    currentDate.setDate(currentDate.getDate() + movement);

    state.viewDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    renderCalendar();

    grid
      .querySelector(`[data-date="${toDateKey(currentDate)}"]:not(:disabled)`)
      ?.focus();
  });

  renderCalendar();
}

function setupDatePickers() {
  datePickers.forEach(createCalendar);

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-datepicker]")) return;

    document.querySelectorAll(".date-field.is-open").forEach((dateField) => {
      dateField.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    document.querySelectorAll(".date-field.is-open").forEach((dateField) => {
      dateField.classList.remove("is-open");
    });
  });
}

function setupActiveNavigation() {
  const sections = [...navLinks]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        const isCurrent =
          link.getAttribute("href") === `#${visibleEntry.target.id}`;

        link.classList.toggle("is-active", isCurrent);
        link.toggleAttribute("aria-current", isCurrent);
      });
    },
    {
      rootMargin: "-35% 0px -55% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(carouselTimerId);
    return;
  }

  restartCarouselTimer();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(searchForm);
  const destination = normalizeSearchTerm(formData.get("destination"));
  const guests = Number(formData.get("guests"));
  const checkinDate = getSelectedDate("checkin");
  const checkoutDate = getSelectedDate("checkout");

  if (checkinDate && checkoutDate && !isAfter(checkoutDate, checkinDate)) {
    showToast("A data de saída precisa ser posterior à entrada.");
    setSearchFeedback("Ajuste as datas para continuar a busca.");
    return;
  }

  const filteredHotels = hotels.filter((hotel) => {
    const matchesDestination = destination
      ? normalizeSearchTerm(hotel.destination).includes(destination) ||
        normalizeSearchTerm(hotel.name).includes(destination)
      : true;

    const matchesGuests = Number.isNaN(guests)
      ? true
      : hotel.maxGuests >= guests;

    const matchesDates = hotelMatchesDates(hotel, checkinDate, checkoutDate);

    return matchesDestination && matchesGuests && matchesDates;
  });

  renderHotels(filteredHotels, true);

  const resultLabel =
    filteredHotels.length === 1 ? "estadia encontrada" : "estadias encontradas";

  const dateLabel =
    checkinDate && checkoutDate
      ? ` entre ${dateFormatter.format(checkinDate)} e ${dateFormatter.format(
          checkoutDate
        )}`
      : "";

  setSearchFeedback(
    `${filteredHotels.length} ${resultLabel} para ${guests} hóspede(s)${dateLabel}.`
  );

  showToast(`Busca atualizada com ${filteredHotels.length} resultado(s).`);
});

hotelList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  const action = button.dataset.action;

  if (action === "reset-search") {
    resetHotelSearch();
    showToast("Filtros limpos. Mostrando todas as estadias.");
    return;
  }

  const hotelName = button.dataset.hotel;

  if (action === "details") {
    showToast(`Detalhes de ${hotelName}.`);
    return;
  }

  if (action === "book") {
    const selectedHotel = hotels.find((hotel) => hotel.name === hotelName);

    if (!selectedHotel) {
      showToast("Hotel não encontrado.");
      return;
    }

    try {
      showToast("Iniciando checkout...");

      const response = await fetch("http://localhost:3000/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedHotel.name,
          price: selectedHotel.price,
        }),
      });

      const data = await response.json();

      console.log("Resposta Mercado Pago:", data);

      if (!response.ok || !data.id) {
        throw new Error(data.error || "Erro ao criar pagamento.");
      }

      window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${data.id}`;
    } catch (error) {
      console.error(error);
      showToast("Erro ao iniciar pagamento. Verifique se o backend está rodando.");
    }
  }
});

setupCarousel();
setupDatePickers();
setupActiveNavigation();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    logoutButton.style.display = "none";
    adminLink.style.display = "none";
    userName.innerText = "";

    if (loginButton) loginButton.style.display = "inline-flex";
    if (signupButton) signupButton.style.display = "inline-flex";

    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();

  userName.innerText = userData.email;
  logoutButton.style.display = "inline-block";

  if (loginButton) loginButton.style.display = "none";
  if (signupButton) signupButton.style.display = "none";

  if (userData.role === "admin") {
    adminLink.style.display = "inline-block";
  }
});

logoutButton.addEventListener("click", async () => {
  await signOut(auth);

  showToast("Logout realizado com sucesso!");

  setTimeout(() => {
    window.location.reload();
  }, 1200);
});

loadHotels();