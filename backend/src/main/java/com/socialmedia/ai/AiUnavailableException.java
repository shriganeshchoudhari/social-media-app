package com.socialmedia.ai;

/**
 * Thrown when the Ollama service is not reachable or returns an unexpected error.
 * Mapped to HTTP 503 by GlobalExceptionHandler.
 */
public class AiUnavailableException extends RuntimeException {

    public AiUnavailableException(String message) {
        super(message);
    }

    public AiUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
