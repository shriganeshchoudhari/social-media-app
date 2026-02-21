package com.socialmedia.controller;

import com.socialmedia.dto.ApiResponse;
import com.socialmedia.dto.CommentRequest;
import com.socialmedia.dto.CommentResponse;
import com.socialmedia.dto.PostRequest;
import com.socialmedia.dto.PostResponse;
import com.socialmedia.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<PostResponse>builder()
                        .status("success")
                        .data(response)
                        .message("Post created successfully")
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(@PathVariable Long id) {
        PostResponse response = postService.getPost(id);
        return ResponseEntity.ok(
                ApiResponse.<PostResponse>builder()
                        .status("success")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        PostResponse response = postService.updatePost(id, request);
        return ResponseEntity.ok(
                ApiResponse.<PostResponse>builder()
                        .status("success")
                        .data(response)
                        .message("Post updated successfully")
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("Post deleted successfully")
                        .build()
        );
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable Long id) {
        postService.likePost(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("Post liked")
                        .build()
        );
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlikePost(@PathVariable Long id) {
        postService.unlikePost(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("Post unliked")
                        .build()
        );
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request) {
        CommentResponse comment = postService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<CommentResponse>builder()
                        .status("success")
                        .data(comment)
                        .message("Comment added")
                        .build()
        );
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(@PathVariable Long id) {
        List<CommentResponse> comments = postService.getComments(id);
        return ResponseEntity.ok(
                ApiResponse.<List<CommentResponse>>builder()
                        .status("success")
                        .data(comments)
                        .build()
        );
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        postService.deleteComment(postId, commentId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("success")
                        .message("Comment deleted")
                        .build()
        );
    }
}
