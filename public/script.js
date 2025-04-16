// script.js

// --- Configuración ---
// Asegúrate que esta URL apunta a tu backend
const API_BASE_URL = 'http://localhost:5000/api'; // Cambia si es necesario

// --- Referencias al DOM ---
const loginSection = document.getElementById('login-section');
const tutorSection = document.getElementById('tutor-section');
const loadingIndicator = document.getElementById('loading-indicator');

const loginForm = document.getElementById('login-form');
const tutorForm = document.getElementById('tutor-form');

const loginError = document.getElementById('login-error');
const tutorStatus = document.getElementById('tutor-status');

const logoutButton = document.getElementById('logout-button');

// --- Estado ---
let authToken = sessionStorage.getItem('authToken'); // Usar sessionStorage para el token

// --- Funciones ---

function showLoading() {
    loadingIndicator.style.display = 'block';
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function showLogin() {
    loginSection.style.display = 'block';
    tutorSection.style.display = 'none';
    loginError.textContent = '';
    tutorStatus.textContent = '';
}

function showTutorPanel() {
    loginSection.style.display = 'none';
    tutorSection.style.display = 'block';
    loginError.textContent = ''; // Limpiar errores de login
}

// Manejar el envío del formulario de Login
async function handleLogin(event) {
    event.preventDefault(); // Evitar recarga de página
    loginError.textContent = ''; // Limpiar errores previos
    showLoading();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        loginError.textContent = 'Usuario y contraseña son requeridos.';
        hideLoading();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            sessionStorage.setItem('authToken', authToken); // Guardar token
            showTutorPanel();
            // Limpiar formulario login (opcional)
            // loginForm.reset();
        } else {
            loginError.textContent = data.message || 'Error al iniciar sesión.';
            authToken = null;
            sessionStorage.removeItem('authToken');
        }
    } catch (error) {
        console.error('Error de red o del servidor:', error);
        loginError.textContent = 'No se pudo conectar al servidor.';
        authToken = null;
        sessionStorage.removeItem('authToken');
    } finally {
        hideLoading();
    }
}

// Manejar el envío del formulario para agregar Tutor
async function handleAddTutor(event) {
    event.preventDefault();
    tutorStatus.textContent = '';
    tutorStatus.className = 'status-message'; // Reset class

    if (!authToken) {
        tutorStatus.textContent = 'Error: No estás autenticado.';
        tutorStatus.classList.add('error');
        showLogin(); // Redirigir a login si no hay token
        return;
    }

    showLoading();

    // Recoger datos del formulario de tutor
    const tutorData = {
        nombre: document.getElementById('tutor-nombre').value.trim(),
        apellido_paterno: document.getElementById('tutor-apellido-paterno').value.trim(),
        apellido_materno: document.getElementById('tutor-apellido-materno').value.trim() || null, // Enviar null si está vacío
        telefono: document.getElementById('tutor-telefono').value.trim(),
        email: document.getElementById('tutor-email').value.trim() || null,
        direccion: document.getElementById('tutor-direccion').value.trim() || null,
        ocupacion: document.getElementById('tutor-ocupacion').value.trim() || null,
        notas: document.getElementById('tutor-notas').value.trim() || null,
    };

     // Validación simple en frontend
    if (!tutorData.nombre || !tutorData.apellido_paterno || !tutorData.telefono) {
        tutorStatus.textContent = 'Nombre, Apellido Paterno y Teléfono son obligatorios.';
        tutorStatus.classList.add('error');
        hideLoading();
        return;
    }


    try {
        const response = await fetch(`${API_BASE_URL}/tutores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`, // Incluir token
            },
            body: JSON.stringify(tutorData),
        });

        const result = await response.json();

        if (response.ok) { // Status 201 Created
            tutorStatus.textContent = `Tutor "${result.nombre} ${result.apellido_paterno}" agregado con éxito!`;
            tutorStatus.classList.remove('error');
            tutorForm.reset(); // Limpiar formulario
        } else {
            tutorStatus.textContent = result.message || 'Error al agregar tutor.';
            tutorStatus.classList.add('error');
             if(response.status === 401) { // Si el token expiró o es inválido
                handleLogout(); // Desloguear al usuario
                loginError.textContent = "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.";
            }
        }

    } catch (error) {
        console.error('Error de red o del servidor al agregar tutor:', error);
        tutorStatus.textContent = 'No se pudo conectar al servidor para agregar el tutor.';
        tutorStatus.classList.add('error');
    } finally {
        hideLoading();
    }
}

// Manejar el cierre de sesión
function handleLogout() {
    authToken = null;
    sessionStorage.removeItem('authToken');
    showLogin();
}

// --- Inicialización y Event Listeners ---

// Verificar si ya hay un token al cargar la página
if (authToken) {
    // Podrías añadir una llamada a /api/auth/me para verificar si el token aún es válido
    // Si es válido, mostrar el panel, si no, mostrar login
    console.log("Token encontrado, mostrando panel.");
    showTutorPanel();
} else {
    console.log("No hay token, mostrando login.");
    showLogin();
}

loginForm.addEventListener('submit', handleLogin);
tutorForm.addEventListener('submit', handleAddTutor);
logoutButton.addEventListener('click', handleLogout);