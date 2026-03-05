package com.socialmedia.group.dto;

import com.socialmedia.group.Group;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {

    private Long   id;
    private String name;
    private String description;
    private String rules;
    private String privacy;          // "PUBLIC" | "PRIVATE"
    private String creatorUsername;
    private long   memberCount;
    private boolean isMember;
    private String  myRole;          // "ADMIN" | "MODERATOR" | "MEMBER" | null
    private String coverImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
