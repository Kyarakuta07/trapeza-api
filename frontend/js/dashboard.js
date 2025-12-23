/**
 * Trapeza Bank - Dashboard Module
 * Handles all dashboard functionality including navigation, API calls, and page loading
 */

// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:8080/api/trapeza';
let currentUser = null;
let currentPage = 'home';
let allTransactions = [];
let currentFilter = 'all';

// ============================================
// AUTHENTICATION
// ============================================

function checkAuth() {
    const savedUser = localStorage.getItem('trapeza_user');
    if (!savedUser) {
        window.location.href = 'index.html';
        return false;
    }
    currentUser = JSON.parse(savedUser);
    return true;
}

function logout() {
    localStorage.removeItem('trapeza_user');
    window.location.href = 'index.html';
}

// ============================================
// PAGE LOADING
// ============================================

async function loadPage(pageName) {
    currentPage = pageName;

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById('nav' + pageName.charAt(0).toUpperCase() + pageName.slice(1)).classList.add('active');

    // Update subtitle
    const subtitles = {
        home: 'Digital Banking',
        wallet: 'Kelola Keuangan',
        history: 'Riwayat Transaksi',
        profile: 'Akun Saya'
    };
    document.getElementById('pageSubtitle').textContent = subtitles[pageName] || 'Digital Banking';

    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (response.ok) {
            const html = await response.text();
            document.getElementById('pageContainer').innerHTML = html;

            // Initialize page-specific data
            initPageData();

            // Load page-specific data
            if (pageName === 'home') {
                syncBalanceFromServer();
                loadRecentTransactions();
            } else if (pageName === 'wallet') {
                syncBalanceFromServer();
                loadAccounts();
            } else if (pageName === 'history') {
                loadHistory();
            }
        } else {
            document.getElementById('pageContainer').innerHTML = `
                <div class="error-state">
                    <p class="error-state-icon">😕</p>
                    <p class="error-state-text">Halaman tidak ditemukan</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('pageContainer').innerHTML = `
            <div class="error-state">
                <p class="error-state-icon">⚠️</p>
                <p class="error-state-text">Gagal memuat halaman</p>
            </div>
        `;
    }
}

// ============================================
// INITIALIZE PAGE DATA
// ============================================

function initPageData() {
    if (!currentUser) return;

    const initial = currentUser.username.charAt(0).toUpperCase();
    const displayBalance = (currentUser.gold || 0) * 1000;

    // Update all displays
    updateElement('balanceDisplay', formatNumber(displayBalance));
    updateElement('walletBalance', 'Rp ' + formatNumber(displayBalance));
    updateElement('goldBalance', formatNumber(currentUser.gold || 0) + ' GOLD');
    updateElement('userName', currentUser.namaLengkap || currentUser.username);
    updateElement('userStatus', currentUser.gold > 0 ? 'Aktif' : 'User Baru');
    updateElement('profileName', currentUser.namaLengkap || currentUser.username);
    updateElement('profileUsername', '@' + currentUser.username.toLowerCase());

    // Update avatars
    updateElement('userAvatar', initial);
    updateElement('headerAvatar', initial);
    updateElement('profileAvatar', initial);

    // Setup filter tabs
    setupFilterTabs();
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setupFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ============================================
// UTILITIES
// ============================================

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function showResult(element, message, type) {
    element.textContent = message;
    element.className = 'result-message show ' + type;
}

function showSwagger() {
    window.open('http://localhost:8080/swagger-ui.html', '_blank');
}

// Sync balance from server to keep localStorage updated
async function syncBalanceFromServer() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/balance?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success && data.balance !== undefined) {
            // Update localStorage if balance changed
            if (currentUser.gold !== data.balance) {
                currentUser.gold = data.balance;
                localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
                initPageData(); // Refresh UI
                console.log('💰 Balance synced from server:', data.balance);
            }
        }
    } catch (error) {
        console.error('Failed to sync balance:', error);
    }
}

// ============================================
// TRANSACTION HISTORY
// ============================================

async function loadHistory() {
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('emptyState');

    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/history?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success && data.transactions.length > 0) {
            allTransactions = data.transactions;
            renderHistory(allTransactions);
            if (emptyState) emptyState.style.display = 'none';
        } else {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        }
    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <p class="error-state-text">❌ Gagal memuat riwayat</p>
            </div>
        `;
    }
}

