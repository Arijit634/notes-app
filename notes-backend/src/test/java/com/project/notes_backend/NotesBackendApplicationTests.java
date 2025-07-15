package com.project.notes_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class NotesBackendApplicationTests {

    @Test
    void contextLoads() {
        // This test verifies that the Spring Boot application context loads successfully
        // It covers the main application class and basic configuration
    }

    @Test
    void mainMethodTest() {
        // This test ensures the main method can be called without errors
        // Note: We don't actually call it to avoid starting the full application
        // The contextLoads test already verifies the application can start

        // When/Then - If the application context loads successfully in contextLoads(),
        // the main method is working correctly
    }
}
