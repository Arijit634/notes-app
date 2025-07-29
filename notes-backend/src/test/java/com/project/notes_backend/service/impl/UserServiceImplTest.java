package com.project.notes_backend.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.project.notes_backend.dto.UserDTO;
import com.project.notes_backend.model.AppRole;
import com.project.notes_backend.model.PasswordResetToken;
import com.project.notes_backend.model.Role;
import com.project.notes_backend.model.User;
import com.project.notes_backend.repository.PasswordResetTokenRepository;
import com.project.notes_backend.repository.RoleRepository;
import com.project.notes_backend.repository.UserRepository;
import com.project.notes_backend.service.TotpService;
import com.project.notes_backend.util.EmailService;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private TotpService totpService;

    @InjectMocks
    private UserServiceImpl userService;

    private User testUser;
    private Role testRole;
    private PasswordResetToken testResetToken;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "frontendUrl", "http://localhost:3000");

        testRole = new Role();
        testRole.setRoleId(1);
        testRole.setRoleName(AppRole.USER);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setUserName("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setRole(testRole);
        testUser.setAccountNonLocked(true);
        testUser.setAccountNonExpired(true);
        testUser.setCredentialsNonExpired(true);
        testUser.setEnabled(true);
        testUser.setTwoFactorEnabled(false);
        testUser.setTwoFactorSecret("secret123");

        testResetToken = new PasswordResetToken();
        testResetToken.setToken("reset-token-123");
        testResetToken.setExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        testResetToken.setUser(testUser);
        testResetToken.setUsed(false);
    }

    @Test
    void updateUserRole_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roleRepository.findByRoleName(AppRole.ADMIN)).thenReturn(Optional.of(testRole));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateUserRole(1L, "ADMIN");

        verify(userRepository).findById(1L);
        verify(roleRepository).findByRoleName(AppRole.ADMIN);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUserRole_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUserRole(1L, "ROLE_ADMIN"));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(roleRepository, never()).findByRoleName(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUserRole_RoleNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(roleRepository.findByRoleName(AppRole.ADMIN)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateUserRole(1L, "ADMIN"));

        assertEquals("Role not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(roleRepository).findByRoleName(AppRole.ADMIN);
        verify(userRepository, never()).save(any());
    }

    @Test
    void getAllUsers_Success() {
        List<User> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        List<User> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals(testUser, result.get(0));
        verify(userRepository).findAll();
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals(testUser.getUserId(), result.getUserId());
        assertEquals(testUser.getUserName(), result.getUserName());
        assertEquals(testUser.getEmail(), result.getEmail());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getUserById(1L));
        assertNotNull(exception);
        verify(userRepository).findById(1L);
    }

    @Test
    void findByUsername_Success() {
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.of(testUser));

        User result = userService.findByUsername("testuser");

        assertEquals(testUser, result);
        verify(userRepository).findByUserName("testuser");
    }

    @Test
    void findByUsername_UserNotFound() {
        when(userRepository.findByUserName("testuser")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.findByUsername("testuser"));

        assertEquals("User not found with username: testuser", exception.getMessage());
        verify(userRepository).findByUserName("testuser");
    }

    @Test
    void updateAccountLockStatus_Lock() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateAccountLockStatus(1L, true);

        assertFalse(testUser.isAccountNonLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateAccountLockStatus_Unlock() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateAccountLockStatus(1L, false);

        assertTrue(testUser.isAccountNonLocked());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateAccountLockStatus_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateAccountLockStatus(1L, true));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }

    @Test
    void getAllRoles_Success() {
        List<Role> roles = Arrays.asList(testRole);
        when(roleRepository.findAll()).thenReturn(roles);

        List<Role> result = userService.getAllRoles();

        assertEquals(1, result.size());
        assertEquals(testRole, result.get(0));
        verify(roleRepository).findAll();
    }

    @Test
    void updateAccountExpiryStatus_Expire() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateAccountExpiryStatus(1L, true);

        assertFalse(testUser.isAccountNonExpired());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateAccountExpiryStatus_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateAccountExpiryStatus(1L, true));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateAccountEnabledStatus_Enable() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateAccountEnabledStatus(1L, true);

        assertTrue(testUser.isEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateAccountEnabledStatus_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateAccountEnabledStatus(1L, true));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateCredentialsExpiryStatus_Expire() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updateCredentialsExpiryStatus(1L, true);

        assertFalse(testUser.isCredentialsNonExpired());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void updateCredentialsExpiryStatus_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updateCredentialsExpiryStatus(1L, true));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }

    @Test
    void updatePassword_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newpassword")).thenReturn("encodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.updatePassword(1L, "newpassword");

        verify(userRepository).findById(1L);
        verify(passwordEncoder).encode("newpassword");
        verify(userRepository).save(testUser);
    }

    @Test
    void updatePassword_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.updatePassword(1L, "newpassword"));

        assertEquals("Failed to update password", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void generatePasswordResetToken_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenReturn(testResetToken);

        userService.generatePasswordResetToken("test@example.com");

        verify(userRepository).findByEmail("test@example.com");
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
    }

    @Test
    void generatePasswordResetToken_UserNotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.generatePasswordResetToken("test@example.com"));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByEmail("test@example.com");
        verify(passwordResetTokenRepository, never()).save(any());
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
    }

    @Test
    void resetPassword_Success() {
        when(passwordResetTokenRepository.findByToken("reset-token-123")).thenReturn(Optional.of(testResetToken));
        when(passwordEncoder.encode("newpassword")).thenReturn("encodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenReturn(testResetToken);

        userService.resetPassword("reset-token-123", "newpassword");

        verify(passwordResetTokenRepository).findByToken("reset-token-123");
        verify(passwordEncoder).encode("newpassword");
        verify(userRepository).save(testUser);
        verify(passwordResetTokenRepository).save(testResetToken);
        assertTrue(testResetToken.isUsed());
    }

    @Test
    void resetPassword_InvalidToken() {
        when(passwordResetTokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.resetPassword("invalid-token", "newpassword"));

        assertEquals("Invalid password reset token", exception.getMessage());
        verify(passwordResetTokenRepository).findByToken("invalid-token");
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_TokenAlreadyUsed() {
        testResetToken.setUsed(true);
        when(passwordResetTokenRepository.findByToken("reset-token-123")).thenReturn(Optional.of(testResetToken));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.resetPassword("reset-token-123", "newpassword"));

        assertEquals("Password reset token has already been used", exception.getMessage());
        verify(passwordResetTokenRepository).findByToken("reset-token-123");
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_TokenExpired() {
        testResetToken.setExpiryDate(Instant.now().minus(1, ChronoUnit.HOURS));
        when(passwordResetTokenRepository.findByToken("reset-token-123")).thenReturn(Optional.of(testResetToken));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.resetPassword("reset-token-123", "newpassword"));

        assertEquals("Password reset token has expired", exception.getMessage());
        verify(passwordResetTokenRepository).findByToken("reset-token-123");
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void findByEmail_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void findByEmail_NotFound() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.findByEmail("test@example.com");

        assertFalse(result.isPresent());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void registerUser_WithPassword() {
        when(passwordEncoder.encode("password123")).thenReturn("encodedpassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.registerUser(testUser);

        assertEquals(testUser, result);
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(testUser);
    }

    @Test
    void registerUser_WithoutPassword() {
        testUser.setPassword(null);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.registerUser(testUser);

        assertEquals(testUser, result);
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository).save(testUser);
    }

    @Test
    void generate2FASecret_Success() {
        GoogleAuthenticatorKey key = new GoogleAuthenticatorKey.Builder("secret123").build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(totpService.generateSecret()).thenReturn(key);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        GoogleAuthenticatorKey result = userService.generate2FASecret(1L);

        assertEquals(key, result);
        verify(userRepository).findById(1L);
        verify(totpService).generateSecret();
        verify(userRepository).save(testUser);
    }

    @Test
    void generate2FASecret_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.generate2FASecret(1L));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(totpService, never()).generateSecret();
        verify(userRepository, never()).save(any());
    }

    @Test
    void validate2FACode_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("secret123", 123456)).thenReturn(true);

        boolean result = userService.validate2FACode(1L, 123456);

        assertTrue(result);
        verify(userRepository).findById(1L);
        verify(totpService).verifyCode("secret123", 123456);
    }

    @Test
    void validate2FACode_InvalidCode() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(totpService.verifyCode("secret123", 123456)).thenReturn(false);

        boolean result = userService.validate2FACode(1L, 123456);

        assertFalse(result);
        verify(userRepository).findById(1L);
        verify(totpService).verifyCode("secret123", 123456);
    }

    @Test
    void validate2FACode_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.validate2FACode(1L, 123456));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(totpService, never()).verifyCode(any(), anyInt());
    }

    @Test
    void enable2FA_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.enable2FA(1L);

        assertTrue(testUser.isTwoFactorEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void enable2FA_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.enable2FA(1L));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }

    @Test
    void disable2FA_Success() {
        testUser.setTwoFactorEnabled(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        userService.disable2FA(1L);

        assertFalse(testUser.isTwoFactorEnabled());
        verify(userRepository).findById(1L);
        verify(userRepository).save(testUser);
    }

    @Test
    void disable2FA_UserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.disable2FA(1L));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(userRepository, never()).save(any());
    }
}
