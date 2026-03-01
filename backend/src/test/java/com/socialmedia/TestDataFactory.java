package com.socialmedia;

import com.socialmedia.comment.Comment;
import com.socialmedia.comment.CommentRepository;
import com.socialmedia.follow.Follow;
import com.socialmedia.follow.FollowRepository;
import com.socialmedia.post.Post;
import com.socialmedia.post.PostLike;
import com.socialmedia.post.PostLikeRepository;
import com.socialmedia.post.PostRepository;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Factory that creates and persists entities for integration tests.
 *
 * Usage in a test (class must extend BaseIntegrationTest):
 * 
 * <pre>
 *   {@literal @}Autowired TestDataFactory factory;
 *
 *   User alice = factory.user("alice");
 *   Post post  = factory.post(alice, "Hello world", Post.Privacy.PUBLIC);
 *   factory.like(bob, post);
 *   factory.follow(bob, alice);
 * </pre>
 *
 * All created entities are automatically rolled back at the end of each test
 * because the enclosing transaction is {@literal @}Transactional.
 */
@Component
@RequiredArgsConstructor
public class TestDataFactory {

    /** Default password used for all users created by this factory. */
    public static final String DEFAULT_PASSWORD = "Password1!";

    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final CommentRepository commentRepo;
    private final PostLikeRepository likeRepo;
    private final FollowRepository followRepo;
    private final PasswordEncoder passwordEncoder;

    // ── Users ─────────────────────────────────────────────────

    /** Creates a persisted user with {@code DEFAULT_PASSWORD}. */
    public User user(String username) {
        return user(username, username + "@test.com");
    }

    /**
     * Creates a persisted user with a custom email and {@code DEFAULT_PASSWORD}.
     */
    public User user(String username, String email) {
        return userRepo.save(User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .displayName(capitalize(username))
                .bio("Bio of " + username)
                .build());
    }

    // ── Posts ─────────────────────────────────────────────────

    /** Creates a PUBLIC post for the given author. */
    public Post post(User author, String content) {
        return post(author, content, Post.Privacy.PUBLIC);
    }

    /** Creates a post with the specified privacy level. */
    public Post post(User author, String content, Post.Privacy privacy) {
        Post p = postRepo.save(Post.builder()
                .author(author)
                .content(content)
                .privacy(privacy)
                .build());
        author.setPostsCount(author.getPostsCount() + 1);
        userRepo.save(author);
        return p;
    }

    // ── Likes ─────────────────────────────────────────────────

    /** Likes a post as the given user (idempotent). */
    public PostLike like(User user, Post post) {
        if (likeRepo.existsByPostAndUser(post, user)) {
            return likeRepo.findByPostAndUser(post, user).orElseThrow();
        }
        PostLike like = likeRepo.save(PostLike.builder().post(post).user(user).build());
        post.setLikesCount(post.getLikesCount() + 1);
        postRepo.save(post);
        return like;
    }

    // ── Comments ──────────────────────────────────────────────

    /** Adds a comment to a post. */
    public Comment comment(User author, Post post, String content) {
        Comment c = commentRepo.save(Comment.builder()
                .author(author).post(post).content(content).build());
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepo.save(post);
        return c;
    }

    // ── Follows ───────────────────────────────────────────────

    /** Makes {@code follower} follow {@code following} (idempotent). */
    public Follow follow(User follower, User following) {
        if (followRepo.existsByFollowerAndFollowing(follower, following)) {
            return followRepo.findByFollowerAndFollowing(follower, following).orElseThrow();
        }
        Follow f = followRepo.save(Follow.builder()
                .follower(follower).following(following).build());
        follower.setFollowingCount(follower.getFollowingCount() + 1);
        following.setFollowersCount(following.getFollowersCount() + 1);
        userRepo.saveAll(java.util.List.of(follower, following));
        return f;
    }

    // ── Helpers ───────────────────────────────────────────────

    private String capitalize(String s) {
        if (s == null || s.isEmpty())
            return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
