package com.socialmedia.post;

import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<PostResponse> create(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreatePostRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(currentUser, req));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<PostResponse>> feed(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(postService.getFeed(currentUser, PageRequest.of(page, size)));
    }

    /**
     * Keyset-paginated feed — lower latency on deep pages.
     * GET /api/v1/posts/feed/cursor?before=2024-03-01T10:00:00&size=20
     * Response: { posts: [...], nextCursor: "ISO-8601" | null }
     * Pass nextCursor as `before` in the next request. null = end of feed.
     */
    @GetMapping("/feed/cursor")
    public ResponseEntity<java.util.Map<String, Object>> feedCursor(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime before,
            @RequestParam(defaultValue = "20") int size) {

        LocalDateTime cursor = before != null ? before : LocalDateTime.now();
        List<PostResponse> posts = postService.getFeedBefore(currentUser, cursor, Math.min(size, 50));
        String nextCursor = posts.isEmpty() ? null : posts.get(posts.size() - 1).getCreatedAt().toString();
        return ResponseEntity.ok(java.util.Map.of(
                "posts",      posts,
                "nextCursor", nextCursor != null ? nextCursor : "",
                "hasMore",    !posts.isEmpty()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.getById(id, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreatePostRequest req) {
        return ResponseEntity.ok(postService.update(id, currentUser, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        postService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PostResponse> like(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.like(id, currentUser));
    }

    /**
     * POST /api/v1/posts/{id}/share
     * Body (optional): { "content": "My take on this..." }
     * Creates a new share post and notifies the original author.
     */
    @PostMapping("/{id}/share")
    public ResponseEntity<PostResponse> share(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String quote = body != null ? body.get("content") : null;
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(postService.share(id, currentUser, quote));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<PostResponse> unlike(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.unlike(id, currentUser));
    }
}
