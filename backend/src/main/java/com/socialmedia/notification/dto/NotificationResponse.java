package com.socialmedia.notification.dto;

import com.socialmedia.notification.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {

    private Long id;

    /** Actor username (who triggered the notification). */
    private String actorUsername;
    private String actorAvatarUrl;

    private Notification.Type type;
    private Long referenceId;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
