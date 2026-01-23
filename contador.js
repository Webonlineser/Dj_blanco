// 🔹 1️⃣ Importaciones desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// 🔹 4️⃣ Referencia al documento de visitas
const visitasRef = doc(db, "contador", "visitas");
const visitasSpan = document.getElementById("total-visitas");

// 🔹 5️⃣ Contador por scroll
let scrollContado = false;

window.addEventListener("scroll", async () => {
  if (scrollContado) return;

  // cuando el usuario llegue al 50% de la página
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight * 0.5) {
    scrollContado = true;

    try {
      await setDoc(visitasRef, { total: increment(1) }, { merge: true });
    } catch (err) {
      console.error("Error actualizando contador:", err);
    }
  }
});

// 🔹 6️⃣ Mostrar el contador en tiempo real
onSnapshot(visitasRef, (docSnap) => {
  if (docSnap.exists()) {
    visitasSpan.textContent = docSnap.data().total.toLocaleString();
  }
});