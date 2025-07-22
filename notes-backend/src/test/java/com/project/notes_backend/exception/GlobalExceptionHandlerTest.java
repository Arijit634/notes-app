package com.project.notes_backend.exception;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private MethodArgumentNotValidException methodArgumentNotValidException;

    @Mock
    private BindingResult bindingResult;

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        lenient().when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    void testHandleValidationExceptions() {
        // Arrange
        FieldError fieldError = new FieldError("testObject", "testField", "Test error message");
        when(methodArgumentNotValidException.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError));
        when(methodArgumentNotValidException.getMessage()).thenReturn("Validation failed");

        // Act
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleValidationExceptions(
                methodArgumentNotValidException, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Validation Failed", response.getBody().getError());
        assertEquals("/api/test", response.getBody().getPath());
        assertNotNull(response.getBody().getValidationErrors());
        assertTrue(response.getBody().getValidationErrors().containsKey("testField"));
        assertEquals("Test error message", response.getBody().getValidationErrors().get("testField"));
    }

    @Test
    void testHandleValidationExceptionsMultipleErrors() {
        // Arrange
        FieldError fieldError1 = new FieldError("testObject", "field1", "Error 1");
        FieldError fieldError2 = new FieldError("testObject", "field2", "Error 2");
        when(methodArgumentNotValidException.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getAllErrors()).thenReturn(List.of(fieldError1, fieldError2));
        when(methodArgumentNotValidException.getMessage()).thenReturn("Multiple validation errors");

        // Act
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleValidationExceptions(
                methodArgumentNotValidException, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().getValidationErrors().size());
        assertTrue(response.getBody().getValidationErrors().containsKey("field1"));
        assertTrue(response.getBody().getValidationErrors().containsKey("field2"));
        assertEquals("Error 1", response.getBody().getValidationErrors().get("field1"));
        assertEquals("Error 2", response.getBody().getValidationErrors().get("field2"));
    }

    @Test
    void testHandleUnauthorizedAccessException() {
        // Arrange
        UnauthorizedAccessException exception = new UnauthorizedAccessException("Access denied");

        // Act
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleUnauthorizedAccess(exception, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Access Denied", response.getBody().getError());
        assertEquals("Access denied", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    void testHandleRuntimeException() {
        // Arrange
        RuntimeException exception = new RuntimeException("Runtime error occurred");

        // Act
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleRuntimeException(exception, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Internal Server Error", response.getBody().getError());
        assertEquals("An unexpected error occurred", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    void testHandleGenericException() {
        // Arrange
        Exception exception = new Exception("Generic error");

        // Act
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGenericException(exception, request);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Internal Server Error", response.getBody().getError());
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    void testErrorResponseBuilder() {
        // Act
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(400)
                .error("Bad Request")
                .message("Test message")
                .path("/test")
                .build();

        // Assert
        assertNotNull(errorResponse);
        assertEquals(400, errorResponse.getStatus());
        assertEquals("Bad Request", errorResponse.getError());
        assertEquals("Test message", errorResponse.getMessage());
        assertEquals("/test", errorResponse.getPath());
    }

    @Test
    void testUnauthorizedAccessExceptionCreation() {
        // Act
        UnauthorizedAccessException exception = new UnauthorizedAccessException("Unauthorized");

        // Assert
        assertNotNull(exception);
        assertEquals("Unauthorized", exception.getMessage());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testUnauthorizedAccessExceptionWithNullMessage() {
        // Act
        UnauthorizedAccessException exception = new UnauthorizedAccessException(null);

        // Assert
        assertNotNull(exception);
        assertNull(exception.getMessage());
    }

    @Test
    void testErrorResponseEquality() {
        // Arrange
        ErrorResponse response1 = ErrorResponse.builder()
                .status(400)
                .error("Error")
                .message("Message")
                .path("/path")
                .build();

        ErrorResponse response2 = ErrorResponse.builder()
                .status(400)
                .error("Error")
                .message("Message")
                .path("/path")
                .build();

        // Act & Assert
        assertEquals(response1.getStatus(), response2.getStatus());
        assertEquals(response1.getError(), response2.getError());
        assertEquals(response1.getMessage(), response2.getMessage());
        assertEquals(response1.getPath(), response2.getPath());
    }
}
