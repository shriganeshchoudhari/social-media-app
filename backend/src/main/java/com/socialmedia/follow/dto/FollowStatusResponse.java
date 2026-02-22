package com.socialmedia.follow.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class FollowStatusResponse {
    private boolean following;
    private int followersCount;
    private int followingCount;
}
