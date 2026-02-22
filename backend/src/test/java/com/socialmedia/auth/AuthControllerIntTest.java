package com.socialmedia.auth;

import com.socialmedia.BaseIntegrationTest;
import com.socialmedia.auth.dto.LoginRequest;
import com.socialmedia.auth.dto.RegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("AuthController – integration tests")
class AuthControllerIntTest extends BaseIntegrationTest {

    private static final String BASE = "/api/v1/auth";

    // ── register ──────────────────────────────────────────────

    @Test
    @DisplayName("POST /register → 201 with token")
    void register_returns201WithToken() throws Exception {
        RegisterRequest req = registerRequest("carol", "carol@test.com");

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.username").value("carol"));
    }

    @Test
    @DisplayName("POST /register with duplicate username → 409")
    void register_duplicateUsername_returns409() throws Exception {
        RegisterRequest req = registerRequest("dup", "dup@test.com");
        mockMvc.perform(post(BASE + "/register").contentType(MediaType.APPLICATION_JSON).content(json(req)));

        // Second registration with same username
        req.setEmail("dup2@test.com");
        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /register with blank username → 400")
    void register_blankUsername_returns400() throws Exception {
        RegisterRequest req = registerRequest("", "x@test.com");

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register with short password → 400")
    void register_shortPassword_returns400() throws Exception {
        RegisterRequest req = registerRequest("shortpw", "s@test.com");
        req.setPassword("abc");

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register with invalid email → 400")
    void register_invalidEmail_returns400() throws Exception {
        RegisterRequest req = registerRequest("userbad", "not-an-email");

        mockMvc.perform(post(BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isBadRequest());
    }

    // ── login ─────────────────────────────────────────────────

    @Test
    @DisplayName("POST /login with valid credentials → 200 with token")
    void login_validCredentials_returns200() throws Exception {
        // Register first
        mockMvc.perform(post(BASE + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(registerRequest("loginuser", "login@test.com"))));

        LoginRequest login = new LoginRequest();
        login.setUsernameOrEmail("loginuser");
        login.setPassword("Password1!");

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("POST /login with wrong password → 401")
    void login_wrongPassword_returns401() throws Exception {
        mockMvc.perform(post(BASE + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(registerRequest("pwtest", "pw@test.com"))));

        LoginRequest login = new LoginRequest();
        login.setUsernameOrEmail("pwtest");
        login.setPassword("WrongPass999!");

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /login with email instead of username → 200")
    void login_byEmail_returns200() throws Exception {
        mockMvc.perform(post(BASE + "/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(registerRequest("emaillogin", "emaillogin@test.com"))));

        LoginRequest login = new LoginRequest();
        login.setUsernameOrEmail("emaillogin@test.com");
        login.setPassword("Password1!");

        mockMvc.perform(post(BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    // ── helpers ───────────────────────────────────────────────

    private RegisterRequest registerRequest(String username, String email) {
        RegisterRequest r = new RegisterRequest();
        r.setUsername(username);
        r.setEmail(email);
        r.setPassword("Password1!");
        r.setDisplayName("Test User");
        return r;
    }
}
