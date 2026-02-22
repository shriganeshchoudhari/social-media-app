package com.socialmedia.post.dto;

import com.socialmedia.post.Post;
import com.socialmedia.user.dto.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class PostResponse {
    private Long id;
    private String content;
    private String imageUrl;
    private Post.Privacy privacy;
    private UserResponse author;
    private int likesCount;
    private int commentsCount;
    private boolean likedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
