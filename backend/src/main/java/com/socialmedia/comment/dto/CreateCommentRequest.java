package com.socialmedia.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCommentRequest {

    @NotBlank
    @Size(min = 1, max = 1000, message = "Comment must be 1–1000 characters")
    private String content;

    /**
     * Optional. When provided, the new comment becomes a reply to the
     * specified comment (which must belong to the same post).
     * A REPLY notification will be sent to the parent comment's author.
     */
    private Long parentCommentId;
}
