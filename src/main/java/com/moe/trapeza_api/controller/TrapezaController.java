package com.moe.trapeza_api.controller;

import com.moe.trapeza_api.dto.BalanceResponse;
import com.moe.trapeza_api.entity.User;
import com.moe.trapeza_api.service.TrapezaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController // "Ini REST API Controller"
@RequestMapping("/api/trapeza") // Base URL: /api/trapeza
@Tag(name = "Trapeza", description = "Banking API")
@RequiredArgsConstructor
public class TrapezaController {

    private final TrapezaService trapezaService;

    // ==========================================
    // POST /api/trapeza/login
    // ==========================================
    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<?> login(
            @RequestParam String username,
            @RequestParam String password) {

        User user = trapezaService.login(username, password);

        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Username atau password salah");
            return ResponseEntity.status(401).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login berhasil");
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // POST /api/trapeza/register
    // ==========================================
    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<?> register(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam(defaultValue = "New User") String nama) {

        User user = trapezaService.createUser(username, password, nama);

        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Username sudah digunakan");
            return ResponseEntity.status(400).body(error);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Registrasi berhasil");
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // GET /api/trapeza/balance?username=player1
    // ==========================================
    @GetMapping("/balance")
    @Operation(summary = "Get user balance")
    public ResponseEntity<BalanceResponse> getBalance(
            @RequestParam(defaultValue = "player1") String username) {

        int balance = trapezaService.getBalance(username);
        return ResponseEntity.ok(BalanceResponse.success(balance));
    }

    // ==========================================
    // POST /api/trapeza/users (Legacy - kept for compatibility)
    // ==========================================
    @PostMapping("/users")
    @Operation(summary = "Create new user (legacy)")
    public ResponseEntity<?> createUser(
            @RequestParam String username,
            @RequestParam(defaultValue = "password123") String password,
            @RequestParam(defaultValue = "New User") String nama) {

        User user = trapezaService.createUser(username, password, nama);
        if (user == null) {
            return ResponseEntity.badRequest().body("Username sudah digunakan");
        }
        return ResponseEntity.ok(user);
    }

    // ==========================================
    // POST /api/trapeza/transfer
    // ==========================================
    @PostMapping("/transfer")
    @Operation(summary = "Transfer GOLD to another user")
    public ResponseEntity<?> transfer(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam int amount) {

        String error = trapezaService.transfer(from, to, amount);

        Map<String, Object> response = new HashMap<>();
        if (error != null) {
            response.put("success", false);
            response.put("message", error);
            return ResponseEntity.badRequest().body(response);
        }

        // Get updated balances
        int senderBalance = trapezaService.getBalance(from);
        int receiverBalance = trapezaService.getBalance(to);

        response.put("success", true);
        response.put("message", "Transfer " + amount + " GOLD ke " + to + " berhasil!");
        response.put("senderBalance", senderBalance);
        response.put("receiverBalance", receiverBalance);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // POST /api/trapeza/topup
    // ==========================================
    @PostMapping("/topup")
    @Operation(summary = "Top up GOLD (demo)")
    public ResponseEntity<?> topup(
            @RequestParam String username,
            @RequestParam int amount) {

        User user = trapezaService.topup(username, amount);

        Map<String, Object> response = new HashMap<>();
        if (user == null) {
            response.put("success", false);
            response.put("message", "Gagal top up");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("success", true);
        response.put("message", "Top up " + amount + " GOLD berhasil!");
        response.put("balance", user.getGold());
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // GET /api/trapeza/history
    // ==========================================
    @GetMapping("/history")
    @Operation(summary = "Get transaction history")
    public ResponseEntity<?> getHistory(@RequestParam String username) {

        var transactions = trapezaService.getTransactionHistory(username);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("transactions", transactions);
        response.put("count", transactions.size());
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // POST /api/trapeza/withdraw
    // ==========================================
    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw GOLD")
    public ResponseEntity<?> withdraw(
            @RequestParam String username,
            @RequestParam int amount) {

        User user = trapezaService.withdraw(username, amount);

        Map<String, Object> response = new HashMap<>();
        if (user == null) {
            response.put("success", false);
            response.put("message", "Gagal tarik saldo. Pastikan saldo cukup.");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("success", true);
        response.put("message", "Tarik " + amount + " GOLD berhasil!");
        response.put("balance", user.getGold());
        response.put("user", user);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ACCOUNT ENDPOINTS
    // ==========================================

    @GetMapping("/accounts")
    @Operation(summary = "Get user accounts")
    public ResponseEntity<?> getAccounts(@RequestParam String username) {
        var accounts = trapezaService.getUserAccounts(username);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("accounts", accounts);
        response.put("count", accounts.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/accounts")
    @Operation(summary = "Create new account")
    public ResponseEntity<?> createAccount(
            @RequestParam String username,
            @RequestParam String accountName,
            @RequestParam(defaultValue = "SAVINGS") String accountType) {

        var account = trapezaService.createAccount(username, accountName, accountType);

        Map<String, Object> response = new HashMap<>();
        if (account == null) {
            response.put("success", false);
            response.put("message", "Gagal membuat rekening");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("success", true);
        response.put("message", "Rekening " + accountName + " berhasil dibuat!");
        response.put("account", account);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/accounts/deposit")
    @Operation(summary = "Deposit gold to account")
    public ResponseEntity<?> depositToAccount(
            @RequestParam String username,
            @RequestParam Long accountId,
            @RequestParam int amount) {

        var account = trapezaService.depositToAccount(accountId, username, amount);

        Map<String, Object> response = new HashMap<>();
        if (account == null) {
            response.put("success", false);
            response.put("message", "Gagal setor. Pastikan saldo gold cukup.");
            return ResponseEntity.badRequest().body(response);
        }

        var user = trapezaService.getUserByUsername(username);
        response.put("success", true);
        response.put("message", "Berhasil setor " + amount + " GOLD ke " + account.getAccountName());
        response.put("account", account);
        response.put("goldBalance", user != null ? user.getGold() : 0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/accounts/withdraw")
    @Operation(summary = "Withdraw gold from account")
    public ResponseEntity<?> withdrawFromAccount(
            @RequestParam String username,
            @RequestParam Long accountId,
            @RequestParam int amount) {

        var account = trapezaService.withdrawFromAccount(accountId, username, amount);

        Map<String, Object> response = new HashMap<>();
        if (account == null) {
            response.put("success", false);
            response.put("message", "Gagal tarik. Pastikan saldo rekening cukup.");
            return ResponseEntity.badRequest().body(response);
        }

        var user = trapezaService.getUserByUsername(username);
        response.put("success", true);
        response.put("message", "Berhasil tarik " + amount + " GOLD dari " + account.getAccountName());
        response.put("account", account);
        response.put("goldBalance", user != null ? user.getGold() : 0);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // NOTIFICATION ENDPOINTS
    // ==========================================

    @GetMapping("/notifications")
    @Operation(summary = "Get user notifications")
    public ResponseEntity<?> getNotifications(@RequestParam String username) {
        var notifications = trapezaService.getUserNotifications(username);
        long unreadCount = trapezaService.getUnreadNotificationCount(username);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("notifications", notifications);
        response.put("unreadCount", unreadCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notifications/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<?> markAsRead(@RequestParam Long id) {
        trapezaService.markNotificationAsRead(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifikasi ditandai sudah dibaca");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notifications/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<?> markAllAsRead(@RequestParam String username) {
        trapezaService.markAllNotificationsAsRead(username);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Semua notifikasi ditandai sudah dibaca");
        return ResponseEntity.ok(response);
    }
}