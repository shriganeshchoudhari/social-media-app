package com.socialmedia.notification;

import com.socialmedia.notification.dto.NotificationPreferenceResponse;
import com.socialmedia.notification.dto.NotificationResponse;
import com.socialmedia.user.User;
import com.socialmedia.websocket.WebSocketNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService unit tests")
class NotificationServiceTest {

    @Mock  NotificationRepository          notificationRepo;
    @Mock  NotificationPreferenceService   preferenceService;
    @Mock  WebSocketNotificationService    wsService;

    @InjectMocks
    NotificationService notificationService;

    // ── Test fixtures ─────────────────────────────────────────

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("alice@test.com")
                    .password("x").build();
        bob   = User.builder().id(2L).username("bob").email("bob@test.com")
                    .password("x").build();
    }

    private NotificationEvent likeEvent() {
        return new NotificationEvent(this, bob, alice,
                Notification.Type.LIKE, 10L, "bob liked your post");
    }

    // ── handleNotificationEvent ───────────────────────────────

    @Nested
    @DisplayName("handleNotificationEvent")
    class HandleNotificationEvent {

        @Test
        @DisplayName("saves notification and pushes WS when preference enabled")
        void savesAndPushesWhenPreferenceEnabled() {
            when(preferenceService.isEnabled(alice, Notification.Type.LIKE)).thenReturn(true);
            when(notificationRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

            notificationService.handleNotificationEvent(likeEvent());

            verify(notificationRepo).save(any(Notification.class));
            verify(wsService).sendToUser(eq("alice"), any(NotificationResponse.class));
        }

        @Test
        @DisplayName("suppresses notification when inApp preference is disabled")
        void suppressesWhenPreferenceDisabled() {
            when(preferenceService.isEnabled(alice, Notification.Type.LIKE)).thenReturn(false);

            notificationService.handleNotificationEvent(likeEvent());

            verify(notificationRepo, never()).save(any());
            verify(wsService, never()).sendToUser(any(), any());
        }

        @Test
        @DisplayName("skips self-notification (actor == recipient)")
        void skipsSelfNotification() {
            NotificationEvent selfEvent = new NotificationEvent(
                    this, alice, alice,
                    Notification.Type.LIKE, 10L, "you liked your own post");

            notificationService.handleNotificationEvent(selfEvent);

            verify(preferenceService, never()).isEnabled(any(), any());
            verify(notificationRepo, never()).save(any());
        }

        @Test
        @DisplayName("builds notification with correct fields")
        void buildsNotificationWithCorrectFields() {
            when(preferenceService.isEnabled(alice, Notification.Type.LIKE)).thenReturn(true);
            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            when(notificationRepo.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

            notificationService.handleNotificationEvent(likeEvent());

            Notification saved = captor.getValue();
            assertThat(saved.getType()).isEqualTo(Notification.Type.LIKE);
            assertThat(saved.getRecipient()).isEqualTo(alice);
            assertThat(saved.getActor()).isEqualTo(bob);
            assertThat(saved.getReferenceId()).isEqualTo(10L);
            assertThat(saved.getMessage()).isEqualTo("bob liked your post");
            assertThat(saved.isRead()).isFalse();
        }

        @Test
        @DisplayName("swallows exception gracefully (e.g. FK violation in tests)")
        void swallowsExceptionGracefully() {
            when(preferenceService.isEnabled(alice, Notification.Type.LIKE)).thenReturn(true);
            when(notificationRepo.save(any())).thenThrow(new RuntimeException("FK violation"));

            // Should not throw
            notificationService.handleNotificationEvent(likeEvent());

            verify(wsService, never()).sendToUser(any(), any());
        }
    }

    // ── getNotifications ─────────────────────────────────────

    @Nested
    @DisplayName("getNotifications")
    class GetNotifications {

        private Notification buildNotif(Long id, boolean read) {
            Notification n = Notification.builder()
                    .recipient(alice).actor(bob)
                    .type(Notification.Type.LIKE)
                    .message("test").read(read).build();
            // reflective set id for test
            try {
                var f = Notification.class.getDeclaredField("id");
                f.setAccessible(true);
                f.set(n, id);
                var cf = Notification.class.getDeclaredField("createdAt");
                cf.setAccessible(true);
                cf.set(n, LocalDateTime.now());
            } catch (Exception ignored) {}
            return n;
        }

        @Test
        @DisplayName("delegates to unfiltered query when no filters applied")
        void delegatesToUnfilteredQuery() {
            var page = new PageImpl<>(List.of(buildNotif(1L, false)));
            when(notificationRepo.findByRecipientOrderByCreatedAtDesc(eq(alice), any(Pageable.class)))
                .thenReturn(page);

            var result = notificationService.getNotifications(
                    alice, PageRequest.of(0, 20), false, null);

            assertThat(result.getContent()).hasSize(1);
            verify(notificationRepo).findByRecipientOrderByCreatedAtDesc(eq(alice), any());
        }

        @Test
        @DisplayName("delegates to unreadOnly query when unreadOnly=true")
        void delegatesToUnreadOnlyQuery() {
            when(notificationRepo.findByRecipientAndReadFalseOrderByCreatedAtDesc(eq(alice), any()))
                .thenReturn(new PageImpl<>(List.of()));

            notificationService.getNotifications(alice, PageRequest.of(0, 20), true, null);

            verify(notificationRepo).findByRecipientAndReadFalseOrderByCreatedAtDesc(eq(alice), any());
        }

        @Test
        @DisplayName("delegates to type-filtered query when type is set")
        void delegatesToTypeFilteredQuery() {
            when(notificationRepo.findByRecipientAndTypeOrderByCreatedAtDesc(
                    eq(alice), eq(Notification.Type.LIKE), any()))
                .thenReturn(new PageImpl<>(List.of()));

            notificationService.getNotifications(alice, PageRequest.of(0, 20), false, Notification.Type.LIKE);

            verify(notificationRepo).findByRecipientAndTypeOrderByCreatedAtDesc(
                    eq(alice), eq(Notification.Type.LIKE), any());
        }

        @Test
        @DisplayName("delegates to type+unread query when both filters set")
        void delegatesToTypePlusUnreadQuery() {
            when(notificationRepo.findByRecipientAndTypeAndReadFalseOrderByCreatedAtDesc(
                    eq(alice), eq(Notification.Type.COMMENT), any()))
                .thenReturn(new PageImpl<>(List.of()));

            notificationService.getNotifications(
                    alice, PageRequest.of(0, 20), true, Notification.Type.COMMENT);

            verify(notificationRepo).findByRecipientAndTypeAndReadFalseOrderByCreatedAtDesc(
                    eq(alice), eq(Notification.Type.COMMENT), any());
        }
    }

    // ── markRead ──────────────────────────────────────────────

    @Nested
    @DisplayName("markRead")
    class MarkRead {

        @Test
        @DisplayName("marks notification as read when owned by user")
        void marksReadWhenOwnedByUser() {
            Notification n = Notification.builder()
                    .recipient(alice).actor(bob)
                    .type(Notification.Type.LIKE)
                    .message("test").read(false).build();
            when(notificationRepo.findById(1L)).thenReturn(Optional.of(n));

            notificationService.markRead(1L, alice);

            assertThat(n.isRead()).isTrue();
            verify(notificationRepo).save(n);
        }

        @Test
        @DisplayName("ignores mark-read when notification belongs to another user")
        void ignoresWhenBelongsToOtherUser() {
            Notification n = Notification.builder()
                    .recipient(bob).actor(alice)   // belongs to bob
                    .type(Notification.Type.LIKE)
                    .message("test").read(false).build();
            when(notificationRepo.findById(1L)).thenReturn(Optional.of(n));

            notificationService.markRead(1L, alice);   // alice tries to read bob's notif

            assertThat(n.isRead()).isFalse();
            verify(notificationRepo, never()).save(any());
        }
    }

    // ── delete ────────────────────────────────────────────────

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("deleteOne calls repository with correct args")
        void deleteOneCallsRepo() {
            notificationService.deleteOne(42L, alice);
            verify(notificationRepo).deleteByIdAndRecipient(42L, alice);
        }

        @Test
        @DisplayName("deleteAll calls repository with user")
        void deleteAllCallsRepo() {
            notificationService.deleteAll(alice);
            verify(notificationRepo).deleteAllByRecipient(alice);
        }
    }

    // ── countUnread ───────────────────────────────────────────

    @Test
    @DisplayName("countUnread delegates to repository")
    void countUnreadDelegates() {
        when(notificationRepo.countByRecipientAndReadFalse(alice)).thenReturn(7L);
        assertThat(notificationService.countUnread(alice)).isEqualTo(7L);
    }
}
