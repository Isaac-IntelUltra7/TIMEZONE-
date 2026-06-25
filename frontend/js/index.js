
// 1. Declaramos la variable global donde se guardará todo el diccionario
let diccionarioCiudades = {};

function formatearComoJson(str) {
    if (typeof str !== "string") return "";
    
    return str
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // 1. Quita acentos (Juárez -> Juarez)
        .toLowerCase()                   // 2. Pasa todo a minúsculas temporalmente
        .replace(/\b\w/g, l => l.toUpperCase()); // 3. Pone en mayúscula la primera letra de cada palabra
}


function buscarZonaHoraria(nombreCiudad) {
    // Limpiamos el texto que escribió el usuario (ej: "BogóTÁ" -> "Bogota")
    let clave = nombreCiudad.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    clave = formatearComoJson(clave);
    
    // Buscamos la zona horaria directamente en el JSON cargado
    const zonaIANA = diccionarioCiudades[clave];
    
    // Si el pueblo o ciudad no está en el JSON, usamos la hora local como respaldo
    if (!zonaIANA) {
        console.warn(`La ciudad "${clave}" no se encontró. Usando respaldo.`);
        return "America/Bogota";
    }

    return zonaIANA;
}

// 1. Creamos una función reutilizable que determina si es AM o PM para cualquier zona
function obtenerPeriodoAMPM(zonaIANA) {
    const opciones = {
        timeZone: (!zonaIANA || zonaIANA === "Local") ? undefined : zonaIANA,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    };
    
    // Forzamos el formateador para extraer el texto
    const horaTexto = new Intl.DateTimeFormat('es-ES', opciones).format(new Date());
    const coincidenciaNumeros = horaTexto.match(/\d{2}:\d{2}:\d{2}/);
    if (!coincidenciaNumeros) return new Date().getHours() >= 12 ? 'PM' : 'AM';

    let marcador = horaTexto.replace(coincidenciaNumeros[0], '').trim().toUpperCase();
    marcador = marcador.replace(/\./g, '').replace(/\s/g, ''); 
    
    if (!marcador) {
        marcador = new Date().getHours() >= 12 ? 'PM' : 'AM';
    }
    
    // Normalizamos el retorno para que sea más fácil comparar ('AM' o 'PM')
    return marcador.includes('A') ? 'AM' : 'PM';
}


function actualizarRelojes() {
    const todosLosRelojes = document.querySelectorAll('.reloj-tiempo');

    todosLosRelojes.forEach(reloj => {
        const zona = reloj.getAttribute('data-timezone');
        
        // Configuramos las opciones asegurando siempre el uso de AM/PM
        const opcionesFormato = {
            timeZone: (!zona || zona === "Local") ? undefined : zona,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        };

        // Forzamos el formateador internacional para todas las tarjetas por igual
        const formateador = new Intl.DateTimeFormat('es-ES', opcionesFormato);
        const horaTexto = formateador.format(new Date());

        // --- EXTRACCIÓN SEGURA POR PARTES (NUEVA LOGIC) ---
        // Expresión regular que extrae limpiamente solo los dígitos de la hora: MINUTO:SEGUNDO
        const coincidenciaNumeros = horaTexto.match(/\d{2}:\d{2}:\d{2}/);
        if (!coincidenciaNumeros) return;

        const [horas, minutos, segundos] = coincidenciaNumeros[0].split(':');

        // Extraemos el texto de AM / PM eliminando los números y limpiando espacios
        let marcadorAMPM = horaTexto.replace(coincidenciaNumeros[0], '').trim().toUpperCase();
        marcadorAMPM = marcadorAMPM.replace(/\./g, '').replace(/\s/g, ''); 
        
        // Si por alguna razón el marcador queda vacío, le damos un valor por defecto seguro
        if (!marcadorAMPM) marcadorAMPM = new Date().getHours() >= 12 ? 'P. M.' : 'A. M.';

        // Inyectamos el diseño idéntico en todas las tarjetas
        reloj.innerHTML = `${horas}:${minutos}<span class="segundos-pequeños">:${segundos}</span> <span class="ampm-pequeño">${marcadorAMPM}</span>`;
        reloj.setAttribute('datetime', horaTexto);
    });
}

// OBLIGATORIO: Ejecuta la función cada 1 segundo (1000 milisegundos) de forma infinita
setInterval(actualizarRelojes, 1000);

// También la ejecutamos una vez al cargar la página para pintar las tarjetas del inicio
actualizarRelojes();


