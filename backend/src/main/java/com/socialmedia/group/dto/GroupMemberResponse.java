package com.socialmedia.group.dto;

import com.socialmedia.group.GroupMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponse {
    private Long     id;
    private Long     userId;
    private String   username;
    private String   displayName;
    private String   avatarUrl;
    private GroupMember.GroupRole role;
    private LocalDateTime joinedAt;
}
