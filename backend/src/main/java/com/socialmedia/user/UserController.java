package com.socialmedia.user;

import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.post.PostService;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.dto.UpdateProfileRequest;
import com.socialmedia.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PostService postService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(UserService.toResponse(currentUser));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(currentUser, req));
    }

    /**
     * PUT /api/v1/users/me/password
     * Body: { currentPassword, newPassword }
     * Changes the current user's password after verifying the old one.
     */
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User currentUser,
            @RequestBody Map<String, String> body) {

        String current = body.getOrDefault("currentPassword", "");
        String next = body.getOrDefault("newPassword", "");

        if (!passwordEncoder.matches(current, currentUser.getPassword()))
            throw new ForbiddenException("Current password is incorrect");

        // Enforce the same strength rules as registration:
        // min 8 chars, at least one digit, one uppercase, one special character.
        if (next.length() < 8
                || !next.matches(".*\\d.*")
                || !next.matches(".*[A-Z].*")
                || !next.matches(".*[^a-zA-Z0-9].*")) {
            throw new IllegalArgumentException(
                    "New password must be at least 8 characters and contain "
                            + "at least one digit, one uppercase letter, and one special character.");
        }

        currentUser.setPassword(passwordEncoder.encode(next));
        userRepository.save(currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.search(q, PageRequest.of(page, size)));
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }

    @GetMapping("/{username}/posts")
    public ResponseEntity<Page<PostResponse>> getPostsByUser(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getByUsername(username, currentUser, PageRequest.of(page, size)));
    }
}