function filterHistory(filter) {
    currentFilter = filter;

    // Update tabs
    document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Filter transactions
    let filtered = allTransactions;
    if (filter === 'income') {
        filtered = allTransactions.filter(tx =>
            tx.toUser?.username === currentUser.username &&
            (tx.fromUser === null || tx.fromUser?.username !== currentUser.username)
        );
    } else if (filter === 'expense') {
        filtered = allTransactions.filter(tx =>
            tx.fromUser?.username === currentUser.username
        );
    }

    renderHistory(filtered);
}

function renderHistory(transactions) {
    const container = document.getElementById('historyContainer');
    if (!container) return;

    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">Tidak ada transaksi</p>
            </div>
        `;
        return;
    }

    let html = '<div class="history-header"><h3 class="history-title">Semua Transaksi</h3></div>';

    transactions.forEach(tx => {
        const isIncome = tx.toUser?.username === currentUser.username &&
            (tx.fromUser === null || tx.fromUser?.username !== currentUser.username);
        const icon = isIncome ? '📥' : '📤';
        const iconClass = isIncome ? 'income' : 'expense';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountPrefix = isIncome ? '+' : '-';

        const date = new Date(tx.createdAt);
        const dateStr = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let description = tx.description || tx.type;
        if (tx.type === 'TRANSFER' && !isIncome) {
            description = 'Transfer ke ' + tx.toUser?.username;
        } else if (tx.type === 'TRANSFER' && isIncome) {
            description = 'Terima dari ' + tx.fromUser?.username;
        }

        html += `
            <div class="history-item">
                <div class="history-icon ${iconClass}">${icon}</div>
                <div class="history-details">
                    <div class="history-name">${description}</div>
                    <div class="history-date">${dateStr}</div>
                </div>
                <div class="history-amount ${amountClass}">${amountPrefix}${formatNumber(tx.amount)} GOLD</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ============================================
// RECENT TRANSACTIONS (Home Page)
// ============================================

async function loadRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const card = document.getElementById('recentTransactionsCard');

    if (!container || !currentUser) return;

    try {
        const response = await fetch(`${API_URL}/history?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success && data.transactions.length > 0) {
            // Show only last 3 transactions
            const recent = data.transactions.slice(0, 3);
            let html = '';

            recent.forEach(tx => {
                const isIncome = tx.toUser?.username === currentUser.username &&
                    (tx.fromUser === null || tx.fromUser?.username !== currentUser.username);
                const icon = isIncome ? '📥' : '📤';
                const iconClass = isIncome ? 'income' : 'expense';
                const amountClass = isIncome ? 'positive' : 'negative';
                const amountPrefix = isIncome ? '+' : '-';

                const date = new Date(tx.createdAt);
                const dateStr = date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short'
                });

                let description = tx.description || tx.type;
                if (tx.type === 'TRANSFER' && !isIncome) {
                    description = 'Transfer ke ' + tx.toUser?.username;
                } else if (tx.type === 'TRANSFER' && isIncome) {
                    description = 'Terima dari ' + tx.fromUser?.username;
                }

                html += `
                    <div class="history-item">
                        <div class="history-icon ${iconClass}">${icon}</div>
                        <div class="history-details">
                            <div class="history-name">${description}</div>
                            <div class="history-date">${dateStr}</div>
                        </div>
                        <div class="history-amount ${amountClass}">${amountPrefix}${formatNumber(tx.amount)} GOLD</div>
                    </div>
                `;
            });

            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state-text">Belum ada transaksi</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <p class="empty-state-text">Gagal memuat transaksi</p>
            </div>
        `;
    }
}

// ============================================
// FORM FUNCTIONS
// ============================================

function toggleForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Hide all forms first
    document.querySelectorAll('.form-section').forEach(f => {
        if (f.id !== formId) f.classList.remove('active');
    });

    // Toggle this form
    form.classList.toggle('active');
}

