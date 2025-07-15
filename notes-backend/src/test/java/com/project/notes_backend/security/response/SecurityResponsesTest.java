package com.project.notes_backend.security.response;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SecurityResponsesTest {

    @Test
    void testMessageResponse() {
        // Given
        String message = "Test message";

        // When
        MessageResponse response = new MessageResponse(message);

        // Then
        assertEquals(message, response.getMessage());

        // Test setter
        String newMessage = "New message";
        response.setMessage(newMessage);
        assertEquals(newMessage, response.getMessage());
    }

    @Test
    void testMessageResponseEquality() {
        // Given
        String message = "Test message";
        MessageResponse response1 = new MessageResponse(message);
        MessageResponse response2 = new MessageResponse(message);

        // Then
        assertEquals(response1.getMessage(), response2.getMessage());
    }

    @Test
    void testMessageResponseNull() {
        // Given
        MessageResponse response = new MessageResponse(null);

        // Then
        assertNull(response.getMessage());
    }
}
