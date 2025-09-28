const pantalla = document.getElementById("pantalla");
const listaHistorial = document.getElementById("lista-historial");

window.onload = () => {
    mostrarHistorial();
    document.addEventListener('keydown', manejarTeclado);
};

function manejarTeclado(event) {
    event.preventDefault();
    const tecla = event.key;
    const acciones = {
        'Enter': calcular, '=': calcular,
        'Escape': limpiarPantalla, 'c': limpiarPantalla, 'C': limpiarPantalla,
        'Backspace': borrarUltimo,
        '*': () => agregarOperador('×'),
        '/': () => agregarOperador('÷')
    };

    if (/[0-9.]/.test(tecla)) {
        agregarNumero(tecla);
    } else if (/[+\-]/.test(tecla)) {
        agregarOperador(tecla);
    } else if (acciones[tecla]) {
        acciones[tecla]();
    }
}

function agregarNumero(numero) {
    if (numero === '.') {
        const ultimoNum = pantalla.value.split(/[+\-×÷]/).pop();
        if (ultimoNum.includes('.')) return;
    }

    pantalla.classList.remove('error');
    pantalla.value = (pantalla.value === "0" && numero !== '.') ? numero : pantalla.value + numero;
}

function agregarOperador(operador) {
    if (!pantalla.value) return;
    
    const ultimo = pantalla.value.slice(-1);
    const esOperador = /[+\-×÷%]/.test(ultimo);
    
    if (operador === '%' && !esOperador && pantalla.value) {
        pantalla.value += operador;
    } else if (esOperador) {
        pantalla.value = pantalla.value.slice(0, -1) + operador;
    } else {
        pantalla.value += operador;
    }
}

function limpiarPantalla() {
    pantalla.value = "";
    pantalla.classList.remove('error');
}

function borrarUltimo() {
    pantalla.value = pantalla.value.slice(0, -1);
    pantalla.classList.remove('error');
}

function calcular() {
    if (!pantalla.value) return;

    try {
        const expresionOriginal = pantalla.value;
        const expresion = expresionOriginal
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/%/g, "/100");
        
        if (/[\+\-\*\/]{2,}|[\+\-\*\/]$/.test(expresion)) {
            throw new Error("Expresión inválida");
        }
        
        let resultado = Function('"use strict"; return (' + expresion + ')')();
        
        if (!isFinite(resultado)) {
            throw new Error("División por cero");
        }
        
        resultado = Math.round(resultado * 1e10) / 1e10;
        pantalla.value = resultado;
        
        guardarHistorial(`${expresionOriginal} = ${resultado}`);
        
    } catch (e) {
        pantalla.value = "Error";
        pantalla.classList.add('error');
        setTimeout(() => {
            if (pantalla.value === "Error") {
                limpiarPantalla();
            }
        }, 2000);
    }
}

function guardarHistorial(operacion) {
    const historial = JSON.parse(localStorage.getItem("historial") || "[]");
    historial.push(operacion);
    localStorage.setItem("historial", JSON.stringify(historial));
    mostrarHistorial();
}

function mostrarHistorial() {
    const historial = JSON.parse(localStorage.getItem("historial") || "[]");
    
    listaHistorial.innerHTML = historial.length ? 
        historial.map(op => `<div class="operacion">${op}</div>`).join('') :
        '<div class="historial-vacio">No hay operaciones realizadas</div>';
}

function limpiarHistorial() {
    localStorage.removeItem("historial");
    mostrarHistorial();
}
