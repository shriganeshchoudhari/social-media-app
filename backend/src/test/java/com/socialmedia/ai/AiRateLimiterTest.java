package com.socialmedia.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AiRateLimiter – unit tests")
class AiRateLimiterTest {

    private AiRateLimiter limiter;
    private static final long USER_ID = 42L;

    @BeforeEach
    void setUp() {
        limiter = new AiRateLimiter(5);  // small limit for fast testing
    }

    // ── Positive cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("✅ first request for a new user is allowed")
    void firstRequest_allowed() {
        RateLimitStatus status = limiter.check(USER_ID);
        assertThat(status.isAllowed()).isTrue();
        assertThat(status.getRemaining()).isEqualTo(4);
    }

    @Test
    @DisplayName("✅ requests up to the limit are all allowed")
    void requestsUpToLimit_allAllowed() {
        for (int i = 0; i < 5; i++) {
            RateLimitStatus s = limiter.check(USER_ID);
            assertThat(s.isAllowed()).as("request %d should be allowed", i + 1).isTrue();
        }
    }

    @Test
    @DisplayName("✅ remaining count decrements correctly")
    void remainingDecrementsCorrectly() {
        limiter.check(USER_ID);  // remaining → 4
        limiter.check(USER_ID);  // remaining → 3
        RateLimitStatus status = limiter.check(USER_ID);  // remaining → 2
        assertThat(status.getRemaining()).isEqualTo(2);
    }

    @Test
    @DisplayName("✅ different users have independent windows")
    void differentUsers_independentWindows() {
        // Fill user 1's window
        for (int i = 0; i < 5; i++) limiter.check(1L);

        // User 2 should still be allowed
        RateLimitStatus user2 = limiter.check(2L);
        assertThat(user2.isAllowed()).isTrue();
    }

    @Test
    @DisplayName("✅ resetForUser clears the window")
    void resetForUser_clearsWindow() {
        for (int i = 0; i < 5; i++) limiter.check(USER_ID);
        assertThat(limiter.check(USER_ID).isAllowed()).isFalse();

        limiter.resetForUser(USER_ID);
        assertThat(limiter.check(USER_ID).isAllowed()).isTrue();
    }

    @Test
    @DisplayName("✅ resetAt is approximately 1 hour from now")
    void resetAt_isApprox1HourFromNow() {
        RateLimitStatus s = limiter.check(USER_ID);
        Instant expected = Instant.now().plus(1, ChronoUnit.HOURS);
        // allow 5-second tolerance for test execution
        assertThat(s.getResetAt()).isBetween(
                expected.minusSeconds(5),
                expected.plusSeconds(5)
        );
    }

    // ── Negative cases ────────────────────────────────────────────────────────

    @Test
    @DisplayName("❌ request beyond limit is rejected")
    void requestBeyondLimit_rejected() {
        for (int i = 0; i < 5; i++) limiter.check(USER_ID);

        RateLimitStatus status = limiter.check(USER_ID);
        assertThat(status.isAllowed()).isFalse();
        assertThat(status.getRemaining()).isZero();
    }

    @Test
    @DisplayName("❌ rate-limited status has a future resetAt")
    void rateLimited_resetAtIsFuture() {
        for (int i = 0; i < 5; i++) limiter.check(USER_ID);
        RateLimitStatus status = limiter.check(USER_ID);
        assertThat(status.getResetAt()).isAfter(Instant.now());
    }

    @Test
    @DisplayName("❌ many requests beyond limit still rejected")
    void manyBeyondLimit_stillRejected() {
        for (int i = 0; i < 5; i++) limiter.check(USER_ID);

        // Five more attempts — all should be rejected
        for (int i = 0; i < 5; i++) {
            assertThat(limiter.check(USER_ID).isAllowed())
                    .as("attempt %d beyond limit should be rejected", i + 1)
                    .isFalse();
        }
    }
}
