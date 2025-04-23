let pilotoDelDia;
let intentoActual = '';
let filaActual = 0;
const MAX_INTENTOS = 6;
const TILE_SIZE = 40;
let longitud;

// Agregar variable para controlar si es primera carga
let primeraVisita = !getSecureItem('yaJugo');

// Modal de instrucciones
const modal = document.getElementById('instructions-modal');
const closeBtn = document.querySelector('.close');
const startBtn = document.getElementById('start-game');
const gameContainer = document.querySelector('.game-container');

// Ocultar el contenido del juego inicialmente y mostrar el modal
gameContainer.style.display = 'none';
modal.classList.add('visible');

// Eventos del modal
closeBtn.addEventListener('click', closeModal);
startBtn.addEventListener('click', closeModal);

// Modificar la función closeModal
function closeModal() {
  modal.classList.remove('visible');
  setTimeout(() => {
    gameContainer.style.display = 'flex';
    setTimeout(() => {
      gameContainer.classList.add('visible');
    }, 50);
    iniciarTableroYJuego();
  }, 500);
}

// Modificar la función iniciarJuego
function iniciarJuego() {
  gameContainer.style.display = 'none';
  gameContainer.classList.remove('visible');
  
  if (!getSecureItem('yaJugo')) {
    modal.classList.add('visible');
    setSecureItem('yaJugo', 'true');
  } else {
    gameContainer.style.display = 'flex';
    setTimeout(() => {
      gameContainer.classList.add('visible');
    }, 50);
    iniciarTableroYJuego();
  }
}

// Nueva función para iniciar el tablero y el juego
function iniciarTableroYJuego() {
  seleccionarPiloto();
  inicializarTablero();
  mostrarPistas();
}

function inicializarTablero() {
  const nombrePiloto = pilotoDelDia.nombre.toUpperCase();
  longitud = nombrePiloto.length;
  
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
}

// Asegurarse de que el tablero se inicialice cuando se selecciona un piloto
function seleccionarPiloto() {
  const randomIndex = Math.floor(Math.random() * pilotos.length);
  const pilotoSeleccionado = pilotos[randomIndex];
  
  if (!validarPiloto(pilotoSeleccionado)) {
    console.error('Piloto inválido detectado');
    location.reload();
    return;
  }
  
  pilotoDelDia = pilotoSeleccionado;
  inicializarTablero();
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

  if (filaIndex === 2) {
    const enterKey = document.createElement("button");
    enterKey.textContent = "ENTER";
    enterKey.classList.add("key", "special");
    enterKey.addEventListener("click", comprobarIntento);
    row.appendChild(enterKey);
  }

  fila.split("").forEach(letra => {
    const key = document.createElement("button");
    key.textContent = letra;
    key.classList.add("key");
    key.setAttribute("data-key", letra);
    key.addEventListener("click", () => manejarInput(letra));
    row.appendChild(key);
  });

  if (filaIndex === 2) {
    const backKey = document.createElement("button");
    backKey.textContent = "←";
    backKey.classList.add("key", "special");
    backKey.addEventListener("click", () => {
      if (intentoActual.length > 0) {
        intentoActual = intentoActual.slice(0, -1);
        actualizarTablero();
      }
    });
    row.appendChild(backKey);
  }

  keyboard.appendChild(row);
});

document.addEventListener('keydown', (event) => {
  if (filaActual >= MAX_INTENTOS) return;
  
  const key = event.key.toUpperCase();
  
  if (key === 'ENTER') {
    comprobarIntento();
  } else if (key === 'BACKSPACE') {
    if (intentoActual.length > 0) {
      intentoActual = intentoActual.slice(0, -1);
      actualizarTablero();
    }
  } else if (/^[A-Z]$/.test(key)) {
    manejarInput(key);
  }
});

// Función para sanitizar el input
function sanitizeInput(str) {
  return str.replace(/[^A-Za-z]/g, '').toUpperCase();
}

// Modificar la función manejarInput
function manejarInput(letra) {
  if (filaActual >= MAX_INTENTOS) return;
  
  // Sanitizar input
  letra = sanitizeInput(letra);
  if (!letra) return;
  
  if (intentoActual.length < longitud) {
    intentoActual += letra;
    actualizarTablero();
  }
}

function actualizarTablero() {
  const startIndex = filaActual * longitud;
  const tiles = document.querySelectorAll('.tile');
  
  for (let i = 0; i < longitud; i++) {
    tiles[startIndex + i].textContent = intentoActual[i] || '';
  }
}

