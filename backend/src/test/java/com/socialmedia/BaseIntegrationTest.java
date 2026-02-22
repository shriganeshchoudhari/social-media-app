package com.socialmedia;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

/**
 * Base class for integration tests.
 * Spins up the full Spring context with an H2 in-memory database.
 * Each test method runs in a transaction that is rolled back on completion.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
public abstract class BaseIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    protected MockMvc mockMvc;

    // ObjectMapper is not auto-registered as a bean in Spring Boot 4 test context;
    // create it directly to avoid NoSuchBeanDefinitionException.
    protected final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUpMockMvc() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity())
                .build();
    }

    /** Helper: serialise any object to JSON string. */
    protected String json(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }
}
