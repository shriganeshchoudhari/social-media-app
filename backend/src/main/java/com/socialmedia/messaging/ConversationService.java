package com.socialmedia.messaging;

import com.socialmedia.exception.ResourceNotFoundException;
import com.socialmedia.messaging.dto.ConversationDto;
import com.socialmedia.messaging.dto.MessageDto;
import com.socialmedia.messaging.dto.SendMessageRequest;
import com.socialmedia.user.User;
import com.socialmedia.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository      messageRepository;
    private final UserRepository         userRepository;

    // ── Conversations ─────────────────────────────────────────

    /** Return all conversations the current user participates in. */
    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(User currentUser) {
        return conversationRepository.findByParticipant(currentUser)
                .stream()
                .map(c -> toConversationDto(c, currentUser))
                .toList();
    }

    /**
     * Start a new conversation with recipientId, or return the existing one.
     * Also sends the first message atomically.
     */
    @Transactional
    public MessageDto startOrGetConversation(User sender, SendMessageRequest req) {
        User recipient = userRepository.findById(req.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getRecipientId()));

        if (sender.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Cannot message yourself");
        }

        // Find existing or create new conversation
        Conversation conversation = conversationRepository
                .findBetween(sender, recipient)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.getParticipants().add(sender);
                    c.getParticipants().add(recipient);
                    return conversationRepository.save(c);
                });

        return saveMessage(sender, conversation, req.getContent());
    }

    // ── Messages ──────────────────────────────────────────────

    /** Paginated messages for a conversation (oldest first). */
    @Transactional(readOnly = true)
    public Page<MessageDto> getMessages(Long conversationId, User currentUser, Pageable pageable) {
        Conversation conversation = getConversationForUser(conversationId, currentUser);
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId(), pageable)
                .map(this::toMessageDto);
    }

    /**
     * Persist a new message inside an existing conversation.
     * Called by the REST endpoint AND the WebSocket handler.
     */
    @Transactional
    public MessageDto sendMessage(Long conversationId, User sender, String content) {
        Conversation conversation = getConversationForUser(conversationId, sender);
        return saveMessage(sender, conversation, content);
    }

    /** Mark all messages in a conversation as read. */
    @Transactional
    public void markRead(Long conversationId, User reader) {
        getConversationForUser(conversationId, reader); // access check
        messageRepository.markConversationRead(conversationId, reader.getId());
    }

    // ── Helpers ───────────────────────────────────────────────

    private MessageDto saveMessage(User sender, Conversation conversation, String content) {
        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(content)
                .build();
        message = messageRepository.save(message);

        // Bump conversation updatedAt so it floats to top of list
        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        log.debug("Message saved: conversationId={} senderId={}", conversation.getId(), sender.getId());
        return toMessageDto(message);
    }

    /** Load conversation and verify the current user is a participant. */
    private Conversation getConversationForUser(Long conversationId, User user) {
        Conversation c = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
        boolean isParticipant = c.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(user.getId()));
        if (!isParticipant) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Not a participant in conversation " + conversationId);
        }
        return c;
    }

    private ConversationDto toConversationDto(Conversation c, User currentUser) {
        // The "other" person in this 1:1 chat
        User other = c.getParticipants().stream()
                .filter(p -> !p.getId().equals(currentUser.getId()))
                .findFirst()
                .orElse(currentUser); // fallback (shouldn't happen)

        MessageDto lastMsg = messageRepository
                .findLatestByConversationId(c.getId())
                .map(this::toMessageDto)
                .orElse(null);

        long unread = messageRepository.countUnread(c.getId(), currentUser.getId());

        return ConversationDto.builder()
                .id(c.getId())
                .otherUserId(other.getId())
                .otherUsername(other.getUsername())
                .otherDisplayName(other.getDisplayName())
                .otherAvatarUrl(other.getAvatarUrl())
                .lastMessageContent(lastMsg != null ? lastMsg.getContent() : null)
                .lastMessageSenderUsername(lastMsg != null ? lastMsg.getSenderUsername() : null)
                .lastMessageAt(lastMsg != null ? lastMsg.getCreatedAt() : null)
                .unreadCount(unread)
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private MessageDto toMessageDto(Message m) {
        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderUsername(m.getSender().getUsername())
                .senderAvatarUrl(m.getSender().getAvatarUrl())
                .content(m.getContent())
                .messageType(m.getMessageType())
                .read(m.isRead())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
