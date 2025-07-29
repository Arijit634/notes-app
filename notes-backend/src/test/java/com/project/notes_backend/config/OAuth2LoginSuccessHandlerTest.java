package com.project.notes_backend.config;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.RoleRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.security.UserDetailsImpl;
import com.project.notes_backend.security.jwt.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;

    private OAuth2User oauth2User;
    private User existingUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        // Set the frontend URL property
        ReflectionTestUtils.setField(oauth2LoginSuccessHandler, "frontendUrl", "http://localhost:3000");

        // Create OAuth2User with Google attributes
        Map<String, Object> attributes = Map.of(
                "email", "test@example.com",
                "name", "Test User",
                "given_name", "Test",
                "sub", "google-id-123"
        );

        oauth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "email"
        );

        // Create existing user
        existingUser = new User();
        existingUser.setUserId(1L);
        existingUser.setUserName("test");
        existingUser.setEmail("test@example.com");
        existingUser.setEnabled(true);
        existingUser.setAccountNonExpired(true);
        existingUser.setAccountNonLocked(true);
        existingUser.setCredentialsNonExpired(true);

        userRole = new Role();
        userRole.setRoleName(AppRole.USER);
        existingUser.setRole(userRole);
    }

    @Test
    void testOnAuthenticationSuccess_ExistingGoogleUser() throws Exception {
        // Arrange
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User, Collections.emptyList(), "google"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/google");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(existingUser));

        when(jwtUtils.generateTokenFromUsername(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtUtils).generateTokenFromUsername(any(UserDetailsImpl.class));

        // Assert - Verify that the authentication was processed successfully
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtUtils).generateTokenFromUsername(any(UserDetailsImpl.class));

        // Verify redirect calls - Spring's DefaultRedirectStrategy calls both methods
        verify(response).encodeRedirectURL(anyString());  // First call to encode URL
        verify(response).sendRedirect(any());  // Second call with encoded result
    }

    @Test
    void testOnAuthenticationSuccess_NewGoogleUser() throws Exception {
        // Arrange
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User, Collections.emptyList(), "google"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/google");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(userRepository.existsByUserName("test")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        when(jwtUtils.generateTokenFromUsername(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("test@example.com");
        verify(roleRepository).findByRoleName(AppRole.USER);
        verify(userRepository).existsByUserName("test");
        verify(userRepository).save(any(User.class));
        verify(jwtUtils).generateTokenFromUsername(any(UserDetailsImpl.class));

        // Verify redirect calls
        verify(response).encodeRedirectURL(anyString());
        verify(response).sendRedirect(any());
    }

    @Test
    void testOnAuthenticationSuccess_GitHubUser() throws Exception {
        // Arrange
        Map<String, Object> githubAttributes = Map.of(
                "email", "github@example.com",
                "login", "githubuser",
                "name", "GitHub User",
                "id", 123456
        );

        OAuth2User githubUser = new DefaultOAuth2User(
                Collections.emptyList(),
                githubAttributes,
                "login"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                githubUser, Collections.emptyList(), "github"
        );

        User githubUserEntity = new User();
        githubUserEntity.setUserName("githubuser");
        githubUserEntity.setEmail("github@example.com");
        githubUserEntity.setEnabled(true);
        githubUserEntity.setAccountNonExpired(true);
        githubUserEntity.setAccountNonLocked(true);
        githubUserEntity.setCredentialsNonExpired(true);
        githubUserEntity.setRole(userRole);

        when(request.getRequestURI()).thenReturn("/oauth2/callback/github");
        when(userRepository.findByEmail("github@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(userRepository.existsByUserName("githubuser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(githubUserEntity);
        when(jwtUtils.generateTokenFromUsername(any(UserDetailsImpl.class))).thenReturn("github-jwt-token");

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("github@example.com");
        verify(roleRepository).findByRoleName(AppRole.USER);
        verify(userRepository).existsByUserName("githubuser");
        verify(userRepository).save(any(User.class));
        verify(jwtUtils).generateTokenFromUsername(any(UserDetailsImpl.class));

        // Verify redirect calls
        verify(response).encodeRedirectURL(anyString());
        verify(response).sendRedirect(any());
    }

    @Test
    void testOnAuthenticationSuccess_UsernameConflict() throws Exception {
        // Arrange
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User, Collections.emptyList(), "google"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/google");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(userRepository.existsByUserName("test")).thenReturn(true);
        when(userRepository.existsByUserName("test1")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtils.generateTokenFromUsername(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("test@example.com");
        verify(userRepository).existsByUserName("test");
        verify(userRepository).existsByUserName("test1");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testOnAuthenticationSuccess_ExceptionHandling() throws Exception {
        // Arrange
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User, Collections.emptyList(), "google"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/google");
        when(userRepository.findByEmail("test@example.com")).thenThrow(new RuntimeException("Database error"));

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("test@example.com");

        // Verify redirect calls with error parameters
        verify(response).encodeRedirectURL(anyString());
        verify(response).sendRedirect(any());
    }

    @Test
    void testOnAuthenticationSuccess_MissingUserRole() throws Exception {
        // Arrange
        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                oauth2User, Collections.emptyList(), "google"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/google");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.empty());

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("test@example.com");
        verify(roleRepository).findByRoleName(AppRole.USER);

        // Verify redirect calls with error parameters  
        verify(response).encodeRedirectURL(anyString());
        verify(response).sendRedirect(any());
    }

    @Test
    void testExtractEmailFromGithubUser_NoPublicEmail() throws Exception {
        // Arrange
        Map<String, Object> githubAttributes = Map.of(
                "login", "testuser",
                "name", "Test User",
                "id", 123456
        // No email provided
        );

        OAuth2User githubUser = new DefaultOAuth2User(
                Collections.emptyList(),
                githubAttributes,
                "login"
        );

        OAuth2AuthenticationToken authToken = new OAuth2AuthenticationToken(
                githubUser, Collections.emptyList(), "github"
        );

        when(request.getRequestURI()).thenReturn("/oauth2/callback/github");
        when(userRepository.findByEmail("testuser@github.com")).thenReturn(Optional.empty());
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(userRepository.existsByUserName("testuser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtils.generateTokenFromUsername(any(UserDetailsImpl.class))).thenReturn("jwt-token");

        // Act
        oauth2LoginSuccessHandler.onAuthenticationSuccess(request, response, authToken);

        // Assert
        verify(userRepository).findByEmail("testuser@github.com");
        verify(userRepository).save(any(User.class));
    }
}
