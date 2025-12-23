package com.moe.trapeza_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity // "Ini adalah tabel database"
@Table(name = "transactions") // Nama tabelnya "transactions"
@Data // Lombok: otomatis buat getter/setter
public class Transaction {

    @Id // Ini primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment
    private Long id;

    // Relasi ke User pengirim (bisa null untuk TOPUP)
    @ManyToOne
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    // Relasi ke User penerima (bisa null untuk WITHDRAW)
    @ManyToOne
    @JoinColumn(name = "to_user_id")
    private User toUser;

    // Jumlah transaksi (GOLD)
    @Column(nullable = false)
    private Integer amount;

    // Tipe transaksi: TRANSFER, TOPUP, BONUS
    @Column(nullable = false)
    private String type;

    // Deskripsi transaksi
    private String description;

    // Waktu transaksi
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist // Dijalankan SEBELUM data disimpan
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
