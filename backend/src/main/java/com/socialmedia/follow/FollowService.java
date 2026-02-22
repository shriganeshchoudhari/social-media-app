package com.socialmedia.follow;

import com.socialmedia.exception.ConflictException;
import com.socialmedia.exception.ForbiddenException;
import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.notification.Notification;
import com.socialmedia.notification.NotificationEvent;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import com.socialmedia.user.UserService;
import com.socialmedia.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void follow(User follower, String targetUsername) {
        User target = findUser(targetUsername);
        if (follower.getId().equals(target.getId()))
            throw new ForbiddenException("You cannot follow yourself");
        if (followRepository.existsByFollowerAndFollowing(follower, target))
            throw new ConflictException("Already following " + targetUsername);

        followRepository.save(Follow.builder().follower(follower).following(target).build());

        // update counters
        follower.setFollowingCount(follower.getFollowingCount() + 1);
        target.setFollowersCount(target.getFollowersCount() + 1);
        userRepository.save(follower);
        userRepository.save(target);

        eventPublisher.publishEvent(new NotificationEvent(
                this, follower, target,
                Notification.Type.FOLLOW, null,
                follower.getUsername() + " started following you"));
    }

    @Transactional
    public void unfollow(User follower, String targetUsername) {
        User target = findUser(targetUsername);
        Follow follow = followRepository.findByFollowerAndFollowing(follower, target)
                .orElseThrow(() -> new ConflictException("Not following " + targetUsername));

        followRepository.delete(follow);

        follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        target.setFollowersCount(Math.max(0, target.getFollowersCount() - 1));
        userRepository.save(follower);
        userRepository.save(target);
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowers(String username, Pageable pageable) {
        User user = findUser(username);
        return followRepository.findByFollowing(user, pageable)
                .map(f -> UserService.toResponse(f.getFollower()));
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getFollowing(String username, Pageable pageable) {
        User user = findUser(username);
        return followRepository.findByFollower(user, pageable)
                .map(f -> UserService.toResponse(f.getFollowing()));
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(User follower, String targetUsername) {
        User target = findUser(targetUsername);
        return followRepository.existsByFollowerAndFollowing(follower, target);
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
