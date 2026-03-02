package com.socialmedia.post.dto;

import com.socialmedia.post.Post;
import com.socialmedia.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse implements Serializable {
    private static final long serialVersionUID = 1L;
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
