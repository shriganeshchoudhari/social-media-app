package com.socialmedia.messaging;

import com.socialmedia.messaging.dto.ConversationDto;
import com.socialmedia.messaging.dto.MessageDto;
import com.socialmedia.messaging.dto.SendMessageRequest;
import com.socialmedia.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final ConversationService conversationService;

    // ── GET /api/v1/messages/conversations ─────────────────────
    /** List all conversations for the current user. */
    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @AuthenticationPrincipal User currentUser) {
        List<ConversationDto> conversations = conversationService.getConversations(currentUser);
        return ResponseEntity.ok(Map.of("status", "success", "data", conversations));
    }

    // ── POST /api/v1/messages ──────────────────────────────────
    /**
     * Start or continue a conversation.
     * If a conversation with the recipient already exists, the message is appended.
     * Returns the sent message + the conversation ID.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SendMessageRequest req) {
        MessageDto message = conversationService.startOrGetConversation(currentUser, req);
        return ResponseEntity.ok(Map.of("status", "success", "data", message));
    }

    // ── GET /api/v1/messages/conversations/{id}/messages ───────
    /** Paginated message history for one conversation. */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "40") int size) {
        Page<MessageDto> messages = conversationService.getMessages(
                conversationId, currentUser, PageRequest.of(page, size));
        return ResponseEntity.ok(Map.of("status", "success", "data", messages));
    }

    // ── PUT /api/v1/messages/conversations/{id}/read ───────────
    /** Mark all messages in a conversation as read. */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Map<String, Object>> markRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal User currentUser) {
        conversationService.markRead(conversationId, currentUser);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Marked as read"));
    }
}
