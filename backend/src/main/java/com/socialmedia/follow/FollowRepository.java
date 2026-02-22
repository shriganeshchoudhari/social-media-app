package com.socialmedia.follow;

import com.socialmedia.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    // Followers of a user (people who follow `following`)
    Page<Follow> findByFollowing(User following, Pageable pageable);

    // Users a person follows (people `follower` follows)
    Page<Follow> findByFollower(User follower, Pageable pageable);

    // IDs of users that `follower` follows — used for feed query
    @Query("SELECT f.following.id FROM Follow f WHERE f.follower = :user")
    List<Long> findFollowingIds(@Param("user") User user);
}