const claveOculta = "cTNSZWJKby0zTVVPLUlWdHd4UDIzOEI0bWZsWmV3dUc2VHpxM2V1T21Taw=="
const endPoint = 'https://api.unsplash.com/search/photos';
const input = document.getElementById('searchCity');
const iconBuscar = document.getElementById('buscar');
const contenedor = document.getElementById('cities-segmento1');
const contenedor_result = document.getElementById('cities-resultado');
const btonVolver = document.getElementById('volver');
const reloj = document.getElementsByClassName("reloj-tiempo");

let errorTarjeta = null;
let crearTarjeta = null;
let alarmasCreadasEsteMes = 0; 
const LIMITE_ALARMAS = 40; // Dejamos un margen de seguridad de 10 tokens
let bindeandoPeticion = false; // Evita clics dobles seguidos

iconBuscar.addEventListener('click', async function() {
    
    try {
        const respuesta = await fetch('assets/resultado_zonas.json');
        diccionarioCiudades = await respuesta.json();
        console.log("Diccionario de ciudades cargado con éxito.");
    } catch (error) {
        console.error("No se pudo cargar el archivo ciudades.json:", error);
    }


    // Protección A: Evita que hagan click rápido mientras una petición está en curso
    if (bindeandoPeticion) return;

    // Protección B: Valida si ya alcanzó el límite de la hora
    if (alarmasCreadasEsteMes >= LIMITE_ALARMAS) {
        alert("Has alcanzado el límite de búsquedas permitidas por esta hora. Inténtalo más tarde.");
        return;
    }

    // Captura el valor actual del input justo al hacer clic
    const query = input.value.trim(); 
    const zonaIANA = buscarZonaHoraria(query); // Respaldo si no existe en el JSON
    
    if (query == '') {
        if (errorTarjeta) errorTarjeta.remove(); // Limpia errores previos si existían

        contenedor.style.display = 'none';   // Oculta las tarjetas del inicio
        contenedor_result.style.display = 'grid';   // Muestra la nueva tarjeta buscada
        btonVolver.style.display = 'block';


        errorTarjeta = document.createElement('div');
        errorTarjeta.classList.add('errorMessage');
        errorTarjeta.innerHTML = `
        <h1 style="background: white; color: red; font-size: 50px; font-family: Tahoma; box-shadow: 0px 0px 500px red; padding: 20px; width: 500px">Por favor, escribe algo para buscar</h1>
        `;
        contenedor_result.appendChild(errorTarjeta);
        return;
    }

     if (errorTarjeta) {
        errorTarjeta.remove();
        errorTarjeta = null;
    }

    try {
        actualizarRelojes();    

        bindeandoPeticion = true; // Bloquea nuevos clics inmediatamente

        contenedor.style.display = 'none';   // Oculta las tarjetas del inicio
        contenedor_result.style.display = 'grid';   // Muestra la nueva tarjeta buscada
        btonVolver.style.display = 'block';

        // Construcción limpia de la URL de petición
        const apiKey = atob(claveOculta);
        const url = `${endPoint}?page=1&per_page=1&query=${query}&orientation=landscape&client_id=${apiKey}`;
        const response = await fetch(url);
        const jsonResponse = await response.json();
        const imagesList = jsonResponse.results; 

        alarmasCreadasEsteMes++;

        // Si ya existía una tarjeta de una búsqueda anterior, la borramos para que no se dupliquen
        if (crearTarjeta) crearTarjeta.remove();


        crearTarjeta = document.createElement('article');
        crearTarjeta.classList.add('tarjeta-reloj');

        crearTarjeta.innerHTML = `
        <header class="tarjeta-encabezado">
            <h2>${query}</h2>
            <time class="reloj-tiempo" data-timezone="${zonaIANA}" datetime="${zonaIANA}"></time>
        </header>
        <figure class="tarjeta-imagen">
            <img src="${imagesList[0].urls.small}" alt="Vista panorámica de ${query}">
        </figure>
        `;
        contenedor_result.appendChild(crearTarjeta);


        // Animación suave de bajada
        setTimeout(() => {
            crearTarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

    } catch (error) {
        console.error("Error al obtener la imagen: ", error);
    } finally {
        bindeandoPeticion = false; // Desbloquea el botón para la siguiente búsqueda limpia
    }
});

btonVolver.addEventListener('click', function() {
    // Volvemos a mostrar el contenedor principal con su diseño de rejilla
    contenedor.style.display = 'grid'; 

    // Ocultamos por completo la tarjeta del resultado que se había buscado
    contenedor_result.style.display = 'none';
    btonVolver.style.display = 'none';
    input.value = '';
    crearTarjeta.remove();

    // Al usar 'let' arriba, este botón ahora sí reconoce perfectamente a la tarjeta y la elimina limpiamente
    if (crearTarjeta) {
        crearTarjeta.remove();
        crearTarjeta = null; 
    }
});
