package com.socialmedia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class PostRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content must not exceed 5000 characters")
    private String content;

    private String privacyLevel = "public";
    private String location;
    private Set<String> imageUrls;

    public PostRequest() {}

    public String getContent() { return content; }
    public String getPrivacyLevel() { return privacyLevel; }
    public String getLocation() { return location; }
    public Set<String> getImageUrls() { return imageUrls; }

    public void setContent(String content) { this.content = content; }
    public void setPrivacyLevel(String privacyLevel) { this.privacyLevel = privacyLevel; }
    public void setLocation(String location) { this.location = location; }
    public void setImageUrls(Set<String> imageUrls) { this.imageUrls = imageUrls; }
}
