package com.socialmedia.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A single message in the Ollama /api/chat messages array.
 * Roles: "system" | "user" | "assistant"
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OllamaMessage {
    private String role;
    private String content;
}
