package com.socialmedia.ai;

import java.time.Instant;

/**
 * Thrown when a user exceeds their AI request rate limit.
 * Mapped to HTTP 429 by GlobalExceptionHandler.
 */
public class AiRateLimitException extends RuntimeException {

    private final int     remaining;
    private final Instant resetAt;

    public AiRateLimitException(int remaining, Instant resetAt) {
        super("AI rate limit reached. Resets at " + resetAt);
        this.remaining = remaining;
        this.resetAt   = resetAt;
    }

    public int     getRemaining() { return remaining; }
    public Instant getResetAt()   { return resetAt; }
}
