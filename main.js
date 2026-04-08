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

// 🔹 3️⃣ Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🔹 4️⃣ DOM
const form = document.querySelector(".comments-form");
const nombreInput = form.querySelector("input[type=text]");
const mensajeInput = form.querySelector("textarea");
const listaComentarios = document.querySelector(".comments-list");

const PASSWORD_ADMIN = "Luna07022022";
let isAdmin = false;

const btnLogin = document.getElementById("btn-login");
const modalLogin = document.getElementById("login-modal");
const inputPassword = document.getElementById("login-password");
const btnConfirmLogin = document.getElementById("login-confirm");

// 🔹 5️⃣ Paginación
let lastVisible = null;
const pageSize = 10;
let loading = false;

// 🔥 RESPONDER (SIEMPRE Dj Blanco)
async function responderComentario(id, mensaje) {
  await addDoc(collection(db, "comentarios", id, "respuestas"), {
    nombre: "Dj Blanco",
    mensaje,
    timestamp: serverTimestamp()
  });
}

// 🔹 6️⃣ Render comentario
function renderComment(docSnap) {

  const c = docSnap.data();
  const cont = document.createElement("div");
  cont.classList.add("comment");

  // 🗓️ Fecha
  let fecha = "Sin fecha";
  if (c.timestamp?.seconds) {
    fecha = new Date(c.timestamp.seconds * 1000).toLocaleString();
  }

  const nombre = document.createElement("strong");
  nombre.textContent = c.nombre;

  const fechaEl = document.createElement("small");
  fechaEl.textContent = fecha;

  const mensaje = document.createElement("p");
  mensaje.textContent = c.mensaje;

  cont.append(nombre, fechaEl, mensaje);

  // =========================
  // ❌ BORRAR COMENTARIO
  // =========================
  const del = document.createElement("span");
  del.textContent = "✖";
  del.classList.add("delete-comment");

  del.style.display = isAdmin ? "inline-block" : "none";

  del.addEventListener("click", async () => {
    if (!isAdmin) return;

    if (confirm("¿Borrar comentario?")) {
      await deleteDoc(doc(db, "comentarios", docSnap.id));
      loadComments(true);
    }
  });

  cont.appendChild(del);

  // =========================
  // 💬 RESPONDER
  // =========================
  const btnReply = document.createElement("button");
  btnReply.textContent = "Responder";
  btnReply.style.display = isAdmin ? "inline-block" : "none";

  cont.appendChild(btnReply);

  const replyForm = document.createElement("div");
  replyForm.style.display = "none";

  replyForm.innerHTML = `
    <textarea placeholder="Respuesta"></textarea>
    <button>Enviar</button>
  `;

  cont.appendChild(replyForm);

  btnReply.addEventListener("click", () => {
    replyForm.style.display =
      replyForm.style.display === "none" ? "block" : "none";
  });

  replyForm.querySelector("button").addEventListener("click", async () => {
    const m = replyForm.querySelector("textarea").value.trim();
    if (!m) return alert("Escribí algo");

    await responderComentario(docSnap.id, m);
    loadComments(true);
  });

  // =========================
  // 📥 RESPUESTAS
  // =========================
  const respuestasBox = document.createElement("div");
  respuestasBox.classList.add("respuestas");
  cont.appendChild(respuestasBox);

  async function cargarRespuestas() {
    const q = query(
      collection(db, "comentarios", docSnap.id, "respuestas"),
      orderBy("timestamp", "asc")
    );

    const snap = await getDocs(q);

    snap.forEach(d => {
      const r = d.data();

      const div = document.createElement("div");
      div.classList.add("respuesta");

      div.innerHTML = `
        <strong>${r.nombre}</strong>
        <p>${r.mensaje}</p>
      `;

      // ❌ BORRAR RESPUESTA (CLASE NUEVA)
      const delR = document.createElement("span");
      delR.textContent = "✖";
      delR.classList.add("delete-reply");

      delR.style.display = isAdmin ? "inline-block" : "none";

      delR.addEventListener("click", async () => {
        if (!isAdmin) return;

        if (confirm("¿Borrar respuesta?")) {
          await deleteDoc(doc(db, "comentarios", docSnap.id, "respuestas", d.id));
          loadComments(true);
        }
      });

      div.appendChild(delR);

      respuestasBox.appendChild(div);
    });
  }

  cargarRespuestas();

  listaComentarios.appendChild(cont);
}

