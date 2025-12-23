package com.moe.trapeza_api.repository;

import com.moe.trapeza_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Cari user berdasarkan username
    // Spring OTOMATIS buat query: SELECT * FROM users WHERE username = ?
    Optional<User> findByUsername(String username);

    // Cek apakah username sudah ada
    boolean existsByUsername(String username);
}