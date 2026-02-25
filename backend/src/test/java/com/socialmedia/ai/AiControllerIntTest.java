package com.socialmedia.ai;

import com.socialmedia.BaseIntegrationTest;
import com.socialmedia.TestDataFactory;
import com.socialmedia.auth.JwtService;
import com.socialmedia.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.io.IOException;
import java.io.OutputStream;
import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AiController.
 *
 * OllamaClient is mocked with @MockitoBean — no real Ollama instance required.
 * AiRateLimiter is also mocked to control rate-limit scenarios precisely.
 */
@DisplayName("AiController – integration tests")
class AiControllerIntTest extends BaseIntegrationTest {

    @MockitoBean OllamaClient  ollamaClient;
    @MockitoBean AiRateLimiter rateLimiter;

    @Autowired TestDataFactory factory;
    @Autowired JwtService      jwtService;

    private User alice;
    private String aliceToken;
    private static final String API = "/api/v1/ai";
    private static final MediaType NDJSON = MediaType.parseMediaType("application/x-ndjson");

    @BeforeEach
    void setUpUser() {
        alice = factory.user("ai_alice");
        aliceToken = jwtService.generateToken(alice);

        // Default: rate limit allows requests
        when(rateLimiter.check(anyLong()))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
    }

    // ── POST /api/v1/ai/chat — positive cases ─────────────────────────────────

    @Test
    @DisplayName("✅ chat returns 200 with NDJSON content-type for valid request")
    void chat_returns200_forValidRequest() throws Exception {
        // Mock OllamaClient to write a simple streamed response
        doAnswer(inv -> {
            OutputStream out = inv.getArgument(3);
            out.write("{\"delta\":\"Hello!\"}\n".getBytes());
            out.write("{\"done\":true}\n".getBytes());
            return null;
        }).when(ollamaClient).streamChat(any(), any(), any(), any());

        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Hello Spark", "general"))))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(NDJSON));
    }

    @Test
    @DisplayName("✅ chat response body contains delta tokens")
    void chat_responseBody_containsDeltaTokens() throws Exception {
        doAnswer(inv -> {
            OutputStream out = inv.getArgument(3);
            out.write("{\"delta\":\"Hello\"}\n".getBytes());
            out.write("{\"delta\":\" world\"}\n".getBytes());
            out.write("{\"done\":true}\n".getBytes());
            return null;
        }).when(ollamaClient).streamChat(any(), any(), any(), any());

        String body = mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Hey", "general"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(body)
                .contains("{\"delta\":\"Hello\"}")
                .contains("{\"delta\":\" world\"}")
                .contains("{\"done\":true}");
    }

    @Test
    @DisplayName("✅ chat accepts feed_summary context")
    void chat_acceptsFeedSummaryContext() throws Exception {
        doAnswer(inv -> {
            OutputStream out = inv.getArgument(3);
            out.write("{\"done\":true}\n".getBytes());
            return null;
        }).when(ollamaClient).streamChat(any(), any(), any(), any());

        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("What's in my feed?", "feed_summary"))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ chat accepts post_improve context")
    void chat_acceptsPostImproveContext() throws Exception {
        doAnswer(inv -> {
            OutputStream out = inv.getArgument(3);
            out.write("{\"done\":true}\n".getBytes());
            return null;
        }).when(ollamaClient).streamChat(any(), any(), any(), any());

        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Improve: went running today", "post_improve"))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("✅ chat accepts request without optional context field")
    void chat_acceptsRequest_withoutContext() throws Exception {
        doAnswer(inv -> {
            OutputStream out = inv.getArgument(3);
            out.write("{\"done\":true}\n".getBytes());
            return null;
        }).when(ollamaClient).streamChat(any(), any(), any(), any());

        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Hello\"}"))
                .andExpect(status().isOk());
    }

    // ── GET /api/v1/ai/health — positive cases ────────────────────────────────

    @Test
    @DisplayName("✅ health returns 200 with ok status when Ollama is up")
    void health_returns200_whenOllamaUp() throws Exception {
        when(ollamaClient.isHealthy()).thenReturn(true);
        when(ollamaClient.getModel()).thenReturn("llama3.2:3b");
        when(ollamaClient.getBaseUrl()).thenReturn("http://localhost:11434");

        mockMvc.perform(get(API + "/health")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.ollamaReachable").value(true))
                .andExpect(jsonPath("$.model").value("llama3.2:3b"));
    }

    @Test
    @DisplayName("✅ health returns 503 with degraded status when Ollama is down")
    void health_returns503_whenOllamaDown() throws Exception {
        when(ollamaClient.isHealthy()).thenReturn(false);
        when(ollamaClient.getModel()).thenReturn("llama3.2:3b");
        when(ollamaClient.getBaseUrl()).thenReturn("http://localhost:11434");

        mockMvc.perform(get(API + "/health")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value("degraded"))
                .andExpect(jsonPath("$.ollamaReachable").value(false))
                .andExpect(jsonPath("$.message", containsString("Ollama")));
    }

    // ── POST /api/v1/ai/chat — negative cases ─────────────────────────────────

    @Test
    @DisplayName("❌ chat returns 401 when no Authorization header")
    void chat_returns401_withNoAuth() throws Exception {
        mockMvc.perform(post(API + "/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Hello", "general"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("❌ chat returns 422 when message is blank")
    void chat_returns422_whenMessageBlank() throws Exception {
        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("❌ chat returns 422 when message is missing")
    void chat_returns422_whenMessageMissing() throws Exception {
        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"context\":\"general\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("❌ chat returns 422 when message exceeds 1000 characters")
    void chat_returns422_whenMessageTooLong() throws Exception {
        String longMsg = "a".repeat(1001);
        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"" + longMsg + "\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("❌ chat returns 422 for invalid context value")
    void chat_returns422_forInvalidContext() throws Exception {
        mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Hi\",\"context\":\"invalid_mode\"}"))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("❌ chat rate-limit error is written to NDJSON stream as error object")
    void chat_writesRateLimitError_toStream_whenLimitExceeded() throws Exception {
        when(rateLimiter.check(anyLong()))
                .thenReturn(new RateLimitStatus(false, 0, Instant.now().plusSeconds(3600)));

        String body = mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Hello", "general"))))
                .andExpect(status().isOk())   // streaming starts before rate-limit check result
                .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(body).contains("rate_limit");
    }

    @Test
    @DisplayName("❌ chat writes ai_unavailable error when Ollama throws AiUnavailableException")
    void chat_writesAiUnavailableError_toStream_whenOllamaDown() throws Exception {
        doThrow(new AiUnavailableException("Ollama not reachable"))
                .when(ollamaClient).streamChat(any(), any(), any(), any());

        String body = mockMvc.perform(post(API + "/chat")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(chatBody("Hello", "general"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(body).contains("ai_unavailable");
    }

    @Test
    @DisplayName("❌ health returns 401 when unauthenticated")
    void health_returns401_whenNotAuthenticated() throws Exception {
        mockMvc.perform(get(API + "/health"))
                .andExpect(status().isUnauthorized());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private record ChatBody(String message, String context) {}

    private ChatBody chatBody(String message, String context) {
        return new ChatBody(message, context);
    }
}
