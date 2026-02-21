package com.socialmedia.dto;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long userId;
    private String username;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String token, String type, Long userId, String username, String email) {
        this.token = token;
        this.type = type != null ? type : "Bearer";
        this.userId = userId;
        this.username = username;
        this.email = email;
    }

    // ─── Getters ───────────────────────────────────────────────────────────────

    public String getToken() { return token; }
    public String getType() { return type; }
    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setToken(String token) { this.token = token; }
    public void setType(String type) { this.type = type; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }

    // ─── Builder ───────────────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private String type = "Bearer";
        private Long userId;
        private String username;
        private String email;

        public Builder token(String token) { this.token = token; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, type, userId, username, email);
        }
    }
}
