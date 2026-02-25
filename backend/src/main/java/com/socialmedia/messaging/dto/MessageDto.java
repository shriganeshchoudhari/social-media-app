package com.socialmedia.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class MessageDto {
    private Long   id;
    private Long   conversationId;
    private Long   senderId;
    private String senderUsername;
    private String senderAvatarUrl;
    private String content;
    private String messageType;
    private boolean read;
    private LocalDateTime createdAt;
}
