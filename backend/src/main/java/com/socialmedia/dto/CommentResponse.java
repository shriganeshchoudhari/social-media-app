package com.socialmedia.dto;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private Long postId;
    private Long userId;
    private String username;
    private String displayName;
    private String profilePictureUrl;
    private String content;
    private Integer likesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse() {}

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public Long getPostId() { return postId; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getContent() { return content; }
    public Integer getLikesCount() { return likesCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setPostId(Long postId) { this.postId = postId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setContent(String content) { this.content = content; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // ─── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final CommentResponse r = new CommentResponse();

        public Builder id(Long v) { r.id = v; return this; }
        public Builder postId(Long v) { r.postId = v; return this; }
        public Builder userId(Long v) { r.userId = v; return this; }
        public Builder username(String v) { r.username = v; return this; }
        public Builder displayName(String v) { r.displayName = v; return this; }
        public Builder profilePictureUrl(String v) { r.profilePictureUrl = v; return this; }
        public Builder content(String v) { r.content = v; return this; }
        public Builder likesCount(Integer v) { r.likesCount = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }

        public CommentResponse build() { return r; }
    }
}
