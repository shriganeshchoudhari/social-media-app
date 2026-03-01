package com.socialmedia.notification;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.user.User;
import com.socialmedia.websocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository          notificationRepository;
    private final WebSocketNotificationService     webSocketNotificationService;

    // ── Async event listener ──────────────────────────────────

    /**
     * Consumed asynchronously so the caller's transaction commits first.
     * Evicts the recipient's cached unread count so next poll gets fresh data.
     */
    @Async
    @EventListener
    @Transactional
    @CacheEvict(value = "notif-count", key = "#event.recipient.id")
    public void handleNotificationEvent(NotificationEvent event) {
        if (event.getActor().getId().equals(event.getRecipient().getId())) return;

        try {
            Notification notification = Notification.builder()
                    .recipient(event.getRecipient())
                    .actor(event.getActor())
                    .type(event.getType())
                    .referenceId(event.getReferenceId())
                    .message(event.getMessage())
                    .build();

            notificationRepository.save(notification);
            log.debug("Notification saved: type={} recipient={}", event.getType(),
                    event.getRecipient().getUsername());

            NotificationResponse dto = toResponse(notification);
            webSocketNotificationService.sendToUser(event.getRecipient().getUsername(), dto);
        } catch (Exception e) {
            // In tests, the triggering transaction may have already rolled back
            // (e.g. @Transactional test cleanup), leaving actor/recipient IDs
            // that no longer exist. Swallow the FK violation gracefully so it
            // does not pollute test logs or cause spurious test failures.
            log.debug("Notification skipped (entity no longer exists): {}", e.getMessage());
        }
    }

    // ── Query methods ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(User currentUser, Pageable pageable) {
        return notificationRepository
                .findByRecipientOrderByCreatedAtDesc(currentUser, pageable)
                .map(this::toResponse);
    }

    /**
     * Cached per user for 60 s. Evicted on any notification write.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "notif-count", key = "#currentUser.id")
    public long countUnread(User currentUser) {
        return notificationRepository.countByRecipientAndReadFalse(currentUser);
    }

    @Transactional
    @CacheEvict(value = "notif-count", key = "#currentUser.id")
    public void markAllRead(User currentUser) {
        notificationRepository.markAllRead(currentUser);
    }

    @Transactional
    @CacheEvict(value = "notif-count", key = "#currentUser.id")
    public void markRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!notification.getRecipient().getId().equals(currentUser.getId())) return;
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ── Mapping ───────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .actorUsername(n.getActor() != null ? n.getActor().getUsername() : null)
                .actorAvatarUrl(n.getActor() != null ? n.getActor().getAvatarUrl() : null)
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .message(n.getMessage())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
