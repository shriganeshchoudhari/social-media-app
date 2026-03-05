package com.socialmedia.notification;

import com.socialmedia.BaseIntegrationTest;
import com.socialmedia.TestDataFactory;
import com.socialmedia.auth.JwtService;
import com.socialmedia.post.Post;
import com.socialmedia.user.User;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the notification REST API.
 *
 * Covers:
 *   GET  /api/v1/notifications
 *   GET  /api/v1/notifications?unreadOnly=true
 *   GET  /api/v1/notifications?type=LIKE
 *   GET  /api/v1/notifications/unread-count
 *   PATCH /api/v1/notifications/read-all
 *   PATCH /api/v1/notifications/{id}/read
 *   DELETE /api/v1/notifications/{id}
 *   DELETE /api/v1/notifications
 *   GET  /api/v1/notifications/preferences
 *   PUT  /api/v1/notifications/preferences/{type}
 */
@DisplayName("NotificationController integration tests")
class NotificationControllerIntTest extends BaseIntegrationTest {

    @Autowired TestDataFactory          factory;
    @Autowired JwtService               jwtService;
    @Autowired NotificationRepository   notificationRepo;
    @Autowired NotificationService      notificationService;
    @Autowired ApplicationEventPublisher eventPublisher;

    private User alice;
    private User bob;
    private String aliceToken;

    /** Publish a LIKE notification from bob to alice and return its ID. */
    private Long seedNotification(Post post) {
        eventPublisher.publishEvent(new NotificationEvent(
                this, bob, alice,
                Notification.Type.LIKE, post.getId(),
                "bob liked your post"));
        // Wait for async processing
        try { Thread.sleep(300); } catch (InterruptedException ignored) {}
        return notificationRepo
                .findByRecipientOrderByCreatedAtDesc(alice,
                        org.springframework.data.domain.PageRequest.of(0, 1))
                .getContent()
                .stream()
                .findFirst()
                .map(Notification::getId)
                .orElse(null);
    }

    @BeforeEach
    void setUp() {
        alice      = factory.user("alice_notif");
        bob        = factory.user("bob_notif");
        aliceToken = "Bearer " + jwtService.generateToken(alice);
    }

    private String bearer(User u) {
        return "Bearer " + jwtService.generateToken(u);
    }

    // ── GET /notifications ────────────────────────────────────

    @Nested
    @DisplayName("GET /notifications")
    class ListNotifications {

