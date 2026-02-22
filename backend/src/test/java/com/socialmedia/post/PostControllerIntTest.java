package com.socialmedia.post;

import com.socialmedia.BaseIntegrationTest;
import com.socialmedia.auth.dto.AuthResponse;
import com.socialmedia.auth.dto.RegisterRequest;
import com.socialmedia.post.dto.CreatePostRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("PostController – integration tests")
class PostControllerIntTest extends BaseIntegrationTest {

    private String aliceToken;
    private String bobToken;
    private Long   postId;

    @BeforeEach
    void setUpUsers() throws Exception {
        aliceToken = registerAndGetToken("alice_p", "alice_p@test.com");
        bobToken   = registerAndGetToken("bob_p",   "bob_p@test.com");

        // Create a post as Alice so most tests have something to work with
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("Alice's first post");
        req.setPrivacy(Post.Privacy.PUBLIC);

        String body = mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        postId = objectMapper.readTree(body).get("id").asLong();
    }

    // ── create ────────────────────────────────────────────────

    @Test
    @DisplayName("POST /posts → 201 with content")
    void createPost_returns201() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("A brand new post #hello");
        req.setPrivacy(Post.Privacy.PUBLIC);

        mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("A brand new post #hello"))
                .andExpect(jsonPath("$.author.username").value("alice_p"));
    }

    @Test
    @DisplayName("POST /posts with empty content → 400")
    void createPost_emptyContent_returns400() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("");

        mockMvc.perform(post("/api/v1/posts")
                        .header("Authorization", "Bearer " + aliceToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /posts without auth → 401")
    void createPost_noAuth_returns401() throws Exception {
        CreatePostRequest req = new CreatePostRequest();
        req.setContent("Should fail");

        mockMvc.perform(post("/api/v1/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── getById ───────────────────────────────────────────────

    @Test
    @DisplayName("GET /posts/{id} → 200")
    void getPost_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId));
    }

    @Test
    @DisplayName("GET /posts/99999 → 404")
    void getPost_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/posts/99999")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isNotFound());
    }

    // ── like / unlike ─────────────────────────────────────────

    @Test
    @DisplayName("POST /posts/{id}/like → 200, likesCount = 1")
    void likePost_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likesCount").value(1))
                .andExpect(jsonPath("$.likedByCurrentUser").value(true));
    }

    @Test
    @DisplayName("POST /posts/{id}/like twice → 409 Conflict")
    void likePost_twice_returns409() throws Exception {
        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                .header("Authorization", "Bearer " + bobToken));

        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("DELETE /posts/{id}/like → 200, likesCount = 0")
    void unlikePost_returns200() throws Exception {
        // Like first
        mockMvc.perform(post("/api/v1/posts/" + postId + "/like")
                .header("Authorization", "Bearer " + bobToken));

        mockMvc.perform(delete("/api/v1/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likesCount").value(0))
                .andExpect(jsonPath("$.likedByCurrentUser").value(false));
    }

    // ── delete ────────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /posts/{id} by owner → 204")
    void deletePost_byOwner_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /posts/{id} by non-owner → 403")
    void deletePost_byStranger_returns403() throws Exception {
        mockMvc.perform(delete("/api/v1/posts/" + postId)
                        .header("Authorization", "Bearer " + bobToken))
                .andExpect(status().isForbidden());
    }

    // ── feed ──────────────────────────────────────────────────

    @Test
    @DisplayName("GET /posts/feed → 200 with page")
    void getFeed_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/posts/feed")
                        .header("Authorization", "Bearer " + aliceToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // ── helpers ───────────────────────────────────────────────

    private String registerAndGetToken(String username, String email) throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername(username);
        req.setEmail(email);
        req.setPassword("Password1!");
        req.setDisplayName("Test User");

        String body = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readValue(body, AuthResponse.class).getToken();
    }
}
