package com.socialmedia.repository;

import com.socialmedia.entity.Like;
import com.socialmedia.entity.Post;
import com.socialmedia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByPostAndUser(Post post, User user);
    boolean existsByPostAndUser(Post post, User user);
    void deleteByPostAndUser(Post post, User user);
}