function comprobarIntento() {
  if (intentoActual.length !== longitud) {
    mostrarMensaje("¡El intento debe tener la longitud correcta!");
    return;
  }

  const nombrePiloto = pilotoDelDia.nombre.toUpperCase();
  const startIndex = filaActual * longitud;
  const tiles = document.querySelectorAll('.tile');
  
  // Crear arrays para verificar letras
  const letrasCorrectas = new Array(longitud).fill(false);
  const letrasPresentes = new Array(longitud).fill(false);
  
  // Primer paso: verificar letras correctas
  for (let i = 0; i < longitud; i++) {
    if (intentoActual[i] === nombrePiloto[i]) {
      letrasCorrectas[i] = true;
      tiles[startIndex + i].classList.add('correct');
      document.querySelector(`.key[data-key="${intentoActual[i]}"]`)?.classList.add('correct');
    }
  }
  
  // Segundo paso: verificar letras presentes
  for (let i = 0; i < longitud; i++) {
    if (!letrasCorrectas[i]) {
      const letra = intentoActual[i];
      let encontrada = false;
      
      for (let j = 0; j < longitud; j++) {
        if (!letrasCorrectas[j] && !letrasPresentes[j] && letra === nombrePiloto[j]) {
          letrasPresentes[j] = true;
          encontrada = true;
          tiles[startIndex + i].classList.add('present');
          document.querySelector(`.key[data-key="${letra}"]`)?.classList.add('present');
          break;
        }
      }
      
      if (!encontrada) {
        tiles[startIndex + i].classList.add('absent');
        document.querySelector(`.key[data-key="${letra}"]`)?.classList.add('absent');
      }
    }
  }
  
  if (intentoActual === nombrePiloto) {
    mostrarMensaje("¡Felicitaciones! ¡Has ganado!");
    desactivarTeclado();
    setTimeout(() => {
      reiniciarJuego();
    }, 2000);
    return;
  }
  
  if (filaActual === MAX_INTENTOS - 1) {
    mostrarMensaje(`¡Juego terminado! El piloto era ${nombrePiloto}`);
    desactivarTeclado();
    setTimeout(() => {
      reiniciarJuego();
    }, 2000);
    return;
  }
  
  filaActual++;
  intentoActual = '';
}

function mostrarMensaje(texto) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = texto;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 3000);
}

function desactivarTeclado() {
  const teclas = document.querySelectorAll('.key');
  teclas.forEach(tecla => {
    tecla.disabled = true;
  });
}

// Agregar protección contra manipulación de las pistas
function mostrarPistas() {
  if (!validarPiloto(pilotoDelDia)) {
    console.error('Datos de piloto manipulados');
    location.reload();
    return;
  }

  const pistas = document.getElementById("pistas");
  pistas.innerHTML = `
    <p><strong>Nacionalidad:</strong> ${escapeHTML(pilotoDelDia.nacionalidad)}</p>
    <p><strong>Equipo:</strong> ${escapeHTML(pilotoDelDia.equipo)}</p>
    <p><strong>Debut:</strong> ${escapeHTML(pilotoDelDia.debut)}</p>
    <p><strong>Casco:</strong> ${escapeHTML(pilotoDelDia.casco)}</p>
  `;
}

// Modificar la función reiniciarJuego
function reiniciarJuego() {
  // Animación de salida
  gameContainer.classList.remove('visible');
  
  setTimeout(() => {
    // Limpiar el tablero
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
      tile.textContent = '';
      tile.className = 'tile';
    });

    // Reiniciar las teclas
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
      key.className = 'key';
      key.disabled = false;
    });

    // Reiniciar variables
    intentoActual = '';
    filaActual = 0;

    // Seleccionar nuevo piloto y mostrar pistas
    seleccionarPiloto();
    inicializarTablero();
    mostrarPistas();

    // Animación de entrada
    setTimeout(() => {
      gameContainer.classList.add('visible');
    }, 50);
  }, 500);
}

// Agregar protección contra manipulación del localStorage
function setSecureItem(key, value) {
  try {
    const timestamp = new Date().getTime();
    const data = {
      value: value,
      timestamp: timestamp
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error al guardar en localStorage:', e);
  }
}

function getSecureItem(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    if (!data) return null;
    
    // Verificar si han pasado más de 24 horas
    const now = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    
    if (now - data.timestamp > hours24) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.value;
  } catch (e) {
    console.error('Error al leer localStorage:', e);
    return null;
  }
}

// Agregar protección contra manipulación del piloto seleccionado
function validarPiloto(piloto) {
  return piloto && 
         typeof piloto === 'object' && 
         typeof piloto.nombre === 'string' &&
         typeof piloto.nacionalidad === 'string' &&
         typeof piloto.equipo === 'string' &&
         typeof piloto.debut === 'string' &&
         typeof piloto.casco === 'string';
}

// Función para escapar HTML y prevenir XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Iniciar el juego cuando cargue la página
window.onload = iniciarJuego;
