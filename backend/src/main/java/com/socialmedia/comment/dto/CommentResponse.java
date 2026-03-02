package com.socialmedia.comment.dto;

import com.socialmedia.user.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class CommentResponse {
    private Long id;
    private String content;
    private UserResponse author;
    private Long postId;

    /** Non-null when this comment is a reply. */
    private Long parentCommentId;

    /** Username of the parent comment's author — useful for rendering "@user" context in the UI. */
    private String parentAuthorUsername;

    private LocalDateTime createdAt;
}
