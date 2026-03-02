package com.socialmedia.notification;

import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/v1/notifications?page=0&size=20&unreadOnly=false&type=LIKE
     *
     * Returns the current user's notifications, newest-first.
     * Optional filters:
     *   - unreadOnly=true   → only unread notifications
     *   - type=LIKE         → only notifications of the given type
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0")     int     page,
            @RequestParam(defaultValue = "20")    int     size,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(required = false)       String  type) {

        Notification.Type typeEnum = null;
        if (type != null && !type.isBlank()) {
            try {
                typeEnum = Notification.Type.valueOf(type.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Unknown type → return empty page rather than 400
            }
        }

        return ResponseEntity.ok(
                notificationService.getNotifications(
                        currentUser, PageRequest.of(page, size), unreadOnly, typeEnum));
    }

    /**
     * GET /api/v1/notifications/unread-count
     * Returns { "count": N } — the number of unread notifications.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(currentUser)));
    }

    /**
     * PATCH /api/v1/notifications/read-all
     * Marks every notification of the current user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllRead(currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/v1/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        notificationService.markRead(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/v1/notifications/{id}
     * Removes a single notification owned by the current user.
     * Returns 204 whether or not the notification existed (idempotent).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOne(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        notificationService.deleteOne(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/v1/notifications
     * Removes all notifications for the current user.
     */
    @DeleteMapping
    public ResponseEntity<Void> deleteAll(@AuthenticationPrincipal User currentUser) {
        notificationService.deleteAll(currentUser);
        return ResponseEntity.noContent().build();
    }
}
