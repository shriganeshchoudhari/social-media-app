package com.socialmedia.notification;

import com.socialmedia.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ── Fetch queries ─────────────────────────────────────────

    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);

    Page<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient, Pageable pageable);

    Page<Notification> findByRecipientAndTypeOrderByCreatedAtDesc(
            User recipient, Notification.Type type, Pageable pageable);

    Page<Notification> findByRecipientAndTypeAndReadFalseOrderByCreatedAtDesc(
            User recipient, Notification.Type type, Pageable pageable);

    // ── Count queries ─────────────────────────────────────────

    long countByRecipientAndReadFalse(User recipient);

    // ── Bulk update ───────────────────────────────────────────

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient = :user AND n.read = false")
    void markAllRead(@Param("user") User user);

    // ── Delete queries ────────────────────────────────────────

    /**
     * Deletes a single notification only if it belongs to the given recipient.
     * Ownership check is done at the DB level to prevent IDOR.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.id = :id AND n.recipient = :user")
    void deleteByIdAndRecipient(@Param("id") Long id, @Param("user") User user);

    /**
     * Deletes all notifications for the given recipient.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipient = :user")
    void deleteAllByRecipient(@Param("user") User user);
}
