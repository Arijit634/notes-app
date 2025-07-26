package com.project.notes_backend.controller;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.RoleRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.security.UserDetailsImpl;
import com.project.notes_backend.security.jwt.JwtUtils;
import com.project.notes_backend.security.request.LoginRequest;
import com.project.notes_backend.security.request.SignupRequest;
import com.project.notes_backend.service.TotpService;
import com.project.notes_backend.service.UserService;
import com.project.notes_backend.util.AuthUtil;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;

import jakarta.servlet.http.HttpServletRequest;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserService userService;

    @Mock
    private TotpService totpService;

    @Mock
    private AuthUtil authUtil;

    @InjectMocks
    private AuthController authController;

    private Role userRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        userRole = new Role();
        userRole.setRoleId(1);
        userRole.setRoleName(AppRole.USER);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setRole(userRole);
        testUser.setEnabled(true);
        testUser.setAccountNonExpired(true);
        testUser.setAccountNonLocked(true);
        testUser.setCredentialsNonExpired(true);
    }

    @Test
    void testAuthenticateUser_Success() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

        Collection<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "testuser", "test@example.com", "encodedPassword", false, authorities
        );

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateTokenFromUsername(userDetails)).thenReturn("jwt-token");

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateTokenFromUsername(userDetails);
    }

    @Test
    void testAuthenticateUser_InvalidCredentials() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertEquals(404, response.getStatusCode().value()); // AuthController returns NOT_FOUND for bad credentials
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateTokenFromUsername(any());
    }

    @Test
    void testRegisterUser_Success() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");

        when(userRepository.existsByUserName("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value()); // AuthController returns OK for successful registration
        verify(userRepository).existsByUserName("newuser");
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(roleRepository).findByRoleName(AppRole.USER);
        verify(encoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterUser_UsernameAlreadyExists() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("existinguser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");

        when(userRepository.existsByUserName("existinguser")).thenReturn(true);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(400, response.getStatusCode().value());
        verify(userRepository).existsByUserName("existinguser");
        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_EmailAlreadyExists() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("existing@example.com");
        signupRequest.setPassword("password123");

        when(userRepository.existsByUserName("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(400, response.getStatusCode().value());
        verify(userRepository).existsByUserName("newuser");
        verify(userRepository).existsByEmail("existing@example.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_RoleNotFound() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");

        when(userRepository.existsByUserName("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authController.registerUser(signupRequest);
        });

        verify(userRepository).existsByUserName("newuser");
        verify(userRepository).existsByEmail("newuser@example.com");
        verify(roleRepository).findByRoleName(AppRole.USER);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterUser_WithAdminRole() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("adminuser");
        signupRequest.setEmail("admin@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setRole(Set.of("admin"));

        Role adminRole = new Role();
        adminRole.setRoleId(2);
        adminRole.setRoleName(AppRole.ADMIN);

        when(userRepository.existsByUserName("adminuser")).thenReturn(false);
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.ADMIN)).thenReturn(Optional.of(adminRole));
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value()); // AuthController returns OK for successful registration
        verify(roleRepository).findByRoleName(AppRole.ADMIN);
    }

    @Test
    void testRegisterUser_WithModeratorRole() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("moduser");
        signupRequest.setEmail("mod@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setRole(Set.of("mod"));

        // In AuthController, "mod" role maps to USER role, not MODERATOR
        when(userRepository.existsByUserName("moduser")).thenReturn(false);
        when(userRepository.existsByEmail("mod@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole)); // mod maps to USER
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value()); // AuthController returns OK for successful registration
        verify(roleRepository).findByRoleName(AppRole.USER); // mod should map to USER role
    }

    @Test
    void testRegisterUser_DatabaseError() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("newuser");
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");

        when(userRepository.existsByUserName("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authController.registerUser(signupRequest);
        });

        verify(userRepository).save(any(User.class));
    }

    @Test
    void testAuthenticateUser_UserWithMultipleRoles() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("adminuser");
        loginRequest.setPassword("password");

        Collection<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_USER")
        );
        UserDetailsImpl userDetails = new UserDetailsImpl(
                2L, "adminuser", "admin@example.com", "encodedPassword", false, authorities
        );

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateTokenFromUsername(userDetails)).thenReturn("admin-jwt-token");

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateTokenFromUsername(userDetails);
    }

    @Test
    void testAuthenticateUser_UserWith2FA() {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("2fauser");
        loginRequest.setPassword("password");

        Collection<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UserDetailsImpl userDetails = new UserDetailsImpl(
                3L, "2fauser", "2fa@example.com", "encodedPassword", true, authorities // 2FA enabled
        );

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateTokenFromUsername(userDetails)).thenReturn("2fa-jwt-token");

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils).generateTokenFromUsername(userDetails);
    }

    @Test
    void testRegisterUser_InvalidRole() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("testuser");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setRole(Set.of("invalid"));

        when(userRepository.existsByUserName("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        // Since invalid role defaults to USER role in AuthController
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert - Invalid role should default to USER and succeed
        assertEquals(200, response.getStatusCode().value());
        verify(roleRepository).findByRoleName(AppRole.USER);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterUser_EmptyRoleSet() {
        // Arrange
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setUsername("testuser");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setRole(Set.of()); // Empty role set should default to USER

        when(userRepository.existsByUserName("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByRoleName(AppRole.USER)).thenReturn(Optional.of(userRole));
        when(encoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value()); // AuthController returns OK for successful registration
        verify(roleRepository).findByRoleName(AppRole.USER);
    }

    @Test
    void testGetUserDetails_Success() {
        // Arrange
        Collection<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "testuser", "test@example.com", "encodedPassword", false, authorities
        );

        when(userService.findByUsername("testuser")).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.getUserDetails(userDetails);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(userService).findByUsername("testuser");
    }

    @Test
    void testCurrentUserName_Success() {
        // Arrange
        Collection<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "testuser", "test@example.com", "encodedPassword", false, authorities
        );

        // Act
        String username = authController.currentUserName(userDetails);

        // Assert
        assertEquals("testuser", username);
    }

    @Test
    void testCurrentUserName_NullUserDetails() {
        // Act
        String username = authController.currentUserName(null);

        // Assert
        assertEquals("", username);
    }

    @Test
    void testForgotPassword_Success() {
        // Arrange
        String email = "test@example.com";
        doNothing().when(userService).generatePasswordResetToken(email);

        // Act
        ResponseEntity<?> response = authController.forgotPassword(email);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(userService).generatePasswordResetToken(email);
    }

    @Test
    void testForgotPassword_ServiceException() {
        // Arrange
        String email = "test@example.com";
        doThrow(new RuntimeException("User not found")).when(userService).generatePasswordResetToken(email);

        // Act
        ResponseEntity<?> response = authController.forgotPassword(email);

        // Assert
        assertEquals(500, response.getStatusCode().value()); // AuthController returns 500 for general exceptions
        verify(userService).generatePasswordResetToken(email);
    }

    @Test
    void testResetPassword_Success() {
        // Arrange
        String token = "reset-token";
        String newPassword = "newPassword123";
        doNothing().when(userService).resetPassword(token, newPassword);

        // Act
        ResponseEntity<?> response = authController.resetPassword(token, newPassword);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(userService).resetPassword(token, newPassword);
    }

    @Test
    void testResetPassword_ServiceException() {
        // Arrange
        String token = "invalid-token";
        String newPassword = "newPassword123";
        doThrow(new RuntimeException("Invalid token")).when(userService).resetPassword(token, newPassword);

        // Act
        ResponseEntity<?> response = authController.resetPassword(token, newPassword);

        // Assert
        assertEquals(400, response.getStatusCode().value());
        verify(userService).resetPassword(token, newPassword);
    }

    @Test
    void testEnable2FA_Success() {
        // Arrange
        when(authUtil.loggedInUserId()).thenReturn(1L);
        GoogleAuthenticatorKey key = new GoogleAuthenticatorKey.Builder("secret123").build();
        when(userService.generate2FASecret(1L)).thenReturn(key);
        when(userService.getUserById(1L)).thenReturn(new com.project.notes_backend.dto.UserDTO(
                1L, "testuser", "test@example.com", true, true, true, true,
                null, null, "secret123", false, "LOCAL", userRole, null, null
        ));
        when(totpService.getQrCodeUrl(any(GoogleAuthenticatorKey.class), anyString())).thenReturn("qr-code-url");

        // Act
        ResponseEntity<String> response = authController.enable2FA();

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authUtil).loggedInUserId();
        verify(userService).generate2FASecret(1L);
        verify(userService).getUserById(1L);
        verify(totpService).getQrCodeUrl(any(GoogleAuthenticatorKey.class), anyString());
    }

    @Test
    void testDisable2FA_Success() {
        // Arrange
        when(authUtil.loggedInUserId()).thenReturn(1L);
        doNothing().when(userService).disable2FA(1L);

        // Act
        ResponseEntity<String> response = authController.disable2FA();

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authUtil).loggedInUserId();
        verify(userService).disable2FA(1L);
    }

    @Test
    void testVerify2FA_Success() {
        // Arrange
        int code = 123456;
        when(authUtil.loggedInUserId()).thenReturn(1L);
        when(userService.validate2FACode(1L, code)).thenReturn(true);
        doNothing().when(userService).enable2FA(1L);

        // Act
        ResponseEntity<String> response = authController.verify2FA(code);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authUtil).loggedInUserId();
        verify(userService).validate2FACode(1L, code);
        verify(userService).enable2FA(1L);
    }

    @Test
    void testVerify2FA_InvalidCode() {
        // Arrange
        int code = 123456;
        when(authUtil.loggedInUserId()).thenReturn(1L);
        when(userService.validate2FACode(1L, code)).thenReturn(false);

        // Act
        ResponseEntity<String> response = authController.verify2FA(code);

        // Assert
        assertEquals(401, response.getStatusCode().value()); // AuthController returns 401 for invalid code
        verify(authUtil).loggedInUserId();
        verify(userService).validate2FACode(1L, code);
        verify(userService, never()).enable2FA(anyLong());
    }

    @Test
    void testGet2FAStatus_Success() {
        // Arrange
        when(authUtil.loggedInUser()).thenReturn(testUser);

        // Act
        ResponseEntity<?> response = authController.get2FAStatus();

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(authUtil).loggedInUser();
    }

    @Test
    void testGet2FAStatus_UserNotFound() {
        // Arrange
        when(authUtil.loggedInUser()).thenReturn(null);

        // Act
        ResponseEntity<?> response = authController.get2FAStatus();

        // Assert
        assertEquals(404, response.getStatusCode().value());
        verify(authUtil).loggedInUser();
    }

    @Test
    void testVerify2FALogin_Success() {
        // Arrange
        int code = 123456;
        String jwtToken = "jwt-token";
        String username = "testuser";

        when(jwtUtils.getUserNameFromJwtToken(jwtToken)).thenReturn(username);
        when(userService.findByUsername(username)).thenReturn(testUser);
        when(userService.validate2FACode(testUser.getUserId(), code)).thenReturn(true);

        // Act
        ResponseEntity<String> response = authController.verify2FALogin(code, jwtToken);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(jwtUtils).getUserNameFromJwtToken(jwtToken);
        verify(userService).findByUsername(username);
        verify(userService).validate2FACode(testUser.getUserId(), code);
    }

    @Test
    void testVerify2FALogin_InvalidCode() {
        // Arrange
        int code = 123456;
        String jwtToken = "jwt-token";
        String username = "testuser";

        when(jwtUtils.getUserNameFromJwtToken(jwtToken)).thenReturn(username);
        when(userService.findByUsername(username)).thenReturn(testUser);
        when(userService.validate2FACode(testUser.getUserId(), code)).thenReturn(false);

        // Act
        ResponseEntity<String> response = authController.verify2FALogin(code, jwtToken);

        // Assert
        assertEquals(401, response.getStatusCode().value());
        verify(jwtUtils).getUserNameFromJwtToken(jwtToken);
        verify(userService).findByUsername(username);
        verify(userService).validate2FACode(testUser.getUserId(), code);
    }

    @Test
    void testOauth2Success_Success() {
        // Arrange
        Collection<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L, "testuser", "test@example.com", "encodedPassword", false, authorities
        );

        when(jwtUtils.generateTokenFromUsername(userDetails)).thenReturn("oauth2-jwt-token");

        // Act
        ResponseEntity<?> response = authController.oauth2Success(userDetails);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        verify(jwtUtils).generateTokenFromUsername(userDetails);
    }

    @Test
    void testOauth2Success_Unauthenticated() {
        // Act
        ResponseEntity<?> response = authController.oauth2Success(null);

        // Assert
        assertEquals(401, response.getStatusCode().value());
    }

    @Test
    void testLoginPage_WithError() {
        // Arrange
        String error = "true";
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        when(mockRequest.getScheme()).thenReturn("http");
        when(mockRequest.getServerName()).thenReturn("localhost");
        when(mockRequest.getServerPort()).thenReturn(8080);

        // Act
        ResponseEntity<?> response = authController.loginPage(error, mockRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testLoginPage_NoError() {
        // Arrange
        String error = null;
        HttpServletRequest mockRequest = Mockito.mock(HttpServletRequest.class);
        when(mockRequest.getScheme()).thenReturn("http");
        when(mockRequest.getServerName()).thenReturn("localhost");
        when(mockRequest.getServerPort()).thenReturn(8080);

        // Act
        ResponseEntity<?> response = authController.loginPage(error, mockRequest);

        // Assert
        assertEquals(200, response.getStatusCode().value());
    }

    @Test
    void testPublicTest_Success() {
        // Act
        ResponseEntity<?> response = authController.publicTest();

        // Assert
        assertEquals(200, response.getStatusCode().value());
    }
}
