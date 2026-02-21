package com.socialmedia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String content;

    public CommentRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
