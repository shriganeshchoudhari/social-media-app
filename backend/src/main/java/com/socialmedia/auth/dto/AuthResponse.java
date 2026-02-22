package com.socialmedia.auth.dto;

import com.socialmedia.user.dto.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserResponse user;
}
