package com.socialmedia.controller;

import com.socialmedia.dto.ApiResponse;
import com.socialmedia.dto.PostResponse;
import com.socialmedia.dto.UserResponse;
import com.socialmedia.dto.UserUpdateRequest;
import com.socialmedia.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = userService.getCurrentUserProfile();
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .status("success")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@Valid @RequestBody UserUpdateRequest request) {
        UserResponse response = userService.updateProfile(request);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .status("success")
                        .data(response)
                        .message("Profile updated successfully")
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserProfile(id);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .status("success")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByUsername(@PathVariable String username) {
        UserResponse response = userService.getUserProfileByUsername(username);
        return ResponseEntity.ok(
                ApiResponse.<UserResponse>builder()
                        .status("success")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getUserPosts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> posts = userService.getUserPosts(id, PageRequest.of(page, size));
        return ResponseEntity.ok(
                ApiResponse.<Page<PostResponse>>builder()
                        .status("success")
                        .data(posts)
                        .build()
        );
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> followUser(@PathVariable Long id) {
        userService.followUser(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("User followed successfully")
                        .build()
        );
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollowUser(@PathVariable Long id) {
        userService.unfollowUser(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("User unfollowed successfully")
                        .build()
        );
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowers(@PathVariable Long id) {
        List<UserResponse> followers = userService.getFollowers(id);
        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .status("success")
                        .data(followers)
                        .build()
        );
    }

    @GetMapping("/{id}/following")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getFollowing(@PathVariable Long id) {
        List<UserResponse> following = userService.getFollowing(id);
        return ResponseEntity.ok(
                ApiResponse.<List<UserResponse>>builder()
                        .status("success")
                        .data(following)
                        .build()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> results = userService.searchUsers(q, PageRequest.of(page, size));
        return ResponseEntity.ok(
                ApiResponse.<Page<UserResponse>>builder()
                        .status("success")
                        .data(results)
                        .build()
        );
    }
}
