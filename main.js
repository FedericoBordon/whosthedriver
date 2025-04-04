let pilotoDelDia;
let intentoActual = '';
let filaActual = 0;
const MAX_INTENTOS = 6;
const TILE_SIZE = 40;

function seleccionarPiloto() {
  const randomIndex = Math.floor(Math.random() * pilotos.length);
  pilotoDelDia = pilotos[randomIndex];
}

seleccionarPiloto();
const nombrePiloto = pilotoDelDia.nombre.toUpperCase();
const longitud = nombrePiloto.length;


const board = document.getElementById("board");
board.style.gridTemplateColumns = `repeat(${longitud}, 1fr)`;
board.innerHTML = ''; 


const maxBoardWidth = Math.min(400, longitud * TILE_SIZE + (longitud - 1) * 4);
board.style.maxWidth = `${maxBoardWidth}px`;

for (let i = 0; i < MAX_INTENTOS * longitud; i++) {
  const tile = document.createElement("div");
  tile.classList.add("tile");
  board.appendChild(tile);
}


const keyboard = document.getElementById("keyboard");
const letras = [
  "QWERTYUIOP",
  "ASDFGHJKL",
  "ZXCVBNM"
];


letras.forEach((fila, filaIndex) => {
  const row = document.createElement("div");
  row.classList.add("keyboard-row");
  

  if (filaIndex === 0) {
    fila.split("").forEach(letra => {
      const key = document.createElement("button");
      key.textContent = letra;
      key.classList.add("key");
      key.addEventListener("click", () => manejarInput(letra));
      row.appendChild(key);
    });
  }
  
  else if (filaIndex === 1) {
    fila.split("").forEach(letra => {
      const key = document.createElement("button");
      key.textContent = letra;
      key.classList.add("key");
      key.addEventListener("click", () => manejarInput(letra));
      row.appendChild(key);
    });
  }
  
  else if (filaIndex === 2) {
    const enter = document.createElement("button");
    enter.textContent = "ENTER";
    enter.classList.add("key", "special");
    enter.addEventListener("click", comprobarIntento);
    row.appendChild(enter);
    
    fila.split("").forEach(letra => {
      const key = document.createElement("button");
      key.textContent = letra;
      key.classList.add("key");
      key.addEventListener("click", () => manejarInput(letra));
      row.appendChild(key);
    });
    
    const del = document.createElement("button");
    del.textContent = "DEL";
    del.classList.add("key", "special");
    del.addEventListener("click", () => {
      intentoActual = intentoActual.slice(0, -1);
      actualizarTablero();
    });
    row.appendChild(del);
  }

  keyboard.appendChild(row);
});

document.addEventListener('keydown', (event) => {
  if (filaActual >= MAX_INTENTOS) return;
  
  const key = event.key.toUpperCase();
  

  if (key === 'ENTER') {
    comprobarIntento();
  }
  else if (key === 'BACKSPACE') {
    intentoActual = intentoActual.slice(0, -1);
    actualizarTablero();
  }
  else if (/^[A-Z]$/.test(key)) {
    manejarInput(key);
  }
});

function manejarInput(letra) {
  if (intentoActual.length < longitud) {
    intentoActual += letra;
    actualizarTablero();
  }
}

function actualizarTablero() {
  const startIndex = filaActual * longitud;
  for (let i = 0; i < longitud; i++) {
    const tile = board.children[startIndex + i];
    tile.textContent = intentoActual[i] || "";
  }
}

function comprobarIntento() {
  if (intentoActual.length !== longitud) return;

  const startIndex = filaActual * longitud;
  const letrasPiloto = nombrePiloto.split("");
  const letrasIntento = intentoActual.split("");

  letrasIntento.forEach((letra, i) => {
    const tile = board.children[startIndex + i];
    const key = [...keyboard.children].find(k => k.textContent === letra);
    if (letra === letrasPiloto[i]) {
      tile.classList.add("correct");
      key?.classList.add("correct");
    } else if (letrasPiloto.includes(letra)) {
      tile.classList.add("present");
      key?.classList.add("present");
    } else {
      tile.classList.add("absent");
      key?.classList.add("absent");
    }
  });

  if (intentoActual === nombrePiloto) {
    mostrarMensaje("🏆 ¡Correcto! El piloto era " + nombrePiloto);
    desactivarTeclado();
    return;
  }

  filaActual++;
  intentoActual = "";

  if (filaActual >= MAX_INTENTOS) {
    mostrarMensaje("❌ Te quedaste sin intentos. Era " + nombrePiloto);
    desactivarTeclado();
  }

  mostrarPistas();
}

function mostrarMensaje(texto) {
  const msg = document.getElementById("message");
  msg.textContent = texto;
}

function desactivarTeclado() {
  const keys = document.querySelectorAll(".key");
  keys.forEach(k => k.disabled = true);
}

function mostrarPistas() {
  const pistas = document.getElementById("pistas");
  pistas.innerHTML = `
    <p><strong>🇫🇷 Nacionalidad:</strong> ${pilotoDelDia.nacionalidad}</p>
    <p><strong>🏎️ Equipo:</strong> ${pilotoDelDia.equipo}</p>
    <p><strong>📅 Debut:</strong> ${pilotoDelDia.debut}</p>
    <p><strong>🎨 Casco:</strong> ${pilotoDelDia.casco}</p>
  `;
}
