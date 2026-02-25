package com.socialmedia.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * Request body for POST http://ollama:11434/api/chat
 *
 * Ollama docs: https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion
 */
@Getter @Builder
public class OllamaRequest {

    /** Model name, e.g. "llama3.2:3b" */
    private String model;

    /** Whether to stream the response as NDJSON (one JSON object per line). */
    private boolean stream;

    /** Full message list: system prompt first, then conversation history, then user message. */
    private List<OllamaMessage> messages;

    /**
     * Inference options passed to Ollama.
     * temperature: 0.0–1.0 (0 = deterministic, 1 = very creative)
     * num_predict:  max tokens to generate (hard cap)
     * top_p:        nucleus sampling threshold
     */
    private Map<String, Object> options;
}
