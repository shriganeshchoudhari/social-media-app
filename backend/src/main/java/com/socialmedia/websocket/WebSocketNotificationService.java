package com.socialmedia.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Helper for pushing real-time notifications to a specific user's browser.
 *
 * Usage from NotificationService:
 *   wsPush.sendToUser(recipientId, notificationDto);
 *
 * The client subscribes to:  /user/queue/notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push a payload to a single connected user.
     * If the user is not connected, the message is silently dropped
     * (the polling fallback in NotificationsPage will catch it).
     */
    public void sendToUser(String username, Object payload) {
        try {
            messagingTemplate.convertAndSendToUser(username, "/queue/notifications", payload);
            log.debug("WS notification pushed to user={}", username);
        } catch (Exception e) {
            log.debug("WS notification push failed (user offline?): {}", e.getMessage());
        }
    }
}
