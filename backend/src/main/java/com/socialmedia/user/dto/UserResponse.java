package com.socialmedia.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private int followersCount;
    private int followingCount;
    private int postsCount;
    private LocalDateTime createdAt;
}
