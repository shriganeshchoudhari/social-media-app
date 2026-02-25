package com.socialmedia.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory sliding-window rate limiter for the AI chat endpoint.
 *
 * Purpose: protect the local Ollama server from being flooded by a single user
 * when multiple users share the same instance (not cost-based — AI is free).
 *
 * Implementation: per-user ring buffer of request timestamps.
 *   - Requests older than 1 hour are evicted on every check.
 *   - Thread-safe via per-user synchronised deques.
 *   - State lives in memory; resets on application restart (acceptable for dev/local use).
 *
 * Phase 2: swap for Redis-backed version for multi-instance deployments.
 */
@Component
public class AiRateLimiter {

    private final int maxPerHour;

    /** userId → timestamps of recent requests within the rolling 1-hour window. */
    private final ConcurrentHashMap<Long, Deque<Instant>> windows = new ConcurrentHashMap<>();

    public AiRateLimiter(
            @Value("${ai.ratelimit.requests-per-hour:60}") int maxPerHour) {
        this.maxPerHour = maxPerHour;
    }

    /**
     * Check whether {@code userId} may make another request.
     * If allowed, the call is counted against the window.
     */
    public RateLimitStatus check(Long userId) {
        Instant now         = Instant.now();
        Instant windowStart = now.minus(1, ChronoUnit.HOURS);

        Deque<Instant> requests = windows.computeIfAbsent(userId, k -> new ArrayDeque<>());

        synchronized (requests) {
            // evict expired entries
            while (!requests.isEmpty() && requests.peekFirst().isBefore(windowStart)) {
                requests.pollFirst();
            }

            if (requests.size() >= maxPerHour) {
                // Oldest request + 1h = when a slot opens again
                Instant resetAt = requests.peekFirst().plus(1, ChronoUnit.HOURS);
                return new RateLimitStatus(false, 0, resetAt);
            }

            requests.addLast(now);
            int remaining = maxPerHour - requests.size();
            return new RateLimitStatus(true, remaining, now.plus(1, ChronoUnit.HOURS));
        }
    }

    /** Expose maxPerHour for unit-testing convenience. */
    public int getMaxPerHour() {
        return maxPerHour;
    }

    /** Clear the window for a user (test helper). */
    public void resetForUser(Long userId) {
        windows.remove(userId);
    }
}
