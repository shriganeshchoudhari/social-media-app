package com.socialmedia.controller;

import com.socialmedia.dto.ApiResponse;
import com.socialmedia.dto.PostResponse;
import com.socialmedia.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/feed")
@RequiredArgsConstructor
public class FeedController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> feed = postService.getFeed(PageRequest.of(page, size));
        return ResponseEntity.ok(
                ApiResponse.<Page<PostResponse>>builder()
                        .status("success")
                        .data(feed)
                        .build()
        );
    }

    @GetMapping("/explore")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getExplore(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> posts = postService.getExplore(PageRequest.of(page, size));
        return ResponseEntity.ok(
                ApiResponse.<Page<PostResponse>>builder()
                        .status("success")
                        .data(posts)
                        .build()
        );
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getTrending(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> posts = postService.getTrending(PageRequest.of(page, size));
        return ResponseEntity.ok(
                ApiResponse.<Page<PostResponse>>builder()
                        .status("success")
                        .data(posts)
                        .build()
        );
    }
}
