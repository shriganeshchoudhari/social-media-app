package com.socialmedia.bookmark;

import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    /**
     * POST /api/v1/posts/{id}/bookmark
     * Toggle bookmark on a post. Returns {"status":"success","data":{"bookmarked":true|false}}
     */
    @PostMapping("/posts/{id}/bookmark")
    public ResponseEntity<Map<String, Object>> toggle(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Map<String, Object> result = bookmarkService.toggle(id, currentUser);
        return ResponseEntity.ok(Map.of("status", "success", "data", result));
    }

    /**
     * GET /api/v1/users/me/bookmarks?page=0&size=20
     * Returns paginated bookmarked posts for the current user.
     */
    @GetMapping("/users/me/bookmarks")
    public ResponseEntity<Map<String, Object>> getBookmarks(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PostResponse> bookmarks = bookmarkService.getBookmarks(
                currentUser, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("status", "success", "data", bookmarks));
    }
}
