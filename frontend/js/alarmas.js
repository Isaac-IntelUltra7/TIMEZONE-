
// Agregar alarma (disponible despues)
const bton_newalarma = document.getElementById("alarma-mas");
const contenedor_alarmas = document.getElementById("alarms");

bton_newalarma.addEventListener("click", function() {
    let hora = prompt("Escribe la hora de la alarma en formato de hora militar, ejemplo --> 14:30");
    if (!hora) return; // Se devuelve si el user no escribe nada

    let array = Array.from(hora);
    if (array[0] > 2 || array[1] > 4) {
        alert("Proceso fallido: formato no válido");
        return;
    } 
    if (array[2] !== ':') {
        alert("Proceso fallido: formato no válido");
        return;
    }

    let tipo_hora = ((array[0] == 1 && array[1] <= 2) || (array[0] == 0 && array[1] >= 0))? "AM": "PM";

    if (array[1] > 2 && array[0] <= 1 && array[0] < 6) {
        array[1] = ("1" + array[1]) - 12; 
        array[0] = 0;
    } 
    if (array[3] == 6) {
        array[1] = parseInt(array[1], 10) + 1;
        array[3] = 0;
    } 

    hora = array.join("");

    const nuevaTarjeta = document.createElement('section');
    nuevaTarjeta.classList.add('box-alarma');

    nuevaTarjeta.innerHTML = `
    <article class="alarma" data-hover="Clic para eliminar">
        <figure class="alarma-figure">
            <time datetime=${hora} class="time">${hora}</time>
            <span class="AM-PM">${tipo_hora}</span>
        </figure>
    </article>
    `;

    // EVENTO: Al hacer clic en la tarjeta, se elimina a sí misma de la pantalla
    nuevaTarjeta.addEventListener("click", function() {
        nuevaTarjeta.remove();
    });

    contenedor_alarmas.appendChild(nuevaTarjeta);

    
// Guardamos la alarma en una función para que se revise sola cada minuto
const revisarAlarma = setInterval(function() {

    // Crear un objeto de fecha con la hora exacta del sistema actual
    const ahora = new Date();

    // Extraer la hora y los minutos por separado
    let horas = ahora.getHours();
    let minutos = ahora.getMinutes();

    // Formatear para que siempre tengan dos dígitos (ej: si son las 4:05, muestre "04:05")
    let horasFormateadas = horas < 10 ? "0" + horas : horas;
    let minutosFormateados = minutos < 10 ? "0" + minutos : minutos;
    let horario = horasFormateadas + ':' + minutosFormateados;

    console.log(horario);

    if (horario == hora) {
        alert("Ya son las " + horario);
        nuevaTarjeta.remove();
        console.log("Comprobando hora del sistema:", horario);
    }

    // Comparar la hora del sistema con la variable 'hora' que ingresó el user
    if (horario === hora) {
        alert("Ya son las " + horario);
        nuevaTarjeta.remove(); // Borra la tarjeta de la pantalla
            
        clearInterval(revisarAlarma); // Detiene este bucle para que no siga gastando memoria
    }
}, 60000); // 60000 ms = 1 minuto exacto

});






// Lógica del temporizador
// Variables para controlar el tiempo y el reloj
let tiempoRestante = 47; 
let tiempoMaximo = 47; // Guarda el total para calcular el porcentaje
let intervalo = null;

// Cargar el archivo de sonido de la alarma
const sonidoAlarma = new Audio('alarma.m4a');

// Elementos del HTML relacionados
const displayTimer = document.querySelector(".time-timer");
const contenedorTimer = document.querySelector(".box-timer"); 

const btnMas5 = document.querySelector(".box-timer-add-left");
const btnMas10 = document.querySelector(".box-timer-add-center");
const btnMas15 = document.querySelector(".box-timer-add-right");

// Cambiar el color de la caja según el porcentaje que queda
function actualizarColor() {
    if (tiempoMaximo === 0) return;
    
    // Saca el porcentaje de 0 a 100
    let porcentaje = (tiempoRestante / tiempoMaximo) * 100;
    
    // Inyecta el porcentaje directamente en el CSS
    contenedorTimer.style.setProperty('--progreso', `${porcentaje}%`);
}

// Cambiar el tiempo en pantalla al formato correcto M:SS
function actualizarPantalla() {
    let minutos = Math.floor(tiempoRestante / 60);
    let segundos = tiempoRestante % 60;

    let segundosFormateados = segundos < 10 ? "0" + segundos : segundos;
    displayTimer.textContent = `${minutos}:${segundosFormateados}`;
    
    // Llama al cambio de color cada vez que se actualiza el tiempo
    actualizarColor(); 
}

// Iniciar el bucle de la cuenta regresiva
function iniciarContador() {
    if (intervalo !== null) return; 

    intervalo = setInterval(function() {
        if (tiempoRestante > 0) {
            tiempoRestante--; 
            actualizarPantalla();
        } else {
            clearInterval(intervalo);
            intervalo = null;
            // Proceso terminado: reproducir sonido de alarma
            sonidoAlarma.play().catch(function(error) {
                console.error("El navegador bloqueó el audio hasta que el user interactúe:", error);
            });
            
            console.error("Proceso terminado: tiempo en cero"); 
        }
    }, 1000);
}

// Pausar el proceso sin borrar el tiempo acumulado
function pausarContador() {
    clearInterval(intervalo);
    intervalo = null; 
}

// Controlar el inicio o pausa al dar click en la caja gris
contenedorTimer.addEventListener("click", function() {
    if (intervalo === null) {
        if (tiempoRestante > 0) iniciarContador(); 
    } else {
        pausarContador();
    }
});

// Sumar segundos según el botón que toque el user
btnMas5.addEventListener("click", function() {
    sumarTiempo(5);
});

btnMas10.addEventListener("click", function() {
    sumarTiempo(10);
});

btnMas15.addEventListener("click", function() {
    sumarTiempo(15);
});

// Sumar el tiempo y actualizar de una vez
function sumarTiempo(segundos) {
    tiempoRestante += segundos;
    
    // Si meten más tiempo, el tope máximo aumenta para recalcular bien el color
    if (tiempoRestante > tiempoMaximo) {
        tiempoMaximo = tiempoRestante; 
    }
    
    actualizarPantalla();
    
    if (tiempoRestante > 0 && intervalo === null) {
        iniciarContador();
    }
}

// Inicializar el temporizador al cargar la web
actualizarPantalla();
iniciarContador();
