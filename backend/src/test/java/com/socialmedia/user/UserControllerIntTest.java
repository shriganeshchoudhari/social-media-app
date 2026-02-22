package com.socialmedia.user;

import com.socialmedia.BaseIntegrationTest;
import com.socialmedia.auth.dto.AuthResponse;
import com.socialmedia.auth.dto.RegisterRequest;
import com.socialmedia.user.dto.UpdateProfileRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("UserController – integration tests")
class UserControllerIntTest extends BaseIntegrationTest {

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("dave");
        req.setEmail("dave@test.com");
        req.setPassword("Password1!");
        req.setDisplayName("Dave");

        String body = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andReturn().getResponse().getContentAsString();

        token = objectMapper.readValue(body, AuthResponse.class).getToken();
    }

    @Test
    @DisplayName("GET /users/me → 200 with own profile")
    void getMe_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("dave"));
    }

    @Test
    @DisplayName("GET /users/me without auth → 401")
    void getMe_noAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /users/{username} → 200")
    void getUserByUsername_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/users/dave")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("dave"));
    }

    @Test
    @DisplayName("GET /users/nobody → 404")
    void getUserByUsername_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/users/nobody")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /users/me → 200 with updated bio")
    void updateProfile_returns200() throws Exception {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setBio("My shiny new bio");

        mockMvc.perform(put("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("My shiny new bio"))
                .andExpect(jsonPath("$.displayName").value("Dave")); // unchanged
    }

    @Test
    @DisplayName("GET /users/search?q=da → 200 with results")
    void searchUsers_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/users/search?q=da")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
