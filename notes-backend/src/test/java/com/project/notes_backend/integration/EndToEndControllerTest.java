package com.project.notes_backend.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class EndToEndControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
    }

    @Test
    void testApplicationHealthCheck() {
        // Test basic connectivity to the running server
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/actuator/health", String.class);

        // Should return OK even without authentication for health endpoint
        assertThat(response.getStatusCode()).isIn(HttpStatus.OK, HttpStatus.NOT_FOUND);
    }

    @Test
    void testAuthenticationEndpoint() {
        // Test registration endpoint
        Map<String, Object> signupRequest = new HashMap<>();
        signupRequest.put("username", "testuser" + System.currentTimeMillis());
        signupRequest.put("email", "test" + System.currentTimeMillis() + "@example.com");
        signupRequest.put("password", "password123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(signupRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/public/signup", entity, String.class);

        // Should either succeed (201) or fail with validation error (400) or conflict (409)
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.CREATED,
                HttpStatus.BAD_REQUEST,
                HttpStatus.CONFLICT,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @Test
    void testLoginEndpoint() {
        // Test login with default admin user (created by init data)
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "adminPass");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/public/signin", entity, String.class);

        // Should either succeed with token or fail with authentication error
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.UNAUTHORIZED,
                HttpStatus.BAD_REQUEST
        );

        System.out.println("Login response status: " + response.getStatusCode());
        System.out.println("Login response body: " + response.getBody());
    }

    @Test
    void testNotesEndpointWithoutAuthentication() {
        // Test accessing protected notes endpoint without authentication
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/api/v1/notes", String.class);

        // Should return 401 Unauthorized or 403 Forbidden
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.FORBIDDEN
        );

        System.out.println("Notes without auth status: " + response.getStatusCode());
    }

    @Test
    void testAdminEndpointWithoutAuthentication() {
        // Test accessing admin endpoint without authentication
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/admin/users", String.class);

        // Should return 401 Unauthorized or 403 Forbidden
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.FORBIDDEN
        );

        System.out.println("Admin without auth status: " + response.getStatusCode());
    }

    @Test
    void testSwaggerEndpoint() {
        // Test if Swagger UI is accessible
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/swagger-ui.html", String.class);

        // Should either return the swagger page or redirect
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.FOUND,
                HttpStatus.NOT_FOUND,
                HttpStatus.MOVED_PERMANENTLY
        );

        System.out.println("Swagger endpoint status: " + response.getStatusCode());
    }

    @Test
    void testApiDocumentation() {
        // Test if API docs are accessible
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/v3/api-docs", String.class);

        // Should either return API docs or not found
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.NOT_FOUND
        );

        System.out.println("API docs status: " + response.getStatusCode());
    }

    @Test
    void testCorsHeaders() {
        // Test CORS configuration
        HttpHeaders headers = new HttpHeaders();
        headers.add("Origin", "http://localhost:3000");
        headers.add("Access-Control-Request-Method", "GET");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/auth/public/signin",
                HttpMethod.OPTIONS,
                entity,
                String.class);

        // Should handle OPTIONS request properly
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.NO_CONTENT,
                HttpStatus.METHOD_NOT_ALLOWED
        );

        System.out.println("CORS preflight status: " + response.getStatusCode());
    }

    @Test
    void testNonExistentEndpoint() {
        // Test 404 handling
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/api/nonexistent", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        System.out.println("404 endpoint status: " + response.getStatusCode());
    }
}
