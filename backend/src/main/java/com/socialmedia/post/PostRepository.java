package com.socialmedia.post;

import com.socialmedia.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import com.socialmedia.post.Post.Privacy;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);

    /**
     * Home feed: own posts (any privacy) + followed users' non-private posts,
     * ordered newest first.
     */
    @Query("SELECT p FROM Post p WHERE " +
           "(p.author = :user) OR " +
           "(p.author.id IN :followingIds AND p.privacy <> 'PRIVATE') " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findFeed(@Param("user") User user,
                        @Param("followingIds") List<Long> followingIds,
                        Pageable pageable);

    /**
     * Full-text search on post content; returns PUBLIC posts only
     * (plus the current user's own posts of any privacy).
     */
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
    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%#',:tag,'%')) AND " +
           "(p.privacy = 'PUBLIC' OR p.author = :user) " +
           "ORDER BY p.createdAt DESC")
    Page<Post> findByHashtag(@Param("tag") String tag,
                              @Param("user") User user,
                              Pageable pageable);
}
