package com.socialmedia.bookmark;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.post.Post;
import com.socialmedia.post.PostLikeRepository;
import com.socialmedia.post.PostRepository;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import com.socialmedia.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;

    /**
     * Toggle bookmark on a post.
     * 
     * @return Map with keys "bookmarked" (boolean) indicating the new state.
     */
    @Transactional
    public Map<String, Object> toggle(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        return bookmarkRepository.findByUserAndPost(currentUser, post)
                .map(existing -> {
                    bookmarkRepository.delete(existing);
                    log.debug("Bookmark removed: postId={} user={}", postId, currentUser.getUsername());
                    return Map.<String, Object>of("bookmarked", false);
                })
                .orElseGet(() -> {
                    bookmarkRepository.save(Bookmark.builder().user(currentUser).post(post).build());
                    log.debug("Bookmark added: postId={} user={}", postId, currentUser.getUsername());
                    return Map.<String, Object>of("bookmarked", true);
                });
    }

    /** Paginated list of posts bookmarked by the current user. */
    @Transactional(readOnly = true)
    public Page<PostResponse> getBookmarks(User currentUser, Pageable pageable) {
        return bookmarkRepository.findPostsByUser(currentUser, pageable)
                .map(p -> toResponse(p, currentUser));
    }

    /** Check whether the current user has bookmarked a given post. */
    @Transactional(readOnly = true)
    public boolean isBookmarked(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
        return bookmarkRepository.existsByUserAndPost(currentUser, post);
    }

    // ── Helpers ───────────────────────────────────────────────

    private PostResponse toResponse(Post p, User currentUser) {
        boolean liked = postLikeRepository.existsByPostAndUser(p, currentUser);
        return PostResponse.builder()
                .id(p.getId())
                .content(p.getContent())
                .imageUrl(p.getImageUrl())
                .privacy(p.getPrivacy())
                .author(UserService.toResponse(p.getAuthor()))
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .likedByCurrentUser(liked)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
