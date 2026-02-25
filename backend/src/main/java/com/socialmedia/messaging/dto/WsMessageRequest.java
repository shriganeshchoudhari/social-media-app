package com.socialmedia.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** STOMP payload sent by client to /app/send-message. */
@Data
public class WsMessageRequest {

    @NotNull
    private Long conversationId;

    @NotBlank
    @Size(max = 2000)
    private String content;
}
