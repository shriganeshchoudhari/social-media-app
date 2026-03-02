package com.socialmedia.comment;

import com.socialmedia.comment.dto.CommentResponse;
import com.socialmedia.comment.dto.CreateCommentRequest;
import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.notification.Notification;
import com.socialmedia.notification.NotificationEvent;
import com.socialmedia.post.Post;
import com.socialmedia.post.PostRepository;
import com.socialmedia.user.User;
import com.socialmedia.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CommentResponse create(Long postId, User author, CreateCommentRequest req) {
        Post post = findPost(postId);

        Comment.CommentBuilder builder = Comment.builder()
                .content(req.getContent())
                .post(post)
                .author(author);

        // ── Reply threading ───────────────────────────────────
        Comment parentComment = null;
        if (req.getParentCommentId() != null) {
            parentComment = commentRepository.findById(req.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent comment not found: " + req.getParentCommentId()));
            // Ensure the parent comment belongs to the same post
            if (!parentComment.getPost().getId().equals(postId)) {
                throw new ForbiddenException("Parent comment does not belong to this post");
            }
            builder.parentComment(parentComment);
        }

        Comment comment = commentRepository.save(builder.build());

        // Increment post comment counter
        post.setCommentsCount(post.getCommentsCount() + 1);
        postRepository.save(post);

        // ── Notifications ──────────────────────────────────────
        // Always notify the post author about new comments on their post
        eventPublisher.publishEvent(new NotificationEvent(
                this, author, post.getAuthor(),
                Notification.Type.COMMENT, post.getId(),
                author.getUsername() + " commented on your post"));

        // Additionally notify the parent comment's author about the reply
        // (only if different from the post author, to avoid duplicate notifications)
        if (parentComment != null) {
            User parentAuthor = parentComment.getAuthor();
            boolean alreadyNotifiedAsPostAuthor =
                    parentAuthor.getId().equals(post.getAuthor().getId());

            if (!alreadyNotifiedAsPostAuthor) {
                eventPublisher.publishEvent(new NotificationEvent(
                        this, author, parentAuthor,
                        Notification.Type.REPLY, post.getId(),
                        author.getUsername() + " replied to your comment"));
            }
        }

        return toResponse(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> getByPost(Long postId, Pageable pageable) {
        Post post = findPost(postId);
        return commentRepository.findByPostOrderByCreatedAtAsc(post, pageable)
                .map(this::toResponse);
    }

    @Transactional
    public void delete(Long postId, Long commentId, User currentUser) {
        findPost(postId); // validates post exists
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getAuthor().getId().equals(currentUser.getId()))
            throw new ForbiddenException("You can only delete your own comments");

        Post post = comment.getPost();
        commentRepository.delete(comment);

        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepository.save(post);
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));
    }

    private CommentResponse toResponse(Comment c) {
        Comment parent = c.getParentComment();
        return CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .author(UserService.toResponse(c.getAuthor()))
                .postId(c.getPost().getId())
                .parentCommentId(parent != null ? parent.getId() : null)
                .parentAuthorUsername(parent != null ? parent.getAuthor().getUsername() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
