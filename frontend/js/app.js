/**
 * Trapeza Bank - Digital Banking
 * Main Application JavaScript
 * 
 * API Integration & UI Logic
 */

// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'http://localhost:8080/api/trapeza';

// ============================================
// STATE
// ============================================

let currentUser = null;
let currentBalance = 0;

// ============================================
// NAVIGATION
// ============================================

/**
 * Navigate to a specific page
 * @param {string} pageId - Page identifier (home, wallet, history, profile)
 */
function navigateTo(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));

    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Show selected page
    const page = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
    if (page) {
        page.classList.add('active');
    }

    // Highlight nav item
    const nav = document.getElementById('nav' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
    if (nav) {
        nav.classList.add('active');
    }

    // Update subtitle based on page
    const subtitles = {
        home: 'Digital Banking',
        wallet: 'Kelola Keuangan',
        history: 'Riwayat Transaksi',
        profile: 'Akun Saya'
    };
    document.getElementById('pageSubtitle').textContent = subtitles[pageId] || 'Digital Banking';
}

/**
 * Show a specific form section
 * @param {string} formId - Form identifier (balance, register, transfer)
 */
function showForm(formId) {
    // Hide all forms
    document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.action-btn').forEach(el => el.classList.remove('active'));

    // Show selected form
    const form = document.getElementById('form' + formId.charAt(0).toUpperCase() + formId.slice(1));
    if (form) {
        form.classList.add('active');
    }

    // Highlight button
    const btn = document.getElementById('btn' + formId.charAt(0).toUpperCase() + formId.slice(1));
    if (btn) {
        btn.classList.add('active');
    }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Format number with thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Update all UI elements with current user data
 * @param {string} username - Current username
 * @param {number} balance - Current balance (in gold)
 */
function updateAllUI(username, balance) {
    const displayBalance = balance * 1000;
    const initial = username.charAt(0).toUpperCase();

    // Update balance displays
    document.getElementById('balanceDisplay').textContent = formatNumber(displayBalance);
    document.getElementById('walletBalance').textContent = 'Rp ' + formatNumber(displayBalance);
    document.getElementById('goldBalance').textContent = formatNumber(balance) + ' GOLD';

    // Update avatars
    document.getElementById('userAvatar').textContent = initial;
    document.getElementById('headerAvatar').textContent = initial;
    document.getElementById('profileAvatar').textContent = initial;

    // Update names
    document.getElementById('userName').textContent = username;
    document.getElementById('profileName').textContent = username;
    document.getElementById('profileUsername').textContent = '@' + username.toLowerCase();

    // Update status
    document.getElementById('userStatus').textContent = balance > 0 ? 'Aktif' : 'User Baru';
}

/**
 * Show result message in a container
 * @param {HTMLElement} element - Result container element
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showResult(element, message, type) {
    element.textContent = message;
    element.className = 'result-message show ' + type;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Check user balance from API
 */
async function checkBalance() {
    const username = document.getElementById('checkUsername').value.trim();
    const resultDiv = document.getElementById('balanceResult');
    const btn = document.getElementById('btnCheckBalance');

    if (!username) {
        showResult(resultDiv, '⚠️ Masukkan username terlebih dahulu!', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Mengecek...';

    try {
        const response = await fetch(`${API_URL}/balance?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.success) {
            currentUser = username;
            currentBalance = data.balance;
            updateAllUI(username, data.balance);

            const displayBalance = data.balance * 1000;
            showResult(resultDiv, `✅ Saldo ${username}: Rp ${formatNumber(displayBalance)}`, 'success');
        } else {
            showResult(resultDiv, '❌ Gagal mengambil saldo', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showResult(resultDiv, '❌ Gagal terhubung ke server. Pastikan API berjalan di localhost:8080', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = 'Cek Saldo';
}

/**
 * Register new user via API
 */
async function registerUser() {
    const username = document.getElementById('regUsername').value.trim();
    const nama = document.getElementById('regNama').value.trim();
    const resultDiv = document.getElementById('registerResult');
    const btn = document.getElementById('btnRegisterSubmit');

    if (!username || !nama) {
        showResult(resultDiv, '⚠️ Lengkapi username dan nama!', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Mendaftar...';

    try {
        const response = await fetch(`${API_URL}/users?username=${encodeURIComponent(username)}&nama=${encodeURIComponent(nama)}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();

            currentUser = username;
            currentBalance = data.gold;
            updateAllUI(data.namaLengkap || username, data.gold);

            const displayBalance = data.gold * 1000;
            showResult(resultDiv, `✅ Akun "${username}" berhasil dibuat! Saldo: Rp ${formatNumber(displayBalance)}`, 'success');

            document.getElementById('regUsername').value = '';
            document.getElementById('regNama').value = '';
        } else {
            showResult(resultDiv, `❌ Username mungkin sudah digunakan`, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showResult(resultDiv, '❌ Gagal terhubung ke server. Pastikan API berjalan di localhost:8080', 'error');
    }

    btn.disabled = false;
    btn.innerHTML = 'Daftar Sekarang';
}

/**
 * Open Swagger UI documentation
 */
function showSwagger() {
    window.open('http://localhost:8080/swagger-ui.html', '_blank');
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Filter tab click handlers
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Enter key support for forms
    const checkUsernameInput = document.getElementById('checkUsername');
    if (checkUsernameInput) {
        checkUsernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkBalance();
        });
    }

    const regNamaInput = document.getElementById('regNama');
    if (regNamaInput) {
        regNamaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') registerUser();
        });
    }

    // Initialize - show home page
    navigateTo('home');
});
