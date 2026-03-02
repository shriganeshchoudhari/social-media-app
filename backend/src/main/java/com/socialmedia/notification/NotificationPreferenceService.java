package com.socialmedia.notification;

import com.socialmedia.notification.dto.NotificationPreferenceResponse;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manages per-user notification preferences.
 *
 * Each preference row controls whether a given notification type is
 * delivered in-app for a specific user.  Missing rows default to
 * {@code inApp = true} (opt-out model).
 *
 * Preferences are cached per user for quick lookup inside the hot
 * {@link NotificationService#handleNotificationEvent} path.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    // ── Read ──────────────────────────────────────────────────

    /**
     * Returns all preferences for the user, one entry per type.
     * Missing DB rows are synthesised with the default (inApp = true).
     */
    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponse> getPreferences(User user) {
        Map<Notification.Type, Boolean> stored = preferenceRepository.findByUser(user)
                .stream()
                .collect(Collectors.toMap(NotificationPreference::getType,
                                          NotificationPreference::isInApp));

        return Arrays.stream(Notification.Type.values())
                .map(type -> new NotificationPreferenceResponse(
                        type,
                        stored.getOrDefault(type, true)))  // default = enabled
                .toList();
    }

    /**
     * Returns {@code true} if the user wants to receive the given type in-app.
     * Cached per (userId, type) — evicted when the preference is updated.
     *
     * Called on every notification event, so must be fast.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "notif-pref", key = "#user.id + '-' + #type.name()")
    public boolean isEnabled(User user, Notification.Type type) {
        return preferenceRepository.findByUserAndType(user, type)
                .map(NotificationPreference::isInApp)
                .orElse(true);  // default opt-in
    }

    // ── Write ─────────────────────────────────────────────────

    /**
     * Upserts the preference for the given type and returns the updated entry.
     */
    @Transactional
    @CacheEvict(value = "notif-pref", key = "#user.id + '-' + #type.name()")
    public NotificationPreferenceResponse updatePreference(
            User user, Notification.Type type, boolean inApp) {

        NotificationPreference pref = preferenceRepository
                .findByUserAndType(user, type)
                .orElseGet(() -> NotificationPreference.builder()
                        .user(user)
                        .type(type)
                        .build());

        pref.setInApp(inApp);
        preferenceRepository.save(pref);

        log.debug("Preference updated: user={} type={} inApp={}", user.getUsername(), type, inApp);
        return new NotificationPreferenceResponse(type, inApp);
    }
}
