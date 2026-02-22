package com.socialmedia.auth;

import com.socialmedia.auth.dto.AuthResponse;
import com.socialmedia.auth.dto.LoginRequest;
import com.socialmedia.auth.dto.RegisterRequest;
import com.socialmedia.exception.ConflictException;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import com.socialmedia.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new ConflictException("Username already taken: " + req.getUsername());
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already registered: " + req.getEmail());

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .displayName(req.getDisplayName())
                .build();

        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user), UserService.toResponse(user));
    }

    public AuthResponse login(LoginRequest req) {
        // Resolve username from username-or-email
        User user = userRepository.findByUsername(req.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(req.getUsernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), req.getPassword()));
        } catch (Exception ex) {
            throw new BadCredentialsException("Bad credentials");
        }

        return new AuthResponse(jwtService.generateToken(user), UserService.toResponse(user));
    }
}
