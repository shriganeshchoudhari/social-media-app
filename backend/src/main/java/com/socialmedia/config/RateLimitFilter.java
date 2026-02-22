package com.socialmedia.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simple in-process token-bucket rate limiter per remote IP.
 *
 * Configuration (application.properties):
 *   app.ratelimit.requests-per-minute=120   # bucket capacity & refill rate
 *   app.ratelimit.enabled=true
 *
 * For production, replace with a distributed solution (e.g. Redis + Bucket4j).
 */
@Component
@Order(1)                   // runs before Spring Security
public class RateLimitFilter implements Filter {

    @Value("${app.ratelimit.requests-per-minute:120}")
    private int requestsPerMinute;

    @Value("${app.ratelimit.enabled:true}")
    private boolean enabled;

    private static final long WINDOW_MS = TimeUnit.MINUTES.toMillis(1);

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (!enabled) { chain.doFilter(request, response); return; }

        HttpServletRequest  httpReq  = (HttpServletRequest)  request;
        HttpServletResponse httpResp = (HttpServletResponse) response;

        // Skip rate-limiting for serving uploaded files (CDN-like endpoint)
        String path = httpReq.getRequestURI();
        if (path.startsWith("/api/v1/media/files/")) { chain.doFilter(request, response); return; }

        String ip = resolveIp(httpReq);
        Bucket bucket = buckets.computeIfAbsent(ip, k -> new Bucket(requestsPerMinute));

        if (bucket.tryConsume()) {
            httpResp.setHeader("X-RateLimit-Limit",     String.valueOf(requestsPerMinute));
            httpResp.setHeader("X-RateLimit-Remaining", String.valueOf(bucket.remaining()));
            chain.doFilter(request, response);
        } else {
            httpResp.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResp.setContentType("application/json");
            httpResp.getWriter().write(
                    "{\"error\":\"Too many requests – please slow down\",\"status\":429}");
        }
    }

    /** Prefer X-Forwarded-For (behind a proxy/load-balancer). */
    private String resolveIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

    // ── Token bucket ──────────────────────────────────────────

    private static class Bucket {
        private final int        capacity;
        private final AtomicInteger tokens;
        private final AtomicLong    windowStart;

        Bucket(int capacity) {
            this.capacity    = capacity;
            this.tokens      = new AtomicInteger(capacity);
            this.windowStart = new AtomicLong(System.currentTimeMillis());
        }

        boolean tryConsume() {
            refillIfNeeded();
            int current;
            do {
                current = tokens.get();
                if (current <= 0) return false;
            } while (!tokens.compareAndSet(current, current - 1));
            return true;
        }

        int remaining() { refillIfNeeded(); return Math.max(0, tokens.get()); }

        private void refillIfNeeded() {
            long now   = System.currentTimeMillis();
            long start = windowStart.get();
            if (now - start >= WINDOW_MS) {
                // Reset window
                if (windowStart.compareAndSet(start, now)) {
                    tokens.set(capacity);
                }
            }
        }
    }
}
