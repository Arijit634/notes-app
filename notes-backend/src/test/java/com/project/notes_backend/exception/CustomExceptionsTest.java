package com.project.notes_backend.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CustomExceptionsTest {

    @Test
    void testUnauthorizedAccessExceptionWithMessage() {
        // Given
        String message = "Access denied to this resource";

        // When
        UnauthorizedAccessException exception = new UnauthorizedAccessException(message);

        // Then
        assertEquals(message, exception.getMessage());
    }

    @Test
    void testUnauthorizedAccessExceptionWithMessageAndCause() {
        // Given
        String message = "Access denied";
        Throwable cause = new RuntimeException("Authentication failed");

        // When
        UnauthorizedAccessException exception = new UnauthorizedAccessException(message, cause);

        // Then
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }
}
