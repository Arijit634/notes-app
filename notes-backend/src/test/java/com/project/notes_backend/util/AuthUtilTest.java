package com.project.notes_backend.util;

import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthUtilTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuthUtil authUtil;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
    }

    @Test
    void testLoggedInUserId_Success() {
        // Given
        String username = "testuser";
        when(authentication.getName()).thenReturn(username);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(userRepository.findByUserName(username)).thenReturn(Optional.of(testUser));

        try (MockedStatic<SecurityContextHolder> mockedSecurityContextHolder = mockStatic(SecurityContextHolder.class)) {
            mockedSecurityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            Long userId = authUtil.loggedInUserId();

            // Then
            assertEquals(1L, userId);
            verify(userRepository).findByUserName(username);
        }
    }

    @Test
    void testLoggedInUserId_UserNotFound() {
        // Given
        String username = "nonexistentuser";
        when(authentication.getName()).thenReturn(username);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(userRepository.findByUserName(username)).thenReturn(Optional.empty());

        try (MockedStatic<SecurityContextHolder> mockedSecurityContextHolder = mockStatic(SecurityContextHolder.class)) {
            mockedSecurityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                authUtil.loggedInUserId();
            });

            assertEquals("User not found", exception.getMessage());
            verify(userRepository).findByUserName(username);
        }
    }

    @Test
    void testLoggedInUser_Success() {
        // Given
        String username = "testuser";
        when(authentication.getName()).thenReturn(username);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(userRepository.findByUserName(username)).thenReturn(Optional.of(testUser));

        try (MockedStatic<SecurityContextHolder> mockedSecurityContextHolder = mockStatic(SecurityContextHolder.class)) {
            mockedSecurityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When
            User user = authUtil.loggedInUser();

            // Then
            assertNotNull(user);
            assertEquals(testUser.getUserId(), user.getUserId());
            assertEquals(testUser.getUserName(), user.getUserName());
            assertEquals(testUser.getEmail(), user.getEmail());
            verify(userRepository).findByUserName(username);
        }
    }

    @Test
    void testLoggedInUser_UserNotFound() {
        // Given
        String username = "nonexistentuser";
        when(authentication.getName()).thenReturn(username);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(userRepository.findByUserName(username)).thenReturn(Optional.empty());

        try (MockedStatic<SecurityContextHolder> mockedSecurityContextHolder = mockStatic(SecurityContextHolder.class)) {
            mockedSecurityContextHolder.when(SecurityContextHolder::getContext).thenReturn(securityContext);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                authUtil.loggedInUser();
            });

            assertEquals("User not found", exception.getMessage());
            verify(userRepository).findByUserName(username);
        }
    }
}
