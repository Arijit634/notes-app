package com.project.notes_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "app.jwtSecret=testSecret",
    "app.jwtExpirationMs=86400000",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver", 
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.h2.console.enabled=false",
    "hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class NotesBackendApplicationTests {

    @Test
    void contextLoads() {
        // Test that the application context loads successfully
    }
}
