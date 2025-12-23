package com.moe.trapeza_api.repository;

import com.moe.trapeza_api.entity.Notification;
import com.moe.trapeza_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository untuk Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications by user (newest first)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Find unread notifications by user
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    // Count unread notifications
    long countByUserAndIsReadFalse(User user);

    // Find by user (limited)
    List<Notification> findTop10ByUserOrderByCreatedAtDesc(User user);
}
