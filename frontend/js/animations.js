// Navbar
// Dirigir a index.html
const bton_home = document.getElementById("inicio");

bton_home.addEventListener("click", function() {
    window.location.href = "index.html";
});

// Dirigir a reloj_mund.html
const bton_reloj = document.getElementById("reloj-mundial");

bton_reloj.addEventListener("click", function() {
    window.location.href = "reloj_mund.html";
});

// Dirigir a alarmas.html
const bton_alarmas = document.getElementById("alarmas");

bton_alarmas.addEventListener("click", function() {
    window.location.href = "alarmas.html";
});
