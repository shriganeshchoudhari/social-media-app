package com.socialmedia.dto;

import java.time.LocalDateTime;

public class ApiResponse<T> {

    private String status;
    private T data;
    private String message;
    private LocalDateTime timestamp;

    public ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ApiResponse(String status, T data, String message) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // ─── Getters ───────────────────────────────────────────────────────────────

    public String getStatus() { return status; }
    public T getData() { return data; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public void setStatus(String status) { this.status = status; }
    public void setData(T data) { this.data = data; }
    public void setMessage(String message) { this.message = message; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // ─── Builder ───────────────────────────────────────────────────────────────

    public static <T> Builder<T> builder() {
        return new Builder<>();
    }

    public static class Builder<T> {
        private String status;
        private T data;
        private String message;

        public Builder<T> status(String status) { this.status = status; return this; }
        public Builder<T> data(T data) { this.data = data; return this; }
        public Builder<T> message(String message) { this.message = message; return this; }

        public ApiResponse<T> build() {
            return new ApiResponse<>(status, data, message);
        }
    }
}
