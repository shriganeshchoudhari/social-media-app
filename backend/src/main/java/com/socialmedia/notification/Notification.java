package com.socialmedia.notification;

import com.socialmedia.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_recipient", columnList = "recipient_id"),
        @Index(name = "idx_notif_read",      columnList = "read_flag")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who receives this notification. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    /** The user whose action caused the notification (may be null for system events). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    /** Optional reference ID (postId, commentId …) */
    private Long referenceId;

    /** Human-readable notification text. */
    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "read_flag", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }

    public enum Type {
        LIKE,       // someone liked your post
        COMMENT,    // someone commented on your post
        FOLLOW,     // someone followed you
        MENTION     // you were mentioned in a post/comment
    }
}
