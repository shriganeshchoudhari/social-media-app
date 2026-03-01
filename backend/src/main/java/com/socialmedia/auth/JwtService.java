package com.socialmedia.auth;

import com.socialmedia.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String UNSAFE_PLACEHOLDER = "CHANGE_ME_local_dev_only_not_safe_for_prod_CHANGE_ME";

    @Value("${jwt.secret}")
    private String secretB64;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Fail fast at startup if the insecure local-dev placeholder is still set.
     * This prevents accidental production deployments with a known-weak secret.
     */
    @PostConstruct
    void validateSecret() {
        if (UNSAFE_PLACEHOLDER.equals(secretB64)) {
            log.warn("[SECURITY] JWT secret is using the local-dev placeholder. "
                    + "Set the JWT_SECRET environment variable before going to production!");
        }
    }

    private SecretKey key() {
        // Expects a Base64URL-encoded 256-bit (32-byte) key.
        // Generate with: openssl rand -base64 32
        return Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(secretB64));
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key())
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        return extractUsername(token).equals(user.getUsername()) && !isExpired(token);
    }

    private boolean isExpired(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
