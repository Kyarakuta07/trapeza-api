package com.moe.trapeza_api.repository;

import com.moe.trapeza_api.entity.Transaction;
import com.moe.trapeza_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Cari transaksi dimana user adalah pengirim ATAU penerima
    // Diurutkan dari yang terbaru
    List<Transaction> findByFromUserOrToUserOrderByCreatedAtDesc(User fromUser, User toUser);

    // Cari transaksi dimana user adalah penerima (income)
    List<Transaction> findByToUserOrderByCreatedAtDesc(User toUser);

    // Cari transaksi dimana user adalah pengirim (expense)
    List<Transaction> findByFromUserOrderByCreatedAtDesc(User fromUser);

    // Cari berdasarkan tipe transaksi
    List<Transaction> findByTypeOrderByCreatedAtDesc(String type);
}
