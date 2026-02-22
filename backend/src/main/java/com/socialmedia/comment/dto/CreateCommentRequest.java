package com.socialmedia.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank
    @Size(min = 1, max = 1000, message = "Comment must be 1–1000 characters")
    private String content;
}
