package com.socialmedia.notification.dto;

import com.socialmedia.notification.Notification;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreferenceResponse {
    private Notification.Type type;
    private boolean inApp;
}
