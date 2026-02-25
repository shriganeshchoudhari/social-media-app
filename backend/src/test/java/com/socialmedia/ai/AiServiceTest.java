package com.socialmedia.ai;

import com.socialmedia.ai.dto.ChatRequest;
import com.socialmedia.ai.dto.OllamaMessage;
import com.socialmedia.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiService – unit tests")
class AiServiceTest {

    @Mock OllamaClient  ollamaClient;
    @Mock ContextBuilder contextBuilder;
    @Mock AiRateLimiter  rateLimiter;

    @InjectMocks AiService service;

    private User alice;
    private ChatRequest req;

    @BeforeEach
    void setUp() {
        alice = User.builder()
                .id(1L)
                .username("alice")
                .displayName("Alice")
                .build();

        req = new ChatRequest();
        req.setMessage("Hello Spark!");
        req.setContext("general");
    }

    // ── Positive cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ streamChat delegates to OllamaClient with correct arguments")
    void streamChat_delegatesToOllamaClient() throws IOException {
        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(alice, "general"))
                .thenReturn("You are Spark.");
        when(contextBuilder.trimHistory(null))
                .thenReturn(List.of());

        OutputStream out = new ByteArrayOutputStream();
        service.streamChat(alice, req, out);

        verify(ollamaClient).streamChat(
                eq("You are Spark."),
                eq(List.of()),
                eq("Hello Spark!"),
                eq(out)
        );
    }

    @Test
    @DisplayName("✅ streamChat checks rate limit before delegating")
    void streamChat_checksRateLimitFirst() throws IOException {
        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(any(), any())).thenReturn("sys");
        when(contextBuilder.trimHistory(any())).thenReturn(List.of());

        service.streamChat(alice, req, new ByteArrayOutputStream());

        // Rate limiter must be called before OllamaClient
        var order = inOrder(rateLimiter, contextBuilder, ollamaClient);
        order.verify(rateLimiter).check(1L);
        order.verify(contextBuilder).buildSystemPrompt(alice, "general");
        order.verify(ollamaClient).streamChat(any(), any(), any(), any());
    }

    @Test
    @DisplayName("✅ streamChat passes trimmed history to OllamaClient")
    void streamChat_passesTrimmedHistory() throws IOException {
        ChatRequest.ConversationMessage msg = new ChatRequest.ConversationMessage();
        msg.setRole("user");
        msg.setContent("previous message");
        req.setConversationHistory(List.of(msg));

        List<OllamaMessage> trimmed = List.of(new OllamaMessage("user", "previous message"));

        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(any(), any())).thenReturn("sys");
        when(contextBuilder.trimHistory(List.of(msg))).thenReturn(trimmed);

        service.streamChat(alice, req, new ByteArrayOutputStream());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<com.socialmedia.ai.dto.OllamaMessage>> histCaptor =
                ArgumentCaptor.forClass(List.class);
        verify(ollamaClient).streamChat(any(), histCaptor.capture(), any(), any());
        assertThat(histCaptor.getValue()).isEqualTo(trimmed);
    }

    @Test
    @DisplayName("✅ streamChat passes context hint to ContextBuilder")
    void streamChat_passesContextHint() throws IOException {
        req.setContext("feed_summary");

        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(alice, "feed_summary")).thenReturn("sys+feed");
        when(contextBuilder.trimHistory(any())).thenReturn(List.of());

        service.streamChat(alice, req, new ByteArrayOutputStream());

        verify(contextBuilder).buildSystemPrompt(alice, "feed_summary");
    }

    @Test
    @DisplayName("✅ streamChat uses user id for rate limit check")
    void streamChat_usesUserIdForRateLimit() throws IOException {
        alice = User.builder().id(99L).username("bob").displayName("Bob").build();

        when(rateLimiter.check(99L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(any(), any())).thenReturn("sys");
        when(contextBuilder.trimHistory(any())).thenReturn(List.of());

        service.streamChat(alice, req, new ByteArrayOutputStream());

        verify(rateLimiter).check(99L);
    }

    // ── Negative cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("❌ streamChat throws AiRateLimitException when limit exceeded")
    void streamChat_throwsRateLimitException_whenLimitExceeded() {
        Instant resetAt = Instant.now().plusSeconds(3600);
        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(false, 0, resetAt));

        assertThatThrownBy(() -> service.streamChat(alice, req, new ByteArrayOutputStream()))
                .isInstanceOf(AiRateLimitException.class);
    }

    @Test
    @DisplayName("❌ OllamaClient is never called when rate limit is exceeded")
    void streamChat_doesNotCallOllama_whenRateLimitExceeded() {
        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(false, 0, Instant.now().plusSeconds(3600)));

        try {
            service.streamChat(alice, req, new ByteArrayOutputStream());
        } catch (AiRateLimitException | IOException ignored) {}

        verifyNoInteractions(ollamaClient);
    }

    @Test
    @DisplayName("❌ AiUnavailableException from OllamaClient propagates to caller")
    void streamChat_propagatesAiUnavailableException() throws IOException {
        when(rateLimiter.check(1L))
                .thenReturn(new RateLimitStatus(true, 59, Instant.now().plusSeconds(3600)));
        when(contextBuilder.buildSystemPrompt(any(), any())).thenReturn("sys");
        when(contextBuilder.trimHistory(any())).thenReturn(List.of());
        doThrow(new AiUnavailableException("Ollama is down"))
                .when(ollamaClient).streamChat(any(), any(), any(), any());

        assertThatThrownBy(() -> service.streamChat(alice, req, new ByteArrayOutputStream()))
                .isInstanceOf(AiUnavailableException.class)
                .hasMessageContaining("Ollama is down");
    }
}
