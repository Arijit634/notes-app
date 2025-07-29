package com.project.notes_backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "frontend.url=http://localhost:3000",
    "spring.app.jwtSecret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
    "spring.app.jwtExpirationMs=86400000"
})
class ConfigurationTest {

    @Test
    void testApplicationContextLoads() {
        // Test that the Spring context loads successfully with all configurations
        assertDoesNotThrow(() -> {
            // Context loading is verified by the test running successfully
        });
    }

    @Test
    void testCacheConfiguration() {
        CacheConfig cacheConfig = new CacheConfig();
        assertNotNull(cacheConfig);
    }

    @Test
    void testAppProperties() {
        AppProperties appProperties = new AppProperties();
        assertNotNull(appProperties);

        appProperties.setUrl("http://localhost:3000");
        assertEquals("http://localhost:3000", appProperties.getUrl());
    }

    @Test
    void testJwtProperties() {
        JwtProperties jwtProperties = new JwtProperties();
        assertNotNull(jwtProperties);

        jwtProperties.setJwtSecret("test-secret-key");
        jwtProperties.setJwtExpirationMs(86400000L);

        assertEquals("test-secret-key", jwtProperties.getJwtSecret());
        assertEquals(86400000L, jwtProperties.getJwtExpirationMs());
    }
}
