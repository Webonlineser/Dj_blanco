// 🔹 1️⃣ Importaciones desde CDN 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
  getFirestore, collection, addDoc, serverTimestamp, 
  query, orderBy, getDocs, startAfter, limit,
  deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// 🔹 2️⃣ Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBpcuOfOqBghIpzajGNorVwAIsKoBXjXKo",
  authDomain: "agenda-pacientes-2cd22.firebaseapp.com",
  projectId: "agenda-pacientes-2cd22",
  storageBucket: "agenda-pacientes-2cd22.firebasestorage.app",
  messagingSenderId: "871997257295",
  appId: "1:871997257295:web:752dcc2d22336e28cc9c3a",
  measurementId: "G-C3ZLF7XB8H"
};

// 🔹 3️⃣ Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🔹 4️⃣ Selección de elementos del HTML
const form = document.querySelector(".comments-form");
const nombreInput = form.querySelector("input[type=text]");
const mensajeInput = form.querySelector("textarea");
const listaComentarios = document.querySelector(".comments-list");
const PASSWORD_ADMIN = "Luna07022022"; // cambiala
let isAdmin = false;

const btnLogin = document.getElementById("btn-login");
const modalLogin = document.getElementById("login-modal");
const inputPassword = document.getElementById("login-password");
const btnConfirmLogin = document.getElementById("login-confirm");


// 🔹 5️⃣ Variables para paginación
let lastVisible = null;
const pageSize = 10;
let loading = false;

// 🔹 6️⃣ Función para renderizar un comentario
function renderComment(docSnap) {
  const c = docSnap.data();
  const p = document.createElement("p");

  p.innerHTML = `<strong>${c.nombre}</strong><br>${c.mensaje}`;

  if (isAdmin) {
    const del = document.createElement("span");
    del.textContent = "✖";
    del.classList.add("delete-comment");

    del.addEventListener("click", async () => {
      if (confirm("¿Borrar comentario?")) {
        await deleteDoc(doc(db, "comentarios", docSnap.id));
        loadComments(true);
      }
    });

    p.appendChild(del);
  }

  listaComentarios.appendChild(p);
}

// 🔹 7️⃣ Función para cargar comentarios con paginación
async function loadComments(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    listaComentarios.innerHTML = "";
    lastVisible = null;
  }

  let q;
  if (lastVisible) {
    q = query(
      collection(db, "comentarios"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, "comentarios"),
      orderBy("timestamp", "desc"),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => renderComment(doc));

  if (snapshot.docs.length > 0) {
    lastVisible = snapshot.docs[snapshot.docs.length - 1];
  }

  // Mostrar u ocultar botón "Ver más"
  const btn = document.querySelector("#ver-mas-btn");
  if (snapshot.docs.length === pageSize) {
    if (!btn) {
      const btnNew = document.createElement("button");
      btnNew.id = "ver-mas-btn";
      btnNew.textContent = "Ver más comentarios";
      btnNew.style.marginTop = "10px";
      btnNew.addEventListener("click", () => loadComments());
      listaComentarios.parentElement.appendChild(btnNew);
    }
  } else if (btn) {
    btn.remove();
  }

  loading = false;
}

// 🔹 8️⃣ Escuchar el envío del formulario y agregar comentario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const mensaje = mensajeInput.value.trim();
  if (!nombre || !mensaje) return alert("Completa todo");

  try {
    await addDoc(collection(db, "comentarios"), {
      nombre,
      mensaje,
      timestamp: serverTimestamp()
    });

    // Limpiar campos
    nombreInput.value = "";
    mensajeInput.value = "";

    // Recargar comentarios desde el inicio
    loadComments(true);
  } catch (err) {
    console.error("Error guardando comentario:", err);
  }
});



btnLogin.addEventListener("click", () => {
  modalLogin.classList.remove("login-hidden");
});

btnConfirmLogin.addEventListener("click", () => {
  if (inputPassword.value === PASSWORD_ADMIN) {
    isAdmin = true;
    modalLogin.classList.add("login-hidden");
    loadComments(true);
  } else {
    alert("Contraseña incorrecta");
  }
});


// 🔹 9️⃣ Cargar los primeros comentarios al iniciar
loadComments();




const audio = document.getElementById("bg-audio");

// Intentar reproducir al cargar la página
window.addEventListener("load", () => {
  audio.play().catch(() => {
    // Si el navegador bloquea, esperamos a la interacción del usuario
    const resumeAudio = () => {
      audio.play();
      // Quitamos el listener una vez que se reproduzca
      window.removeEventListener("click", resumeAudio);
      window.removeEventListener("scroll", resumeAudio);
    };
    window.addEventListener("click", resumeAudio);
    window.addEventListener("scroll", resumeAudio);
  });
});



const toggleBtn = document.getElementById("audio-toggle");

toggleBtn.addEventListener("click", () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});






const carousel = document.getElementById("customCarousel");
  const slides = carousel.querySelectorAll(".cc-slide");
  const track = carousel.querySelector(".cc-slides");
  const prevBtn = carousel.querySelector(".prev");
  const nextBtn = carousel.querySelector(".next");
  const dotsContainer = carousel.querySelector(".cc-dots");

  let index = 0;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.classList.add("cc-dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".cc-dot");

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");
  }

  function goToSlide(i) {
    index = i;
    updateCarousel();
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateCarousel();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
  });

  // Auto slide (opcional)
  setInterval(() => {
    index = (index + 1) % slides.length;
    updateCarousel();
  }, 5000);
