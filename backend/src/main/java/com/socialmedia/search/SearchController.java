package com.socialmedia.search;

import com.socialmedia.post.PostService;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import com.socialmedia.user.UserService;
import com.socialmedia.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    private final PostService postService;

    /**
     * GET /api/v1/search/users?q=alice&page=0&size=20
     * Searches username and displayName (case-insensitive, LIKE).
     */
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(userService.search(q, PageRequest.of(page, size)));
    }

    /**
     * GET /api/v1/search/posts?q=hello&page=0&size=20
     * Searches post content (case-insensitive, LIKE); PUBLIC posts only for other users.
     */
    @GetMapping("/posts")
    public ResponseEntity<Page<PostResponse>> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(postService.search(q, currentUser, PageRequest.of(page, size)));
    }

    /**
     * GET /api/v1/search/hashtags?q=travel&page=0&size=20
     * Finds PUBLIC posts whose content contains #<q>.
     */
    @GetMapping("/hashtags")
    public ResponseEntity<Page<PostResponse>> searchHashtags(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(postService.searchByHashtag(q, currentUser, PageRequest.of(page, size)));
    }
}
