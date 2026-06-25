
const bton_newalarma = document.getElementById('caja-alarma');
const contenedor_alarmas = document.getElementById('alarms');
const contenedor_agregar_alarmas = document.getElementById('alarma-mas');

let horaRegistrada = null;
let tarjetaActual = null;

bton_newalarma.addEventListener('click', function() {
    
    // 1. Verificar si ya existe el formulario en el contenedor
    const alarmaExistente = contenedor_agregar_alarmas.querySelector('.time-required');
    
    // 2. Si ya existe, detener la función inmediatamente
    if (alarmaExistente) {
        return; 
    }
    

    const definirAlarma = document.createElement('div');
    definirAlarma.classList.add('time-required');

    definirAlarma.innerHTML = `
    <div>
        <form>
            <input type="time" id="miHora">
            <button id="create" type="button"> Crear </button>
        </form>
    </div>
    `;
    contenedor_agregar_alarmas.appendChild(definirAlarma);
    
    
    const timeInput = document.getElementById('miHora');
    const createAlarm = document.getElementById('create');

    createAlarm.addEventListener('click', function(event) {
        event.preventDefault(); 

        const horaSeleccionada = timeInput.value; 
    
        // Si el usuario no ha seleccionado ninguna hora, no hacer nada
        if (!horaSeleccionada) {
            alert("Por favor, selecciona una hora válida.");
            return;
        }
    
            
        let [horasStr, minutosStr] = horaSeleccionada.split(':');
        let horasNum = parseInt(horasStr, 10);
        
        // Determinar si es AM o PM
        let tipo_hora = horasNum >= 12 ? "PM" : "AM";
        
        // Convertir formato de 24 horas a 12 horas para la tarjeta visual
        let horas12 = horasNum % 12;
        if (horas12 === 0) horas12 = 12; // Las 00:00 se transforman en 12 AM
        
        // Armar el texto final (ej: "2:30" o "12:15")
        let horaFormateada = `${horas12}:${minutosStr}`;

        // Guardamos el formato de 24 horas nativo ("14:30") para el setInterval
        horaRegistrada = horaSeleccionada; 

        // Crear la tarjeta visual con la hora formateada
        const nuevaTarjeta = document.createElement('section');
        nuevaTarjeta.classList.add('box-alarma');
        
        nuevaTarjeta.innerHTML = `
        <article class="alarma" data-hover="Clic para eliminar">
            <figure class="alarma-figure">
                <time datetime="${horaSeleccionada}" class="time">${horaFormateada}</time>
                <span class="AM-PM">${tipo_hora}</span>
            </figure>   
        </article>
        `;

        // EVENTO: Al hacer clic en la tarjeta, se elimina a sí misma de la pantalla
        nuevaTarjeta.addEventListener("click", function() {
            nuevaTarjeta.remove();
            horaRegistrada = null; // Reseteamos la alarma activa
            tarjetaActual = null;
        });

        contenedor_alarmas.appendChild(nuevaTarjeta);
        tarjetaActual = nuevaTarjeta; 
        definirAlarma.remove();
    
    });

});

    
// Bucle para revisar la alarma cada minuto
const revisarAlarma = setInterval(function() {
    // Si el usuario no ha creado ninguna alarma aún, no hace nada
    if (!horaRegistrada) return;

    const ahora = new Date();

    let horas = ahora.getHours();
    let minutos = ahora.getMinutes();

    let horasFormateadas = horas < 10 ? "0" + horas : horas;
    let minutosFormateados = minutos < 10 ? "0" + minutos : minutos;
    let horario = horasFormateadas + ':' + minutosFormateados;

    console.log("Comprobando hora actual:", horario, "Alarma guardada:", horaRegistrada);

    // Comparar la hora del sistema con la variable que almacenamos de forma global
    if (horario === horaRegistrada) {
        alert("¡Ya son las " + horario + "!");
        
        if (tarjetaActual) {
            tarjetaActual.remove(); // Borra la tarjeta de la pantalla de forma segura
        }
            
        horaRegistrada = null; // Reseteamos los valores
        tarjetaActual = null;
    }
}, 60000); // Evalúa cada 1 minuto exacto



// Lógica del temporizador (Mantenida intacta)
let tiempoRestante = 0; 
let tiempoMaximo = 0; 
let intervalo = null;

const sonidoAlarma = new Audio('alarma.m4a');

const displayTimer = document.querySelector(".time-timer");
const contenedorTimer = document.querySelector(".box-timer"); 

const btnMas5 = document.querySelector(".box-timer-add-left");
const btnMas10 = document.querySelector(".box-timer-add-center");
const btnMas15 = document.querySelector(".box-timer-add-right");

const buttonIniciar = document.getElementById('play');
const buttonPausar = document.getElementById('pause');
const buttonDetener = document.getElementById('stop');

function actualizarColor() {
    if (tiempoMaximo === 0) return;
    let porcentaje = (tiempoRestante / tiempoMaximo) * 100;
    contenedorTimer.style.setProperty('--progreso', `${porcentaje}%`);
}

function actualizarPantalla() {
    let minutos = Math.floor(tiempoRestante / 60);
    let segundos = tiempoRestante % 60;
    let segundosFormateados = segundos < 10 ? "0" + segundos : segundos;
    displayTimer.textContent = `${minutos}:${segundosFormateados}`;
    actualizarColor(); 
}

function iniciarContador() {
    if (intervalo !== null) return; 

    intervalo = setInterval(function() {
        if (tiempoRestante > 0) {
            tiempoRestante--; 
            actualizarPantalla();
        } else {
            clearInterval(intervalo);
            intervalo = null;
            sonidoAlarma.play().catch(function(error) {
                console.error("El navegador bloqueó el audio hasta que el usuario interactúe:", error);
            });
            console.error("Proceso terminado: tiempo en cero"); 
            
        }
    }, 1000);
}

function pausarContador() {
    clearInterval(intervalo);
    intervalo = null; 
}

buttonIniciar.addEventListener("click", function() {
    iniciarContador();
});

buttonPausar.addEventListener("click", function() {
    if (intervalo === null) {
        if (tiempoRestante > 0) iniciarContador(); 
    } else {
        pausarContador();
    }
});

buttonDetener.addEventListener("click", function() {
    tiempoRestante = 0;
    actualizarPantalla();
});

btnMas5.addEventListener("click", function() { sumarTiempo(5); });
btnMas10.addEventListener("click", function() { sumarTiempo(10); });
btnMas15.addEventListener("click", function() { sumarTiempo(15); });

function sumarTiempo(segundos) {
    tiempoRestante += segundos;
    if (tiempoRestante > tiempoMaximo) {
        tiempoMaximo = tiempoRestante; 
    }
    actualizarPantalla();
    if (tiempoRestante > 0 && intervalo === null) {
        iniciarContador();
    }
}

if (buttonDetener.addEventListener("click") || buttonPausar.addEventListener("click") || buttonIniciar.addEventListener("click") || btnMas5.addEventListener("click") || btnMas10.addEventListener("click") || btnMas15.addEventListener("click") ) {
    iniciarContador();
    if (tiempoRestante == 0) {
        let utterance = new SpeechSynthesisUtterance("El temporizador a llegado a zero. El tiempo a terminado");
        speechSynthesis.speak(utterance);
    }
}

actualizarPantalla();
iniciarContador();
