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
     * GET /api/v1/notifications?page=0&size=20
     * Returns the current user's notifications newest-first.
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> list(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                notificationService.getNotifications(currentUser, PageRequest.of(page, size)));
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
}
