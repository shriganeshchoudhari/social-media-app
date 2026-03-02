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

        Follow.FollowBuilder builder = Follow.builder().follower(follower).following(target);

        if (target.isPrivateAccount()) {
            // Private account: create a pending request, notify target of the request
            builder.status(Follow.Status.PENDING);
            followRepository.save(builder.build());
            // Do NOT update follower/following counters until accepted
            eventPublisher.publishEvent(new NotificationEvent(
                    this, follower, target,
                    Notification.Type.FOLLOW_REQUEST, null,
                    follower.getUsername() + " requested to follow you"));
        } else {
            // Public account: accept immediately
            builder.status(Follow.Status.ACCEPTED);
            followRepository.save(builder.build());
            follower.setFollowingCount(follower.getFollowingCount() + 1);
            target.setFollowersCount(target.getFollowersCount() + 1);
            userRepository.save(follower);
            userRepository.save(target);
            eventPublisher.publishEvent(new NotificationEvent(
                    this, follower, target,
                    Notification.Type.FOLLOW, null,
                    follower.getUsername() + " started following you"));
        }
    }

    /**
     * Accepts a pending follow request for the current user.
     * Notifies the requester that their request was accepted.
     */
    @Transactional
    public void acceptFollowRequest(User target, String requesterUsername) {
        User requester = findUser(requesterUsername);
        Follow follow = followRepository.findByFollowerAndFollowing(requester, target)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Follow request not found from: " + requesterUsername));

        if (follow.getStatus() != Follow.Status.PENDING)
            throw new ConflictException("No pending follow request from " + requesterUsername);

        follow.setStatus(Follow.Status.ACCEPTED);
        followRepository.save(follow);

        requester.setFollowingCount(requester.getFollowingCount() + 1);
        target.setFollowersCount(target.getFollowersCount() + 1);
        userRepository.save(requester);
        userRepository.save(target);

        eventPublisher.publishEvent(new NotificationEvent(
                this, target, requester,
                Notification.Type.FOLLOW_ACCEPTED, null,
                target.getUsername() + " accepted your follow request"));
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
