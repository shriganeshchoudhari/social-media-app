package com.socialmedia.comment;

import com.socialmedia.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostOrderByCreatedAtAsc(Post post, Pageable pageable);
    int countByPost(Post post);
}
