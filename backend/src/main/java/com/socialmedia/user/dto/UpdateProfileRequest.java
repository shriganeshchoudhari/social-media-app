package com.socialmedia.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 60, message = "Display name must be at most 60 characters")
    private String displayName;

    @Size(max = 200, message = "Bio must be at most 200 characters")
    private String bio;

    private String avatarUrl;
}