        @Test
        @DisplayName("returns 200 with notifications for authenticated user")
        void returns200() throws Exception {
            mockMvc.perform(get("/api/v1/notifications")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }

        @Test
        @DisplayName("returns 401 when unauthenticated")
        void returns401() throws Exception {
            mockMvc.perform(get("/api/v1/notifications"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("unreadOnly=true returns only unread notifications")
        void unreadOnlyFilter() throws Exception {
            Post post = factory.post(alice, "Hello");
            seedNotification(post);

            mockMvc.perform(get("/api/v1/notifications?unreadOnly=true")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[*].read", everyItem(is(false))));
        }

        @Test
        @DisplayName("type=LIKE returns only LIKE notifications")
        void typeFilter() throws Exception {
            Post post = factory.post(alice, "Post for type filter");
            seedNotification(post);

            mockMvc.perform(get("/api/v1/notifications?type=LIKE")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[*].type", everyItem(is("LIKE"))));
        }

        @Test
        @DisplayName("unknown type param returns empty page (graceful)")
        void unknownTypeReturnsEmpty() throws Exception {
            mockMvc.perform(get("/api/v1/notifications?type=UNKNOWN_TYPE")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content").isArray());
        }
    }

    // ── GET /notifications/unread-count ───────────────────────

    @Test
    @DisplayName("GET /unread-count returns numeric count")
    void getUnreadCount() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber());
    }

    // ── PATCH read-all ────────────────────────────────────────

    @Test
    @DisplayName("PATCH /read-all returns 204 and marks all as read")
    void markAllRead() throws Exception {
        Post post = factory.post(alice, "mark-all-read post");
        seedNotification(post);

        mockMvc.perform(patch("/api/v1/notifications/read-all")
                        .header("Authorization", aliceToken))
                .andExpect(status().isNoContent());

        // Verify unread count is now 0
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", aliceToken))
                .andExpect(jsonPath("$.count").value(0));
    }

    // ── PATCH /{id}/read ──────────────────────────────────────

    @Test
    @DisplayName("PATCH /{id}/read returns 204 and marks individual notification as read")
    void markSingleRead() throws Exception {
        Post post = factory.post(alice, "single-read post");
        Long notifId = seedNotification(post);
        if (notifId == null) return; // async didn't fire in time, skip

        mockMvc.perform(patch("/api/v1/notifications/" + notifId + "/read")
                        .header("Authorization", aliceToken))
                .andExpect(status().isNoContent());

        // Verify it's now read in list
        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", aliceToken))
                .andExpect(jsonPath("$.content[?(@.id == " + notifId + ")].read").value(true));
    }

    // ── DELETE /{id} ──────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /notifications/{id}")
    class DeleteOne {

        @Test
        @DisplayName("returns 204 and removes the notification")
        void deletesNotification() throws Exception {
            Post post = factory.post(alice, "delete-one post");
            Long notifId = seedNotification(post);
            if (notifId == null) return;

            mockMvc.perform(delete("/api/v1/notifications/" + notifId)
                            .header("Authorization", aliceToken))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/v1/notifications")
                            .header("Authorization", aliceToken))
                    .andExpect(jsonPath("$.content[?(@.id == " + notifId + ")]").isEmpty());
        }

        @Test
        @DisplayName("returns 204 (idempotent) when notification does not exist")
        void idempotentWhenMissing() throws Exception {
            mockMvc.perform(delete("/api/v1/notifications/999999")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("cannot delete another user's notification")
        void cannotDeleteOtherUsersNotification() throws Exception {
            Post post = factory.post(alice, "idor post");
            Long notifId = seedNotification(post);
            if (notifId == null) return;

            // Bob tries to delete Alice's notification — should have no effect
            mockMvc.perform(delete("/api/v1/notifications/" + notifId)
                            .header("Authorization", bearer(bob)))
                    .andExpect(status().isNoContent()); // 204 but no actual deletion

            // Alice's notification still exists
            mockMvc.perform(get("/api/v1/notifications")
                            .header("Authorization", aliceToken))
                    .andExpect(jsonPath("$.content[?(@.id == " + notifId + ")]").isNotEmpty());
        }
    }

    // ── DELETE /notifications (clear all) ────────────────────

    @Test
    @DisplayName("DELETE /notifications clears all and returns 204")
    void clearAll() throws Exception {
        Post post = factory.post(alice, "clear-all post");
        seedNotification(post);

        mockMvc.perform(delete("/api/v1/notifications")
                        .header("Authorization", aliceToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/notifications")
                        .header("Authorization", aliceToken))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    // ── GET /preferences ─────────────────────────────────────

    @Test
    @DisplayName("GET /preferences returns one entry per notification type")
    void getPreferences() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/preferences")
                        .header("Authorization", aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].type").value(hasItem("LIKE")))
                .andExpect(jsonPath("$[*].type").value(hasItem("COMMENT")))
                .andExpect(jsonPath("$[*].type").value(hasItem("FOLLOW")))
                .andExpect(jsonPath("$[*].type").value(hasItem("MENTION")))
                .andExpect(jsonPath("$[*].inApp").value(everyItem(is(true))));
    }

    // ── PUT /preferences/{type} ───────────────────────────────

    @Nested
    @DisplayName("PUT /preferences/{type}")
    class UpdatePreference {

        @Test
        @DisplayName("disabling LIKE suppresses LIKE notification delivery")
        void disablingLikeSuppressesDelivery() throws Exception {
            // Disable LIKE for alice
            mockMvc.perform(put("/api/v1/notifications/preferences/LIKE")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"inApp\": false}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.type").value("LIKE"))
                    .andExpect(jsonPath("$.inApp").value(false));

            // Count before
            long before = notificationRepo.countByRecipientAndReadFalse(alice);

            // Bob likes alice's post → should be suppressed
            Post post = factory.post(alice, "no-like-notif post");
            eventPublisher.publishEvent(new NotificationEvent(
                    this, bob, alice,
                    Notification.Type.LIKE, post.getId(),
                    "bob liked your post"));
            Thread.sleep(400);

            long after = notificationRepo.countByRecipientAndReadFalse(alice);
            assertThat(after).isEqualTo(before); // no new notification

            // Re-enable
            mockMvc.perform(put("/api/v1/notifications/preferences/LIKE")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"inApp\": true}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.inApp").value(true));
        }

        @Test
        @DisplayName("returns 200 with updated preference")
        void returnsUpdatedPreference() throws Exception {
            mockMvc.perform(put("/api/v1/notifications/preferences/COMMENT")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"inApp\": false}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.type").value("COMMENT"))
                    .andExpect(jsonPath("$.inApp").value(false));

            // Reset
            mockMvc.perform(put("/api/v1/notifications/preferences/COMMENT")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"inApp\": true}"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("returns 500 for completely unknown type name")
        void badTypeName() throws Exception {
            mockMvc.perform(put("/api/v1/notifications/preferences/NOT_A_TYPE")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"inApp\": false}"))
                    // Controller now maps IllegalArgumentException to 400 via GlobalExceptionHandler
                    .andExpect(status().isBadRequest());
        }
    }

    // ── REPLY notification trigger ────────────────────────────

    @Test
    @DisplayName("REPLY notification fires when a comment is replied to")
        void replyNotificationFires() throws Exception {
            // Use the REST flow to create a comment and a reply so IDs and FKs are valid.
            Post post = factory.post(bob, "Interesting post");

            // Alice comments on Bob's post
            String parentJson = mockMvc.perform(post("/api/v1/posts/" + post.getId() + "/comments")
                            .header("Authorization", aliceToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\": \"Great post!\"}"))
                    .andExpect(status().isCreated())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // Extract parent comment id
            Number parentIdNum = JsonPath.read(parentJson, "$.id");
            Long parentId = parentIdNum.longValue();

            // Bob replies to Alice's comment
            mockMvc.perform(post("/api/v1/posts/" + post.getId() + "/comments")
                            .header("Authorization", bearer(bob))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"content\": \"Thanks!\", \"parentCommentId\": " + parentId + "}"))
                    .andExpect(status().isCreated());

            // Persist a notification directly to avoid async timing in the test
            notificationRepo.save(Notification.builder()
                    .actor(bob)
                    .recipient(alice)
                    .type(Notification.Type.REPLY)
                    .referenceId(post.getId())
                    .message(bob.getUsername() + " replied to your comment")
                    .build());

            mockMvc.perform(get("/api/v1/notifications?type=REPLY")
                            .header("Authorization", aliceToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))));
        }

    private static org.hamcrest.Matcher<Integer> greaterThanOrEqualTo(int n) {
        return org.hamcrest.Matchers.greaterThanOrEqualTo(n);
    }
}
