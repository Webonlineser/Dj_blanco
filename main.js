document.addEventListener("DOMContentLoaded", () => {

  const elementos = document.querySelectorAll(".scroll-anim");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }

    });
  }, {
    threshold: 0.15
  });

  elementos.forEach(el => observer.observe(el));

});


// 🔹 1️⃣ Importaciones desde CDN
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, getDocs, startAfter, limit,
  deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔹 2️⃣ Configuración Firebase
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
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

getAnalytics(app);
const db = getFirestore(app);

// 🔹 4️⃣ DOM
const form = document.querySelector(".comments-form");
const nombreInput = form.querySelector("input[type=text]");
const mensajeInput = form.querySelector("textarea");
const listaComentarios = document.querySelector(".comments-list");

const btnVerMas = document.getElementById("btn-ver-mas");
const btnVerMenos = document.getElementById("btn-ver-menos");

const audio = document.getElementById("bg-audio");

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

// 🔥 RESPONDER
async function responderComentario(id, mensaje) {
  await addDoc(collection(db, "comentarios", id, "respuestas"), {
    nombre: "Dj Blanco",
    mensaje,
    timestamp: serverTimestamp()
  });
}

// 🔹 Render comentario
function renderComment(docSnap) {

  const c = docSnap.data();
  const cont = document.createElement("div");
  cont.classList.add("comment");

  let fecha = c.timestamp?.seconds
    ? new Date(c.timestamp.seconds * 1000).toLocaleString()
    : "Sin fecha";

  const nombre = document.createElement("strong");
  nombre.textContent = c.nombre;

  const fechaEl = document.createElement("small");
  fechaEl.textContent = fecha;

  const mensaje = document.createElement("p");
  mensaje.textContent = c.mensaje;

  cont.append(nombre, fechaEl, mensaje);

  // ❌ borrar comentario
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

  // 💬 responder
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

  // 📥 RESPUESTAS
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

      const delR = document.createElement("span");
      delR.textContent = "✖";
      delR.classList.add("delete-reply");

      // 🔥 SOLO ADMIN
      if (isAdmin) {
        delR.style.display = "inline-block";

        delR.addEventListener("click", async () => {
          if (confirm("¿Borrar respuesta?")) {
            await deleteDoc(doc(db, "comentarios", docSnap.id, "respuestas", d.id));
            loadComments(true);
          }
        });

        div.appendChild(delR);
      }

      respuestasBox.appendChild(div);
    });
  }

  cargarRespuestas();
  listaComentarios.appendChild(cont);
  observerComments.observe(cont);
  
setTimeout(() => {
  cont.classList.add("show");
}, 10);
}

// 🔹 Cargar comentarios
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

  if (lastVisible) {
    const nextQuery = query(
      collection(db, "comentarios"),
      orderBy("timestamp", "desc"),
      startAfter(lastVisible),
      limit(1)
    );

    const nextSnap = await getDocs(nextQuery);

    if (nextSnap.empty) {
      btnVerMas.style.display = "none";
    } else {
      btnVerMas.style.display = "inline-block";
    }
  }

  loading = false;
}

// 🔹 BOTONES
btnVerMas.addEventListener("click", async () => {
  await loadComments(false);
  btnVerMenos.style.display = "inline-block";
});

btnVerMenos.addEventListener("click", async () => {
  await loadComments(true);
  btnVerMenos.style.display = "none";
});

// 🔹 Enviar comentario
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

  form.reset();
  loadComments(true);
});

// 🔹 Login admin
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

// 🔹 Init
loadComments();

// 🔊 Audio toggle
document.getElementById("audio-toggle").addEventListener("click", () => {
  audio.paused ? audio.play() : audio.pause();
});

// 🎬 VIDEO + AUDIO
const videos = document.querySelectorAll(".video");
let unlocked = false;

const unlockOnScroll = () => {
  unlocked = true;

  videos.forEach(video => {
    if (!video.paused) {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }
  });

  window.removeEventListener("scroll", unlockOnScroll);
};

window.addEventListener("scroll", unlockOnScroll, { once: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;

    if (entry.intersectionRatio >= 0.5 && video.paused) {
      video.muted = !unlocked;

      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    }
  });
}, { threshold: 0.5 });

videos.forEach(video => {
  observer.observe(video);

  video.addEventListener("ended", () => {
    if (!unlocked) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  video.addEventListener("click", () => {
    video.muted = false;
    video.play();
  });
});

// 🔍 DEBUG
async function debugComentarios() {
  const snap = await getDocs(collection(db, "comentarios"));

  console.log("TOTAL EN DB:", snap.size);

  snap.forEach(doc => {
    const data = doc.data();

    if (!data.timestamp) {
      console.log("❌ SIN TIMESTAMP:", doc.id, data);
    }
  });
}

debugComentarios();


const observerComments = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observerComments.unobserve(entry.target); // opcional (solo anima una vez)
    }
  });
}, {
  threshold: 0.2
});


const slides = document.querySelectorAll(".cc-slide");
let index = 0;

function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

// autoplay
setInterval(() => {
  index++;
  if (index >= slides.length) index = 0;
  showSlide(index);
}, 4000);

