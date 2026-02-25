package com.socialmedia.post;

import com.socialmedia.exception.ConflictException;
import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.follow.FollowRepository;
import com.socialmedia.notification.Notification;
import com.socialmedia.notification.NotificationEvent;
import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import com.socialmedia.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public PostResponse create(User author, CreatePostRequest req) {
        Post post = Post.builder()
                .content(req.getContent())
                .imageUrl(req.getImageUrl())
                .privacy(req.getPrivacy() != null ? req.getPrivacy() : Post.Privacy.PUBLIC)
                .author(author)
                .build();
        post = postRepository.save(post);

        author.setPostsCount(author.getPostsCount() + 1);
        userRepository.save(author);

        return toResponse(post, false);
    }

    @Transactional(readOnly = true)
    public PostResponse getById(Long id, User currentUser) {
        Post post = findPost(id);
        boolean liked = postLikeRepository.existsByPostAndUser(post, currentUser);
        return toResponse(post, liked);
    }

    @Transactional
    public PostResponse update(Long id, User currentUser, CreatePostRequest req) {
        Post post = findPost(id);
        if (!post.getAuthor().getId().equals(currentUser.getId()))
            throw new ForbiddenException("You can only edit your own posts");
        post.setContent(req.getContent());
        if (req.getPrivacy() != null) post.setPrivacy(req.getPrivacy());
        post = postRepository.save(post);
        boolean liked = postLikeRepository.existsByPostAndUser(post, currentUser);
        return toResponse(post, liked);
    }

    @Transactional
    public void delete(Long id, User currentUser) {
        Post post = findPost(id);
        if (!post.getAuthor().getId().equals(currentUser.getId()))
            throw new ForbiddenException("You can only delete your own posts");
        postRepository.delete(post);

        currentUser.setPostsCount(Math.max(0, currentUser.getPostsCount() - 1));
        userRepository.save(currentUser);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFeed(User currentUser, Pageable pageable) {
        List<Long> followingIds = followRepository.findFollowingIds(currentUser);
        return postRepository.findFeed(currentUser, followingIds, pageable)
                .map(p -> toResponse(p, postLikeRepository.existsByPostAndUser(p, currentUser)));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getByUsername(String username, User currentUser, Pageable pageable) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return postRepository.findByAuthorOrderByCreatedAtDesc(author, pageable)
                .map(p -> toResponse(p, postLikeRepository.existsByPostAndUser(p, currentUser)));
    }

    @Transactional
    public PostResponse like(Long id, User currentUser) {
        Post post = findPost(id);
        if (postLikeRepository.existsByPostAndUser(post, currentUser))
            throw new ConflictException("Post already liked");
        postLikeRepository.save(PostLike.builder().post(post).user(currentUser).build());
        post.setLikesCount(post.getLikesCount() + 1);
        PostResponse response = toResponse(postRepository.save(post), true);

        eventPublisher.publishEvent(new NotificationEvent(
                this, currentUser, post.getAuthor(),
                Notification.Type.LIKE, post.getId(),
                currentUser.getUsername() + " liked your post"));

        return response;
    }

    @Transactional
    public PostResponse unlike(Long id, User currentUser) {
        Post post = findPost(id);
        PostLike like = postLikeRepository.findByPostAndUser(post, currentUser)
                .orElseThrow(() -> new ConflictException("Post not liked yet"));
        postLikeRepository.delete(like);
        post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
        return toResponse(postRepository.save(post), false);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> search(String q, User currentUser, Pageable pageable) {
        return postRepository.search(q, currentUser, pageable)
                .map(p -> toResponse(p, postLikeRepository.existsByPostAndUser(p, currentUser)));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchByHashtag(String tag, User currentUser, Pageable pageable) {
        // Strip leading '#' if provided
        String cleanTag = tag.startsWith("#") ? tag.substring(1) : tag;
        return postRepository.findByHashtag(cleanTag, currentUser, pageable)
                .map(p -> toResponse(p, postLikeRepository.existsByPostAndUser(p, currentUser)));
    }

    // ── Helpers ───────────────────────────────────────────────

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
    }

    private PostResponse toResponse(Post p, boolean likedByCurrentUser) {
        return PostResponse.builder()
                .id(p.getId())
                .content(p.getContent())
                .imageUrl(p.getImageUrl())
                .privacy(p.getPrivacy())
                .author(UserService.toResponse(p.getAuthor()))
                .likesCount(p.getLikesCount())
                .commentsCount(p.getCommentsCount())
                .likedByCurrentUser(likedByCurrentUser)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
