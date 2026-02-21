package com.socialmedia.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 100)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profilePictureUrl;
    private String coverPhotoUrl;
    private String location;
    private String website;

    private Boolean isVerified = false;
    private Boolean isActive = true;
    private Boolean isPrivate = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    private Integer followersCount = 0;
    private Integer followingCount = 0;
    private Integer postsCount = 0;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<Post> posts = new HashSet<>();

    @OneToMany(mappedBy = "follower", cascade = CascadeType.ALL)
    private Set<Follow> following = new HashSet<>();

    @OneToMany(mappedBy = "following", cascade = CascadeType.ALL)
    private Set<Follow> followers = new HashSet<>();

    // ─── Constructors ──────────────────────────────────────────────────────────

    public User() {}

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getBio() { return bio; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public String getCoverPhotoUrl() { return coverPhotoUrl; }
    public String getLocation() { return location; }
    public String getWebsite() { return website; }
    public Boolean getIsVerified() { return isVerified; }
    public Boolean getIsActive() { return isActive; }
    public Boolean getIsPrivate() { return isPrivate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public Integer getFollowersCount() { return followersCount; }
    public Integer getFollowingCount() { return followingCount; }
    public Integer getPostsCount() { return postsCount; }
    public Set<Post> getPosts() { return posts; }
    public Set<Follow> getFollowingSet() { return following; }
    public Set<Follow> getFollowersSet() { return followers; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public void setCoverPhotoUrl(String coverPhotoUrl) { this.coverPhotoUrl = coverPhotoUrl; }
    public void setLocation(String location) { this.location = location; }
    public void setWebsite(String website) { this.website = website; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setIsPrivate(Boolean isPrivate) { this.isPrivate = isPrivate; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setLastLoginAt(LocalDateTime lastLoginAt) { this.lastLoginAt = lastLoginAt; }
    public void setFollowersCount(Integer followersCount) { this.followersCount = followersCount; }
    public void setFollowingCount(Integer followingCount) { this.followingCount = followingCount; }
    public void setPostsCount(Integer postsCount) { this.postsCount = postsCount; }
    public void setPosts(Set<Post> posts) { this.posts = posts; }

    // ─── UserDetails ───────────────────────────────────────────────────────────

    @Override
    public String getUsername() { return username; }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return Boolean.TRUE.equals(isActive); }

    // ─── equals / hashCode ────────────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "User{id=" + id + ", username='" + username + "', email='" + email + "'}";
    }
}
