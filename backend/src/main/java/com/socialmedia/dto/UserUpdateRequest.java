package com.socialmedia.dto;

import jakarta.validation.constraints.Size;

public class UserUpdateRequest {

    @Size(max = 100, message = "Display name must not exceed 100 characters")
    private String displayName;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    private String profilePictureUrl;
    private String coverPhotoUrl;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 200, message = "Website must not exceed 200 characters")
    private String website;

    private Boolean isPrivate;

    public UserUpdateRequest() {}

    public String getDisplayName() { return displayName; }
    public String getBio() { return bio; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getCoverPhotoUrl() { return coverPhotoUrl; }
    public String getLocation() { return location; }
    public String getWebsite() { return website; }
    public Boolean getIsPrivate() { return isPrivate; }

    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setCoverPhotoUrl(String coverPhotoUrl) { this.coverPhotoUrl = coverPhotoUrl; }
    public void setLocation(String location) { this.location = location; }
    public void setWebsite(String website) { this.website = website; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
}
