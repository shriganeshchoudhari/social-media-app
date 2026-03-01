package com.socialmedia.websocket;

import com.socialmedia.messaging.ConversationService;
import com.socialmedia.messaging.dto.MessageDto;
import com.socialmedia.messaging.dto.WsMessageRequest;
import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * STOMP controller — handles messages sent by clients to /app/** destinations.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final ConversationService   conversationService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client sends to:  /app/send-message
     * Server broadcasts the saved message to: /topic/chat/{conversationId}
     * So all participants in that conversation receive it in real time.
     */
    @MessageMapping("/send-message")
    public void handleMessage(@Payload WsMessageRequest request,
                               SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) {
            log.warn("WS send-message received from unauthenticated connection");
            return;
        }

        User sender = (User) ((org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken) principal).getPrincipal();

        try {
            MessageDto saved = conversationService.sendMessage(
                    request.getConversationId(), sender, request.getContent());

            // Broadcast to all subscribers of this conversation's topic
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + request.getConversationId(), saved);

            log.debug("WS message broadcast: conversationId={} sender={}",
                    request.getConversationId(), sender.getUsername());
        } catch (Exception e) {
            log.error("WS send-message error: {}", e.getMessage());
        }
    }

    /**
     * Client sends to:  /app/typing
     * Server broadcasts to: /topic/typing/{conversationId}
     * Payload: { conversationId, isTyping }
     */
    @MessageMapping("/typing")
    public void handleTyping(@Payload java.util.Map<String, Object> payload,
                              SimpMessageHeaderAccessor headerAccessor) {
        Principal principal = headerAccessor.getUser();
        if (principal == null) return;

        User sender = (User) ((org.springframework.security.authentication
                .UsernamePasswordAuthenticationToken) principal).getPrincipal();

        Long conversationId = Long.valueOf(payload.get("conversationId").toString());
        boolean isTyping    = Boolean.parseBoolean(payload.get("isTyping").toString());

        java.util.Map<String, Object> typingPayload = java.util.Map.of(
                "username", sender.getUsername(),
                "isTyping",  isTyping
        );
        messagingTemplate.convertAndSend(
                "/topic/typing/" + conversationId,
                (Object) typingPayload);
    }
}
