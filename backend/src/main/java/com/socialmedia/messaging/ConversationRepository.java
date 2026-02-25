package com.socialmedia.messaging;

import com.socialmedia.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * All conversations that include the given user, most-recently-active first.
     */
    @Query("""
        SELECT DISTINCT c FROM Conversation c
        JOIN c.participants p
        WHERE p = :user
        ORDER BY c.updatedAt DESC
        """)
    List<Conversation> findByParticipant(@Param("user") User user);

    /**
     * Find an existing 1:1 conversation between exactly these two users.
     * Returns empty if no such conversation exists yet.
     */
    @Query("""
        SELECT c FROM Conversation c
        JOIN c.participants p1
        JOIN c.participants p2
        WHERE p1 = :userA AND p2 = :userB
          AND SIZE(c.participants) = 2
        """)
    Optional<Conversation> findBetween(@Param("userA") User userA,
                                        @Param("userB") User userB);
}
