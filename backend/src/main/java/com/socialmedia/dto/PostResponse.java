package com.socialmedia.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class PostResponse {

    private Long id;
    private Long userId;
    private String username;
    private String displayName;
    private String profilePictureUrl;
    private String content;
    private String privacyLevel;
    private String location;
    private Boolean isEdited;
    private LocalDateTime editedAt;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer sharesCount;
    private Integer viewsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<String> imageUrls;
    private Set<String> hashtags;
    private Boolean isLikedByCurrentUser;

    public PostResponse() {}

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getContent() { return content; }
    public String getPrivacyLevel() { return privacyLevel; }
    public String getLocation() { return location; }
    public Boolean getIsEdited() { return isEdited; }
    public LocalDateTime getEditedAt() { return editedAt; }
    public Integer getLikesCount() { return likesCount; }
    public Integer getCommentsCount() { return commentsCount; }
    public Integer getSharesCount() { return sharesCount; }
    public Integer getViewsCount() { return viewsCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Set<String> getImageUrls() { return imageUrls; }
    public Set<String> getHashtags() { return hashtags; }
    public Boolean getIsLikedByCurrentUser() { return isLikedByCurrentUser; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setContent(String content) { this.content = content; }
    public void setPrivacyLevel(String privacyLevel) { this.privacyLevel = privacyLevel; }
    public void setLocation(String location) { this.location = location; }
    public void setIsEdited(Boolean isEdited) { this.isEdited = isEdited; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }
    public void setSharesCount(Integer sharesCount) { this.sharesCount = sharesCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setImageUrls(Set<String> imageUrls) { this.imageUrls = imageUrls; }
    public void setHashtags(Set<String> hashtags) { this.hashtags = hashtags; }
    public void setIsLikedByCurrentUser(Boolean isLikedByCurrentUser) { this.isLikedByCurrentUser = isLikedByCurrentUser; }

    // ─── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final PostResponse r = new PostResponse();

        public Builder id(Long v) { r.id = v; return this; }
        public Builder userId(Long v) { r.userId = v; return this; }
        public Builder username(String v) { r.username = v; return this; }
        public Builder displayName(String v) { r.displayName = v; return this; }
        public Builder profilePictureUrl(String v) { r.profilePictureUrl = v; return this; }
        public Builder content(String v) { r.content = v; return this; }
        public Builder privacyLevel(String v) { r.privacyLevel = v; return this; }
        public Builder location(String v) { r.location = v; return this; }
        public Builder isEdited(Boolean v) { r.isEdited = v; return this; }
        public Builder editedAt(LocalDateTime v) { r.editedAt = v; return this; }
        public Builder likesCount(Integer v) { r.likesCount = v; return this; }
        public Builder commentsCount(Integer v) { r.commentsCount = v; return this; }
        public Builder sharesCount(Integer v) { r.sharesCount = v; return this; }
        public Builder viewsCount(Integer v) { r.viewsCount = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public Builder imageUrls(Set<String> v) { r.imageUrls = v; return this; }
        public Builder hashtags(Set<String> v) { r.hashtags = v; return this; }
        public Builder isLikedByCurrentUser(Boolean v) { r.isLikedByCurrentUser = v; return this; }

        public PostResponse build() { return r; }
    }
}
