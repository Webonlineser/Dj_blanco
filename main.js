// 🔹 1️⃣ Importaciones desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// 🔹 5️⃣ Escuchar el envío del formulario y guardar en Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const mensaje = mensajeInput.value.trim();

  if (!nombre || !mensaje) {
    alert("Completa todo");
    return;
  }

  try {
    await addDoc(collection(db, "comentarios"), {
      nombre,
      mensaje,
      timestamp: serverTimestamp()
    });

    mensajeInput.value = ""; // limpiar campo
  } catch (error) {
    console.error("Error guardando comentario:", error);
  }
});

// 🔹 6️⃣ Leer comentarios en tiempo real y mostrarlos
const q = query(collection(db, "comentarios"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  listaComentarios.innerHTML = ""; // limpiar lista antes de renderizar

  snapshot.forEach(doc => {
    const c = doc.data();
    const p = document.createElement("p");

    // Nombre en negrita arriba, mensaje debajo, sin dos puntos
    p.innerHTML = `<strong>${c.nombre}</strong><br>${c.mensaje}`;

    listaComentarios.appendChild(p);
  });
});
