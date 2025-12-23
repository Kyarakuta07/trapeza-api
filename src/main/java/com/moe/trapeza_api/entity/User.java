package com.moe.trapeza_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity // "Ini adalah tabel database"
@Table(name = "users") // Nama tabelnya "users"
@Data // Lombok: otomatis buat getter/setter
public class User {

    @Id // Ini primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto increment
    private Long id;

    @Column(nullable = false, unique = true) // Wajib diisi, tidak boleh duplikat
    private String username;

    @Column(nullable = false) // Password wajib diisi
    private String password;

    @Column(name = "nama_lengkap") // Nama kolom di database
    private String namaLengkap;

    private Integer gold = 1000; // Default 1000 gold

    @Column(name = "status_akun")
    private String statusAkun = "Aktif";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist // Dijalankan SEBELUM data disimpan
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}