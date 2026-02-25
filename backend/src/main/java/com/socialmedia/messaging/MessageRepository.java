package com.socialmedia.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Paginated messages for a conversation, newest last. */
    Page<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);

    /** Count unread messages in a conversation that were sent by the OTHER user. */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.isRead = FALSE
        """)
    long countUnread(@Param("conversationId") Long conversationId,
                     @Param("userId") Long userId);

    /** Mark all messages in a conversation as read (excluding messages sent by the reader). */
    @Modifying
    @Query("""
        UPDATE Message m SET m.isRead = TRUE
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :readerId
          AND m.isRead = FALSE
        """)
    void markConversationRead(@Param("conversationId") Long conversationId,
                               @Param("readerId") Long readerId);

    /** Most recent message in a conversation (for preview). */
    @Query("""
        SELECT m FROM Message m
        WHERE m.conversation.id = :conversationId
        ORDER BY m.createdAt DESC
        LIMIT 1
        """)
    java.util.Optional<Message> findLatestByConversationId(@Param("conversationId") Long conversationId);
}