// Legacy function for compatibility
function showForm(formId) {
    toggleForm('form' + formId.charAt(0).toUpperCase() + formId.slice(1));
}

function navigateTo(pageId) {
    loadPage(pageId);
}

// ============================================
// API FUNCTIONS
// ============================================

async function checkOtherBalance() {
    const username = document.getElementById('checkUsername')?.value.trim();
    const resultDiv = document.getElementById('balanceResult');

    if (!username) {
        showResult(resultDiv, '⚠️ Masukkan username!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/balance?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.success && data.balance > 0) {
            showResult(resultDiv, `✅ Saldo ${username}: ${formatNumber(data.balance)} GOLD (Rp ${formatNumber(data.balance * 1000)})`, 'success');
        } else if (data.success && data.balance === 0) {
            showResult(resultDiv, `⚠️ User "${username}" tidak ditemukan`, 'error');
        } else {
            showResult(resultDiv, '❌ Gagal mengambil data', 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function refreshMyBalance() {
    const resultDiv = document.getElementById('balanceResult');

    try {
        const response = await fetch(`${API_URL}/balance?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.balance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ Saldo diperbarui: ${formatNumber(data.balance)} GOLD`, 'success');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal refresh saldo', 'error');
    }
}

async function doTopup() {
    const amount = parseInt(document.getElementById('topupAmount')?.value) || 0;
    const resultDiv = document.getElementById('topupResult');

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/topup?username=${encodeURIComponent(currentUser.username)}&amount=${amount}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.balance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message} Saldo: ${formatNumber(data.balance)} GOLD`, 'success');
            document.getElementById('topupAmount').value = '';
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function doTransfer() {
    const toUsername = document.getElementById('transferTo')?.value.trim();
    const amount = parseInt(document.getElementById('transferAmount')?.value) || 0;
    const resultDiv = document.getElementById('transferResult');

    if (!toUsername) {
        showResult(resultDiv, '⚠️ Masukkan username tujuan!', 'error');
        return;
    }

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transfer?from=${encodeURIComponent(currentUser.username)}&to=${encodeURIComponent(toUsername)}&amount=${amount}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.senderBalance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message}`, 'success');
            document.getElementById('transferTo').value = '';
            document.getElementById('transferAmount').value = '';
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

// ============================================
// WALLET PAGE FUNCTIONS
// ============================================

async function walletCheckBalance() {
    const username = document.getElementById('walletCheckUsername')?.value.trim();
    const resultDiv = document.getElementById('walletBalanceResult');

    if (!username) {
        showResult(resultDiv, '⚠️ Masukkan username!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/balance?username=${encodeURIComponent(username)}`);
        const data = await response.json();

        if (data.success && data.balance > 0) {
            showResult(resultDiv, `✅ Saldo ${username}: ${formatNumber(data.balance)} GOLD (Rp ${formatNumber(data.balance * 1000)})`, 'success');
        } else if (data.success && data.balance === 0) {
            showResult(resultDiv, `⚠️ User "${username}" tidak ditemukan`, 'error');
        } else {
            showResult(resultDiv, '❌ Gagal mengambil data', 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function walletDoTopup() {
    const amount = parseInt(document.getElementById('walletTopupAmount')?.value) || 0;
    const resultDiv = document.getElementById('walletTopupResult');

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/topup?username=${encodeURIComponent(currentUser.username)}&amount=${amount}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.balance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message} Saldo: ${formatNumber(data.balance)} GOLD`, 'success');
            document.getElementById('walletTopupAmount').value = '';
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function walletDoTransfer() {
    const toUsername = document.getElementById('walletTransferTo')?.value.trim();
    const amount = parseInt(document.getElementById('walletTransferAmount')?.value) || 0;
    const resultDiv = document.getElementById('walletTransferResult');

    if (!toUsername) {
        showResult(resultDiv, '⚠️ Masukkan username tujuan!', 'error');
        return;
    }

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/transfer?from=${encodeURIComponent(currentUser.username)}&to=${encodeURIComponent(toUsername)}&amount=${amount}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.senderBalance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message}`, 'success');
            document.getElementById('walletTransferTo').value = '';
            document.getElementById('walletTransferAmount').value = '';
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function walletDoWithdraw() {
    const amount = parseInt(document.getElementById('walletWithdrawAmount')?.value) || 0;
    const resultDiv = document.getElementById('walletWithdrawResult');

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        // Sync balance from server first to prevent stale data issues
        const balanceRes = await fetch(`${API_URL}/balance?username=${encodeURIComponent(currentUser.username)}`);
        const balanceData = await balanceRes.json();
        if (balanceData.success) {
            currentUser.gold = balanceData.balance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
        }

        // Now check with fresh balance
        if (amount > currentUser.gold) {
            showResult(resultDiv, `⚠️ Saldo tidak cukup! Saldo: ${formatNumber(currentUser.gold)} GOLD`, 'error');
            initPageData(); // Refresh UI with correct balance
            return;
        }

        const response = await fetch(`${API_URL}/withdraw?username=${encodeURIComponent(currentUser.username)}&amount=${amount}`, {
            method: 'POST'
        });
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.balance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message || 'Tarik saldo berhasil!'}`, 'success');
            document.getElementById('walletWithdrawAmount').value = '';
        } else {
            showResult(resultDiv, `❌ ${data.message || 'Gagal tarik saldo. Pastikan saldo cukup.'}`, 'error');
        }
    } catch (error) {
        console.error('Withdraw error:', error);
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

// ============================================
// ACCOUNTS MANAGEMENT
// ============================================

async function loadAccounts() {
    if (!currentUser) return;

    const container = document.getElementById('accountsList');
    if (!container) return;

    container.innerHTML = '<p class="loading-state">Memuat rekening...</p>';

    try {
        const response = await fetch(`${API_URL}/accounts?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success) {
            renderAccounts(data.accounts);
        } else {
            container.innerHTML = '<p class="error-state">Gagal memuat rekening</p>';
        }
    } catch (error) {
        container.innerHTML = '<p class="error-state">Gagal terhubung ke server</p>';
    }
}

function renderAccounts(accounts) {
    const container = document.getElementById('accountsList');
    if (!container) return;

    // Also update dropdowns
    const depositSelect = document.getElementById('depositAccountId');
    const withdrawSelect = document.getElementById('withdrawAccountId');

    if (accounts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🏦 Belum ada rekening</p>
                <p class="empty-hint">Buat rekening pertamamu!</p>
            </div>
        `;
        return;
    }

    // Populate dropdowns
    if (depositSelect) {
        depositSelect.innerHTML = '<option value="">-- Pilih Rekening --</option>' +
            accounts.map(a => `<option value="${a.id}">${a.accountName} (Rp ${formatNumber(a.balance * 1000)})</option>`).join('');
    }
    if (withdrawSelect) {
        withdrawSelect.innerHTML = '<option value="">-- Pilih Rekening --</option>' +
            accounts.map(a => `<option value="${a.id}">${a.accountName} (Rp ${formatNumber(a.balance * 1000)})</option>`).join('');
    }

    let html = '';
    accounts.forEach(acc => {
        const typeIcon = acc.accountType === 'SAVINGS' ? '💰' :
            acc.accountType === 'CHECKING' ? '💳' : '📊';
        const typeLabel = acc.accountType === 'SAVINGS' ? 'Tabungan' :
            acc.accountType === 'CHECKING' ? 'Giro' : 'Deposito';

        html += `
            <div class="account-card">
                <div class="account-icon">${typeIcon}</div>
                <div class="account-info">
                    <div class="account-name">${acc.accountName}</div>
                    <div class="account-number">${acc.accountNumber}</div>
                    <div class="account-type">${typeLabel}</div>
                </div>
                <div class="account-balance">Rp ${formatNumber(acc.balance * 1000)}</div>
            </div>
        `;
    });
    container.innerHTML = html;
}

async function createNewAccount() {
    const accountName = document.getElementById('newAccountName')?.value?.trim();
    const accountType = document.getElementById('newAccountType')?.value;
    const resultDiv = document.getElementById('createAccountResult');

    if (!accountName) {
        showResult(resultDiv, '⚠️ Masukkan nama rekening!', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/accounts?username=${encodeURIComponent(currentUser.username)}&accountName=${encodeURIComponent(accountName)}&accountType=${accountType}`,
            { method: 'POST' }
        );
        const data = await response.json();

        if (data.success) {
            showResult(resultDiv, `✅ ${data.message}`, 'success');
            document.getElementById('newAccountName').value = '';
            loadAccounts(); // Refresh list
            loadNotifications(); // Refresh notifications
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function doAccountDeposit() {
    const accountId = document.getElementById('depositAccountId')?.value;
    const amount = parseInt(document.getElementById('depositAmount')?.value) || 0;
    const resultDiv = document.getElementById('depositResult');

    if (!accountId) {
        showResult(resultDiv, '⚠️ Pilih rekening terlebih dahulu!', 'error');
        return;
    }

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/accounts/deposit?username=${encodeURIComponent(currentUser.username)}&accountId=${accountId}&amount=${amount}`,
            { method: 'POST' }
        );
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.goldBalance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message}`, 'success');
            document.getElementById('depositAmount').value = '';
            loadAccounts();
            loadNotifications();
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

async function doAccountWithdraw() {
    const accountId = document.getElementById('withdrawAccountId')?.value;
    const amount = parseInt(document.getElementById('withdrawAmount')?.value) || 0;
    const resultDiv = document.getElementById('withdrawAccountResult');

    if (!accountId) {
        showResult(resultDiv, '⚠️ Pilih rekening terlebih dahulu!', 'error');
        return;
    }

    if (amount <= 0) {
        showResult(resultDiv, '⚠️ Masukkan jumlah valid!', 'error');
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/accounts/withdraw?username=${encodeURIComponent(currentUser.username)}&accountId=${accountId}&amount=${amount}`,
            { method: 'POST' }
        );
        const data = await response.json();

        if (data.success) {
            currentUser.gold = data.goldBalance;
            localStorage.setItem('trapeza_user', JSON.stringify(currentUser));
            initPageData();
            showResult(resultDiv, `✅ ${data.message}`, 'success');
            document.getElementById('withdrawAmount').value = '';
            loadAccounts();
            loadNotifications();
        } else {
            showResult(resultDiv, `❌ ${data.message}`, 'error');
        }
    } catch (error) {
        showResult(resultDiv, '❌ Gagal terhubung ke server', 'error');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    if (checkAuth()) {
        document.getElementById('headerAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
        loadPage('home');
    }
});

// ============================================
// NOTIFICATIONS
// ============================================

async function loadNotifications() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_URL}/notifications?username=${encodeURIComponent(currentUser.username)}`);
        const data = await response.json();

        if (data.success) {
            renderNotifications(data.notifications);
            updateNotificationBadge(data.unreadCount);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function renderNotifications(notifications) {
    const list = document.getElementById('notificationList');
    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = '<p class="notification-empty">Tidak ada notifikasi</p>';
        return;
    }

    let html = '';
    notifications.forEach(n => {
        const date = new Date(n.createdAt);
        const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        const readClass = n.isRead ? 'read' : 'unread';

        html += `
            <div class="notification-item ${readClass}" onclick="markNotificationRead(${n.id})">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-date">${dateStr}</div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            loadNotifications();
        }
    }
}

async function markNotificationRead(id) {
    try {
        await fetch(`${API_URL}/notifications/read?id=${id}`, { method: 'POST' });
        loadNotifications();
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function markAllNotificationsRead() {
    if (!currentUser) return;

    try {
        await fetch(`${API_URL}/notifications/read-all?username=${encodeURIComponent(currentUser.username)}`, { method: 'POST' });
        loadNotifications();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}

// Load notifications on page load
setTimeout(loadNotifications, 1000);
