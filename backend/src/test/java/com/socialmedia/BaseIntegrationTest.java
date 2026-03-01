package com.socialmedia;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
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
 *
 * TestMvcAsyncConfig replaces the async task executor with SyncTaskExecutor
 * so that StreamingResponseBody (used by AiController) writes to the response
 * synchronously — making the body readable via getContentAsString() in tests.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@ActiveProfiles("test")
@Transactional
@Import(TestMvcAsyncConfig.class)
public abstract class BaseIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    protected MockMvc mockMvc;

    /**
     * Create ObjectMapper manually and call findAndRegisterModules() so it
     * auto-discovers all Jackson modules on the classpath — including
     * jackson-datatype-jsr310 for LocalDateTime support — without needing
     * an explicit import or @Autowired bean (which Spring Boot 4 doesn't expose
     * as an injectable ObjectMapper in the test context).
     */
    protected final ObjectMapper objectMapper =
            new ObjectMapper().findAndRegisterModules();

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
