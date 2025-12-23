package com.moe.trapeza_api.service;

import com.moe.trapeza_api.entity.Account;
import com.moe.trapeza_api.entity.Notification;
import com.moe.trapeza_api.entity.Transaction;
import com.moe.trapeza_api.entity.User;
import com.moe.trapeza_api.repository.AccountRepository;
import com.moe.trapeza_api.repository.NotificationRepository;
import com.moe.trapeza_api.repository.TransactionRepository;
import com.moe.trapeza_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrapezaService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;

    // Fungsi untuk cek saldo
    public int getBalance(String username) {
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return 0;
        }

        return user.getGold();
    }

    // Fungsi untuk login
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return null; // User tidak ditemukan
        }

        // Cek password (simple comparison, untuk production gunakan BCrypt)
        if (!user.getPassword().equals(password)) {
            return null; // Password salah
        }

        return user; // Login berhasil
    }

    // Fungsi untuk buat user baru (dengan password)
    @Transactional
    public User createUser(String username, String password, String namaLengkap) {
        // Cek apakah username sudah ada
        if (userRepository.existsByUsername(username)) {
            return null; // Username sudah dipakai
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setNamaLengkap(namaLengkap);
        user.setGold(1000); // Default gold

        User savedUser = userRepository.save(user);

        // Catat transaksi bonus registrasi
        Transaction tx = new Transaction();
        tx.setToUser(savedUser);
        tx.setAmount(1000);
        tx.setType("BONUS");
        tx.setDescription("Bonus Pendaftaran");
        transactionRepository.save(tx);

        // Create default account
        createDefaultAccount(savedUser);

        // Create welcome notification
        createNotification(savedUser, "Selamat Datang! 🎉",
                "Akun kamu berhasil dibuat. Kamu mendapat bonus 1,000 GOLD!", "SYSTEM");

        return savedUser;
    }

    // Fungsi untuk get user by username
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    // ==========================================
    // TRANSFER GOLD
    // ==========================================
    @Transactional // Penting! Semua perubahan dalam 1 transaksi
    public String transfer(String fromUsername, String toUsername, int amount) {
        // Validasi jumlah
        if (amount <= 0) {
            return "Jumlah harus lebih dari 0";
        }

        // Cari pengirim
        User sender = userRepository.findByUsername(fromUsername).orElse(null);
        if (sender == null) {
            return "Pengirim tidak ditemukan";
        }

        // Cari penerima
        User receiver = userRepository.findByUsername(toUsername).orElse(null);
        if (receiver == null) {
            return "Penerima tidak ditemukan";
        }

        // Tidak bisa transfer ke diri sendiri
        if (fromUsername.equals(toUsername)) {
            return "Tidak bisa transfer ke diri sendiri";
        }

        // Cek saldo cukup
        if (sender.getGold() < amount) {
            return "Saldo tidak cukup. Saldo kamu: " + sender.getGold() + " GOLD";
        }

        // Lakukan transfer
        sender.setGold(sender.getGold() - amount);
        receiver.setGold(receiver.getGold() + amount);

        // Simpan perubahan
        userRepository.save(sender);
        userRepository.save(receiver);

        // Catat transaksi
        Transaction tx = new Transaction();
        tx.setFromUser(sender);
        tx.setToUser(receiver);
        tx.setAmount(amount);
        tx.setType("TRANSFER");
        tx.setDescription("Transfer ke " + receiver.getUsername());
        transactionRepository.save(tx);

        return null; // null = sukses
    }

    // ==========================================
    // TOP UP GOLD
    // ==========================================
    @Transactional
    public User topup(String username, int amount) {
        if (amount <= 0) {
            return null;
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        user.setGold(user.getGold() + amount);
        User savedUser = userRepository.save(user);

        // Catat transaksi
        Transaction tx = new Transaction();
        tx.setToUser(savedUser);
        tx.setAmount(amount);
        tx.setType("TOPUP");
        tx.setDescription("Top Up Saldo");
        transactionRepository.save(tx);

        return savedUser;
    }

    // ==========================================
    // GET TRANSACTION HISTORY
    // ==========================================
    public List<Transaction> getTransactionHistory(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }

        // Ambil semua transaksi dimana user adalah pengirim ATAU penerima
        return transactionRepository.findByFromUserOrToUserOrderByCreatedAtDesc(user, user);
    }

    // ==========================================
    // WITHDRAW GOLD
    // ==========================================
    @Transactional
    public User withdraw(String username, int amount) {
        if (amount <= 0) {
            return null;
        }

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        if (user.getGold() < amount) {
            return null; // Saldo tidak cukup
        }

        user.setGold(user.getGold() - amount);
        User savedUser = userRepository.save(user);

        // Catat transaksi
        Transaction tx = new Transaction();
        tx.setFromUser(savedUser);
        tx.setAmount(amount);
        tx.setType("WITHDRAW");
        tx.setDescription("Tarik Saldo");
        transactionRepository.save(tx);

        return savedUser;
    }

    // ==========================================
    // ACCOUNT MANAGEMENT
    // ==========================================

    public List<Account> getUserAccounts(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        return accountRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public Account createAccount(String username, String accountName, String accountType) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return null;
        }

        Account account = new Account();
        account.setUser(user);
        account.setAccountName(accountName);
        account.setAccountType(accountType);
        account.setBalance(0);

        Account savedAccount = accountRepository.save(account);

        // Create notification
        createNotification(user, "Rekening Baru",
                "Rekening " + accountName + " berhasil dibuat!", "SYSTEM");

        return savedAccount;
    }

    @Transactional
    public Account createDefaultAccount(User user) {
        Account account = new Account();
        account.setUser(user);
        account.setAccountName("Rekening Utama");
        account.setAccountType("SAVINGS");
        account.setBalance(user.getGold());
        return accountRepository.save(account);
    }

    @Transactional
    public Account depositToAccount(Long accountId, String username, int amount) {
        if (amount <= 0)
            return null;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return null;

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return null; // Account not found or not owned by user
        }

        if (user.getGold() < amount) {
            return null; // Insufficient balance
        }

        // Deduct from user gold, add to account
        user.setGold(user.getGold() - amount);
        account.setBalance(account.getBalance() + amount);

        userRepository.save(user);
        Account savedAccount = accountRepository.save(account);

        // Record transaction
        Transaction tx = new Transaction();
        tx.setFromUser(user);
        tx.setToUser(user);
        tx.setAmount(amount);
        tx.setType("DEPOSIT");
        tx.setDescription("Setor ke " + account.getAccountName());
        transactionRepository.save(tx);

        // Notification
        createNotification(user, "Setor Berhasil",
                "Setor " + amount + " GOLD ke " + account.getAccountName(), "TRANSFER");

        return savedAccount;
    }

    @Transactional
    public Account withdrawFromAccount(Long accountId, String username, int amount) {
        if (amount <= 0)
            return null;

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return null;

        Account account = accountRepository.findById(accountId).orElse(null);
        if (account == null || !account.getUser().getId().equals(user.getId())) {
            return null; // Account not found or not owned by user
        }

        if (account.getBalance() < amount) {
            return null; // Insufficient account balance
        }

        // Deduct from account, add to user gold
        account.setBalance(account.getBalance() - amount);
        user.setGold(user.getGold() + amount);

        userRepository.save(user);
        Account savedAccount = accountRepository.save(account);

        // Record transaction
        Transaction tx = new Transaction();
        tx.setFromUser(user);
        tx.setToUser(user);
        tx.setAmount(amount);
        tx.setType("WITHDRAW");
        tx.setDescription("Tarik dari " + account.getAccountName());
        transactionRepository.save(tx);

        // Notification
        createNotification(user, "Tarik Berhasil",
                "Tarik " + amount + " GOLD dari " + account.getAccountName(), "TRANSFER");

        return savedAccount;
    }

    // ==========================================
    // NOTIFICATION MANAGEMENT
    // ==========================================

    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return List.of();
        }
        return notificationRepository.findTop10ByUserOrderByCreatedAtDesc(user);
    }

    public long getUnreadNotificationCount(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return 0;
        }
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllNotificationsAsRead(String username) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null)
            return;

        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }
}