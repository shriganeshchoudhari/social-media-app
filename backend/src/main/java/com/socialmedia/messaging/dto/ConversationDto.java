package com.socialmedia.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/** Summary card shown in the conversation list. */
@Data @Builder
public class ConversationDto {
    private Long   id;
    // The *other* participant's details (caller-relative)
    private Long   otherUserId;
    private String otherUsername;
    private String otherDisplayName;
    private String otherAvatarUrl;
    // Preview of the last message
    private String lastMessageContent;
    private String lastMessageSenderUsername;
    private LocalDateTime lastMessageAt;
    private long   unreadCount;
    private LocalDateTime updatedAt;
}
