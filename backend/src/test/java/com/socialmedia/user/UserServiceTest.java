package com.socialmedia.user;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.user.dto.UpdateProfileRequest;
import com.socialmedia.user.dto.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService – unit tests")
class UserServiceTest {

    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    private User alice;

    @BeforeEach
    void setUp() {
        alice = User.builder()
                .id(1L).username("alice").email("alice@test.com")
                .password("x").displayName("Alice").bio("Hello").build();
    }

    @Test
    @DisplayName("getByUsername: found → returns mapped response")
    void getByUsername_found() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(alice));

        UserResponse resp = userService.getByUsername("alice");

        assertThat(resp.getUsername()).isEqualTo("alice");
        assertThat(resp.getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    @DisplayName("getByUsername: not found → ResourceNotFoundException")
    void getByUsername_notFound() {
        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getByUsername("nobody"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("updateProfile: only non-null fields are applied")
    void updateProfile_partialUpdate() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setBio("Updated bio");
        // displayName and avatarUrl are left null

        when(userRepository.save(alice)).thenReturn(alice);

        UserResponse resp = userService.updateProfile(alice, req);

        assertThat(alice.getBio()).isEqualTo("Updated bio");
        assertThat(alice.getDisplayName()).isEqualTo("Alice");   // unchanged
        verify(userRepository).save(alice);
    }

    @Test
    @DisplayName("updateProfile: all fields set → all fields updated")
    void updateProfile_fullUpdate() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setDisplayName("Alice W.");
        req.setBio("New bio");
        req.setAvatarUrl("https://cdn.example.com/alice.jpg");

        when(userRepository.save(alice)).thenReturn(alice);

        userService.updateProfile(alice, req);

        assertThat(alice.getDisplayName()).isEqualTo("Alice W.");
        assertThat(alice.getBio()).isEqualTo("New bio");
        assertThat(alice.getAvatarUrl()).isEqualTo("https://cdn.example.com/alice.jpg");
    }
}
