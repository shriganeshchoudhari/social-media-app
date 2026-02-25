package com.socialmedia.ai;

import com.socialmedia.ai.dto.ChatRequest;
import com.socialmedia.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * REST controller for the Spark AI assistant.
 *
 * POST /api/v1/ai/chat    — stream a chat response (NDJSON)
 * GET  /api/v1/ai/health  — check Ollama reachability
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);
    private static final MediaType NDJSON = MediaType.parseMediaType("application/x-ndjson");

    private final AiService    aiService;
    private final OllamaClient ollamaClient;

    /**
     * Stream an AI chat response.
     *
     * Response body: NDJSON stream.
     *   Token lines:  {"delta":"<token>"}
     *   Final line:   {"done":true}
     *
     * Error responses (non-streamed JSON):
     *   400 — validation failure
     *   401 — unauthenticated
     *   429 — rate limit exceeded
     *   503 — Ollama not reachable
     */
    @PostMapping(value = "/chat", produces = "application/x-ndjson")
    public ResponseEntity<StreamingResponseBody> chat(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChatRequest req) {

        StreamingResponseBody stream = out -> {
            try {
                aiService.streamChat(currentUser, req, out);
            } catch (AiRateLimitException e) {
                // Already serialised by the time we write — write error as NDJSON
                log.warn("Rate limit hit for user={}", currentUser.getUsername());
                out.write(("{\"error\":\"rate_limit\",\"message\":\"" +
                           e.getMessage() + "\",\"resetAt\":\"" +
                           e.getResetAt() + "\"}\n").getBytes());
                out.flush();
            } catch (AiUnavailableException e) {
                log.warn("Ollama unavailable during stream for user={}: {}",
                         currentUser.getUsername(), e.getMessage());
                out.write(("{\"error\":\"ai_unavailable\",\"message\":\"" +
                           "AI assistant is starting up — try again in a moment." +
                           "\",\"retryable\":true}\n").getBytes());
                out.flush();
            }
        };

        return ResponseEntity.ok()
                .contentType(NDJSON)
                .body(stream);
    }

    /**
     * Health check: is Ollama running and responding?
     * Frontend polls this every 10 s when Ollama is unavailable
     * to automatically re-enable the chat panel.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health(
            @AuthenticationPrincipal User currentUser) {
        boolean reachable = ollamaClient.isHealthy();
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status",          reachable ? "ok" : "degraded");
        body.put("ollamaReachable", reachable);
        body.put("model",           ollamaClient.getModel());
        body.put("ollamaUrl",       ollamaClient.getBaseUrl());
        if (!reachable) {
            body.put("message", "Ollama is not running. " +
                                "Install it from https://ollama.com/download then run: ollama serve");
        }
        return reachable
                ? ResponseEntity.ok(body)
                : ResponseEntity.status(503).body(body);
    }
}
