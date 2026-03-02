package com.socialmedia.notification;

import com.socialmedia.notification.dto.NotificationPreferenceResponse;
import com.socialmedia.notification.dto.UpdateNotificationPreferenceRequest;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for per-user notification preferences.
 *
 * GET  /api/v1/notifications/preferences          → list all preferences
 * PUT  /api/v1/notifications/preferences/{type}   → update a single preference
 */
@RestController
@RequestMapping("/api/v1/notifications/preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    /**
     * Returns one entry per notification type with its current inApp flag.
     * Missing DB rows are returned with the default value (true = enabled).
     */
    @GetMapping
    public ResponseEntity<List<NotificationPreferenceResponse>> getAll(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(preferenceService.getPreferences(currentUser));
    }

    /**
     * Creates or updates the inApp flag for the given notification type.
     * Returns the updated preference entry.
     *
     * @param type   one of the {@link Notification.Type} enum names (case-insensitive)
     * @param body   { "inApp": true|false }
     */
    @PutMapping("/{type}")
    public ResponseEntity<NotificationPreferenceResponse> update(
            @PathVariable String type,
            @RequestBody UpdateNotificationPreferenceRequest body,
            @AuthenticationPrincipal User currentUser) {

        Notification.Type notifType = Notification.Type.valueOf(type.toUpperCase());
        boolean inApp = body.getInApp() != null && body.getInApp();
        return ResponseEntity.ok(
                preferenceService.updatePreference(currentUser, notifType, inApp));
    }
}
