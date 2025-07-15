package com.project.notes_backend.exception;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ErrorResponseTest {

    @Test
    void testNoArgsConstructor() {
        // When
        ErrorResponse errorResponse = new ErrorResponse();

        // Then
        assertNotNull(errorResponse);
        assertNull(errorResponse.getTimestamp());
        assertEquals(0, errorResponse.getStatus());
        assertNull(errorResponse.getError());
        assertNull(errorResponse.getMessage());
        assertNull(errorResponse.getPath());
        assertNull(errorResponse.getValidationErrors());
    }

    @Test
    void testAllArgsConstructor() {
        // Given
        LocalDateTime timestamp = LocalDateTime.now();
        int status = 400;
        String error = "Bad Request";
        String message = "Validation failed";
        String path = "/api/notes";
        Map<String, String> validationErrors = new HashMap<>();
        validationErrors.put("title", "Title is required");

        // When
        ErrorResponse errorResponse = new ErrorResponse(timestamp, status, error, message, path, validationErrors);

        // Then
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertEquals(status, errorResponse.getStatus());
        assertEquals(error, errorResponse.getError());
        assertEquals(message, errorResponse.getMessage());
        assertEquals(path, errorResponse.getPath());
        assertEquals(validationErrors, errorResponse.getValidationErrors());
    }

    @Test
    void testBuilder() {
        // Given
        LocalDateTime timestamp = LocalDateTime.now();
        int status = 404;
        String error = "Not Found";
        String message = "Resource not found";
        String path = "/api/notes/123";
        Map<String, String> validationErrors = new HashMap<>();
        validationErrors.put("id", "Invalid ID");

        // When
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .validationErrors(validationErrors)
                .build();

        // Then
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertEquals(status, errorResponse.getStatus());
        assertEquals(error, errorResponse.getError());
        assertEquals(message, errorResponse.getMessage());
        assertEquals(path, errorResponse.getPath());
        assertEquals(validationErrors, errorResponse.getValidationErrors());
    }

    @Test
    void testSettersAndGetters() {
        // Given
        ErrorResponse errorResponse = new ErrorResponse();
        LocalDateTime timestamp = LocalDateTime.now();
        int status = 500;
        String error = "Internal Server Error";
        String message = "Something went wrong";
        String path = "/api/users";
        Map<String, String> validationErrors = new HashMap<>();
        validationErrors.put("email", "Invalid email format");

        // When
        errorResponse.setTimestamp(timestamp);
        errorResponse.setStatus(status);
        errorResponse.setError(error);
        errorResponse.setMessage(message);
        errorResponse.setPath(path);
        errorResponse.setValidationErrors(validationErrors);

        // Then
        assertEquals(timestamp, errorResponse.getTimestamp());
        assertEquals(status, errorResponse.getStatus());
        assertEquals(error, errorResponse.getError());
        assertEquals(message, errorResponse.getMessage());
        assertEquals(path, errorResponse.getPath());
        assertEquals(validationErrors, errorResponse.getValidationErrors());
    }

    @Test
    void testEqualsAndHashCode() {
        // Given
        LocalDateTime timestamp = LocalDateTime.now();
        Map<String, String> validationErrors = new HashMap<>();
        validationErrors.put("field", "error");

        ErrorResponse errorResponse1 = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(400)
                .error("Bad Request")
                .message("Test message")
                .path("/test")
                .validationErrors(validationErrors)
                .build();

        ErrorResponse errorResponse2 = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(400)
                .error("Bad Request")
                .message("Test message")
                .path("/test")
                .validationErrors(validationErrors)
                .build();

        ErrorResponse errorResponse3 = ErrorResponse.builder()
                .timestamp(timestamp)
                .status(404)
                .error("Not Found")
                .message("Different message")
                .path("/different")
                .validationErrors(null)
                .build();

        // Then
        assertEquals(errorResponse1, errorResponse2);
        assertEquals(errorResponse1.hashCode(), errorResponse2.hashCode());
        assertNotEquals(errorResponse1, errorResponse3);
        assertNotEquals(errorResponse1.hashCode(), errorResponse3.hashCode());
    }

    @Test
    void testToString() {
        // Given
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.of(2023, 1, 1, 12, 0))
                .status(400)
                .error("Bad Request")
                .message("Test message")
                .path("/test")
                .build();

        // When
        String toString = errorResponse.toString();

        // Then
        assertNotNull(toString);
        assertTrue(toString.contains("ErrorResponse"));
        assertTrue(toString.contains("400"));
        assertTrue(toString.contains("Bad Request"));
        assertTrue(toString.contains("Test message"));
        assertTrue(toString.contains("/test"));
    }
}