// 🔹 7️⃣ Cargar comentarios
async function loadComments(reset = false) {
  if (loading) return;
  loading = true;

  if (reset) {
    listaComentarios.innerHTML = "";
    lastVisible = null;
  }

  let q = lastVisible
    ? query(
        collection(db, "comentarios"),
        orderBy("timestamp", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      )
    : query(
        collection(db, "comentarios"),
        orderBy("timestamp", "desc"),
        limit(pageSize)
      );

  const snapshot = await getDocs(q);

  snapshot.forEach(doc => renderComment(doc));

  if (snapshot.docs.length > 0) {
    lastVisible = snapshot.docs[snapshot.docs.length - 1];
  }

  // =========================
  // 🔘 BOTÓN VER MÁS
  // =========================
  let btn = document.getElementById("ver-mas-btn");

  if (snapshot.docs.length === pageSize) {
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "ver-mas-btn";
      btn.textContent = "Ver más comentarios";
      btn.style.marginTop = "15px";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", () => loadComments());

      listaComentarios.parentElement.appendChild(btn);
    }
  } else {
    if (btn) btn.remove();
  }

  loading = false;
}




// 🔹 8️⃣ Enviar comentario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const mensaje = mensajeInput.value.trim();

  if (!nombre || !mensaje) return alert("Completa todo");

  await addDoc(collection(db, "comentarios"), {
    nombre,
    mensaje,
    timestamp: serverTimestamp()
  });

  nombreInput.value = "";
  mensajeInput.value = "";

  loadComments(true);
});

// 🔹 9️⃣ Login admin
btnLogin.addEventListener("click", () => {
  modalLogin.classList.remove("login-hidden");
});

btnConfirmLogin.addEventListener("click", () => {
  if (inputPassword.value === PASSWORD_ADMIN) {

    isAdmin = true;

    modalLogin.classList.add("login-hidden");

    // 🔥 reset total
    listaComentarios.innerHTML = "";
    lastVisible = null;

    setTimeout(() => {
      loadComments(true);
    }, 50);

  } else {
    alert("Contraseña incorrecta");
  }
});

// 🔹 🔟 Init
loadComments();

// 🔊 AUDIO
const audio = document.getElementById("bg-audio");

window.addEventListener("load", () => {
  audio.play().catch(() => {
    const resume = () => {
      audio.play();
      window.removeEventListener("click", resume);
    };
    window.addEventListener("click", resume);
  });
});

document.getElementById("audio-toggle").addEventListener("click", () => {
  audio.paused ? audio.play() : audio.pause();
});

// 🎠 CAROUSEL
const carousel = document.getElementById("customCarousel");
if (carousel) {
  const slides = carousel.querySelectorAll(".cc-slide");
  const track = carousel.querySelector(".cc-slides");
  const prev = carousel.querySelector(".prev");
  const next = carousel.querySelector(".next");

  let i = 0;

  function update() {
    track.style.transform = `translateX(-${i * 100}%)`;
  }

  next.onclick = () => { i = (i+1)%slides.length; update(); };
  prev.onclick = () => { i = (i-1+slides.length)%slides.length; update(); };

  setInterval(() => { i = (i+1)%slides.length; update(); }, 5000);
}



const videos = document.querySelectorAll(".video");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;

    if (entry.intersectionRatio >= 0.5) {
      video.muted = true; // 🔥 asegurar autoplay
      video.play().catch(err => {
        console.log("Autoplay bloqueado:", err);
      });
    } else {
      video.pause();
    }
  });
}, {
  threshold: 0.5
});

videos.forEach(video => {
  observer.observe(video);
});