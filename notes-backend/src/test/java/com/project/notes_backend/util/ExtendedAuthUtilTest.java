package com.project.notes_backend.util;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ExtendedAuthUtilTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthUtil authUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        Role role = new Role();
        role.setRoleName(AppRole.USER);
        testUser.setRole(role);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testLoggedInUser_Success() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));

        // Act
        User result = authUtil.loggedInUser();

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUserName());
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository).findByUserName("testuser");
    }

    @Test
    void testLoggedInUser_UserNotFound() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authUtil.loggedInUser();
        });
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByUserName("testuser");
    }

    @Test
    void testLoggedInUserId_Success() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Long result = authUtil.loggedInUserId();

        // Assert
        assertEquals(1L, result);
        verify(userRepository).findByUserName("testuser");
    }

    @Test
    void testLoggedInUserId_UserNotFound() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authUtil.loggedInUserId();
        });
        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByUserName("testuser");
    }
}
