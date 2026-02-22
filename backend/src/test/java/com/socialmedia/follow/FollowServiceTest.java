package com.socialmedia.follow;

import com.socialmedia.exception.ConflictException;
import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.notification.NotificationEvent;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FollowService – unit tests")
class FollowServiceTest {

    @Mock FollowRepository         followRepository;
    @Mock UserRepository           userRepository;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks FollowService followService;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("a@t.com").password("x").build();
        bob   = User.builder().id(2L).username("bob").email("b@t.com").password("x").build();
    }

    // ── follow ────────────────────────────────────────────────

    @Test
    @DisplayName("follow: success → saves Follow and fires event")
    void follow_success() {
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(followRepository.existsByFollowerAndFollowing(alice, bob)).thenReturn(false);

        followService.follow(alice, "bob");

        verify(followRepository).save(any(Follow.class));
        verify(eventPublisher).publishEvent(any(NotificationEvent.class));
        assertThat(alice.getFollowingCount()).isEqualTo(1);
        assertThat(bob.getFollowersCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("follow: self-follow → ForbiddenException")
    void follow_self_throwsForbidden() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        assertThatThrownBy(() -> followService.follow(alice, "alice"))
                .isInstanceOf(ForbiddenException.class);

        verify(followRepository, never()).save(any());
    }

    @Test
    @DisplayName("follow: already following → ConflictException")
    void follow_alreadyFollowing_throwsConflict() {
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(followRepository.existsByFollowerAndFollowing(alice, bob)).thenReturn(true);

        assertThatThrownBy(() -> followService.follow(alice, "bob"))
                .isInstanceOf(ConflictException.class);
    }

    // ── unfollow ──────────────────────────────────────────────

    @Test
    @DisplayName("unfollow: success → removes Follow and adjusts counters")
    void unfollow_success() {
        alice.setFollowingCount(1);
        bob.setFollowersCount(1);
        Follow follow = Follow.builder().follower(alice).following(bob).build();

        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(followRepository.findByFollowerAndFollowing(alice, bob)).thenReturn(Optional.of(follow));

        followService.unfollow(alice, "bob");

        verify(followRepository).delete(follow);
        assertThat(alice.getFollowingCount()).isEqualTo(0);
        assertThat(bob.getFollowersCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("unfollow: not currently following → ConflictException")
    void unfollow_notFollowing_throwsConflict() {
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(bob));
        when(followRepository.findByFollowerAndFollowing(alice, bob)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> followService.unfollow(alice, "bob"))
                .isInstanceOf(ConflictException.class);
    }
}
