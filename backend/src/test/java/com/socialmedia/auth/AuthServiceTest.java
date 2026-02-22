package com.socialmedia.auth;

import com.socialmedia.auth.dto.AuthResponse;
import com.socialmedia.auth.dto.LoginRequest;
import com.socialmedia.auth.dto.RegisterRequest;
import com.socialmedia.exception.ConflictException;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService – unit tests")
class AuthServiceTest {

    @Mock UserRepository         userRepository;
    @Mock PasswordEncoder        passwordEncoder;
    @Mock JwtService             jwtService;
    @Mock AuthenticationManager  authManager;

    @InjectMocks AuthService authService;

    private RegisterRequest validRegisterRequest;
    private User            savedUser;

    @BeforeEach
    void setUp() {
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setUsername("alice");
        validRegisterRequest.setEmail("alice@example.com");
        validRegisterRequest.setPassword("Password1!");
        validRegisterRequest.setDisplayName("Alice Wonder");

        savedUser = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@example.com")
                .password("hashed")
                .displayName("Alice Wonder")
                .build();
    }

    // ── register ──────────────────────────────────────────────

    @Test
    @DisplayName("register: success → returns JWT token")
    void register_success() {
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(validRegisterRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    @DisplayName("register: duplicate username → ConflictException")
    void register_duplicateUsername_throwsConflict() {
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("alice");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: duplicate email → ConflictException")
    void register_duplicateEmail_throwsConflict() {
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(validRegisterRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("alice@example.com");
    }

    // ── login ─────────────────────────────────────────────────

    @Test
    @DisplayName("login: valid credentials → returns JWT")
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("alice");
        req.setPassword("Password1!");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(savedUser));
        when(authManager.authenticate(any())).thenReturn(
                new UsernamePasswordAuthenticationToken(savedUser, null, savedUser.getAuthorities()));
        when(jwtService.generateToken(savedUser)).thenReturn("jwt-token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
    }

    @Test
    @DisplayName("login: unknown user → BadCredentialsException")
    void login_unknownUser_throwsBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("nobody");
        req.setPassword("whatever");

        when(userRepository.findByUsername("nobody")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("nobody")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("login: wrong password → BadCredentialsException")
    void login_wrongPassword_throwsBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setUsernameOrEmail("alice");
        req.setPassword("WrongPassword!");

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(savedUser));
        when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }
}
