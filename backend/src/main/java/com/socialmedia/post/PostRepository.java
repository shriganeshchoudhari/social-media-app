package com.socialmedia.post;

import com.socialmedia.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.QueryHint;
import org.hibernate.jpa.HibernateHints;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

       @QueryHints({
                     @QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"),
                     @QueryHint(name = HibernateHints.HINT_FETCH_SIZE, value = "20")
       })
       Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

       /**
        * Home feed: own posts (any privacy) + followed users' non-private posts,
        * ordered newest first.
        */
       @QueryHints({
                     @QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"),
                     @QueryHint(name = HibernateHints.HINT_FETCH_SIZE, value = "20")
       })
       @Query("SELECT p FROM Post p WHERE " +
                     "(p.author = :user) OR " +
                     "(p.author.id IN :followingIds AND p.privacy <> 'PRIVATE') " +
                     "ORDER BY p.createdAt DESC")
       Page<Post> findFeed(@Param("user") User user,
                     @Param("followingIds") List<Long> followingIds,
                     Pageable pageable);

       /**
        * Keyset (cursor) pagination for the feed.
        * Fetches posts created strictly before the given cursor timestamp,
        * eliminating OFFSET overhead for deep pages.
        * Frontend sends: GET /posts/feed?before=<ISO>&size=20
        */
       @QueryHints(@QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"))
       @Query("SELECT p FROM Post p WHERE " +
                     "((p.author = :user) OR (p.author.id IN :followingIds AND p.privacy <> 'PRIVATE')) " +
                     "AND p.createdAt < :before " +
                     "ORDER BY p.createdAt DESC")
       List<Post> findFeedBefore(@Param("user") User user,
                     @Param("followingIds") List<Long> followingIds,
                     @Param("before") LocalDateTime before,
                     Pageable pageable);

       /**
        * Full-text search on post content; returns PUBLIC posts only
        * (plus the current user's own posts of any privacy).
        */
       @QueryHints(@QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"))
       @Query("SELECT p FROM Post p WHERE " +
                     "LOWER(p.content) LIKE LOWER(CONCAT('%',:q,'%')) AND " +
                     "(p.privacy = 'PUBLIC' OR p.author = :user) " +
                     "ORDER BY p.createdAt DESC")
       Page<Post> search(@Param("q") String q,
                     @Param("user") User user,
                     Pageable pageable);

       /**
        * Hashtag search: looks for #<tag> inside content (PUBLIC posts only).
        */
       @QueryHints(@QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"))
       @Query("SELECT p FROM Post p WHERE " +
                     "LOWER(p.content) LIKE LOWER(CONCAT('%#',:tag,'%')) AND " +
                     "(p.privacy = 'PUBLIC' OR p.author = :user) " +
                     "ORDER BY p.createdAt DESC")
       Page<Post> findByHashtag(@Param("tag") String tag,
                     @Param("user") User user,
                     Pageable pageable);

       /** All posts belonging to a given group, newest first. */
       @QueryHints(@QueryHint(name = HibernateHints.HINT_READ_ONLY, value = "true"))
       Page<Post> findByGroupIdOrderByCreatedAtDesc(@Param("groupId") Long groupId, Pageable pageable);
}
