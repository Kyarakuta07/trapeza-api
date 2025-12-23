/**
 * Trapeza Bank - Authentication Module
 * Handles login, register, and session management
 */

// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:8080/api/trapeza';

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabId) {
    // Update tabs
    document.querySelectorAll('.login-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update panels
    document.querySelectorAll('.form-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('panel' + tabId.charAt(0).toUpperCase() + tabId.slice(1)).classList.add('active');
}

// ============================================
// LOGIN
// ============================================

async function doLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const resultDiv = document.getElementById('loginResult');
    const btn = document.getElementById('btnLogin');

    if (!username || !password) {
        showResult(resultDiv, '⚠️ Lengkapi username dan password!', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Memproses...';

    try {
        const response = await fetch(`${API_URL}/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            // Simpan user ke localStorage
            localStorage.setItem('trapeza_user', JSON.stringify(data.user));
            showResult(resultDiv, '✅ Login berhasil! Mengalihkan...', 'success');

            // Redirect ke dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showResult(resultDiv, '❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = 'Masuk';
}

// ============================================
// REGISTER
// ============================================

async function doRegister() {
    const username = document.getElementById('regUsername').value.trim();
    const nama = document.getElementById('regNama').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const resultDiv = document.getElementById('registerResult');
    const btn = document.getElementById('btnRegister');

    if (!username || !nama || !password) {
        showResult(resultDiv, '⚠️ Lengkapi semua field!', 'error');
        return;
    }

    if (password !== passwordConfirm) {
        showResult(resultDiv, '⚠️ Password tidak cocok!', 'error');
        return;
    }

    if (password.length < 4) {
        showResult(resultDiv, '⚠️ Password minimal 4 karakter!', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Mendaftar...';

    try {
        const response = await fetch(`${API_URL}/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&nama=${encodeURIComponent(nama)}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            // Simpan user ke localStorage
            localStorage.setItem('trapeza_user', JSON.stringify(data.user));
            showResult(resultDiv, '✅ Registrasi berhasil! Mengalihkan...', 'success');

            // Redirect ke dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showResult(resultDiv, '❌ ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = 'Daftar Sekarang';
}

// ============================================
// UTILITIES
// ============================================

function showResult(element, message, type) {
    element.textContent = message;
    element.className = 'result-message show ' + type;
}

function showSwagger() {
    window.open('http://localhost:8080/swagger-ui.html', '_blank');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Enter key support
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doLogin();
        });
    }

    const regPasswordConfirm = document.getElementById('regPasswordConfirm');
    if (regPasswordConfirm) {
        regPasswordConfirm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doRegister();
        });
    }

    // Check if already logged in
    const savedUser = localStorage.getItem('trapeza_user');
    if (savedUser) {
        window.location.href = 'dashboard.html';
    }
});
