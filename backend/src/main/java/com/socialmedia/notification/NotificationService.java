package com.socialmedia.notification;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final NotificationRepository notificationRepository;

    // ── Async event listener ──────────────────────────────────

    /**
     * Consumed asynchronously so the caller's transaction commits first.
     * Never notifies a user of their own actions (actor == recipient guard).
     */
    @Async
    @EventListener
    @Transactional
    public void handleNotificationEvent(NotificationEvent event) {
        // Don't notify users about their own actions
        if (event.getActor().getId().equals(event.getRecipient().getId())) return;

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
    }

    // ── Query methods ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(User currentUser, Pageable pageable) {
        return notificationRepository
                .findByRecipientOrderByCreatedAtDesc(currentUser, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long countUnread(User currentUser) {
        return notificationRepository.countByRecipientAndReadFalse(currentUser);
    }

    @Transactional
    public void markAllRead(User currentUser) {
        notificationRepository.markAllRead(currentUser);
    }

    @Transactional
    public void markRead(Long id, User currentUser) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            return; // silently ignore — not the owner
        }
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
