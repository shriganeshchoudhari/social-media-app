package com.socialmedia.follow;

import com.socialmedia.user.User;
import com.socialmedia.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users/{username}")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    @PostMapping("/follow")
    public ResponseEntity<Map<String, String>> follow(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        followService.follow(currentUser, username);
        return ResponseEntity.ok(Map.of("message", "Now following " + username));
    }

    @DeleteMapping("/follow")
    public ResponseEntity<Map<String, String>> unfollow(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        followService.unfollow(currentUser, username);
        return ResponseEntity.ok(Map.of("message", "Unfollowed " + username));
    }

    @GetMapping("/followers")
    public ResponseEntity<Page<UserResponse>> followers(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowers(username, PageRequest.of(page, size)));
    }

    @GetMapping("/following")
    public ResponseEntity<Page<UserResponse>> following(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(followService.getFollowing(username, PageRequest.of(page, size)));
    }

    @GetMapping("/is-following")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable String username,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(Map.of("following", followService.isFollowing(currentUser, username)));
    }
}
