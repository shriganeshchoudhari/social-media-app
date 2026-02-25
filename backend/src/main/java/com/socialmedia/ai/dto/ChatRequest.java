package com.socialmedia.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Incoming request body for POST /api/v1/ai/chat
 */
@Getter @Setter @NoArgsConstructor
public class ChatRequest {

    @NotBlank(message = "Message must not be blank")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    /** Previous turns — sent by the client, max 10 turns = 20 messages. */
    @Size(max = 20, message = "Conversation history must not exceed 20 messages")
    private List<ConversationMessage> conversationHistory;

    /**
     * Context hint:
     *   "general"       — inject user profile info (default)
     *   "feed_summary"  — inject recent PUBLIC feed posts
     *   "post_improve"  — no DB fetch; draft is in the message
     */
    @Pattern(
        regexp = "general|feed_summary|post_improve",
        message = "Context must be one of: general, feed_summary, post_improve"
    )
    private String context = "general";

    // ── Nested ──────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor
    public static class ConversationMessage {

        @Pattern(regexp = "user|assistant", message = "Role must be 'user' or 'assistant'")
        private String role;

        @Size(max = 4000, message = "History message content must not exceed 4000 characters")
        private String content;
    }
}
