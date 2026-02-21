package com.socialmedia.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "posts")
@EntityListeners(AuditingEntityListener.class)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(length = 20)
    private String privacyLevel = "public";

    private String location;
    private Boolean isEdited = false;
    private LocalDateTime editedAt;

    private Integer likesCount = 0;
    private Integer commentsCount = 0;
    private Integer sharesCount = 0;
    private Integer viewsCount = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<Like> likes = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "post_images", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "image_url")
    private Set<String> imageUrls = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "post_hashtags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "hashtag")
    private Set<String> hashtags = new HashSet<>();

    // ─── Constructors ──────────────────────────────────────────────────────────

    public Post() {}

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public User getUser() { return user; }
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
    public Set<Comment> getComments() { return comments; }
    public Set<Like> getLikes() { return likes; }
    public Set<String> getImageUrls() { return imageUrls; }
    public Set<String> getHashtags() { return hashtags; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
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
    public void setComments(Set<Comment> comments) { this.comments = comments; }
    public void setLikes(Set<Like> likes) { this.likes = likes; }
    public void setImageUrls(Set<String> imageUrls) { this.imageUrls = imageUrls; }
    public void setHashtags(Set<String> hashtags) { this.hashtags = hashtags; }

    // ─── equals / hashCode ────────────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Post)) return false;
        Post post = (Post) o;
        return Objects.equals(id, post.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Post{id=" + id + ", content='" + content + "'}";
    }
}
