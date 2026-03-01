package com.socialmedia;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.core.task.support.TaskExecutorAdapter;
import org.springframework.web.servlet.config.annotation.AsyncSupportConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Overrides the MVC async task executor with a synchronous one for tests.
 *
 * Why: AiController returns ResponseEntity<StreamingResponseBody>.
 * Spring MVC executes StreamingResponseBody on an AsyncTaskExecutor,
 * which is async by default. In MockMvc tests, andReturn() is called before
 * the async task completes, so getContentAsString() returns "".
 *
 * TaskExecutorAdapter(Runnable::run) runs the task inline on the calling
 * thread, so the response body is fully written before andReturn() returns.
 *
 * Note: SyncTaskExecutor was removed as a valid option because Spring 6+
 * requires AsyncTaskExecutor — TaskExecutorAdapter bridges that gap.
 */
@TestConfiguration
public class TestMvcAsyncConfig implements WebMvcConfigurer {

    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer configurer) {
        // Runnable::run executes tasks inline (synchronously) on the calling thread.
        // TaskExecutorAdapter implements AsyncTaskExecutor so Spring 6 accepts it.
        configurer.setTaskExecutor(new TaskExecutorAdapter(Runnable::run));
    }
}
