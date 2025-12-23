package com.moe.trapeza_api.repository;

import com.moe.trapeza_api.entity.Account;
import com.moe.trapeza_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository untuk Account entity
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Find all accounts by user
    List<Account> findByUserOrderByCreatedAtDesc(User user);

    // Find by account number
    Optional<Account> findByAccountNumber(String accountNumber);

    // Find active accounts by user
    List<Account> findByUserAndStatus(User user, String status);

    // Count accounts by user
    long countByUser(User user);
}
