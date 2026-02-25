package com.socialmedia.ai;

import com.socialmedia.ai.dto.ChatRequest;
import com.socialmedia.ai.dto.OllamaMessage;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

/**
 * Orchestrates the AI chat pipeline:
 *   1. Rate-limit check
 *   2. Build system prompt (with context injection)
 *   3. Trim conversation history
 *   4. Call OllamaClient and stream tokens to the output stream
 */
@Service
@RequiredArgsConstructor
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final OllamaClient  ollamaClient;
    private final ContextBuilder contextBuilder;
    private final AiRateLimiter  rateLimiter;

    /**
     * Stream a chat response to {@code out}.
     * Enforces rate-limiting, builds context, and delegates to OllamaClient.
     *
     * @throws AiRateLimitException  if the user has exceeded their request quota
     * @throws AiUnavailableException if Ollama is not reachable
     */
    public void streamChat(User user, ChatRequest req, OutputStream out) throws IOException {
        // 1. Rate-limit
        RateLimitStatus status = rateLimiter.check(user.getId());
        if (!status.isAllowed()) {
            throw new AiRateLimitException(status.getRemaining(), status.getResetAt());
        }

        log.debug("AI chat for user={} context={} remaining={}",
                user.getUsername(), req.getContext(), status.getRemaining());

        // 2. Build system prompt with injected context
        String systemPrompt = contextBuilder.buildSystemPrompt(user, req.getContext());

        // 3. Trim history to the last 10 turns
        List<OllamaMessage> history = contextBuilder.trimHistory(req.getConversationHistory());

        // 4. Stream from Ollama
        ollamaClient.streamChat(systemPrompt, history, req.getMessage(), out);
    }
}
