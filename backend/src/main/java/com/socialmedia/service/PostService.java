package com.socialmedia.service;

import com.socialmedia.dto.CommentRequest;
import com.socialmedia.dto.CommentResponse;
import com.socialmedia.dto.PostRequest;
import com.socialmedia.dto.PostResponse;
import com.socialmedia.entity.Comment;
import com.socialmedia.entity.Follow;
import com.socialmedia.entity.Like;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.repository.CommentRepository;
import com.socialmedia.repository.FollowRepository;
import com.socialmedia.repository.LikeRepository;
import com.socialmedia.repository.PostRepository;
import com.socialmedia.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final FollowRepository followRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository,
                       CommentRepository commentRepository,
                       LikeRepository likeRepository,
                       FollowRepository followRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.followRepository = followRepository;
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User getCurrentUserIfAuthenticated() {
        try {
            org.springframework.security.core.Authentication auth =
                    SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }
            return userRepository.findByUsername(auth.getName()).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    // ─── Post CRUD ──────────────────────────────────────────────────────────────

    @Transactional
    public PostResponse createPost(PostRequest request) {
        User user = getCurrentUser();

        Set<String> hashtags = extractHashtags(request.getContent());

        Post post = new Post();
        post.setUser(user);
        post.setContent(request.getContent());
        post.setPrivacyLevel(request.getPrivacyLevel() != null ? request.getPrivacyLevel() : "public");
        post.setLocation(request.getLocation());
        post.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : new HashSet<>());
        post.setHashtags(hashtags);

        post = postRepository.save(post);

        user.setPostsCount(user.getPostsCount() + 1);
        userRepository.save(user);

        return toPostResponse(post, user);
    }

    public PostResponse getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User currentUser = getCurrentUserIfAuthenticated();
        post.setViewsCount(post.getViewsCount() + 1);
        postRepository.save(post);

        return toPostResponse(post, currentUser);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User currentUser = getCurrentUser();
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only edit your own posts");
        }

        post.setContent(request.getContent());
        if (request.getPrivacyLevel() != null) post.setPrivacyLevel(request.getPrivacyLevel());
        post.setLocation(request.getLocation());
        post.setIsEdited(true);
        post.setEditedAt(LocalDateTime.now());
        post.setHashtags(extractHashtags(request.getContent()));
        if (request.getImageUrls() != null) post.setImageUrls(request.getImageUrls());

        post = postRepository.save(post);
        return toPostResponse(post, currentUser);
    }

    @Transactional
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User currentUser = getCurrentUser();
        if (!post.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own posts");
        }

        postRepository.delete(post);

        currentUser.setPostsCount(Math.max(0, currentUser.getPostsCount() - 1));
        userRepository.save(currentUser);
    }

    // ─── Feed ───────────────────────────────────────────────────────────────────

    public Page<PostResponse> getFeed(Pageable pageable) {
        User currentUser = getCurrentUser();

        List<Follow> followList = followRepository.findByFollower(currentUser);
        List<User> followedUsers = followList.stream()
                .map(Follow::getFollowing)
                .collect(Collectors.toList());
        followedUsers.add(currentUser);

        if (followedUsers.size() <= 1) {
            return postRepository.findPublicPostsOrderByCreatedAtDesc(pageable)
                    .map(post -> toPostResponse(post, currentUser));
        }

        return postRepository.findByUsersOrderByCreatedAtDesc(followedUsers, pageable)
                .map(post -> toPostResponse(post, currentUser));
    }

    public Page<PostResponse> getExplore(Pageable pageable) {
        User currentUser = getCurrentUserIfAuthenticated();
        return postRepository.findPublicPostsOrderByCreatedAtDesc(pageable)
                .map(post -> toPostResponse(post, currentUser));
    }

    public Page<PostResponse> getTrending(Pageable pageable) {
        User currentUser = getCurrentUserIfAuthenticated();
        return postRepository.findTrendingPosts(pageable)
                .map(post -> toPostResponse(post, currentUser));
    }

    // ─── User Posts ─────────────────────────────────────────────────────────────

    public Page<PostResponse> getUserPosts(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User currentUser = getCurrentUserIfAuthenticated();
        return postRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(post -> toPostResponse(post, currentUser));
    }

    // ─── Likes ──────────────────────────────────────────────────────────────────

    @Transactional
    public void likePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User currentUser = getCurrentUser();

        if (!likeRepository.existsByPostAndUser(post, currentUser)) {
            Like like = new Like(post, currentUser);
            likeRepository.save(like);
            post.setLikesCount(post.getLikesCount() + 1);
            postRepository.save(post);
        }
    }

    @Transactional
    public void unlikePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User currentUser = getCurrentUser();

        if (likeRepository.existsByPostAndUser(post, currentUser)) {
            likeRepository.deleteByPostAndUser(post, currentUser);
            post.setLikesCount(Math.max(0, post.getLikesCount() - 1));
            postRepository.save(post);
        }
    }

    // ─── Comments ───────────────────────────────────────────────────────────────

    @Transactional
    public CommentResponse addComment(Long postId, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        User currentUser = getCurrentUser();

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(currentUser);
        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);

        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        return toCommentResponse(comment);
    }

    public List<CommentResponse> getComments(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        return commentRepository.findByPostOrderByCreatedAtAsc(post)
                .stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        User currentUser = getCurrentUser();
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own comments");
        }

        commentRepository.delete(comment);
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    // ─── Mapping helpers ────────────────────────────────────────────────────────

    private PostResponse toPostResponse(Post post, User currentUser) {
        boolean isLiked = currentUser != null && likeRepository.existsByPostAndUser(post, currentUser);

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .username(post.getUser().getUsername())
                .displayName(post.getUser().getDisplayName())
                .profilePictureUrl(post.getUser().getProfilePictureUrl())
                .content(post.getContent())
                .privacyLevel(post.getPrivacyLevel())
                .location(post.getLocation())
                .isEdited(post.getIsEdited())
                .editedAt(post.getEditedAt())
                .likesCount(post.getLikesCount())
                .commentsCount(post.getCommentsCount())
                .sharesCount(post.getSharesCount())
                .viewsCount(post.getViewsCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .imageUrls(post.getImageUrls())
                .hashtags(post.getHashtags())
                .isLikedByCurrentUser(isLiked)
                .build();
    }

    private CommentResponse toCommentResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getUsername())
                .displayName(comment.getUser().getDisplayName())
                .profilePictureUrl(comment.getUser().getProfilePictureUrl())
                .content(comment.getContent())
                .likesCount(comment.getLikesCount())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }

    private Set<String> extractHashtags(String content) {
        Set<String> hashtags = new HashSet<>();
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);
        while (matcher.find()) {
            hashtags.add(matcher.group(1).toLowerCase());
        }
        return hashtags;
    }
}
