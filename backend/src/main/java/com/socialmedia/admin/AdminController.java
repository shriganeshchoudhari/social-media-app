package com.socialmedia.admin;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.post.PostRepository;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import com.socialmedia.user.UserService;
import com.socialmedia.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only endpoints — all routes require ROLE_ADMIN.
 *
 * GET  /api/v1/admin/stats                   — platform counts
 * GET  /api/v1/admin/users?q=&page=&size=    — paginated user list + search
 * PUT  /api/v1/admin/users/{id}/role         — promote/demote user role
 * DELETE /api/v1/admin/users/{id}            — delete a user account
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    // ── Stats ──────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        long totalUsers   = userRepository.count();
        long adminUsers   = userRepository.countByRole(User.Role.ADMIN);
        long totalPosts   = postRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalUsers",  totalUsers,
                "adminUsers",  adminUsers,
                "regularUsers", totalUsers - adminUsers,
                "totalPosts",  totalPosts
        ));
    }

    // ── User management ────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> listUsers(
            @RequestParam(defaultValue = "")   String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pr = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = q.isBlank()
                ? userRepository.findAll(pr)
                : userRepository.search(q, pr);

        return ResponseEntity.ok(users.map(UserService::toResponse));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        String roleStr = body.getOrDefault("role", "USER").toUpperCase();
        user.setRole(User.Role.valueOf(roleStr)); // throws if invalid
        userRepository.save(user);
        return ResponseEntity.ok(UserService.toResponse(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
