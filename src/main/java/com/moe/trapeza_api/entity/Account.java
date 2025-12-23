package com.moe.trapeza_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Account Entity - Represents a bank account
 * One user can have multiple accounts (savings, checking, deposit)
 */
@Entity
@Table(name = "accounts")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "account_name")
    private String accountName; // e.g., "Tabungan Utama", "Dana Darurat"

    @Column(name = "account_type", nullable = false)
    private String accountType; // SAVINGS, CHECKING, DEPOSIT

    private Integer balance = 0;

    private String status = "ACTIVE"; // ACTIVE, FROZEN, CLOSED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (accountNumber == null) {
            // Generate random account number
            accountNumber = "TRZ" + System.currentTimeMillis();
        }
    }
}
