package com.socialmedia.post;

import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{id}/like")
    public ResponseEntity<PostResponse> unlike(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(postService.unlike(id, currentUser));
    }
}
