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
    private LocalDateTime createdAt;
}
