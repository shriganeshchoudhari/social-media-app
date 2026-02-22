package com.socialmedia.user;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.user.dto.UpdateProfileRequest;
import com.socialmedia.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest req) {
        if (req.getDisplayName() != null) currentUser.setDisplayName(req.getDisplayName());
        if (req.getBio()         != null) currentUser.setBio(req.getBio());
        if (req.getAvatarUrl()   != null) currentUser.setAvatarUrl(req.getAvatarUrl());
        return toResponse(userRepository.save(currentUser));
    }

    public Page<UserResponse> search(String q, Pageable pageable) {
        return userRepository.search(q, pageable).map(u -> toResponse(u));
    }

    public static UserResponse toResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .displayName(u.getDisplayName())
                .bio(u.getBio())
                .avatarUrl(u.getAvatarUrl())
                .followersCount(u.getFollowersCount())
                .followingCount(u.getFollowingCount())
                .postsCount(u.getPostsCount())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
