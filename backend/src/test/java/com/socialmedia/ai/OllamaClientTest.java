package com.socialmedia.ai;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;

@DisplayName("OllamaClient – unit tests (MockWebServer)")
class OllamaClientTest {

    private MockWebServer mockServer;
    private OllamaClient  client;

    /** NDJSON stream returned by a successful Ollama response. */
    private static final String OLLAMA_STREAM =
            "{\"model\":\"llama3.2:3b\",\"message\":{\"role\":\"assistant\",\"content\":\"Hello\"},\"done\":false}\n" +
            "{\"model\":\"llama3.2:3b\",\"message\":{\"role\":\"assistant\",\"content\":\" world\"},\"done\":false}\n" +
            "{\"model\":\"llama3.2:3b\",\"message\":{\"role\":\"assistant\",\"content\":\"\"},\"done\":true,\"done_reason\":\"stop\"}\n";

    @BeforeEach
    void setUp() throws IOException {
        mockServer = new MockWebServer();
        mockServer.start();
        String baseUrl = mockServer.url("").toString().replaceAll("/$", "");
        client = new OllamaClient(baseUrl, "llama3.2:3b", 64);
    }

    @AfterEach
    void tearDown() throws IOException {
        mockServer.shutdown();
    }

    // ── Positive cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ streamChat writes delta tokens and done marker to output stream")
    void streamChat_writesTokensAndDone() throws IOException {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .addHeader("Content-Type", "application/x-ndjson")
                .setBody(OLLAMA_STREAM));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        client.streamChat("You are Spark.", List.of(), "Hello!", out);

        String result = out.toString();
        assertThat(result).contains("{\"delta\":\"Hello\"}");
        assertThat(result).contains("{\"delta\":\" world\"}");
        assertThat(result).contains("{\"done\":true}");
    }

    @Test
    @DisplayName("✅ streamChat sends correct JSON body to Ollama /api/chat")
    void streamChat_sendsCorrectRequestBody() throws IOException, InterruptedException {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(OLLAMA_STREAM));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        client.streamChat("system prompt", List.of(), "user message", out);

        RecordedRequest req = mockServer.takeRequest(1, TimeUnit.SECONDS);
        assertThat(req).isNotNull();
        assertThat(req.getPath()).isEqualTo("/api/chat");
        assertThat(req.getMethod()).isEqualTo("POST");

        String body = req.getBody().readUtf8();
        assertThat(body).contains("\"model\":\"llama3.2:3b\"");
        assertThat(body).contains("\"stream\":true");
        assertThat(body).contains("system prompt");
        assertThat(body).contains("user message");
    }

    @Test
    @DisplayName("✅ streamChat includes conversation history in messages array")
    void streamChat_includesHistory() throws IOException, InterruptedException {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(OLLAMA_STREAM));

        var history = List.of(
                new com.socialmedia.ai.dto.OllamaMessage("user", "Hi"),
                new com.socialmedia.ai.dto.OllamaMessage("assistant", "Hello!")
        );

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        client.streamChat("sys", history, "next message", out);

        RecordedRequest req = mockServer.takeRequest(1, TimeUnit.SECONDS);
        String body = req.getBody().readUtf8();
        assertThat(body).contains("\"Hi\"");
        assertThat(body).contains("\"Hello!\"");
    }

    @Test
    @DisplayName("✅ isHealthy returns true when Ollama responds 200")
    void isHealthy_trueWhenOllamaUp() {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("{\"version\":\"0.5.1\"}"));

        assertThat(client.isHealthy()).isTrue();
    }

    @Test
    @DisplayName("✅ isHealthy returns false when Ollama returns non-200")
    void isHealthy_falseWhenOllamaError() {
        mockServer.enqueue(new MockResponse().setResponseCode(500));
        assertThat(client.isHealthy()).isFalse();
    }

    @Test
    @DisplayName("✅ empty content tokens are skipped — no blank delta lines")
    void streamChat_skipsEmptyContentTokens() throws IOException {
        String streamWithEmpties =
                "{\"message\":{\"content\":\"Hi\"},\"done\":false}\n" +
                "{\"message\":{\"content\":\"\"},\"done\":false}\n" +
                "{\"message\":{\"content\":\"!\"},\"done\":false}\n" +
                "{\"done\":true}\n";

        mockServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(streamWithEmpties));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        client.streamChat("sys", List.of(), "msg", out);

        String result = out.toString();
        // Should have "Hi" and "!" but NOT an empty delta
        assertThat(result).contains("{\"delta\":\"Hi\"}");
        assertThat(result).contains("{\"delta\":\"!\"}");
        assertThat(result).doesNotContain("{\"delta\":\"\"}");
    }

    // ── Negative cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("❌ streamChat throws AiUnavailableException when Ollama returns 503")
    void streamChat_throws_whenOllamaReturns503() {
        mockServer.enqueue(new MockResponse()
                .setResponseCode(503)
                .setBody("Service Unavailable"));

        assertThatThrownBy(() ->
                client.streamChat("sys", List.of(), "msg", new ByteArrayOutputStream())
        ).isInstanceOf(AiUnavailableException.class);
    }

    @Test
    @DisplayName("❌ isHealthy returns false when server is unreachable")
    void isHealthy_falseWhenUnreachable() throws IOException {
        // shut down the mock server so connection is refused
        mockServer.shutdown();
        OllamaClient unreachable = new OllamaClient("http://localhost:1", "llama3.2:3b", 64);
        assertThat(unreachable.isHealthy()).isFalse();
    }
}
