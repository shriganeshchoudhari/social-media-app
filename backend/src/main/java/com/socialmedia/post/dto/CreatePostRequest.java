package com.socialmedia.post.dto;

import com.socialmedia.post.Post;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotBlank
    @Size(min = 1, max = 2000, message = "Content must be 1–2000 characters")
    private String content;

    private String imageUrl;

    private Post.Privacy privacy = Post.Privacy.PUBLIC;

    /** Optional: if set the post is scoped to this group. Caller must be a member. */
    private Long groupId;
}
