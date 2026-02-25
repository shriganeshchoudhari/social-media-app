package com.socialmedia.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmedia.ai.dto.OllamaMessage;
import com.socialmedia.ai.dto.OllamaRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Low-level HTTP client that talks to the Ollama REST API.
 *
 * Uses Java 21's built-in {@link HttpClient} — zero extra dependencies.
 *
 * Ollama API docs: https://github.com/ollama/ollama/blob/main/docs/api.md
 */
@Component
public class OllamaClient {

    private static final Logger log = LoggerFactory.getLogger(OllamaClient.class);

    private final String  baseUrl;
    private final String  model;
    private final int     numPredict;
    private final HttpClient http;
    private final ObjectMapper mapper;

    public OllamaClient(
            @Value("${ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${ai.model:llama3.2:3b}") String model,
            @Value("${ai.max-tokens:1024}") int numPredict) {
        this.baseUrl    = baseUrl;
        this.model      = model;
        this.numPredict = numPredict;
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mapper = new ObjectMapper();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Stream a chat response from Ollama, writing NDJSON tokens to {@code out}.
     *
     * Each non-empty token is written as:   {@code {"delta":"<token>"}\n}
     * When the stream ends:                 {@code {"done":true}\n}
     *
     * @param systemPrompt  full system prompt (persona + user context)
     * @param history       previous conversation turns (user + assistant)
     * @param userMessage   the user's latest message
     * @param out           the servlet output stream to write tokens into
     * @throws AiUnavailableException if Ollama is not reachable
     */
    public void streamChat(String systemPrompt,
                           List<OllamaMessage> history,
                           String userMessage,
                           OutputStream out) throws IOException {
        List<OllamaMessage> messages = buildMessages(systemPrompt, history, userMessage);

        OllamaRequest req = OllamaRequest.builder()
                .model(model)
                .stream(true)
                .messages(messages)
                .options(Map.of(
                        "temperature", 0.7,
                        "num_predict", numPredict,
                        "top_p", 0.9
                ))
                .build();

        String requestBody = mapper.writeValueAsString(req);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/chat"))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(120))
                .build();

        HttpResponse<InputStream> response;
        try {
            response = http.send(httpRequest, HttpResponse.BodyHandlers.ofInputStream());
        } catch (ConnectException e) {
            log.warn("Ollama not reachable at {}: {}", baseUrl, e.getMessage());
            throw new AiUnavailableException("Ollama is not running at " + baseUrl, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new AiUnavailableException("AI request interrupted", e);
        }

        if (response.statusCode() != 200) {
            String body = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
            log.error("Ollama returned HTTP {}: {}", response.statusCode(), body);

            // 404 means the model hasn't been pulled yet — give a clear action message
            if (response.statusCode() == 404 && body.contains("not found")) {
                throw new AiUnavailableException(
                        "AI model '" + model + "' not found in Ollama. " +
                        "Run: ollama pull " + model);
            }
            throw new AiUnavailableException("Ollama returned HTTP " + response.statusCode());
        }

        // Stream NDJSON lines → write {"delta":"..."}\n to client
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                processLine(line, out);
            }
        }

        // Signal end-of-stream
        writeLine(out, "{\"done\":true}");
        out.flush();
    }

    /**
     * Ping Ollama's /api/version to check reachability.
     *
     * @return true if reachable, false otherwise
     */
    public boolean isHealthy() {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/api/version"))
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();
            HttpResponse<Void> res = http.send(req, HttpResponse.BodyHandlers.discarding());
            return res.statusCode() == 200;
        } catch (Exception e) {
            log.debug("Ollama health check failed: {}", e.getMessage());
            return false;
        }
    }

    public String getModel()   { return model; }
    public String getBaseUrl() { return baseUrl; }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void processLine(String ndjsonLine, OutputStream out) throws IOException {
        try {
            JsonNode root = mapper.readTree(ndjsonLine);

            boolean done = root.path("done").asBoolean(false);
            if (done) return; // final line handled by caller

            JsonNode content = root.path("message").path("content");
            if (!content.isMissingNode() && !content.asText().isEmpty()) {
                String delta = content.asText();
                // Escape the delta for JSON
                String jsonDelta = mapper.writeValueAsString(Map.of("delta", delta));
                writeLine(out, jsonDelta);
            }
        } catch (Exception e) {
            log.debug("Skipping unparseable Ollama line: {}", ndjsonLine);
        }
    }

    private void writeLine(OutputStream out, String line) throws IOException {
        out.write((line + "\n").getBytes(StandardCharsets.UTF_8));
        out.flush();
    }

    private List<OllamaMessage> buildMessages(String systemPrompt,
                                               List<OllamaMessage> history,
                                               String userMessage) {
        var messages = new java.util.ArrayList<OllamaMessage>();
        messages.add(new OllamaMessage("system", systemPrompt));
        if (history != null) {
            messages.addAll(history);
        }
        messages.add(new OllamaMessage("user", userMessage));
        return messages;
    }
}
