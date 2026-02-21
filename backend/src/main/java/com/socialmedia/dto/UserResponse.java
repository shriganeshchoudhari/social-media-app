package com.socialmedia.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String bio;
    private String profilePictureUrl;
    private String coverPhotoUrl;
    private String location;
    private String website;
    private Boolean isVerified;
    private Boolean isPrivate;
    private Integer followersCount;
    private Integer followingCount;
    private Integer postsCount;
    private LocalDateTime createdAt;
    private Boolean isFollowedByCurrentUser;

    public UserResponse() {}

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getBio() { return bio; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getCoverPhotoUrl() { return coverPhotoUrl; }
    public String getLocation() { return location; }
    public String getWebsite() { return website; }
    public Boolean getIsVerified() { return isVerified; }
    public Boolean getIsPrivate() { return isPrivate; }
    public Integer getFollowersCount() { return followersCount; }
    public Integer getFollowingCount() { return followingCount; }
    public Integer getPostsCount() { return postsCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Boolean getIsFollowedByCurrentUser() { return isFollowedByCurrentUser; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setCoverPhotoUrl(String coverPhotoUrl) { this.coverPhotoUrl = coverPhotoUrl; }
    public void setLocation(String location) { this.location = location; }
    public void setWebsite(String website) { this.website = website; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    public void setFollowersCount(Integer followersCount) { this.followersCount = followersCount; }
    public void setFollowingCount(Integer followingCount) { this.followingCount = followingCount; }
    public void setPostsCount(Integer postsCount) { this.postsCount = postsCount; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setIsFollowedByCurrentUser(Boolean isFollowedByCurrentUser) { this.isFollowedByCurrentUser = isFollowedByCurrentUser; }

    // ─── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final UserResponse r = new UserResponse();

        public Builder id(Long v) { r.id = v; return this; }
        public Builder username(String v) { r.username = v; return this; }
        public Builder email(String v) { r.email = v; return this; }
        public Builder displayName(String v) { r.displayName = v; return this; }
        public Builder bio(String v) { r.bio = v; return this; }
        public Builder profilePictureUrl(String v) { r.profilePictureUrl = v; return this; }
        public Builder coverPhotoUrl(String v) { r.coverPhotoUrl = v; return this; }
        public Builder location(String v) { r.location = v; return this; }
        public Builder website(String v) { r.website = v; return this; }
        public Builder isVerified(Boolean v) { r.isVerified = v; return this; }
        public Builder isPrivate(Boolean v) { r.isPrivate = v; return this; }
        public Builder followersCount(Integer v) { r.followersCount = v; return this; }
        public Builder followingCount(Integer v) { r.followingCount = v; return this; }
        public Builder postsCount(Integer v) { r.postsCount = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder isFollowedByCurrentUser(Boolean v) { r.isFollowedByCurrentUser = v; return this; }

        public UserResponse build() { return r; }
    }
}
