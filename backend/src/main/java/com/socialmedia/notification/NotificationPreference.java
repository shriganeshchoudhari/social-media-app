package com.socialmedia.notification;

import com.socialmedia.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Per-user, per-type notification preference.
 *
 * One row exists for each (user, type) pair.  Rows are seeded by the
 * Flyway migration {@code V9__notification_preferences.sql} for every
 * existing user, and are created on-demand for new users.
 *
 * inApp = false  →  the notification is suppressed entirely (not saved,
 *                   not pushed via WebSocket).
 */
@Entity
@Table(
    name = "notification_preferences",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_notif_pref_user_type",
        columnNames = { "user_id", "type" }
    ),
    indexes = {
        @Index(name = "idx_notif_pref_user", columnList = "user_id")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Notification.Type type;

    /** Whether to deliver this notification type inside the app (and via WS). */
    @Column(nullable = false)
    @Builder.Default
    private boolean inApp = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
