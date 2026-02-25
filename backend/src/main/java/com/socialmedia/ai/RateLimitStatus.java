package com.socialmedia.ai;

import lombok.Getter;

import java.time.Instant;

/**
 * Result of an AI rate-limit check for a user.
 */
@Getter
public class RateLimitStatus {

    private final boolean allowed;
    private final int     remaining;   // requests remaining in the current window
    private final Instant resetAt;     // when the oldest request falls out of the window

    public RateLimitStatus(boolean allowed, int remaining, Instant resetAt) {
        this.allowed   = allowed;
        this.remaining = remaining;
        this.resetAt   = resetAt;
    }
}
