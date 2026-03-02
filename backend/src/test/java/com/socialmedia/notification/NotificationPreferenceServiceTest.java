package com.socialmedia.notification;

import com.socialmedia.notification.dto.NotificationPreferenceResponse;
import com.socialmedia.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationPreferenceService unit tests")
class NotificationPreferenceServiceTest {

    @Mock NotificationPreferenceRepository repo;

    @InjectMocks
    NotificationPreferenceService service;

    private User alice;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("a@t.com").password("x").build();
    }

    @Test
    @DisplayName("getPreferences returns one entry per type, defaulting to true for missing rows")
    void getPreferencesDefaults() {
        // Only one stored preference (LIKE = false); all others should default to true
        NotificationPreference likePref = NotificationPreference.builder()
                .user(alice).type(Notification.Type.LIKE).inApp(false).build();
        when(repo.findByUser(alice)).thenReturn(List.of(likePref));

        List<NotificationPreferenceResponse> result = service.getPreferences(alice);

        assertThat(result).hasSize(Notification.Type.values().length);

        NotificationPreferenceResponse likeEntry = result.stream()
                .filter(r -> r.getType() == Notification.Type.LIKE)
                .findFirst().orElseThrow();
        assertThat(likeEntry.isInApp()).isFalse();

        NotificationPreferenceResponse commentEntry = result.stream()
                .filter(r -> r.getType() == Notification.Type.COMMENT)
                .findFirst().orElseThrow();
        assertThat(commentEntry.isInApp()).isTrue();  // not stored → default true
    }

    @Test
    @DisplayName("isEnabled returns true when no row exists (opt-out model)")
    void isEnabledDefaultsTrue() {
        when(repo.findByUserAndType(alice, Notification.Type.MENTION)).thenReturn(Optional.empty());
        assertThat(service.isEnabled(alice, Notification.Type.MENTION)).isTrue();
    }

    @Test
    @DisplayName("isEnabled returns stored value when row exists")
    void isEnabledReturnsStoredValue() {
        NotificationPreference pref = NotificationPreference.builder()
                .user(alice).type(Notification.Type.FOLLOW).inApp(false).build();
        when(repo.findByUserAndType(alice, Notification.Type.FOLLOW)).thenReturn(Optional.of(pref));
        assertThat(service.isEnabled(alice, Notification.Type.FOLLOW)).isFalse();
    }

    @Test
    @DisplayName("updatePreference creates a new row when none exists")
    void updatePreferenceCreatesNewRow() {
        when(repo.findByUserAndType(alice, Notification.Type.SHARE)).thenReturn(Optional.empty());
        ArgumentCaptor<NotificationPreference> captor = ArgumentCaptor.forClass(NotificationPreference.class);
        when(repo.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferenceResponse result = service.updatePreference(alice, Notification.Type.SHARE, false);

        NotificationPreference saved = captor.getValue();
        assertThat(saved.getType()).isEqualTo(Notification.Type.SHARE);
        assertThat(saved.isInApp()).isFalse();
        assertThat(result.isInApp()).isFalse();
    }

    @Test
    @DisplayName("updatePreference updates existing row")
    void updatePreferenceUpdatesExistingRow() {
        NotificationPreference existing = NotificationPreference.builder()
                .user(alice).type(Notification.Type.LIKE).inApp(true).build();
        when(repo.findByUserAndType(alice, Notification.Type.LIKE)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        NotificationPreferenceResponse result = service.updatePreference(alice, Notification.Type.LIKE, false);

        assertThat(existing.isInApp()).isFalse();
        assertThat(result.isInApp()).isFalse();
    }
}
