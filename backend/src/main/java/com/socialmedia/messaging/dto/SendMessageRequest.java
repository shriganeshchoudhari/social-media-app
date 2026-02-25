package com.socialmedia.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** REST body for starting or continuing a conversation. */
@Data
public class SendMessageRequest {

    /** The recipient's user ID. */
    @NotNull
    private Long recipientId;

    @NotBlank
    @Size(max = 2000)
    private String content;
}
