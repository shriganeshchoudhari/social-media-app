package com.socialmedia.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "post_id"})
})
@EntityListeners(AuditingEntityListener.class)
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ─── Constructors ──────────────────────────────────────────────────────────

    public Like() {}

    public Like(Post post, User user) {
        this.post = post;
        this.user = user;
    }

    // ─── Getters ───────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public User getUser() { return user; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setPost(Post post) { this.post = post; }
    public void setUser(User user) { this.user = user; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // ─── equals / hashCode ────────────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Like)) return false;
        Like like = (Like) o;
        return Objects.equals(id, like.id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}
