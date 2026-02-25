package com.socialmedia.bookmark;

import com.socialmedia.post.Post;
import com.socialmedia.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Set;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Optional<Bookmark> findByUserAndPost(User user, Post post);

    boolean existsByUserAndPost(User user, Post post);

    /** All post IDs bookmarked by a user — used to bulk-check in feed rendering. */
    @Query("SELECT b.post.id FROM Bookmark b WHERE b.user = :user")
    Set<Long> findPostIdsByUser(@Param("user") User user);

    /** Paginated bookmarked posts for a user, newest bookmark first. */
    @Query("SELECT b.post FROM Bookmark b WHERE b.user = :user ORDER BY b.createdAt DESC")
    Page<Post> findPostsByUser(@Param("user") User user, Pageable pageable);
}
