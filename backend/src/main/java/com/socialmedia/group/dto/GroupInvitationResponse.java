package com.socialmedia.group.dto;

import com.socialmedia.group.GroupInvitation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupInvitationResponse {
    private Long   id;
    private Long   groupId;
    private String groupName;
    private String inviterUsername;  // null for JOIN_REQUEST
    private String inviteeUsername;
    private GroupInvitation.InvitationType   type;
    private GroupInvitation.InvitationStatus status;
    private LocalDateTime createdAt;
}
