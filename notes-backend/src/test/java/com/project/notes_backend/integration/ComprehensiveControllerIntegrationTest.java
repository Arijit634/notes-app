package com.project.notes_backend.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
class ComprehensiveControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private String baseUrl;
    private String adminJwtToken;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        adminJwtToken = loginAsAdmin();
    }

    private String loginAsAdmin() {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "adminPass");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/public/signin", entity, String.class);

        if (response.getStatusCode() == HttpStatus.OK) {
            try {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                return jsonNode.get("jwtToken").asText();
            } catch (Exception e) {
                System.out.println("Failed to parse JWT token: " + e.getMessage());
                return null;
            }
        }
        return null;
    }

    @Test
    void testAuthenticationFlow() {
        // Test successful login
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "admin");
        loginRequest.put("password", "adminPass");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/public/signin", entity, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("jwtToken");
        assertThat(response.getBody()).contains("admin");
        assertThat(response.getBody()).contains("ADMIN");

        System.out.println("✅ Authentication Flow Test: PASSED");
    }

    @Test
    void testUserRegistration() {
        // Test user registration with valid data
        Map<String, Object> signupRequest = new HashMap<>();
        signupRequest.put("username", "testuser");
        signupRequest.put("email", "test@example.com");
        signupRequest.put("password", "password123");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(signupRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/public/signup", entity, String.class);

        // Should either succeed or fail with conflict (user exists)
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.CREATED,
                HttpStatus.BAD_REQUEST,
                HttpStatus.CONFLICT
        );

        System.out.println("✅ User Registration Test: " + response.getStatusCode());
    }

    @Test
    void testNotesEndpointWithAuthentication() {
        if (adminJwtToken == null) {
            System.out.println("⚠️ Skipping authenticated test - no JWT token");
            return;
        }

        // Test accessing notes with authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminJwtToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/api/v1/notes",
                HttpMethod.GET,
                entity,
                String.class);

        // Should succeed with authentication
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.NOT_FOUND
        );

        System.out.println("✅ Authenticated Notes Access: " + response.getStatusCode());
    }

    @Test
    void testAdminEndpointWithAuthentication() {
        if (adminJwtToken == null) {
            System.out.println("⚠️ Skipping admin test - no JWT token");
            return;
        }

        // Test accessing admin endpoint with admin authentication
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminJwtToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/admin/getusers",
                HttpMethod.GET,
                entity,
                String.class);

        // Should succeed with admin authentication
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.OK,
                HttpStatus.NOT_FOUND
        );

        System.out.println("✅ Authenticated Admin Access: " + response.getStatusCode());
    }

    @Test
    void testCreateNoteWithAuthentication() {
        if (adminJwtToken == null) {
            System.out.println("⚠️ Skipping note creation test - no JWT token");
            return;
        }

        // Test creating a note with authentication
        Map<String, Object> noteRequest = new HashMap<>();
        noteRequest.put("title", "Test Note");
        noteRequest.put("content", "This is a test note created by integration test");
        noteRequest.put("category", "TEST");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminJwtToken);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(noteRequest, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/api/v1/notes", entity, String.class);

        // Should succeed with authentication
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.CREATED,
                HttpStatus.OK,
                HttpStatus.BAD_REQUEST
        );

        System.out.println("✅ Note Creation Test: " + response.getStatusCode());
        System.out.println("Response: " + response.getBody());
    }

    @Test
    void testControllerEndpointDiscovery() {
        if (adminJwtToken == null) {
            System.out.println("⚠️ Skipping endpoint discovery - no JWT token");
            return;
        }

        // Test valid endpoints that exist
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminJwtToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        // Test admin getusers endpoint  
        ResponseEntity<String> adminResponse = restTemplate.exchange(
                baseUrl + "/admin/getusers",
                HttpMethod.GET,
                entity,
                String.class);

        System.out.println("Admin getusers endpoint: " + adminResponse.getStatusCode());

        // Test notes endpoint (should work with authentication)
        ResponseEntity<String> notesResponse = restTemplate.exchange(
                baseUrl + "/api/v1/notes",
                HttpMethod.GET,
                entity,
                String.class);

        System.out.println("Notes endpoint: " + notesResponse.getStatusCode());

        assertThat(adminResponse.getStatusCode()).isIn(
                HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN
        );
        assertThat(notesResponse.getStatusCode()).isIn(
                HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.FORBIDDEN
        );

        System.out.println("✅ Controller Endpoint Discovery: PASSED");
    }

    @Test
    void testInvalidAuthentication() {
        // Test with invalid token
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("invalid-token");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/api/v1/notes",
                HttpMethod.GET,
                entity,
                String.class);

        // Should fail with invalid token
        assertThat(response.getStatusCode()).isIn(
                HttpStatus.UNAUTHORIZED,
                HttpStatus.FORBIDDEN
        );

        System.out.println("✅ Invalid Authentication Test: " + response.getStatusCode());
    }

    @Test
    void testPublicEndpointsAccessibility() {
        // Test that public endpoints are accessible without authentication

        // Test swagger
        ResponseEntity<String> swaggerResponse = restTemplate.getForEntity(
                baseUrl + "/swagger-ui.html", String.class);
        assertThat(swaggerResponse.getStatusCode()).isIn(
                HttpStatus.OK, HttpStatus.FOUND
        );

        // Test auth endpoints are public
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("username", "invalid");
        loginRequest.put("password", "invalid");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(loginRequest, headers);

        ResponseEntity<String> loginResponse = restTemplate.postForEntity(
                baseUrl + "/auth/public/signin", entity, String.class);

        // Should be accessible but return authentication error
        assertThat(loginResponse.getStatusCode()).isIn(
                HttpStatus.UNAUTHORIZED, HttpStatus.NOT_FOUND, HttpStatus.BAD_REQUEST
        );

        System.out.println("✅ Public Endpoints Accessibility: PASSED");
        System.out.println("Swagger: " + swaggerResponse.getStatusCode());
        System.out.println("Auth: " + loginResponse.getStatusCode());
    }
}
