package com.socialmedia.post;

import com.socialmedia.exception.ConflictException;
import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.follow.FollowRepository;
import com.socialmedia.notification.NotificationEvent;
import com.socialmedia.post.dto.CreatePostRequest;
import com.socialmedia.post.dto.PostResponse;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PostService – unit tests")
class PostServiceTest {

    @Mock PostRepository          postRepository;
    @Mock PostLikeRepository      postLikeRepository;
    @Mock UserRepository          userRepository;
    @Mock FollowRepository        followRepository;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks PostService postService;

    private User alice;
    private User bob;
    private Post post;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("a@test.com").password("x").displayName("Alice").build();
        bob   = User.builder().id(2L).username("bob").email("b@test.com").password("x").displayName("Bob").build();

        post = Post.builder()
                .id(10L)
                .content("Hello world #test")
                .privacy(Post.Privacy.PUBLIC)
                .author(alice)
                .likesCount(0)
                .commentsCount(0)
                .build();
    }

    // ── create ────────────────────────────────────────────────

    @Test
    @DisplayName("create: saves post and bumps author postsCount")
    void create_success() {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("Hello world");
        req.setPrivacy(Post.Privacy.PUBLIC);

        when(postRepository.save(any(Post.class))).thenReturn(post);
        when(userRepository.save(alice)).thenReturn(alice);

        PostResponse resp = postService.create(alice, req);

        assertThat(resp.getContent()).isEqualTo("Hello world #test");
        verify(userRepository).save(alice);
        assertThat(alice.getPostsCount()).isEqualTo(1);
    }

    // ── getById ───────────────────────────────────────────────

    @Test
    @DisplayName("getById: existing post → response with liked flag")
    void getById_found() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByPostAndUser(post, alice)).thenReturn(true);

        PostResponse resp = postService.getById(10L, alice);

        assertThat(resp.getId()).isEqualTo(10L);
        assertThat(resp.isLikedByCurrentUser()).isTrue();
    }

    @Test
    @DisplayName("getById: non-existent id → ResourceNotFoundException")
    void getById_notFound() {
        when(postRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getById(999L, alice))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── delete ────────────────────────────────────────────────

    @Test
    @DisplayName("delete: owner can delete their own post")
    void delete_byOwner_success() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        alice.setPostsCount(1);

        postService.delete(10L, alice);

        verify(postRepository).delete(post);
        assertThat(alice.getPostsCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("delete: non-owner → ForbiddenException")
    void delete_byStranger_throwsForbidden() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.delete(10L, bob))
                .isInstanceOf(ForbiddenException.class);

        verify(postRepository, never()).delete(any());
    }

    // ── like / unlike ─────────────────────────────────────────

    @Test
    @DisplayName("like: increments likesCount and fires NotificationEvent")
    void like_success() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByPostAndUser(post, bob)).thenReturn(false);
        when(postRepository.save(post)).thenReturn(post);

        PostResponse resp = postService.like(10L, bob);

        assertThat(resp.getLikesCount()).isEqualTo(1);
        verify(postLikeRepository).save(any(PostLike.class));
        verify(eventPublisher).publishEvent(any(NotificationEvent.class));
    }

    @Test
    @DisplayName("like: already liked → ConflictException")
    void like_alreadyLiked_throwsConflict() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postLikeRepository.existsByPostAndUser(post, bob)).thenReturn(true);

        assertThatThrownBy(() -> postService.like(10L, bob))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    @DisplayName("unlike: decrements likesCount")
    void unlike_success() {
        post.setLikesCount(3);
        PostLike existingLike = PostLike.builder().post(post).user(bob).build();

        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostAndUser(post, bob)).thenReturn(Optional.of(existingLike));
        when(postRepository.save(post)).thenReturn(post);

        PostResponse resp = postService.unlike(10L, bob);

        assertThat(resp.getLikesCount()).isEqualTo(2);
        verify(postLikeRepository).delete(existingLike);
    }

    // ── getFeed ───────────────────────────────────────────────

    @Test
    @DisplayName("getFeed: returns paginated posts for current user")
    void getFeed_returnsPosts() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Post> page = new PageImpl<>(List.of(post), pageable, 1);

        when(followRepository.findFollowingIds(alice)).thenReturn(List.of());
        when(postRepository.findFeed(eq(alice), anyList(), eq(pageable))).thenReturn(page);
        when(postLikeRepository.existsByPostAndUser(post, alice)).thenReturn(false);

        Page<PostResponse> result = postService.getFeed(alice, pageable);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(10L);
    }

    // ── search ────────────────────────────────────────────────

    @Test
    @DisplayName("search: delegates to repository and maps results")
    void search_returnsMappedPage() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Post> page = new PageImpl<>(List.of(post), pageable, 1);

        when(postRepository.search(eq("hello"), eq(alice), eq(pageable))).thenReturn(page);
        when(postLikeRepository.existsByPostAndUser(post, alice)).thenReturn(false);

        Page<PostResponse> result = postService.search("hello", alice, pageable);

        assertThat(result.getContent()).hasSize(1);
    }
}
